'use client'

/**
 * 進階量價分布圖元件
 * Advanced Volume Profile Chart Component
 * 
 * 專業級量價分布圖，包含：
 * - 水平成交量條與價格對齊
 * - POC、VAH、VAL 高亮
 * - 色彩強度表示籌碼集中度
 * - HVN 與 LVN 標籤
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Layers,
  Target,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Zap,
  Shield,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react'
import type { VolumeProfile, ChipDistribution } from '@/types'

interface AdvancedVolumeProfileProps {
  /** 量價分布數據 */
  data: VolumeProfile[]
  /** 籌碼分布數據 */
  chipData: ChipDistribution
  /** 當前價格 */
  currentPrice: number
  /** 股票代號 */
  ticker?: string
}

export function AdvancedVolumeProfile({
  data,
  chipData,
  currentPrice,
  ticker = 'AAPL',
}: AdvancedVolumeProfileProps) {
  // 找出最大成交量用於計算比例
  const maxVolume = Math.max(...data.map((d) => d.volume))

  // 判斷價格相對於POC位置
  const priceVsPoc = currentPrice > chipData.poc ? '價格在POC上方' : '價格在POC下方'
  const isPriceAbovePoc = currentPrice > chipData.poc
  const priceDiffPercent = ((currentPrice - chipData.poc) / chipData.poc * 100).toFixed(2)

  // 計算籌碼集中度等級
  const getConcentrationLevel = (volume: number): 'high' | 'medium' | 'low' => {
    const ratio = volume / maxVolume
    if (ratio > 0.7) return 'high'
    if (ratio > 0.4) return 'medium'
    return 'low'
  }

  // 獲取籌碼狀態描述
  const getChipStatus = () => {
    if (chipData.chipPressure <= 30) {
      return { status: '健康', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: TrendingUp }
    }
    if (chipData.chipPressure <= 60) {
      return { status: '中性', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Minus }
    }
    return { status: '壓力', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: TrendingDown }
  }

  const chipStatus = getChipStatus()
  const ChipIcon = chipStatus.icon

  return (
    <Card className="glass-card overflow-hidden border-border/30">
      {/* 頂部裝飾線 */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-chart-5/50 to-transparent" />
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-chart-5/20 to-chart-5/5 ring-1 ring-chart-5/20">
              <Layers className="h-5 w-5 text-chart-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight">
                量價分布分析
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {ticker} · 籌碼結構與成本分析
              </p>
            </div>
          </div>
          
          {/* 籌碼狀態指示 */}
          <Badge
            variant="outline"
            className={cn(
              'gap-1.5 px-3 py-1.5',
              chipStatus.bg,
              chipStatus.color,
              'border-current/30'
            )}
          >
            <ChipIcon className="h-3.5 w-3.5" />
            籌碼{chipStatus.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 關鍵價位卡片 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-500/10 to-rose-500/5 p-4 ring-1 ring-rose-500/20 transition-all hover:ring-rose-500/40">
            <div className="absolute right-2 top-2 opacity-20 transition-opacity group-hover:opacity-40">
              <ArrowUp className="h-8 w-8 text-rose-500" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">價值區上緣</div>
              <div className="text-xs text-rose-500/80">VAH</div>
            </div>
            <div className="mt-2 text-2xl font-bold text-rose-500">
              ${chipData.vah.toFixed(2)}
            </div>
          </div>
          
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-chart-5/10 to-chart-5/5 p-4 ring-1 ring-chart-5/20 transition-all hover:ring-chart-5/40">
            <div className="absolute right-2 top-2 opacity-20 transition-opacity group-hover:opacity-40">
              <Target className="h-8 w-8 text-chart-5" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">成本密集區</div>
              <div className="text-xs text-chart-5/80">POC</div>
            </div>
            <div className="mt-2 text-2xl font-bold text-chart-5">
              ${chipData.poc.toFixed(2)}
            </div>
          </div>
          
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-4 ring-1 ring-emerald-500/20 transition-all hover:ring-emerald-500/40">
            <div className="absolute right-2 top-2 opacity-20 transition-opacity group-hover:opacity-40">
              <ArrowDown className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">價值區下緣</div>
              <div className="text-xs text-emerald-500/80">VAL</div>
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-500">
              ${chipData.val.toFixed(2)}
            </div>
          </div>
        </div>

        {/* 當前價格位置 */}
        <div className="rounded-xl bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                isPriceAbovePoc ? "bg-emerald-500/20" : "bg-rose-500/20"
              )}>
                {isPriceAbovePoc ? (
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-rose-500" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium">當前價格位置</div>
                <div className="text-xs text-muted-foreground">{priceVsPoc}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">${currentPrice.toFixed(2)}</div>
              <div className={cn(
                "text-sm font-medium",
                isPriceAbovePoc ? "text-emerald-500" : "text-rose-500"
              )}>
                {isPriceAbovePoc ? '+' : ''}{priceDiffPercent}% vs POC
              </div>
            </div>
          </div>
        </div>

        {/* 水平量價分布圖 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="h-4 w-4 text-chart-5" />
              水平成交量分布
            </h4>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-emerald-500/80" />
                <span className="text-muted-foreground">買入量</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-rose-500/80" />
                <span className="text-muted-foreground">賣出量</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-0.5 rounded-xl bg-muted/10 p-3">
            {data.slice().reverse().map((item, index) => {
              const volumePercent = (item.volume / maxVolume) * 100
              const buyPercent = (item.buyVolume / item.volume) * 100
              const isPoc = Math.abs(item.priceLevel - chipData.poc) < 1
              const isCurrentPrice = Math.abs(item.priceLevel - currentPrice) < 1
              const isHvn = chipData.hvn.some((h) => Math.abs(item.priceLevel - h) < 1)
              const isLvn = chipData.lvn.some((l) => Math.abs(item.priceLevel - l) < 1)
              const concentrationLevel = getConcentrationLevel(item.volume)

              return (
                <div
                  key={index}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-1.5 transition-all',
                    isPoc && 'bg-chart-5/15 ring-1 ring-chart-5/30',
                    isCurrentPrice && !isPoc && 'bg-primary/10 ring-1 ring-primary/30',
                    isHvn && !isPoc && !isCurrentPrice && 'bg-amber-500/5',
                    isLvn && 'bg-muted/30',
                    !isPoc && !isCurrentPrice && !isHvn && !isLvn && 'hover:bg-muted/20'
                  )}
                >
                  {/* 價格標籤 */}
                  <div className="w-20 flex-shrink-0">
                    <span
                      className={cn(
                        'font-mono text-sm',
                        isPoc && 'font-bold text-chart-5',
                        isCurrentPrice && !isPoc && 'font-bold text-primary',
                        !isPoc && !isCurrentPrice && 'text-muted-foreground'
                      )}
                    >
                      ${item.priceLevel.toFixed(2)}
                    </span>
                    {isCurrentPrice && (
                      <div className="mt-0.5 text-[10px] text-primary">● 現價</div>
                    )}
                  </div>

                  {/* 成交量條 */}
                  <div className="relative flex-1">
                    <div className="flex h-6 overflow-hidden rounded-md bg-muted/30">
                      {/* 買入量 */}
                      <div
                        className={cn(
                          'relative transition-all',
                          concentrationLevel === 'high' && 'bg-emerald-500',
                          concentrationLevel === 'medium' && 'bg-emerald-500/70',
                          concentrationLevel === 'low' && 'bg-emerald-500/40'
                        )}
                        style={{ width: `${volumePercent * (buyPercent / 100)}%` }}
                      >
                        {/* 高亮效果 */}
                        {concentrationLevel === 'high' && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                        )}
                      </div>
                      {/* 賣出量 */}
                      <div
                        className={cn(
                          'relative transition-all',
                          concentrationLevel === 'high' && 'bg-rose-500',
                          concentrationLevel === 'medium' && 'bg-rose-500/70',
                          concentrationLevel === 'low' && 'bg-rose-500/40'
                        )}
                        style={{ width: `${volumePercent * ((100 - buyPercent) / 100)}%` }}
                      >
                        {concentrationLevel === 'high' && (
                          <div className="absolute inset-0 bg-gradient-to-l from-white/20 to-transparent" />
                        )}
                      </div>
                    </div>
                    
                    {/* 成交量數值 (懸停顯示) */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono opacity-0 transition-opacity group-hover:opacity-100">
                      {(item.volume / 1e6).toFixed(2)}M
                    </div>
                  </div>

                  {/* 標記 */}
                  <div className="flex w-14 justify-end gap-1">
                    {isPoc && (
                      <Badge 
                        className="h-5 bg-chart-5 px-1.5 text-[10px] font-bold text-white shadow-sm shadow-chart-5/30"
                      >
                        POC
                      </Badge>
                    )}
                    {isHvn && !isPoc && (
                      <Badge 
                        variant="outline" 
                        className="h-5 border-amber-500/50 px-1.5 text-[10px] text-amber-500"
                      >
                        HVN
                      </Badge>
                    )}
                    {isLvn && (
                      <Badge 
                        variant="outline" 
                        className="h-5 border-muted-foreground/30 px-1.5 text-[10px] text-muted-foreground"
                      >
                        LVN
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <Separator className="opacity-50" />

        {/* 籌碼分析指標 */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3 rounded-xl bg-rose-500/5 p-4 ring-1 ring-rose-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-rose-500" />
                <span className="text-sm font-medium">上方套牢籌碼</span>
              </div>
              <span className="text-lg font-bold text-rose-500">
                {chipData.upperTrappedChips.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={chipData.upperTrappedChips}
              className="h-2 bg-rose-500/20"
              indicatorClassName="bg-rose-500"
            />
            <p className="text-xs text-muted-foreground">
              {chipData.upperTrappedChips > 40 
                ? '上方壓力較大，突破需要較強動能'
                : chipData.upperTrappedChips > 20
                  ? '上方存在一定壓力，需觀察量能配合'
                  : '上方壓力較小，突破相對容易'
              }
            </p>
          </div>
          
          <div className="space-y-3 rounded-xl bg-emerald-500/5 p-4 ring-1 ring-emerald-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">下方支撐密度</span>
              </div>
              <span className="text-lg font-bold text-emerald-500">
                {chipData.lowerSupportDensity.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={chipData.lowerSupportDensity}
              className="h-2 bg-emerald-500/20"
              indicatorClassName="bg-emerald-500"
            />
            <p className="text-xs text-muted-foreground">
              {chipData.lowerSupportDensity > 60
                ? '下方支撐強勁，下跌空間有限'
                : chipData.lowerSupportDensity > 40
                  ? '下方有一定支撐，但仍需注意風險'
                  : '下方支撐較弱，需謹慎操作'
              }
            </p>
          </div>
        </div>

        {/* 籌碼壓力總結 */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 p-5">
          {/* 背景裝飾 */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-chart-4/10 to-transparent blur-2xl" />
          
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-chart-4" />
                <span className="text-base font-semibold">籌碼壓力指數</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {isPriceAbovePoc
                  ? '當前價格位於成本密集區上方，大部分持有者處於獲利狀態。上方套牢籌碼較少，若量能配合，突破阻力相對容易。建議關注量能變化，順勢操作。'
                  : '當前價格位於成本密集區下方，需消化上方套牢籌碼才能有效上漲。建議等待量能放大確認方向，或在支撐位附近分批布局。'}
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold',
                  chipData.chipPressure <= 30
                    ? 'bg-emerald-500/20 text-emerald-500 ring-2 ring-emerald-500/30'
                    : chipData.chipPressure <= 60
                      ? 'bg-amber-500/20 text-amber-500 ring-2 ring-amber-500/30'
                      : 'bg-rose-500/20 text-rose-500 ring-2 ring-rose-500/30'
                )}
              >
                {chipData.chipPressure}
              </div>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  chipData.chipPressure <= 30
                    ? 'border-emerald-500/30 text-emerald-500'
                    : chipData.chipPressure <= 60
                      ? 'border-amber-500/30 text-amber-500'
                      : 'border-rose-500/30 text-rose-500'
                )}
              >
                {chipData.chipPressure <= 30 ? '壓力小' : chipData.chipPressure <= 60 ? '壓力中等' : '壓力大'}
              </Badge>
            </div>
          </div>
        </div>

        {/* HVN & LVN 說明 */}
        <div className="grid gap-3 text-xs sm:grid-cols-2">
          <div className="rounded-lg bg-amber-500/5 p-3 ring-1 ring-amber-500/10">
            <div className="flex items-center gap-2 font-medium text-amber-600 dark:text-amber-400">
              <Zap className="h-3.5 w-3.5" />
              高成交量節點 (HVN)
            </div>
            <p className="mt-1 text-muted-foreground">
              成交量密集區，通常為重要支撐或阻力位，價格在此區間容易產生震盪。
            </p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3 ring-1 ring-border/30">
            <div className="flex items-center gap-2 font-medium">
              <Target className="h-3.5 w-3.5 text-muted-foreground" />
              低成交量節點 (LVN)
            </div>
            <p className="mt-1 text-muted-foreground">
              成交量稀疏區，價格容易快速通過，可作為突破後的加速區間。
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
