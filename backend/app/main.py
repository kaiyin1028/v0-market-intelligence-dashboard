from fastapi import FastAPI

from app.core.config import settings
from app.core.cors import add_cors
from app.core.logging import setup_logging
from app.api.routes import (
    health,
    market,
    stocks,
    indicators,
    volume_profile,
    breakouts,
    signals,
    backtesting,
    ai,
    settings as settings_route,
)

setup_logging()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Market Intelligence Quant Dashboard API",
    docs_url="/docs",
    redoc_url="/redoc",
)

add_cors(app)

app.include_router(health.router, prefix="/api/v1")
app.include_router(health.router)
app.include_router(market.router, prefix=settings.api_v1_prefix)
app.include_router(stocks.router, prefix=settings.api_v1_prefix)
app.include_router(indicators.router, prefix=settings.api_v1_prefix)
app.include_router(volume_profile.router, prefix=settings.api_v1_prefix)
app.include_router(breakouts.router, prefix=settings.api_v1_prefix)
app.include_router(signals.router, prefix=settings.api_v1_prefix)
app.include_router(backtesting.router, prefix=settings.api_v1_prefix)
app.include_router(ai.router, prefix=settings.api_v1_prefix)
app.include_router(settings_route.router, prefix=settings.api_v1_prefix)


@app.get("/", tags=["root"])
async def root() -> dict:
    return {"app": settings.app_name, "version": "0.1.0", "docs": "/docs"}
