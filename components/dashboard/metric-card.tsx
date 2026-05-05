'use client'

/**
 * 指標卡片元件
 * Metric Card Component
 * 
 * 顯示市場指標、價格變化與迷你走勢圖
 */

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react'
import { Sparkline } from './sparkline'

interface MetricCardProps {
  /** 標題 */
  title: string
  /** 數值 */
  value: string | number
  /** 變化值 */
  change?: number
  /** 變化百分比 */
  changePercent?: number
  /** 走勢圖數據 */
  sparklineData?: number[]
  /** 狀態 */
  status?: 'bullish' | 'bearish' | 'neutral'
  /** 圖示 */
  icon?: LucideIcon
  /** 徽章文字 */
  badge?: string
  /** 是否為貨幣格式 */
  isCurrency?: boolean
  /** 是否為百分比格式 */
  isPercent?: boolean
}

export function MetricCard({
  title,
  value,
  change,
  changePercent,
  sparklineData,
  status = 'neutral',
  icon: Icon,
  badge,
  isCurrency = false,
  isPercent = false,
}: MetricCardProps) {
  // 格式化數值
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val
    if (isCurrency) {
      return val.toLocaleString('zh-TW', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }
    if (isPercent) {
      return `${val.toFixed(2)}%`
    }
    return val.toLocaleString('zh-TW', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // 格式化變化值
  const formatChange = (val: number) => {
    const sign = val >= 0 ? '+' : ''
    return `${sign}${val.toFixed(2)}`
  }

  // 決定趨勢顏色
  const getTrendColor = () => {
    if (status === 'bullish' || (changePercent && changePercent > 0)) {
      return 'text-chart-1'
    }
    if (status === 'bearish' || (changePercent && changePercent < 0)) {
      return 'text-chart-2'
    }
    return 'text-muted-foreground'
  }

  // 決定趨勢圖示
  const TrendIcon = () => {
    if (status === 'bullish' || (changePercent && changePercent > 0)) {
      return <TrendingUp className="h-4 w-4" />
    }
    if (status === 'bearish' || (changePercent && changePercent < 0)) {
      return <TrendingDown className="h-4 w-4" />
    }
    return <Minus className="h-4 w-4" />
  }

  return (
    <Card className="glass-card overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-muted-foreground">{title}</p>
              {badge && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'mt-0.5 text-[10px]',
                    status === 'bullish' && 'bg-chart-1/10 text-chart-1',
                    status === 'bearish' && 'bg-chart-2/10 text-chart-2'
                  )}
                >
                  {badge}
                </Badge>
              )}
            </div>
          </div>
          
          {/* 走勢圖 */}
          {sparklineData && sparklineData.length > 0 && (
            <div className="h-8 w-20">
              <Sparkline data={sparklineData} status={status} />
            </div>
          )}
        </div>

        {/* 數值區域 */}
        <div className="mt-3">
          <p className="text-2xl font-bold tracking-tight">
            {formatValue(value)}
          </p>
          
          {/* 變化值 */}
          {(change !== undefined || changePercent !== undefined) && (
            <div className={cn('mt-1 flex items-center gap-1.5', getTrendColor())}>
              <TrendIcon />
              {change !== undefined && (
                <span className="text-sm font-medium">
                  {formatChange(change)}
                </span>
              )}
              {changePercent !== undefined && (
                <span className="text-sm">
                  ({formatChange(changePercent)}%)
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
