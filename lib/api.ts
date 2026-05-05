/**
 * 金融市場情報量化儀表板 - API 佔位函數
 * Market Intelligence Quant Dashboard - API Placeholder Functions
 * 
 * 此檔案包含未來將連接真實API的佔位函數
 * 目前返回模擬數據
 */

import {
  marketIndices,
  marketSummary,
  defaultStock,
  defaultIndicators,
  volumeProfileData,
  chipDistribution,
  breakoutAnalysis,
  signalData,
  aiAnalysis,
  tradeSignals,
  breakoutScanResults,
  backtestResult,
  watchlist,
  portfolioRisk,
  generateCandlestickData,
  sectorHeatmapData,
  signalFeed,
  falseBreakoutRisks,
} from './mock-data'

import type {
  MarketIndex,
  MarketSummary,
  Stock,
  TechnicalIndicators,
  VolumeProfile,
  ChipDistribution,
  BreakoutAnalysis,
  SignalData,
  AIAnalysis,
  TradeSignal,
  BreakoutScanResult,
  BacktestResult,
  BacktestParams,
  WatchlistItem,
  PortfolioRisk,
  CandlestickData,
} from '@/types'

// ============================================
// 市場概覽 API
// ============================================

/**
 * 取得市場概覽數據
 * @returns 市場指數、摘要統計等數據
 */
export async function getMarketOverview(): Promise<{
  indices: MarketIndex[]
  summary: MarketSummary
  sectorHeatmap: typeof sectorHeatmapData
  signalFeed: typeof signalFeed
  falseBreakoutRisks: typeof falseBreakoutRisks
}> {
  // TODO: 替換為真實API呼叫
  await simulateDelay()
  
  return {
    indices: marketIndices,
    summary: marketSummary,
    sectorHeatmap: sectorHeatmapData,
    signalFeed: signalFeed,
    falseBreakoutRisks: falseBreakoutRisks,
  }
}

// ============================================
// 股票分析 API
// ============================================

/**
 * 取得股票分析數據
 * @param ticker - 股票代碼
 * @returns 股票詳細分析數據
 */
export async function getStockAnalysis(ticker: string): Promise<{
  stock: Stock
  indicators: TechnicalIndicators
  volumeProfile: VolumeProfile[]
  chipDistribution: ChipDistribution
  breakoutAnalysis: BreakoutAnalysis
  signalData: SignalData
  aiAnalysis: AIAnalysis
  candlestickData: CandlestickData[]
}> {
  // TODO: 替換為真實API呼叫
  await simulateDelay()
  
  // 根據不同股票代碼返回不同數據（目前返回預設數據）
  const stock = { ...defaultStock, ticker }
  
  return {
    stock,
    indicators: defaultIndicators,
    volumeProfile: volumeProfileData,
    chipDistribution,
    breakoutAnalysis,
    signalData,
    aiAnalysis,
    candlestickData: generateCandlestickData(60),
  }
}

// ============================================
// 突破掃描器 API
// ============================================

/**
 * 突破掃描器篩選參數
 */
export interface ScannerFilters {
  market?: string           // 市場
  sector?: string           // 產業
  timeframe?: string        // 時間週期
  minVolumeRatio?: number   // 最小成交量比率
  maxFalseBreakoutRisk?: number  // 最大假突破風險
  signalType?: string       // 訊號類型
}

/**
 * 取得突破掃描器結果
 * @param filters - 篩選條件
 * @returns 突破掃描結果列表
 */
export async function getBreakoutScanner(filters?: ScannerFilters): Promise<BreakoutScanResult[]> {
  // TODO: 替換為真實API呼叫
  await simulateDelay()
  
  let results = [...breakoutScanResults]
  
  // 應用篩選條件
  if (filters) {
    if (filters.sector) {
      results = results.filter(r => r.sector === filters.sector)
    }
    if (filters.minVolumeRatio) {
      results = results.filter(r => r.volumeRatio >= filters.minVolumeRatio!)
    }
    if (filters.maxFalseBreakoutRisk) {
      results = results.filter(r => r.falseBreakoutRisk <= filters.maxFalseBreakoutRisk!)
    }
    if (filters.signalType) {
      results = results.filter(r => r.signal === filters.signalType)
    }
  }
  
  return results
}

// ============================================
// 訊號中心 API
// ============================================

/**
 * 取得交易訊號列表
 * @param signalType - 訊號類型篩選
 * @returns 交易訊號列表
 */
export async function getSignals(signalType?: string): Promise<TradeSignal[]> {
  // TODO: 替換為真實API呼叫
  await simulateDelay()
  
  if (signalType) {
    return tradeSignals.filter(s => s.signalType === signalType)
  }
  
  return tradeSignals
}

// ============================================
// 回測 API
// ============================================

/**
 * 執行回測
 * @param params - 回測參數
 * @returns 回測結果
 */
