"use client"

/**
 * 回測內容元件
 * 提供策略回測設定和結果展示
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  ReferenceLine,
} from "recharts"
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
} from "lucide-react"
import { ScoreGauge } from "@/components/dashboard/score-gauge"

/** 回測結果數據 */
const 權益曲線數據 = [
  { 日期: "2024/01", 策略: 100, 基準: 100 },
  { 日期: "2024/02", 策略: 108, 基準: 103 },
  { 日期: "2024/03", 策略: 115, 基準: 106 },
  { 日期: "2024/04", 策略: 112, 基準: 104 },
  { 日期: "2024/05", 策略: 125, 基準: 110 },
  { 日期: "2024/06", 策略: 132, 基準: 112 },
  { 日期: "2024/07", 策略: 128, 基準: 115 },
  { 日期: "2024/08", 策略: 142, 基準: 118 },
  { 日期: "2024/09", 策略: 155, 基準: 122 },
  { 日期: "2024/10", 策略: 148, 基準: 120 },
  { 日期: "2024/11", 策略: 165, 基準: 125 },
  { 日期: "2024/12", 策略: 178, 基準: 128 },
]

/** 交易記錄 */
const 交易記錄 = [
  { 日期: "2024/12/15", 類型: "買入", 股票: "2330", 價格: 892, 數量: 1000, 損益: null },
  { 日期: "2024/12/10", 類型: "賣出", 股票: "2454", 價格: 1285, 數量: 500, 損益: 12500 },
  { 日期: "2024/12/05", 類型: "買入", 股票: "2317", 價格: 175, 數量: 2000, 損益: null },
  { 日期: "2024/11/28", 類型: "賣出", 股票: "2881", 價格: 78, 數量: 3000, 損益: 8500 },
  { 日期: "2024/11/20", 類型: "買入", 股票: "2454", 價格: 1260, 數量: 500, 損益: null },
  { 日期: "2024/11/15", 類型: "賣出", 股票: "2330", 價格: 885, 數量: 1000, 損益: 25000 },
]

/** 績效指標 */
const 績效指標 = {
  總報酬率: 78.5,
  年化報酬: 45.2,
  夏普比率: 1.85,
  最大回撤: -12.5,
  勝率: 68.5,
  盈虧比: 2.35,
  交易次數: 156,
  平均持倉: 8.5,
}

