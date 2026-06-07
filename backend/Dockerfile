FROM python:3.10-slim

WORKDIR /app

# Install build dependencies for numpy/pandas on ARM64 if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./
RUN pip install --no-cache-dir -e ".[dev]"

COPY app/ ./app/
COPY migrations/ ./migrations/
COPY alembic.ini ./

EXPOSE 6061

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "6061"]
