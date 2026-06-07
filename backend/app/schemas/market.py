from pydantic import BaseModel
from typing import Literal


class MarketBreadth(BaseModel):
    advancers: int
    decliners: int
    unchanged: int
    ratio: float


class MarketIndex(BaseModel):
    symbol: str
    name: str
    value: float
    change: float
    changePercent: float
    sparklineData: list[float]
    status: Literal["bullish", "bearish", "neutral"]


class MarketSummary(BaseModel):
    bullishSignals: int
    bearishSignals: int
    falseBreakoutAlerts: int
    marketBreadth: MarketBreadth


class SectorHeatmapItem(BaseModel):
    sector: str
    change: float
    stocks: int


class SignalFeedItem(BaseModel):
    id: str
    ticker: str
    signal: str
    message: str
    time: str


class FalseBreakoutRiskItem(BaseModel):
    ticker: str
    risk: float
    level: str
    reason: str


class MarketOverviewResponse(BaseModel):
    indices: list[MarketIndex]
    summary: MarketSummary
    sectorHeatmap: list[SectorHeatmapItem]
    signalFeed: list[SignalFeedItem]
    falseBreakoutRisks: list[FalseBreakoutRiskItem]