export function BacktestContent() {
  // 策略參數
  const [是否執行回測, set是否執行回測] = useState(false)
  const [RSI上限, setRSI上限] = useState([70])
  const [RSI下限, setRSI下限] = useState([30])
  const [停損比例, set停損比例] = useState([5])
  const [停利比例, set停利比例] = useState([15])

  return (
    <div className="space-y-6">
      {/* 策略設定區 */}
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4 text-primary" />
            策略參數設定
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-4">
            {/* 基本設定 */}
            <div className="space-y-4">
              <h4 className="font-medium">基本設定</h4>
              <div className="space-y-2">
                <Label>回測標的</Label>
                <Select defaultValue="2330">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2330">2330 台積電</SelectItem>
                    <SelectItem value="2454">2454 聯發科</SelectItem>
                    <SelectItem value="2317">2317 鴻海</SelectItem>
                    <SelectItem value="portfolio">投資組合</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>回測期間</Label>
                <Select defaultValue="1y">
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label>初始資金</Label>
                <Input type="number" defaultValue="1000000" />
              </div>
            </div>

            {/* 進場條件 */}
            <div className="space-y-4">
              <h4 className="font-medium">進場條件</h4>
              <div className="space-y-2">
                <Label>技術指標</Label>
                <Select defaultValue="macd-rsi">
                  <SelectTrigger>
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
                <div className="flex items-center justify-between">
                  <Label>RSI 超賣區</Label>
                  <span className="text-sm text-muted-foreground">{RSI下限}%</span>
                </div>
                <Slider
                  value={RSI下限}
                  onValueChange={setRSI下限}
                  min={10}
                  max={50}
                  step={5}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>成交量確認</Label>
                <Switch defaultChecked />
              </div>
            </div>

            {/* 出場條件 */}
            <div className="space-y-4">
              <h4 className="font-medium">出場條件</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>RSI 超買區</Label>
                  <span className="text-sm text-muted-foreground">{RSI上限}%</span>
                </div>
                <Slider
                  value={RSI上限}
                  onValueChange={setRSI上限}
                  min={50}
                  max={90}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>停損比例</Label>
                  <span className="text-sm text-muted-foreground">{停損比例}%</span>
                </div>
                <Slider
                  value={停損比例}
                  onValueChange={set停損比例}
                  min={1}
                  max={15}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>停利比例</Label>
                  <span className="text-sm text-muted-foreground">{停利比例}%</span>
                </div>
                <Slider
                  value={停利比例}
                  onValueChange={set停利比例}
                  min={5}
                  max={50}
                  step={5}
                />
              </div>
            </div>

            {/* 執行按鈕 */}
            <div className="flex flex-col justify-center gap-4">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => set是否執行回測(true)}
              >
                <Play className="h-5 w-5" />
                開始回測
              </Button>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                進階設定
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 回測結果區 */}
      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">總報酬率</p>
                <p className="text-2xl font-bold text-emerald-500">
                  +{績效指標.總報酬率}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">夏普比率</p>
                <p className="text-2xl font-bold">{績效指標.夏普比率}</p>
              </div>
              <Target className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">最大回撤</p>
                <p className="text-2xl font-bold text-rose-500">
                  {績效指標.最大回撤}%
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-rose-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">勝率</p>
                <p className="text-2xl font-bold">{績效指標.勝率}%</p>
              </div>
              <Percent className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 詳細結果分頁 */}
      <Tabs defaultValue="權益曲線" className="space-y-4">
        <TabsList>
          <TabsTrigger value="權益曲線">權益曲線</TabsTrigger>
          <TabsTrigger value="績效分析">績效分析</TabsTrigger>
          <TabsTrigger value="交易記錄">交易記錄</TabsTrigger>
        </TabsList>

        <TabsContent value="權益曲線">
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-primary" />
                權益曲線對比
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={權益曲線數據}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorStrategy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="日期" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <ReferenceLine y={100} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                    <Area
                      type="monotone"
                      dataKey="策略"
                      stroke="hsl(var(--chart-1))"
                      fillOpacity={1}
                      fill="url(#colorStrategy)"
                      strokeWidth={2}
                      name="策略績效"
                    />
                    <Line
                      type="monotone"
                      dataKey="基準"
                      stroke="hsl(var(--chart-3))"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      name="基準指數"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="績效分析">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">績效指標</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { 名稱: "總報酬率", 值: `+${績效指標.總報酬率}%`, 顏色: "text-emerald-500" },
                    { 名稱: "年化報酬", 值: `+${績效指標.年化報酬}%`, 顏色: "text-emerald-500" },
                    { 名稱: "夏普比率", 值: 績效指標.夏普比率, 顏色: "text-foreground" },
                    { 名稱: "最大回撤", 值: `${績效指標.最大回撤}%`, 顏色: "text-rose-500" },
                    { 名稱: "勝率", 值: `${績效指標.勝率}%`, 顏色: "text-foreground" },
                    { 名稱: "盈虧比", 值: `1:${績效指標.盈虧比}`, 顏色: "text-foreground" },
                    { 名稱: "交易次數", 值: `${績效指標.交易次數} 次`, 顏色: "text-foreground" },
                    { 名稱: "平均持倉", 值: `${績效指標.平均持倉} 天`, 顏色: "text-foreground" },
                  ].map((指標) => (
                    <div key={指標.名稱} className="rounded-lg border border-border/50 p-3">
                      <div className="text-sm text-muted-foreground">{指標.名稱}</div>
                      <div className={`text-xl font-bold ${指標.顏色}`}>{指標.值}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">策略評分</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-6">
                <ScoreGauge score={85} label="綜合評分" size="lg" />
                <div className="w-full space-y-3">
                  {[
                    { 項目: "收益能力", 分數: 92 },
                    { 項目: "風險控制", 分數: 78 },
                    { 項目: "穩定性", 分數: 85 },
                    { 項目: "執行效率", 分數: 88 },
                  ].map((評分) => (
                    <div key={評分.項目} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{評分.項目}</span>
                        <span className="font-medium">{評分.分數}</span>
                      </div>
                      <Progress
                        value={評分.分數}
                        className="h-2"
                        indicatorClassName={
                          評分.分數 >= 85
                            ? "bg-emerald-500"
                            : 評分.分數 >= 70
                              ? "bg-amber-500"
                              : "bg-rose-500"
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="交易記錄">
          <Card className="glass-card border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日期</TableHead>
                    <TableHead>類型</TableHead>
                    <TableHead>股票</TableHead>
                    <TableHead className="text-right">價格</TableHead>
                    <TableHead className="text-right">數量</TableHead>
                    <TableHead className="text-right">損益</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {交易記錄.map((記錄, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono">{記錄.日期}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            記錄.類型 === "買入"
                              ? "border-emerald-500/50 text-emerald-500"
                              : "border-rose-500/50 text-rose-500"
                          }
                        >
                          {記錄.類型}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{記錄.股票}</TableCell>
                      <TableCell className="text-right font-mono">{記錄.價格}</TableCell>
                      <TableCell className="text-right font-mono">
                        {記錄.數量.toLocaleString()}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono ${
                          記錄.損益
                            ? 記錄.損益 > 0
                              ? "text-emerald-500"
                              : "text-rose-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {記錄.損益
                          ? `${記錄.損益 > 0 ? "+" : ""}${記錄.損益.toLocaleString()}`
                          : "-"}
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
