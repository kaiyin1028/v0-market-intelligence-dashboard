'use client'

/**
 * 迷你走勢圖元件
 * Sparkline Component
 * 
 * 顯示簡潔的價格走勢線
 */

import { Line, LineChart, ResponsiveContainer } from 'recharts'

interface SparklineProps {
  /** 數據陣列 */
  data: number[]
  /** 狀態決定顏色 */
  status?: 'bullish' | 'bearish' | 'neutral'
  /** 高度 */
  height?: number
}

export function Sparkline({ data, status = 'neutral', height = 32 }: SparklineProps) {
  // 轉換數據格式
  const chartData = data.map((value, index) => ({
    index,
    value,
  }))

  // 決定線條顏色
  const getStrokeColor = () => {
    switch (status) {
      case 'bullish':
        return 'var(--chart-1)'
      case 'bearish':
        return 'var(--chart-2)'
      default:
        return 'var(--chart-3)'
    }
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={getStrokeColor()}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
