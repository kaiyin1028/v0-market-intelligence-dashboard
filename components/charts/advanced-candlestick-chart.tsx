'use client'

/**
 * 進階K線圖元件
 * Advanced Candlestick Chart Component
 * 
 * 專業級K線圖，包含：
 * - 模擬K線蠟燭圖
 * - MA20, MA60, MA200 均線疊加
 * - VWAP 與錨定VWAP
 * - 布林帶區域
 * - 支撐與阻力水平區
 * - 買賣訊號標記
 * - 突破與假突破標註
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Cell,
  Area,
  Scatter,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Target,
  Activity,
  BarChart3,
  AlertTriangle,
  Zap,
  LineChart,
  CandlestickChart,
  ArrowUpCircle,
  ArrowDownCircle,
  Shield,
  Eye,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { CandlestickData, ChartMarker } from '@/types'

interface AdvancedCandlestickChartProps {
  /** K線數據 */
  data: CandlestickData[]
  /** 買賣標記 */
  markers?: ChartMarker[]
  /** VWAP */
  vwap?: number
  /** 錨定VWAP */
  anchoredVwap?: number
  /** 支撐位 */
  support?: number[]
  /** 阻力位 */
  resistance?: number[]
  /** 突破標記 */
  breakoutAnnotations?: {
    date: string
    type: 'true-breakout' | 'false-breakout'
    price: number
    label: string
  }[]
}

// 時間週期選項
const timeframes = [
  { value: '1D', label: '日' },
  { value: '1W', label: '週' },
  { value: '1M', label: '月' },
  { value: '3M', label: '季' },
  { value: '6M', label: '半年' },
  { value: '1Y', label: '年' },
]

// 覆蓋指標選項
const overlayOptions = [
  { key: 'ma', label: '均線', icon: LineChart },
  { key: 'bb', label: '布林帶', icon: Layers },
  { key: 'vwap', label: 'VWAP', icon: Target },
  { key: 'levels', label: '支撐/阻力', icon: Shield },
  { key: 'signals', label: '訊號', icon: Zap },
]

// 自訂K線蠟燭形狀
const CandlestickShape = (props: any) => {
  const { x, y, width, height, payload } = props
  if (!payload) return null
  
  const { open, close, high, low } = payload
  const isUp = close >= open
  const candleWidth = Math.max(width * 0.7, 4)
  const wickWidth = 1
  
  // 計算價格比例
  const priceRange = high - low
  const yScale = height / priceRange || 1
  
  const bodyTop = Math.min(open, close)
  const bodyBottom = Math.max(open, close)
  const bodyHeight = Math.max((bodyBottom - bodyTop) * yScale, 1)
  const bodyY = y + (high - bodyBottom) * yScale
  
  const wickX = x + candleWidth / 2
  
  return (
    <g>
      {/* 上影線 */}
      <line
        x1={wickX}
        y1={y}
        x2={wickX}
        y2={bodyY}
        stroke={isUp ? 'var(--chart-1)' : 'var(--chart-2)'}
        strokeWidth={wickWidth}
      />
      {/* 下影線 */}
      <line
        x1={wickX}
        y1={bodyY + bodyHeight}
        x2={wickX}
        y2={y + height}
        stroke={isUp ? 'var(--chart-1)' : 'var(--chart-2)'}
        strokeWidth={wickWidth}
      />
      {/* 蠟燭實體 */}
      <rect
        x={x + (candleWidth - candleWidth) / 2}
        y={bodyY}
        width={candleWidth}
        height={Math.max(bodyHeight, 1)}
        fill={isUp ? 'var(--chart-1)' : 'var(--chart-2)'}
        stroke={isUp ? 'var(--chart-1)' : 'var(--chart-2)'}
        strokeWidth={1}
        rx={1}
        opacity={0.9}
      />
    </g>
  )
}

