"""Data cleaning utilities placeholder."""

import pandas as pd


def clean_ohlcv(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    for col in ["open", "high", "low", "close", "volume"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    df = df.dropna(subset=["open", "high", "low", "close", "volume"])
    df = df[df["high"] >= df["low"]]
    df = df[df["volume"] > 0]
    return df
