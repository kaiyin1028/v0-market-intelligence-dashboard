import pytest

from app.services.breakout_service import analyze_breakout, _grade


FAKE_OHLCV = [
    {"date": "2024-01-01", "open": 100.0, "high": 101.0, "low": 99.0, "close": 100.5, "volume": 1000000}
    for _ in range(60)
]


async def _fake_fetch(*a, **kw):
    return FAKE_OHLCV


@pytest.mark.asyncio
async def test_true_breakout_score_formula(monkeypatch):
    monkeypatch.setattr("app.services.futu_service.fetch_ohlcv", _fake_fetch)
    result = await analyze_breakout(
        "AAPL",
        "1d",
        volume_confirmation=80,
        close_strength=80,
        level_importance=80,
        obv_confirmation=80,
        rsi_strength=80,
        macd_confirmation=80,
        low_upper_chip_pressure=80,
        sector_confirmation=80,
        market_confirmation=80,
    )
    # All inputs 80 -> score should be 80.0
    assert result.analysis.trueBreakoutScore == 80.0


@pytest.mark.asyncio
async def test_false_breakout_risk_formula(monkeypatch):
    monkeypatch.setattr("app.services.futu_service.fetch_ohlcv", _fake_fetch)
    result = await analyze_breakout(
        "AAPL",
        "1d",
        insufficient_volume_score=50,
        weak_close_score=50,
        upper_shadow_score=50,
        obv_non_confirmation_score=50,
        rsi_bearish_divergence_score=50,
        upper_chip_pressure_score=50,
        sector_weakness_score=50,
        market_weakness_score=50,
        excessive_atr_score=50,
    )
    # All inputs 50 -> risk should be 50.0
    assert result.analysis.falseBreakoutRisk == 50.0


@pytest.mark.asyncio
async def test_grade_mapping(monkeypatch):
    monkeypatch.setattr("app.services.futu_service.fetch_ohlcv", _fake_fetch)
    high = await analyze_breakout("AAPL", "1d", volume_confirmation=90, close_strength=90)
    assert high.grade in {"A", "B"}
    low = await analyze_breakout("AAPL", "1d", volume_confirmation=20, close_strength=20)
    assert low.grade in {"D", "F"}


def test_grade_direct():
    assert _grade(85) == "A"
    assert _grade(70) == "B"
    assert _grade(55) == "C"
    assert _grade(40) == "D"
    assert _grade(20) == "F"
