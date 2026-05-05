"use client"

/**
 * 股票分析內容元件
 * Stock Analysis Content Component
 * 
 * 整合進階K線圖、技術指標、量價分析、突破偵測和買賣訊號
 * 使用專業級圖表元件展示完整的技術分析資訊
 */

import { useState, useMemo } from "react"
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
import { generateCandlestickData, chartMarkers, volumeProfileData, chipDistribution } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

/** 熱門股票列表 */
const 熱門股票 = [
  { 代號: "AAPL", 名稱: "蘋果", 價格: 189.84, 漲跌: 2.35, 英文: "Apple Inc." },
  { 代號: "NVDA", 名稱: "輝達", 價格: 878.35, 漲跌: 3.28, 英文: "NVIDIA Corp." },
  { 代號: "MSFT", 名稱: "微軟", 價格: 425.22, 漲跌: 1.15, 英文: "Microsoft Corp." },
  { 代號: "AMD", 名稱: "超微", 價格: 180.25, 漲跌: -0.85, 英文: "Advanced Micro Devices" },
  { 代號: "META", 名稱: "Meta", 價格: 505.40, 漲跌: 1.92, 英文: "Meta Platforms" },
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
  const [當前股票, set當前股票] = useState({
    代號: "AAPL",
    名稱: "蘋果",
    英文: "Apple Inc.",
    價格: 189.84,
    漲跌: 2.35,
    開盤: 187.50,
    最高: 191.25,
    最低: 186.80,
    成交量: "52.3M",
    市值: "$2.95T",
    產業: "科技-消費電子",
    本益比: 28.5,
    股息率: 0.52,
  })

  // 搜尋關鍵字
  const [搜尋關鍵字, set搜尋關鍵字] = useState("")

  // 時間週期
  const [時間週期, set時間週期] = useState("日K")

  // 是否收藏
  const [已收藏, set已收藏] = useState(false)

  // 生成模擬K線數據
  const candlestickData = useMemo(() => generateCandlestickData(90), [])

  // 模擬支撐阻力位
  const supportLevels = useMemo(() => [186.50, 183.20], [])
  const resistanceLevels = useMemo(() => [192.50, 195.00], [])

  // 模擬突破標註
  const breakoutAnnotations = useMemo(() => [
    { date: candlestickData[candlestickData.length - 15]?.date || '', type: 'true-breakout' as const, price: 188.50, label: '突破盤整區間' },
    { date: candlestickData[candlestickData.length - 35]?.date || '', type: 'false-breakout' as const, price: 185.00, label: '假突破回落' },
  ], [candlestickData])

  // AI 分析結果
  const aiAnalysis: AIAnalysisResult = {
    技術面: `${當前股票.代號} 目前呈現穩健的多頭格局。短中長期均線多頭排列，MA20 上穿 MA60 形成黃金交叉。MACD 柱狀圖持續擴張，動能增強。布林帶開口擴大，價格沿上軌運行，顯示強勁的上升趨勢。RSI 維持在 58-65 區間，尚未進入超買區域，仍有上漲空間。成交量配合良好，量價齊揚。`,
    籌碼面: `籌碼結構健康。當前價格位於 POC (成本密集區) 上方，大部分持有者處於獲利狀態。上方套牢籌碼比例僅 22.5%，突破阻力相對容易。下方支撐密度達 67.8%，提供堅實的價格支撐。主力資金持續流入，近五日累計淨流入 $1.2B。OBV 指標創近期新高，確認上漲有效性。`,
    操作建議: `綜合技術面與籌碼面分析，建議採取偏多操作策略。可於回檔至 $${supportLevels[0].toFixed(2)}-$${(supportLevels[0] + 2).toFixed(2)} 區間分批布局，或等待突破 $${resistanceLevels[0].toFixed(2)} 後追進。停損設於 $${(supportLevels[1] - 2).toFixed(2)} 以下，目標價看至 $${resistanceLevels[1].toFixed(2)}、$200.00。風險報酬比約 1:2.8，屬於適合進場的交易機會。`,
    風險提示: `1. RSI 接近超買區域，短期可能出現技術性回檔\n2. 大盤若轉弱可能拖累個股表現\n3. 需關注財報公布前後的波動風險\n4. 若跌破 $${supportLevels[1].toFixed(2)} 支撐，需重新評估多頭看法`,
    信心度: 78,
  }

  // 處理股票切換
  const handleStockChange = (股票: typeof 熱門股票[0]) => {
    set當前股票({
      代號: 股票.代號,
      名稱: 股票.名稱,
      英文: 股票.英文,
      價格: 股票.價格,
      漲跌: 股票.漲跌,
      開盤: 股票.價格 * (0.995 + Math.random() * 0.01),
      最高: 股票.價格 * (1.005 + Math.random() * 0.01),
      最低: 股票.價格 * (0.985 + Math.random() * 0.01),
      成交量: (Math.random() * 50 + 20).toFixed(1) + "M",
      市值: `$${(Math.random() * 2 + 0.5).toFixed(2)}T`,
      產業: "科技",
      本益比: Math.random() * 20 + 20,
      股息率: Math.random() * 2,
    })
    set已收藏(false)
  }

  return (
    <div className="space-y-6">
      {/* 頂部 AIGC 裝飾背景 */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[400px] overflow-hidden">
        <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
        <div className="absolute right-1/4 top-40 h-64 w-64 rounded-full bg-gradient-to-br from-chart-1/10 to-transparent blur-3xl" />
        <div className="neural-network-bg absolute inset-0 opacity-30" />
      </div>

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
              <span className={cn(
                "text-xs",
                股票.漲跌 >= 0 ? "text-emerald-500" : "text-rose-500"
              )}>
                {股票.漲跌 >= 0 ? '+' : ''}{股票.漲跌.toFixed(2)}%
              </span>
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
                  最後更新: {new Date().toLocaleTimeString('zh-TW')}
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
            vwap={188.92}
            anchoredVwap={186.50}
            support={supportLevels}
            resistance={resistanceLevels}
            breakoutAnnotations={breakoutAnnotations}
          />
        </div>

        {/* 進階量價分布圖 */}
        <div>
          <AdvancedVolumeProfile
            data={volumeProfileData}
            chipData={chipDistribution}
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
          <IndicatorCards 股票代號={當前股票.代號} />
        </TabsContent>

        <TabsContent value="突破分析" className="space-y-4">
          <BreakoutPanel 股票代號={當前股票.代號} />
        </TabsContent>

        <TabsContent value="買賣訊號" className="space-y-4">
          <SignalPanel 股票代號={當前股票.代號} />
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
                      ${resistanceLevels[1].toFixed(2)} - $200.00
                    </div>
                  </div>
                </div>
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
