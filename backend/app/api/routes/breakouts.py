from fastapi import APIRouter, Query

from app.services.breakout_service import scan_breakouts, analyze_breakout
from app.schemas.breakout import BreakoutScannerResponse, BreakoutAnalysisResponse

router = APIRouter(prefix="/breakouts", tags=["breakouts"])


@router.get("/scanner", response_model=list)
async def breakout_scanner(
    sector: str | None = Query(None),
    minVolumeRatio: float | None = Query(None),
    maxFalseBreakoutRisk: float | None = Query(None),
    signalType: str | None = Query(None),
) -> list[dict]:
    results = await scan_breakouts(
        sector=sector,
        min_volume_ratio=minVolumeRatio,
        max_false_breakout_risk=maxFalseBreakoutRisk,
        signal_type=signalType,
    )
    return [r.model_dump() for r in results]


@router.get("/stocks/{symbol}/breakout-analysis", response_model=BreakoutAnalysisResponse)
async def stock_breakout_analysis(symbol: str, timeframe: str = Query("1d")) -> BreakoutAnalysisResponse:
    return await analyze_breakout(symbol=symbol.upper(), timeframe=timeframe)


@router.post("/scan")
async def run_breakout_scan() -> BreakoutScannerResponse:
    results = await scan_breakouts()
    return BreakoutScannerResponse(results=results)
