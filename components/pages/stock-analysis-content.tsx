"use client"

/**
 * 股票分析內容元件
 * Stock Analysis Content Component
 * 
 * 整合進階K線圖、技術指標、量價分析、突破偵測和買賣訊號
 * 使用專業級圖表元件展示完整的技術分析資訊
 */

import { useState, useMemo, useEffect, useCallback } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Target,
  Zap,
  Brain,
  Layers,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  LineChart,
  CandlestickChart,
  Eye,
} from "lucide-react"
import { AdvancedCandlestickChart } from "@/components/charts/advanced-candlestick-chart"
import { AdvancedVolumeProfile } from "@/components/charts/advanced-volume-profile"
import { IndicatorCards } from "@/components/charts/indicator-cards"
import { BreakoutPanel } from "@/components/charts/breakout-panel"
import { SignalPanel } from "@/components/charts/signal-panel"
import { ScoreGauge } from "@/components/dashboard/score-gauge"
import { SignalBadge, AISignalBadge } from "@/components/dashboard/signal-badge"
import { RiskBadge, DetailedRiskIndicator } from "@/components/dashboard/risk-badge"
import { getStockAnalysis, getStockOverview, searchStocks } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { Stock, CandlestickData, TechnicalIndicators, VolumeProfile, ChipDistribution, BreakoutAnalysis, SignalData } from "@/types"

/** 熱門股票列表 */
const 熱門股票 = [
  { 代號: "AAPL", 名稱: "蘋果", 英文: "Apple Inc." },
  { 代號: "NVDA", 名稱: "輝達", 英文: "NVIDIA Corp." },
  { 代號: "MSFT", 名稱: "微軟", 英文: "Microsoft Corp." },
  { 代號: "AMD", 名稱: "超微", 英文: "Advanced Micro Devices" },
  { 代號: "META", 名稱: "Meta", 英文: "Meta Platforms" },
]

/** AI 分析結果介面 */
interface AIAnalysisResult {
  技術面: string
  籌碼面: string
  操作建議: string
  風險提示: string
  信心度: number
}

