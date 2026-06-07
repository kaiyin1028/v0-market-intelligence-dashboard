import numpy as np
import pandas as pd

from app.schemas.volume_profile import VolumeProfileItem, ChipDistribution, VolumeProfileResponse


def compute_volume_profile(df: pd.DataFrame, num_bins: int = 20) -> VolumeProfileResponse:
    """Compute volume profile from OHLCV DataFrame."""
    close = df["close"].values
    high = df["high"].values
    low = df["low"].values
    volume = df["volume"].values

    typical = (high + low + close) / 3.0
    price_min = typical.min()
    price_max = typical.max()
    if price_max == price_min:
        price_max += 0.01

    bins = np.linspace(price_min, price_max, num_bins + 1)
    bin_centers = (bins[:-1] + bins[1:]) / 2.0

    volumes = np.zeros(num_bins)
    buy_volumes = np.zeros(num_bins)
    sell_volumes = np.zeros(num_bins)

    for i in range(len(df)):
        idx = np.digitize(typical[i], bins) - 1
        idx = max(0, min(idx, num_bins - 1))
        vol = float(volume[i])
        volumes[idx] += vol
        if close[i] >= typical[i]:
            buy_volumes[idx] += vol * 0.55
            sell_volumes[idx] += vol * 0.45
        else:
            buy_volumes[idx] += vol * 0.45
            sell_volumes[idx] += vol * 0.55

    # POC
    poc_idx = int(np.argmax(volumes))
    poc = float(bin_centers[poc_idx])

    # VAH / VAL using 70% value area
    total_volume = volumes.sum()
    sorted_indices = np.argsort(volumes)[::-1]
    cumulative = 0.0
    value_area_indices = set()
    for idx in sorted_indices:
        cumulative += volumes[idx]
        value_area_indices.add(idx)
        if cumulative >= total_volume * 0.70:
            break
    if value_area_indices:
        vah = float(bin_centers[max(value_area_indices)])
        val = float(bin_centers[min(value_area_indices)])
    else:
        vah = float(bin_centers[-1])
        val = float(bin_centers[0])

    # HVN / LVN
    mean_vol = volumes.mean()
    std_vol = volumes.std()
    hvn = [float(bin_centers[i]) for i in range(num_bins) if volumes[i] > mean_vol + 0.5 * std_vol]
    lvn = [float(bin_centers[i]) for i in range(num_bins) if volumes[i] < mean_vol - 0.5 * std_vol]

    current_price = float(close[-1])

    # chip concentration: how much volume is near POC relative to range
    poc_range = (price_max - price_min) * 0.15
    near_poc_mask = np.abs(bin_centers - poc) <= poc_range
    chip_concentration = float(volumes[near_poc_mask].sum() / total_volume * 100)

    # upper trapped chip pressure: volume above current price
    above_mask = bin_centers > current_price
    upper_trapped = float(volumes[above_mask].sum() / total_volume * 100) if above_mask.any() else 0.0

    # lower support density: volume below current price
    below_mask = bin_centers < current_price
    lower_support = float(volumes[below_mask].sum() / total_volume * 100) if below_mask.any() else 0.0

    profile = [
        VolumeProfileItem(
            priceLevel=round(float(bin_centers[i]), 2),
            volume=round(float(volumes[i]), 2),
            buyVolume=round(float(buy_volumes[i]), 2),
            sellVolume=round(float(sell_volumes[i]), 2),
        )
        for i in range(num_bins)
    ]

    chip = ChipDistribution(
        poc=round(poc, 2),
        vah=round(vah, 2),
        val=round(val, 2),
        hvn=[round(x, 2) for x in hvn],
        lvn=[round(x, 2) for x in lvn],
        chipPressure=round(upper_trapped, 2),
        upperTrappedChips=round(upper_trapped, 2),
        lowerSupportDensity=round(lower_support, 2),
    )

    return VolumeProfileResponse(
        symbol="SYMBOL",
        timeframe="1d",
        lookback=len(df),
        profile=profile,
        chipDistribution=chip,
    )