// 自訂Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null
  
  const data = payload[0]?.payload
  if (!data) return null
  
  const isUp = data.close >= data.open
  
  return (
    <div className="glass-card rounded-xl border border-border/50 p-4 shadow-xl backdrop-blur-xl">
      <div className="mb-2 flex items-center gap-2 border-b border-border/30 pb-2">
        <div className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full",
          isUp ? "bg-emerald-500/20" : "bg-rose-500/20"
        )}>
          {isUp ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
          )}
        </div>
        <span className="font-medium">{label}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">開盤</span>
          <span className="font-mono font-medium">${data.open?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">最高</span>
          <span className="font-mono font-medium text-emerald-500">${data.high?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">收盤</span>
          <span className={cn("font-mono font-medium", isUp ? "text-emerald-500" : "text-rose-500")}>
            ${data.close?.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">最低</span>
          <span className="font-mono font-medium text-rose-500">${data.low?.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-2 text-xs">
        <span className="text-muted-foreground">成交量</span>
        <span className="font-mono">{(data.volume / 1e6).toFixed(2)}M</span>
      </div>
      
      {data.ma20 && (
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded bg-blue-500/10 px-2 py-1 text-center">
            <div className="text-muted-foreground">MA20</div>
            <div className="font-mono text-blue-500">{data.ma20.toFixed(2)}</div>
          </div>
          <div className="rounded bg-amber-500/10 px-2 py-1 text-center">
            <div className="text-muted-foreground">MA60</div>
            <div className="font-mono text-amber-500">{data.ma60.toFixed(2)}</div>
          </div>
          <div className="rounded bg-purple-500/10 px-2 py-1 text-center">
            <div className="text-muted-foreground">MA200</div>
            <div className="font-mono text-purple-500">{data.ma200.toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export function AdvancedCandlestickChart({
  data,
  markers = [],
  vwap,
  anchoredVwap,
  support = [],
  resistance = [],
  breakoutAnnotations = [],
}: AdvancedCandlestickChartProps) {
  const [timeframe, setTimeframe] = useState('1M')
  const [activeOverlays, setActiveOverlays] = useState<string[]>(['ma', 'levels', 'signals'])
  const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick')

  // 處理圖表數據
  const chartData = useMemo(() => {
    return data.map((d, i) => {
      // 計算簡單移動平均
      const slice20 = data.slice(Math.max(0, i - 19), i + 1)
      const slice60 = data.slice(Math.max(0, i - 59), i + 1)
      const slice200 = data.slice(Math.max(0, i - 199), i + 1)
      
      const ma20 = slice20.reduce((sum, x) => sum + x.close, 0) / slice20.length
      const ma60 = slice60.reduce((sum, x) => sum + x.close, 0) / slice60.length
      const ma200 = slice200.reduce((sum, x) => sum + x.close, 0) / slice200.length
      
      // 計算布林帶（20期）
      const std20 = Math.sqrt(
        slice20.reduce((sum, x) => sum + Math.pow(x.close - ma20, 2), 0) / slice20.length
      )
      const bbUpper = ma20 + 2 * std20
      const bbLower = ma20 - 2 * std20
      
      // 找出買賣標記
      const marker = markers.find(m => m.date === d.date)
      const breakout = breakoutAnnotations.find(b => b.date === d.date)
      
      return {
        ...d,
        isUp: d.close >= d.open,
        ma20: Number(ma20.toFixed(2)),
        ma60: Number(ma60.toFixed(2)),
        ma200: Number(ma200.toFixed(2)),
        bbUpper: Number(bbUpper.toFixed(2)),
        bbMiddle: Number(ma20.toFixed(2)),
        bbLower: Number(bbLower.toFixed(2)),
        marker,
        breakout,
        // 用於K線繪製的範圍
        candleRange: [d.low, d.high],
      }
    })
  }, [data, markers, breakoutAnnotations])

  // 切換覆蓋指標
  const toggleOverlay = (key: string) => {
    setActiveOverlays((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  // 計算Y軸範圍
  const [yMin, yMax] = useMemo(() => {
    const prices = chartData.flatMap((d) => [d.high, d.low])
    if (activeOverlays.includes('bb')) {
      prices.push(...chartData.map(d => d.bbUpper), ...chartData.map(d => d.bbLower))
    }
    const min = Math.min(...prices) * 0.98
    const max = Math.max(...prices) * 1.02
    return [min, max]
  }, [chartData, activeOverlays])

  // 計算VWAP (模擬)
  const calculatedVwap = useMemo(() => {
    if (vwap) return vwap
    const totalVolume = chartData.reduce((sum, d) => sum + d.volume, 0)
    const totalVP = chartData.reduce((sum, d) => sum + ((d.high + d.low + d.close) / 3) * d.volume, 0)
    return totalVP / totalVolume
  }, [chartData, vwap])

  return (
    <Card className="glass-card overflow-hidden border-border/30">
      {/* 頂部神經網路裝飾 */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
              <CandlestickChart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight">
                技術分析圖表
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                即時K線與技術指標疊加
              </p>
            </div>
          </div>

          {/* 時間週期選擇 */}
          <Tabs value={timeframe} onValueChange={setTimeframe}>
            <TabsList className="h-9 bg-muted/30 p-1">
              {timeframes.map((tf) => (
                <TabsTrigger 
                  key={tf.value} 
                  value={tf.value} 
                  className="px-3 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  {tf.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* 覆蓋指標切換 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">指標疊加:</span>
          {overlayOptions.map((option) => {
            const Icon = option.icon
            const isActive = activeOverlays.includes(option.key)
            return (
              <Button
                key={option.key}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  "h-8 gap-1.5 text-xs transition-all",
                  isActive 
                    ? "bg-primary/90 shadow-md shadow-primary/20" 
                    : "border-border/50 hover:bg-muted/50"
                )}
                onClick={() => toggleOverlay(option.key)}
              >
                <Icon className="h-3.5 w-3.5" />
                {option.label}
              </Button>
            )
          })}
          
          <Separator orientation="vertical" className="mx-2 h-6" />
          
          {/* 圖表類型切換 */}
          <div className="flex rounded-lg bg-muted/30 p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 px-2",
                chartType === 'candlestick' && "bg-background shadow-sm"
              )}
              onClick={() => setChartType('candlestick')}
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 px-2",
                chartType === 'line' && "bg-background shadow-sm"
              )}
              onClick={() => setChartType('line')}
            >
              <LineChart className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-6">
        {/* 主圖表 */}
        <div className="relative h-[420px] rounded-xl bg-muted/10 p-2">
          {/* 背景網格裝飾 */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 60, left: 10, bottom: 10 }}>
              <defs>
                {/* 布林帶漸變 */}
                <linearGradient id="bbGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-5))" stopOpacity={0.15} />
                  <stop offset="50%" stopColor="hsl(var(--chart-5))" stopOpacity={0.05} />
                  <stop offset="100%" stopColor="hsl(var(--chart-5))" stopOpacity={0.15} />
                </linearGradient>
                {/* 支撐區漸變 */}
                <linearGradient id="supportGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.05} />
                </linearGradient>
                {/* 阻力區漸變 */}
                <linearGradient id="resistanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.05} />
                  <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                strokeOpacity={0.3}
                vertical={false}
              />
              
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))', strokeOpacity: 0.3 }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
              />
              
              <YAxis
                domain={[yMin, yMax]}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v.toFixed(0)}`}
                orientation="right"
              />
              
              <Tooltip content={<CustomTooltip />} />

              {/* 支撐區域 */}
              {activeOverlays.includes('levels') && support.length >= 2 && (
                <ReferenceArea
                  y1={Math.min(...support)}
                  y2={Math.max(...support)}
                  fill="url(#supportGradient)"
                  stroke="hsl(var(--chart-1))"
                  strokeOpacity={0.3}
                  strokeDasharray="4 4"
                />
              )}

              {/* 阻力區域 */}
              {activeOverlays.includes('levels') && resistance.length >= 2 && (
                <ReferenceArea
                  y1={Math.min(...resistance)}
                  y2={Math.max(...resistance)}
                  fill="url(#resistanceGradient)"
                  stroke="hsl(var(--chart-2))"
                  strokeOpacity={0.3}
                  strokeDasharray="4 4"
                />
              )}

              {/* 布林帶 */}
              {activeOverlays.includes('bb') && (
                <>
                  <Area
                    type="monotone"
                    dataKey="bbUpper"
                    stroke="hsl(var(--chart-5))"
                    strokeWidth={1}
                    strokeOpacity={0.5}
                    fill="none"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="bbLower"
                    stroke="hsl(var(--chart-5))"
                    strokeWidth={1}
                    strokeOpacity={0.5}
                    fill="url(#bbGradient)"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="bbMiddle"
                    stroke="hsl(var(--chart-5))"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    strokeOpacity={0.7}
                    dot={false}
                  />
                </>
              )}

              {/* K線/收盤價線 */}
              {chartType === 'candlestick' ? (
                <Bar
                  dataKey="candleRange"
                  shape={<CandlestickShape />}
                  barSize={8}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isUp ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))'}
                    />
                  ))}
                </Bar>
              ) : (
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  dot={false}
                />
              )}

              {/* 均線 */}
              {activeOverlays.includes('ma') && (
                <>
                  <Line
                    type="monotone"
                    dataKey="ma20"
                    stroke="hsl(210, 100%, 60%)"
                    strokeWidth={1.5}
                    dot={false}
                    name="MA20"
                  />
                  <Line
                    type="monotone"
                    dataKey="ma60"
                    stroke="hsl(45, 100%, 55%)"
                    strokeWidth={1.5}
                    dot={false}
                    name="MA60"
                  />
                  <Line
                    type="monotone"
                    dataKey="ma200"
                    stroke="hsl(280, 80%, 60%)"
                    strokeWidth={1.5}
                    dot={false}
                    name="MA200"
                  />
                </>
              )}

              {/* VWAP */}
              {activeOverlays.includes('vwap') && (
                <>
                  <ReferenceLine
                    y={calculatedVwap}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    label={{
                      value: `VWAP $${calculatedVwap.toFixed(2)}`,
                      fill: 'hsl(var(--primary))',
                      fontSize: 11,
                      fontWeight: 600,
                      position: 'right',
                    }}
                  />
                  {anchoredVwap && (
                    <ReferenceLine
                      y={anchoredVwap}
                      stroke="hsl(var(--chart-4))"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      label={{
                        value: `A-VWAP $${anchoredVwap.toFixed(2)}`,
                        fill: 'hsl(var(--chart-4))',
                        fontSize: 10,
                        position: 'right',
                      }}
                    />
                  )}
                </>
              )}

              {/* 支撐阻力線 */}
              {activeOverlays.includes('levels') && (
                <>
                  {support.map((level, i) => (
                    <ReferenceLine
                      key={`support-${i}`}
                      y={level}
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={1.5}
                      strokeDasharray="8 4"
                      strokeOpacity={0.8}
                      label={{
                        value: `S${i + 1} $${level.toFixed(0)}`,
                        fill: 'hsl(var(--chart-1))',
                        fontSize: 9,
                        position: 'left',
                      }}
                    />
                  ))}
                  {resistance.map((level, i) => (
                    <ReferenceLine
                      key={`resistance-${i}`}
                      y={level}
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={1.5}
                      strokeDasharray="8 4"
                      strokeOpacity={0.8}
                      label={{
                        value: `R${i + 1} $${level.toFixed(0)}`,
                        fill: 'hsl(var(--chart-2))',
                        fontSize: 9,
                        position: 'left',
                      }}
                    />
                  ))}
                </>
              )}

              {/* 買賣訊號標記 */}
              {activeOverlays.includes('signals') && (
                <Scatter
                  data={chartData.filter(d => d.marker)}
                  shape={(props: any) => {
                    const { cx, cy, payload } = props
                    if (!payload?.marker) return null
                    const isBuy = payload.marker.type === 'buy'
                    return (
                      <g>
                        {/* 發光效果 */}
                        <circle
                          cx={cx}
                          cy={isBuy ? cy + 15 : cy - 15}
                          r={12}
                          fill={isBuy ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))'}
                          opacity={0.2}
                        />
                        {/* 主圖標 */}
                        <circle
                          cx={cx}
                          cy={isBuy ? cy + 15 : cy - 15}
                          r={8}
                          fill={isBuy ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))'}
                        />
                        {/* 箭頭 */}
                        <text
                          x={cx}
                          y={isBuy ? cy + 19 : cy - 11}
                          textAnchor="middle"
                          fill="white"
                          fontSize={10}
                          fontWeight="bold"
                        >
                          {isBuy ? '▲' : '▼'}
                        </text>
                      </g>
                    )
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 成交量圖 */}
        <div className="h-[100px] rounded-xl bg-muted/10 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 60, left: 10, bottom: 5 }}>
              <XAxis dataKey="date" hide />
              <YAxis 
                hide 
                domain={[0, 'dataMax']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null
                  const data = payload[0].payload
                  return (
                    <div className="glass-card rounded-lg border border-border/50 px-3 py-2 text-xs">
                      <span className="text-muted-foreground">成交量: </span>
                      <span className="font-mono font-medium">
                        {(data.volume / 1e6).toFixed(2)}M
                      </span>
                    </div>
                  )
                }}
              />
              <Bar
                dataKey="volume"
                radius={[2, 2, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`vol-${index}`}
                    fill={entry.isUp ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))'}
                    fillOpacity={0.6}
                  />
                ))}
              </Bar>
              {/* 成交量均線 */}
              <Line
                type="monotone"
                dataKey={(d: any) => {
                  const idx = chartData.indexOf(d)
                  const slice = chartData.slice(Math.max(0, idx - 19), idx + 1)
                  return slice.reduce((sum, x) => sum + x.volume, 0) / slice.length
                }}
                stroke="hsl(var(--primary))"
                strokeWidth={1.5}
                dot={false}
                strokeOpacity={0.7}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 圖例與訊號標記 */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-muted/20 px-4 py-3">
          {/* 均線圖例 */}
          {activeOverlays.includes('ma') && (
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 w-5 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">MA20</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 w-5 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">MA60</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 w-5 rounded-full bg-purple-500" />
                <span className="text-muted-foreground">MA200</span>
              </div>
            </div>
          )}
          
          {/* 支撐阻力圖例 */}
          {activeOverlays.includes('levels') && (
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-emerald-500/20 ring-1 ring-emerald-500/50" />
                <span className="text-muted-foreground">支撐區</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-rose-500/20 ring-1 ring-rose-500/50" />
                <span className="text-muted-foreground">阻力區</span>
              </div>
            </div>
          )}
          
          {/* 訊號圖例 */}
          {activeOverlays.includes('signals') && (
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-muted-foreground">買入訊號</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowDownCircle className="h-4 w-4 text-rose-500" />
                <span className="text-muted-foreground">賣出訊號</span>
              </div>
            </div>
          )}
        </div>

        {/* 買賣標記列表 */}
        {markers.length > 0 && activeOverlays.includes('signals') && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <Zap className="h-4 w-4 text-primary" />
              近期訊號
            </h4>
            <div className="flex flex-wrap gap-2">
              {markers.slice(0, 5).map((marker, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className={cn(
                    'gap-1.5 px-3 py-1.5 text-xs transition-all hover:scale-105',
                    marker.type === 'buy'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-400'
                  )}
                >
                  {marker.type === 'buy' ? (
                    <ArrowUpCircle className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownCircle className="h-3.5 w-3.5" />
                  )}
                  <span className="font-medium">{marker.label}</span>
                  <span className="opacity-70">${marker.price}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 突破標註 */}
        {breakoutAnnotations.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              突破分析
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {breakoutAnnotations.slice(0, 4).map((annotation, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border px-3 py-2 text-sm',
                    annotation.type === 'true-breakout'
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-rose-500/30 bg-rose-500/5'
                  )}
                >
                  {annotation.type === 'true-breakout' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-500" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{annotation.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {annotation.date} · ${annotation.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
