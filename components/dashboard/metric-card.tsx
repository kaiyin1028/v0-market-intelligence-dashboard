'use client'

/**
 * 指標卡片元件
 * 顯示市場指標、價格變化與迷你走勢圖
 * 明亮清爽專業風格設計，增加AIGC裝飾元素
 */

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, Sparkles, type LucideIcon } from 'lucide-react'
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
  /** 卡片索引，用於漸變裝飾 */
  index?: number
}

/** 裝飾圖案配置 */
const decorativePatterns = [
  { cx: 85, cy: 15, r: 8 },
  { cx: 90, cy: 20, r: 6 },
  { cx: 80, cy: 25, r: 10 },
  { cx: 88, cy: 12, r: 5 },
]

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
  index = 0,
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
      return 'text-success'
    }
    if (status === 'bearish' || (changePercent && changePercent < 0)) {
      return 'text-danger'
    }
    return 'text-muted-foreground'
  }

  // 決定趨勢背景
  const getTrendBg = () => {
    if (status === 'bullish' || (changePercent && changePercent > 0)) {
      return 'bg-success/10'
    }
    if (status === 'bearish' || (changePercent && changePercent < 0)) {
      return 'bg-danger/10'
    }
    return 'bg-muted/30'
  }

  // 決定趨勢圖示
  const TrendIcon = () => {
    if (status === 'bullish' || (changePercent && changePercent > 0)) {
      return <TrendingUp className="h-3.5 w-3.5" />
    }
    if (status === 'bearish' || (changePercent && changePercent < 0)) {
      return <TrendingDown className="h-3.5 w-3.5" />
    }
    return <Minus className="h-3.5 w-3.5" />
  }

  // 選擇裝飾圖案
  const pattern = decorativePatterns[index % decorativePatterns.length]

  return (
    <Card className="group relative overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:border-primary/30">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/[0.02] pointer-events-none" />
      
      {/* AIGC 裝飾圖案 */}
      <svg className="absolute top-0 right-0 w-24 h-24 opacity-[0.04] pointer-events-none" viewBox="0 0 100 100">
        <circle cx={pattern.cx} cy={pattern.cy} r={pattern.r} fill="hsl(var(--primary))" />
        <circle cx={pattern.cx - 15} cy={pattern.cy + 10} r={pattern.r * 0.6} fill="hsl(var(--accent))" />
        <path 
          d={`M${pattern.cx - 20},${pattern.cy} Q${pattern.cx},${pattern.cy - 15} ${pattern.cx + 10},${pattern.cy + 5}`}
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          fill="none"
        />
      </svg>
      
      <CardContent className="relative p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
                status === 'bullish' && 'bg-success/15 text-success',
                status === 'bearish' && 'bg-danger/15 text-danger',
                status === 'neutral' && 'bg-primary/10 text-primary'
              )}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-muted-foreground">{title}</p>
              {badge && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'mt-1 text-[10px] font-semibold rounded-full px-2',
                    status === 'bullish' && 'bg-success/10 text-success border-success/20',
                    status === 'bearish' && 'bg-danger/10 text-danger border-danger/20',
                    status === 'neutral' && 'bg-muted/50 text-muted-foreground'
                  )}
                >
                  {badge}
                </Badge>
              )}
            </div>
          </div>
          
          {/* 走勢圖 */}
          {sparklineData && sparklineData.length > 0 && (
            <div className="h-10 w-24">
              <Sparkline data={sparklineData} status={status} />
            </div>
          )}
        </div>

        {/* 數值區域 */}
        <div className="mt-4">
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {formatValue(value)}
          </p>
          
          {/* 變化值 */}
          {(change !== undefined || changePercent !== undefined) && (
            <div className={cn(
              'mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg',
              getTrendBg(),
              getTrendColor()
            )}>
              <TrendIcon />
              {change !== undefined && (
                <span className="text-sm font-semibold">
                  {formatChange(change)}
                </span>
              )}
              {changePercent !== undefined && (
                <span className="text-sm font-medium">
                  ({formatChange(changePercent)}%)
                </span>
              )}
            </div>
          )}
        </div>

        {/* 懸停時顯示的 AI 徽章 */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-accent/10 border border-accent/20">
            <Sparkles className="h-2.5 w-2.5 text-accent" />
            <span className="text-[9px] font-medium text-accent">AI</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
