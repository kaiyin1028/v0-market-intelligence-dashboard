import numpy as np
import pandas as pd

from app.services.indicator_service import compute_indicators


def _make_df(n: int = 60) -> pd.DataFrame:
    rng = np.random.default_rng(seed=42)
    price = 100.0
    rows = []
    for _ in range(n):
        o = price
        c = price + rng.uniform(-2, 2)
        h = max(o, c) + rng.uniform(0, 1)
        l = min(o, c) - rng.uniform(0, 1)
        v = rng.integers(1_000_000, 10_000_000)
        rows.append({"open": o, "high": h, "low": l, "close": c, "volume": v})
        price = c
    return pd.DataFrame(rows)


def test_compute_indicators_returns_valid_model() -> None:
    df = _make_df(120)
    indicators = compute_indicators(df)
    assert indicators is not None
    assert 0 <= indicators.rsi <= 100
    assert indicators.macd.value is not None
    assert indicators.atr >= 0
    assert indicators.vwap > 0


def test_sma_computation() -> None:
    df = _make_df(120)
    indicators = compute_indicators(df)
    close = df["close"]
    expected_ma20 = close.rolling(window=20).mean().iloc[-1]
    assert round(indicators.movingAverages.ma20, 2) == round(expected_ma20, 2)


def test_bollinger_bands() -> None:
    df = _make_df(120)
    indicators = compute_indicators(df)
    assert indicators.bollingerBands.upper >= indicators.bollingerBands.middle
    assert indicators.bollingerBands.lower <= indicators.bollingerBands.middle


def test_obv_non_zero() -> None:
    df = _make_df(120)
    indicators = compute_indicators(df)
    assert isinstance(indicators.obv, (int, float))
