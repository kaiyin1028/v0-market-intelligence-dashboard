'use client'

/**
 * 回測圖表元件
 * Backtest Charts Component
 * 
 * 專業級回測分析圖表，包含：
 * - 權益曲線與基準對比
 * - 回撤圖表
 * - 月度報酬熱力圖
 * - 交易報酬分布直方圖
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Cell,
  BarChart,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Calendar,
  Activity,
  Target,
  AlertTriangle,
} from 'lucide-react'

// ============================================
// 權益曲線圖
// ============================================

interface EquityCurveData {
  date: string
  strategy: number
  benchmark: number
}

interface EquityCurveChartProps {
  data: EquityCurveData[]
  initialCapital?: number
}

export function EquityCurveChart({ data, initialCapital = 100 }: EquityCurveChartProps) {
  const finalStrategy = data[data.length - 1]?.strategy || initialCapital
  const finalBenchmark = data[data.length - 1]?.benchmark || initialCapital
  const strategyReturn = ((finalStrategy - initialCapital) / initialCapital * 100).toFixed(2)
  const benchmarkReturn = ((finalBenchmark - initialCapital) / initialCapital * 100).toFixed(2)
  const alpha = (Number(strategyReturn) - Number(benchmarkReturn)).toFixed(2)

  return (
    <Card className="glass-card overflow-hidden border-border/30">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 ring-1 ring-emerald-500/20">
              <LineChart className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight">
                權益曲線
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                策略績效 vs 基準指數
              </p>
            </div>
          </div>
          
          {/* 績效摘要 */}
          <div className="flex gap-3">
            <div className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-center">
              <div className="text-xs text-muted-foreground">策略報酬</div>
              <div className="text-lg font-bold text-emerald-500">+{strategyReturn}%</div>
            </div>
            <div className="rounded-lg bg-muted/30 px-3 py-1.5 text-center">
              <div className="text-xs text-muted-foreground">基準報酬</div>
              <div className="text-lg font-bold text-muted-foreground">+{benchmarkReturn}%</div>
            </div>
            <div className="rounded-lg bg-primary/10 px-3 py-1.5 text-center">
              <div className="text-xs text-muted-foreground">超額報酬</div>
              <div className={cn(
                "text-lg font-bold",
                Number(alpha) >= 0 ? "text-primary" : "text-rose-500"
              )}>
                {Number(alpha) >= 0 ? '+' : ''}{alpha}%
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[350px] rounded-xl bg-muted/10 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
              
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))', strokeOpacity: 0.3 }}
              />
              
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}`}
              />
              
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  padding: '12px',
                }}
                formatter={(value: number, name: string) => {
                  const label = name === 'strategy' ? '策略' : '基準'
                  const pct = ((value - initialCapital) / initialCapital * 100).toFixed(2)
                  return [`${value.toFixed(2)} (${Number(pct) >= 0 ? '+' : ''}${pct}%)`, label]
                }}
              />
              
              <Legend
                formatter={(value) => value === 'strategy' ? '策略績效' : '基準指數'}
              />
              
              <ReferenceLine
                y={initialCapital}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
              />
              
              <Area
                type="monotone"
                dataKey="strategy"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2.5}
                fill="url(#equityGradient)"
                dot={false}
                name="strategy"
              />
              
              <Line
                type="monotone"
                dataKey="benchmark"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                name="benchmark"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// 回撤圖表
// ============================================

interface DrawdownData {
  date: string
  drawdown: number
}

interface DrawdownChartProps {
  data: DrawdownData[]
  maxDrawdown?: number
}

export function DrawdownChart({ data, maxDrawdown }: DrawdownChartProps) {
  const calculatedMaxDrawdown = maxDrawdown || Math.min(...data.map(d => d.drawdown))
  
  return (
    <Card className="glass-card overflow-hidden border-border/30">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-500/5 ring-1 ring-rose-500/20">
              <TrendingDown className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight">
                回撤分析
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                策略最大回撤追蹤
              </p>
            </div>
          </div>
          
          <div className="rounded-lg bg-rose-500/10 px-3 py-1.5 text-center ring-1 ring-rose-500/20">
            <div className="text-xs text-muted-foreground">最大回撤</div>
            <div className="text-xl font-bold text-rose-500">
              {calculatedMaxDrawdown.toFixed(2)}%
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[200px] rounded-xl bg-muted/10 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
              
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              
              <YAxis
                domain={['dataMin', 0]}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, '回撤']}
              />
              
              <ReferenceLine y={0} stroke="hsl(var(--border))" />
              
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                fill="url(#drawdownGradient)"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* 回撤警示 */}
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-amber-500/10 p-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="text-muted-foreground">
            {calculatedMaxDrawdown > -10 
              ? '回撤控制良好，風險管理有效'
              : calculatedMaxDrawdown > -20
                ? '回撤在可接受範圍內，但需注意風險控制'
                : '回撤較大，建議檢視策略風險管理機制'
            }
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// 月度報酬熱力圖
// ============================================

interface MonthlyReturn {
  year: number
  month: number
  monthName: string
  return: number
}

interface MonthlyHeatmapProps {
  data: MonthlyReturn[]
}

const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

export function MonthlyReturnHeatmap({ data }: MonthlyHeatmapProps) {
  // 按年份分組
  const years = [...new Set(data.map(d => d.year))].sort()
  
  const getColor = (ret: number) => {
    if (ret >= 5) return 'bg-emerald-500 text-white'
    if (ret >= 2) return 'bg-emerald-400/80 text-white'
    if (ret >= 0) return 'bg-emerald-300/60 text-emerald-900'
    if (ret >= -2) return 'bg-rose-300/60 text-rose-900'
    if (ret >= -5) return 'bg-rose-400/80 text-white'
    return 'bg-rose-500 text-white'
  }

  const getMonthReturn = (year: number, month: number) => {
    return data.find(d => d.year === year && d.month === month)?.return
  }

  return (
    <Card className="glass-card overflow-hidden border-border/30">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-chart-4/50 to-transparent" />
      
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-chart-4/20 to-chart-4/5 ring-1 ring-chart-4/20">
            <Calendar className="h-5 w-5 text-chart-4" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight">
              月度報酬熱力圖
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              各月份績效表現一覽
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">年份</th>
                {months.map((month, i) => (
                  <th key={i} className="px-1 py-2 text-center text-xs font-medium text-muted-foreground">
                    {month.slice(0, 2)}
                  </th>
                ))}
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-foreground">年度</th>
              </tr>
            </thead>
            <tbody>
              {years.map(year => {
                const yearData = data.filter(d => d.year === year)
                const yearTotal = yearData.reduce((sum, d) => sum + d.return, 0)
                
                return (
                  <tr key={year} className="border-t border-border/20">
                    <td className="px-2 py-1.5 text-sm font-medium">{year}</td>
                    {months.map((_, month) => {
                      const ret = getMonthReturn(year, month + 1)
                      return (
                        <td key={month} className="px-1 py-1.5">
                          {ret !== undefined ? (
                            <div
                              className={cn(
                                'mx-auto flex h-8 w-10 items-center justify-center rounded-md text-xs font-medium transition-transform hover:scale-110',
                                getColor(ret)
                              )}
                            >
                              {ret >= 0 ? '+' : ''}{ret.toFixed(1)}
                            </div>
                          ) : (
                            <div className="mx-auto h-8 w-10 rounded-md bg-muted/20" />
                          )}
                        </td>
                      )
                    })}
                    <td className="px-2 py-1.5 text-right">
                      <span className={cn(
                        'text-sm font-bold',
                        yearTotal >= 0 ? 'text-emerald-500' : 'text-rose-500'
                      )}>
                        {yearTotal >= 0 ? '+' : ''}{yearTotal.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {/* 圖例 */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">報酬率:</span>
          <div className="flex items-center gap-1">
            <div className="h-4 w-8 rounded bg-rose-500" />
            <span className="text-xs text-muted-foreground">{'<-5%'}</span>
          </div>
          <div className="h-4 w-8 rounded bg-rose-300/60" />
          <div className="h-4 w-8 rounded bg-emerald-300/60" />
          <div className="h-4 w-8 rounded bg-emerald-400/80" />
          <div className="flex items-center gap-1">
            <div className="h-4 w-8 rounded bg-emerald-500" />
            <span className="text-xs text-muted-foreground">{'>5%'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// 交易報酬分布直方圖
// ============================================

interface TradeDistribution {
  range: string
  count: number
  percentage?: number
}

interface TradeDistributionHistogramProps {
  data: TradeDistribution[]
  totalTrades?: number
}

export function TradeDistributionHistogram({ data, totalTrades }: TradeDistributionHistogramProps) {
  const total = totalTrades || data.reduce((sum, d) => sum + d.count, 0)
  const processedData = data.map(d => ({
    ...d,
    percentage: (d.count / total * 100).toFixed(1)
  }))
  
  // 計算勝率
  const winningTrades = data
    .filter(d => d.range.includes('+') || (d.range.includes('0%') && d.range.includes('~')))
    .reduce((sum, d) => sum + d.count, 0)
  const winRate = (winningTrades / total * 100).toFixed(1)

  return (
    <Card className="glass-card overflow-hidden border-border/30">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight">
                交易報酬分布
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                單筆交易損益分布直方圖
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="rounded-lg bg-muted/30 px-3 py-1.5 text-center">
              <div className="text-xs text-muted-foreground">總交易數</div>
              <div className="text-lg font-bold">{total}</div>
            </div>
            <div className="rounded-lg bg-primary/10 px-3 py-1.5 text-center">
              <div className="text-xs text-muted-foreground">勝率</div>
              <div className="text-lg font-bold text-primary">{winRate}%</div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[250px] rounded-xl bg-muted/10 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} vertical={false} />
              
              <XAxis
                dataKey="range"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                label={{ 
                  value: '交易次數', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' }
                }}
              />
              
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                }}
                formatter={(value: number, name: string, props: any) => {
                  return [`${value} 次 (${props.payload.percentage}%)`, '交易次數']
                }}
              />
              
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {processedData.map((entry, index) => {
                  const isNegative = entry.range.includes('-') && !entry.range.includes('~')
                  const isLoss = entry.range.startsWith('-')
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={isLoss ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))'}
                      fillOpacity={0.8}
                    />
                  )
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* 分布說明 */}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 p-3">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <div>
              <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">獲利交易</div>
              <div className="text-xs text-muted-foreground">
                {winningTrades} 次 ({winRate}%)
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-rose-500/10 p-3">
            <TrendingDown className="h-5 w-5 text-rose-500" />
            <div>
              <div className="text-sm font-medium text-rose-600 dark:text-rose-400">虧損交易</div>
              <div className="text-xs text-muted-foreground">
                {total - winningTrades} 次 ({(100 - Number(winRate)).toFixed(1)}%)
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
