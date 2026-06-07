from pydantic import BaseModel


class VolumeProfileItem(BaseModel):
    priceLevel: float
    volume: float
    buyVolume: float
    sellVolume: float


class ChipDistribution(BaseModel):
    poc: float
    vah: float
    val: float
    hvn: list[float]
    lvn: list[float]
    chipPressure: float
    upperTrappedChips: float
    lowerSupportDensity: float


class VolumeProfileResponse(BaseModel):
    symbol: str
    timeframe: str
    lookback: int
    profile: list[VolumeProfileItem]
    chipDistribution: ChipDistribution
