from datetime import datetime

from sqlalchemy import String, DateTime, Float, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Candle(Base):
    __tablename__ = "candles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    asset_id: Mapped[str] = mapped_column(String(36), ForeignKey("assets.id"), index=True, nullable=False)
    timeframe: Mapped[str] = mapped_column(String(10), nullable=False, default="1d")
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    open: Mapped[float] = mapped_column(Float, nullable=False)
    high: Mapped[float] = mapped_column(Float, nullable=False)
    low: Mapped[float] = mapped_column(Float, nullable=False)
    close: Mapped[float] = mapped_column(Float, nullable=False)
    volume: Mapped[float] = mapped_column(Float, nullable=False)
    adjusted_close: Mapped[float | None] = mapped_column(Float, nullable=True)
