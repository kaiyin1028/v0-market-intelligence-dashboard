import asyncio
import logging
import time
from typing import Any, Literal

import numpy as np
import pandas as pd

from app.schemas.breakout import BreakoutAnalysis, BreakoutAnalysisResponse, BreakoutScanResult
from app.services import futu_service
from app.services.indicator_service import compute_indicators

logger = logging.getLogger(__name__)

# Cache scan results to avoid Yahoo Finance rate limits
_scan_cache: tuple[list[BreakoutScanResult], float] | None = None
_SCAN_CACHE_TTL = 300  # seconds

# Universe of stocks to scan
_SCAN_UNIVERSE = [
    ("AAPL", "Apple Inc.", "Technology"),
    ("MSFT", "Microsoft Corp.", "Technology"),
    ("NVDA", "NVIDIA Corp.", "Technology"),
    ("AMD", "Advanced Micro Devices", "Technology"),
    ("META", "Meta Platforms Inc.", "Communication Services"),
    ("TSLA", "Tesla Inc.", "Consumer Discretionary"),
    ("AMZN", "Amazon.com Inc.", "Consumer Discretionary"),
    ("GOOGL", "Alphabet Inc.", "Communication Services"),
    ("JPM", "JPMorgan Chase & Co.", "Financials"),
    ("XOM", "Exxon Mobil Corp.", "Energy"),
    ("UNH", "UnitedHealth Group", "Healthcare"),
    ("NFLX", "Netflix Inc.", "Communication Services"),
    ("CRM", "Salesforce Inc.", "Technology"),
    ("DIS", "Walt Disney Co.", "Communication Services"),
    ("BAC", "Bank of America Corp.", "Financials"),
    ("AVGO", "Broadcom Inc.", "Technology"),
    ("INTC", "Intel Corp.", "Technology"),
    ("CSCO", "Cisco Systems", "Technology"),
    ("ORCL", "Oracle Corp.", "Technology"),
    ("ADBE", "Adobe Inc.", "Technology"),
    ("QCOM", "Qualcomm Inc.", "Technology"),
    ("TXN", "Texas Instruments", "Technology"),
    ("PYPL", "PayPal Holdings", "Financials"),
    ("UBER", "Uber Technologies", "Technology"),
    ("ABNB", "Airbnb Inc.", "Consumer Discretionary"),
    ("PFE", "Pfizer Inc.", "Healthcare"),
    ("JNJ", "Johnson & Johnson", "Healthcare"),
    ("LLY", "Eli Lilly & Co.", "Healthcare"),
    ("MRK", "Merck & Co.", "Healthcare"),
    ("ABBV", "AbbVie Inc.", "Healthcare"),
    ("TMO", "Thermo Fisher Scientific", "Healthcare"),
    ("V", "Visa Inc.", "Financials"),
    ("MA", "Mastercard Inc.", "Financials"),
    ("WFC", "Wells Fargo & Co.", "Financials"),
    ("GS", "Goldman Sachs", "Financials"),
    ("MS", "Morgan Stanley", "Financials"),
    ("C", "Citigroup Inc.", "Financials"),
    ("BRK-B", "Berkshire Hathaway", "Financials"),
    ("HD", "Home Depot", "Consumer Discretionary"),
    ("LOW", "Lowe's Companies", "Consumer Discretionary"),
    ("NKE", "Nike Inc.", "Consumer Discretionary"),
    ("MCD", "McDonald's Corp.", "Consumer Discretionary"),
    ("SBUX", "Starbucks Corp.", "Consumer Discretionary"),
    ("COST", "Costco Wholesale", "Consumer Staples"),
    ("WMT", "Walmart Inc.", "Consumer Staples"),
    ("PG", "Procter & Gamble", "Consumer Staples"),
    ("KO", "Coca-Cola Co.", "Consumer Staples"),
    ("PEP", "PepsiCo Inc.", "Consumer Staples"),
    ("CVX", "Chevron Corp.", "Energy"),
    ("COP", "ConocoPhillips", "Energy"),
    ("SLB", "Schlumberger", "Energy"),
    ("LIN", "Linde plc", "Materials"),
    ("RTX", "RTX Corp.", "Industrials"),
    ("HON", "Honeywell International", "Industrials"),
    ("CAT", "Caterpillar Inc.", "Industrials"),
    ("GE", "GE Aerospace", "Industrials"),
    ("BA", "Boeing Co.", "Industrials"),
    ("NEE", "NextEra Energy", "Utilities"),
    ("DUK", "Duke Energy", "Utilities"),
    ("VZ", "Verizon Communications", "Communication Services"),
    ("CMCSA", "Comcast Corp.", "Communication Services"),
    ("TMUS", "T-Mobile US", "Communication Services"),
    ("SPGI", "S&P Global Inc.", "Financials"),
    ("BLK", "BlackRock Inc.", "Financials"),
    ("AXP", "American Express", "Financials"),
    ("BMY", "Bristol Myers Squibb", "Healthcare"),
    ("DHR", "Danaher Corp.", "Healthcare"),
]


