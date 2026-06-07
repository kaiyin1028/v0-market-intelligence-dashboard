from datetime import datetime

from sqlalchemy import String, DateTime, Float, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TechnicalIndicator(Base):
    __tablename__ = "technical_indicators"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    asset_id: Mapped[str] = mapped_column(String(36), ForeignKey("assets.id"), index=True, nullable=False)
    timeframe: Mapped[str] = mapped_column(String(10), nullable=False, default="1d")
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    ma20: Mapped[float | None] = mapped_column(Float, nullable=True)
    ma60: Mapped[float | None] = mapped_column(Float, nullable=True)
    ma200: Mapped[float | None] = mapped_column(Float, nullable=True)
    ema20: Mapped[float | None] = mapped_column(Float, nullable=True)
    rsi14: Mapped[float | None] = mapped_column(Float, nullable=True)
    macd_line: Mapped[float | None] = mapped_column(Float, nullable=True)
    macd_signal: Mapped[float | None] = mapped_column(Float, nullable=True)
    macd_histogram: Mapped[float | None] = mapped_column(Float, nullable=True)
    adx: Mapped[float | None] = mapped_column(Float, nullable=True)
    atr: Mapped[float | None] = mapped_column(Float, nullable=True)
    obv: Mapped[float | None] = mapped_column(Float, nullable=True)
    cmf: Mapped[float | None] = mapped_column(Float, nullable=True)
    mfi: Mapped[float | None] = mapped_column(Float, nullable=True)
    bollinger_upper: Mapped[float | None] = mapped_column(Float, nullable=True)
    bollinger_middle: Mapped[float | None] = mapped_column(Float, nullable=True)
    bollinger_lower: Mapped[float | None] = mapped_column(Float, nullable=True)
    vwap: Mapped[float | None] = mapped_column(Float, nullable=True)
    anchored_vwap: Mapped[float | None] = mapped_column(Float, nullable=True)
