import logging
from typing import Any

import pandas as pd

from app.core.config import settings
from app.schemas.ai import AIAnalysisResponse, AIChatResponse, KeyLevels
from app.services import futu_service
from app.services.indicator_service import compute_indicators
from app.services.ollama_service import (
    ollama_chat,
    ollama_generate,
    ollama_health,
    parse_json_output,
)
from app.services.kimi_service import kimi_chat, kimi_generate, kimi_health

logger = logging.getLogger(__name__)


def _real_analysis_from_df(symbol: str, df: Any) -> AIAnalysisResponse:
    """Build an AIAnalysisResponse from real OHLCV data when AI is offline."""
    if df is None or len(df) < 20:
        current = 0.0
        support = []
        resistance = []
        stop_loss = None
        targets = []
    else:
        close = df["close"].values
        low = df["low"].values
        high = df["high"].values
        current = float(close[-1])
        recent_low = float(low[-20:].min())
        recent_high = float(high[-20:].max())
        support = sorted(set(round(float(x), 2) for x in [recent_low, low[-10:].min(), low[-5:].min()] if x > 0))
        resistance = sorted(set(round(float(x), 2) for x in [recent_high, high[-10:].max(), high[-5:].max()] if x > 0))
        stop_loss = round(recent_low * 0.98, 2) if recent_low > 0 else None
        targets = [round(recent_high * 1.03, 2), round(recent_high * 1.06, 2), round(recent_high * 1.10, 2)]

    indicators = compute_indicators(df) if df is not None and len(df) >= 20 else None
    if indicators:
        trend = "bullish" if current > indicators.movingAverages.ma20 > indicators.movingAverages.ma60 else (
            "bearish" if current < indicators.movingAverages.ma20 else "neutral"
        )
        quality = "high" if indicators.macd.histogram > 0 and 40 < indicators.rsi < 65 else (
            "medium" if indicators.macd.histogram > 0 else "low"
        )
        confidence = min(85.0, max(40.0, 50.0 + (indicators.macd.histogram * 2) + (0.5 if trend == "bullish" else -5)))
    else:
        trend = "neutral"
        quality = "medium"
        confidence = 50.0

    return AIAnalysisResponse(
        summary=f"{symbol} technical snapshot: price {'above' if trend == 'bullish' else 'below' if trend == 'bearish' else 'near'} key moving averages. Real levels computed from recent OHLCV data.",
        trendView=trend,
        breakoutQuality=quality,
        bullishReasons=["Real data mode active"] if indicators else ["Awaiting live data"],
        bearishRisks=["AI model offline — analysis based on raw indicator levels"],
        riskFactors=["Market volatility", "AI service unavailable"],
        keyLevels=KeyLevels(
            support=support,
            resistance=resistance,
            stopLoss=stop_loss,
            target=targets,
        ),
        confidence=round(confidence, 2),
    )


async def _fallback_analysis(symbol: str, df: Any | None = None) -> AIAnalysisResponse:
    if df is None:
        ohlcv = await futu_service.fetch_ohlcv(symbol.upper(), timeframe="1d", limit=60)
        df = pd.DataFrame(ohlcv) if ohlcv else None
    return _real_analysis_from_df(symbol, df)


# ───────────────────────────────
# AI provider routing helpers
# ───────────────────────────────

def _build_system_prompt(role: str = "senior quant analyst") -> str:
    return (
        f"You are a {role} specializing in US equities (NASDAQ/NYSE) and Hong Kong stocks (HKEX). "
        "Focus on tickers from these markets. Answer concisely and factually. "
        "If the user writes in Chinese, respond in Chinese. "
        "If the user writes in English, respond in English."
    )


