# Market Intelligence Quant API

FastAPI backend for the Market Intelligence Quant Dashboard.

## Stack

- Python 3.10+
- FastAPI + Uvicorn
- Pydantic v2
- SQLAlchemy 2.0 + Alembic
- PostgreSQL (TimescaleDB compatible schema)
- Redis
- Qdrant (placeholder in Phase 1)
- pandas + numpy (no TA-Lib in Phase 1)
- Ollama HTTP integration
- FutuOpenD real-time market data (futu-api SDK)

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
```

## Run

```bash
uvicorn app.main:app --host 0.0.0.0 --port 6061 --reload
```

Open API docs at: http://localhost:6061/docs

## Docker services

```bash
cd backend
docker compose up -d
```

This starts PostgreSQL, Redis, and Qdrant.

## Tests

```bash
cd backend
pytest tests/ -v
```

## FutuOpenD (Real-Time Data)

FutuOpenD provides live stock snapshots and historical OHLCV. Install it separately:

1. Download from [Futu OpenAPI](https://www.futunn.com/download/OpenAPI)
2. Start the daemon and log in with your Futu account
3. Backend connects automatically via `127.0.0.1:11111`

If FutuOpenD is offline, services fall back to synthetic mock data automatically.

## Jetson AGX notes

- Use the standard `postgres` image in docker-compose.yml. TimescaleDB ARM64 images may not be available for Jetson.
- Ollama is NOT included in docker-compose. Install Ollama manually on Jetson with GPU support.
- Avoid fragile native dependencies (no TA-Lib in Phase 1).
- Use pandas/numpy for all indicator math.
