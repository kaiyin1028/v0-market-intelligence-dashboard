# Market Intelligence Quant Dashboard (Fullstack)

A production-ready fullstack monorepo for quantitative market intelligence.

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS (v0.app generated)
- **Backend**: FastAPI + Pydantic v2 + SQLAlchemy 2.0 + pandas/numpy

## Architecture

```
market-intelligence-fullstack/
├── app/                  # Next.js frontend
├── components/           # React components
├── lib/                  # Frontend utilities (api client)
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/routes/   # REST endpoints
│   │   ├── core/         # Config, DB, CORS, logging
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   ├── data/         # Data providers
│   │   └── jobs/         # Background jobs
│   ├── tests/            # pytest suite
│   ├── docker-compose.yml
│   └── Dockerfile
```

## Port Map

| Service                | Port  |
| ---------------------- | ----- |
| Frontend (Next.js)     | 6060  |
| Backend (FastAPI)      | 6061  |
| PostgreSQL             | 5433  |
| Redis                  | 6379  |
| Qdrant                 | 6333  |
| Ollama (host)          | 11434 |
| FutuOpenD (host)       | 11111 |

## Quick Start

### Clone

```bash
git clone https://github.com/kaiyin1028/v0-market-intelligence-dashboard market-intelligence-fullstack
cd market-intelligence-fullstack
```

### Frontend

```bash
pnpm install
cp .env.local.example .env.local
pnpm dev
# opens http://localhost:6060
```

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 6061 --reload
# opens http://localhost:6061/docs
```

### Docker services

```bash
cd backend
docker compose up -d
```

### Database Setup

```bash
cd backend
docker compose up -d          # Start PostgreSQL on port 5433
alembic upgrade head          # Run migrations
python scripts/seed_mock_data.py  # Seed 2 years of synthetic OHLCV + indicators
```

The seed script populates the following assets: **AAPL, MSFT, NVDA, TSLA, AMD, SPY, QQQ**.

When the database contains seeded data, the stock analysis and candles endpoints automatically read from PostgreSQL. If the database is empty or unreachable, they fall back to the in-memory mock generators.

## Environment Variables

### Frontend `.env.local`

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:6061/api/v1
NEXT_PUBLIC_APP_NAME=Market Intelligence Quant Dashboard
```

### Backend `.env`

```
APP_NAME=Market Intelligence Quant API
APP_ENV=development
API_V1_PREFIX=/api/v1
BACKEND_HOST=0.0.0.0
BACKEND_PORT=6061
FRONTEND_ORIGIN=http://localhost:6060

DATABASE_URL=postgresql+psycopg://market_user:market_password@localhost:5433/market_intelligence
REDIS_URL=redis://localhost:6379/0
QDRANT_URL=http://localhost:6333
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=qwen2.5
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

FUTU_OPEND_HOST=127.0.0.1
FUTU_OPEND_PORT=11111
FUTU_ENABLED=true
```

## Tests

```bash
cd backend
pytest tests/ -v
```

## Jetson AGX Notes

- Ubuntu 22.04 ARM64 environment.
- Avoid fragile native dependencies in Phase 1 (no TA-Lib).
- Use pandas and numpy for all indicator calculations.
- The provided `docker-compose.yml` uses the standard `postgres:16` image. TimescaleDB official ARM64 images may not work on Jetson; build from source if you need TimescaleDB specifically.
- See **Ollama Setup on Jetson** below for LLM installation.
- Python 3.10+ is required.

## Ollama Setup on Jetson

Ollama powers the local LLM features (AI analyst chat, stock analysis, signal explanation, market summary). It is **not** included in Docker Compose and must run on the host to access the Jetson GPU.

### 1. Install Ollama

