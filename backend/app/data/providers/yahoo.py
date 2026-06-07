import asyncio
import logging
from datetime import datetime
from typing import Any

import yfinance as yf

from app.core.config import settings
from app.data.providers.base import DataProvider

logger = logging.getLogger(__name__)

# Timeframe mapping for yfinance
_TF_MAP = {
    "1m": {"interval": "1m", "period": "5d"},
    "5m": {"interval": "5m", "period": "5d"},
    "15m": {"interval": "15m", "period": "1mo"},
    "30m": {"interval": "30m", "period": "1mo"},
    "60m": {"interval": "60m", "period": "1mo"},
    "1h": {"interval": "60m", "period": "1mo"},
    "1d": {"interval": "1d", "period": "6mo"},
    "1w": {"interval": "1wk", "period": "1y"},
    "1M": {"interval": "1mo", "period": "5y"},
    "3M": {"interval": "3mo", "period": "10y"},
    "6M": {"interval": "1mo", "period": "10y"},
    "1Y": {"interval": "1mo", "period": "max"},
}

# Index proxies for Yahoo Finance
_INDEX_PROXIES = {
    "SPX": "^GSPC",
    "NDX": "^IXIC",
    "DJI": "^DJI",
    "VIX": "^VIX",
}


def _to_yahoo_symbol(symbol: str) -> str:
    """Convert generic symbol to Yahoo Finance format."""
    s = symbol.upper().strip()
    if s in _INDEX_PROXIES:
        return _INDEX_PROXIES[s]
    return s


def _to_yf_params(timeframe: str) -> dict[str, str]:
    """Map generic timeframe to yfinance history params."""
    return _TF_MAP.get(timeframe, {"interval": "1d", "period": "6mo"})


class YahooFinanceProvider(DataProvider):
    """Yahoo Finance data provider.

    Uses the yfinance library to fetch real market data from Yahoo Finance.
    All sync library calls are offloaded to a thread pool.
    Limits concurrency to avoid Yahoo Finance rate limits.
    """

    def __init__(self) -> None:
        self._sem = asyncio.Semaphore(2)
        self._delay = 1.0

    async def fetch_ohlcv(self, symbol: str, timeframe: str = "1d", limit: int = 100) -> list[dict[str, Any]]:
        yf_sym = _to_yahoo_symbol(symbol)
        params = _to_yf_params(timeframe)

        def _fetch() -> list[dict[str, Any]]:
            ticker = yf.Ticker(yf_sym)
            df = ticker.history(period=params["period"], interval=params["interval"], auto_adjust=True)
            if df is None or df.empty:
                return []

            records = []
            for timestamp, row in df.iterrows():
                date_str = timestamp.strftime("%Y-%m-%d") if isinstance(timestamp, datetime) else str(timestamp.date())
                if params["interval"] in ("1m", "5m", "15m", "30m", "60m"):
                    date_str = timestamp.strftime("%Y-%m-%d %H:%M")
                records.append(
                    {
                        "date": date_str,
                        "open": round(float(row.get("Open", 0)), 4),
                        "high": round(float(row.get("High", 0)), 4),
                        "low": round(float(row.get("Low", 0)), 4),
                        "close": round(float(row.get("Close", 0)), 4),
                        "volume": int(row.get("Volume", 0)),
                    }
                )
            return records[-limit:]

        async with self._sem:
            await asyncio.sleep(self._delay)
            return await asyncio.to_thread(_fetch)

    async def fetch_ohlcv_batch(
        self, symbols: list[str], timeframe: str = "1d", limit: int = 100
    ) -> dict[str, list[dict[str, Any]]]:
        """Fetch OHLCV for multiple symbols in a single batch request."""
        if not symbols:
            return {}

        yf_symbols = [_to_yahoo_symbol(s) for s in symbols]
        params = _to_yf_params(timeframe)

        def _fetch() -> dict[str, list[dict[str, Any]]]:
            df = yf.download(
                yf_symbols,
                period=params["period"],
                interval=params["interval"],
                group_by="ticker",
                auto_adjust=True,
                threads=False,
                progress=False,
            )
            if df is None or df.empty:
                return {}

            result: dict[str, list[dict[str, Any]]] = {}
            single_ticker = len(yf_symbols) == 1

            for symbol in yf_symbols:
                if single_ticker:
                    sym_df = df
                else:
                    if symbol not in df.columns.levels[0]:
                        continue
                    sym_df = df[symbol]

                if sym_df.empty:
                    continue

                records = []
                for timestamp, row in sym_df.iterrows():
                    date_str = (
                        timestamp.strftime("%Y-%m-%d")
                        if isinstance(timestamp, datetime)
                        else str(timestamp.date())
                    )
                    if params["interval"] in ("1m", "5m", "15m", "30m", "60m"):
                        date_str = timestamp.strftime("%Y-%m-%d %H:%M")
                    records.append(
                        {
                            "date": date_str,
                            "open": round(float(row.get("Open", 0)), 4),
                            "high": round(float(row.get("High", 0)), 4),
                            "low": round(float(row.get("Low", 0)), 4),
                            "close": round(float(row.get("Close", 0)), 4),
                            "volume": int(row.get("Volume", 0)),
                        }
                    )
                result[symbol] = records[-limit:]
            return result

        return await asyncio.to_thread(_fetch)

    async def search(self, query: str) -> list[dict[str, Any]]:
        q = query.upper().strip()

        def _search() -> list[dict[str, Any]]:
            ticker = yf.Ticker(q)
            try:
                info = ticker.info
                if not info or info.get("regularMarketPrice") is None:
                    return []
                return [
                    {
                        "ticker": q,
                        "name": info.get("shortName") or info.get("longName") or q,
                        "sector": info.get("sector", ""),
                        "exchange": info.get("exchange", "NASDAQ"),
                    }
                ]
            except Exception:
                return []

        async with self._sem:
            await asyncio.sleep(self._delay)
            return await asyncio.to_thread(_search)

    async def get_snapshot(self, symbol: str) -> dict[str, Any] | None:
        yf_sym = _to_yahoo_symbol(symbol)

        def _snapshot() -> dict[str, Any] | None:
            ticker = yf.Ticker(yf_sym)
            try:
                info = ticker.info
                if not info:
                    return None

                price = info.get("regularMarketPrice") or info.get("currentPrice") or info.get("previousClose")
                prev_close = info.get("regularMarketPreviousClose") or info.get("previousClose")
                if price is None:
                    return None

                change = 0.0
                change_percent = 0.0
                if prev_close and prev_close != 0:
                    change = price - prev_close
                    change_percent = (change / prev_close) * 100

                return {
                    "ticker": symbol.upper(),
                    "name": info.get("shortName") or info.get("longName") or symbol.upper(),
                    "price": round(float(price), 2),
                    "change": round(float(change), 2),
                    "changePercent": round(float(change_percent), 2),
                    "volume": int(info.get("regularMarketVolume") or info.get("volume") or 0),
                    "marketCap": info.get("marketCap"),
                    "sector": info.get("sector", ""),
                    "exchange": info.get("exchange", "NASDAQ"),
                }
            except Exception as e:
                logger.debug("Yahoo snapshot failed for %s: %s", yf_sym, e)
                return None

        async with self._sem:
            await asyncio.sleep(self._delay)
            return await asyncio.to_thread(_snapshot)

    async def get_snapshots(self, symbols: list[str]) -> list[dict[str, Any]]:
        results = []
        for sym in symbols:
            snap = await self.get_snapshot(sym)
            if snap:
                results.append(snap)
        return results
