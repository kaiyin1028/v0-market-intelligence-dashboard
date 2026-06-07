from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


def add_cors(app) -> None:
    origins = [
        settings.frontend_origin,
        "http://127.0.0.1:6060",
        "http://localhost:6060",
        "http://192.168.31.30:6060",
    ]
    # In development mode, also allow any origin so port-forwarding
    # and dynamic external domains work without rebuilding.
    if settings.app_env == "development":
        origins.append("*")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
