'use client'

/**
 * 價格圖表模擬元件
 * Price Chart Mock Component
 * 
 * 模擬K線圖與技術指標覆蓋
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
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
  Area,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Target,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { CandlestickData, ChartMarker } from '@/types'

interface PriceChartMockProps {
  /** K線數據 */
  data: CandlestickData[]
  /** 買賣標記 */
  markers?: ChartMarker[]
  /** 均線設定 */
  movingAverages?: {
    ma20: number
    ma60: number
    ma200: number
  }
  /** 布林帶設定 */
  bollingerBands?: {
    upper: number
    middle: number
    lower: number
  }
  /** VWAP */
  vwap?: number
  /** 支撐位 */
  support?: number[]
  /** 阻力位 */
  resistance?: number[]
}

// 時間週期選項
const timeframes = [
  { value: '1D', label: '日' },
  { value: '1W', label: '週' },
  { value: '1M', label: '月' },
  { value: '3M', label: '季' },
  { value: '6M', label: '半年' },
  { value: '1Y', label: '年' },
  { value: '5Y', label: '5年' },
]

// 覆蓋指標選項
const overlayOptions = [
  { key: 'ma', label: '均線' },
  { key: 'bb', label: '布林帶' },
  { key: 'vwap', label: 'VWAP' },
  { key: 'levels', label: '支撐/阻力' },
]

export function PriceChartMock({
  data,
  markers = [],
  movingAverages,
  bollingerBands,
  vwap,
  support = [],
  resistance = [],
}: PriceChartMockProps) {
  const [timeframe, setTimeframe] = useState('1M')
  const [activeOverlays, setActiveOverlays] = useState<string[]>(['ma', 'levels'])

  // 處理圖表數據
  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      // 計算K線顏色依據
      isUp: d.close >= d.open,
      // 模擬均線數據
      ma20: d.close * (0.98 + Math.random() * 0.04),
      ma60: d.close * (0.96 + Math.random() * 0.08),
      ma200: d.close * (0.92 + Math.random() * 0.16),
      // 模擬布林帶
      bbUpper: d.high * 1.02,
      bbLower: d.low * 0.98,
    }))
  }, [data])

  // 切換覆蓋指標
  const toggleOverlay = (key: string) => {
    setActiveOverlays((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  // 計算Y軸範圍
  const yDomain = useMemo(() => {
    const prices = chartData.flatMap((d) => [d.high, d.low])
    const min = Math.min(...prices) * 0.98
    const max = Math.max(...prices) * 1.02
    return [min, max]
  }, [chartData])

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-4 w-4 text-primary" />
            技術分析圖表
          </CardTitle>

          {/* 時間週期選擇 */}
          <Tabs value={timeframe} onValueChange={setTimeframe}>
            <TabsList className="h-8">
              {timeframes.map((tf) => (
                <TabsTrigger key={tf.value} value={tf.value} className="text-xs px-2 h-6">
                  {tf.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* 覆蓋指標切換 */}
        <div className="flex flex-wrap gap-2 mt-3">
          {overlayOptions.map((option) => (
            <Button
              key={option.key}
              variant={activeOverlays.includes(option.key) ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => toggleOverlay(option.key)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {/* 主圖表 */}
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={yDomain}
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.toFixed(0)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: 12,
                }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    close: '收盤',
                    high: '最高',
                    low: '最低',
                    ma20: 'MA20',
                    ma60: 'MA60',
                    ma200: 'MA200',
                  }
                  return [value.toFixed(2), labels[name] || name]
                }}
              />

              {/* 布林帶 */}
              {activeOverlays.includes('bb') && (
                <Area
                  type="monotone"
                  dataKey="bbUpper"
                  stroke="none"
                  fill="var(--chart-5)"
                  fillOpacity={0.1}
                />
              )}

              {/* K線模擬 - 使用收盤價折線 */}
              <Line
                type="monotone"
                dataKey="close"
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={false}
              />

              {/* 均線 */}
              {activeOverlays.includes('ma') && (
                <>
                  <Line
                    type="monotone"
                    dataKey="ma20"
                    stroke="var(--chart-1)"
                    strokeWidth={1}
                    dot={false}
                    strokeDasharray="0"
                  />
                  <Line
                    type="monotone"
                    dataKey="ma60"
                    stroke="var(--chart-4)"
                    strokeWidth={1}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ma200"
                    stroke="var(--chart-2)"
                    strokeWidth={1}
                    dot={false}
                  />
                </>
              )}

              {/* VWAP */}
              {activeOverlays.includes('vwap') && vwap && (
                <ReferenceLine
                  y={vwap}
                  stroke="var(--chart-5)"
                  strokeDasharray="5 5"
                  label={{
                    value: `VWAP ${vwap.toFixed(2)}`,
                    fill: 'var(--chart-5)',
                    fontSize: 10,
                  }}
                />
              )}

              {/* 支撐阻力位 */}
              {activeOverlays.includes('levels') && (
                <>
                  {support.map((level, i) => (
                    <ReferenceLine
                      key={`support-${i}`}
                      y={level}
                      stroke="var(--chart-1)"
                      strokeDasharray="3 3"
                      strokeOpacity={0.7}
                    />
                  ))}
                  {resistance.map((level, i) => (
                    <ReferenceLine
                      key={`resistance-${i}`}
                      y={level}
                      stroke="var(--chart-2)"
                      strokeDasharray="3 3"
                      strokeOpacity={0.7}
                    />
                  ))}
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 成交量圖 */}
        <div className="h-[80px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: 12,
                }}
                formatter={(value: number) => [
                  (value / 1e6).toFixed(2) + 'M',
                  '成交量',
                ]}
              />
              <Bar
                dataKey="volume"
                fill="var(--chart-3)"
                opacity={0.5}
                radius={[2, 2, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 圖例 */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs">
          {activeOverlays.includes('ma') && (
            <>
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 w-4 bg-chart-1" />
                <span className="text-muted-foreground">MA20</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 w-4 bg-chart-4" />
                <span className="text-muted-foreground">MA60</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 w-4 bg-chart-2" />
                <span className="text-muted-foreground">MA200</span>
              </div>
            </>
          )}
          {activeOverlays.includes('levels') && (
            <>
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 w-4 bg-chart-1 opacity-70" style={{ borderStyle: 'dashed' }} />
                <span className="text-muted-foreground">支撐位</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 w-4 bg-chart-2 opacity-70" style={{ borderStyle: 'dashed' }} />
                <span className="text-muted-foreground">阻力位</span>
              </div>
            </>
          )}
        </div>

        {/* 買賣標記 */}
        {markers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {markers.map((marker, i) => (
              <Badge
                key={i}
                variant="outline"
                className={cn(
                  'text-xs',
                  marker.type === 'buy'
                    ? 'bg-chart-1/10 text-chart-1 border-chart-1/20'
                    : 'bg-chart-2/10 text-chart-2 border-chart-2/20'
                )}
              >
                {marker.type === 'buy' ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                {marker.label}
                <span className="ml-1 opacity-70">${marker.price}</span>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
