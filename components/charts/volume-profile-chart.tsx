'use client'

/**
 * 量價分布圖元件
 * Volume Profile Chart Component
 * 
 * 顯示水平成交量分布與關鍵價位
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { Layers, Target, AlertTriangle } from 'lucide-react'
import type { VolumeProfile, ChipDistribution } from '@/types'

interface VolumeProfileChartProps {
  /** 量價分布數據 */
  data: VolumeProfile[]
  /** 籌碼分布數據 */
  chipData: ChipDistribution
  /** 當前價格 */
  currentPrice: number
}

export function VolumeProfileChart({
  data,
  chipData,
  currentPrice,
}: VolumeProfileChartProps) {
  // 找出最大成交量用於計算比例
  const maxVolume = Math.max(...data.map((d) => d.volume))

  // 判斷價格相對於POC位置
  const priceVsPoc = currentPrice > chipData.poc ? '價格在POC上方' : '價格在POC下方'
  const isPriceAbovePoc = currentPrice > chipData.poc

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="h-4 w-4 text-chart-5" />
          量價分布分析
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 關鍵價位 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-chart-2/10 p-3 text-center">
            <div className="text-[10px] text-muted-foreground">價值區上緣 VAH</div>
            <div className="text-lg font-bold text-chart-2">${chipData.vah.toFixed(2)}</div>
          </div>
          <div className="rounded-lg bg-chart-5/10 p-3 text-center">
            <div className="text-[10px] text-muted-foreground">成本密集區 POC</div>
            <div className="text-lg font-bold text-chart-5">${chipData.poc.toFixed(2)}</div>
          </div>
          <div className="rounded-lg bg-chart-1/10 p-3 text-center">
            <div className="text-[10px] text-muted-foreground">價值區下緣 VAL</div>
            <div className="text-lg font-bold text-chart-1">${chipData.val.toFixed(2)}</div>
          </div>
        </div>

        {/* 水平量價分布圖 */}
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground mb-2">水平成交量分布</div>
          {data.slice().reverse().map((item, index) => {
            const volumePercent = (item.volume / maxVolume) * 100
            const buyPercent = (item.buyVolume / item.volume) * 100
            const isPoc = Math.abs(item.priceLevel - chipData.poc) < 1
            const isCurrentPrice = Math.abs(item.priceLevel - currentPrice) < 1
            const isHvn = chipData.hvn.some((h) => Math.abs(item.priceLevel - h) < 1)
            const isLvn = chipData.lvn.some((l) => Math.abs(item.priceLevel - l) < 1)

            return (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-2 rounded px-2 py-1 transition-colors',
                  isPoc && 'bg-chart-5/10',
                  isCurrentPrice && 'ring-1 ring-primary',
                  isHvn && !isPoc && 'bg-chart-4/5',
                  isLvn && 'bg-muted/20'
                )}
              >
                {/* 價格標籤 */}
                <div className="w-16 text-right">
                  <span
                    className={cn(
                      'text-xs font-mono',
                      isPoc && 'text-chart-5 font-semibold',
                      isCurrentPrice && 'text-primary font-semibold'
                    )}
                  >
                    ${item.priceLevel.toFixed(2)}
                  </span>
                </div>

                {/* 成交量條 */}
                <div className="flex-1 flex h-4 rounded overflow-hidden bg-muted/20">
                  {/* 買入量 */}
                  <div
                    className="bg-chart-1/70 transition-all"
                    style={{ width: `${volumePercent * (buyPercent / 100)}%` }}
                  />
                  {/* 賣出量 */}
                  <div
                    className="bg-chart-2/70 transition-all"
                    style={{ width: `${volumePercent * ((100 - buyPercent) / 100)}%` }}
                  />
                </div>

                {/* 標記 */}
                <div className="w-12 flex gap-1 justify-end">
                  {isPoc && (
                    <Badge variant="outline" className="text-[8px] px-1 py-0 text-chart-5 border-chart-5/30">
                      POC
                    </Badge>
                  )}
                  {isHvn && !isPoc && (
                    <Badge variant="outline" className="text-[8px] px-1 py-0 text-chart-4 border-chart-4/30">
                      HVN
                    </Badge>
                  )}
                  {isLvn && (
                    <Badge variant="outline" className="text-[8px] px-1 py-0 text-muted-foreground border-muted">
                      LVN
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 圖例 */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-chart-1/70" />
            <span className="text-muted-foreground">買入量</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-chart-2/70" />
            <span className="text-muted-foreground">賣出量</span>
          </div>
        </div>

        {/* 籌碼分析指標 */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">上方套牢籌碼</span>
              <span className="text-xs font-medium text-chart-2">
                {chipData.upperTrappedChips.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={chipData.upperTrappedChips}
              className="h-1.5"
              indicatorClassName="bg-chart-2"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">下方支撐密度</span>
              <span className="text-xs font-medium text-chart-1">
                {chipData.lowerSupportDensity.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={chipData.lowerSupportDensity}
              className="h-1.5"
              indicatorClassName="bg-chart-1"
            />
          </div>
        </div>

        {/* 籌碼壓力 */}
        <div className="rounded-lg bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-chart-4" />
              <span className="text-sm font-medium">籌碼壓力指數</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-lg font-bold',
                  chipData.chipPressure <= 30
                    ? 'text-chart-1'
                    : chipData.chipPressure <= 60
                      ? 'text-chart-4'
                      : 'text-chart-2'
                )}
              >
                {chipData.chipPressure}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px]',
                  chipData.chipPressure <= 30
                    ? 'text-chart-1 border-chart-1/30'
                    : chipData.chipPressure <= 60
                      ? 'text-chart-4 border-chart-4/30'
                      : 'text-chart-2 border-chart-2/30'
                )}
              >
                {chipData.chipPressure <= 30 ? '壓力小' : chipData.chipPressure <= 60 ? '中等' : '壓力大'}
              </Badge>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {isPriceAbovePoc
              ? '當前價格位於成本密集區上方，上方套牢籌碼較少，突破阻力相對容易。'
              : '當前價格位於成本密集區下方，需消化上方套牢籌碼才能有效上漲。'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
