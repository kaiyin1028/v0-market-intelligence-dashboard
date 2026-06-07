"use client"

/**
 * 突破掃描器內容元件
 * 顯示即時突破訊號、掃描結果和篩選功能
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Target,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Filter,
  RefreshCw,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Volume2,
  Activity,
  Clock,
} from "lucide-react"
import { RiskBadge } from "@/components/dashboard/risk-badge"
import { getBreakoutScanner } from "@/lib/api"
import type { BreakoutScanResult } from "@/types"

/** 突破類型定義 */
type 突破類型 = "價格突破" | "型態突破" | "成交量突破" | "指標突破"
type 突破方向 = "向上" | "向下"

/** 突破訊號資料結構 */
interface 突破訊號 {
  id: string
  股票代號: string
  股票名稱: string
  類型: 突破類型
  方向: 突破方向
  突破價位: number
  現價: number
  漲跌幅: number
  成交量比: number
  信心度: number
  假突破風險: "低" | "中" | "高"
  時間: string
  描述: string
}


/** 將後端突破掃描結果映射為本地格式 */
function mapBreakoutResults(results: BreakoutScanResult[]): 突破訊號[] {
  return results.map((r) => {
    const direction = r.signal === "sell" || r.signal === "short" ? "向下" : "向上"
    const type: 突破類型 =
      r.macdState === "bullish" && r.rsiState === "overbought"
        ? "指標突破"
        : r.volumeRatio > 1.5
          ? "成交量突破"
          : "價格突破"
    const risk: "低" | "中" | "高" =
      r.falseBreakoutRisk < 33 ? "低" : r.falseBreakoutRisk < 66 ? "中" : "高"
    return {
      id: r.id,
      股票代號: r.ticker,
      股票名稱: r.name,
      類型: type,
      方向: direction as 突破方向,
      突破價位: r.breakoutLevel,
      現價: r.price,
      漲跌幅: 0,
      成交量比: r.volumeRatio,
      信心度: Math.round(r.closeStrength),
      假突破風險: risk,
      時間: "09:15",
      描述: `${r.sector} 類股突破分析，${r.obvConfirmation ? "OBV確認" : "OBV未確認"}，籌碼壓力 ${Math.round(r.chipPressure)}%`,
    }
  })
}

