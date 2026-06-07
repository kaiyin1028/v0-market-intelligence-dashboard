import pytest
from app.services.ollama_service import parse_json_output, _repair_json


class TestRepairJson:
    def test_valid_json_passthrough(self):
        assert _repair_json('{"a": 1}') == {"a": 1}

    def test_markdown_code_block(self):
        text = '```json\n{"a": 1}\n```'
        assert _repair_json(text) == {"a": 1}

    def test_trailing_comma_fix(self):
        text = '{"a": 1, "b": [1, 2,],}'
        result = _repair_json(text)
        assert result == {"a": 1, "b": [1, 2]}

    def test_unquoted_keys(self):
        text = '{a: 1, b: "hello"}'
        result = _repair_json(text)
        assert result == {"a": 1, "b": "hello"}

    def test_malformed_unrecoverable(self):
        assert _repair_json("not json at all") is None


class TestParseJsonOutput:
    def test_direct_parse(self):
        assert parse_json_output('{"summary": "ok"}') == {"summary": "ok"}

    def test_repair_fallback(self):
        assert parse_json_output('```json\n{"summary": "ok"}\n```') == {"summary": "ok"}

    def test_none_input(self):
        assert parse_json_output("") is None
        assert parse_json_output(None) is None  # type: ignore[arg-type]


class TestAIStatusEndpoint:
    def test_ai_status_returns_shape(self, client):
        response = client.get("/api/v1/ai/status")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ("online", "offline", "degraded")
        assert "model" in data
        assert "available_models" in data
        assert isinstance(data["available_models"], list)