def _rsi_state(rsi: float) -> Literal["overbought", "oversold", "neutral"]:
    if rsi >= 70:
        return "overbought"
    if rsi <= 30:
        return "oversold"
    return "neutral"


def _macd_state(macd_val: float, macd_sig: float) -> Literal["bullish", "bearish", "neutral"]:
    if macd_val > macd_sig and macd_val > 0:
        return "bullish"
    if macd_val < macd_sig and macd_val < 0:
        return "bearish"
    return "neutral"


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


def _analyze_breakout(df: pd.DataFrame) -> dict:
    """Compute breakout metrics from OHLCV DataFrame."""
    if df is None or len(df) < 20:
        return {}

    close = df["close"].values
    high = df["high"].values
    low = df["low"].values
    volume = df["volume"].values

    # Volume ratio: today vs 20-day average
    vol_ma20 = volume[-20:].mean()
    volume_ratio = round(volume[-1] / vol_ma20, 2) if vol_ma20 > 0 else 1.0

    # Close strength: (close - low) / (high - low)
    cs = round((close[-1] - low[-1]) / (high[-1] - low[-1]) * 100, 2) if high[-1] != low[-1] else 50.0

    # OBV confirmation
    obv = np.cumsum(np.sign(np.diff(close, prepend=close[0])) * volume)
    obv_trend = np.polyfit(range(len(obv[-10:])), obv[-10:], 1)[0]
    price_trend = np.polyfit(range(len(close[-10:])), close[-10:], 1)[0]
    obv_conf = obv_trend * price_trend > 0

    # Indicators
    indicators = compute_indicators(df)
    rsi = indicators.rsi
    macd_val = indicators.macd.value
    macd_sig = indicators.macd.signal

    # Breakout level = 20-day high
    breakout_level = round(float(high[-20:].max()), 2)

    # Chip pressure: how far is price from 20-day low (0 = at low, 100 = at high)
    range_20 = high[-20:].max() - low[-20:].min()
    chip_pressure = round((1 - (close[-1] - low[-20:].min()) / range_20) * 100, 2) if range_20 > 0 else 50.0

    # False breakout risk
    fbr = 0.0
    if volume_ratio < 1.0:
        fbr += 20
    if cs < 50:
        fbr += 20
    if not obv_conf:
        fbr += 15
    if rsi > 75 or rsi < 25:
        fbr += 15
    fbr = min(fbr, 100)

    return {
        "breakoutLevel": breakout_level,
        "volumeRatio": volume_ratio,
        "closeStrength": cs,
        "obvConfirmation": obv_conf,
        "rsiState": _rsi_state(rsi),
        "macdState": _macd_state(macd_val, macd_sig),
        "chipPressure": max(0, min(100, chip_pressure)),
        "falseBreakoutRisk": round(fbr, 2),
    }


