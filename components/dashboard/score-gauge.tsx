'use client'

/**
 * 評分儀表元件
 * 環形進度條顯示分數
 * 明亮清爽專業風格設計
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
    sm: { width: 52, strokeWidth: 4, fontSize: 'text-xs', labelSize: 'text-[9px]' },
    md: { width: 68, strokeWidth: 5, fontSize: 'text-sm', labelSize: 'text-[10px]' },
    lg: { width: 88, strokeWidth: 6, fontSize: 'text-base', labelSize: 'text-xs' },
  }

  const { width, strokeWidth, fontSize, labelSize } = sizeConfig[size]
  const radius = (width - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const offset = circumference - progress

  // 顏色配置
  const getColors = () => {
    switch (type) {
      case 'bullish':
        return { 
          stroke: 'stroke-success', 
          text: 'text-success',
          bg: 'text-success/10',
          glow: 'drop-shadow-[0_0_4px_hsl(var(--success)/0.3)]',
        }
      case 'bearish':
        return { 
          stroke: 'stroke-danger', 
          text: 'text-danger',
          bg: 'text-danger/10',
          glow: 'drop-shadow-[0_0_4px_hsl(var(--danger)/0.3)]',
        }
      case 'warning':
        return { 
          stroke: 'stroke-warning', 
          text: 'text-warning',
          bg: 'text-warning/10',
          glow: 'drop-shadow-[0_0_4px_hsl(var(--warning)/0.3)]',
        }
      case 'info':
        return { 
          stroke: 'stroke-accent', 
          text: 'text-accent',
          bg: 'text-accent/10',
          glow: 'drop-shadow-[0_0_4px_hsl(var(--accent)/0.3)]',
        }
      default:
        // 根據分數決定顏色
        if (score >= 70) return { 
          stroke: 'stroke-success', 
          text: 'text-success',
          bg: 'text-success/10',
          glow: 'drop-shadow-[0_0_4px_hsl(var(--success)/0.3)]',
        }
        if (score >= 40) return { 
          stroke: 'stroke-warning', 
          text: 'text-warning',
          bg: 'text-warning/10',
          glow: 'drop-shadow-[0_0_4px_hsl(var(--warning)/0.3)]',
        }
        return { 
          stroke: 'stroke-danger', 
          text: 'text-danger',
          bg: 'text-danger/10',
          glow: 'drop-shadow-[0_0_4px_hsl(var(--danger)/0.3)]',
        }
    }
  }

  const colors = getColors()

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height: width }}>
        {/* 背景發光效果 */}
        <div 
          className={cn(
            'absolute inset-0 rounded-full blur-md opacity-20',
            colors.bg
          )} 
        />
        
        {/* 背景圓環 */}
        <svg
          className="absolute inset-0 -rotate-90"
          width={width}
          height={width}
        >
          {/* 背景軌道 */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/20"
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
            className={cn(
              'transition-all duration-700 ease-out',
              colors.stroke,
              colors.glow
            )}
          />
        </svg>
        
        {/* 中間文字 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-bold tracking-tight', fontSize, colors.text)}>
            {score}
            {showPercent && <span className="text-[0.65em] opacity-70">%</span>}
          </span>
        </div>
      </div>
      
      {/* 標籤 */}
      {label && (
        <p className={cn(
          'mt-1.5 text-center text-muted-foreground font-medium', 
          labelSize
        )}>
          {label}
        </p>
      )}
    </div>
  )
}
