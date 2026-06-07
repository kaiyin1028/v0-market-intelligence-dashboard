/**
 * Market Intelligence Quant Dashboard - API Client
 * Connects to the FastAPI backend with graceful mock fallback
 */

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

/**
 * Auto-detect API base URL at runtime.
 * Priority: 1) env var  2) current hostname + port 6061  3) localhost fallback
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL
  }
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol
    const hostname = window.location.hostname
    // If front-end is on :6060, assume back-end is on :6061 on same host.
    // If front-end is on standard port (80/443) and no explicit env var is set,
    // we still assume :6061 because the back-end runs separately.
    const port = '6061'
    return `${protocol}//${hostname}:${port}/api/v1`
  }
  return 'http://localhost:6061/api/v1'
}

const BASE_URL = getBaseUrl()

let apiAvailable: boolean | null = null
let fallbackUsed = false

export function getApiAvailability(): boolean | null {
  return apiAvailable
}

export function isFallbackUsed(): boolean {
  return fallbackUsed
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }
  apiAvailable = true
  return res.json() as Promise<T>
}

async function withFallback<T>(fetcher: () => Promise<T>, fallback: T): Promise<T> {
  try {
    const data = await fetcher()
    apiAvailable = true
    return data
  } catch (err) {
    apiAvailable = false
    fallbackUsed = true
    console.warn('[API] Falling back to mock data:', err)
    return fallback
  }
}

export interface ApiResult<T> {
  data: T
  fallback: boolean
}

async function withFallbackMeta<T>(fetcher: () => Promise<T>, fallback: T): Promise<ApiResult<T>> {
  try {
    const data = await fetcher()
    apiAvailable = true
    return { data, fallback: false }
  } catch (err) {
    apiAvailable = false
    fallbackUsed = true
    console.warn('[API] Falling back to mock data:', err)
    return { data: fallback, fallback: true }
  }
}

// ============================================
// Market Overview
// ============================================

export async function getMarketOverview(): Promise<ApiResult<{
  indices: MarketIndex[]
  summary: MarketSummary
  sectorHeatmap: unknown[]
  signalFeed: unknown[]
  falseBreakoutRisks: unknown[]
}>> {
  return withFallbackMeta(
    () => apiFetch('/market/overview'),
    {
      indices: [],
      summary: { marketBreadth: { advancers: 0, decliners: 0, unchanged: 0, ratio: 0 }, bullishSignals: 0, bearishSignals: 0, falseBreakoutAlerts: 0 },
      sectorHeatmap: [],
      signalFeed: [],
      falseBreakoutRisks: [],
    }
  )
}

// ============================================
// Stock Search
// ============================================

export interface StockSearchResult {
  ticker: string
  name: string
  sector: string
  exchange: string
}

export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  return apiFetch(`/stocks/search?q=${encodeURIComponent(query)}`)
}

// ============================================
// Stock Analysis
// ============================================

export async function getStockOverview(symbol: string): Promise<StockOverview> {
  return apiFetch(`/stocks/${encodeURIComponent(symbol)}/overview`)
}

export async function getStockAnalysis(
  symbol: string,
  timeframe?: string
): Promise<{
  stock: Stock
  indicators: TechnicalIndicators
  volumeProfile: VolumeProfile[]
  chipDistribution: ChipDistribution
  breakoutAnalysis: BreakoutAnalysis
  signalData: SignalData
  aiAnalysis: AIAnalysis
  candlestickData: CandlestickData[]
}> {
  return apiFetch(`/stocks/${encodeURIComponent(symbol)}/analysis?timeframe=${timeframe || '1d'}`)
}

// ============================================
// Breakout Scanner
// ============================================

export interface ScannerFilters {
  market?: string
  sector?: string
  timeframe?: string
  minVolumeRatio?: number
  maxFalseBreakoutRisk?: number
  signalType?: string
}

export async function getBreakoutScanner(filters?: ScannerFilters): Promise<BreakoutScanResult[]> {
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.set(k, String(v))
    })
  }
  return apiFetch(`/breakouts/scanner?${params.toString()}`)
}

// ============================================
// Signals
// ============================================

export async function getSignals(signalType?: string): Promise<TradeSignal[]> {
  const params = new URLSearchParams()
  if (signalType) params.set('signalType', signalType)
  return apiFetch(`/signals?${params.toString()}`)
}

// ============================================
// Backtesting
// ============================================

export async function runBacktest(params: BacktestParams): Promise<BacktestResult> {
  return apiFetch('/backtesting/run', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

// ============================================
// AI Status
// ============================================

export interface AIStatus {
  status: 'online' | 'offline' | 'degraded'
  model: string
  effective_model: string
  available_models: string[]
}

export async function getAIStatus(): Promise<AIStatus> {
  return apiFetch('/ai/status')
}

// ============================================
// AI Analyst
// ============================================

export interface AIContext {
  ticker?: string
  timeframe?: string
  indicators?: TechnicalIndicators
  volumeProfile?: VolumeProfile[]
  chipDistribution?: ChipDistribution
  breakoutAnalysis?: BreakoutAnalysis
  signalData?: SignalData
  aiAnalysis?: AIAnalysis
}

export async function askAIAnalyst(
  message: string,
  context?: AIContext
): Promise<{
  response: string
  analysis?: AIAnalysis
}> {
  return apiFetch('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, context }),
  })
}

export async function analyzeStockWithAI(
  symbol: string,
  timeframe?: string
): Promise<AIAnalysis> {
  return apiFetch('/ai/analyze-stock', {
    method: 'POST',
    body: JSON.stringify({ symbol, timeframe: timeframe || '1d' }),
  })
}

// ============================================
// Watchlist helpers
// ============================================

export async function getWatchlist(): Promise<WatchlistItem[]> {
  return apiFetch('/settings/watchlist')
}

export async function addToWatchlist(ticker: string): Promise<void> {
  await apiFetch('/settings/watchlist', {
    method: 'POST',
    body: JSON.stringify({ ticker }),
  })
}

export async function removeFromWatchlist(ticker: string): Promise<void> {
  await apiFetch(`/settings/watchlist/${encodeURIComponent(ticker)}`, {
    method: 'DELETE',
  })
}

// ============================================
// Portfolio Risk
// ============================================

export async function getPortfolioRisk(): Promise<PortfolioRisk> {
  return apiFetch('/settings/portfolio-risk')
}
