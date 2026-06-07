"""Standalone job to generate AI summaries.

Usage:
    python -m app.jobs.generate_ai_summaries
"""

import asyncio

from app.services.ai_service import summarize_market


async def main() -> None:
    result = await summarize_market()
    print(result.summary)


if __name__ == "__main__":
    asyncio.run(main())
