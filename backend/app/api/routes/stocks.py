import asyncio
import pandas as pd
from fastapi import APIRouter, HTTPException, Query

from app.services.stock_service import search_stocks, get_stock_overview, generate_candles, get_db_candles, get_db_indicators, sync_stock_to_db
from app.services.indicator_service import compute_indicators
from app.services.volume_profile_service import compute_volume_profile
from app.services.breakout_service import analyze_breakout
from app.services.signal_service import compute_signal_for_df
from app.services.ai_service import _fallback_analysis as quick_analysis
from app.schemas.stock import StockSearchResult, StockOverview, CandlestickData, StockAnalysisResponse

router = APIRouter(prefix="/stocks", tags=["stocks"])


@router.get("/search", response_model=list[StockSearchResult])
async def stocks_search(q: str = Query(..., min_length=1)) -> list[StockSearchResult]:
    return await search_stocks(q)


@router.get("/{symbol}/overview", response_model=StockOverview)
async def stock_overview(symbol: str) -> StockOverview:
    stock = await get_stock_overview(symbol.upper())
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    return stock


@router.get("/{symbol}/candles", response_model=list[CandlestickData])
async def stock_candles(symbol: str, timeframe: str = "1d", limit: int = 120) -> list[CandlestickData]:
    sym = symbol.upper()
    db_candles = get_db_candles(sym, days=limit)
    if db_candles is not None:
        return db_candles
    return await generate_candles(sym, days=limit)


@router.get("/{symbol}/analysis", response_model=StockAnalysisResponse)
async def stock_analysis(symbol: str, timeframe: str = "1d") -> StockAnalysisResponse:
    sym = symbol.upper()
    stock = await get_stock_overview(sym)
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")

    # Sync to DB in background so searched stocks are persisted
    asyncio.create_task(sync_stock_to_db(sym))

    # Adjust days based on timeframe to ensure enough candles
    timeframe_days = {
        '1m': 7, '5m': 7, '15m': 14, '30m': 14, '60m': 30, '1h': 30,
        '1d': 180, '1w': 520, '1M': 1800, '3M': 3600, '6M': 3600, '1Y': 7200,
    }.get(timeframe, 180)

    # Only use DB cache for daily timeframe; other timeframes must fetch fresh data
    if timeframe == "1d":
        db_candles = get_db_candles(sym, days=timeframe_days)
    else:
        db_candles = None
    if db_candles is not None:
        candles = db_candles
    else:
        candles = await generate_candles(sym, timeframe=timeframe, days=timeframe_days)

    df = pd.DataFrame([c.model_dump() for c in candles])
    df = df.rename(columns={"open": "open", "high": "high", "low": "low", "close": "close", "volume": "volume"})

    db_indicators = get_db_indicators(sym)
    if db_indicators is not None:
        indicators = db_indicators
    else:
        indicators = compute_indicators(df)
    vp = compute_volume_profile(df)
    vp.symbol = sym
    vp.timeframe = timeframe

    breakout = await analyze_breakout(sym, timeframe, pre_fetched_df=df)

    signal = await compute_signal_for_df(df)

    # Use quick indicator-based analysis instead of slow Ollama call for the main page load
    ai = await quick_analysis(sym, df)

    return StockAnalysisResponse(
        stock=stock,
        indicators=indicators,
        volumeProfile=vp.profile,
        chipDistribution=vp.chipDistribution,
        breakoutAnalysis=breakout.analysis,
        signalData=signal,
        aiAnalysis=ai,
        candlestickData=candles,
    )
