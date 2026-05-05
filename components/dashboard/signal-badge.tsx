'use client'

/**
 * 訊號徽章元件
 * Signal Badge Component
 * 
 * 顯示買賣訊號類型
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
    className: 'bg-chart-1/20 text-chart-1 border-chart-1/30',
    icon: ArrowUpRight,
  },
  buy: {
    label: '買入',
    className: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
    icon: TrendingUp,
  },
  watch: {
    label: '觀察',
    className: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
    icon: Eye,
  },
  reduce: {
    label: '減碼',
    className: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
    icon: Minus,
  },
  sell: {
    label: '賣出',
    className: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    icon: TrendingDown,
  },
  short: {
    label: '做空',
    className: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
    icon: ArrowDownRight,
  },
}

export function SignalBadge({ signal, size = 'md', showIcon = true }: SignalBadgeProps) {
  const config = signalConfig[signal]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium',
        config.className,
        sizeClasses[size]
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            'mr-1',
            size === 'sm' && 'h-3 w-3',
            size === 'md' && 'h-3.5 w-3.5',
            size === 'lg' && 'h-4 w-4'
          )}
        />
      )}
      {config.label}
    </Badge>
  )
}
