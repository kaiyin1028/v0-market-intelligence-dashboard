"use client"

/**
 * 訊號中心內容元件
 * 顯示各類交易訊號的統一管理介面
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Zap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Shield,
  Brain,
} from "lucide-react"
import { SignalBadge } from "@/components/dashboard/signal-badge"
import { ScoreGauge } from "@/components/dashboard/score-gauge"

/** 訊號類別 */
type 訊號類別 = "買入" | "賣出" | "觀望" | "加碼" | "減碼"

/** 交易訊號資料結構 */
interface 交易訊號 {
  id: string
  股票代號: string
  股票名稱: string
  訊號類別: 訊號類別
  強度: number
  來源: string[]
  觸發價: number
  目標價: number
  停損價: number
  風險報酬比: number
  時間: string
  有效期: string
  理由: string
}

/** 模擬交易訊號 */
const 模擬交易訊號: 交易訊號[] = [
  {
    id: "1",
    股票代號: "2330",
    股票名稱: "台積電",
    訊號類別: "買入",
    強度: 88,
    來源: ["MACD金叉", "KD黃金交叉", "外資買超"],
    觸發價: 890,
    目標價: 950,
    停損價: 865,
    風險報酬比: 2.4,
    時間: "09:15",
    有效期: "5日",
    理由: "技術面多頭排列，籌碼面外資連續買超，量能配合良好",
  },
  {
    id: "2",
    股票代號: "2454",
    股票名稱: "聯發科",
    訊號類別: "觀望",
    強度: 55,
    來源: ["型態整理中"],
    觸發價: 1280,
    目標價: 1350,
    停損價: 1240,
    風險報酬比: 1.75,
    時間: "10:32",
    有效期: "3日",
    理由: "價格處於箱型整理，等待方向突破再進場",
  },
  {
    id: "3",
    股票代號: "2317",
    股票名稱: "鴻海",
    訊號類別: "買入",
    強度: 78,
    來源: ["突破壓力位", "成交量放大"],
    觸發價: 175,
    目標價: 195,
    停損價: 168,
    風險報酬比: 2.86,
    時間: "11:05",
    有效期: "7日",
    理由: "突破前高壓力位，成交量明顯放大，短線看漲",
  },
  {
    id: "4",
    股票代號: "3008",
    股票名稱: "大立光",
    訊號類別: "賣出",
    強度: 72,
    來源: ["跌破支撐", "RSI超賣"],
    觸發價: 2180,
    目標價: 2050,
    停損價: 2220,
    風險報酬比: 3.25,
    時間: "14:05",
    有效期: "5日",
    理由: "跌破重要支撐位，短線偏空操作",
  },
  {
    id: "5",
    股票代號: "2881",
    股票名稱: "富邦金",
    訊號類別: "加碼",
    強度: 85,
    來源: ["外資大買", "突破頸線"],
    觸發價: 78,
    目標價: 88,
    停損價: 74,
    風險報酬比: 2.5,
    時間: "09:32",
    有效期: "10日",
    理由: "外資大量買進，突破頭肩底頸線，中期看多",
  },
  {
    id: "6",
    股票代號: "2303",
    股票名稱: "聯電",
    訊號類別: "買入",
    強度: 82,
    來源: ["三角收斂突破", "均線多頭"],
    觸發價: 52,
    目標價: 58,
    停損價: 49,
    風險報酬比: 2.0,
    時間: "09:48",
    有效期: "7日",
    理由: "突破三角收斂上緣，均線呈多頭排列",
  },
]

/** 訊號統計 */
const 訊號統計 = {
  買入: 15,
  賣出: 8,
  觀望: 12,
  加碼: 5,
  減碼: 3,
  總數: 43,
}

/** 取得訊號類別顏色 */
function get訊號顏色(類別: 訊號類別) {
  switch (類別) {
    case "買入":
    case "加碼":
      return "text-emerald-500 bg-emerald-500/10"
    case "賣出":
    case "減碼":
      return "text-rose-500 bg-rose-500/10"
    case "觀望":
      return "text-amber-500 bg-amber-500/10"
    default:
      return "text-muted-foreground bg-muted"
  }
}

