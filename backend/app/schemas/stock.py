from pydantic import BaseModel
from typing import Literal

from app.schemas.indicator import TechnicalIndicators
from app.schemas.volume_profile import VolumeProfileItem, ChipDistribution
from app.schemas.breakout import BreakoutAnalysis
from app.schemas.signal import SignalData
from app.schemas.ai import AIAnalysisResponse


class StockOverview(BaseModel):
    ticker: str
    name: str
    price: float
    change: float
    changePercent: float
    volume: int
    marketCap: float
    sector: str


class CandlestickData(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class StockSearchResult(BaseModel):
    ticker: str
    name: str
    sector: str
    exchange: str


class StockAnalysisResponse(BaseModel):
    stock: StockOverview
    indicators: TechnicalIndicators
    volumeProfile: list[VolumeProfileItem]
    chipDistribution: ChipDistribution
    breakoutAnalysis: BreakoutAnalysis
    signalData: SignalData
    aiAnalysis: AIAnalysisResponse
    candlestickData: list[CandlestickData]
