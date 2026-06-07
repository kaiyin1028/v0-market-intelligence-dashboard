from pydantic import BaseModel
from datetime import datetime


class SignalData(BaseModel):
    buyScore: float
    sellScore: float
    entryZone: dict[str, float]
    stopLoss: float
    targets: list[float]
    riskRewardRatio: float


class TradeSignal(BaseModel):
    id: str
    ticker: str
    name: str
    signalType: str
    timeframe: str
    score: float
    entryPrice: float
    stopLoss: float
    target: float
    riskRewardRatio: float
    reason: str
    aiExplanation: str
    createdAt: datetime


class TradeSignalResponse(BaseModel):
    signals: list[TradeSignal]


class GenerateSignalsRequest(BaseModel):
    symbols: list[str] | None = None
    timeframe: str = "1d"
