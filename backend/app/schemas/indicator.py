from pydantic import BaseModel


class MACD(BaseModel):
    value: float
    signal: float
    histogram: float


class BollingerBands(BaseModel):
    upper: float
    middle: float
    lower: float


class MovingAverages(BaseModel):
    ma20: float
    ma60: float
    ma200: float


class TechnicalIndicators(BaseModel):
    rsi: float
    macd: MACD
    adx: float
    atr: float
    obv: float
    cmf: float
    bollingerBands: BollingerBands
    movingAverages: MovingAverages
    vwap: float


class IndicatorsResponse(BaseModel):
    symbol: str
    timeframe: str
    indicators: TechnicalIndicators
