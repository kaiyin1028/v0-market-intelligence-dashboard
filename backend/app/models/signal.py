from datetime import datetime

from sqlalchemy import String, DateTime, Float, Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class BreakoutSignal(Base):
    __tablename__ = "breakout_signals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    asset_id: Mapped[str] = mapped_column(String(36), ForeignKey("assets.id"), index=True, nullable=False)
    timeframe: Mapped[str] = mapped_column(String(10), nullable=False, default="1d")
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    breakout_level: Mapped[float | None] = mapped_column(Float, nullable=True)
    true_breakout_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    false_breakout_risk: Mapped[float | None] = mapped_column(Float, nullable=True)
    volume_ratio: Mapped[float | None] = mapped_column(Float, nullable=True)
    close_strength: Mapped[float | None] = mapped_column(Float, nullable=True)
    obv_confirmation: Mapped[bool | None] = mapped_column(nullable=True)
    rsi_divergence: Mapped[bool | None] = mapped_column(nullable=True)
    macd_divergence: Mapped[bool | None] = mapped_column(nullable=True)
    upper_chip_pressure: Mapped[float | None] = mapped_column(Float, nullable=True)
    sector_confirmation: Mapped[float | None] = mapped_column(Float, nullable=True)
    market_confirmation: Mapped[float | None] = mapped_column(Float, nullable=True)
    grade: Mapped[str | None] = mapped_column(String(5), nullable=True)
    reasons: Mapped[list | None] = mapped_column(JSON, nullable=True)


class TradeSignal(Base):
    __tablename__ = "trade_signals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    asset_id: Mapped[str] = mapped_column(String(36), ForeignKey("assets.id"), index=True, nullable=False)
    timeframe: Mapped[str] = mapped_column(String(10), nullable=False, default="1d")
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    signal: Mapped[str | None] = mapped_column(String(20), nullable=True)
    buy_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    sell_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    entry_low: Mapped[float | None] = mapped_column(Float, nullable=True)
    entry_high: Mapped[float | None] = mapped_column(Float, nullable=True)
    stop_loss: Mapped[float | None] = mapped_column(Float, nullable=True)
    targets: Mapped[list | None] = mapped_column(JSON, nullable=True)
    risk_reward_ratio: Mapped[float | None] = mapped_column(Float, nullable=True)
    position_size_suggestion: Mapped[float | None] = mapped_column(Float, nullable=True)
    reasons: Mapped[list | None] = mapped_column(JSON, nullable=True)
