from pydantic import BaseModel
from typing import Literal


class KeyLevels(BaseModel):
    support: list[float]
    resistance: list[float]
    stopLoss: float | None
    target: list[float]


class AIAnalysisResponse(BaseModel):
    summary: str
    trendView: Literal["bullish", "neutral", "bearish"]
    breakoutQuality: Literal["high", "medium", "low"]
    bullishReasons: list[str]
    bearishRisks: list[str]
    riskFactors: list[str]
    keyLevels: KeyLevels
    confidence: float


class AIChatRequest(BaseModel):
    message: str
    context: dict | None = None


class AIChatResponse(BaseModel):
    response: str
    analysis: AIAnalysisResponse | None = None
    warning: str | None = None


class AnalyzeStockRequest(BaseModel):
    symbol: str
    timeframe: str = "1d"


class SummarizeMarketRequest(BaseModel):
    focus: str | None = None


class ExplainSignalRequest(BaseModel):
    signalId: str
    symbol: str


class AIStatusResponse(BaseModel):
    status: Literal["online", "offline", "degraded"]
    model: str
    effective_model: str
    available_models: list[str]
    provider: Literal["kimi", "ollama"] = "ollama"
