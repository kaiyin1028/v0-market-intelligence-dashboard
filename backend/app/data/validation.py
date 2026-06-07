"""Data validation utilities placeholder."""

import pandas as pd


def validate_ohlcv(df: pd.DataFrame) -> tuple[bool, list[str]]:
    errors: list[str] = []
    required = {"open", "high", "low", "close", "volume"}
    missing = required - set(df.columns)
    if missing:
        errors.append(f"Missing columns: {missing}")
    if not df.empty and (df["high"] < df["low"]).any():
        errors.append("High < Low found")
    if not df.empty and (df["volume"] <= 0).any():
        errors.append("Non-positive volume found")
    return len(errors) == 0, errors
