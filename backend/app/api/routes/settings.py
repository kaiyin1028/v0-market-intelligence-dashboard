from fastapi import APIRouter

from app.services.signal_service import get_signals
from app.services.risk_service import get_portfolio_risk

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/watchlist")
async def get_watchlist() -> list[dict]:
    signals = get_signals()
    return [
        {
            "id": s.id,
            "ticker": s.ticker,
            "name": s.name,
            "price": s.entryPrice,
            "change": 2.45,
            "changePercent": 1.31,
            "signalBadge": s.signalType,
            "breakoutRisk": 32,
            "volumeAnomaly": False,
            "sector": "Technology",
            "addedAt": s.createdAt.isoformat(),
        }
        for s in signals[:5]
    ]


@router.post("/watchlist")
async def add_watchlist_item(ticker: str) -> dict:
    return {"ticker": ticker, "added": True}


@router.delete("/watchlist/{ticker}")
async def remove_watchlist_item(ticker: str) -> dict:
    return {"ticker": ticker, "removed": True}


@router.get("/portfolio-risk")
async def portfolio_risk() -> dict:
    return get_portfolio_risk()
