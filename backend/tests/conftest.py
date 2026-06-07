import os
from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app.core.database import Base
from app.main import app
from app.models.asset import Asset
from app.models.candle import Candle
from app.models.indicator import TechnicalIndicator


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def mock_futu_offline(monkeypatch):
    """Globally disable FutuOpenD connections in tests to prevent hangs."""
    monkeypatch.setattr("app.services.futu_service._get_futu_provider", lambda: None)
    monkeypatch.setattr("app.services.futu_service._get_yahoo_provider", lambda: None)


@pytest.fixture
def seeded_session(db_session):
    asset = Asset(
        id="test-asset-1",
        symbol="TEST",
        name="Test Corp",
        asset_type="stock",
        exchange="NASDAQ",
        currency="USD",
        sector="Technology",
        is_active=True,
    )
    db_session.add(asset)
    db_session.commit()

    base_date = datetime(2024, 1, 1)
    for i in range(30):
        db_session.add(
            Candle(
                asset_id=asset.id,
                timeframe="1d",
                timestamp=base_date + timedelta(days=i),
                open=100.0 + i,
                high=101.0 + i,
                low=99.0 + i,
                close=100.5 + i,
                volume=1000000.0 + i * 1000,
            )
        )

    db_session.add(
        TechnicalIndicator(
            asset_id=asset.id,
            timeframe="1d",
            timestamp=datetime.utcnow(),
            ma20=105.0,
            ma60=102.0,
            ma200=100.0,
            rsi14=55.5,
            macd_line=1.2,
            macd_signal=0.8,
            macd_histogram=0.4,
            adx=25.0,
            atr=2.5,
            obv=500000.0,
            cmf=0.15,
            bollinger_upper=110.0,
            bollinger_middle=105.0,
            bollinger_lower=100.0,
            vwap=104.0,
        )
    )
    db_session.commit()
    return db_session
