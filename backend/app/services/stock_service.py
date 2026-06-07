from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.asset import Asset
from app.models.candle import Candle
from app.models.indicator import TechnicalIndicator
from app.schemas.stock import StockOverview, CandlestickData, StockSearchResult
from app.schemas.indicator import TechnicalIndicators, MACD, BollingerBands, MovingAverages
from app.services import futu_service


async def search_stocks(query: str) -> list[StockSearchResult]:
    q = query.upper().strip()
    # Try exact ticker validation via providers
    results = await futu_service.search_stocks(q)
    if results:
        return [
            StockSearchResult(
                ticker=r["ticker"],
                name=r.get("name", r["ticker"]),
                sector=r.get("sector", ""),
                exchange=r.get("exchange", "NASDAQ"),
            )
            for r in results
        ]
    # If no exact match, try partial search via Yahoo Search
    yahoo = futu_service._get_yahoo_provider()
    if yahoo is not None:
        try:
            import yfinance as yf
            # Fallback: try common ticker variations
            candidates = [q]
            if len(q) <= 4:
                candidates += [q + s for s in ["L", "S", "T", "U", "V", "W", "X"]]
            found = []
            for cand in candidates:
                info = yf.Ticker(cand).info
                if info and info.get("regularMarketPrice"):
                    found.append(
                        StockSearchResult(
                            ticker=cand,
                            name=info.get("shortName") or info.get("longName") or cand,
                            sector=info.get("sector", ""),
                            exchange=info.get("exchange", "NASDAQ"),
                        )
                    )
                    if len(found) >= 5:
                        break
            if found:
                return found
        except Exception:
            pass
    return []


async def get_stock_overview(symbol: str) -> StockOverview | None:
    # Try Futu first
    snapshot = await futu_service.get_snapshot(symbol.upper())
    if snapshot:
        return StockOverview(
            ticker=snapshot["ticker"],
            name=snapshot.get("name") or snapshot["ticker"],
            price=snapshot["price"],
            change=snapshot["change"],
            changePercent=snapshot["changePercent"],
            volume=snapshot["volume"],
            marketCap=snapshot.get("marketCap") or 0.0,
            sector=snapshot.get("sector", ""),
        )
    return None


async def generate_candles(symbol: str, timeframe: str = "1d", days: int = 120) -> list[CandlestickData]:
    # Try Yahoo Finance first for real historical data
    from app.data.providers.yahoo import YahooFinanceProvider
    yahoo = YahooFinanceProvider()
    yahoo_candles = await yahoo.fetch_ohlcv(symbol.upper(), timeframe=timeframe, limit=days)
    if yahoo_candles:
        return [
            CandlestickData(
                date=c["date"],
                open=c["open"],
                high=c["high"],
                low=c["low"],
                close=c["close"],
                volume=c["volume"],
            )
            for c in yahoo_candles
        ]

    # Fallback to Futu
    futu_candles = await futu_service.fetch_ohlcv(symbol.upper(), timeframe=timeframe, limit=days)
    if futu_candles:
        return [
            CandlestickData(
                date=c["date"],
                open=c["open"],
                high=c["high"],
                low=c["low"],
                close=c["close"],
                volume=c["volume"],
            )
            for c in futu_candles
        ]
    return []


def get_db_candles(symbol: str, days: int = 120) -> list[CandlestickData] | None:
    """Fetch candles from the database if available."""
    db: Session = SessionLocal()
    try:
        asset = db.query(Asset).filter(Asset.symbol == symbol.upper()).first()
        if not asset:
            return None
        candles = (
            db.query(Candle)
            .filter(Candle.asset_id == asset.id)
            .order_by(Candle.timestamp.desc())
            .limit(days)
            .all()
        )
        if not candles:
            return None
        return [
            CandlestickData(
                date=c.timestamp.strftime("%Y-%m-%d"),
                open=c.open,
                high=c.high,
                low=c.low,
                close=c.close,
                volume=int(c.volume),
            )
            for c in reversed(candles)
        ]
    finally:
        db.close()


def get_db_indicators(symbol: str) -> TechnicalIndicators | None:
    """Fetch the latest technical indicators from the database if available."""
    db: Session = SessionLocal()
    try:
        asset = db.query(Asset).filter(Asset.symbol == symbol.upper()).first()
        if not asset:
            return None
        ind = (
            db.query(TechnicalIndicator)
            .filter(TechnicalIndicator.asset_id == asset.id)
            .order_by(TechnicalIndicator.timestamp.desc())
            .first()
        )
        if not ind:
            return None
        return TechnicalIndicators(
            rsi=ind.rsi14 or 50.0,
            macd=MACD(
                value=ind.macd_line or 0.0,
                signal=ind.macd_signal or 0.0,
                histogram=ind.macd_histogram or 0.0,
            ),
            adx=ind.adx or 25.0,
            atr=ind.atr or 0.0,
            obv=int(ind.obv) if ind.obv else 0,
            cmf=ind.cmf or 0.0,
            bollingerBands=BollingerBands(
                upper=ind.bollinger_upper or 0.0,
                middle=ind.bollinger_middle or 0.0,
                lower=ind.bollinger_lower or 0.0,
            ),
            movingAverages=MovingAverages(
                ma20=ind.ma20 or 0.0,
                ma60=ind.ma60 or 0.0,
                ma200=ind.ma200 or 0.0,
            ),
            vwap=ind.vwap or 0.0,
        )
    finally:
        db.close()


async def sync_stock_to_db(symbol: str) -> Asset | None:
    """Fetch stock data from providers and persist to database."""
    sym = symbol.upper().strip()
    snapshot = await futu_service.get_snapshot(sym)
    if not snapshot:
        return None

    ohlcv = await futu_service.fetch_ohlcv(sym, timeframe="1d", limit=120)
    if not ohlcv:
        return None

    db: Session = SessionLocal()
    try:
        asset = db.query(Asset).filter(Asset.symbol == sym).first()
        if not asset:
            asset = Asset(
                symbol=sym,
                name=snapshot.get("name") or sym,
                asset_type="stock",
                exchange=snapshot.get("exchange", "NASDAQ"),
                currency="USD",
                sector=snapshot.get("sector", ""),
                is_active=True,
            )
            db.add(asset)
            db.commit()
            db.refresh(asset)
        else:
            # Update metadata
            asset.name = snapshot.get("name") or asset.name or sym
            asset.sector = snapshot.get("sector", asset.sector or "")
            asset.exchange = snapshot.get("exchange", asset.exchange or "NASDAQ")
            db.commit()

        # Upsert candles
        existing = (
            db.query(Candle)
            .filter(Candle.asset_id == asset.id, Candle.timeframe == "1d")
            .all()
        )
        existing_dates = {c.timestamp.strftime("%Y-%m-%d") for c in existing}

        for c in ohlcv:
            ts_str = c["date"][:10] if len(c["date"]) >= 10 else c["date"]
            if ts_str in existing_dates:
                continue
            try:
                ts = datetime.strptime(ts_str, "%Y-%m-%d")
            except ValueError:
                continue
            db.add(
                Candle(
                    asset_id=asset.id,
                    timeframe="1d",
                    timestamp=ts,
                    open=float(c["open"]),
                    high=float(c["high"]),
                    low=float(c["low"]),
                    close=float(c["close"]),
                    volume=float(c["volume"]),
                )
            )
        db.commit()
        return asset
    finally:
        db.close()
