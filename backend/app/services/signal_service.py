import asyncio
import logging
import time
from datetime import datetime
from typing import Any

import numpy as np
import pandas as pd

from app.schemas.signal import SignalData, TradeSignal
from app.services import futu_service
from app.services.indicator_service import compute_indicators

logger = logging.getLogger(__name__)

# Cache scan results to avoid Yahoo Finance rate limits
_signal_cache: tuple[list[TradeSignal], float] | None = None
_SIGNAL_CACHE_TTL = 300  # seconds

_SIGNAL_UNIVERSE = [
    ("AAPL", "Apple Inc."),
    ("MSFT", "Microsoft Corp."),
    ("NVDA", "NVIDIA Corp."),
    ("AMD", "Advanced Micro Devices"),
    ("META", "Meta Platforms Inc."),
    ("TSLA", "Tesla Inc."),
    ("AMZN", "Amazon.com Inc."),
    ("GOOGL", "Alphabet Inc."),
    ("JPM", "JPMorgan Chase & Co."),
    ("NFLX", "Netflix Inc."),
    ("AVGO", "Broadcom Inc."),
    ("INTC", "Intel Corp."),
    ("CSCO", "Cisco Systems"),
    ("ORCL", "Oracle Corp."),
    ("ADBE", "Adobe Inc."),
    ("QCOM", "Qualcomm Inc."),
    ("TXN", "Texas Instruments"),
    ("PYPL", "PayPal Holdings"),
    ("UBER", "Uber Technologies"),
    ("ABNB", "Airbnb Inc."),
    ("PFE", "Pfizer Inc."),
    ("JNJ", "Johnson & Johnson"),
    ("LLY", "Eli Lilly & Co."),
    ("MRK", "Merck & Co."),
    ("ABBV", "AbbVie Inc."),
    ("TMO", "Thermo Fisher Scientific"),
    ("V", "Visa Inc."),
    ("MA", "Mastercard Inc."),
    ("WFC", "Wells Fargo & Co."),
    ("GS", "Goldman Sachs"),
    ("MS", "Morgan Stanley"),
    ("BRK-B", "Berkshire Hathaway"),
    ("HD", "Home Depot"),
    ("LOW", "Lowe's Companies"),
    ("NKE", "Nike Inc."),
    ("MCD", "McDonald's Corp."),
    ("SBUX", "Starbucks Corp."),
    ("COST", "Costco Wholesale"),
    ("WMT", "Walmart Inc."),
    ("PG", "Procter & Gamble"),
    ("KO", "Coca-Cola Co."),
    ("PEP", "PepsiCo Inc."),
    ("CVX", "Chevron Corp."),
    ("COP", "ConocoPhillips"),
    ("LIN", "Linde plc"),
    ("RTX", "RTX Corp."),
    ("HON", "Honeywell International"),
    ("CAT", "Caterpillar Inc."),
    ("GE", "GE Aerospace"),
    ("BA", "Boeing Co."),
    ("NEE", "NextEra Energy"),
    ("VZ", "Verizon Communications"),
    ("CMCSA", "Comcast Corp."),
    ("TMUS", "T-Mobile US"),
    ("SPGI", "S&P Global Inc."),
    ("BLK", "BlackRock Inc."),
    ("AXP", "American Express"),
    ("BMY", "Bristol Myers Squibb"),
    ("DHR", "Danaher Corp."),
]


def _signal_category(buy: float, sell: float) -> str:
    diff = buy - sell
    if diff >= 40:
        return "strong-buy"
    if diff >= 20:
        return "buy"
    if diff >= 5:
        return "watch"
    if diff >= -15:
        return "reduce"
    if diff >= -30:
        return "sell"
    return "short"