def _signal_from_metrics(m: dict) -> str:
    score = 0
    if m.get("volumeRatio", 1.0) >= 1.5:
        score += 2
    if m.get("closeStrength", 50) >= 70:
        score += 2
    if m.get("obvConfirmation", False):
        score += 1
    if m.get("rsiState") == "neutral":
        score += 1
    if m.get("macdState") == "bullish":
        score += 2
    if m.get("falseBreakoutRisk", 50) < 30:
        score += 2

    if score >= 7:
        return "strong-buy"
    if score >= 5:
        return "buy"
    if score >= 3:
        return "watch"
    if score >= 1:
        return "reduce"
    return "sell"


async def _scan_one(
    idx: int, ticker: str, name: str, sector: str, pre_fetched_ohlcv: list[dict[str, Any]] | None = None
) -> BreakoutScanResult | None:
    if pre_fetched_ohlcv:
        ohlcv = pre_fetched_ohlcv
        snapshot = _snapshot_from_ohlcv(ticker, name, ohlcv)
    else:
        snapshot = await futu_service.get_snapshot(ticker)
        if snapshot is None:
            return None
        ohlcv = await futu_service.fetch_ohlcv(ticker, timeframe="1d", limit=30)

    if not ohlcv:
        return None

    df = pd.DataFrame(ohlcv)
    metrics = _analyze_breakout(df)
    if not metrics:
        return None

    return BreakoutScanResult(
        id=str(idx + 1),
        ticker=ticker,
        name=name,
        price=snapshot["price"] if snapshot else 0.0,
        breakoutLevel=metrics["breakoutLevel"],
        volumeRatio=metrics["volumeRatio"],
        closeStrength=metrics["closeStrength"],
        obvConfirmation=metrics["obvConfirmation"],
        rsiState=metrics["rsiState"],
        macdState=metrics["macdState"],
        chipPressure=metrics["chipPressure"],
        falseBreakoutRisk=metrics["falseBreakoutRisk"],
        signal=_signal_from_metrics(metrics),
        sector=sector,
    )


async def scan_breakouts(
    sector: str | None = None,
    min_volume_ratio: float | None = None,
    max_false_breakout_risk: float | None = None,
    signal_type: str | None = None,
) -> list[BreakoutScanResult]:
    global _scan_cache
    now = time.time()
    if _scan_cache is not None:
        cached_results, expiry = _scan_cache
        if now < expiry:
            filtered = list(cached_results)
            if sector:
                filtered = [r for r in filtered if r.sector.lower() == sector.lower()]
            if min_volume_ratio is not None:
                filtered = [r for r in filtered if r.volumeRatio >= min_volume_ratio]
            if max_false_breakout_risk is not None:
                filtered = [r for r in filtered if r.falseBreakoutRisk <= max_false_breakout_risk]
            if signal_type:
                filtered = [r for r in filtered if r.signal == signal_type]
            return filtered

    # Try batch fetch first to avoid individual API rate limits
    batch_data = await futu_service.fetch_ohlcv_batch(
        [t for t, _n, _s in _SCAN_UNIVERSE], timeframe="1d", limit=30
    )

    tasks = [
        _scan_one(i, t, n, s, pre_fetched_ohlcv=batch_data.get(t) if batch_data else None)
        for i, (t, n, s) in enumerate(_SCAN_UNIVERSE)
    ]
    results = await asyncio.gather(*tasks)
    filtered = [r for r in results if r is not None]
    _scan_cache = (filtered, now + _SCAN_CACHE_TTL)

    if sector:
        filtered = [r for r in filtered if r.sector.lower() == sector.lower()]
    if min_volume_ratio is not None:
        filtered = [r for r in filtered if r.volumeRatio >= min_volume_ratio]
    if max_false_breakout_risk is not None:
        filtered = [r for r in filtered if r.falseBreakoutRisk <= max_false_breakout_risk]
    if signal_type:
        filtered = [r for r in filtered if r.signal == signal_type]

    return filtered


def _grade(score: float) -> str:
    if score >= 80:
        return "A"
    if score >= 65:
        return "B"
    if score >= 50:
        return "C"
    if score >= 35:
        return "D"
    return "F"


