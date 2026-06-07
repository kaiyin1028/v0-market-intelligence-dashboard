import json
import logging
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

KIMI_TIMEOUT = 60.0


async def kimi_health() -> dict[str, Any]:
    """Check Kimi API availability."""
    if not settings.kimi_enabled or not settings.kimi_api_key:
        return {
            "status": "offline",
            "model": settings.kimi_chat_model,
            "available_models": [],
        }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{settings.kimi_base_url}/v1/messages",
                headers={
                    "x-api-key": settings.kimi_api_key,
                    "content-type": "application/json",
                    "anthropic-version": "2023-06-01",
                },
                json={
                    "model": settings.kimi_chat_model,
                    "max_tokens": 1,
                    "messages": [{"role": "user", "content": "Hi"}],
                },
            )
            if resp.status_code == 200:
                return {
                    "status": "online",
                    "model": settings.kimi_chat_model,
                    "available_models": [settings.kimi_chat_model],
                }
            else:
                logger.warning("Kimi health check returned %s: %s", resp.status_code, resp.text[:200])
                return {
                    "status": "degraded",
                    "model": settings.kimi_chat_model,
                    "available_models": [settings.kimi_chat_model],
                }
    except Exception as e:
        logger.warning("Kimi health check failed: %s", e)
        return {
            "status": "offline",
            "model": settings.kimi_chat_model,
            "available_models": [],
        }


async def kimi_chat(messages: list[dict[str, str]], json_mode: bool = False) -> str | None:
    """Send a chat request to Kimi API. Returns content string or None on failure."""
    payload: dict[str, Any] = {
        "model": settings.kimi_chat_model,
        "max_tokens": 4096,
        "messages": messages,
    }
    if json_mode:
        payload["messages"] = [
            {"role": "system", "content": "Respond with valid JSON only. No markdown, no explanations, no code blocks."},
            *messages,
        ]

    try:
        async with httpx.AsyncClient(timeout=KIMI_TIMEOUT) as client:
            resp = await client.post(
                f"{settings.kimi_base_url}/v1/messages",
                headers={
                    "x-api-key": settings.kimi_api_key,
                    "content-type": "application/json",
                    "anthropic-version": "2023-06-01",
                },
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            content_blocks = data.get("content", [])
            for block in content_blocks:
                if block.get("type") == "text":
                    return block.get("text", "")
            return ""
    except Exception as e:
        logger.warning("Kimi chat failed (model=%s): %s: %s", settings.kimi_chat_model, type(e).__name__, e)
        return None


async def kimi_generate(prompt: str, json_mode: bool = False) -> str | None:
    """Send a generate request to Kimi API. Returns content string or None on failure."""
    messages = [{"role": "user", "content": prompt}]
    return await kimi_chat(messages, json_mode=json_mode)
