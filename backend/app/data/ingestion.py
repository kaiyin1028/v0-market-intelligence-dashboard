"""Data ingestion pipeline placeholder."""

from typing import Any

from app.data.providers.mock import MockDataProvider

provider = MockDataProvider()


async def ingest_ohlcv(symbol: str, timeframe: str = "1d", limit: int = 100) -> list[dict[str, Any]]:
    return await provider.fetch_ohlcv(symbol, timeframe, limit)
