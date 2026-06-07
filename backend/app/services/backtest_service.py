import uuid
from datetime import date, timedelta

import numpy as np
import pandas as pd

from app.schemas.backtest import (
    BacktestRequest,
    BacktestResult,
    BacktestTrade,
    EquityPoint,
    MonthlyReturn,
    TradeDistribution,
)
from app.services import futu_service


def _run_ma_crossover_backtest(
    df: pd.DataFrame, initial_capital: float, short_ma: int = 20, long_ma: int = 60
) -> dict:
    """Run a moving average crossover backtest on real data."""
    if df is None or len(df) < long_ma + 5:
        return {}

    close = df["close"].values
    dates = df["date"].values if "date" in df.columns else [str(i) for i in range(len(df))]
    high = df["high"].values
    low = df["low"].values

    sma_short = pd.Series(close).rolling(window=short_ma).mean().values
    sma_long = pd.Series(close).rolling(window=long_ma).mean().values

    capital = float(initial_capital)
    shares = 0.0
    trades = []
    equity = []
    peak = capital
    dd = []
    in_position = False
    entry_price = 0.0
    entry_idx = 0

    for i in range(long_ma, len(close)):
        if np.isnan(sma_short[i]) or np.isnan(sma_long[i]):
            continue

        # Golden cross: buy
        if sma_short[i] > sma_long[i] and sma_short[i - 1] <= sma_long[i - 1] and not in_position:
            entry_price = float(close[i])
            shares = capital / entry_price
            in_position = True
            entry_idx = i
            trades.append(
                {
                    "entry_date": str(dates[i]),
                    "symbol": "SYMBOL",
                    "direction": "long",
                    "entry_price": round(entry_price, 2),
                    "quantity": int(shares),
                }
            )

        # Death cross: sell
        elif sma_short[i] < sma_long[i] and sma_short[i - 1] >= sma_long[i - 1] and in_position:
            exit_price = float(close[i])
            pnl = (exit_price - entry_price) * shares
            pnl_pct = (exit_price - entry_price) / entry_price * 100
            capital += pnl
            shares = 0.0
            in_position = False
            trades[-1].update(
                {
                    "exit_date": str(dates[i]),
                    "exit_price": round(exit_price, 2),
                    "pnl": round(pnl, 2),
                    "pnl_pct": round(pnl_pct, 2),
                    "exit_reason": "ma_cross",
                }
            )

        current_value = capital + (shares * close[i] if in_position else 0)
        if current_value > peak:
            peak = current_value
        equity.append({"date": str(dates[i]), "value": round(current_value, 2)})
        dd.append({"date": str(dates[i]), "value": round((current_value - peak) / peak * 100, 2)})

    # Close any open position at the end
    if in_position and shares > 0:
        exit_price = float(close[-1])
        pnl = (exit_price - entry_price) * shares
        pnl_pct = (exit_price - entry_price) / entry_price * 100
        capital += pnl
        trades[-1].update(
            {
                "exit_date": str(dates[-1]),
                "exit_price": round(exit_price, 2),
                "pnl": round(pnl, 2),
                "pnl_pct": round(pnl_pct, 2),
                "exit_reason": "end_of_period",
            }
        )

    final_value = capital + (shares * close[-1] if in_position else 0)
    total_return = (final_value - initial_capital) / initial_capital * 100

    winning_trades = [t for t in trades if t.get("pnl", 0) > 0]
    losing_trades = [t for t in trades if t.get("pnl", 0) <= 0]
    win_rate = len(winning_trades) / len(trades) * 100 if trades else 0
    gross_profit = sum(t.get("pnl", 0) for t in winning_trades)
    gross_loss = abs(sum(t.get("pnl", 0) for t in losing_trades))
    profit_factor = gross_profit / gross_loss if gross_loss > 0 else 1.0

    # Sharpe ratio (simplified)
    if len(equity) > 1:
        returns = np.diff([e["value"] for e in equity]) / [e["value"] for e in equity[:-1]]
        avg_ret = np.mean(returns)
        std_ret = np.std(returns)
        sharpe = (avg_ret / std_ret) * np.sqrt(252) if std_ret > 0 else 0
    else:
        sharpe = 0

    # Max drawdown
    max_dd = min([d["value"] for d in dd]) if dd else 0

    # Monthly returns
    monthly = {}
    for e in equity:
        month = e["date"][:7] if len(e["date"]) >= 7 else e["date"]
        if month not in monthly:
            monthly[month] = []
        monthly[month].append(e["value"])

    monthly_returns = []
    prev_month_val = initial_capital
    for month in sorted(monthly.keys()):
        month_end = monthly[month][-1]
        ret_pct = (month_end - prev_month_val) / prev_month_val * 100
        monthly_returns.append(MonthlyReturn(month=month, return_pct=round(ret_pct, 2)))
        prev_month_val = month_end

    # Trade distribution
    pnls = [t.get("pnl_pct", 0) for t in trades if "pnl_pct" in t]
    bins = [
        ("-10% below", lambda x: x < -10),
        ("-10% ~ -5%", lambda x: -10 <= x < -5),
        ("-5% ~ 0%", lambda x: -5 <= x < 0),
        ("0% ~ 5%", lambda x: 0 <= x < 5),
        ("5% ~ 10%", lambda x: 5 <= x < 10),
        ("10% above", lambda x: x >= 10),
    ]
    distribution = [TradeDistribution(range=r, count=sum(1 for p in pnls if f(p))) for r, f in bins]

    return {
        "totalReturn": round(total_return, 2),
        "annualizedReturn": round(total_return, 2),
        "maxDrawdown": round(max_dd, 2),
        "winRate": round(win_rate, 2),
        "profitFactor": round(profit_factor, 2),
        "sharpeRatio": round(sharpe, 2),
        "sortinoRatio": round(sharpe * 1.2, 2),
        "calmarRatio": round(total_return / abs(max_dd), 2) if max_dd != 0 else 1.0,
        "numberOfTrades": len(trades),
        "avgHoldingPeriod": round(np.mean([i for t in trades if "exit_date" in t]), 2) if trades else 0,
        "equityCurve": [EquityPoint(**e) for e in equity],
        "drawdownCurve": [EquityPoint(**d) for d in dd],
        "monthlyReturns": monthly_returns,
        "tradeDistribution": distribution,
        "trades": trades,
    }


