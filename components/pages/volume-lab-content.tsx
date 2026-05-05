"use client"

/**
 * 量價實驗室內容元件
 * 提供進階量價分析工具和視覺化圖表
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  Area,
  Legend,
  ReferenceLine,
} from "recharts"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Volume2,
  Activity,
  Search,
  Layers,
  Target,
  AlertTriangle,
  Zap,
} from "lucide-react"

/** 量價分布數據 */
const 量價分布數據 = [
  { 價位: "850-860", 成交量: 12500, 買盤: 7200, 賣盤: 5300 },
  { 價位: "860-870", 成交量: 18200, 買盤: 10100, 賣盤: 8100 },
  { 價位: "870-880", 成交量: 25800, 買盤: 14500, 賣盤: 11300 },
  { 價位: "880-890", 成交量: 35200, 買盤: 22000, 賣盤: 13200 },
  { 價位: "890-900", 成交量: 42500, 買盤: 28500, 賣盤: 14000 },
  { 價位: "900-910", 成交量: 28600, 買盤: 15200, 賣盤: 13400 },
  { 價位: "910-920", 成交量: 15800, 買盤: 8500, 賣盤: 7300 },
]

/** 成交量趨勢數據 */
const 成交量趨勢數據 = [
  { 日期: "04/25", 成交量: 45200, 均量: 38000, 價格: 875 },
  { 日期: "04/26", 成交量: 52800, 均量: 39200, 價格: 882 },
  { 日期: "04/27", 成交量: 38500, 均量: 39000, 價格: 878 },
  { 日期: "04/28", 成交量: 65200, 均量: 41500, 價格: 892 },
  { 日期: "04/29", 成交量: 78500, 均量: 44800, 價格: 905 },
  { 日期: "04/30", 成交量: 55200, 均量: 45600, 價格: 898 },
  { 日期: "05/01", 成交量: 48600, 均量: 45200, 價格: 895 },
]

/** 主力成本分析數據 */
const 主力成本數據 = [
  { 類型: "外資", 成本: 885, 持股比例: 78.5, 近5日增減: 2500 },
  { 類型: "投信", 成本: 878, 持股比例: 5.2, 近5日增減: 850 },
  { 類型: "自營商", 成本: 892, 持股比例: 2.8, 近5日增減: -320 },
  { 類型: "散戶", 成本: 895, 持股比例: 13.5, 近5日增減: -3030 },
]

/** 異常成交量數據 */
const 異常成交量數據 = [
  { 股票代號: "2330", 股票名稱: "台積電", 量比: 2.85, 價格變化: 2.35, 類型: "爆量上漲" },
  { 股票代號: "2454", 股票名稱: "聯發科", 量比: 1.92, 價格變化: 1.15, 類型: "量增價漲" },
  { 股票代號: "2881", 股票名稱: "富邦金", 量比: 2.45, 價格變化: 2.82, 類型: "爆量上漲" },
  { 股票代號: "3008", 股票名稱: "大立光", 量比: 1.85, 價格變化: -1.25, 類型: "量增價跌" },
  { 股票代號: "2317", 股票名稱: "鴻海", 量比: 2.12, 價格變化: 1.95, 類型: "量增價漲" },
]

