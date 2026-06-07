from datetime import datetime
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.services import stock_service
from app.api.routes import stocks as stocks_routes

client = TestClient(app)


def test_get_db_candles_returns_data(seeded_session):
    with patch.object(stock_service, "SessionLocal", return_value=seeded_session):
        candles = stock_service.get_db_candles("TEST", days=10)
    assert candles is not None
    assert len(candles) == 10
    # get_db_candles orders desc, limits, then reverses -> oldest of the 10 most recent
    assert candles[0].date == "2024-01-21"


def test_get_db_candles_returns_none_for_missing_symbol(db_session):
    with patch.object(stock_service, "SessionLocal", return_value=db_session):
        candles = stock_service.get_db_candles("UNKNOWN", days=10)
    assert candles is None


def test_get_db_indicators_returns_data(seeded_session):
    with patch.object(stock_service, "SessionLocal", return_value=seeded_session):
        indicators = stock_service.get_db_indicators("TEST")
    assert indicators is not None
    assert indicators.rsi == 55.5
    assert indicators.macd.value == 1.2
    assert indicators.macd.signal == 0.8
    assert indicators.bollingerBands.upper == 110.0
    assert indicators.movingAverages.ma20 == 105.0
    assert indicators.vwap == 104.0


def test_get_db_indicators_returns_none_for_missing_symbol(db_session):
    with patch.object(stock_service, "SessionLocal", return_value=db_session):
        indicators = stock_service.get_db_indicators("UNKNOWN")
    assert indicators is None


def test_stock_candles_endpoint_uses_database(monkeypatch):
    fake_candles = [
        stock_service.CandlestickData(
            date="2024-01-01", open=100.0, high=101.0, low=99.0, close=100.5, volume=1000000
        )
    ]
    monkeypatch.setattr(stocks_routes, "get_db_candles", lambda sym, days=120: fake_candles)
    response = client.get("/api/v1/stocks/TEST/candles?limit=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["date"] == "2024-01-01"


async def _empty_candles(sym: str, days: int = 120) -> list:
    return []


def test_stock_candles_endpoint_returns_empty_when_no_data(monkeypatch):
    monkeypatch.setattr(stocks_routes, "get_db_candles", lambda sym, days=120: None)
    monkeypatch.setattr(stocks_routes, "generate_candles", _empty_candles)
    response = client.get("/api/v1/stocks/AAPL/candles?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0


def test_stock_analysis_endpoint_uses_database(monkeypatch):
    fake_stock = stock_service.StockOverview(
        ticker="AAPL", name="Apple Inc.", price=200.0, change=1.0, changePercent=0.5, volume=1000000, marketCap=1e12, sector="Technology"
    )
    fake_candles = [
        stock_service.CandlestickData(
            date=(datetime(2024, 1, 1)).strftime("%Y-%m-%d"),
            open=100.0,
            high=101.0,
            low=99.0,
            close=100.5,
            volume=1000000,
        )
        for _ in range(120)
    ]
    fake_indicators = stock_service.TechnicalIndicators(
        rsi=55.5,
        macd=stock_service.MACD(value=1.2, signal=0.8, histogram=0.4),
        adx=25.0,
        atr=2.5,
        obv=500000,
        cmf=0.15,
        bollingerBands=stock_service.BollingerBands(upper=110.0, middle=105.0, lower=100.0),
        movingAverages=stock_service.MovingAverages(ma20=105.0, ma60=102.0, ma200=100.0),
        vwap=104.0,
    )
    async def _mock_overview(sym: str):
        return fake_stock
    monkeypatch.setattr(stocks_routes, "get_stock_overview", _mock_overview)
    monkeypatch.setattr(stocks_routes, "get_db_candles", lambda sym, days=120: fake_candles)
    monkeypatch.setattr(stocks_routes, "get_db_indicators", lambda sym: fake_indicators)
    response = client.get("/api/v1/stocks/AAPL/analysis")
    assert response.status_code == 200
    data = response.json()
    assert data["indicators"]["rsi"] == 55.5
    assert data["indicators"]["macd"]["value"] == 1.2
    assert len(data["candlestickData"]) == 120


async def _none_overview(sym: str):
    return None


def test_stock_analysis_endpoint_returns_404_when_no_data(monkeypatch):
    monkeypatch.setattr(stocks_routes, "get_stock_overview", _none_overview)
    response = client.get("/api/v1/stocks/AAPL/analysis")
    assert response.status_code == 404
