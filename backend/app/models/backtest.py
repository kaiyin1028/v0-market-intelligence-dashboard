from datetime import datetime

from sqlalchemy import String, DateTime, Float, Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class BacktestRun(Base):
    __tablename__ = "backtest_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    strategy: Mapped[str] = mapped_column(String(50), nullable=False)
    tickers: Mapped[list] = mapped_column(JSON, nullable=False)
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    initial_capital: Mapped[float] = mapped_column(Float, nullable=False)
    parameters: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    total_return: Mapped[float | None] = mapped_column(Float, nullable=True)
    annualized_return: Mapped[float | None] = mapped_column(Float, nullable=True)
    max_drawdown: Mapped[float | None] = mapped_column(Float, nullable=True)
    win_rate: Mapped[float | None] = mapped_column(Float, nullable=True)
    profit_factor: Mapped[float | None] = mapped_column(Float, nullable=True)
    sharpe_ratio: Mapped[float | None] = mapped_column(Float, nullable=True)
    sortino_ratio: Mapped[float | None] = mapped_column(Float, nullable=True)
    calmar_ratio: Mapped[float | None] = mapped_column(Float, nullable=True)
    number_of_trades: Mapped[int | None] = mapped_column(Integer, nullable=True)
    avg_holding_period: Mapped[float | None] = mapped_column(Float, nullable=True)
    equity_curve: Mapped[list | None] = mapped_column(JSON, nullable=True)
    drawdown_curve: Mapped[list | None] = mapped_column(JSON, nullable=True)
    monthly_returns: Mapped[list | None] = mapped_column(JSON, nullable=True)
    trade_distribution: Mapped[list | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class BacktestTrade(Base):
    __tablename__ = "backtest_trades"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    backtest_id: Mapped[str] = mapped_column(String(36), ForeignKey("backtest_runs.id"), index=True, nullable=False)
    entry_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    exit_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    direction: Mapped[str] = mapped_column(String(10), nullable=False)
    entry_price: Mapped[float] = mapped_column(Float, nullable=False)
    exit_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    pnl: Mapped[float | None] = mapped_column(Float, nullable=True)
    pnl_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    exit_reason: Mapped[str | None] = mapped_column(String(50), nullable=True)
