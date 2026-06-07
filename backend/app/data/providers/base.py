from abc import ABC, abstractmethod
from typing import Any


class DataProvider(ABC):
    @abstractmethod
    async def fetch_ohlcv(self, symbol: str, timeframe: str = "1d", limit: int = 100) -> list[dict[str, Any]]:
        pass

    @abstractmethod
    async def search(self, query: str) -> list[dict[str, Any]]:
        pass
