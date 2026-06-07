import json
import logging
import re
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

OLLAMA_TIMEOUT = 360.0


def _repair_json(text: str) -> dict[str, Any] | None:
    """Extract and repair malformed JSON from model output."""
    # Try extracting from markdown code blocks
    code_block = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if code_block:
        text = code_block.group(1).strip()

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try wrapping bare object in braces
    if not text.strip().startswith("{"):
        text = "{" + text
    if not text.strip().endswith("}"):
        text = text + "}"

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try to fix trailing commas before closing braces/brackets
    fixed = re.sub(r",(\s*[}\]])", r"\1", text)
    try:
        return json.loads(fixed)
    except json.JSONDecodeError:
        pass

    # Try fixing unquoted keys
    fixed = re.sub(r"([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:", r'\1"\2":', fixed)
    try:
        return json.loads(fixed)
    except json.JSONDecodeError:
        pass

    return None


def _pick_best_model(models: list[str]) -> str:
    """Pick the best available chat model from the Ollama model list."""
    priorities = [
        settings.ollama_chat_model,
        "phi4:latest",
        "llama3.2:latest",
        "gemma4:latest",
        "qwen2.5:latest",
        "qwen2.5",
        "llama3.2:3b",
        "mistral:latest",
        "mixtral:latest",
        "tinyllama:latest",
    ]
    for p in priorities:
        for m in models:
            if p == m or p in m:
                return m
    for m in models:
        if "embed" not in m:
            return m
    return models[0] if models else settings.ollama_chat_model


async def ollama_health() -> dict[str, Any]:
    """Check Ollama server and model availability."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{settings.ollama_base_url}/api/tags")
            resp.raise_for_status()
            data = resp.json()
            models = [m.get("name", m.get("model", "")) for m in data.get("models", [])]
            effective = _pick_best_model(models)
            model_available = settings.ollama_chat_model in models or any(
                settings.ollama_chat_model in m for m in models
            )
            return {
                "status": "online" if model_available else "degraded",
                "model": settings.ollama_chat_model,
                "effective_model": effective,
                "available_models": models,
            }
    except Exception as e:
        logger.warning("Ollama health check failed: %s", e)
        return {
            "status": "offline",
            "model": settings.ollama_chat_model,
            "effective_model": settings.ollama_chat_model,
            "available_models": [],
        }


async def ollama_chat(messages: list[dict[str, str]], json_mode: bool = False, model: str | None = None) -> str | None:
    """Send a chat request to Ollama. Returns content string or None on failure."""
    payload: dict[str, Any] = {
        "model": model or settings.ollama_chat_model,
        "messages": messages,
        "stream": False,
    }
    if json_mode:
        payload["format"] = "json"

    try:
        async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
            resp = await client.post(f"{settings.ollama_base_url}/api/chat", json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data.get("message", {}).get("content", "")
    except Exception as e:
        logger.warning("Ollama chat failed (model=%s): %s: %s", payload["model"], type(e).__name__, e)
        return None


async def ollama_generate(prompt: str, json_mode: bool = False, model: str | None = None) -> str | None:
    """Send a generate request to Ollama. Returns content string or None on failure."""
    payload: dict[str, Any] = {
        "model": model or settings.ollama_chat_model,
        "prompt": prompt,
        "stream": False,
    }
    if json_mode:
        payload["format"] = "json"

    try:
        async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
            resp = await client.post(f"{settings.ollama_base_url}/api/generate", json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data.get("response", "")
    except Exception as e:
        logger.warning("Ollama generate failed (model=%s): %s: %s", payload["model"], type(e).__name__, e)
        return None


def parse_json_output(text: str) -> dict[str, Any] | None:
    """Parse model output with repair fallback."""
    if not text:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        repaired = _repair_json(text)
        if repaired is not None:
            logger.info("Repaired malformed JSON from model output")
        return repaired
