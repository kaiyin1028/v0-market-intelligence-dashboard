#!/usr/bin/env python3
"""
Seed script for mock market data.

Generates 2 years of realistic daily OHLCV candles and technical indicators
for the required assets and stores them in PostgreSQL.

Usage:
    cd backend
    python scripts/seed_mock_data.py
"""

import random
import uuid
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine
from app.core.config import settings
from app.models.asset import Asset
from app.models.candle import Candle
from app.models.indicator import TechnicalIndicator


ASSETS = [
    {"symbol": "AAPL", "name": "Apple Inc.", "sector": "Technology", "base_price": 180.0, "volatility": 2.5},
    {"symbol": "MSFT", "name": "Microsoft Corp.", "sector": "Technology", "base_price": 400.0, "volatility": 3.0},
    {"symbol": "NVDA", "name": "NVIDIA Corp.", "sector": "Technology", "base_price": 800.0, "volatility": 5.0},
    {"symbol": "TSLA", "name": "Tesla Inc.", "sector": "Consumer Discretionary", "base_price": 180.0, "volatility": 6.0},
    {"symbol": "AMD", "name": "Advanced Micro Devices", "sector": "Technology", "base_price": 170.0, "volatility": 4.0},
    {"symbol": "SPY", "name": "SPDR S&P 500 ETF Trust", "sector": "ETF", "base_price": 450.0, "volatility": 1.5},
    {"symbol": "QQQ", "name": "Invesco QQQ Trust", "sector": "ETF", "base_price": 380.0, "volatility": 2.0},
]

DAYS = 730  # ~2 years


def generate_candles(symbol: str, base_price: float, volatility: float, days: int = DAYS) -> pd.DataFrame:
    """Generate realistic synthetic OHLCV candles as a DataFrame."""
    rng = np.random.default_rng(seed=abs(hash(symbol)) % 2**32)

    dates = [(datetime.utcnow() - timedelta(days=i)).date() for i in range(days, 0, -1)]
    prices = []
    price = float(base_price)

    for _ in range(days):
        daily_vol = volatility * rng.uniform(0.6, 1.4)
        trend = rng.normal(0.0005, 0.015)  # slight upward drift
        open_p = price
        close = price * (1 + trend)
        high = max(open_p, close) + daily_vol * rng.uniform(0.1, 0.5)
        low = min(open_p, close) - daily_vol * rng.uniform(0.1, 0.5)
        volume = int(rng.integers(15_000_000, 80_000_000))

        prices.append({
            "date": dates[_],
            "open": round(open_p, 2),
            "high": round(high, 2),
            "low": round(low, 2),
            "close": round(close, 2),
            "volume": volume,
        })
        price = close

    return pd.DataFrame(prices)


