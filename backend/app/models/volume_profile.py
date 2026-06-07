from datetime import datetime

from sqlalchemy import String, DateTime, Float, Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class VolumeProfile(Base):
    __tablename__ = "volume_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    asset_id: Mapped[str] = mapped_column(String(36), ForeignKey("assets.id"), index=True, nullable=False)
    timeframe: Mapped[str] = mapped_column(String(10), nullable=False, default="1d")
    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    poc: Mapped[float | None] = mapped_column(Float, nullable=True)
    vah: Mapped[float | None] = mapped_column(Float, nullable=True)
    val: Mapped[float | None] = mapped_column(Float, nullable=True)
    chip_concentration_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    upper_trapped_chip_pressure: Mapped[float | None] = mapped_column(Float, nullable=True)
    lower_support_density: Mapped[float | None] = mapped_column(Float, nullable=True)
    distribution: Mapped[dict | None] = mapped_column(JSON, nullable=True)
