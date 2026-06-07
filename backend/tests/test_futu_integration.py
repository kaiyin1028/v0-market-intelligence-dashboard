from unittest.mock import MagicMock, patch

import pytest

from app.data.providers.futu import FutuDataProvider, _to_futu_symbol, _from_futu_symbol
from app.services import futu_service


@pytest.fixture
def patch_socket():
    """Patch socket.create_connection so FutuDataProvider TCP pre-flight passes."""
    with patch("socket.create_connection") as mock_sock:
        mock_sock.return_value.__enter__ = lambda s: s
        mock_sock.return_value.__exit__ = lambda *args: None
        yield mock_sock


class TestSymbolMapping:
    def test_us_stock(self):
        assert _to_futu_symbol("AAPL") == "US.AAPL"
        assert _to_futu_symbol("TSLA") == "US.TSLA"

    def test_hk_stock(self):
        assert _to_futu_symbol("00700") == "HK.00700"

    def test_sh_stock(self):
        assert _to_futu_symbol("600519") == "SH.600519"

    def test_sz_stock(self):
        assert _to_futu_symbol("000001") == "SZ.000001"

    def test_index_proxy(self):
        assert _to_futu_symbol("SPX") == "US.SPY"
        assert _to_futu_symbol("NDX") == "US.QQQ"

    def test_from_futu_symbol(self):
        assert _from_futu_symbol("US.AAPL") == "AAPL"
        assert _from_futu_symbol("HK.00700") == "00700"


class TestFutuDataProvider:
    @pytest.mark.asyncio
    @patch("futu.OpenQuoteContext")
    async def test_get_snapshot_success(self, mock_open_ctx, patch_socket):
        ctx = MagicMock()
        mock_open_ctx.return_value = ctx
        row = {
            "code": "US.AAPL",
            "stock_name": "Apple Inc",
            "last_price": 189.84,
            "change_val": 2.45,
            "change_rate": 0.0131,
            "volume": 52345678,
            "market_val": 2.95e12,
            "sector": "Technology",
        }
        mock_df = MagicMock()
        mock_df.empty = False
        mock_df.iloc = {0: row}
        mock_df.__getitem__ = lambda _self, key: row.get(key)
        mock_df.iterrows.return_value = iter([(0, row)])
        ctx.get_market_snapshot.return_value = (0, mock_df)

        provider = FutuDataProvider()
        result = await provider.get_snapshot("AAPL")
        assert result is not None
        assert result["ticker"] == "AAPL"
        assert result["price"] == 189.84
        assert result["changePercent"] == pytest.approx(1.31)

    @pytest.mark.asyncio
    @patch("futu.OpenQuoteContext")
    async def test_get_snapshot_failure(self, mock_open_ctx, patch_socket):
        ctx = MagicMock()
        mock_open_ctx.return_value = ctx
        ctx.get_market_snapshot.return_value = (-1, None)

        provider = FutuDataProvider()
        result = await provider.get_snapshot("UNKNOWN")
        assert result is None

    @pytest.mark.asyncio
    @patch("futu.OpenQuoteContext")
    async def test_fetch_ohlcv_success(self, mock_open_ctx, patch_socket):
        ctx = MagicMock()
        mock_open_ctx.return_value = ctx
        mock_df = MagicMock()
        mock_df.empty = False
        mock_df.iterrows.return_value = iter([
            (0, {"time_key": "2024-01-01", "open": 100.0, "close": 101.0, "high": 102.0, "low": 99.0, "volume": 1000000}),
            (1, {"time_key": "2024-01-02", "open": 101.0, "close": 102.0, "high": 103.0, "low": 100.0, "volume": 1200000}),
        ])
        ctx.request_history_kline.return_value = (0, mock_df, None)

        provider = FutuDataProvider()
        result = await provider.fetch_ohlcv("AAPL", "1d", limit=2)
        assert len(result) == 2
        assert result[0]["date"] == "2024-01-01"
        assert result[0]["close"] == 101.0


class TestFutuService:
    def test_is_available_when_no_provider(self):
        import asyncio
        result = asyncio.run(futu_service.is_available())
        assert result is False

    def test_search_stocks_when_offline(self):
        import asyncio
        result = asyncio.run(futu_service.search_stocks("AAPL"))
        assert result is None