def _format_context_data(context: dict[str, Any]) -> str:
    """Format system analysis data into a rich prompt for the AI agent."""
    if not context:
        return ""

    lines: list[str] = []
    ticker = context.get("ticker") or context.get("symbol")
    timeframe = context.get("timeframe", "1d")

    if ticker:
        lines.append(f"# Current Analysis Target: {ticker} ({timeframe})")
        lines.append("")

    # Technical Indicators
    indicators = context.get("indicators")
    if indicators:
        lines.append("## Technical Indicators")
        rsi = indicators.get("rsi")
        if rsi is not None:
            lines.append(f"- RSI: {rsi:.2f}")
        macd = indicators.get("macd")
        if macd:
            lines.append(f"- MACD: {macd.get('value', 0):.2f} | Signal: {macd.get('signal', 0):.2f} | Histogram: {macd.get('histogram', 0):.2f}")
        adx = indicators.get("adx")
        if adx is not None:
            lines.append(f"- ADX: {adx:.2f}")
        atr = indicators.get("atr")
        if atr is not None:
            lines.append(f"- ATR: {atr:.2f}")
        obv = indicators.get("obv")
        if obv is not None:
            lines.append(f"- OBV: {obv:,.0f}")
        cmf = indicators.get("cmf")
        if cmf is not None:
            lines.append(f"- CMF: {cmf:.4f}")
        bb = indicators.get("bollingerBands")
        if bb:
            lines.append(f"- Bollinger Bands: Upper={bb.get('upper', 0):.2f} Middle={bb.get('middle', 0):.2f} Lower={bb.get('lower', 0):.2f}")
        ma = indicators.get("movingAverages")
        if ma:
            lines.append(f"- Moving Averages: MA20={ma.get('ma20', 0):.2f} MA60={ma.get('ma60', 0):.2f} MA200={ma.get('ma200', 0):.2f}")
        vwap = indicators.get("vwap")
        if vwap is not None:
            lines.append(f"- VWAP: {vwap:.2f}")
        lines.append("")

    # Breakout Analysis
    breakout = context.get("breakoutAnalysis")
    if breakout:
        lines.append("## Breakout Analysis")
        lines.append(f"- Breakout Level: {breakout.get('breakoutLevel', 0):.2f}")
        lines.append(f"- True Breakout Score: {breakout.get('trueBreakoutScore', 0):.1f}/100")
        lines.append(f"- False Breakout Risk: {breakout.get('falseBreakoutRisk', 0):.1f}%")
        lines.append(f"- Volume Ratio: {breakout.get('volumeRatio', 0):.2f}")
        lines.append(f"- Close Strength: {breakout.get('closeStrength', 0):.2f}")
        lines.append(f"- OBV Confirmation: {'Yes' if breakout.get('obvConfirmation') else 'No'}")
        lines.append(f"- RSI Divergence: {'Yes' if breakout.get('rsiDivergence') else 'No'}")
        lines.append(f"- Upper Chip Pressure: {breakout.get('upperChipPressure', 0):.2f}")
        lines.append("")

    # Signal Data
    signal = context.get("signalData")
    if signal:
        lines.append("## Trade Signal")
        lines.append(f"- Buy Score: {signal.get('buyScore', 0):.1f}/100")
        lines.append(f"- Sell Score: {signal.get('sellScore', 0):.1f}/100")
        entry = signal.get("entryZone")
        if entry:
            lines.append(f"- Entry Zone: ${entry.get('low', 0):.2f} - ${entry.get('high', 0):.2f}")
        lines.append(f"- Stop Loss: ${signal.get('stopLoss', 0):.2f}")
        targets = signal.get("targets", [])
        if targets:
            lines.append(f"- Targets: {', '.join(f'${t:.2f}' for t in targets)}")
        lines.append(f"- Risk/Reward Ratio: {signal.get('riskRewardRatio', 0):.2f}")
        lines.append("")

    # Chip Distribution
    chip = context.get("chipDistribution")
    if chip:
        lines.append("## Chip Distribution")
        lines.append(f"- POC (Point of Control): {chip.get('poc', 0):.2f}")
        lines.append(f"- Value Area High: {chip.get('vah', 0):.2f}")
        lines.append(f"- Value Area Low: {chip.get('val', 0):.2f}")
        lines.append(f"- Chip Pressure: {chip.get('chipPressure', 0):.2f}")
        lines.append(f"- Upper Trapped Chips: {chip.get('upperTrappedChips', 0):.2f}")
        lines.append(f"- Lower Support Density: {chip.get('lowerSupportDensity', 0):.2f}")
        lines.append("")

    # AI Pre-analysis
    ai = context.get("aiAnalysis")
    if ai:
        lines.append("## System AI Pre-Analysis")
        summary = ai.get("summary", "")
        if summary:
            lines.append(f"- Summary: {summary}")
        trend = ai.get("trendView")
        if trend:
            lines.append(f"- Trend View: {trend}")
        quality = ai.get("breakoutQuality")
        if quality:
            lines.append(f"- Breakout Quality: {quality}")
        confidence = ai.get("confidence")
        if confidence is not None:
            lines.append(f"- Confidence: {confidence:.1f}%")
        bullish = ai.get("bullishReasons", [])
        if bullish:
            lines.append("- Bullish Reasons:")
            for r in bullish[:5]:
                lines.append(f"  - {r}")
        bearish = ai.get("bearishRisks", [])
        if bearish:
            lines.append("- Bearish Risks:")
            for r in bearish[:5]:
                lines.append(f"  - {r}")
        key_levels = ai.get("keyLevels")
        if key_levels:
            support = key_levels.get("support", [])
            resistance = key_levels.get("resistance", [])
            if support:
                lines.append(f"- Support Levels: {', '.join(f'${s:.2f}' for s in support[:5])}")
            if resistance:
                lines.append(f"- Resistance Levels: {', '.join(f'${r:.2f}' for r in resistance[:5])}")
            sl = key_levels.get("stopLoss")
            if sl is not None:
                lines.append(f"- Stop Loss: ${sl:.2f}")
            targets = key_levels.get("target", [])
            if targets:
                lines.append(f"- Targets: {', '.join(f'${t:.2f}' for t in targets)}")
        lines.append("")

    if not lines:
        return ""

    lines.insert(0, "You have access to the following real-time system analysis data. Use it to answer the user's questions accurately and insightfully. Reference specific numbers when relevant.")
    lines.insert(1, "")
    return "\n".join(lines)


