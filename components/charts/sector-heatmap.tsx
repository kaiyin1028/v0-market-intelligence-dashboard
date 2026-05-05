'use client'

/**
 * 產業熱力圖元件
 * Sector Heatmap Component
 * 
 * 顯示各產業漲跌幅熱力圖
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LayoutGrid } from 'lucide-react'

interface SectorData {
  sector: string
  change: number
  stocks: number
}

interface SectorHeatmapProps {
  data: SectorData[]
}

export function SectorHeatmap({ data }: SectorHeatmapProps) {
  // 取得顏色類別
  const getColorClass = (change: number) => {
    if (change > 1.5) return 'bg-chart-1 text-white'
    if (change > 0.5) return 'bg-chart-1/70 text-white'
    if (change > 0) return 'bg-chart-1/40 text-foreground'
    if (change > -0.5) return 'bg-chart-2/40 text-foreground'
    if (change > -1.5) return 'bg-chart-2/70 text-white'
    return 'bg-chart-2 text-white'
  }

  // 根據股票數量計算格子大小
  const maxStocks = Math.max(...data.map(d => d.stocks))
  const getSize = (stocks: number) => {
    const ratio = stocks / maxStocks
    if (ratio > 0.7) return 'col-span-2 row-span-2'
    if (ratio > 0.5) return 'col-span-2'
    return ''
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <LayoutGrid className="h-4 w-4 text-primary" />
          產業熱力圖
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid auto-rows-fr grid-cols-4 gap-1.5">
          {data.map((item) => (
            <div
              key={item.sector}
              className={cn(
                'flex flex-col items-center justify-center rounded-lg p-2 transition-all hover:scale-105',
                getColorClass(item.change),
                getSize(item.stocks)
              )}
            >
              <span className="text-xs font-medium">{item.sector}</span>
              <span className="text-sm font-bold">
                {item.change > 0 ? '+' : ''}
                {item.change.toFixed(2)}%
              </span>
              <span className="text-[10px] opacity-80">{item.stocks} 檔</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
