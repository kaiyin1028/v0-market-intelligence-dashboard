import numpy as np
import pandas as pd

from app.services.volume_profile_service import compute_volume_profile


def _make_df(n: int = 100) -> pd.DataFrame:
    rng = np.random.default_rng(seed=7)
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


def test_volume_profile_structure() -> None:
    df = _make_df(100)
    vp = compute_volume_profile(df, num_bins=20)
    assert len(vp.profile) == 20
    assert vp.chipDistribution.poc > 0
    assert vp.chipDistribution.vah >= vp.chipDistribution.val


def test_chip_scores_in_range() -> None:
    df = _make_df(100)
    vp = compute_volume_profile(df, num_bins=20)
    assert 0 <= vp.chipDistribution.chipPressure <= 100
    assert 0 <= vp.chipDistribution.upperTrappedChips <= 100
    assert 0 <= vp.chipDistribution.lowerSupportDensity <= 100
