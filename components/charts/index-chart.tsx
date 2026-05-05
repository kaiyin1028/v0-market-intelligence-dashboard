'use client'

/**
 * 主指數圖表元件
 * Main Index Chart Component
 * 
 * 顯示價格走勢與成交量
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useState, useMemo } from 'react'

interface ChartDataPoint {
  date: string
  price: number
  volume: number
}

interface IndexChartProps {
  title: string
  symbol: string
  currentPrice: number
  change: number
  changePercent: number
}

// 生成模擬圖表數據
const generateChartData = (days: number): ChartDataPoint[] => {
  const data: ChartDataPoint[] = []
  let price = 5200
  
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    price = price + (Math.random() - 0.48) * 30
    const volume = Math.floor(Math.random() * 5000000000 + 2000000000)
    
    data.push({
      date: date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
      price: Number(price.toFixed(2)),
      volume,
    })
  }
  
  return data
}

export function IndexChart({
  title,
  symbol,
  currentPrice,
  change,
  changePercent,
}: IndexChartProps) {
  const [timeframe, setTimeframe] = useState('1M')
  
  // 根據時間週期生成數據
  const chartData = useMemo(() => {
    const daysMap: Record<string, number> = {
      '1D': 1,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
    }
    return generateChartData(daysMap[timeframe] || 30)
  }, [timeframe])

  const isPositive = changePercent >= 0

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">{title}</CardTitle>
            <Badge variant="secondary" className="font-mono text-xs">
              {symbol}
            </Badge>
          </div>
          
          {/* 時間週期選擇器 */}
          <Tabs value={timeframe} onValueChange={setTimeframe}>
            <TabsList className="h-8">
              {['1D', '1W', '1M', '3M', '6M', '1Y'].map((tf) => (
                <TabsTrigger key={tf} value={tf} className="text-xs px-2 h-6">
                  {tf}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        {/* 價格資訊 */}
        <div className="flex items-baseline gap-3 mt-2">
          <span className="text-2xl font-bold">{currentPrice.toLocaleString()}</span>
          <div
            className={`flex items-center gap-1 ${
              isPositive ? 'text-chart-1' : 'text-chart-2'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="font-medium">
              {isPositive ? '+' : ''}{change.toFixed(2)}
            </span>
            <span className="text-sm">
              ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        {/* 價格圖表 */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? 'var(--chart-1)' : 'var(--chart-2)'}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? 'var(--chart-1)' : 'var(--chart-2)'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: 12,
                }}
                formatter={(value: number) => [value.toLocaleString(), '價格']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? 'var(--chart-1)' : 'var(--chart-2)'}
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* 成交量圖表 */}
        <div className="h-[60px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
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
                  (value / 1e9).toFixed(2) + 'B',
                  '成交量',
                ]}
              />
              <Bar
                dataKey="volume"
                fill="var(--chart-3)"
                opacity={0.5}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
