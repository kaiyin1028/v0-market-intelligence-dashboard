"""Standalone job to fetch market data.

Usage:
    python -m app.jobs.fetch_market_data
"""

import asyncio
from app.data.ingestion import ingest_ohlcv


async def main() -> None:
    data = await ingest_ohlcv("AAPL", limit=60)
    print(f"Fetched {len(data)} candles")


if __name__ == "__main__":
    asyncio.run(main())