/** 取得訊號圖示 */
function get訊號圖示(類別: 訊號類別) {
  switch (類別) {
    case "買入":
    case "加碼":
      return <TrendingUp className="h-4 w-4" />
    case "賣出":
    case "減碼":
      return <TrendingDown className="h-4 w-4" />
    case "觀望":
      return <Clock className="h-4 w-4" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

export function SignalHubContent() {
  // 篩選條件
  const [篩選類別, set篩選類別] = useState<string>("全部")

  // 篩選後的訊號
  const 篩選後訊號 = 模擬交易訊號.filter((訊號) => {
    if (篩選類別 === "全部") return true
    return 訊號.訊號類別 === 篩選類別
  })

  return (
    <div className="space-y-6">
      {/* 頂部統計區 */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="glass-card border-border/50 md:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">今日訊號總數</p>
                <p className="text-3xl font-bold">{訊號統計.總數}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Zap className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {[
          { 類別: "買入", 數量: 訊號統計.買入, 顏色: "emerald" },
          { 類別: "賣出", 數量: 訊號統計.賣出, 顏色: "rose" },
          { 類別: "觀望", 數量: 訊號統計.觀望, 顏色: "amber" },
          { 類別: "加碼", 數量: 訊號統計.加碼, 顏色: "cyan" },
        ].map((項目) => (
          <Card key={項目.類別} className="glass-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{項目.類別}訊號</p>
                  <p
                    className={`text-2xl font-bold text-${項目.顏色}-500`}
                    style={{
                      color:
                        項目.顏色 === "emerald"
                          ? "rgb(16, 185, 129)"
                          : 項目.顏色 === "rose"
                            ? "rgb(244, 63, 94)"
                            : 項目.顏色 === "amber"
                              ? "rgb(245, 158, 11)"
                              : "rgb(6, 182, 212)",
                    }}
                  >
                    {項目.數量}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 主要內容區 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 訊號列表 */}
        <div className="lg:col-span-2">
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-primary" />
                  即時交易訊號
                </CardTitle>
                <Select value={篩選類別} onValueChange={set篩選類別}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="買入">買入</SelectItem>
                    <SelectItem value="賣出">賣出</SelectItem>
                    <SelectItem value="觀望">觀望</SelectItem>
                    <SelectItem value="加碼">加碼</SelectItem>
                    <SelectItem value="減碼">減碼</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-3 p-4">
                  {篩選後訊號.map((訊號) => (
                    <Card
                      key={訊號.id}
                      className="border-border/50 transition-all hover:border-primary/50"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          {/* 左側：股票資訊與訊號 */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`rounded-full p-2 ${get訊號顏色(訊號.訊號類別)}`}
                              >
                                {get訊號圖示(訊號.訊號類別)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold">
                                    {訊號.股票代號}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {訊號.股票名稱}
                                  </span>
                                  <Badge
                                    className={get訊號顏色(訊號.訊號類別)}
                                    variant="outline"
                                  >
                                    {訊號.訊號類別}
                                  </Badge>
                                </div>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {訊號.來源.map((來源, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {來源}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* 價格資訊 */}
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  觸發價
                                </span>
                                <div className="font-mono font-medium">
                                  {訊號.觸發價}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  目標價
                                </span>
                                <div className="font-mono font-medium text-emerald-500">
                                  {訊號.目標價}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  停損價
                                </span>
                                <div className="font-mono font-medium text-rose-500">
                                  {訊號.停損價}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  風險報酬
                                </span>
                                <div className="font-mono font-medium">
                                  1:{訊號.風險報酬比.toFixed(1)}
                                </div>
                              </div>
                            </div>

                            {/* 訊號理由 */}
                            <p className="text-sm text-muted-foreground">
                              {訊號.理由}
                            </p>
                          </div>

                          {/* 右側：強度與操作 */}
                          <div className="flex flex-col items-end gap-2">
                            <ScoreGauge
                              score={訊號.強度}
                              label="訊號強度"
                              size="sm"
                            />
                            <div className="text-right text-xs text-muted-foreground">
                              <div>有效期：{訊號.有效期}</div>
                              <div>{訊號.時間}</div>
                            </div>
                            <Button size="sm" variant="outline" className="mt-2">
                              查看詳情
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* 右側面板 */}
        <div className="space-y-6">
          {/* 訊號分布 */}
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChart className="h-4 w-4 text-primary" />
                訊號分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { 類別: "買入", 數量: 15, 顏色: "bg-emerald-500" },
                  { 類別: "賣出", 數量: 8, 顏色: "bg-rose-500" },
                  { 類別: "觀望", 數量: 12, 顏色: "bg-amber-500" },
                  { 類別: "加碼", 數量: 5, 顏色: "bg-cyan-500" },
                  { 類別: "減碼", 數量: 3, 顏色: "bg-violet-500" },
                ].map((項目) => (
                  <div key={項目.類別} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{項目.類別}</span>
                      <span className="font-medium">
                        {項目.數量} ({((項目.數量 / 43) * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <Progress
                      value={(項目.數量 / 43) * 100}
                      className="h-2"
                      indicatorClassName={項目.顏色}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 訊號品質 */}
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" />
                訊號品質評估
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <ScoreGauge score={82} label="整體品質" size="lg" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    技術面確認
                  </span>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium">92%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    籌碼面確認
                  </span>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium">78%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    量價配合度
                  </span>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">65%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    風險控制
                  </span>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium">88%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI 建議 */}
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-4 w-4 text-primary" />
                AI 綜合建議
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-primary/5 p-4">
                <p className="text-sm text-muted-foreground">
                  目前市場多空交織，建議採取選擇性操作策略。
                  優先關注高信心度的買入訊號，特別是同時具備技術面突破和籌碼面支撐的標的。
                  建議倉位控制在 60% 以內，保留資金應對市場波動。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