async def analyze_breakout(
    symbol: str = "AAPL",
    timeframe: str = "1d",
    volume_confirmation: float = 70.0,
    close_strength: float = 65.0,
    level_importance: float = 60.0,
    obv_confirmation: float = 80.0,
    rsi_strength: float = 55.0,
    macd_confirmation: float = 70.0,
    low_upper_chip_pressure: float = 60.0,
    sector_confirmation: float = 50.0,
    market_confirmation: float = 50.0,
    insufficient_volume_score: float = 30.0,
    weak_close_score: float = 35.0,
    upper_shadow_score: float = 40.0,
    obv_non_confirmation_score: float = 25.0,
    rsi_bearish_divergence_score: float = 20.0,
    upper_chip_pressure_score: float = 45.0,
    sector_weakness_score: float = 30.0,
    market_weakness_score: float = 25.0,
    excessive_atr_score: float = 15.0,
    pre_fetched_df: pd.DataFrame | None = None,
) -> BreakoutAnalysisResponse:
    if pre_fetched_df is not None and not pre_fetched_df.empty:
        df = pre_fetched_df
    else:
        ohlcv = await futu_service.fetch_ohlcv(symbol.upper(), timeframe=timeframe, limit=60)
        if not ohlcv:
            return BreakoutAnalysisResponse(
                symbol=symbol.upper(),
                timeframe=timeframe,
                analysis=BreakoutAnalysis(
                    breakoutLevel=0,
                    trueBreakoutScore=0,
                    falseBreakoutRisk=0,
                    volumeRatio=0,
                    closeStrength=0,
                    obvConfirmation=False,
                    rsiDivergence=False,
                    upperChipPressure=0,
                ),
                grade="F",
                reasons=["No real data available for this symbol"],
            )
        df = pd.DataFrame(ohlcv)
    metrics = _analyze_breakout(df)

    true_score = (
        0.20 * volume_confirmation
        + 0.18 * close_strength
        + 0.14 * level_importance
        + 0.12 * obv_confirmation
        + 0.10 * rsi_strength
        + 0.10 * macd_confirmation
        + 0.08 * low_upper_chip_pressure
        + 0.05 * sector_confirmation
        + 0.03 * market_confirmation
    )

    false_risk = (
        0.18 * insufficient_volume_score
        + 0.16 * weak_close_score
        + 0.14 * upper_shadow_score
        + 0.12 * obv_non_confirmation_score
        + 0.12 * rsi_bearish_divergence_score
        + 0.10 * upper_chip_pressure_score
        + 0.08 * sector_weakness_score
        + 0.06 * market_weakness_score
        + 0.04 * excessive_atr_score
    )

    reasons = []
    if metrics.get("volumeRatio", 1.0) >= 1.5:
        reasons.append("Volume confirms breakout")
    if metrics.get("closeStrength", 50) >= 70:
        reasons.append("Strong close above breakout level")
    if metrics.get("obvConfirmation", False):
        reasons.append("OBV confirms upward momentum")
    if metrics.get("rsiState") == "neutral":
        reasons.append("RSI supports bullish momentum")
    if metrics.get("macdState") == "bullish":
        reasons.append("MACD confirms trend strength")
    if metrics.get("chipPressure", 50) < 40:
        reasons.append("Low upper chip pressure reduces resistance")
    if metrics.get("falseBreakoutRisk", 50) > 50:
        reasons.append("Warning: elevated false breakout risk")

    analysis = BreakoutAnalysis(
        breakoutLevel=metrics.get("breakoutLevel", 0),
        trueBreakoutScore=round(true_score, 2),
        falseBreakoutRisk=round(false_risk, 2),
        volumeRatio=metrics.get("volumeRatio", 0),
        closeStrength=metrics.get("closeStrength", 0),
        obvConfirmation=metrics.get("obvConfirmation", False),
        rsiDivergence=rsi_bearish_divergence_score >= 50,
        upperChipPressure=round(metrics.get("chipPressure", 0), 2),
    )

    return BreakoutAnalysisResponse(
        symbol=symbol.upper(),
        timeframe=timeframe,
        analysis=analysis,
        grade=_grade(true_score),
        reasons=reasons or ["No strong signals detected"],
    )