Follow the Jetson-specific instructions (e.g., from [jetson-ai-lab](https://jetson-ai-lab.com) or NVIDIA forums) to install Ollama with CUDA/Jetson support.

### 2. Pull Required Models

```bash
ollama pull qwen2.5
ollama pull nomic-embed-text
```

- `qwen2.5` — Default chat/analysis model (configurable via `OLLAMA_CHAT_MODEL`)
- `nomic-embed-text` — Embedding model for RAG features

### 3. Start Ollama

```bash
ollama serve
```

Ensure it listens on `0.0.0.0:11434` (default). The backend connects via `OLLAMA_BASE_URL`.

### 4. Verify

```bash
curl http://localhost:11434/api/tags
```

You should see `qwen2.5` in the list of available models.

## FutuOpenD Setup (Real-Time Market Data)

FutuOpenD powers real-time market data (stock snapshots, OHLCV candles, indices). It runs as a local daemon and connects to Futu Securities' servers. When FutuOpenD is offline, the system automatically falls back to synthetic mock data.

### 1. Install FutuOpenD

Download and install **FutuOpenD** from the [Futu official website](https://www.futunn.com/download/OpenAPI) for your platform (macOS, Windows, or Linux).

### 2. Log In

Start FutuOpenD and log in with your Futu Securities account. No credentials are stored in code — the backend connects to the local daemon via TCP.

### 3. Verify Connection

```bash
curl http://localhost:11111
```

You should receive a response indicating the OpenD daemon is listening.

### 4. Environment Variables (optional)

```bash
# backend/.env
FUTU_OPEND_HOST=127.0.0.1
FUTU_OPEND_PORT=11111
FUTU_ENABLED=true
```

### Real-Time Data Status Badge

The dashboard displays a live data source indicator:

- **Green / 即時數據模式** — FutuOpenD is connected; market data is live
- **Amber / 模擬數據模式** — FutuOpenD is offline; displaying synthetic mock data

### AI Status Badge

The TopBar displays a live Ollama status indicator (polled every 15s):

- **Green / Ollama 線上** — Model loaded and responding
- **Amber / Ollama 降級** — Server reachable but default model missing
- **Gray / Ollama 離線** — Server unreachable

When Ollama is offline, all AI endpoints return structured mock responses so the UI never breaks.

## Frontend ↔ Backend Integration

The Next.js frontend connects to the FastAPI backend via typed API client functions in `lib/api.ts`. Every page that displays market data now calls the backend first and falls back to local mock data automatically if the backend is unreachable.

### API Client (`lib/api.ts`)

- `getMarketOverview()` — Dashboard indices, summary, heatmap, signals
- `getStockAnalysis(symbol, timeframe)` — Candlestick, indicators, volume profile, chip distribution, breakout analysis, signal data, AI analysis
- `getBreakoutScanner(filters?)` — Breakout scan results
- `getSignals(signalType?)` — Trade signals feed
- `runBacktest(params)` — Strategy backtesting
- `askAIAnalyst(message, context?)` — AI chat analyst

All functions use `withFallback<T>(fetcher, fallback)` so the UI never breaks when the backend is down.

### Connection Status Indicator

The TopBar displays a live API status badge (polled every 10s via `useApiStatus`):

- **Green / 已連線** — Backend is reachable
- **Amber / 模擬模式** — Backend is down, mock fallback is active
- **Red / 未連線** — Backend unavailable and no fallback data loaded yet

### Per-Page API Usage

| Page | API Called | Fallback |
|------|-----------|----------|
| Dashboard | `getMarketOverview()` | Mock market indices & summary |
| Stock Analysis | `getStockAnalysis()` | Mock candlestick, volume, chip data |
| Breakout Scanner | `getBreakoutScanner()` | Mapped mock scan results |
| Signal Hub | `getSignals()` | Mapped mock trade signals |
| Backtest | `runBacktest()` | Client-generated mock metrics |
| AI Analyst | `askAIAnalyst()` | Local rule-based mock replies |

### Environment Variable

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:6061/api/v1
```

### CORS

The backend allows `http://localhost:6060` by default. If you change the frontend port, update `FRONTEND_ORIGIN` in `backend/.env`.

## API Documentation

OpenAPI docs are available at:

- http://localhost:6061/docs
- http://localhost:6061/redoc
