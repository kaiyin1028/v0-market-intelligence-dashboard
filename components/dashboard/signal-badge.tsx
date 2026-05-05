'use client'

/**
 * 訊號徽章元件
 * 顯示買賣訊號類型
 * 明亮清爽專業風格設計
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SignalType } from '@/types'
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Minus,
  ArrowDownRight,
  ArrowUpRight,
  Zap,
  AlertTriangle,
  BarChart3,
  Activity,
} from 'lucide-react'

interface SignalBadgeProps {
  /** 訊號類型 */
  signal: SignalType
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否顯示圖示 */
  showIcon?: boolean
}

/** 訊號配置 */
const signalConfig: Record<
  SignalType,
  {
    label: string
    className: string
    icon: typeof TrendingUp
  }
> = {
  'strong-buy': {
    label: '強力買入',
    className: 'bg-success/15 text-success border-success/25 shadow-success/10',
    icon: ArrowUpRight,
  },
  buy: {
    label: '買入',
    className: 'bg-success/10 text-success border-success/20',
    icon: TrendingUp,
  },
  watch: {
    label: '觀察',
    className: 'bg-primary/10 text-primary border-primary/20',
    icon: Eye,
  },
  hold: {
    label: '持有',
    className: 'bg-warning/10 text-warning border-warning/20',
    icon: Activity,
  },
  reduce: {
    label: '減碼',
    className: 'bg-warning/15 text-warning border-warning/25',
    icon: Minus,
  },
  sell: {
    label: '賣出',
    className: 'bg-danger/10 text-danger border-danger/20',
    icon: TrendingDown,
  },
  short: {
    label: '做空',
    className: 'bg-danger/15 text-danger border-danger/25 shadow-danger/10',
    icon: ArrowDownRight,
  },
  breakout: {
    label: '突破',
    className: 'bg-accent/15 text-accent border-accent/25 shadow-accent/10',
    icon: Zap,
  },
  false_breakout: {
    label: '假突破',
    className: 'bg-danger/15 text-danger border-danger/25',
    icon: AlertTriangle,
  },
  accumulation: {
    label: '吸籌',
    className: 'bg-success/10 text-success border-success/20',
    icon: BarChart3,
  },
  distribution: {
    label: '派發',
    className: 'bg-danger/10 text-danger border-danger/20',
    icon: BarChart3,
  },
}

/** AI 訊號徽章屬性 */
interface AISignalBadgeProps {
  /** 訊號類型 */
  signal: SignalType
  /** AI 信心度 (0-100) */
  confidence: number
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
}

/** AI 訊號徽章 - 顯示 AI 信心度 */
export function AISignalBadge({ signal, confidence, size = 'md' }: AISignalBadgeProps) {
  const config = signalConfig[signal] || {
    label: signal,
    className: 'bg-muted/50 text-muted-foreground border-border',
    icon: Activity,
  }
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-1 gap-1.5',
    md: 'text-xs px-2.5 py-1.5 gap-2',
    lg: 'text-sm px-3 py-2 gap-2',
  }

  return (
    <div className={cn(
      'inline-flex items-center rounded-xl border font-semibold transition-all',
      config.className,
      sizeClasses[size]
    )}>
      <Icon className={cn(
        size === 'sm' && 'h-3 w-3',
        size === 'md' && 'h-3.5 w-3.5',
        size === 'lg' && 'h-4 w-4'
      )} />
      <span>{config.label}</span>
      <span className="ml-1 rounded-md bg-background/50 px-1.5 py-0.5 text-[10px] font-bold">
        {confidence}%
      </span>
    </div>
  )
}

export function SignalBadge({ signal, size = 'md', showIcon = true }: SignalBadgeProps) {
  const config = signalConfig[signal] || {
    label: signal,
    className: 'bg-muted/50 text-muted-foreground border-border',
    icon: Activity,
  }
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
    lg: 'text-sm px-2.5 py-1 gap-1.5',
  }

  const iconSizes = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5',
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center font-semibold rounded-full transition-all duration-200',
        'hover:shadow-sm',
        config.className,
        sizeClasses[size]
      )}
    >
      {showIcon && (
        <Icon className={iconSizes[size]} />
      )}
      {config.label}
    </Badge>
  )
}
