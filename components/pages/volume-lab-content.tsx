"use client"

/**
 * 量價實驗室內容元件
 * 使用真實市場數據進行進階量價分析
 */

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  ReferenceLine,
  Cell,
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
  Loader2,
} from "lucide-react"
import { getStockAnalysis, getBreakoutScanner, searchStocks } from "@/lib/api"
import type { BreakoutScanResult } from "@/lib/api"

export function VolumeLabContent() {
  const [當前股票, set當前股票] = useState("AAPL")
  const [搜尋關鍵字, set搜尋關鍵字] = useState("")
  const [分析週期, set分析週期] = useState("20")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [stockData, setStockData] = useState<{
    ticker: string
    name: string
    price: number
    volumeProfile: { priceLevel: number; volume: number; buyVolume: number; sellVolume: number }[]
    chipDistribution: {
      poc: number
      vah: number
      val: number
      hvn: number[]
      lvn: number[]
      chipPressure: number
      upperTrappedChips: number
      lowerSupportDensity: number
    } | null
    candlestickData: { date: string; open: number; high: number; low: number; close: number; volume: number }[]
  } | null>(null)

  const [scannerData, setScannerData] = useState<BreakoutScanResult[]>([])
  const [scannerLoading, setScannerLoading] = useState(false)

  // 載入個股量價數據
  const loadStockData = useCallback(async (ticker: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getStockAnalysis(ticker, "1d")
      setStockData({
        ticker: res.stock.ticker,
        name: res.stock.name,
        price: res.stock.price,
        volumeProfile: res.volumeProfile || [],
        chipDistribution: res.chipDistribution || null,
        candlestickData: res.candlestickData || [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "載入失敗")
    } finally {
      setLoading(false)
    }
  }, [])

  // 載入異常偵測數據
  const loadScannerData = useCallback(async () => {
    setScannerLoading(true)
    try {
      const results = await getBreakoutScanner()
      setScannerData(results)
    } catch {
      setScannerData([])
    } finally {
      setScannerLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStockData(當前股票)
    loadScannerData()
  }, [當前股票, loadStockData, loadScannerData])

  // 搜尋並切換股票
  const handleSearch = useCallback(async () => {
    const query = 搜尋關鍵字.trim().toUpperCase()
    if (!query) return
    setLoading(true)
    try {
      const results = await searchStocks(query)
      if (results && results.length > 0) {
        set當前股票(results[0].ticker)
        set搜尋關鍵字("")
      } else {
        setError(`找不到股票「${query}」`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "搜尋失敗")
    } finally {
      setLoading(false)
    }
  }, [搜尋關鍵字])

  // 量價分布圖數據（翻轉順序讓高價在上）
  const 量價分布圖數據 = useMemo(() => {
    if (!stockData?.volumeProfile) return []
    return [...stockData.volumeProfile].reverse().map((d) => ({
      價位: `$${d.priceLevel.toFixed(2)}`,
      成交量: d.volume,
      買盤: d.buyVolume,
      賣盤: d.sellVolume,
      priceLevel: d.priceLevel,
    }))
  }, [stockData])

  // 成交量趨勢數據（取最近 N 天）
  const 成交量趨勢數據 = useMemo(() => {
    if (!stockData?.candlestickData) return []
    const days = parseInt(分析週期, 10) || 20
    const sliced = stockData.candlestickData.slice(-days)
    return sliced.map((d, i, arr) => {
      const maSlice = arr.slice(Math.max(0, i - 19), i + 1)
      const avgVol = maSlice.reduce((sum, x) => sum + (x.volume || 0), 0) / maSlice.length
      return {
        日期: d.date?.slice(5) || "",
        成交量: d.volume || 0,
        均量: Math.round(avgVol),
        價格: d.close || 0,
      }
    })
  }, [stockData, 分析週期])

  // 當日成交量與均量
  const 今日成交量 = stockData?.candlestickData?.[stockData.candlestickData.length - 1]?.volume || 0
  const 均量 = useMemo(() => {
    if (!stockData?.candlestickData?.length) return 0
    const total = stockData.candlestickData.reduce((sum, d) => sum + (d.volume || 0), 0)
    return Math.round(total / stockData.candlestickData.length)
  }, [stockData])

  const 量價關係 = useMemo(() => {
    if (!stockData?.candlestickData?.length || stockData.candlestickData.length < 2) return { text: "資料不足", color: "text-muted-foreground" }
    const last = stockData.candlestickData[stockData.candlestickData.length - 1]
    const prev = stockData.candlestickData[stockData.candlestickData.length - 2]
    const volUp = last.volume > prev.volume
    const priceUp = last.close > prev.close
    if (volUp && priceUp) return { text: "量增價漲", color: "text-emerald-500" }
    if (volUp && !priceUp) return { text: "量增價跌", color: "text-rose-500" }
    if (!volUp && priceUp) return { text: "量縮價漲", color: "text-amber-500" }
    return { text: "量縮價跌", color: "text-muted-foreground" }
  }, [stockData])

  // 換手率估算 (volume / outstanding shares * 100) - 用市值/價格估算股數
  const 換手率 = useMemo(() => {
    if (!stockData?.candlestickData?.length || !stockData.price) return 0
    const lastVol = stockData.candlestickData[stockData.candlestickData.length - 1]?.volume || 0
    // 粗略估算: 假設平均市值對應股數，這裡簡化為用成交量除以一個基數
    // 對於美股，日成交量通常在數百萬到數千萬，換手率約 0.5% - 5%
    // 用一個簡單的啟發式公式
    return Math.min(((lastVol / 1e9) * 100), 15).toFixed(2)
  }, [stockData])

  // 異常成交量數據來自 scanner
  const 異常成交量數據 = useMemo(() => {
    return scannerData
      .filter((s) => s.volumeRatio > 1.0)
      .slice(0, 10)
      .map((s) => ({
        股票代號: s.ticker,
        股票名稱: s.name,
        量比: s.volumeRatio,
        價格變化: s.closeStrength - 50,
        類型: s.volumeRatio > 1.5 ? "爆量" : s.volumeRatio > 1.2 ? "量增" : "量增",
        signal: s.signal,
      }))
  }, [scannerData])

  const chip = stockData?.chipDistribution

  return (
    <div className="space-y-6">
      {/* 頂部控制區 */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜尋美股代號 (如 AAPL)..."
            value={搜尋關鍵字}
            onChange={(e) => set搜尋關鍵字(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleSearch()
              }
            }}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "搜尋"}
        </Button>
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
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/10 px-4 py-2 text-sm text-rose-500">
          {error}
        </div>
      )}

      {/* 股票標題 */}
      {stockData && (
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-lg font-bold px-3 py-1">
            {stockData.ticker}
          </Badge>
          <span className="text-muted-foreground">{stockData.name}</span>
          <span className="text-2xl font-bold">${stockData.price.toFixed(2)}</span>
        </div>
      )}

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
          <TabsTrigger value="籌碼分析" className="gap-2">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">籌碼分析</span>
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
                  量價分布圖 (Volume Profile)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {loading ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={量價分布圖數據}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                        <YAxis
                          dataKey="價位"
                          type="category"
                          stroke="hsl(var(--muted-foreground))"
                          width={70}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number, name: string) => [`${(value / 1e6).toFixed(1)}M`, name]}
                        />
                        <Bar dataKey="買盤" stackId="a" fill="#10b981" name="買盤" radius={[0, 2, 2, 0]} />
                        <Bar dataKey="賣盤" stackId="a" fill="#f43f5e" name="賣盤" radius={[0, 2, 2, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">量價分析摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {chip && (
                  <>
                    <div className="rounded-lg bg-primary/5 p-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="font-medium">成本密集區 (POC)</span>
                      </div>
                      <p className="mt-2 text-2xl font-bold">${chip.poc.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">最大成交量價位</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">上方套牢籌碼</span>
                        <span className="font-medium">{chip.upperTrappedChips.toFixed(1)}%</span>
                      </div>
                      <Progress value={chip.upperTrappedChips} className="h-2" indicatorClassName="bg-rose-500" />

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">下方支撐密度</span>
                        <span className="font-medium">{chip.lowerSupportDensity.toFixed(1)}%</span>
                      </div>
                      <Progress value={chip.lowerSupportDensity} className="h-2" indicatorClassName="bg-emerald-500" />
                    </div>

                    <div className="rounded-lg bg-primary/5 p-4">
                      <p className="text-sm text-muted-foreground">
                        價值區域 (VA): ${chip.val.toFixed(2)} - ${chip.vah.toFixed(2)}
                        <br />
                        當前價格 ${stockData?.price.toFixed(2)} 位於
                        {stockData && chip && stockData.price > chip.vah ? "價值區上方，偏多" : stockData && chip && stockData.price < chip.val ? "價值區下方，偏弱" : "價值區內，盤整"}
                        。
                      </p>
                    </div>
                  </>
                )}
                {!chip && (
                  <div className="text-sm text-muted-foreground">載入中...</div>
                )}
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
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
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
                        tickFormatter={(value) => `${(value / 1e6).toFixed(0)}M`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(v) => `$${v}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number, name: string) => {
                          if (name === "成交量" || name === "均量") return [`${(value / 1e6).toFixed(1)}M`, name]
                          return [`$${value}`, name]
                        }}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="成交量"
                        fill="#3b82f6"
                        opacity={0.6}
                        name="成交量"
                      >
                        {成交量趨勢數據.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.價格 >= (成交量趨勢數據[index - 1]?.價格 || entry.價格) ? "#10b981" : "#f43f5e"} />
                        ))}
                      </Bar>
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="均量"
                        stroke="#94a3b8"
                        strokeDasharray="5 5"
                        name="均量"
                        dot={false}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="價格"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        name="收盤價"
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-4">
            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">最新成交量</p>
                    <p className="text-2xl font-bold">{(今日成交量 / 1e6).toFixed(1)}M</p>
                  </div>
                  <Volume2 className="h-8 w-8 text-primary/50" />
                </div>
                <p className="mt-2 text-sm text-emerald-500">
                  較均量 {今日成交量 > 均量 ? "+" : ""}{((今日成交量 / 均量 - 1) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">平均成交量</p>
                    <p className="text-2xl font-bold">{(均量 / 1e6).toFixed(1)}M</p>
                  </div>
                  <Activity className="h-8 w-8 text-cyan-500/50" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{stockData?.candlestickData?.length || 0} 日平均</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">量價關係</p>
                    <p className={`text-2xl font-bold ${量價關係.color}`}>{量價關係.text}</p>
                  </div>
                  {量價關係.text.includes("漲") ? (
                    <TrendingUp className="h-8 w-8 text-emerald-500/50" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-rose-500/50" />
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {量價關係.text.includes("量增價漲") ? "多頭趨勢" : "需留意"}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">換手率 (估算)</p>
                    <p className="text-2xl font-bold">{換手率}%</p>
                  </div>
                  <Zap className="h-8 w-8 text-amber-500/50" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {parseFloat(換手率) > 3 ? "高度活躍" : parseFloat(換手率) > 1 ? "活躍度適中" : "相對冷清"}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 籌碼分析 */}
        <TabsContent value="籌碼分析" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Layers className="h-4 w-4 text-primary" />
                  籌碼分布關鍵價位
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chip ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-border/50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">POC (最大成交量價位)</span>
                        <span className="text-lg font-bold text-primary">${chip.poc.toFixed(2)}</span>
                      </div>
                      <Progress value={100} className="mt-2 h-2" indicatorClassName="bg-primary" />
                    </div>

                    <div className="rounded-lg border border-border/50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">VAH (價值區上緣)</span>
                        <span className="text-lg font-bold text-emerald-500">${chip.vah.toFixed(2)}</span>
                      </div>
                      <Progress value={80} className="mt-2 h-2" indicatorClassName="bg-emerald-500" />
                    </div>

                    <div className="rounded-lg border border-border/50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">VAL (價值區下緣)</span>
                        <span className="text-lg font-bold text-rose-500">${chip.val.toFixed(2)}</span>
                      </div>
                      <Progress value={40} className="mt-2 h-2" indicatorClassName="bg-rose-500" />
                    </div>

                    <div className="rounded-lg bg-primary/5 p-4">
                      <h4 className="font-medium">HVN (高量節點)</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {chip.hvn.slice(0, 5).map((p) => (
                          <Badge key={p} variant="outline" className="border-primary/50 text-primary">
                            ${p.toFixed(2)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/30 p-4">
                      <h4 className="font-medium">LVN (低量節點)</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {chip.lvn.slice(0, 5).map((p) => (
                          <Badge key={p} variant="outline" className="border-muted-foreground/50 text-muted-foreground">
                            ${p.toFixed(2)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    載入中...
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-primary" />
                  籌碼壓力分析
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {chip ? (
                  <>
                    <div className="rounded-lg bg-rose-500/10 p-4">
                      <h4 className="font-medium text-rose-500">上方套牢籌碼</h4>
                      <p className="mt-2 text-3xl font-bold text-rose-500">{chip.upperTrappedChips.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">
                        高於當前價格的套牢籌碼比例，比例越高，上漲時面臨的賣壓越大。
                      </p>
                    </div>

                    <div className="rounded-lg bg-emerald-500/10 p-4">
                      <h4 className="font-medium text-emerald-500">下方支撐密度</h4>
                      <p className="mt-2 text-3xl font-bold text-emerald-500">{chip.lowerSupportDensity.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">
                        低於當前價格的支撐籌碼密度，密度越高，下跌時支撐越強。
                      </p>
                    </div>

                    <div className="rounded-lg bg-primary/5 p-4">
                      <h4 className="font-medium text-primary">籌碼壓力指數</h4>
                      <p className="mt-2 text-3xl font-bold text-primary">{chip.chipPressure.toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">
                        {chip.chipPressure > 50 ? "壓力較大，短線可能回檔" : chip.chipPressure > 20 ? "壓力適中" : "壓力輕微，有利上攻"}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">載入中...</div>
                )}
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
              {scannerLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-3">
                  {異常成交量數據.length === 0 && (
                    <div className="text-sm text-muted-foreground">暫無異常數據</div>
                  )}
                  {異常成交量數據.map((股票) => (
                    <div
                      key={股票.股票代號}
                      className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-all hover:border-primary/50"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`rounded-full p-2 ${
                            股票.signal === "buy"
                              ? "bg-emerald-500/10"
                              : 股票.signal === "sell"
                                ? "bg-rose-500/10"
                                : "bg-amber-500/10"
                          }`}
                        >
                          {股票.signal === "buy" ? (
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                          ) : 股票.signal === "sell" ? (
                            <TrendingDown className="h-4 w-4 text-rose-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{股票.股票代號}</span>
                            <span className="text-muted-foreground">{股票.股票名稱}</span>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              股票.signal === "buy"
                                ? "border-emerald-500/50 text-emerald-500"
                                : 股票.signal === "sell"
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
                          <div className="text-lg font-bold">{股票.量比.toFixed(2)}x</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">強度</div>
                          <div
                            className={`text-lg font-bold ${
                              股票.價格變化 >= 0 ? "text-emerald-500" : "text-rose-500"
                            }`}
                          >
                            {股票.價格變化 >= 0 ? "+" : ""}
                            {股票.價格變化.toFixed(1)}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            set當前股票(股票.股票代號)
                            window.scrollTo({ top: 0, behavior: "smooth" })
                          }}
                        >
                          分析
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
