import pandas as pd
from fastapi import APIRouter, HTTPException, Query

from app.services.stock_service import generate_candles
from app.services.indicator_service import compute_indicators
from app.schemas.indicator import IndicatorsResponse, TechnicalIndicators

router = APIRouter(prefix="/indicators", tags=["indicators"])


@router.get("/stocks/{symbol}/indicators", response_model=IndicatorsResponse)
async def get_indicators(symbol: str, timeframe: str = Query("1d")) -> IndicatorsResponse:
    sym = symbol.upper()
    candles = generate_candles(sym, days=120)
    df = pd.DataFrame([c.model_dump() for c in candles])
    indicators = compute_indicators(df)
    return IndicatorsResponse(symbol=sym, timeframe=timeframe, indicators=indicators)


@router.post("/recompute")
async def recompute_indicators(symbol: str = Query(...), timeframe: str = Query("1d")) -> IndicatorsResponse:
    sym = symbol.upper()
    candles = generate_candles(sym, days=120)
    df = pd.DataFrame([c.model_dump() for c in candles])
    indicators = compute_indicators(df)
    return IndicatorsResponse(symbol=sym, timeframe=timeframe, indicators=indicators)
