import pandas as pd
from fastapi import APIRouter, Query

from app.services.stock_service import generate_candles
from app.services.volume_profile_service import compute_volume_profile
from app.schemas.volume_profile import VolumeProfileResponse, ChipDistribution

router = APIRouter(tags=["volume-profile"])


@router.get("/stocks/{symbol}/volume-profile", response_model=VolumeProfileResponse)
async def get_volume_profile(symbol: str, timeframe: str = Query("1d"), lookback: int = Query(120)) -> VolumeProfileResponse:
    sym = symbol.upper()
    candles = generate_candles(sym, days=lookback)
    df = pd.DataFrame([c.model_dump() for c in candles])
    result = compute_volume_profile(df)
    result.symbol = sym
    result.timeframe = timeframe
    return result


@router.get("/stocks/{symbol}/chip-distribution", response_model=ChipDistribution)
async def get_chip_distribution(symbol: str, timeframe: str = Query("1d"), lookback: int = Query(120)) -> ChipDistribution:
    sym = symbol.upper()
    candles = generate_candles(sym, days=lookback)
    df = pd.DataFrame([c.model_dump() for c in candles])
    result = compute_volume_profile(df)
    return result.chipDistribution
