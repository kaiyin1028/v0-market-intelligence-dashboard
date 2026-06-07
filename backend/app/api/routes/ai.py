from fastapi import APIRouter

from app.services.ai_service import analyze_stock, chat, summarize_market, explain_signal
from app.services.kimi_service import kimi_health
from app.services.ollama_service import ollama_health
from app.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    AIAnalysisResponse,
    AnalyzeStockRequest,
    SummarizeMarketRequest,
    ExplainSignalRequest,
    AIStatusResponse,
)

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/status", response_model=AIStatusResponse)
async def ai_status() -> AIStatusResponse:
    # Prefer Kimi when enabled
    kimi = await kimi_health()
    if kimi["status"] == "online":
        return AIStatusResponse(
            status="online",
            model=kimi["model"],
            effective_model=kimi["model"],
            available_models=kimi["available_models"],
            provider="kimi",
        )
    health = await ollama_health()
    return AIStatusResponse(
        status=health["status"],
        model=health["model"],
        effective_model=health.get("effective_model", health["model"]),
        available_models=health["available_models"],
        provider="ollama",
    )


@router.post("/analyze-stock", response_model=AIAnalysisResponse)
async def ai_analyze_stock(request: AnalyzeStockRequest) -> AIAnalysisResponse:
    return await analyze_stock(request.symbol, request.timeframe)


@router.post("/chat", response_model=AIChatResponse)
async def ai_chat(request: AIChatRequest) -> AIChatResponse:
    return await chat(request.message, request.context)


@router.post("/summarize-market", response_model=AIAnalysisResponse)
async def ai_summarize_market(request: SummarizeMarketRequest | None = None) -> AIAnalysisResponse:
    return await summarize_market(request.focus if request else None)


@router.post("/explain-signal", response_model=AIAnalysisResponse)
async def ai_explain_signal(request: ExplainSignalRequest) -> AIAnalysisResponse:
    return await explain_signal(request.signalId, request.symbol)
