import logging
from typing import Any

from app.core.config import settings
from app.data.providers.futu import FutuDataProvider
from app.data.providers.yahoo import YahooFinanceProvider

logger = logging.getLogger(__name__)

_futu_provider: FutuDataProvider | None = None
_yahoo_provider: YahooFinanceProvider | None = None


def _get_futu_provider() -> FutuDataProvider | None:
    global _futu_provider
    if not settings.futu_enabled:
        return None
    if _futu_provider is None:
        try:
            _futu_provider = FutuDataProvider()
        except Exception as e:
            logger.warning("FutuOpenD not available: %s", e)
            return None
    return _futu_provider


def _get_yahoo_provider() -> YahooFinanceProvider | None:
    global _yahoo_provider
    if not settings.yahoo_enabled:
        return None
    if _yahoo_provider is None:
        _yahoo_provider = YahooFinanceProvider()
    return _yahoo_provider


def close_providers() -> None:
    global _futu_provider, _yahoo_provider
    if _futu_provider is not None:
        _futu_provider.close()
        _futu_provider = None
    _yahoo_provider = None


async def is_available() -> bool:
    """Check if any market data provider is reachable."""
    futu = _get_futu_provider()
    if futu is not None:
        try:
            result = await futu.get_snapshot("SPY")
            if result is not None:
                return True
        except Exception as e:
            logger.debug("Futu availability check failed: %s", e)

    yahoo = _get_yahoo_provider()
    if yahoo is not None:
        try:
            result = await yahoo.get_snapshot("SPY")
            if result is not None:
                return True
        except Exception as e:
            logger.debug("Yahoo availability check failed: %s", e)

    return False


async def search_stocks(query: str) -> list[dict[str, Any]] | None:
    futu = _get_futu_provider()
    if futu is not None:
        try:
            result = await futu.search(query)
            if result:
                return result
        except Exception as e:
            logger.warning("Futu search failed: %s", e)

    yahoo = _get_yahoo_provider()
    if yahoo is not None:
        try:
            result = await yahoo.search(query)
            if result:
                return result
        except Exception as e:
            logger.warning("Yahoo search failed: %s", e)

    return None


async def get_snapshot(symbol: str) -> dict[str, Any] | None:
    futu = _get_futu_provider()
    if futu is not None:
        try:
            result = await futu.get_snapshot(symbol)
            if result is not None:
                return result
        except Exception as e:
            logger.warning("Futu snapshot failed for %s: %s", symbol, e)

    yahoo = _get_yahoo_provider()
    if yahoo is not None:
        try:
            result = await yahoo.get_snapshot(symbol)
            if result is not None:
                return result
        except Exception as e:
            logger.warning("Yahoo snapshot failed for %s: %s", symbol, e)

    return None


async def get_snapshots(symbols: list[str]) -> list[dict[str, Any]] | None:
    futu = _get_futu_provider()
    if futu is not None:
        try:
            result = await futu.get_snapshots(symbols)
            if result:
                return result
        except Exception as e:
            logger.warning("Futu snapshots failed: %s", e)

    yahoo = _get_yahoo_provider()
    if yahoo is not None:
        try:
            result = await yahoo.get_snapshots(symbols)
            if result:
                return result
        except Exception as e:
            logger.warning("Yahoo snapshots failed: %s", e)

    return None


async def fetch_ohlcv(symbol: str, timeframe: str = "1d", limit: int = 100) -> list[dict[str, Any]] | None:
    futu = _get_futu_provider()
    if futu is not None:
        try:
            result = await futu.fetch_ohlcv(symbol, timeframe, limit)
            if result:
                return result
        except Exception as e:
            logger.warning("Futu OHLCV failed for %s: %s", symbol, e)

    yahoo = _get_yahoo_provider()
    if yahoo is not None:
        try:
            result = await yahoo.fetch_ohlcv(symbol, timeframe, limit)
            if result:
                return result
        except Exception as e:
            logger.warning("Yahoo OHLCV failed for %s: %s", symbol, e)

    return None


async def fetch_ohlcv_batch(
    symbols: list[str], timeframe: str = "1d", limit: int = 100
) -> dict[str, list[dict[str, Any]]] | None:
    """Batch-fetch OHLCV for multiple symbols (Yahoo-only)."""
    yahoo = _get_yahoo_provider()
    if yahoo is not None:
        try:
            result = await yahoo.fetch_ohlcv_batch(symbols, timeframe, limit)
            if result:
                return result
        except Exception as e:
            logger.warning("Yahoo batch OHLCV failed: %s", e)
    return None
