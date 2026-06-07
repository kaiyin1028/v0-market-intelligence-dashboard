from fastapi import APIRouter

from app.services.market_service import get_market_overview
from app.schemas.market import MarketOverviewResponse

router = APIRouter(prefix="/market", tags=["market"])


@router.get("/overview", response_model=MarketOverviewResponse)
async def market_overview() -> MarketOverviewResponse:
    return await get_market_overview()


@router.get("/breadth")
async def market_breadth() -> dict:
    overview = await get_market_overview()
    return overview.summary.marketBreadth.model_dump()


@router.get("/sectors")
async def market_sectors() -> dict:
    overview = await get_market_overview()
    return {"sectors": [s.model_dump() for s in overview.sectorHeatmap]}


@router.get("/sentiment")
async def market_sentiment() -> dict:
    overview = await get_market_overview()
    return {
        "bullishSignals": overview.summary.bullishSignals,
        "bearishSignals": overview.summary.bearishSignals,
        "falseBreakoutAlerts": overview.summary.falseBreakoutAlerts,
    }