export function BreakoutScannerContent() {
  // 篩選條件
  const [選擇類型, set選擇類型] = useState<string>("全部")
  const [選擇方向, set選擇方向] = useState<string>("全部")
  const [最低信心度, set最低信心度] = useState<string>("50")
  const [是否自動更新, set是否自動更新] = useState(true)

  // API 數據狀態
  const [突破訊號列表, set突破訊號列表] = useState<突破訊號[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [最後更新, set最後更新] = useState<string>("--:--:--")

  // 從 API 載入數據
  useEffect(() => {
    let cancelled = false
    const load = () => {
      setLoading(true)
      setError(null)
      getBreakoutScanner()
        .then((res) => {
          if (!cancelled) {
            if (res.length > 0) {
              set突破訊號列表(mapBreakoutResults(res))
            } else {
              set突破訊號列表([])
            }
            set最後更新(new Date().toLocaleTimeString("zh-TW"))
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : "載入失敗")
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }
    load()
    const interval = setInterval(() => {
      if (是否自動更新) load()
    }, 5000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [是否自動更新])

  // 篩選後的訊號
  const 篩選後訊號 = 突破訊號列表.filter((訊號) => {
    if (選擇類型 !== "全部" && 訊號.類型 !== 選擇類型) return false
    if (選擇方向 !== "全部" && 訊號.方向 !== 選擇方向) return false
    if (訊號.信心度 < parseInt(最低信心度)) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* 頂部統計卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">總掃描股票</p>
                <p className="text-2xl font-bold">{突破訊號列表.length}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">突破訊號</p>
                <p className="text-2xl font-bold text-emerald-500">
                  {突破訊號列表.filter((s) => s.方向 === "向上").length}
                </p>
              </div>
              <div className="rounded-full bg-emerald-500/10 p-3">
                <Zap className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">高信心度</p>
                <p className="text-2xl font-bold text-amber-500">
                  {突破訊號列表.filter((s) => s.信心度 >= 70).length}
                </p>
              </div>
              <div className="rounded-full bg-amber-500/10 p-3">
                <Target className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">最後更新</p>
                <p className="text-2xl font-bold">{最後更新}</p>
              </div>
              <div className="rounded-full bg-cyan-500/10 p-3">
                <Clock className="h-5 w-5 text-cyan-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 載入/錯誤提示 */}
      {loading && (
        <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/20 px-4 py-2 text-sm text-primary">
          <Activity className="h-4 w-4 animate-spin" />
          正在載入突破掃描數據...
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-500/5 border border-amber-500/20 px-4 py-2 text-sm text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          API 連線失敗（{error}）
        </div>
      )}

      {/* 篩選條件 */}
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4 text-primary" />
            篩選條件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">突破類型:</span>
              <Select value={選擇類型} onValueChange={set選擇類型}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部</SelectItem>
                  <SelectItem value="價格突破">價格突破</SelectItem>
                  <SelectItem value="型態突破">型態突破</SelectItem>
                  <SelectItem value="成交量突破">成交量突破</SelectItem>
                  <SelectItem value="指標突破">指標突破</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">突破方向:</span>
              <Select value={選擇方向} onValueChange={set選擇方向}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部</SelectItem>
                  <SelectItem value="向上">向上</SelectItem>
                  <SelectItem value="向下">向下</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">最低信心度:</span>
              <Select value={最低信心度} onValueChange={set最低信心度}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="60">60%</SelectItem>
                  <SelectItem value="70">70%</SelectItem>
                  <SelectItem value="80">80%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="auto-refresh"
                checked={是否自動更新}
                onCheckedChange={(checked) => set是否自動更新(checked as boolean)}
              />
              <label htmlFor="auto-refresh" className="text-sm cursor-pointer">
                自動更新
              </label>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Bell className="h-4 w-4" />
                設定提醒
              </Button>
              <Button size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                立即掃描
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 突破訊號列表 */}
      <Tabs defaultValue="列表" className="space-y-4">
        <TabsList>
          <TabsTrigger value="列表">列表檢視</TabsTrigger>
          <TabsTrigger value="卡片">卡片檢視</TabsTrigger>
        </TabsList>

        <TabsContent value="列表">
          <Card className="glass-card border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-20">時間</TableHead>
                    <TableHead className="w-28">股票</TableHead>
                    <TableHead className="w-24">類型</TableHead>
                    <TableHead className="w-20 text-right">突破價</TableHead>
                    <TableHead className="w-20 text-right">現價</TableHead>
                    <TableHead className="w-20 text-right">漲跌幅</TableHead>
                    <TableHead className="w-20 text-right">量比</TableHead>
                    <TableHead className="w-28">信心度</TableHead>
                    <TableHead className="w-20">風險</TableHead>
                    <TableHead>說明</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {篩選後訊號.map((訊號) => (
                    <TableRow
                      key={訊號.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-mono text-sm">
                        {訊號.時間}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {訊號.方向 === "向上" ? (
                            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-rose-500" />
                          )}
                          <div>
                            <div className="font-medium">{訊號.股票代號}</div>
                            <div className="text-xs text-muted-foreground">
                              {訊號.股票名稱}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            訊號.類型 === "價格突破"
                              ? "border-cyan-500/50 text-cyan-500"
                              : 訊號.類型 === "型態突破"
                                ? "border-violet-500/50 text-violet-500"
                                : 訊號.類型 === "成交量突破"
                                  ? "border-amber-500/50 text-amber-500"
                                  : "border-emerald-500/50 text-emerald-500"
                          }
                        >
                          {訊號.類型}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {訊號.突破價位.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {訊號.現價.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono ${
                          訊號.漲跌幅 >= 0 ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {訊號.漲跌幅 >= 0 ? "+" : ""}
                        {訊號.漲跌幅.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Volume2 className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono">
                            {訊號.成交量比.toFixed(2)}x
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={訊號.信心度}
                            className="h-2 w-16"
                            indicatorClassName={
                              訊號.信心度 >= 80
                                ? "bg-emerald-500"
                                : 訊號.信心度 >= 60
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                            }
                          />
                          <span className="text-sm font-medium">
                            {訊號.信心度}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RiskBadge risk={訊號.假突破風險 === "低" ? 25 : 訊號.假突破風險 === "中" ? 50 : 75} />
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {訊號.描述}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="卡片">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {篩選後訊號.map((訊號) => (
              <Card
                key={訊號.id}
                className="glass-card cursor-pointer border-border/50 transition-all hover:border-primary/50"
              >
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {訊號.方向 === "向上" ? (
                        <div className="rounded-full bg-emerald-500/10 p-1.5">
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </div>
                      ) : (
                        <div className="rounded-full bg-rose-500/10 p-1.5">
                          <TrendingDown className="h-4 w-4 text-rose-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold">{訊號.股票代號}</div>
                        <div className="text-xs text-muted-foreground">
                          {訊號.股票名稱}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        訊號.類型 === "價格突破"
                          ? "border-cyan-500/50 text-cyan-500"
                          : 訊號.類型 === "型態突破"
                            ? "border-violet-500/50 text-violet-500"
                            : 訊號.類型 === "成交量突破"
                              ? "border-amber-500/50 text-amber-500"
                              : "border-emerald-500/50 text-emerald-500"
                      }
                    >
                      {訊號.類型}
                    </Badge>
                  </div>

                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {訊號.現價.toFixed(2)}
                      </div>
                      <div
                        className={`text-sm ${
                          訊號.漲跌幅 >= 0 ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {訊號.漲跌幅 >= 0 ? "+" : ""}
                        {訊號.漲跌幅.toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        突破價位
                      </div>
                      <div className="font-mono">
                        {訊號.突破價位.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">信心度</span>
                      <span className="font-medium">{訊號.信心度}%</span>
                    </div>
                    <Progress
                      value={訊號.信心度}
                      className="h-2"
                      indicatorClassName={
                        訊號.信心度 >= 80
                          ? "bg-emerald-500"
                          : 訊號.信心度 >= 60
                            ? "bg-amber-500"
                            : "bg-rose-500"
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        量比 {訊號.成交量比.toFixed(2)}x
                      </span>
                    </div>
                    <RiskBadge risk={訊號.假突破風險 === "低" ? 25 : 訊號.假突破風險 === "中" ? 50 : 75} />
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">
                    {訊號.描述}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
                    <span className="text-xs text-muted-foreground">
                      {訊號.時間}
                    </span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      查看詳情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
