import random
from datetime import datetime, timedelta
from typing import Any

from app.data.providers.base import DataProvider


class MockDataProvider(DataProvider):
    async def fetch_ohlcv(self, symbol: str, timeframe: str = "1d", limit: int = 100) -> list[dict[str, Any]]:
        rng = random.Random(abs(hash(symbol)) % 2**32)
        base = {"AAPL": 180, "MSFT": 400, "NVDA": 800, "TSLA": 180, "META": 490, "AMD": 170, "GOOGL": 145}.get(symbol.upper(), 100.0)
        results = []
        price = float(base)
        for i in range(limit, 0, -1):
            date = datetime.utcnow() - timedelta(days=i)
            vol = rng.uniform(1.0, 4.0)
            trend = 1.0 if rng.random() > 0.48 else -1.0
            o = price
            c = price + vol * trend * rng.random()
            h = max(o, c) + rng.uniform(0, vol * 0.5)
            l = min(o, c) - rng.uniform(0, vol * 0.5)
            v = int(rng.uniform(20_000_000, 70_000_000))
            results.append({"date": date.isoformat(), "open": round(o, 2), "high": round(h, 2), "low": round(l, 2), "close": round(c, 2), "volume": v})
            price = c
        return results

    async def search(self, query: str) -> list[dict[str, Any]]:
        stocks = [
            {"ticker": "AAPL", "name": "Apple Inc.", "sector": "Technology", "exchange": "NASDAQ"},
            {"ticker": "MSFT", "name": "Microsoft Corp.", "sector": "Technology", "exchange": "NASDAQ"},
            {"ticker": "NVDA", "name": "NVIDIA Corp.", "sector": "Technology", "exchange": "NASDAQ"},
            {"ticker": "GOOGL", "name": "Alphabet Inc.", "sector": "Communication Services", "exchange": "NASDAQ"},
            {"ticker": "AMZN", "name": "Amazon.com Inc.", "sector": "Consumer Discretionary", "exchange": "NASDAQ"},
            {"ticker": "META", "name": "Meta Platforms Inc.", "sector": "Communication Services", "exchange": "NASDAQ"},
            {"ticker": "TSLA", "name": "Tesla Inc.", "sector": "Consumer Discretionary", "exchange": "NASDAQ"},
            {"ticker": "AMD", "name": "Advanced Micro Devices", "sector": "Technology", "exchange": "NASDAQ"},
            {"ticker": "JPM", "name": "JPMorgan Chase & Co.", "sector": "Financials", "exchange": "NYSE"},
            {"ticker": "XOM", "name": "Exxon Mobil Corp.", "sector": "Energy", "exchange": "NYSE"},
        ]
        q = query.upper()
        return [s for s in stocks if q in s["ticker"] or q in s["name"].upper()]
