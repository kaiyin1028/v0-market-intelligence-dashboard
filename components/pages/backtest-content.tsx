"use client"

/**
 * 回測內容元件
 * Backtest Content Component
 * 
 * 提供策略回測設定和結果展示
 * 包含專業級權益曲線、回撤圖、月度熱力圖和交易分布圖
 */

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Play,
  Settings,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Shield,
  Zap,
  Calendar,
  DollarSign,
  Percent,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  LineChart,
  RefreshCw,
} from "lucide-react"
import { ScoreGauge } from "@/components/dashboard/score-gauge"
import { 
  EquityCurveChart, 
  DrawdownChart, 
  MonthlyReturnHeatmap, 
  TradeDistributionHistogram 
} from "@/components/charts/backtest-charts"
import { cn } from "@/lib/utils"

/** 生成權益曲線數據 */
const generateEquityCurve = (months: number = 24) => {
  const data = []
  let strategyValue = 100
  let benchmarkValue = 100
  
  for (let i = 0; i < months; i++) {
    const date = new Date(2023, i, 1)
    const strategyReturn = (Math.random() - 0.35) * 10 // 偏多的隨機報酬
    const benchmarkReturn = (Math.random() - 0.45) * 6 // 基準報酬較低
    
    strategyValue *= (1 + strategyReturn / 100)
    benchmarkValue *= (1 + benchmarkReturn / 100)
    
    data.push({
      date: `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`,
      strategy: Number(strategyValue.toFixed(2)),
      benchmark: Number(benchmarkValue.toFixed(2)),
    })
  }
  
  return data
}

/** 生成回撤數據 */
const generateDrawdownData = (months: number = 24) => {
  const data = []
  let maxValue = 100
  let currentValue = 100
  
  for (let i = 0; i < months; i++) {
    const date = new Date(2023, i, 1)
    const change = (Math.random() - 0.4) * 8
    currentValue *= (1 + change / 100)
    
    if (currentValue > maxValue) {
      maxValue = currentValue
    }
    
    const drawdown = ((currentValue - maxValue) / maxValue) * 100
    
    data.push({
      date: `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`,
      drawdown: Number(drawdown.toFixed(2)),
    })
  }
  
  return data
}

/** 生成月度報酬數據 */
const generateMonthlyReturns = () => {
  const data = []
  const years = [2023, 2024]
  
  for (const year of years) {
    for (let month = 1; month <= 12; month++) {
      if (year === 2024 && month > 6) break // 只到2024年6月
      
      data.push({
        year,
        month,
        monthName: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'][month - 1],
        return: Number(((Math.random() - 0.35) * 15).toFixed(1)),
      })
    }
  }
  
  return data
}

/** 交易分布數據 */
const tradeDistribution = [
  { range: '< -10%', count: 5 },
  { range: '-10% ~ -5%', count: 12 },
  { range: '-5% ~ 0%', count: 38 },
  { range: '0% ~ 5%', count: 52 },
  { range: '5% ~ 10%', count: 35 },
  { range: '> 10%', count: 14 },
]

/** 交易記錄 */
const 交易記錄 = [
  { 日期: "2024/06/15", 類型: "買入", 股票: "NVDA", 價格: 892, 數量: 100, 損益: null, 狀態: "持有中" },
  { 日期: "2024/06/10", 類型: "賣出", 股票: "AMD", 價格: 185, 數量: 200, 損益: 3500, 狀態: "已平倉" },
  { 日期: "2024/06/05", 類型: "買入", 股票: "AAPL", 價格: 188, 數量: 150, 損益: null, 狀態: "持有中" },
  { 日期: "2024/05/28", 類型: "賣出", 股票: "MSFT", 價格: 428, 數量: 80, 損益: 2400, 狀態: "已平倉" },
  { 日期: "2024/05/20", 類型: "買入", 股票: "AMD", 價格: 168, 數量: 200, 損益: null, 狀態: "已平倉" },
  { 日期: "2024/05/15", 類型: "賣出", 股票: "NVDA", 價格: 920, 數量: 50, 損益: 5500, 狀態: "已平倉" },
  { 日期: "2024/05/10", 類型: "買入", 股票: "META", 價格: 485, 數量: 60, 損益: null, 狀態: "持有中" },
  { 日期: "2024/05/05", 類型: "賣出", 股票: "GOOGL", 價格: 178, 數量: 120, 損益: -1200, 狀態: "已平倉" },
]

