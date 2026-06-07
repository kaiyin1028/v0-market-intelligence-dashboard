"use client"

/**
 * AI 分析師內容元件
 * 提供 AI 驅動的市場分析對話介面
 */

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Brain,
  Send,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  MessageSquare,
  Lightbulb,
  BarChart3,
  Zap,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Search,
} from "lucide-react"
import { ScoreGauge } from "@/components/dashboard/score-gauge"
import { SignalBadge } from "@/components/dashboard/signal-badge"
import { askAIAnalyst, getStockAnalysis, searchStocks } from "@/lib/api"
import type { AIAnalysis, TechnicalIndicators, VolumeProfile, ChipDistribution, BreakoutAnalysis, SignalData, Stock } from "@/types"

/** 對話訊息類型 */
interface 對話訊息 {
  id: string
  角色: "user" | "assistant"
  內容: string
  時間: string
  分析數據?: {
    股票代號?: string
    評分?: number
    訊號?: string
    風險?: string
  }
}

/** 預設對話 */
const 預設對話: 對話訊息[] = [
  {
    id: "1",
    角色: "assistant",
    內容: "您好！我是 AI 分析師助手，專精於美股與港股技術分析、量價分析和籌碼分析。涵蓋標的包括美國科技股、大型藍籌及香港恆生指數成分股。您可以詢問我關於個股診斷、市場趨勢、投資建議等問題。請問有什麼可以幫您的嗎？",
    時間: "09:00",
  },
]

/** 快速提問建議 */
const 快速提問 = [
  "分析 AAPL 近期走勢",
  "分析 NVDA 技術面與籌碼面",
  "今日美股有哪些值得關注的突破訊號？",
  "恆生指數後市展望如何？",
  "推薦適合短線操作的美股標的",
]

/** AI 市場觀點 */
const AI市場觀點 = [
  {
    標題: "美股半導體動能強勁",
    內容: "受惠於 AI 晶片需求持續成長，NVIDIA、AMD、AVGO 等半導體龍頭表現亮眼。TSMC ADR (TSM) 亦獲華爾街青睞。建議關注製程領先且具備 AI 佈局的個股。",
    標籤: ["半導體", "AI"],
    情緒: "正面",
  },
  {
    標題: "聯準會利率政策影響評估",
    內容: "市場聚焦聯準會利率決策，大型科技股對利率敏感度較高。建議關注高現金流、低負債的優質藍籌股。",
    標籤: ["利率", "宏觀"],
    情緒: "中性",
  },
  {
    標題: "中概股與港股面臨壓力",
    內容: "受到地緣政治與監管不確定性影響，部分中概股與恆生科技成分股波動加劇。建議控制倉位並設定嚴格停損。",
    標籤: ["中概股", "港股"],
    情緒: "負面",
  },
]

/** AI 推薦標的 */
const AI推薦標的 = [
  { 代號: "AAPL", 名稱: "蘋果", 評分: 88, 訊號: "買入", 理由: "技術面多頭排列，服務業收入穩健增長" },
  { 代號: "NVDA", 名稱: "輝達", 評分: 92, 訊號: "買入", 理由: "AI 晶片需求強勁，數據中心收入持續創高" },
  { 代號: "0700.HK", 名稱: "騰訊控股", 評分: 78, 訊號: "觀望", 理由: "遊戲版號回暖，等待突破訊號" },
  { 代號: "TSLA", 名稱: "特斯拉", 評分: 75, 訊號: "觀望", 理由: "Robotaxi 題材發酵，但競爭加劇" },
]

