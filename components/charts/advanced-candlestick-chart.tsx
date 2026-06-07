'use client'

/**
 * 進階K線圖元件
 * Advanced Candlestick Chart Component
 *
 * 專業級K線圖，包含：
 * - K線蠟燭圖
 * - MA20, MA60, MA200 均線疊加
 * - VWAP
 * - 布林帶區域
 * - 支撐與阻力水平區
 * - 買賣訊號標記
 * - 突破標註
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Scatter,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Target,
  BarChart3,
  AlertTriangle,
  Zap,
  LineChart,
  CandlestickChart,
  ArrowUpCircle,
  ArrowDownCircle,
  Shield,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
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

// 覆蓋指標選項
const overlayOptions = [
  { key: 'ma', label: '均線', icon: LineChart },
  { key: 'bb', label: '布林帶', icon: Layers },
  { key: 'vwap', label: 'VWAP', icon: Target },
  { key: 'levels', label: '支撐/阻力', icon: Shield },
  { key: 'signals', label: '訊號', icon: Zap },
]

const MARGIN = { top: 10, right: 60, left: 10, bottom: 10 }

interface CandlestickOverlayProps {
  data: any[]
  yMin: number
  yMax: number
  width: number
  height: number
}

const CandlestickOverlay = ({ data, yMin, yMax, width, height }: CandlestickOverlayProps) => {
  if (!data.length || width <= 0 || height <= 0 || yMax <= yMin) return null

  const plotWidth = width - MARGIN.left - MARGIN.right
  const plotHeight = height - MARGIN.top - MARGIN.bottom
  const step = plotWidth / data.length
  const candleWidth = Math.max(step * 0.65, 2)

  const svgY = (price: number) =>
    MARGIN.top + plotHeight * (1 - (price - yMin) / (yMax - yMin))

  return (
    <svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}
    >
      {data.map((d, i) => {
        const open = Number(d.open ?? 0)
        const close = Number(d.close ?? 0)
        const high = Number(d.high ?? 0)
        const low = Number(d.low ?? 0)
        if (high === 0 || low === 0 || close === 0) return null

        const cx = MARGIN.left + (i + 0.5) * step
        const isUp = close >= open
        const color = isUp ? '#10b981' : '#f43f5e'

        const wickTop = svgY(high)
        const wickBottom = svgY(low)
        const bodyTop = svgY(Math.max(open, close))
        const bodyBottom = svgY(Math.min(open, close))
        const bodyHeight = Math.max(bodyBottom - bodyTop, 1)

        return (
          <g key={d.date || i}>
            <line
              x1={cx}
              y1={wickTop}
              x2={cx}
              y2={bodyTop}
              stroke={color}
              strokeWidth={1}
            />
            <line
              x1={cx}
              y1={bodyBottom}
              x2={cx}
              y2={wickBottom}
              stroke={color}
              strokeWidth={1}
            />
            <rect
              x={cx - candleWidth / 2}
              y={bodyTop}
              width={candleWidth}
              height={bodyHeight}
              fill={color}
              stroke={color}
              strokeWidth={1}
              rx={1}
              opacity={0.9}
            />
          </g>
        )
      })}
    </svg>
  )
}

// 自訂Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null

  const data = payload[0]?.payload
  if (!data) return null

  const open = Number(data.open ?? 0)
  const close = Number(data.close ?? 0)
  const high = Number(data.high ?? 0)
  const low = Number(data.low ?? 0)
  const volume = Number(data.volume ?? 0)
  const isUp = close >= open

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
          <span className="font-mono font-medium">${open.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">最高</span>
          <span className="font-mono font-medium text-emerald-500">${high.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">收盤</span>
          <span className={cn("font-mono font-medium", isUp ? "text-emerald-500" : "text-rose-500")}>
            ${close.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">最低</span>
          <span className="font-mono font-medium text-rose-500">${low.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-2 text-xs">
        <span className="text-muted-foreground">成交量</span>
        <span className="font-mono">{(volume / 1e6).toFixed(2)}M</span>
      </div>

      {data.ma20 != null && (
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded bg-blue-500/10 px-2 py-1 text-center">
            <div className="text-muted-foreground">MA20</div>
            <div className="font-mono text-blue-500">{Number(data.ma20).toFixed(2)}</div>
          </div>
          <div className="rounded bg-amber-500/10 px-2 py-1 text-center">
            <div className="text-muted-foreground">MA60</div>
            <div className="font-mono text-amber-500">{Number(data.ma60).toFixed(2)}</div>
          </div>
          <div className="rounded bg-purple-500/10 px-2 py-1 text-center">
            <div className="text-muted-foreground">MA200</div>
            <div className="font-mono text-purple-500">{Number(data.ma200).toFixed(2)}</div>
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
  const [activeOverlays, setActiveOverlays] = useState<string[]>(['ma', 'bb', 'vwap', 'levels', 'signals'])
  const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick')
  const chartRef = useRef<HTMLDivElement>(null)
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = chartRef.current
    if (!el) return
    const obs = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect
      setChartSize({ width: cr.width, height: cr.height })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // 處理圖表數據，計算均線、布林帶
  const { chartData, baseYMin } = useMemo(() => {
    if (!data || data.length === 0) return { chartData: [] as any[], baseYMin: 0 }

    const rawPrices = data.flatMap(d => [Number(d.high ?? 0), Number(d.low ?? 0)])
    const rawMin = Math.min(...rawPrices)
    const rawMax = Math.max(...rawPrices)
    const pad = (rawMax - rawMin) * 0.05 || rawMin * 0.05
    const baseYMin = Math.max(0, rawMin - pad)

    const chartData = data.map((d, i) => {
      const c = Number(d.close ?? 0)
      const slice20 = data.slice(Math.max(0, i - 19), i + 1)
      const slice60 = data.slice(Math.max(0, i - 59), i + 1)
      const slice200 = data.slice(Math.max(0, i - 199), i + 1)

      const ma20 = slice20.reduce((sum, x) => sum + Number(x.close ?? 0), 0) / slice20.length
      const ma60 = slice60.reduce((sum, x) => sum + Number(x.close ?? 0), 0) / slice60.length
      const ma200 = slice200.reduce((sum, x) => sum + Number(x.close ?? 0), 0) / slice200.length

      const std20 = Math.sqrt(
        slice20.reduce((sum, x) => sum + Math.pow(Number(x.close ?? 0) - ma20, 2), 0) / slice20.length
      )
      const bbUpper = ma20 + 2 * std20
      const bbLower = ma20 - 2 * std20

      const marker = markers.find(m => m.date === d.date)
      const breakout = breakoutAnnotations.find(b => b.date === d.date)

      return {
        ...d,
        yMin: baseYMin,
        isUp: c >= Number(d.open ?? 0),
        ma20: Number(ma20.toFixed(2)),
        ma60: Number(ma60.toFixed(2)),
        ma200: Number(ma200.toFixed(2)),
        bbUpper: Number(bbUpper.toFixed(2)),
        bbMiddle: Number(ma20.toFixed(2)),
        bbLower: Number(bbLower.toFixed(2)),
        marker,
        breakout,
      }
    })

    return { chartData, baseYMin }
  }, [data, markers, breakoutAnnotations])

  // 切換覆蓋指標
  const toggleOverlay = (key: string) => {
    setActiveOverlays((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  // 計算 VWAP
  const calculatedVwap = useMemo(() => {
    if (vwap != null && Number.isFinite(vwap)) return vwap
    if (!chartData || chartData.length === 0) return 0
    const totalVolume = chartData.reduce((sum, d) => sum + Number(d.volume ?? 0), 0)
    if (totalVolume === 0) return 0
    const totalVP = chartData.reduce(
      (sum, d) => sum + ((Number(d.high ?? 0) + Number(d.low ?? 0) + Number(d.close ?? 0)) / 3) * Number(d.volume ?? 0),
      0
    )
    return totalVP / totalVolume
  }, [chartData, vwap])

  // 計算 Y 軸範圍（納入所有啟用指標，避免線條被裁切）
  const [yMin, yMax] = useMemo(() => {
    if (!chartData || chartData.length === 0) return [baseYMin, baseYMin + 100]
    const prices: number[] = []
    chartData.forEach((d) => {
      prices.push(Number(d.high ?? 0), Number(d.low ?? 0))
      if (activeOverlays.includes('bb')) {
        prices.push(Number(d.bbUpper ?? 0), Number(d.bbLower ?? 0))
      }
      if (activeOverlays.includes('ma')) {
        prices.push(Number(d.ma20 ?? 0), Number(d.ma60 ?? 0), Number(d.ma200 ?? 0))
      }
    })
    if (activeOverlays.includes('levels')) {
      support.forEach((s) => prices.push(Number(s)))
      resistance.forEach((r) => prices.push(Number(r)))
    }
    if (activeOverlays.includes('vwap') && Number.isFinite(calculatedVwap) && calculatedVwap > 0) {
      prices.push(calculatedVwap)
    }
    const validPrices = prices.filter(v => Number.isFinite(v) && v > 0)
    if (validPrices.length === 0) return [baseYMin, baseYMin + 100]
    const min = Math.min(...validPrices)
    const max = Math.max(...validPrices)
    const pad = (max - min) * 0.05 || min * 0.05
    return [Math.max(0, min - pad), max + pad]
  }, [chartData, activeOverlays, baseYMin, support, resistance, calculatedVwap])

  const hasData = chartData.length > 0

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
        <div ref={chartRef} className="relative h-[420px] rounded-xl bg-muted/10 p-2">
          {/* 背景網格裝飾 */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

          {!hasData ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              載入圖表數據中...
            </div>
          ) : (
            <>
              {/* K線疊加層 */}
              {chartType === 'candlestick' && chartSize.width > 0 && (
                <CandlestickOverlay
                  data={chartData}
                  yMin={yMin}
                  yMax={yMax}
                  width={chartSize.width}
                  height={chartSize.height}
                />
              )}
              <div className="relative z-10 h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 60, left: 10, bottom: 10 }}>
                <defs>
                  {/* 支撐區漸變 */}
                  <linearGradient id="supportGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.08} />
                  </linearGradient>
                  {/* 阻力區漸變 */}
                  <linearGradient id="resistanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.25} />
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
                    if (!value) return ''
                    const date = new Date(value)
                    if (isNaN(date.getTime())) return String(value).slice(5)
                    return `${date.getMonth() + 1}/${date.getDate()}`
                  }}
                />

                <YAxis
                  domain={[yMin, yMax]}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
                  orientation="right"
                />

                <Tooltip content={<CustomTooltip />} />

                {/* 支撐區域 */}
                {activeOverlays.includes('levels') && support.length >= 1 && (
                  <ReferenceArea
                    y1={support.length >= 2 ? Math.min(...support) : Math.min(...support) * 0.995}
                    y2={Math.max(...support)}
                    fill="url(#supportGradient)"
                    stroke="#10b981"
                    strokeOpacity={0.3}
                    strokeDasharray="4 4"
                  />
                )}

                {/* 阻力區域 */}
                {activeOverlays.includes('levels') && resistance.length >= 1 && (
                  <ReferenceArea
                    y1={Math.min(...resistance)}
                    y2={resistance.length >= 2 ? Math.max(...resistance) : Math.max(...resistance) * 1.005}
                    fill="url(#resistanceGradient)"
                    stroke="#f43f5e"
                    strokeOpacity={0.3}
                    strokeDasharray="4 4"
                  />
                )}

                {/* 布林帶 */}
                {activeOverlays.includes('bb') && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="bbUpper"
                      stroke="#8b5cf6"
                      strokeWidth={1}
                      strokeOpacity={0.5}
                      dot={false}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="bbLower"
                      stroke="#8b5cf6"
                      strokeWidth={1}
                      strokeOpacity={0.5}
                      dot={false}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="bbMiddle"
                      stroke="#8b5cf6"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      strokeOpacity={0.7}
                      dot={false}
                      connectNulls
                    />
                  </>
                )}

                {/* K線/收盤價線（隱形 Line 供 Tooltip 使用） */}
                {chartType === 'candlestick' ? (
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="none"
                    dot={false}
                    activeDot={false}
                    connectNulls
                  />
                ) : (
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                )}

                {/* 均線 */}
                {activeOverlays.includes('ma') && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="ma20"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      name="MA20"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="ma60"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                      name="MA60"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="ma200"
                      stroke="#a855f7"
                      strokeWidth={2}
                      dot={false}
                      name="MA200"
                      connectNulls
                    />
                  </>
                )}

                {/* VWAP */}
                {activeOverlays.includes('vwap') && Number.isFinite(calculatedVwap) && calculatedVwap > 0 && (
                  <>
                    <ReferenceLine
                      y={calculatedVwap}
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      label={{
                        value: `VWAP $${calculatedVwap.toFixed(2)}`,
                        fill: '#0ea5e9',
                        fontSize: 11,
                        fontWeight: 600,
                        position: 'right',
                      }}
                    />
                    {anchoredVwap != null && Number.isFinite(anchoredVwap) && (
                      <ReferenceLine
                        y={anchoredVwap}
                        stroke="#06b6d4"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        label={{
                          value: `A-VWAP $${anchoredVwap.toFixed(2)}`,
                          fill: '#06b6d4',
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
                        stroke="#10b981"
                        strokeWidth={1.5}
                        strokeDasharray="8 4"
                        strokeOpacity={0.8}
                        label={{
                          value: `S${i + 1} $${level.toFixed(0)}`,
                          fill: '#10b981',
                          fontSize: 9,
                          position: 'left',
                        }}
                      />
                    ))}
                    {resistance.map((level, i) => (
                      <ReferenceLine
                        key={`resistance-${i}`}
                        y={level}
                        stroke="#f43f5e"
                        strokeWidth={1.5}
                        strokeDasharray="8 4"
                        strokeOpacity={0.8}
                        label={{
                          value: `R${i + 1} $${level.toFixed(0)}`,
                          fill: '#f43f5e',
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
                    dataKey="close"
                    shape={(props: any) => {
                      const { cx, cy, payload } = props
                      if (!payload?.marker || cx == null || cy == null) return <g />
                      const isBuy = payload.marker.type === 'buy'
                      return (
                        <g>
                          <circle
                            cx={cx}
                            cy={isBuy ? cy + 15 : cy - 15}
                            r={12}
                            fill={isBuy ? '#10b981' : '#f43f5e'}
                            opacity={0.2}
                          />
                          <circle
                            cx={cx}
                            cy={isBuy ? cy + 15 : cy - 15}
                            r={8}
                            fill={isBuy ? '#10b981' : '#f43f5e'}
                          />
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

                {/* 突破標註水平線 */}
                {breakoutAnnotations.map((anno, i) => (
                  <ReferenceLine
                    key={`breakout-${i}`}
                    y={anno.price}
                    stroke={anno.type === 'true-breakout' ? '#10b981' : '#f43f5e'}
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    label={{
                      value: anno.label,
                      fill: anno.type === 'true-breakout' ? '#10b981' : '#f43f5e',
                      fontSize: 10,
                      fontWeight: 600,
                      position: 'right',
                    }}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
            </div>
          </>
          )}
        </div>

        {/* 成交量圖 */}
        <div className="h-[100px] rounded-xl bg-muted/10 p-2">
          {!hasData ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              載入中...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 60, left: 10, bottom: 5 }}>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={[0, 'dataMax']} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null
                    const data = payload[0].payload
                    return (
                      <div className="glass-card rounded-lg border border-border/50 px-3 py-2 text-xs">
                        <span className="text-muted-foreground">成交量: </span>
                        <span className="font-mono font-medium">
                          {(Number(data.volume ?? 0) / 1e6).toFixed(2)}M
                        </span>
                      </div>
                    )
                  }}
                />
                <Bar
                  dataKey="volume"
                  radius={[2, 2, 0, 0]}
                  fill="#64748b"
                  fillOpacity={0.4}
                  isAnimationActive={false}
                />
                {/* 成交量均線 */}
                <Line
                  type="monotone"
                  dataKey={(d: any) => {
                    const idx = chartData.indexOf(d)
                    const slice = chartData.slice(Math.max(0, idx - 19), idx + 1)
                    return slice.reduce((sum, x) => sum + Number(x.volume ?? 0), 0) / slice.length
                  }}
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  dot={false}
                  strokeOpacity={0.7}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
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
