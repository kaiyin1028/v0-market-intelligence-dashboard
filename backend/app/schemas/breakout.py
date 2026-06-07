from pydantic import BaseModel
from typing import Literal


class BreakoutScanResult(BaseModel):
    id: str
    ticker: str
    name: str
    price: float
    breakoutLevel: float
    volumeRatio: float
    closeStrength: float
    obvConfirmation: bool
    rsiState: Literal["overbought", "oversold", "neutral"]
    macdState: Literal["bullish", "bearish", "neutral"]
    chipPressure: float
    falseBreakoutRisk: float
    signal: str
    sector: str


class BreakoutAnalysis(BaseModel):
    breakoutLevel: float
    trueBreakoutScore: float
    falseBreakoutRisk: float
    volumeRatio: float
    closeStrength: float
    obvConfirmation: bool
    rsiDivergence: bool
    upperChipPressure: float


class BreakoutAnalysisResponse(BaseModel):
    symbol: str
    timeframe: str
    analysis: BreakoutAnalysis
    grade: Literal["A", "B", "C", "D", "F"]
    reasons: list[str]


class BreakoutScannerResponse(BaseModel):
    results: list[BreakoutScanResult]