export function AIAnalystContent() {
  // 對話狀態
  const [對話列表, set對話列表] = useState<對話訊息[]>(預設對話)
  const [輸入內容, set輸入內容] = useState("")
  const [是否載入中, set是否載入中] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Agent 狀態：當前分析標的與系統數據
  const [currentTicker, setCurrentTicker] = useState<string>("")
  const [tickerInput, setTickerInput] = useState<string>("")
  const [analysisData, setAnalysisData] = useState<{
    stock: Stock | null
    indicators: TechnicalIndicators | null
    volumeProfile: VolumeProfile[]
    chipDistribution: ChipDistribution | null
    breakoutAnalysis: BreakoutAnalysis | null
    signalData: SignalData | null
    aiAnalysis: AIAnalysis | null
  } | null>(null)
  const [loadingData, setLoadingData] = useState(false)

  // 從 URL 參數讀取 ticker
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const tickerFromUrl = params.get('ticker')
    if (tickerFromUrl) {
      setCurrentTicker(tickerFromUrl.toUpperCase())
      setTickerInput(tickerFromUrl.toUpperCase())
    }
  }, [])

  // 載入股票分析數據
  useEffect(() => {
    if (!currentTicker) return
    let cancelled = false
    setLoadingData(true)
    getStockAnalysis(currentTicker, '1d')
      .then((res) => {
        if (cancelled) return
        setAnalysisData({
          stock: res.stock || null,
          indicators: res.indicators || null,
          volumeProfile: res.volumeProfile || [],
          chipDistribution: res.chipDistribution || null,
          breakoutAnalysis: res.breakoutAnalysis || null,
          signalData: res.signalData || null,
          aiAnalysis: res.aiAnalysis || null,
        })
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to load analysis data:', err)
          setAnalysisData(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingData(false)
      })
    return () => { cancelled = true }
  }, [currentTicker])

  // 自動捲動到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [對話列表])

  /** 搜尋並設定股票 */
  const handleTickerSearch = async () => {
    const query = tickerInput.trim().toUpperCase()
    if (!query) return
    try {
      const results = await searchStocks(query)
      if (results && results.length > 0) {
        setCurrentTicker(results[0].ticker)
        setTickerInput(results[0].ticker)
      } else {
        alert(`找不到股票「${query}」，請檢查代號是否正確`)
      }
    } catch {
      alert('搜尋失敗，請稍後再試')
    }
  }

  /** 發送訊息 */
  const 發送訊息 = async (訊息內容: string) => {
    if (!訊息內容.trim()) return

    // 新增使用者訊息
    const 使用者訊息: 對話訊息 = {
      id: Date.now().toString(),
      角色: "user",
      內容: 訊息內容,
      時間: new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" }),
    }
    set對話列表((prev) => [...prev, 使用者訊息])
    set輸入內容("")
    set是否載入中(true)
    setApiError(null)

    try {
      // 構建 Agent 上下文：將系統已分析的數據傳給 AI
      const context = analysisData && currentTicker
        ? {
            ticker: currentTicker,
            timeframe: '1d',
            indicators: analysisData.indicators || undefined,
            breakoutAnalysis: analysisData.breakoutAnalysis || undefined,
            signalData: analysisData.signalData || undefined,
            chipDistribution: analysisData.chipDistribution || undefined,
            aiAnalysis: analysisData.aiAnalysis || undefined,
          }
        : undefined

      const res = await askAIAnalyst(訊息內容, context)
      const AI回覆: 對話訊息 = {
        id: Date.now().toString(),
        角色: "assistant",
        內容: res.response,
        時間: new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" }),
        分析數據: res.analysis
          ? {
              股票代號: currentTicker || "AAPL",
              評分: Math.round(res.analysis.confidence),
              訊號: res.analysis.trendView === "bullish" ? "買入" : res.analysis.trendView === "bearish" ? "賣出" : "觀望",
              風險: "中",
            }
          : undefined,
      }
      set對話列表((prev) => [...prev, AI回覆])
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "AI 分析失敗")
      // Fallback to local mock
      const AI回覆 = 生成AI回覆(訊息內容)
      set對話列表((prev) => [...prev, AI回覆])
    } finally {
      set是否載入中(false)
    }
  }

  /** 生成 AI 回覆 (模擬) */
  const 生成AI回覆 = (問題: string): 對話訊息 => {
    const 時間 = new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })

    if (問題.includes("AAPL") || 問題.includes("蘋果")) {
      return {
        id: Date.now().toString(),
        角色: "assistant",
        內容: `## AAPL 技術分析

**當前狀態**：多頭趨勢中，短期均線支撐明確

**技術面分析**：
- 目前股價站穩 20 日與 50 日均線上方，呈現多頭排列
- MACD 指標呈現黃金交叉，動能轉強
- RSI 位於 65 附近，尚未進入超買區

**基本面亮點**：
- 服務業收入持續創高，生態系護城河深厚
- iPhone 16 週期與 Apple Intelligence 題材發酵
- 現金流穩健，回購與配息支撐股價底

**操作建議**：
建議於回檔至 20 日均線附近布局，停損設於近期低點下方，目標價看至前高 +5-8%。`,
        時間,
        分析數據: {
          股票代號: "AAPL",
          評分: 88,
          訊號: "買入",
          風險: "中",
        },
      }
    }

    if (問題.includes("突破") || 問題.includes("訊號")) {
      return {
        id: Date.now().toString(),
        角色: "assistant",
        內容: `## 今日美股重要突破訊號

**高信心度突破 (> 80%)**：
1. **NVDA** - 突破歷史新高，AI 晶片需求持續強勁
2. **MSFT** - 突破整理區間上緣，雲端業務動能穩健
3. **AVGO** - 突破壓力位，博通 AI 客製化晶片題材發酵

**中信心度突破 (60-80%)**：
1. **AMD** - 突破頭肩底頸線，資料中心市占率提升
2. **CRM** - MACD 金叉突破，AI Agent 產品週期啟動

**注意事項**：
- 納斯達克指數是否配合放量是關鍵
- 建議設定停損，避免假突破風險
- 關注盤後大型科技股財報與財測`,
        時間,
      }
    }

    if (問題.includes("大盤") || 問題.includes("後市") || 問題.includes("恆生") || 問題.includes("港股")) {
      return {
        id: Date.now().toString(),
        角色: "assistant",
        內容: `## 美股與港股後市展望

**整體評估**：美股短多格局，港股區間震盪

**美股技術面觀察**：
- 標普 500 指數站穩 20 日與 50 日均線上方
- 納斯達克 100 相對強勢，科技族群領漲
- 上檔注意前期高點套牢賣壓

**港股觀察**：
- 恆生指數於 17,000-18,000 點區間整理
- 科技股波動較大，關注南向資金流向
- 地緣政治風險仍為主要不確定性

**操作策略**：
1. 美股維持 6-7 成持股水位，聚焦 AI 供應鏈
2. 港股控制倉位，嚴設停損
3. 保留現金應對聯準會利率決策與財報季波動
4. 逢低佈局優質藍籌而非追高`,
        時間,
      }
    }

    // 預設回覆
    return {
      id: Date.now().toString(),
      角色: "assistant",
      內容: `感謝您的提問！

根據目前市場狀況，我建議您關注以下幾個面向：

1. **技術分析**：觀察均線排列和量價配合度
2. **籌碼分析**：追蹤三大法人動向
3. **風險控制**：設定明確的停損停利點

如需更詳細的個股分析，請提供具體的股票代號，我會為您進行深入診斷。`,
      時間,
    }
  }

  return (
    <div className="relative grid min-h-[calc(100vh-10rem)] gap-6 lg:grid-cols-3">
      {/* AIGC 裝飾背景 - AI Brain 圖片 */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute right-0 top-0 h-[500px] w-[600px] opacity-[0.03] dark:opacity-[0.06]">
          <Image
            src="/images/ai-brain.jpg"
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-background/50 to-background" />
        </div>
        <div className="absolute bottom-1/4 left-10 h-64 w-64 rounded-full bg-gradient-to-br from-violet-500/10 to-blue-500/5 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-48 w-48 rounded-full bg-gradient-to-br from-cyan-500/8 to-emerald-500/4 blur-3xl animate-pulse" />
      </div>
      
      {/* 左側：AI 對話區 */}
      <Card className="glass-card flex flex-col border-border/50 lg:col-span-2">
        <CardHeader className="border-b border-border/50 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-5 w-5 text-primary" />
              AI 智慧分析師
              <Badge variant="secondary" className="ml-2">
                <Sparkles className="mr-1 h-3 w-3" />
                Agent 模式
              </Badge>
            </CardTitle>
            {/* 股票選擇器 */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="輸入股票代號..."
                  value={tickerInput}
                  onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleTickerSearch()
                    }
                  }}
                  className="h-8 w-36 bg-muted/30 pl-7 text-xs rounded-lg"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-lg"
                onClick={handleTickerSearch}
                disabled={loadingData}
              >
                {loadingData ? <RefreshCw className="h-3 w-3 animate-spin" /> : <BarChart3 className="h-3 w-3" />}
                載入數據
              </Button>
            </div>
          </div>
          {currentTicker && analysisData?.stock && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {currentTicker}
              </Badge>
              <span>${analysisData.stock.price.toFixed(2)}</span>
              <span className={analysisData.stock.changePercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                {analysisData.stock.changePercent >= 0 ? '+' : ''}{analysisData.stock.changePercent.toFixed(2)}%
              </span>
              {analysisData.indicators && (
                <>
                  <span>RSI {analysisData.indicators.rsi.toFixed(1)}</span>
                  <span>MACD {analysisData.indicators.macd.histogram > 0 ? '+' : ''}{analysisData.indicators.macd.histogram.toFixed(2)}</span>
                </>
              )}
              {analysisData.aiAnalysis && (
                <Badge variant="secondary" className="text-[10px]">
                  AI 信心度 {Math.round(analysisData.aiAnalysis.confidence)}%
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        {/* 對話區域 */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {對話列表.map((訊息) => (
              <div
                key={訊息.id}
                className={`flex gap-3 ${
                  訊息.角色 === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="h-8 w-8">
                  {訊息.角色 === "assistant" ? (
                    <>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Brain className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback>U</AvatarFallback>
                  )}
                </Avatar>

                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    訊息.角色 === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{訊息.內容}</div>

                  {訊息.分析數據 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/20 pt-3">
                      {訊息.分析數據.評分 && (
                        <Badge variant="outline" className="gap-1">
                          <Target className="h-3 w-3" />
                          評分: {訊息.分析數據.評分}
                        </Badge>
                      )}
                      {訊息.分析數據.訊號 && (
                        <SignalBadge
                          signal={訊息.分析數據.訊號 === "買入" ? "buy" : 訊息.分析數據.訊號 === "賣出" ? "sell" : "hold"}
                        />
                      )}
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs opacity-60">{訊息.時間}</span>
                    {訊息.角色 === "assistant" && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {是否載入中 && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Brain className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 rounded-lg bg-muted p-4">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI 分析中...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* API 錯誤提示 */}
        {apiError && (
          <div className="border-t border-border/50 px-4 py-2">
            <div className="flex items-center gap-2 rounded-xl bg-amber-500/5 border border-amber-500/20 px-3 py-1.5 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              AI 服務暫時無法連線，已切換至本地模擬回覆（{apiError}）
            </div>
          </div>
        )}

        {/* 快速提問 */}
        <div className="border-t border-border/50 p-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {快速提問.map((提問) => (
              <Button
                key={提問}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => 發送訊息(提問)}
              >
                {提問}
              </Button>
            ))}
          </div>

          {/* 輸入區域 */}
          <div className="flex gap-2">
            <Input
              placeholder="輸入您的問題..."
              value={輸入內容}
              onChange={(e) => set輸入內容(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  發送訊息(輸入內容)
                }
              }}
              disabled={是否載入中}
            />
            <Button
              onClick={() => 發送訊息(輸入內容)}
              disabled={是否載入中 || !輸入內容.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* 右側：AI 洞察面板 */}
      <div className="space-y-6">
        {/* 當前標的分析摘要 */}
        {currentTicker && analysisData && (
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-primary" />
                {currentTicker} 系統數據
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysisData.indicators && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-muted/30 p-2">
                    <span className="text-muted-foreground">RSI</span>
                    <div className="font-mono font-medium">{analysisData.indicators.rsi.toFixed(1)}</div>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-2">
                    <span className="text-muted-foreground">MACD</span>
                    <div className={`font-mono font-medium ${analysisData.indicators.macd.histogram >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {analysisData.indicators.macd.histogram >= 0 ? '+' : ''}{analysisData.indicators.macd.histogram.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-2">
                    <span className="text-muted-foreground">ADX</span>
                    <div className="font-mono font-medium">{analysisData.indicators.adx.toFixed(1)}</div>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-2">
                    <span className="text-muted-foreground">ATR</span>
                    <div className="font-mono font-medium">{analysisData.indicators.atr.toFixed(2)}</div>
                  </div>
                </div>
              )}
              {analysisData.breakoutAnalysis && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">真突破分數</span>
                    <span className="font-medium">{analysisData.breakoutAnalysis.trueBreakoutScore.toFixed(0)}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">假突破風險</span>
                    <span className={`font-medium ${analysisData.breakoutAnalysis.falseBreakoutRisk > 50 ? 'text-rose-500' : ''}`}>
                      {analysisData.breakoutAnalysis.falseBreakoutRisk.toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
              {analysisData.signalData && (
                <div className="flex items-center justify-between rounded-lg bg-primary/5 p-2 ring-1 ring-primary/20">
                  <div className="text-xs text-muted-foreground">系統訊號</div>
                  <div className="flex items-center gap-2">
                    <ScoreGauge score={analysisData.signalData.buyScore} label="買" size="sm" />
                    <ScoreGauge score={analysisData.signalData.sellScore} label="賣" size="sm" />
                  </div>
                </div>
              )}
              <div className="text-[10px] text-muted-foreground">
                AI 分析師已連接系統數據，回答將引用上述指標
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI 市場觀點 */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-primary" />
              AI 市場觀點
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {AI市場觀點.map((觀點, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border/50 p-3 transition-all hover:border-primary/50"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{觀點.標題}</span>
                  {觀點.情緒 === "正面" ? (
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  ) : 觀點.情緒 === "負面" ? (
                    <TrendingDown className="h-4 w-4 text-rose-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{觀點.內容}</p>
                <div className="mt-2 flex gap-1">
                  {觀點.標籤.map((標籤) => (
                    <Badge key={標籤} variant="secondary" className="text-xs">
                      {標籤}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI 推薦標的 */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-primary" />
              AI 推薦關注
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {AI推薦標的.map((標的) => (
              <div
                key={標的.代號}
                className="flex items-center justify-between rounded-lg border border-border/50 p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{標的.代號}</span>
                    <span className="text-sm text-muted-foreground">
                      {標的.名稱}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {標的.理由}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <ScoreGauge score={標的.評分} label="" size="sm" />
                  <SignalBadge
                    signal={標的.訊號 === "買入" ? "buy" : 標的.訊號 === "賣出" ? "sell" : "hold"}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