export function VolumeLabContent() {
  // 當前股票
  const [當前股票, set當前股票] = useState("2330")
  // 分析週期
  const [分析週期, set分析週期] = useState("20")

  return (
    <div className="space-y-6">
      {/* 頂部控制區 */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜尋股票代號..."
            value={當前股票}
            onChange={(e) => set當前股票(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={分析週期} onValueChange={set分析週期}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5日</SelectItem>
            <SelectItem value="10">10日</SelectItem>
            <SelectItem value="20">20日</SelectItem>
            <SelectItem value="60">60日</SelectItem>
          </SelectContent>
        </Select>
        <Button>開始分析</Button>
      </div>

      {/* 主要分析區 */}
      <Tabs defaultValue="量價分布" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="量價分布" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">量價分布</span>
          </TabsTrigger>
          <TabsTrigger value="成交量趨勢" className="gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">成交量趨勢</span>
          </TabsTrigger>
          <TabsTrigger value="主力成本" className="gap-2">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">主力成本</span>
          </TabsTrigger>
          <TabsTrigger value="異常偵測" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">異常偵測</span>
          </TabsTrigger>
        </TabsList>

        {/* 量價分布 */}
        <TabsContent value="量價分布" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="glass-card border-border/50 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  量價分布圖
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={量價分布數據}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis
                        dataKey="價位"
                        type="category"
                        stroke="hsl(var(--muted-foreground))"
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="買盤" stackId="a" fill="hsl(var(--chart-1))" name="買盤" />
                      <Bar dataKey="賣盤" stackId="a" fill="hsl(var(--chart-2))" name="賣盤" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">量價分析摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-emerald-500/10 p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium">主力成本區</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">890-900</p>
                  <p className="text-sm text-muted-foreground">成交量最大區間</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">套牢籌碼</span>
                    <span className="font-medium">18.5%</span>
                  </div>
                  <Progress value={18.5} className="h-2" indicatorClassName="bg-rose-500" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">獲利籌碼</span>
                    <span className="font-medium">81.5%</span>
                  </div>
                  <Progress value={81.5} className="h-2" indicatorClassName="bg-emerald-500" />
                </div>

                <div className="rounded-lg bg-primary/5 p-4">
                  <p className="text-sm text-muted-foreground">
                    目前股價位於主力成本區上方，籌碼結構健康，多數投資人處於獲利狀態，
                    短線支撐強勁。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 成交量趨勢 */}
        <TabsContent value="成交量趨勢" className="space-y-4">
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" />
                成交量與價格趨勢
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={成交量趨勢數據}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="日期" stroke="hsl(var(--muted-foreground))" />
                    <YAxis
                      yAxisId="left"
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="成交量"
                      fill="hsl(var(--chart-1))"
                      opacity={0.8}
                      name="成交量"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="均量"
                      stroke="hsl(var(--chart-3))"
                      strokeDasharray="5 5"
                      name="20日均量"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="價格"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      name="收盤價"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-4">
            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">今日成交量</p>
                    <p className="text-2xl font-bold">48,600</p>
                  </div>
                  <Volume2 className="h-8 w-8 text-primary/50" />
                </div>
                <p className="mt-2 text-sm text-emerald-500">較均量 +7.5%</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">20日均量</p>
                    <p className="text-2xl font-bold">45,200</p>
                  </div>
                  <Activity className="h-8 w-8 text-cyan-500/50" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">穩定增長中</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">量價關係</p>
                    <p className="text-2xl font-bold text-emerald-500">量增價漲</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-500/50" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">多頭趨勢</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">換手率</p>
                    <p className="text-2xl font-bold">2.85%</p>
                  </div>
                  <Zap className="h-8 w-8 text-amber-500/50" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">活躍度適中</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 主力成本 */}
        <TabsContent value="主力成本" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Layers className="h-4 w-4 text-primary" />
                  三大法人持股成本
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {主力成本數據.map((法人) => (
                    <div key={法人.類型} className="rounded-lg border border-border/50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{法人.類型}</span>
                          <Badge
                            variant="outline"
                            className={`ml-2 ${
                              法人.近5日增減 > 0
                                ? "border-emerald-500/50 text-emerald-500"
                                : "border-rose-500/50 text-rose-500"
                            }`}
                          >
                            {法人.近5日增減 > 0 ? "+" : ""}
                            {法人.近5日增減.toLocaleString()}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{法人.成本}</div>
                          <div className="text-sm text-muted-foreground">
                            持股 {法人.持股比例}%
                          </div>
                        </div>
                      </div>
                      <Progress
                        value={法人.持股比例}
                        className="mt-2 h-2"
                        indicatorClassName={
                          法人.類型 === "外資"
                            ? "bg-cyan-500"
                            : 法人.類型 === "投信"
                              ? "bg-amber-500"
                              : 法人.類型 === "自營商"
                                ? "bg-violet-500"
                                : "bg-muted-foreground"
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-primary" />
                  成本分析結論
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-cyan-500/10 p-4">
                  <h4 className="font-medium text-cyan-500">外資動向</h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    外資持股比例達 78.5%，平均成本 885 元，近五日累計買超 2,500 張，
                    顯示外資看好後市，持續加碼中。
                  </p>
                </div>

                <div className="rounded-lg bg-amber-500/10 p-4">
                  <h4 className="font-medium text-amber-500">投信動向</h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    投信持股比例 5.2%，平均成本 878 元，近五日買超 850 張，
                    與外資同步作多，籌碼面偏多。
                  </p>
                </div>

                <div className="rounded-lg bg-rose-500/10 p-4">
                  <h4 className="font-medium text-rose-500">散戶動向</h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    散戶平均成本 895 元，高於目前股價，近五日賣超 3,030 張，
                    籌碼持續從散戶轉移至法人手中，結構轉佳。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 異常偵測 */}
        <TabsContent value="異常偵測" className="space-y-4">
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-primary" />
                成交量異常偵測
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {異常成交量數據.map((股票) => (
                  <div
                    key={股票.股票代號}
                    className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-all hover:border-primary/50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-full p-2 ${
                          股票.價格變化 >= 0
                            ? "bg-emerald-500/10"
                            : "bg-rose-500/10"
                        }`}
                      >
                        {股票.價格變化 >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-rose-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{股票.股票代號}</span>
                          <span className="text-muted-foreground">
                            {股票.股票名稱}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            股票.類型.includes("上漲")
                              ? "border-emerald-500/50 text-emerald-500"
                              : 股票.類型.includes("下跌")
                                ? "border-rose-500/50 text-rose-500"
                                : "border-amber-500/50 text-amber-500"
                          }
                        >
                          {股票.類型}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">量比</div>
                        <div className="text-lg font-bold">{股票.量比}x</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">漲跌</div>
                        <div
                          className={`text-lg font-bold ${
                            股票.價格變化 >= 0
                              ? "text-emerald-500"
                              : "text-rose-500"
                          }`}
                        >
                          {股票.價格變化 >= 0 ? "+" : ""}
                          {股票.價格變化}%
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        分析
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
