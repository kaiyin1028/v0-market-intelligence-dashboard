from fastapi import APIRouter, HTTPException

from app.services.backtest_service import run_backtest, get_backtest_result, get_backtest_trades
from app.schemas.backtest import BacktestRequest, BacktestResult, BacktestTrade

router = APIRouter(prefix="/backtesting", tags=["backtesting"])


@router.post("/run", response_model=BacktestResult)
async def backtest_run(request: BacktestRequest) -> BacktestResult:
    return run_backtest(request)


@router.get("/results/{id}", response_model=BacktestResult)
async def backtest_result(id: str) -> BacktestResult:
    result = get_backtest_result(id)
    if not result:
        raise HTTPException(status_code=404, detail="Backtest not found")
    return result


@router.get("/results/{id}/trades", response_model=list[BacktestTrade])
async def backtest_trades(id: str) -> list[BacktestTrade]:
    return get_backtest_trades(id)