async def _ai_chat(messages: list[dict[str, str]], json_mode: bool = False) -> str | None:
    """Route chat to Kimi (preferred) or Ollama."""
    if settings.kimi_enabled and settings.kimi_api_key:
        text = await kimi_chat(messages, json_mode=json_mode)
        if text is not None:
            return text
        logger.warning("Kimi chat failed, falling back to Ollama")

    health = await ollama_health()
    if health["status"] == "offline":
        return None
    return await ollama_chat(messages, json_mode=json_mode, model=health.get("effective_model"))


async def _ai_generate(prompt: str, json_mode: bool = False) -> str | None:
    """Route generation to Kimi (preferred) or Ollama."""
    if settings.kimi_enabled and settings.kimi_api_key:
        text = await kimi_generate(prompt, json_mode=json_mode)
        if text is not None:
            return text
        logger.warning("Kimi generate failed, falling back to Ollama")

    health = await ollama_health()
    if health["status"] == "offline":
        return None
    return await ollama_generate(prompt, json_mode=json_mode, model=health.get("effective_model"))


# ───────────────────────────────
# Public AI service functions
# ───────────────────────────────

async def chat(message: str, context: Any | None = None) -> AIChatResponse:
    system_parts = [_build_system_prompt()]
    if isinstance(context, dict) and context:
        ctx_prompt = _format_context_data(context)
        if ctx_prompt:
            system_parts.append(ctx_prompt)
    system_content = "\n\n".join(system_parts)

    text = await _ai_chat(
        messages=[
            {"role": "system", "content": system_content},
            {"role": "user", "content": message},
        ]
    )
    if text is None:
        return AIChatResponse(
            response=f"[Fallback] I couldn't reach the AI model. Here's a quick take: {message[:40]}...",
            analysis=await _fallback_analysis(context.get("ticker", "AAPL")) if isinstance(context, dict) and context.get("ticker") else None,
            warning="AI request failed. Returning computed indicator response.",
        )

    return AIChatResponse(
        response=text,
        analysis=await _fallback_analysis(context.get("ticker", "AAPL")) if isinstance(context, dict) and context.get("ticker") else None,
    )


