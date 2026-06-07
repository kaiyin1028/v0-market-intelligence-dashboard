"""Standalone job to compute indicators.

Usage:
    python -m app.jobs.compute_indicators
"""

import asyncio
import pandas as pd

from app.data.ingestion import ingest_ohlcv
from app.services.indicator_service import compute_indicators


async def main() -> None:
    data = await ingest_ohlcv("AAPL", limit=120)
    df = pd.DataFrame(data)
    indicators = compute_indicators(df)
    print(indicators.model_dump_json(indent=2))


if __name__ == "__main__":
    asyncio.run(main())
