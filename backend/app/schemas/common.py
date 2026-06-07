from pydantic import BaseModel
from typing import Any


class APIResponse(BaseModel):
    success: bool = True
    data: Any | None = None
    message: str | None = None
