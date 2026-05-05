'use client'

/**
 * 主指數圖表元件
 * 顯示價格走勢與成交量
 * 明亮清爽專業風格設計
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
import { 
  TrendingUp, 
  TrendingDown, 
  LineChart as LineChartIcon, 
  BarChart3,
  Sparkles,
  Activity,
  Clock,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

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

/** 生成模擬圖表數據 */
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
    <Card className="relative overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] pointer-events-none" />
      
      {/* AIGC 裝飾圖案 */}
      <svg className="absolute top-0 right-0 w-48 h-48 opacity-[0.03] pointer-events-none" viewBox="0 0 200 200">
        <circle cx="150" cy="50" r="30" fill="hsl(var(--primary))" />
        <circle cx="170" cy="80" r="20" fill="hsl(var(--accent))" />
        <path d="M100,30 Q130,50 160,40" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" />
        <path d="M120,70 Q150,90 180,80" stroke="hsl(var(--accent))" strokeWidth="2" fill="none" />
      </svg>
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <LineChartIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="secondary" className="font-mono text-[10px] bg-muted/50 rounded-full">
                  {symbol}
                </Badge>
                <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20 rounded-full">
                  <Activity className="mr-1 h-2.5 w-2.5" />
                  即時
                </Badge>
              </div>
            </div>
          </div>
          
          {/* 時間週期選擇器 */}
          <Tabs value={timeframe} onValueChange={setTimeframe}>
            <TabsList className="h-8 bg-muted/30 p-1 rounded-lg">
              {['1D', '1W', '1M', '3M', '6M', '1Y'].map((tf) => (
                <TabsTrigger 
                  key={tf} 
                  value={tf} 
                  className="text-xs px-2.5 h-6 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  {tf}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        {/* 價格資訊 */}
        <div className="flex items-center gap-4 mt-3">
          <span className="text-3xl font-bold tracking-tight">{currentPrice.toLocaleString()}</span>
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg',
              isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="font-semibold">
              {isPositive ? '+' : ''}{change.toFixed(2)}
            </span>
            <span className="text-sm font-medium">
              ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
          </div>
          
          {/* AI 分析徽章 */}
          <div className="ml-auto hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/10 border border-accent/20">
            <Sparkles className="h-3 w-3 text-accent" />
            <span className="text-[10px] font-medium text-accent">AI 分析中</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative pb-4">
        {/* 價格圖表 */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? 'hsl(var(--success))' : 'hsl(var(--danger))'}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? 'hsl(var(--success))' : 'hsl(var(--danger))'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number) => [value.toLocaleString(), '價格']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? 'hsl(var(--success))' : 'hsl(var(--danger))'}
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* 成交量標題 */}
        <div className="flex items-center gap-2 mt-4 mb-2">
          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">成交量</span>
        </div>
        
        {/* 成交量圖表 */}
        <div className="h-[60px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number) => [
                  (value / 1e9).toFixed(2) + 'B',
                  '成交量',
                ]}
              />
              <Bar
                dataKey="volume"
                fill="hsl(var(--primary))"
                opacity={0.3}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* 底部資訊 */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border/30">
          <div className="flex items-center gap-1.5 text-muted-foreground/50">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[10px]">最後更新：即時</span>
          </div>
          <div className="w-px h-3 bg-border/50" />
          <div className="flex items-center gap-1.5 text-muted-foreground/50">
            <Activity className="h-3.5 w-3.5" />
            <span className="text-[10px]">數據延遲：0ms</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