export function StockAnalysisContent() {
  // 當前選擇的股票
  const [當前股票, set當前股票] = useState<{
    代號: string
    名稱: string
    英文: string
    價格: number
    漲跌: number
    開盤: number
    最高: number
    最低: number
    成交量: string
    市值: string
    產業: string
    本益比: number
    股息率: number
  }>({
    代號: 'AAPL',
    名稱: '蘋果',
    英文: 'Apple Inc.',
    價格: 0,
    漲跌: 0,
    開盤: 0,
    最高: 0,
    最低: 0,
    成交量: '-',
    市值: '-',
    產業: '科技',
    本益比: 0,
    股息率: 0,
  })

  // 搜尋關鍵字
  const [搜尋關鍵字, set搜尋關鍵字] = useState("")

  // 時間週期
  const [時間週期, set時間週期] = useState("日K")

  // 是否收藏
  const [已收藏, set已收藏] = useState(false)

  // API 數據狀態
  const [apiData, setApiData] = useState<{
    stock: Stock
    candlestickData: CandlestickData[]
    indicators: TechnicalIndicators | null
    volumeProfile: VolumeProfile[]
    chipDistribution: ChipDistribution
    breakoutAnalysis: BreakoutAnalysis
    signalData: SignalData
    aiAnalysis: {
      summary: string
      trendView: 'bullish' | 'bearish' | 'neutral'
      bullishReasons: string[]
      bearishRisks: string[]
      keyLevels: {
        support: number[]
        resistance: number[]
      }
      confidence: number
    } | null
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")

  // 時間週期映射
  const timeframeMap: Record<string, string> = {
    '1分': '1m',
    '5分': '5m',
    '15分': '15m',
    '30分': '30m',
    '60分': '1h',
    '日K': '1d',
    '週K': '1w',
    '月K': '1M',
    '季K': '3M',
    '半年': '6M',
    '年K': '1Y',
  }

  // 從 URL 參數讀取 ticker（支援從頂部搜尋列導航）
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const tickerFromUrl = params.get('ticker')
    if (tickerFromUrl) {
      set搜尋關鍵字(tickerFromUrl)
      const timer = setTimeout(() => {
        handleSearch()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [])

  // 載入完整分析數據（僅在股票或週期變更時執行）
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getStockAnalysis(當前股票.代號, timeframeMap[時間週期] || '1d')
      .then((res) => {
        if (!cancelled) {
          const s = res.stock
          set當前股票({
            代號: s.ticker,
            名稱: s.name,
            英文: s.name,
            價格: s.price,
            漲跌: s.changePercent,
            開盤: s.price - s.change,
            最高: s.price * 1.005,
            最低: s.price * 0.995,
            成交量: s.volume ? (s.volume / 1e6).toFixed(1) + 'M' : '-',
            市值: s.marketCap ? '$' + (s.marketCap / 1e12).toFixed(2) + 'T' : '-',
            產業: s.sector || '科技',
            本益比: 0,
            股息率: 0,
          })
          setApiData({
            stock: s,
            indicators: res.indicators,
            candlestickData: res.candlestickData,
            volumeProfile: res.volumeProfile,
            chipDistribution: res.chipDistribution,
            breakoutAnalysis: res.breakoutAnalysis,
            signalData: res.signalData,
            aiAnalysis: res.aiAnalysis,
          })
          setLastUpdated(new Date().toLocaleTimeString('zh-TW'))
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '載入失敗')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [當前股票.代號, 時間週期])

  // 輕量價格輪詢（每 5 秒只更新價格，不刷新圖表與指標）
  useEffect(() => {
    let cancelled = false
    const pollPrice = () => {
      getStockOverview(當前股票.代號)
        .then((s) => {
          if (!cancelled) {
            set當前股票((prev) => ({
              ...prev,
              價格: s.price,
              漲跌: s.changePercent,
              開盤: s.price - s.change,
              最高: s.price * 1.005,
              最低: s.price * 0.995,
              成交量: s.volume ? (s.volume / 1e6).toFixed(1) + 'M' : '-',
              市值: s.marketCap ? '$' + (s.marketCap / 1e12).toFixed(2) + 'T' : '-',
              產業: s.sector || prev.產業,
            }))
            setLastUpdated(new Date().toLocaleTimeString('zh-TW'))
          }
        })
        .catch(() => {
          // 輕量輪詢失敗不顯示錯誤，避免干擾使用者
        })
    }
    const interval = setInterval(pollPrice, 5000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [當前股票.代號])

  // K線數據（僅使用 API）
  const candlestickData = useMemo(
    () => apiData?.candlestickData || [],
    [apiData]
  )

  // 支撐阻力位（僅使用 API）
  const supportLevels = useMemo(
    () => apiData?.aiAnalysis?.keyLevels?.support || [],
    [apiData]
  )
  const resistanceLevels = useMemo(
    () => apiData?.aiAnalysis?.keyLevels?.resistance || [],
    [apiData]
  )

  // 真實 VWAP
  const vwapValue = useMemo(
    () => apiData?.indicators?.vwap,
    [apiData]
  )

  // 從訊號資料生成買賣標記
  const chartMarkers = useMemo(() => {
    const markers: import('@/types').ChartMarker[] = []
    const sig = apiData?.signalData
    const lastCandle = candlestickData[candlestickData.length - 1]
    if (!sig || !lastCandle) return markers
    const lastDate = lastCandle.date
    if (sig.buyScore > sig.sellScore && sig.entryZone) {
      markers.push({
        date: lastDate,
        type: 'buy',
        price: sig.entryZone.low,
        label: `買入 ${sig.buyScore}分`,
      })
    }
    if (sig.sellScore > sig.buyScore) {
      markers.push({
        date: lastDate,
        type: 'sell',
        price: sig.stopLoss || lastCandle.close * 0.95,
        label: `賣出 ${sig.sellScore}分`,
      })
    }
    return markers
  }, [apiData, candlestickData])

  // 突破標註（從突破分析資料生成）
  const breakoutAnnotations = useMemo(() => {
    const bo = apiData?.breakoutAnalysis
    const lastCandle = candlestickData[candlestickData.length - 1]
    if (!bo || !lastCandle) return []
    const annotations: { date: string; type: 'true-breakout' | 'false-breakout'; price: number; label: string }[] = []
    if (bo.trueBreakoutScore >= 65) {
      annotations.push({
        date: lastCandle.date,
        type: 'true-breakout',
        price: bo.breakoutLevel || lastCandle.high,
        label: `真突破 ${bo.trueBreakoutScore}分`,
      })
    }
    if (bo.falseBreakoutRisk >= 50) {
      annotations.push({
        date: lastCandle.date,
        type: 'false-breakout',
        price: lastCandle.high,
        label: `假突破風險 ${bo.falseBreakoutRisk}%`,
      })
    }
    return annotations
  }, [apiData, candlestickData])

  // AI 分析結果（僅使用 API）
  const aiAnalysis: AIAnalysisResult = useMemo(() => {
    if (apiData?.aiAnalysis) {
      const a = apiData.aiAnalysis
      return {
        技術面: a.summary,
        籌碼面: a.bullishReasons.join('；'),
        操作建議: `綜合技術面與籌碼面分析，建議採取${a.trendView === 'bullish' ? '偏多' : a.trendView === 'bearish' ? '偏空' : '觀望'}操作策略。`,
        風險提示: a.bearishRisks.join('\n'),
        信心度: Math.round(a.confidence),
      }
    }
    return {
      技術面: '暫無分析數據',
      籌碼面: '暫無分析數據',
      操作建議: '暫無分析數據',
      風險提示: '暫無分析數據',
      信心度: 0,
    }
  }, [apiData])

  // 處理股票切換
  const handleStockChange = (股票: typeof 熱門股票[0]) => {
    set當前股票({
      代號: 股票.代號,
      名稱: 股票.名稱,
      英文: 股票.英文,
      價格: 0,
      漲跌: 0,
      開盤: 0,
      最高: 0,
      最低: 0,
      成交量: '-',
      市值: '-',
      產業: '科技',
      本益比: 0,
      股息率: 0,
    })
    setApiData(null)
    set已收藏(false)
  }

  // 搜尋並切換到指定股票
  const handleSearch = useCallback(async () => {
    const query = 搜尋關鍵字.trim().toUpperCase()
    if (!query) return
    setLoading(true)
    setError(null)
    try {
      const results = await searchStocks(query)
      if (results && results.length > 0) {
        const match = results[0]
        set當前股票({
          代號: match.ticker,
          名稱: match.name,
          英文: match.name,
          價格: 0,
          漲跌: 0,
          開盤: 0,
          最高: 0,
          最低: 0,
          成交量: '-',
          市值: '-',
          產業: match.sector || '科技',
          本益比: 0,
          股息率: 0,
        })
        setApiData(null)
        set已收藏(false)
        set搜尋關鍵字('')
        // 清除 URL 參數避免重複觸發
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, '', '/stock-analysis')
        }
      } else {
        setError(`找不到股票「${query}」，請檢查代號是否正確`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜尋失敗')
    } finally {
      setLoading(false)
    }
  }, [搜尋關鍵字])

  return (
    <div className="space-y-6">
      {/* 頂部 AIGC 裝飾背景 - 包含 AI 生成圖片 */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[500px] overflow-hidden">
        {/* AI 生成的圖表背景圖片 */}
        <div className="absolute top-0 right-0 w-[700px] h-[500px] opacity-[0.04] dark:opacity-[0.08]">
          <Image
            src="/images/ai-chart-pattern.jpg"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-background/60 to-background" />
        </div>
        
        {/* 彩色漸層球體裝飾 */}
        <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl animate-pulse" />
        <div className="absolute right-1/4 top-40 h-64 w-64 rounded-full bg-gradient-to-br from-violet-500/10 via-blue-500/5 to-transparent blur-3xl" />
        <div className="absolute left-1/2 top-10 h-48 w-48 rounded-full bg-gradient-to-br from-amber-500/8 via-rose-500/4 to-transparent blur-3xl" />
        
        {/* 神經網路背景圖案 */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.015]" viewBox="0 0 1200 500">
          <defs>
            <linearGradient id="stockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path d="M0,150 Q300,50 600,150 T1200,150" stroke="url(#stockGradient)" strokeWidth="2" fill="none" />
          <path d="M0,300 Q400,200 800,300 T1200,300" stroke="url(#stockGradient)" strokeWidth="2" fill="none" />
          <circle cx="200" cy="140" r="8" fill="#10b981" />
          <circle cx="500" cy="160" r="10" fill="#06b6d4" />
          <circle cx="800" cy="145" r="7" fill="#8b5cf6" />
          <circle cx="350" cy="290" r="9" fill="#f59e0b" />
          <circle cx="650" cy="310" r="8" fill="#ec4899" />
          <circle cx="950" cy="295" r="11" fill="#3b82f6" />
        </svg>
      </div>

      {/* 載入/錯誤提示 */}
      {loading && (
        <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/20 px-4 py-2 text-sm text-primary">
          <Activity className="h-4 w-4 animate-spin" />
          正在載入 {當前股票.代號} 分析數據...
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-500/5 border border-amber-500/20 px-4 py-2 text-sm text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          API 連線失敗（{error}）
        </div>
      )}

      {/* 頂部搜尋與股票資訊區 */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* 搜尋區域 */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜尋股票代號或名稱..."
              value={搜尋關鍵字}
              onChange={(e) => set搜尋關鍵字(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearch()
                }
              }}
              className="w-72 bg-background/50 pl-10 backdrop-blur-sm"
            />
          </div>
          <Select value={時間週期} onValueChange={set時間週期}>
            <SelectTrigger className="w-28 bg-background/50 backdrop-blur-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1分">1 分鐘</SelectItem>
              <SelectItem value="5分">5 分鐘</SelectItem>
              <SelectItem value="15分">15 分鐘</SelectItem>
              <SelectItem value="30分">30 分鐘</SelectItem>
              <SelectItem value="60分">60 分鐘</SelectItem>
              <SelectItem value="日K">日 K</SelectItem>
              <SelectItem value="週K">週 K</SelectItem>
              <SelectItem value="月K">月 K</SelectItem>
              <SelectItem value="季K">季 K</SelectItem>
              <SelectItem value="半年">半年</SelectItem>
              <SelectItem value="年K">年 K</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 熱門股票快捷按鈕 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">熱門標的：</span>
          {熱門股票.map((股票) => (
            <Button
              key={股票.代號}
              variant={當前股票.代號 === 股票.代號 ? "default" : "outline"}
              size="sm"
              onClick={() => handleStockChange(股票)}
              className={cn(
                "h-8 gap-1.5 transition-all",
                當前股票.代號 === 股票.代號
                  ? "shadow-md shadow-primary/20"
                  : "bg-background/50 hover:bg-background"
              )}
            >
              <span className="font-medium">{股票.代號}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* 股票資訊主卡片 */}
      <Card className="glass-card relative overflow-hidden border-border/30">
        {/* 頂部狀態指示線 */}
        <div className={cn(
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent to-transparent",
          當前股票.漲跌 >= 0 
            ? "via-emerald-500/70" 
            : "via-rose-500/70"
        )} />
        
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            {/* 左側：股票基本資訊 */}
            <div className="flex items-start gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-10 w-10 rounded-xl transition-all",
                  已收藏 
                    ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30" 
                    : "hover:bg-muted"
                )}
                onClick={() => set已收藏(!已收藏)}
              >
                <Star className={cn("h-5 w-5", 已收藏 && "fill-current")} />
              </Button>
              
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">{當前股票.代號}</h1>
                  <span className="text-xl text-muted-foreground">{當前股票.英文}</span>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    NASDAQ
                  </Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    {當前股票.產業}
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>市值: {當前股票.市值}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>P/E: {當前股票.本益比.toFixed(1)}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>股息率: {當前股票.股息率.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* 中間：價格資訊 */}
            <div className="flex flex-wrap items-center gap-8">
              {/* 即時價格 */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight">
                    ${當前股票.價格.toFixed(2)}
                  </span>
                  <div className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold",
                    當前股票.漲跌 >= 0 
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                      : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                  )}>
                    {當前股票.漲跌 >= 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {當前股票.漲跌 >= 0 ? '+' : ''}{當前股票.漲跌.toFixed(2)}%
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="animate-pulse rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] text-white">
                    即時
                  </span>
                  最後更新: {lastUpdated}
                </div>
              </div>

              {/* 當日行情 */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl bg-muted/30 p-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">開盤</span>
                  <span className="font-mono font-medium">${當前股票.開盤.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">最高</span>
                  <span className="font-mono font-medium text-emerald-500">${當前股票.最高.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">成交量</span>
                  <span className="font-mono font-medium">{當前股票.成交量}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">最低</span>
                  <span className="font-mono font-medium text-rose-500">${當前股票.最低.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* 右側：AI 評分區 */}
            <div className="flex items-center gap-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 ring-1 ring-primary/20">
              <ScoreGauge
                score={aiAnalysis.信心度}
                label="AI 綜合評分"
                size="md"
              />
              <div className="space-y-2">
                <AISignalBadge signal="buy" confidence={85} />
                <DetailedRiskIndicator risk={35} showAdvice={false} />
              </div>
            </div>
          </div>

          {/* 底部分項指標 */}
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border/30 pt-6 sm:grid-cols-4 lg:grid-cols-6">
            {[
              { 標籤: '技術面', 分數: 82, 圖標: Activity, 顏色: 'text-emerald-500' },
              { 標籤: '籌碼面', 分數: 75, 圖標: Layers, 顏色: 'text-blue-500' },
              { 標籤: '量能', 分數: 68, 圖標: BarChart3, 顏色: 'text-amber-500' },
              { 標籤: '趨勢', 分數: 85, 圖標: TrendingUp, 顏色: 'text-emerald-500' },
              { 標籤: '動能', 分數: 72, 圖標: Zap, 顏色: 'text-purple-500' },
              { 標籤: '風險', 分數: 35, 圖標: Shield, 顏色: 'text-cyan-500' },
            ].map((指標) => {
              const Icon = 指標.圖標
              return (
                <div
                  key={指標.標籤}
                  className="flex items-center gap-3 rounded-lg bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                >
                  <div className={cn("rounded-lg bg-background p-2", 指標.顏色)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{指標.標籤}</div>
                    <div className="text-lg font-bold">{指標.分數}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 主要圖表區域 */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* 進階K線圖 - 佔據 2/3 寬度 */}
        <div className="xl:col-span-2">
          <AdvancedCandlestickChart
            data={candlestickData}
            markers={chartMarkers}
            vwap={vwapValue}
            support={supportLevels}
            resistance={resistanceLevels}
            breakoutAnnotations={breakoutAnnotations}
          />
        </div>

        {/* 進階量價分布圖 */}
        <div>
          <AdvancedVolumeProfile
            data={apiData?.volumeProfile || []}
            chipData={apiData?.chipDistribution || { poc: 0, vah: 0, val: 0, hvn: [], lvn: [], chipPressure: 0, upperTrappedChips: 0, lowerSupportDensity: 0 }}
            currentPrice={當前股票.價格}
            ticker={當前股票.代號}
          />
        </div>
      </div>

      {/* 分頁標籤區域 */}
      <Tabs defaultValue="技術指標" className="space-y-6">
        <TabsList className="h-12 w-full justify-start gap-1 bg-muted/30 p-1 lg:w-auto">
          <TabsTrigger 
            value="技術指標" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <BarChart3 className="h-4 w-4" />
            <span>技術指標</span>
          </TabsTrigger>
          <TabsTrigger 
            value="突破分析" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Target className="h-4 w-4" />
            <span>突破分析</span>
          </TabsTrigger>
          <TabsTrigger 
            value="買賣訊號" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Zap className="h-4 w-4" />
            <span>買賣訊號</span>
          </TabsTrigger>
          <TabsTrigger 
            value="AI解讀" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Brain className="h-4 w-4" />
            <span>AI 深度解讀</span>
            <Badge className="ml-1 bg-primary/20 text-primary text-[10px] px-1.5">AI</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="技術指標" className="space-y-4">
          <IndicatorCards 股票代號={當前股票.代號} indicators={apiData?.indicators || undefined} />
        </TabsContent>

        <TabsContent value="突破分析" className="space-y-4">
          <BreakoutPanel data={apiData?.breakoutAnalysis || { breakoutLevel: 0, trueBreakoutScore: 0, falseBreakoutRisk: 0, volumeRatio: 0, closeStrength: 0, obvConfirmation: false, rsiDivergence: false, upperChipPressure: 0 }} />
        </TabsContent>

        <TabsContent value="買賣訊號" className="space-y-4">
          <SignalPanel data={apiData?.signalData || { buyScore: 0, sellScore: 0, entryZone: { low: 0, high: 0 }, stopLoss: 0, targets: [], riskRewardRatio: 0 }} currentPrice={當前股票.價格} />
        </TabsContent>

        <TabsContent value="AI解讀" className="space-y-6">
          {/* AI 分析頭部 */}
          <Card className="glass-card relative overflow-hidden border-border/30">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-2xl" />
            
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold tracking-tight">
                      AI 深度解讀
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      基於多維度數據的智慧分析報告
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">分析信心度</div>
                    <div className="text-2xl font-bold text-primary">{aiAnalysis.信心度}%</div>
                  </div>
                  <ScoreGauge score={aiAnalysis.信心度} size="sm" />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* AI 分析內容 */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 技術面分析 */}
            <Card className="glass-card border-border/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                    <Activity className="h-4 w-4 text-emerald-500" />
                  </div>
                  技術面分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {aiAnalysis.技術面}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    均線多頭排列
                  </Badge>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    MACD 金叉
                  </Badge>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    量價配合
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* 籌碼面分析 */}
            <Card className="glass-card border-border/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
                    <Layers className="h-4 w-4 text-blue-500" />
                  </div>
                  籌碼面分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {aiAnalysis.籌碼面}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    籌碼集中
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    主力買超
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    OBV 創高
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* 操作建議 */}
            <Card className="glass-card border-border/30 lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  操作建議
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {aiAnalysis.操作建議}
                </p>
                
                {/* 關鍵價位 */}
                {supportLevels.length >= 2 && resistanceLevels.length >= 2 && (
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl bg-emerald-500/10 p-4 ring-1 ring-emerald-500/20">
                      <div className="text-xs text-muted-foreground">進場區間</div>
                      <div className="mt-1 text-xl font-bold text-emerald-500">
                        ${supportLevels[0].toFixed(2)} - ${(supportLevels[0] + 2).toFixed(2)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-rose-500/10 p-4 ring-1 ring-rose-500/20">
                      <div className="text-xs text-muted-foreground">停損價位</div>
                      <div className="mt-1 text-xl font-bold text-rose-500">
                        ${(supportLevels[1] - 2).toFixed(2)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-primary/10 p-4 ring-1 ring-primary/20">
                      <div className="text-xs text-muted-foreground">目標價位</div>
                      <div className="mt-1 text-xl font-bold text-primary">
                        ${resistanceLevels[1].toFixed(2)} - ${resistanceLevels[2]?.toFixed(2) || (resistanceLevels[1] + 5).toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 風險提示 */}
            <Card className="glass-card border-amber-500/30 bg-amber-500/5 lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                  風險提示
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {aiAnalysis.風險提示.split('\n').map((風險, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                      <span>{風險.replace(/^\d+\.\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* 免責聲明 */}
          <div className="rounded-xl bg-muted/30 p-4 text-xs text-muted-foreground">
            <p>
              <strong>免責聲明：</strong>本分析報告由 AI 模型自動生成，僅供參考，不構成任何投資建議。
              投資有風險，入市需謹慎。過去績效不代表未來表現。請依據自身風險承受能力做出投資決策。
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