export async function runBacktest(params: BacktestParams): Promise<BacktestResult> {
  // TODO: 替換為真實回測引擎
  await simulateDelay(2000) // 模擬較長的回測時間
  
  console.log('[v0] 執行回測，參數:', params)
  
  // 根據策略類型微調結果（目前返回相同結果）
  return backtestResult
}

// ============================================
// AI 分析師 API
// ============================================

/**
 * AI分析師上下文
 */
export interface AIContext {
  ticker?: string           // 當前股票代碼
  indicators?: TechnicalIndicators  // 技術指標
  signalData?: SignalData   // 訊號數據
}

/**
 * 詢問AI分析師
 * @param message - 使用者問題
 * @param context - 分析上下文
 * @returns AI分析結果
 */
export async function askAIAnalyst(
  message: string,
  context?: AIContext
): Promise<{
  response: string
  analysis?: AIAnalysis
}> {
  // TODO: 連接Ollama本地LLM
  await simulateDelay(1500) // 模擬AI回應時間
  
  console.log('[v0] AI分析師收到問題:', message)
  console.log('[v0] 分析上下文:', context)
  
  // 模擬AI回應
  const response = generateAIResponse(message, context)
  
  return {
    response,
    analysis: aiAnalysis,
  }
}

/**
 * 生成模擬AI回應
 */
function generateAIResponse(message: string, context?: AIContext): string {
  const ticker = context?.ticker || 'AAPL'
  
  if (message.includes('假突破') || message.includes('false breakout')) {
    return `根據我的分析，${ticker} 目前的突破訊號需要謹慎看待。

**量價配合度分析：**
成交量比率為 1.35，略高於平均值但未達到理想的 1.5 倍以上標準。收盤強度 68% 表示多頭有一定力道，但仍有改善空間。

**籌碼面分析：**
上方套牢籌碼約 22.5%，形成一定壓力。POC 位於 187.50，當前價格在 POC 上方運行，籌碼結構尚屬健康。

**技術面分析：**
RSI 58.7 處於中性區間，MACD 柱狀圖持續擴張顯示動能增強。但需注意若無法持續放量，可能形成假突破風險。

**結論：**
假突破風險評估為中等（28%）。建議等待突破後的回測確認，若能成功站穩突破位且量能維持，則真突破機率較高。`
  }
  
  if (message.includes('異常') || message.includes('abnormal')) {
    return `以下是今日成交量異常的股票清單：

1. **NVDA (輝達)** - 成交量比率 2.45，顯著高於平均值，伴隨股價突破歷史新高，屬於正向異常。

2. **AMD (超微)** - 成交量比率 1.95，配合技術面突破，可能有機構資金進場。

3. **TSLA (特斯拉)** - 成交量放大但股價下跌，屬於負向異常，可能有大額賣壓。

建議優先關注量價配合的正向異常標的，這類股票通常代表有新資金進場，後續上漲機率較高。`
  }
  
  return `感謝您的詢問。根據我對 ${ticker} 的分析：

目前該股呈現穩健的多頭格局，技術面與籌碼面均顯示正向訊號。RSI 維持在中性偏多區間，MACD 柱狀圖持續擴張，顯示動能增強。

**重點關注：**
- 支撐位：186.50、183.20、180.00
- 阻力位：192.50、195.00、200.00
- 建議進場區間：186.50 - 189.00
- 建議停損：182.00

若您有更具體的問題，歡迎繼續詢問。`
}

// ============================================
// 觀察清單 API
// ============================================

/**
 * 取得觀察清單
 * @returns 觀察清單項目
 */
export async function getWatchlist(): Promise<WatchlistItem[]> {
  // TODO: 替換為真實API呼叫
  await simulateDelay()
  return watchlist
}

/**
 * 新增觀察清單項目
 * @param ticker - 股票代碼
 */
export async function addToWatchlist(ticker: string): Promise<void> {
  // TODO: 替換為真實API呼叫
  await simulateDelay()
  console.log('[v0] 新增觀察清單:', ticker)
}

/**
 * 移除觀察清單項目
 * @param ticker - 股票代碼
 */
export async function removeFromWatchlist(ticker: string): Promise<void> {
  // TODO: 替換為真實API呼叫
  await simulateDelay()
  console.log('[v0] 移除觀察清單:', ticker)
}

// ============================================
// 投資組合風險 API
// ============================================

/**
 * 取得投資組合風險數據
 * @returns 投資組合風險分析
 */
export async function getPortfolioRisk(): Promise<PortfolioRisk> {
  // TODO: 替換為真實API呼叫
  await simulateDelay()
  return portfolioRisk
}

// ============================================
// 工具函數
// ============================================

/**
 * 模擬API延遲
 * @param ms - 延遲毫秒數
 */
async function simulateDelay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