def _compute_signal_scores(df: pd.DataFrame) -> tuple[float, float]:
    """Compute real buy/sell scores from OHLCV DataFrame."""
    if df is None or len(df) < 30:
        return 50.0, 50.0

    close = df["close"].values
    high = df["high"].values
    low = df["low"].values
    volume = df["volume"].values

    indicators = compute_indicators(df)
    rsi = indicators.rsi
    macd_val = indicators.macd.value
    macd_sig = indicators.macd.signal
    macd_hist = indicators.macd.histogram
    ma20 = indicators.movingAverages.ma20
    ma60 = indicators.movingAverages.ma60
    bb_upper = indicators.bollingerBands.upper
    bb_lower = indicators.bollingerBands.lower
    obv = indicators.obv
    cmf = indicators.cmf

    # Buy score components (0-100 each)
    trend_score = 70.0 if close[-1] > ma20 > ma60 else (50.0 if close[-1] > ma20 else 30.0)
    breakout_score = 70.0 if close[-1] > bb_upper else (50.0 if close[-1] > (bb_upper + bb_lower) / 2 else 30.0)
    volume_price_score = 70.0 if cmf > 0 else 40.0
    momentum_score = 70.0 if macd_val > macd_sig and macd_hist > 0 else (50.0 if macd_hist > 0 else 30.0)
    chip_support_score = 70.0 if close[-1] > ma20 else 40.0
    vwap_score = 70.0 if close[-1] > indicators.vwap else 40.0
    relative_strength_score = 70.0 if 40 < rsi < 65 else (50.0 if 30 < rsi < 70 else 30.0)
    risk_reward_score = 60.0
    market_regime_score = 60.0

    buy_score = (
        0.18 * trend_score
        + 0.16 * breakout_score
        + 0.14 * volume_price_score
        + 0.12 * momentum_score
        + 0.12 * chip_support_score
        + 0.10 * vwap_score
        + 0.08 * relative_strength_score
        + 0.06 * risk_reward_score
        + 0.04 * market_regime_score
    )

    # Sell score components
    support_break_score = 70.0 if close[-1] < ma20 < ma60 else (50.0 if close[-1] < ma20 else 30.0)
    distribution_score = 70.0 if cmf < 0 else 40.0
    volume_down_score = 70.0 if volume[-1] < volume[-10:].mean() * 0.8 else 40.0
    momentum_weakness_score = 70.0 if macd_val < macd_sig and macd_hist < 0 else 50.0
    chip_breakdown_score = 70.0 if close[-1] < ma60 else 40.0
    vwap_failure_score = 70.0 if close[-1] < indicators.vwap else 40.0
    trend_reversal_score = 70.0 if rsi > 75 or rsi < 25 else 40.0
    market_weakness_score = 50.0
    volatility_risk_score = 60.0

    sell_score = (
        0.18 * support_break_score
        + 0.16 * distribution_score
        + 0.14 * volume_down_score
        + 0.12 * momentum_weakness_score
        + 0.12 * chip_breakdown_score
        + 0.10 * vwap_failure_score
        + 0.08 * trend_reversal_score
        + 0.06 * market_weakness_score
        + 0.04 * volatility_risk_score
    )

    return round(buy_score, 2), round(sell_score, 2)


def _entry_zone_from_df(df: pd.DataFrame) -> tuple[float, float, float, list[float], float]:
    """Compute entry zone, stop loss, and targets from real data."""
    if df is None or len(df) < 20:
        return 0.0, 0.0, 0.0, [], 0.0

    close = df["close"].values
    low = df["low"].values
    high = df["high"].values

    recent_low = float(low[-10:].min())
    recent_high = float(high[-10:].max())
    current = float(close[-1])

    entry_low = round(recent_low + (current - recent_low) * 0.3, 2)
    entry_high = round(current, 2)
    stop = round(recent_low * 0.98, 2)
    target1 = round(recent_high * 1.03, 2)
    target2 = round(recent_high * 1.06, 2)
    target3 = round(recent_high * 1.10, 2)
    rr = round((target1 - entry_low) / (entry_low - stop), 2) if entry_low != stop else 1.0

    return entry_low, entry_high, stop, [target1, target2, target3], rr


async def compute_signal_for_df(df: pd.DataFrame) -> SignalData:
    buy_score, sell_score = _compute_signal_scores(df)
    entry_low, entry_high, stop, targets, rr = _entry_zone_from_df(df)
    return SignalData(
        buyScore=buy_score,
        sellScore=sell_score,
        entryZone={"low": entry_low, "high": entry_high},
        stopLoss=stop,
        targets=targets,
        riskRewardRatio=rr,
    )