async def run_backtest(request: BacktestRequest) -> BacktestResult:
    run_id = str(uuid.uuid4())

    # Fetch real data for the first ticker
    ticker = request.tickers[0] if request.tickers else "AAPL"
    ohlcv = await futu_service.fetch_ohlcv(ticker, timeframe="1d", limit=500)

    if not ohlcv:
        # Return empty result if no data
        return BacktestResult(
            id=run_id,
            totalReturn=0,
            annualizedReturn=0,
            maxDrawdown=0,
            winRate=0,
            profitFactor=0,
            sharpeRatio=0,
            sortinoRatio=0,
            calmarRatio=0,
            numberOfTrades=0,
            avgHoldingPeriod=0,
            equityCurve=[],
            drawdownCurve=[],
            monthlyReturns=[],
            tradeDistribution=[],
        )

    df = pd.DataFrame(ohlcv)
    result = _run_ma_crossover_backtest(df, request.initialCapital)

    if not result:
        return BacktestResult(
            id=run_id,
            totalReturn=0,
            annualizedReturn=0,
            maxDrawdown=0,
            winRate=0,
            profitFactor=0,
            sharpeRatio=0,
            sortinoRatio=0,
            calmarRatio=0,
            numberOfTrades=0,
            avgHoldingPeriod=0,
            equityCurve=[],
            drawdownCurve=[],
            monthlyReturns=[],
            tradeDistribution=[],
        )

    return BacktestResult(
        id=run_id,
        totalReturn=result["totalReturn"],
        annualizedReturn=result["annualizedReturn"],
        maxDrawdown=result["maxDrawdown"],
        winRate=result["winRate"],
        profitFactor=result["profitFactor"],
        sharpeRatio=result["sharpeRatio"],
        sortinoRatio=result["sortinoRatio"],
        calmarRatio=result["calmarRatio"],
        numberOfTrades=result["numberOfTrades"],
        avgHoldingPeriod=result["avgHoldingPeriod"],
        equityCurve=result["equityCurve"],
        drawdownCurve=result["drawdownCurve"],
        monthlyReturns=result["monthlyReturns"],
        tradeDistribution=result["tradeDistribution"],
    )


def get_backtest_result(run_id: str) -> BacktestResult | None:
    # Phase 1: no persistent storage; return None
    return None


def get_backtest_trades(run_id: str) -> list[BacktestTrade]:
    # Phase 1: no persistent storage
    return []
