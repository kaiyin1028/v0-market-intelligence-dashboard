from fastapi import APIRouter, Query

from app.services.signal_service import get_signals, compute_signal
from app.schemas.signal import TradeSignal, SignalData

router = APIRouter(prefix="/signals", tags=["signals"])


@router.get("", response_model=list[TradeSignal])
async def list_signals(signalType: str | None = Query(None)) -> list[TradeSignal]:
    return await get_signals(signalType)


@router.get("/stocks/{symbol}/signals", response_model=SignalData)
async def stock_signals(symbol: str, timeframe: str = Query("1d")) -> SignalData:
    return await compute_signal()


@router.post("/generate")
async def generate_signals(symbols: list[str] | None = None, timeframe: str = "1d") -> list[TradeSignal]:
    return await get_signals()