async def compute_signal() -> SignalData:
    """Compute signal for default symbol (AAPL)."""
    ohlcv = await futu_service.fetch_ohlcv("AAPL", timeframe="1d", limit=60)
    if not ohlcv:
        return SignalData(
            buyScore=50,
            sellScore=50,
            entryZone={"low": 0, "high": 0},
            stopLoss=0,
            targets=[],
            riskRewardRatio=0,
        )
    df = pd.DataFrame(ohlcv)
    return await compute_signal_for_df(df)


def _snapshot_from_ohlcv(ticker: str, name: str, ohlcv: list[dict[str, Any]]) -> dict[str, Any] | None:
    """Derive snapshot from OHLCV last rows."""
    if len(ohlcv) < 2:
        return None
    latest = ohlcv[-1]
    prev = ohlcv[-2]
    price = latest["close"]
    prev_close = prev["close"]
    change = price - prev_close
    change_percent = (change / prev_close) * 100 if prev_close else 0.0
    return {
        "ticker": ticker.upper(),
        "name": name,
        "price": round(float(price), 2),
        "change": round(float(change), 2),
        "changePercent": round(float(change_percent), 2),
        "volume": int(latest.get("volume", 0)),
    }


async def _scan_signal_one(idx: int, ticker: str, name: str, pre_fetched_ohlcv: list[dict[str, Any]] | None = None) -> TradeSignal | None:
    if pre_fetched_ohlcv:
        ohlcv = pre_fetched_ohlcv
        snapshot = _snapshot_from_ohlcv(ticker, name, ohlcv)
    else:
        snapshot = await futu_service.get_snapshot(ticker)
        ohlcv = await futu_service.fetch_ohlcv(ticker, timeframe="1d", limit=60)
    if snapshot is None or not ohlcv:
        return None

    df = pd.DataFrame(ohlcv)
    buy_score, sell_score = _compute_signal_scores(df)
    signal_type = _signal_category(buy_score, sell_score)
    score = round(buy_score - sell_score + 50, 2)
    entry_low, entry_high, stop, targets, rr = _entry_zone_from_df(df)

    reasons = {
        "strong-buy": "Multiple bullish confirmations across technical and volume metrics",
        "buy": "Bullish technical alignment with positive momentum",
        "watch": "Mixed signals, awaiting clearer directional confirmation",
        "reduce": "Weak momentum suggests trimming positions",
        "sell": "Bearish technical breakdown detected",
        "short": "Strong bearish signals across multiple timeframes",
    }

    return TradeSignal(
        id=str(idx + 1),
        ticker=ticker,
        name=name,
        signalType=signal_type,
        timeframe="1D",
        score=round(score, 2),
        entryPrice=round(entry_low, 2),
        stopLoss=round(stop, 2),
        target=round(targets[0], 2) if targets else 0,
        riskRewardRatio=rr,
        reason=reasons.get(signal_type, "Analysis complete"),
        aiExplanation="",
        createdAt=datetime.utcnow(),
    )


async def get_signals(signal_type: str | None = None) -> list[TradeSignal]:
    global _signal_cache
    now = time.time()
    if _signal_cache is not None:
        cached_results, expiry = _signal_cache
        if now < expiry:
            filtered = list(cached_results)
            if signal_type:
                filtered = [s for s in filtered if s.signalType == signal_type]
            return filtered

    batch_data = await futu_service.fetch_ohlcv_batch(
        [t for t, _n in _SIGNAL_UNIVERSE], timeframe="1d", limit=60
    )

    tasks = [
        _scan_signal_one(i, t, n, pre_fetched_ohlcv=batch_data.get(t) if batch_data else None)
        for i, (t, n) in enumerate(_SIGNAL_UNIVERSE)
    ]
    results = await asyncio.gather(*tasks)
    filtered = [r for r in results if r is not None]
    _signal_cache = (filtered, now + _SIGNAL_CACHE_TTL)

    if signal_type:
        filtered = [s for s in filtered if s.signalType == signal_type]

    return filtered
