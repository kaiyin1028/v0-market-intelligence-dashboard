from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Market Intelligence Quant API"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    backend_host: str = "0.0.0.0"
    backend_port: int = 6061
    frontend_origin: str = "http://localhost:6060"

    database_url: str = "postgresql+psycopg://market_user:market_password@localhost:5433/market_intelligence"
    redis_url: str = "redis://localhost:6379/0"
    qdrant_url: str = "http://localhost:6333"

    ollama_base_url: str = "http://localhost:11434"
    ollama_chat_model: str = "qwen2.5"
    ollama_embedding_model: str = "nomic-embed-text"

    kimi_enabled: bool = True
    kimi_base_url: str = "https://api.moonshot.cn/anthropic"
    kimi_api_key: str = ""
    kimi_chat_model: str = "kimi-k2.6"

    futu_opend_host: str = "127.0.0.1"
    futu_opend_port: int = 11111
    futu_enabled: bool = True

    yahoo_enabled: bool = True


settings = Settings()
