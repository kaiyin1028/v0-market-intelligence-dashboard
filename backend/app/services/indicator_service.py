import numpy as np
import pandas as pd

from app.schemas.indicator import TechnicalIndicators, MACD, BollingerBands, MovingAverages


def compute_indicators(df: pd.DataFrame) -> TechnicalIndicators:
    """Compute technical indicators from a DataFrame with columns: open, high, low, close, volume."""
    close = df["close"]
    high = df["high"]
    low = df["low"]
    volume = df["volume"]

    # Moving Averages
    ma20 = close.rolling(window=20).mean().iloc[-1]
    ma60 = close.rolling(window=60).mean().iloc[-1]
    ma200 = close.rolling(window=120).mean().iloc[-1] if len(close) >= 120 else close.rolling(window=len(close)).mean().iloc[-1]

    # EMA
    ema20 = close.ewm(span=20, adjust=False).mean().iloc[-1]

    # RSI 14
    delta = close.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)
    avg_gain = gain.rolling(window=14).mean().iloc[-1]
    avg_loss = loss.rolling(window=14).mean().iloc[-1]
    if avg_loss == 0 or pd.isna(avg_loss):
        rsi = 100.0
    else:
        rs = avg_gain / avg_loss
        rsi = 100.0 - (100.0 / (1.0 + rs))

    # MACD 12/26/9
    ema12 = close.ewm(span=12, adjust=False).mean()
    ema26 = close.ewm(span=26, adjust=False).mean()
    macd_line = ema12 - ema26
    macd_signal = macd_line.ewm(span=9, adjust=False).mean()
    macd_histogram = macd_line - macd_signal

    # ATR 14
    prev_close = close.shift(1)
    tr1 = high - low
    tr2 = (high - prev_close).abs()
    tr3 = (low - prev_close).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.rolling(window=14).mean().iloc[-1]

    # OBV
    obv = (volume * np.sign(close.diff())).cumsum().iloc[-1]

    # CMF 20
    mfv = ((close - low) - (high - close)) / (high - low).replace(0, np.nan) * volume
    cmf = mfv.rolling(window=20).sum().iloc[-1] / volume.rolling(window=20).sum().iloc[-1]

    # MFI 14
    typical = (high + low + close) / 3.0
    raw_mf = typical * volume
    diff_typical = typical.diff()
    pos_mf = raw_mf.where(diff_typical > 0, 0.0).rolling(window=14).sum().iloc[-1]
    neg_mf = raw_mf.where(diff_typical < 0, 0.0).rolling(window=14).sum().iloc[-1]
    if neg_mf == 0 or pd.isna(neg_mf):
        mfi = 100.0
    else:
        mfr = pos_mf / neg_mf
        mfi = 100.0 - (100.0 / (1.0 + mfr))

    # Bollinger Bands 20,2
    bb_middle = close.rolling(window=20).mean().iloc[-1]
    bb_std = close.rolling(window=20).std().iloc[-1]
    bb_upper = bb_middle + 2 * bb_std
    bb_lower = bb_middle - 2 * bb_std

    # VWAP
    typical_price = (high + low + close) / 3.0
    vwap = (typical_price * volume).cumsum().iloc[-1] / volume.cumsum().iloc[-1]

    # ADX (simple placeholder)
    adx = 25.0

    return TechnicalIndicators(
        rsi=round(float(rsi), 2) if not pd.isna(rsi) else 50.0,
        macd=MACD(
            value=round(float(macd_line.iloc[-1]), 2) if not pd.isna(macd_line.iloc[-1]) else 0.0,
            signal=round(float(macd_signal.iloc[-1]), 2) if not pd.isna(macd_signal.iloc[-1]) else 0.0,
            histogram=round(float(macd_histogram.iloc[-1]), 2) if not pd.isna(macd_histogram.iloc[-1]) else 0.0,
        ),
        adx=round(float(adx), 2),
        atr=round(float(atr), 2) if not pd.isna(atr) else 0.0,
        obv=int(obv) if not pd.isna(obv) else 0,
        cmf=round(float(cmf), 4) if not pd.isna(cmf) else 0.0,
        bollingerBands=BollingerBands(
            upper=round(float(bb_upper), 2) if not pd.isna(bb_upper) else 0.0,
            middle=round(float(bb_middle), 2) if not pd.isna(bb_middle) else 0.0,
            lower=round(float(bb_lower), 2) if not pd.isna(bb_lower) else 0.0,
        ),
        movingAverages=MovingAverages(
            ma20=round(float(ma20), 2) if not pd.isna(ma20) else 0.0,
            ma60=round(float(ma60), 2) if not pd.isna(ma60) else 0.0,
            ma200=round(float(ma200), 2) if not pd.isna(ma200) else 0.0,
        ),
        vwap=round(float(vwap), 2) if not pd.isna(vwap) else 0.0,
    )
