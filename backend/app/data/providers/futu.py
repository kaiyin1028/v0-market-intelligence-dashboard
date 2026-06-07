import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any

from app.core.config import settings
from app.data.providers.base import DataProvider

logger = logging.getLogger(__name__)

# Symbol format mapping: AAPL -> US.AAPL
_MARKET_PREFIXES = {
    "US": "US",
    "HK": "HK",
    "SH": "SH",
    "SZ": "SZ",
}

# Timeframe mapping
_TF_MAP = {
    "1m": "K_1M",
    "5m": "K_5M",
    "15m": "K_15M",
    "30m": "K_30M",
    "60m": "K_60M",
    "1h": "K_60M",
    "1d": "K_DAY",
    "1w": "K_WEEK",
    "1M": "K_MON",
}

# Index proxies (Futu may not have SPX directly, use ETFs)
_INDEX_PROXIES = {
    "SPX": "US.SPY",
    "NDX": "US.QQQ",
    "DJI": "US.DIA",
    "VIX": "US.VIX",
}


def _to_futu_symbol(symbol: str) -> str:
    """Convert generic symbol to Futu format."""
    s = symbol.upper().strip()
    if s in _INDEX_PROXIES:
        return _INDEX_PROXIES[s]
    if "." in s:
        return s  # Already in market.symbol format
    # Heuristic: numeric-only symbols are HK; 6-digit SH/SZ; rest are US
    if s.isdigit():
        if len(s) == 5:
            return f"HK.{s.zfill(5)}"
        if len(s) == 6:
            # SH starts with 6, SZ starts with 0/3
            if s.startswith("6"):
                return f"SH.{s}"
            else:
                return f"SZ.{s}"
        return f"HK.{s}"
    return f"US.{s}"


def _from_futu_symbol(futu_symbol: str) -> str:
    """Convert Futu symbol back to generic format."""
    if "." in futu_symbol:
        return futu_symbol.split(".", 1)[1]
    return futu_symbol


def _to_kl_type(timeframe: str) -> str:
    """Map generic timeframe to Futu KLType."""
    return _TF_MAP.get(timeframe.lower(), "K_DAY")


class FutuDataProvider(DataProvider):
    """FutuOpenD data provider.

    Connects to a locally running FutuOpenD daemon via TCP.
    All sync SDK calls are offloaded to a thread pool.
    """

    def __init__(self, host: str | None = None, port: int | None = None) -> None:
        self.host = host or settings.futu_opend_host
        self.port = port or settings.futu_opend_port
        self._quote_ctx: Any = None

    def _ensure_ctx(self) -> Any:
        """Lazy-init OpenQuoteContext with a fast pre-flight TCP check."""
        if self._quote_ctx is None:
            import socket

            try:
                with socket.create_connection((self.host, self.port), timeout=2):
                    pass
            except OSError:
                raise ConnectionError(f"FutuOpenD is not reachable at {self.host}:{self.port}")

            try:
                from futu import OpenQuoteContext

                self._quote_ctx = OpenQuoteContext(host=self.host, port=self.port)
            except Exception as e:
                logger.warning("Failed to connect to FutuOpenD at %s:%s: %s", self.host, self.port, e)
                raise
        return self._quote_ctx

    def close(self) -> None:
        if self._quote_ctx is not None:
            try:
                self._quote_ctx.close()
            except Exception:
                pass
            self._quote_ctx = None

    def __enter__(self) -> "FutuDataProvider":
        return self

    def __exit__(self, *args: Any) -> None:
        self.close()

    async def fetch_ohlcv(self, symbol: str, timeframe: str = "1d", limit: int = 100) -> list[dict[str, Any]]:
        futu_sym = _to_futu_symbol(symbol)
        ktype = _to_kl_type(timeframe)
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=limit * 2)).strftime("%Y-%m-%d")

        def _fetch() -> list[dict[str, Any]]:
            ctx = self._ensure_ctx()
            # futu-api is sync; use the history kline method
            ret, data, _ = ctx.request_history_kline(
                code=futu_sym,
                start=start_date,
                end=end_date,
                ktype=ktype,
                autype="qfq",
            )
            if ret != 0 or data is None or data.empty:
                return []
            # DataFrame columns: code, time_key, open, close, high, low, volume, turnover
            records = []
            for _, row in data.iterrows():
                records.append(
                    {
                        "date": str(row.get("time_key", "")),
                        "open": float(row.get("open", 0)),
                        "high": float(row.get("high", 0)),
                        "low": float(row.get("low", 0)),
                        "close": float(row.get("close", 0)),
                        "volume": int(row.get("volume", 0)),
                    }
                )
            return records[-limit:]

        return await asyncio.to_thread(_fetch)

    async def search(self, query: str) -> list[dict[str, Any]]:
        q = query.upper().strip()

        def _search() -> list[dict[str, Any]]:
            ctx = self._ensure_ctx()
            # Try a direct snapshot first for exact match
            futu_sym = _to_futu_symbol(q)
            ret, data = ctx.get_market_snapshot([futu_sym])
            if ret == 0 and data is not None and not data.empty:
                row = data.iloc[0]
                return [
                    {
                        "ticker": _from_futu_symbol(str(row.get("code", futu_sym))),
                        "name": str(row.get("stock_name", "")),
                        "sector": str(row.get("sector", "")),
                        "exchange": "FUTU",
                    }
                ]
            return []

        return await asyncio.to_thread(_search)

    async def get_snapshot(self, symbol: str) -> dict[str, Any] | None:
        futu_sym = _to_futu_symbol(symbol)

        def _snapshot() -> dict[str, Any] | None:
            ctx = self._ensure_ctx()
            ret, data = ctx.get_market_snapshot([futu_sym])
            if ret != 0 or data is None or data.empty:
                return None
            row = data.iloc[0]
            return {
                "ticker": _from_futu_symbol(str(row.get("code", futu_sym))),
                "name": str(row.get("stock_name", "")),
                "price": float(row.get("last_price", 0)),
                "change": float(row.get("change_val", 0)),
                "changePercent": float(row.get("change_rate", 0)) * 100,
                "volume": int(row.get("volume", 0)),
                "marketCap": float(row.get("market_val", 0)) if "market_val" in row else None,
                "sector": str(row.get("sector", "")),
                "exchange": "NASDAQ" if futu_sym.startswith("US.") else ("HKEX" if futu_sym.startswith("HK.") else "OTHER"),
            }

        return await asyncio.to_thread(_snapshot)

    async def get_snapshots(self, symbols: list[str]) -> list[dict[str, Any]]:
        futu_symbols = [_to_futu_symbol(s) for s in symbols]

        def _snapshots() -> list[dict[str, Any]]:
            ctx = self._ensure_ctx()
            ret, data = ctx.get_market_snapshot(futu_symbols)
            if ret != 0 or data is None or data.empty:
                return []
            results = []
            for _, row in data.iterrows():
                results.append(
                    {
                        "ticker": _from_futu_symbol(str(row.get("code", ""))),
                        "name": str(row.get("stock_name", "")),
                        "price": float(row.get("last_price", 0)),
                        "change": float(row.get("change_val", 0)),
                        "changePercent": float(row.get("change_rate", 0)) * 100,
                        "volume": int(row.get("volume", 0)),
                        "marketCap": float(row.get("market_val", 0)) if "market_val" in row else None,
                        "sector": str(row.get("sector", "")),
                        "exchange": "NASDAQ" if str(row.get("code", "")).startswith("US.") else "OTHER",
                    }
                )
            return results

        return await asyncio.to_thread(_snapshots)
