'use client'

/**
 * 風險徽章元件
 * Risk Badge Component
 * 
 * 顯示假突破風險等級
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AlertTriangle, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

interface RiskBadgeProps {
  /** 風險值 (0-100) */
  risk: number
  /** 是否顯示數值 */
  showValue?: boolean
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
}

/** 取得風險等級配置 */
const getRiskConfig = (risk: number) => {
  if (risk <= 25) {
    return {
      level: '低',
      className: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
      icon: CheckCircle,
    }
  }
  if (risk <= 50) {
    return {
      level: '中低',
      className: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
      icon: AlertCircle,
    }
  }
  if (risk <= 75) {
    return {
      level: '中高',
      className: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
      icon: AlertTriangle,
    }
  }
  return {
    level: '高',
    className: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    icon: XCircle,
  }
}

export function RiskBadge({ risk, showValue = false, size = 'md' }: RiskBadgeProps) {
  const config = getRiskConfig(risk)
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
  }

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', config.className, sizeClasses[size])}
    >
      <Icon
        className={cn(
          'mr-1',
          size === 'sm' && 'h-3 w-3',
          size === 'md' && 'h-3.5 w-3.5',
          size === 'lg' && 'h-4 w-4'
        )}
      />
      {config.level}
      {showValue && <span className="ml-1">({risk}%)</span>}
    </Badge>
  )
}
