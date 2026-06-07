"""Standalone job to scan breakouts.

Usage:
    python -m app.jobs.scan_breakouts
"""

from app.services.breakout_service import scan_breakouts


def main() -> None:
    results = scan_breakouts()
    print(f"Found {len(results)} breakout candidates")
    for r in results:
        print(r.ticker, r.signal, r.falseBreakoutRisk)


if __name__ == "__main__":
    main()
