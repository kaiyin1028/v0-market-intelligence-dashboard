import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AIAnalysis(Base):
    __tablename__ = "ai_analysis"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    asset_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("assets.id"), nullable=True, index=True)
    analysis_type: Mapped[str] = mapped_column(String(50), nullable=False)
    timeframe: Mapped[str | None] = mapped_column(String(10), nullable=True)
    input_context: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    output: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    model_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
