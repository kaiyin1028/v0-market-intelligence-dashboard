'use client'

/**
 * 產業熱力圖元件
 * 顯示各產業漲跌幅熱力圖
 * 修復：確保所有產業區塊都能正確顯示
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  LayoutGrid, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  BarChart3,
  Cpu,
  Building2,
  Heart,
  ShoppingBag,
  Factory,
  Fuel,
  Gem,
  Zap,
  Home,
  Wifi,
  ShoppingCart,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SectorData {
  sector: string
  change: number
  stocks: number
}

interface SectorHeatmapProps {
  data: SectorData[]
}

/** 產業圖示對應 */
const sectorIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  '科技': Cpu,
  '金融': Building2,
  '醫療保健': Heart,
  '消費非必需品': ShoppingBag,
  '工業': Factory,
  '能源': Fuel,
  '原物料': Gem,
  '公用事業': Zap,
  '房地產': Home,
  '通訊服務': Wifi,
  '消費必需品': ShoppingCart,
}

export function SectorHeatmap({ data }: SectorHeatmapProps) {
  // 取得顏色類別 - 使用更明確的顏色漸層
  const getColorClass = (change: number) => {
    if (change > 1.5) return 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
    if (change > 0.5) return 'bg-gradient-to-br from-emerald-400/90 to-emerald-500/90 text-white'
    if (change > 0) return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
    if (change > -0.5) return 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
    if (change > -1.5) return 'bg-gradient-to-br from-rose-400/90 to-rose-500/90 text-white'
    return 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25'
  }

  // 取得圖示
  const getIcon = (sector: string) => {
    return sectorIcons[sector] || BarChart3
  }

  // 計算市場整體狀況
  const avgChange = data.reduce((sum, d) => sum + d.change, 0) / data.length
  const bullishCount = data.filter(d => d.change > 0).length
  const bearishCount = data.filter(d => d.change < 0).length

  // 按漲跌幅排序 - 最佳表現在前
  const sortedData = [...data].sort((a, b) => b.change - a.change)

  return (
    <Card className="relative overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] pointer-events-none" />
      
      <CardHeader className="relative pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
              <LayoutGrid className="h-4 w-4 text-primary" />
            </div>
            <span>產業熱力圖</span>
          </CardTitle>
          
          {/* 市場摘要 */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 rounded-full px-2 py-0.5">
              <TrendingUp className="mr-1 h-2.5 w-2.5" />
              {bullishCount} 漲
            </Badge>
            <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 rounded-full px-2 py-0.5">
              <TrendingDown className="mr-1 h-2.5 w-2.5" />
              {bearishCount} 跌
            </Badge>
          </div>
        </div>
        
        {/* 平均漲跌幅 */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">市場均值：</span>
          <span className={cn(
            'text-sm font-bold',
            avgChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          )}>
            {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        {/* 使用固定的網格佈局確保所有項目都顯示 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2">
          {sortedData.map((item) => {
            const Icon = getIcon(item.sector)
            return (
              <div
                key={item.sector}
                className={cn(
                  'group relative flex flex-col items-center justify-center rounded-xl p-3 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg cursor-pointer min-h-[90px]',
                  getColorClass(item.change)
                )}
              >
                {/* 懸停時的裝飾 */}
                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="h-3 w-3" />
                </div>
                
                {/* 圖示 */}
                <div className="mb-1 opacity-80">
                  <Icon className="h-4 w-4" />
                </div>
                
                {/* 產業名稱 */}
                <span className="text-[11px] font-medium text-center leading-tight line-clamp-1">{item.sector}</span>
                
                {/* 漲跌幅 */}
                <span className="text-base font-bold mt-0.5">
                  {item.change > 0 ? '+' : ''}
                  {item.change.toFixed(2)}%
                </span>
                
                {/* 股票數量 */}
                <span className="text-[9px] opacity-70 mt-0.5 flex items-center gap-0.5">
                  <BarChart3 className="h-2.5 w-2.5" />
                  {item.stocks} 檔
                </span>
              </div>
            )
          })}
        </div>
        
        {/* 圖例 */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 pt-3 border-t border-border/30 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-br from-emerald-500 to-emerald-600" />
            <span className="text-[10px] text-muted-foreground">強勢 {'>'}1.5%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-400/80" />
            <span className="text-[10px] text-muted-foreground">溫和上漲</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-rose-400/80" />
            <span className="text-[10px] text-muted-foreground">溫和下跌</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-br from-rose-500 to-rose-600" />
            <span className="text-[10px] text-muted-foreground">弱勢 {'<'}-1.5%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
