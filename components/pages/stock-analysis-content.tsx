"use client"

/**
 * 股票分析內容元件
 * 整合價格圖表、技術指標、量價分析、突破偵測和買賣訊號
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import { PriceChartMock } from "@/components/charts/price-chart-mock"
import { IndicatorCards } from "@/components/charts/indicator-cards"
import { VolumeProfileChart } from "@/components/charts/volume-profile-chart"
import { BreakoutPanel } from "@/components/charts/breakout-panel"
import { SignalPanel } from "@/components/charts/signal-panel"
import { ScoreGauge } from "@/components/dashboard/score-gauge"
import { SignalBadge } from "@/components/dashboard/signal-badge"
import { RiskBadge } from "@/components/dashboard/risk-badge"

/** 熱門股票列表 */
const 熱門股票 = [
  { 代號: "2330", 名稱: "台積電", 價格: 892.00, 漲跌: 2.35 },
  { 代號: "2454", 名稱: "聯發科", 價格: 1285.00, 漲跌: -1.23 },
  { 代號: "2317", 名稱: "鴻海", 價格: 178.50, 漲跌: 1.42 },
  { 代號: "2308", 名稱: "台達電", 價格: 385.00, 漲跌: 0.78 },
  { 代號: "3008", 名稱: "大立光", 價格: 2150.00, 漲跌: -0.93 },
]

export function StockAnalysisContent() {
  // 當前選擇的股票
  const [當前股票, set當前股票] = useState({
    代號: "2330",
    名稱: "台積電",
    價格: 892.00,
    漲跌: 2.35,
    開盤: 885.00,
    最高: 898.00,
    最低: 882.00,
    成交量: "45,892",
  })

  // 搜尋關鍵字
  const [搜尋關鍵字, set搜尋關鍵字] = useState("")

  // 時間週期
  const [時間週期, set時間週期] = useState("日K")

  return (
    <div className="space-y-6">
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
              className="w-64 pl-10"
            />
          </div>
          <Select value={時間週期} onValueChange={set時間週期}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1分">1分</SelectItem>
              <SelectItem value="5分">5分</SelectItem>
              <SelectItem value="15分">15分</SelectItem>
              <SelectItem value="30分">30分</SelectItem>
              <SelectItem value="60分">60分</SelectItem>
              <SelectItem value="日K">日K</SelectItem>
              <SelectItem value="週K">週K</SelectItem>
              <SelectItem value="月K">月K</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 熱門股票快捷按鈕 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">熱門：</span>
          {熱門股票.map((股票) => (
            <Button
              key={股票.代號}
              variant={當前股票.代號 === 股票.代號 ? "default" : "outline"}
              size="sm"
              onClick={() =>
                set當前股票({
                  ...股票,
                  開盤: 股票.價格 * 0.99,
                  最高: 股票.價格 * 1.01,
                  最低: 股票.價格 * 0.98,
                  成交量: Math.floor(Math.random() * 50000 + 10000).toLocaleString(),
                })
              }
              className="h-8"
            >
              {股票.代號}
            </Button>
          ))}
        </div>
      </div>

      {/* 股票資訊卡片 */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* 股票基本資訊 */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Star className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{當前股票.代號}</span>
                  <span className="text-lg text-muted-foreground">{當前股票.名稱}</span>
                  <Badge variant="outline" className="text-xs">
                    上市
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>電子-半導體</span>
                  <span>市值: 23.16兆</span>
                </div>
              </div>
            </div>

            {/* 價格資訊 */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-foreground">
                    {當前股票.價格.toFixed(2)}
                  </span>
                  {當前股票.漲跌 >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-rose-500" />
                  )}
                </div>
                <div
                  className={`text-sm font-medium ${
                    當前股票.漲跌 >= 0 ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {當前股票.漲跌 >= 0 ? "+" : ""}
                  {當前股票.漲跌.toFixed(2)}%
                </div>
              </div>

              {/* 當日行情 */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">開盤</span>
                  <span className="font-medium">{當前股票.開盤.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">最高</span>
                  <span className="font-medium text-rose-500">
                    {當前股票.最高.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">成交量</span>
                  <span className="font-medium">{當前股票.成交量}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">最低</span>
                  <span className="font-medium text-emerald-500">
                    {當前股票.最低.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* AI 評分 */}
            <div className="flex items-center gap-4">
              <ScoreGauge
                score={78}
                label="AI 綜合評分"
                size="sm"
              />
              <div className="space-y-1">
                <SignalBadge signal="buy" />
                <RiskBadge risk={45} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 主要圖表區域 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* K線圖 - 佔據 2/3 寬度 */}
        <div className="lg:col-span-2">
          <Card className="glass-card h-full border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-primary" />
                  價格走勢圖
                </CardTitle>
                <div className="flex items-center gap-1">
                  {["1D", "1W", "1M", "3M", "1Y", "全部"].map((period) => (
                    <Button
                      key={period}
                      variant={period === "1M" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-7 px-2 text-xs"
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <PriceChartMock 股票代號={當前股票.代號} 時間週期={時間週期} />
            </CardContent>
          </Card>
        </div>

        {/* 量價分布圖 */}
        <div>
          <VolumeProfileChart 股票代號={當前股票.代號} />
        </div>
      </div>

      {/* 分頁標籤區域 */}
      <Tabs defaultValue="技術指標" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="技術指標" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">技術指標</span>
          </TabsTrigger>
          <TabsTrigger value="突破分析" className="gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">突破分析</span>
          </TabsTrigger>
          <TabsTrigger value="買賣訊號" className="gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">買賣訊號</span>
          </TabsTrigger>
          <TabsTrigger value="AI解讀" className="gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">AI 解讀</span>
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

        <TabsContent value="AI解讀" className="space-y-4">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-4 w-4 text-primary" />
                AI 深度解讀
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-primary/5 p-4">
                <h4 className="mb-2 font-medium">技術面分析</h4>
                <p className="text-sm text-muted-foreground">
                  {當前股票.代號} 目前處於多頭排列格局，短期均線支撐明顯。
                  MACD 呈現黃金交叉，配合成交量放大，短期上漲動能充足。
                  RSI 指標位於 65 附近，尚未進入超買區域，仍有上漲空間。
                  建議關注 {(當前股票.價格 * 0.98).toFixed(0)} 元支撐位。
                </p>
              </div>
              <div className="rounded-lg bg-primary/5 p-4">
                <h4 className="mb-2 font-medium">籌碼面分析</h4>
                <p className="text-sm text-muted-foreground">
                  外資近五日累計買超 12,500 張，投信連續三日買超。
                  融資餘額維持低檔，籌碼結構健康。主力成本線位於 875 元附近，
                  目前股價已站上主力成本，短線有望持續走高。
                </p>
              </div>
              <div className="rounded-lg bg-primary/5 p-4">
                <h4 className="mb-2 font-medium">操作建議</h4>
                <p className="text-sm text-muted-foreground">
                  綜合技術面與籌碼面分析，建議採取偏多操作策略。
                  可於回檔至 {(當前股票.價格 * 0.98).toFixed(0)}-{(當前股票.價格 * 0.99).toFixed(0)} 元區間分批布局，
                  停損設於 {(當前股票.價格 * 0.95).toFixed(0)} 元以下，
                  目標價看至 {(當前股票.價格 * 1.08).toFixed(0)} 元。
                  風險報酬比約 1:2.5，屬於適合進場的交易機會。
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
