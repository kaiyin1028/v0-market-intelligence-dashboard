'use client'

/**
 * 產業熱力圖元件
 * 顯示各產業漲跌幅熱力圖
 * 明亮清爽專業風格設計
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LayoutGrid, TrendingUp, TrendingDown, Sparkles, BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
    if (change > 1.5) return 'bg-success text-white shadow-success/20'
    if (change > 0.5) return 'bg-success/70 text-white'
    if (change > 0) return 'bg-success/20 text-success border border-success/30'
    if (change > -0.5) return 'bg-danger/20 text-danger border border-danger/30'
    if (change > -1.5) return 'bg-danger/70 text-white'
    return 'bg-danger text-white shadow-danger/20'
  }

  // 根據股票數量計算格子大小
  const maxStocks = Math.max(...data.map(d => d.stocks))
  const getSize = (stocks: number) => {
    const ratio = stocks / maxStocks
    if (ratio > 0.7) return 'col-span-2 row-span-2'
    if (ratio > 0.5) return 'col-span-2'
    return ''
  }

  // 計算市場整體狀況
  const avgChange = data.reduce((sum, d) => sum + d.change, 0) / data.length
  const bullishCount = data.filter(d => d.change > 0).length
  const bearishCount = data.filter(d => d.change < 0).length

  return (
    <Card className="relative overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] pointer-events-none" />
      
      <CardHeader className="relative pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <LayoutGrid className="h-4 w-4 text-primary" />
            </div>
            產業熱力圖
          </CardTitle>
          
          {/* 市場摘要 */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20 rounded-full">
              <TrendingUp className="mr-1 h-2.5 w-2.5" />
              {bullishCount} 漲
            </Badge>
            <Badge variant="outline" className="text-[10px] bg-danger/10 text-danger border-danger/20 rounded-full">
              <TrendingDown className="mr-1 h-2.5 w-2.5" />
              {bearishCount} 跌
            </Badge>
          </div>
        </div>
        
        {/* 平均漲跌幅 */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">市場均值：</span>
          <span className={cn(
            'text-sm font-semibold',
            avgChange >= 0 ? 'text-success' : 'text-danger'
          )}>
            {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="grid auto-rows-fr grid-cols-4 gap-2">
          {data.map((item, index) => (
            <div
              key={item.sector}
              className={cn(
                'group relative flex flex-col items-center justify-center rounded-xl p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer',
                getColorClass(item.change),
                getSize(item.stocks)
              )}
            >
              {/* 懸停時的裝飾 */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Sparkles className="h-3 w-3" />
              </div>
              
              <span className="text-xs font-medium">{item.sector}</span>
              <span className="text-base font-bold mt-0.5">
                {item.change > 0 ? '+' : ''}
                {item.change.toFixed(2)}%
              </span>
              <span className="text-[10px] opacity-70 mt-0.5 flex items-center gap-1">
                <BarChart3 className="h-2.5 w-2.5" />
                {item.stocks} 檔
              </span>
            </div>
          ))}
        </div>
        
        {/* 圖例 */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border/30">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-success" />
            <span className="text-[10px] text-muted-foreground">強勢 {'>'}1.5%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-success/50" />
            <span className="text-[10px] text-muted-foreground">溫和上漲</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-danger/50" />
            <span className="text-[10px] text-muted-foreground">溫和下跌</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-danger" />
            <span className="text-[10px] text-muted-foreground">弱勢 {'<'}-1.5%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
