import random
import time
from datetime import datetime

from app.schemas.market import (
    MarketBreadth,
    MarketIndex,
    MarketSummary,
    SectorHeatmapItem,
    SignalFeedItem,
    FalseBreakoutRiskItem,
    MarketOverviewResponse,
)
from app.services import futu_service
from app.services.breakout_service import scan_breakouts
from app.services.signal_service import get_signals


# Simple TTL cache for expensive scan results
_SCAN_CACHE = {}
_SCAN_CACHE_TTL = 30  # seconds


def _get_cached(key: str, fetcher):
    now = time.time()
    if key in _SCAN_CACHE:
        value, expiry = _SCAN_CACHE[key]
        if now < expiry:
            return value
    value = fetcher()
    _SCAN_CACHE[key] = (value, now + _SCAN_CACHE_TTL)
    return value


def _sparkline(base: float, volatility: float, points: int = 20) -> list[float]:
    data = [base]
    for _ in range(1, points):
        data.append(data[-1] + (random.random() - 0.5) * volatility)
    return data


async def get_market_overview() -> MarketOverviewResponse:
    # Fetch index snapshots
    snapshots = await futu_service.get_snapshots(["SPX", "NDX", "DJI", "VIX"])
    indices = []
    if snapshots:
        index_map = {r["ticker"]: r for r in snapshots}
        name_map = {
            "SPX": "S&P 500",
            "NDX": "Nasdaq",
            "DJI": "Dow Jones",
            "VIX": "VIX",
        }
        for symbol in ["SPX", "NDX", "DJI", "VIX"]:
            data = index_map.get(symbol)
            if data:
                change_pct = data.get("changePercent", 0)
                status: str = "bullish" if change_pct > 0.5 else ("bearish" if change_pct < -0.5 else "neutral")
                indices.append(
                    MarketIndex(
                        symbol=symbol,
                        name=name_map[symbol],
                        value=data["price"],
                        change=data["change"],
                        changePercent=change_pct,
                        sparklineData=_sparkline(data["price"], data["price"] * 0.005),
                        status=status,
                    )
                )

    # Fetch breakout and signal scans with caching
    breakout_results = await scan_breakouts()
    signal_results = await get_signals()

    # Compute summary counts
    bullish_signals = sum(1 for s in signal_results if s.signalType in ("buy", "strong-buy"))
    bearish_signals = sum(1 for s in signal_results if s.signalType in ("sell", "short"))
    false_breakout_alerts = sum(1 for b in breakout_results if b.falseBreakoutRisk >= 50)

    # Advancers / decliners from breakout scan
    advancers = sum(1 for b in breakout_results if b.price > b.breakoutLevel * 0.99)
    decliners = len(breakout_results) - advancers
    unchanged = 0
    ratio = round(advancers / decliners, 2) if decliners > 0 else float(advancers)

    # Sector heatmap from breakout scan
    sector_data: dict[str, dict] = {}
    for b in breakout_results:
        sec = b.sector
        if sec not in sector_data:
            sector_data[sec] = {"total_change": 0.0, "count": 0}
        # Approximate daily change from close strength relative to breakout level
        change = round((b.price - b.breakoutLevel) / b.breakoutLevel * 100, 2) if b.breakoutLevel > 0 else 0.0
        sector_data[sec]["total_change"] += change
        sector_data[sec]["count"] += 1

    sector_heatmap = [
        SectorHeatmapItem(
            sector=sec,
            change=round(d["total_change"] / d["count"], 2),
            stocks=d["count"],
        )
        for sec, d in sector_data.items()
    ]

    # Signal feed (top 8 signals)
    signal_messages = {
        "strong-buy": "強烈買入訊號，技術面與量能同步看多",
        "buy": "買入訊號，趨勢轉多建議關注",
        "watch": "觀望訊號，等待方向確認",
        "reduce": "減碼訊號，動能轉弱建議獲利了結",
        "sell": "賣出訊號，技術面轉空",
        "short": "強烈看空訊號，空頭趨勢確立",
    }
    signal_feed = [
        SignalFeedItem(
            id=s.id,
            ticker=s.ticker,
            signal=s.signalType,
            message=signal_messages.get(s.signalType, "分析完成"),
            time=s.createdAt.strftime("%H:%M") if hasattr(s.createdAt, "strftime") else str(s.createdAt)[11:16],
        )
        for s in signal_results[:8]
    ]

    # False breakout risks (top 6 highest risk)
    risk_reasons = {
        "高": "籌碼壓力大，假突破風險高",
        "中": "量能不足，留意假突破風險",
        "低": "量價配合良好，假突破風險低",
    }
    sorted_by_risk = sorted(breakout_results, key=lambda x: x.falseBreakoutRisk, reverse=True)
    false_breakout_risks = [
        FalseBreakoutRiskItem(
            ticker=b.ticker,
            risk=b.falseBreakoutRisk,
            level="高" if b.falseBreakoutRisk >= 66 else "中" if b.falseBreakoutRisk >= 33 else "低",
            reason=risk_reasons.get(
                "高" if b.falseBreakoutRisk >= 66 else "中" if b.falseBreakoutRisk >= 33 else "低",
                "風險評估中"
            ),
        )
        for b in sorted_by_risk[:6]
    ]

    return MarketOverviewResponse(
        indices=indices,
        summary=MarketSummary(
            bullishSignals=bullish_signals,
            bearishSignals=bearish_signals,
            falseBreakoutAlerts=false_breakout_alerts,
            marketBreadth=MarketBreadth(
                advancers=advancers,
                decliners=decliners,
                unchanged=unchanged,
                ratio=ratio,
            ),
        ),
        sectorHeatmap=sector_heatmap,
        signalFeed=signal_feed,
        falseBreakoutRisks=false_breakout_risks,
    )
