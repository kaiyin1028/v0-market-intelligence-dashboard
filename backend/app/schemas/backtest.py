from pydantic import BaseModel
from datetime import date
from typing import Literal


class BacktestRequest(BaseModel):
    strategy: Literal[
        "breakout",
        "moving_average",
        "rsi_reversal",
        "macd_trend",
        "vwap_pullback",
        "volume_profile_breakout",
        "multi_factor_composite",
    ]
    tickers: list[str]
    startDate: date
    endDate: date
    initialCapital: float
    parameters: dict[str, float] | None = None


class EquityPoint(BaseModel):
    date: str
    value: float


class MonthlyReturn(BaseModel):
    month: str
    return_pct: float


class TradeDistribution(BaseModel):
    range: str
    count: int


class BacktestResult(BaseModel):
    id: str
    totalReturn: float
    annualizedReturn: float
    maxDrawdown: float
    winRate: float
    profitFactor: float
    sharpeRatio: float
    sortinoRatio: float
    calmarRatio: float
    numberOfTrades: int
    avgHoldingPeriod: float
    equityCurve: list[EquityPoint]
    drawdownCurve: list[EquityPoint]
    monthlyReturns: list[MonthlyReturn]
    tradeDistribution: list[TradeDistribution]


class BacktestTrade(BaseModel):
    id: str
    entry_date: str
    exit_date: str | None
    symbol: str
    direction: Literal["long", "short"]
    entry_price: float
    exit_price: float | None
    quantity: int
    pnl: float | None
    pnl_pct: float | None
    exit_reason: str | None
