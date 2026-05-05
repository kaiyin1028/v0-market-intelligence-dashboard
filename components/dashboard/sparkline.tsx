'use client'

/**
 * 迷你走勢圖元件
 * 顯示簡潔的價格走勢線
 * 明亮清爽專業風格設計
 */

import { Line, LineChart, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface SparklineProps {
  /** 數據陣列 */
  data: number[]
  /** 狀態決定顏色 */
  status?: 'bullish' | 'bearish' | 'neutral'
  /** 高度 */
  height?: number
  /** 是否顯示面積填充 */
  showArea?: boolean
}

export function Sparkline({ 
  data, 
  status = 'neutral', 
  height = 40,
  showArea = true,
}: SparklineProps) {
  // 轉換數據格式
  const chartData = data.map((value, index) => ({
    index,
    value,
  }))

  // 決定顏色配置
  const getColors = () => {
    switch (status) {
      case 'bullish':
        return {
          stroke: 'hsl(var(--success))',
          fill: 'hsl(var(--success))',
        }
      case 'bearish':
        return {
          stroke: 'hsl(var(--danger))',
          fill: 'hsl(var(--danger))',
        }
      default:
        return {
          stroke: 'hsl(var(--primary))',
          fill: 'hsl(var(--primary))',
        }
    }
  }

  const colors = getColors()
  const gradientId = `sparkline-gradient-${status}-${Math.random().toString(36).substr(2, 9)}`

  if (showArea) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.fill} stopOpacity={0.2} />
              <stop offset="100%" stopColor={colors.fill} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={colors.stroke}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={colors.stroke}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