/** 績效指標 */
const 績效指標 = {
  總報酬率: 78.5,
  年化報酬: 45.2,
  夏普比率: 1.85,
  索提諾比率: 2.42,
  卡瑪比率: 2.15,
  最大回撤: -12.5,
  勝率: 68.5,
  盈虧比: 2.35,
  交易次數: 156,
  平均持倉: 8.5,
  獲利因子: 2.18,
  期望值: 1.85,
}

export function BacktestContent() {
  // 策略參數
  const [是否執行回測, set是否執行回測] = useState(false)
  const [正在執行, set正在執行] = useState(false)
  const [RSI上限, setRSI上限] = useState([70])
  const [RSI下限, setRSI下限] = useState([30])
  const [停損比例, set停損比例] = useState([5])
  const [停利比例, set停利比例] = useState([15])

  // 生成圖表數據
  const equityCurveData = useMemo(() => generateEquityCurve(18), [])
  const drawdownData = useMemo(() => generateDrawdownData(18), [])
  const monthlyReturns = useMemo(() => generateMonthlyReturns(), [])

  // 模擬執行回測
  const handleRunBacktest = () => {
    set正在執行(true)
    setTimeout(() => {
      set正在執行(false)
      set是否執行回測(true)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* 頂部 AIGC 裝飾 */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[300px] overflow-hidden">
        <div className="absolute left-1/3 top-10 h-60 w-60 rounded-full bg-gradient-to-br from-chart-1/10 to-transparent blur-3xl" />
        <div className="absolute right-1/3 top-20 h-48 w-48 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
      </div>

      {/* 策略設定區 */}
      <Card className="glass-card overflow-hidden border-border/30">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold tracking-tight">
                  策略參數設定
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  配置回測參數並執行量化策略驗證
                </p>
              </div>
            </div>
            
            <Badge variant="outline" className="gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              <CheckCircle2 className="h-3 w-3" />
              策略就緒
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-5">
            {/* 基本設定 */}
            <div className="space-y-4 rounded-xl bg-muted/20 p-4">
              <h4 className="flex items-center gap-2 font-medium">
                <Target className="h-4 w-4 text-primary" />
                基本設定
              </h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">回測標的</Label>
                  <Select defaultValue="AAPL">
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AAPL">AAPL 蘋果</SelectItem>
                      <SelectItem value="NVDA">NVDA 輝達</SelectItem>
                      <SelectItem value="MSFT">MSFT 微軟</SelectItem>
                      <SelectItem value="portfolio">投資組合</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">回測期間</Label>
                  <Select defaultValue="1y">
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3m">近三個月</SelectItem>
                      <SelectItem value="6m">近半年</SelectItem>
                      <SelectItem value="1y">近一年</SelectItem>
                      <SelectItem value="3y">近三年</SelectItem>
                      <SelectItem value="5y">近五年</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">初始資金</Label>
                  <Input 
                    type="number" 
                    defaultValue="100000" 
                    className="bg-background/50 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 進場條件 */}
            <div className="space-y-4 rounded-xl bg-muted/20 p-4">
              <h4 className="flex items-center gap-2 font-medium">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                進場條件
              </h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">技術指標</Label>
                  <Select defaultValue="macd-rsi">
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="macd">MACD 金叉</SelectItem>
                      <SelectItem value="rsi">RSI 超賣反彈</SelectItem>
                      <SelectItem value="macd-rsi">MACD + RSI</SelectItem>
                      <SelectItem value="bollinger">布林通道突破</SelectItem>
                      <SelectItem value="custom">自訂組合</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <Label>RSI 超賣區</Label>
                    <span className="font-mono text-primary">{RSI下限}%</span>
                  </div>
                  <Slider
                    value={RSI下限}
                    onValueChange={setRSI下限}
                    min={10}
                    max={50}
                    step={5}
                    className="py-1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">成交量確認</Label>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            {/* 出場條件 */}
            <div className="space-y-4 rounded-xl bg-muted/20 p-4">
              <h4 className="flex items-center gap-2 font-medium">
                <ArrowDownRight className="h-4 w-4 text-rose-500" />
                出場條件
              </h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <Label>RSI 超買區</Label>
                    <span className="font-mono text-rose-500">{RSI上限}%</span>
                  </div>
                  <Slider
                    value={RSI上限}
                    onValueChange={setRSI上限}
                    min={50}
                    max={90}
                    step={5}
                    className="py-1"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <Label>停損比例</Label>
                    <span className="font-mono text-rose-500">{停損比例}%</span>
                  </div>
                  <Slider
                    value={停損比例}
                    onValueChange={set停損比例}
                    min={1}
                    max={15}
                    step={1}
                    className="py-1"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <Label>停利比例</Label>
                    <span className="font-mono text-emerald-500">{停利比例}%</span>
                  </div>
                  <Slider
                    value={停利比例}
                    onValueChange={set停利比例}
                    min={5}
                    max={50}
                    step={5}
                    className="py-1"
                  />
                </div>
              </div>
            </div>

            {/* 風險控制 */}
            <div className="space-y-4 rounded-xl bg-muted/20 p-4">
              <h4 className="flex items-center gap-2 font-medium">
                <Shield className="h-4 w-4 text-amber-500" />
                風險控制
              </h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">單筆最大風險</Label>
                  <Select defaultValue="2">
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1% 資金</SelectItem>
                      <SelectItem value="2">2% 資金</SelectItem>
                      <SelectItem value="5">5% 資金</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">最大同時持倉</Label>
                  <Select defaultValue="5">
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 檔</SelectItem>
                      <SelectItem value="5">5 檔</SelectItem>
                      <SelectItem value="10">10 檔</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">追蹤停損</Label>
                  <Switch />
                </div>
              </div>
            </div>

            {/* 執行按鈕 */}
            <div className="flex flex-col justify-center gap-3">
              <Button
                size="lg"
                className="gap-2 shadow-lg shadow-primary/20"
                onClick={handleRunBacktest}
                disabled={正在執行}
              >
                {正在執行 ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    執行中...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    開始回測
                  </>
                )}
              </Button>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                進階設定
              </Button>
              <Button variant="ghost" className="gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                歷史記錄
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 回測結果摘要 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { 標籤: '總報酬率', 值: `+${績效指標.總報酬率}%`, 圖標: TrendingUp, 顏色: 'text-emerald-500', 背景: 'from-emerald-500/20 to-emerald-500/5', 邊框: 'ring-emerald-500/20' },
          { 標籤: '夏普比率', 值: 績效指標.夏普比率.toFixed(2), 圖標: Target, 顏色: 'text-primary', 背景: 'from-primary/20 to-primary/5', 邊框: 'ring-primary/20' },
          { 標籤: '最大回撤', 值: `${績效指標.最大回撤}%`, 圖標: AlertTriangle, 顏色: 'text-rose-500', 背景: 'from-rose-500/20 to-rose-500/5', 邊框: 'ring-rose-500/20' },
          { 標籤: '勝率', 值: `${績效指標.勝率}%`, 圖標: Percent, 顏色: 'text-amber-500', 背景: 'from-amber-500/20 to-amber-500/5', 邊框: 'ring-amber-500/20' },
        ].map((item) => {
          const Icon = item.圖標
          return (
            <Card key={item.標籤} className={cn(
              "glass-card relative overflow-hidden border-border/30",
              `ring-1 ${item.邊框}`
            )}>
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-50",
                item.背景
              )} />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.標籤}</p>
                    <p className={cn("text-2xl font-bold", item.顏色)}>
                      {item.值}
                    </p>
                  </div>
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    `bg-gradient-to-br ${item.背景}`
                  )}>
                    <Icon className={cn("h-6 w-6", item.顏色)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 詳細結果分頁 */}
      <Tabs defaultValue="權益曲線" className="space-y-6">
        <TabsList className="h-12 w-full justify-start gap-1 bg-muted/30 p-1">
          <TabsTrigger 
            value="權益曲線" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <LineChart className="h-4 w-4" />
            權益曲線
          </TabsTrigger>
          <TabsTrigger 
            value="績效分析" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <BarChart3 className="h-4 w-4" />
            績效分析
          </TabsTrigger>
          <TabsTrigger 
            value="交易記錄" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Activity className="h-4 w-4" />
            交易記錄
          </TabsTrigger>
        </TabsList>

        <TabsContent value="權益曲線" className="space-y-6">
          {/* 權益曲線與回撤 */}
          <div className="grid gap-6 xl:grid-cols-2">
            <EquityCurveChart data={equityCurveData} />
            <DrawdownChart data={drawdownData} maxDrawdown={績效指標.最大回撤} />
          </div>
          
          {/* 月度熱力圖與交易分布 */}
          <div className="grid gap-6 xl:grid-cols-2">
            <MonthlyReturnHeatmap data={monthlyReturns} />
            <TradeDistributionHistogram data={tradeDistribution} totalTrades={績效指標.交易次數} />
          </div>
        </TabsContent>

        <TabsContent value="績效分析" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 績效指標詳情 */}
            <Card className="glass-card border-border/30">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  績效指標詳情
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { 名稱: "總報酬率", 值: `+${績效指標.總報酬率}%`, 顏色: "text-emerald-500" },
                    { 名稱: "年化報酬", 值: `+${績效指標.年化報酬}%`, 顏色: "text-emerald-500" },
                    { 名稱: "夏普比率", 值: 績效指標.夏普比率.toFixed(2), 顏色: "text-foreground" },
                    { 名稱: "索提諾比率", 值: 績效指標.索提諾比率.toFixed(2), 顏色: "text-foreground" },
                    { 名稱: "卡瑪比率", 值: 績效指標.卡瑪比率.toFixed(2), 顏色: "text-foreground" },
                    { 名稱: "最大回撤", 值: `${績效指標.最大回撤}%`, 顏色: "text-rose-500" },
                    { 名稱: "勝率", 值: `${績效指標.勝率}%`, 顏色: "text-foreground" },
                    { 名稱: "盈虧比", 值: `1:${績效指標.盈虧比}`, 顏色: "text-foreground" },
                    { 名稱: "獲利因子", 值: 績效指標.獲利因子.toFixed(2), 顏色: "text-foreground" },
                    { 名稱: "期望值", 值: `$${績效指標.期望值}`, 顏色: "text-foreground" },
                    { 名稱: "交易次數", 值: `${績效指標.交易次數} 次`, 顏色: "text-foreground" },
                    { 名稱: "平均持倉", 值: `${績效指標.平均持倉} 天`, 顏色: "text-foreground" },
                  ].map((指標) => (
                    <div key={指標.名稱} className="rounded-lg bg-muted/30 p-3 ring-1 ring-border/30">
                      <div className="text-xs text-muted-foreground">{指標.名稱}</div>
                      <div className={cn("text-lg font-bold", 指標.顏色)}>{指標.值}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 策略評分 */}
            <Card className="glass-card border-border/30">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  策略評分
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-6">
                <ScoreGauge score={85} label="綜合評分" size="lg" />
                <div className="w-full space-y-4">
                  {[
                    { 項目: "收益能力", 分數: 92, 顏色: "bg-emerald-500" },
                    { 項目: "風險控制", 分數: 78, 顏色: "bg-amber-500" },
                    { 項目: "穩定性", 分數: 85, 顏色: "bg-blue-500" },
                    { 項目: "執行效率", 分數: 88, 顏色: "bg-purple-500" },
                  ].map((評分) => (
                    <div key={評分.項目} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{評分.項目}</span>
                        <span className="font-bold">{評分.分數}</span>
                      </div>
                      <Progress
                        value={評分.分數}
                        className="h-2"
                        indicatorClassName={評分.顏色}
                      />
                    </div>
                  ))}
                </div>
                
                {/* AI 評語 */}
                <div className="w-full rounded-xl bg-primary/5 p-4 ring-1 ring-primary/20">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Sparkles className="h-4 w-4" />
                    AI 策略評語
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    該策略展現出優秀的收益能力和良好的穩定性。夏普比率達 1.85，
                    表明風險調整後報酬優異。建議可適度提高單筆風險敞口以提升收益，
                    同時關注最大回撤控制。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="交易記錄" className="space-y-4">
          <Card className="glass-card border-border/30">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[120px]">日期</TableHead>
                    <TableHead>類型</TableHead>
                    <TableHead>股票</TableHead>
                    <TableHead className="text-right">價格</TableHead>
                    <TableHead className="text-right">數量</TableHead>
                    <TableHead className="text-right">損益</TableHead>
                    <TableHead className="text-right">狀態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {交易記錄.map((記錄, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-sm">{記錄.日期}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "gap-1",
                            記錄.類型 === "買入"
                              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {記錄.類型 === "買入" ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {記錄.類型}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{記錄.股票}</TableCell>
                      <TableCell className="text-right font-mono">${記錄.價格}</TableCell>
                      <TableCell className="text-right font-mono">
                        {記錄.數量.toLocaleString()}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-mono",
                          記錄.損益
                            ? 記錄.損益 > 0
                              ? "text-emerald-500"
                              : "text-rose-500"
                            : "text-muted-foreground"
                        )}
                      >
                        {記錄.損益
                          ? `${記錄.損益 > 0 ? "+" : ""}$${記錄.損益.toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={cn(
                            記錄.狀態 === "持有中"
                              ? "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : "border-muted-foreground/30 text-muted-foreground"
                          )}
                        >
                          {記錄.狀態}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