def _parse_analysis_json(parsed: dict[str, Any], symbol: str) -> AIAnalysisResponse:
    key_levels_raw = parsed.get("key_levels") or parsed.get("keyLevels") or {}
    if isinstance(key_levels_raw, list) and len(key_levels_raw) >= 2:
        _sl = key_levels_raw[2] if len(key_levels_raw) > 2 else None
        if isinstance(_sl, list) and len(_sl) > 0:
            _sl = _sl[0]
        elif isinstance(_sl, list):
            _sl = None
        _tg = key_levels_raw[3] if len(key_levels_raw) > 3 else []
        if not isinstance(_tg, list):
            _tg = [_tg] if _tg else []
        key_levels = KeyLevels(
            support=key_levels_raw[0] if isinstance(key_levels_raw[0], list) else [key_levels_raw[0]],
            resistance=key_levels_raw[1] if isinstance(key_levels_raw[1], list) else [key_levels_raw[1]],
            stopLoss=_sl,
            target=_tg,
        )
    elif isinstance(key_levels_raw, dict):
        _sl = key_levels_raw.get("stop_loss") or key_levels_raw.get("stopLoss")
        if isinstance(_sl, list) and len(_sl) > 0:
            _sl = _sl[0]
        elif isinstance(_sl, list):
            _sl = None
        _tg = key_levels_raw.get("target", [])
        if not isinstance(_tg, list):
            _tg = [_tg] if _tg else []
        key_levels = KeyLevels(
            support=key_levels_raw.get("support", []),
            resistance=key_levels_raw.get("resistance", []),
            stopLoss=_sl,
            target=_tg,
        )
    else:
        key_levels = KeyLevels(support=[], resistance=[], stopLoss=None, target=[])

    return AIAnalysisResponse(
        summary=parsed.get("summary", ""),
        trendView=parsed.get("trend_view") or parsed.get("trendView") or "neutral",
        breakoutQuality=parsed.get("breakout_quality") or parsed.get("breakoutQuality") or "medium",
        bullishReasons=parsed.get("bullishReasons") or parsed.get("buy_reasons") or parsed.get("bullish_reasons") or [],
        bearishRisks=parsed.get("bearishRisks") or parsed.get("sell_reasons") or parsed.get("bearish_risks") or [],
        riskFactors=parsed.get("risk_factors") or parsed.get("riskFactors") or [],
        keyLevels=key_levels,
        confidence=parsed.get("confidence", 50.0),
    )


async def analyze_stock(symbol: str, timeframe: str = "1d") -> AIAnalysisResponse:
    prompt = (
        f"Analyze {symbol} on {timeframe} timeframe as a quant analyst. "
        "Return strictly valid JSON with these exact keys: "
        "summary (string), trend_view ('bullish'|'neutral'|'bearish'), "
        "breakout_quality ('high'|'medium'|'low'), bullishReasons (list of strings), "
        "bearishRisks (list of strings), riskFactors (list of strings), "
        "keyLevels (object with support, resistance, stopLoss, target arrays), "
        "confidence (number 0-100)."
    )

    text = await _ai_generate(prompt, json_mode=True)
    if text is None:
        logger.warning("analyze_stock: AI unavailable, returning computed fallback for %s", symbol)
        return await _fallback_analysis(symbol)

    parsed = parse_json_output(text)
    if parsed is None:
        logger.warning("analyze_stock: Could not parse JSON for %s, raw: %s", symbol, text[:200])
        return await _fallback_analysis(symbol)

    return _parse_analysis_json(parsed, symbol)


async def summarize_market(focus: str | None = None) -> AIAnalysisResponse:
    prompt = (
        f"Summarize today's market outlook. Focus: {focus or 'broad market'}. "
        "Return strictly valid JSON with these exact keys: "
        "summary (string), trend_view ('bullish'|'neutral'|'bearish'), "
        "breakout_quality ('high'|'medium'|'low'), bullishReasons (list of strings), "
        "bearishRisks (list of strings), riskFactors (list of strings), "
        "keyLevels (object with support, resistance, stopLoss, target arrays), "
        "confidence (number 0-100)."
    )

    text = await _ai_generate(prompt, json_mode=True)
    if text is None:
        logger.warning("summarize_market: AI unavailable, returning computed fallback")
        return await _fallback_analysis("SPX")

    parsed = parse_json_output(text)
    if parsed is None:
        logger.warning("summarize_market: Could not parse JSON, raw: %s", text[:200])
        return await _fallback_analysis("SPX")

    return _parse_analysis_json(parsed, "SPX")


async def explain_signal(signal_id: str, symbol: str) -> AIAnalysisResponse:
    prompt = (
        f"Explain trade signal {signal_id} for {symbol} in detail. "
        "Return strictly valid JSON with these exact keys: "
        "summary (string), trend_view ('bullish'|'neutral'|'bearish'), "
        "breakout_quality ('high'|'medium'|'low'), bullishReasons (list of strings), "
        "bearishRisks (list of strings), riskFactors (list of strings), "
        "keyLevels (object with support, resistance, stopLoss, target arrays), "
        "confidence (number 0-100)."
    )

    text = await _ai_generate(prompt, json_mode=True)
    if text is None:
        logger.warning("explain_signal: AI unavailable, returning computed fallback for %s", symbol)
        return await _fallback_analysis(symbol)

    parsed = parse_json_output(text)
    if parsed is None:
        logger.warning("explain_signal: Could not parse JSON for %s, raw: %s", symbol, text[:200])
        return await _fallback_analysis(symbol)

    return _parse_analysis_json(parsed, symbol)
