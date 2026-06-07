import pytest

from app.services.signal_service import compute_signal


FAKE_OHLCV = [
    {"date": "2024-01-01", "open": 100.0, "high": 101.0, "low": 99.0, "close": 100.5, "volume": 1000000}
    for _ in range(60)
]


async def _fake_fetch(*a, **kw):
    return FAKE_OHLCV


@pytest.mark.asyncio
async def test_signal_computes_scores(monkeypatch):
    monkeypatch.setattr("app.services.futu_service.fetch_ohlcv", _fake_fetch)
    signal = await compute_signal()
    assert 0 <= signal.buyScore <= 100
    assert 0 <= signal.sellScore <= 100


@pytest.mark.asyncio
async def test_signal_has_targets_and_stop(monkeypatch):
    monkeypatch.setattr("app.services.futu_service.fetch_ohlcv", _fake_fetch)
    signal = await compute_signal()
    assert signal.stopLoss > 0
    assert len(signal.targets) >= 1
    assert signal.riskRewardRatio > 0
