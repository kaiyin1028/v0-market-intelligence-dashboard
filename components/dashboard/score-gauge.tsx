'use client'

/**
 * 評分儀表元件
 * Score Gauge Component
 * 
 * 環形進度條顯示分數
 */

import { cn } from '@/lib/utils'

interface ScoreGaugeProps {
  /** 分數 (0-100) */
  score: number
  /** 標籤 */
  label?: string
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否顯示百分比 */
  showPercent?: boolean
  /** 類型決定顏色 */
  type?: 'default' | 'bullish' | 'bearish' | 'warning' | 'info'
}

export function ScoreGauge({
  score,
  label,
  size = 'md',
  showPercent = true,
  type = 'default',
}: ScoreGaugeProps) {
  // 尺寸配置
  const sizeConfig = {
    sm: { width: 48, strokeWidth: 4, fontSize: 'text-xs' },
    md: { width: 64, strokeWidth: 5, fontSize: 'text-sm' },
    lg: { width: 80, strokeWidth: 6, fontSize: 'text-base' },
  }

  const { width, strokeWidth, fontSize } = sizeConfig[size]
  const radius = (width - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const offset = circumference - progress

  // 顏色配置
  const getStrokeColor = () => {
    switch (type) {
      case 'bullish':
        return 'stroke-chart-1'
      case 'bearish':
        return 'stroke-chart-2'
      case 'warning':
        return 'stroke-chart-4'
      case 'info':
        return 'stroke-chart-3'
      default:
        // 根據分數決定顏色
        if (score >= 70) return 'stroke-chart-1'
        if (score >= 40) return 'stroke-chart-4'
        return 'stroke-chart-2'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'bullish':
        return 'text-chart-1'
      case 'bearish':
        return 'text-chart-2'
      case 'warning':
        return 'text-chart-4'
      case 'info':
        return 'text-chart-3'
      default:
        if (score >= 70) return 'text-chart-1'
        if (score >= 40) return 'text-chart-4'
        return 'text-chart-2'
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height: width }}>
        {/* 背景圓環 */}
        <svg
          className="absolute inset-0 -rotate-90"
          width={width}
          height={width}
        >
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />
          {/* 進度圓環 */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn('transition-all duration-500', getStrokeColor())}
          />
        </svg>
        
        {/* 中間文字 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-bold', fontSize, getTextColor())}>
            {score}
            {showPercent && <span className="text-[0.7em]">%</span>}
          </span>
        </div>
      </div>
      
      {/* 標籤 */}
      {label && (
        <p className={cn('mt-1.5 text-center text-muted-foreground', 
          size === 'sm' ? 'text-[10px]' : 'text-xs'
        )}>
          {label}
        </p>
      )}
    </div>
  )
}