def compute_indicators(df: pd.DataFrame) -> dict:
    """Compute technical indicators from a candle DataFrame."""
    close = df["close"]
    high = df["high"]
    low = df["low"]
    volume = df["volume"]

    # Moving Averages
    ma20 = close.rolling(window=20).mean().iloc[-1]
    ma60 = close.rolling(window=60).mean().iloc[-1]
    ma200 = close.rolling(window=min(120, len(close))).mean().iloc[-1]
    ema20 = close.ewm(span=20, adjust=False).mean().iloc[-1]

    # RSI 14
    delta = close.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)
    avg_gain = gain.rolling(window=14).mean().iloc[-1]
    avg_loss = loss.rolling(window=14).mean().iloc[-1]
    if avg_loss == 0 or pd.isna(avg_loss):
        rsi = 100.0
    else:
        rs = avg_gain / avg_loss
        rsi = 100.0 - (100.0 / (1.0 + rs))

    # MACD
    ema12 = close.ewm(span=12, adjust=False).mean()
    ema26 = close.ewm(span=26, adjust=False).mean()
    macd_line = ema12 - ema26
    macd_signal = macd_line.ewm(span=9, adjust=False).mean()
    macd_histogram = macd_line - macd_signal

    # ATR 14
    prev_close = close.shift(1)
    tr1 = high - low
    tr2 = (high - prev_close).abs()
    tr3 = (low - prev_close).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.rolling(window=14).mean().iloc[-1]

    # OBV
    obv = (volume * np.sign(close.diff())).cumsum().iloc[-1]

    # CMF 20
    mfv = ((close - low) - (high - close)) / (high - low).replace(0, np.nan) * volume
    cmf = mfv.rolling(window=20).sum().iloc[-1] / volume.rolling(window=20).sum().iloc[-1]

    # MFI 14
    typical = (high + low + close) / 3.0
    raw_mf = typical * volume
    diff_typical = typical.diff()
    pos_mf = raw_mf.where(diff_typical > 0, 0.0).rolling(window=14).sum().iloc[-1]
    neg_mf = raw_mf.where(diff_typical < 0, 0.0).rolling(window=14).sum().iloc[-1]
    if neg_mf == 0 or pd.isna(neg_mf):
        mfi = 100.0
    else:
        mfr = pos_mf / neg_mf
        mfi = 100.0 - (100.0 / (1.0 + mfr))

    # Bollinger Bands
    bb_middle = close.rolling(window=20).mean().iloc[-1]
    bb_std = close.rolling(window=20).std().iloc[-1]
    bb_upper = bb_middle + 2 * bb_std
    bb_lower = bb_middle - 2 * bb_std

    # VWAP
    typical_price = (high + low + close) / 3.0
    vwap = (typical_price * volume).cumsum().iloc[-1] / volume.cumsum().iloc[-1]

    return {
        "ma20": float(ma20) if not pd.isna(ma20) else None,
        "ma60": float(ma60) if not pd.isna(ma60) else None,
        "ma200": float(ma200) if not pd.isna(ma200) else None,
        "ema20": float(ema20) if not pd.isna(ema20) else None,
        "rsi14": float(rsi) if not pd.isna(rsi) else None,
        "macd_line": float(macd_line.iloc[-1]) if not pd.isna(macd_line.iloc[-1]) else None,
        "macd_signal": float(macd_signal.iloc[-1]) if not pd.isna(macd_signal.iloc[-1]) else None,
        "macd_histogram": float(macd_histogram.iloc[-1]) if not pd.isna(macd_histogram.iloc[-1]) else None,
        "adx": 25.0,
        "atr": float(atr) if not pd.isna(atr) else None,
        "obv": float(obv) if not pd.isna(obv) else None,
        "cmf": float(cmf) if not pd.isna(cmf) else None,
        "mfi": float(mfi) if not pd.isna(mfi) else None,
        "bollinger_upper": float(bb_upper) if not pd.isna(bb_upper) else None,
        "bollinger_middle": float(bb_middle) if not pd.isna(bb_middle) else None,
        "bollinger_lower": float(bb_lower) if not pd.isna(bb_lower) else None,
        "vwap": float(vwap) if not pd.isna(vwap) else None,
        "anchored_vwap": float(vwap) if not pd.isna(vwap) else None,
    }


def seed():
    db: Session = SessionLocal()
    try:
        for asset_info in ASSETS:
            symbol = asset_info["symbol"]

            # Check if asset already exists
            existing = db.query(Asset).filter(Asset.symbol == symbol).first()
            if existing:
                asset = existing
                print(f"Asset {symbol} already exists, using existing record.")
            else:
                asset = Asset(
                    id=str(uuid.uuid4()),
                    symbol=symbol,
                    name=asset_info["name"],
                    asset_type="stock" if symbol not in {"SPY", "QQQ"} else "etf",
                    exchange="NASDAQ" if symbol in {"AAPL", "MSFT", "NVDA", "AMD"} else "NYSE",
                    currency="USD",
                    sector=asset_info["sector"],
                    is_active=True,
                )
                db.add(asset)
                db.commit()
                db.refresh(asset)
                print(f"Created asset {symbol} ({asset_info['name']})")

            # Generate candles
            df = generate_candles(symbol, asset_info["base_price"], asset_info["volatility"])

            # Check if candles already exist for this asset
            candle_count = db.query(Candle).filter(Candle.asset_id == asset.id).count()
            if candle_count > 0:
                print(f"  Skipping candles for {symbol} ({candle_count} already present)")
            else:
                candles = []
                for _, row in df.iterrows():
                    candles.append(
                        Candle(
                            asset_id=asset.id,
                            timeframe="1d",
                            timestamp=datetime.combine(row["date"], datetime.min.time()),
                            open=row["open"],
                            high=row["high"],
                            low=row["low"],
                            close=row["close"],
                            volume=row["volume"],
                        )
                    )
                db.bulk_save_objects(candles)
                db.commit()
                print(f"  Inserted {len(candles)} candles for {symbol}")

            # Compute and store latest indicators
            indicator_count = db.query(TechnicalIndicator).filter(TechnicalIndicator.asset_id == asset.id).count()
            if indicator_count > 0:
                print(f"  Skipping indicators for {symbol} ({indicator_count} already present)")
            else:
                ind = compute_indicators(df)
                indicator = TechnicalIndicator(
                    asset_id=asset.id,
                    timeframe="1d",
                    timestamp=datetime.utcnow(),
                    **ind,
                )
                db.add(indicator)
                db.commit()
                print(f"  Inserted latest indicators for {symbol}")

        print("\nSeeding complete.")
    finally:
        db.close()


if __name__ == "__main__":
    print(f"Connecting to database: {settings.database_url}")
    seed()
