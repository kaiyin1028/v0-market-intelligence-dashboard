'use client'

/**
 * 技術指標卡片元件
 * Technical Indicator Cards Component
 * 
 * 顯示RSI、MACD、ADX、ATR、OBV、CMF等指標
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Gauge,
  Activity,
  TrendingUp,
  BarChart3,
  Waves,
  DollarSign,
} from 'lucide-react'
import { ScoreGauge } from '@/components/dashboard/score-gauge'
import type { TechnicalIndicators } from '@/types'

interface IndicatorCardsProps {
  indicators: TechnicalIndicators
}

export function IndicatorCards({ indicators }: IndicatorCardsProps) {
  // RSI狀態判斷
  const getRsiStatus = (rsi: number) => {
    if (rsi >= 70) return { label: '超買', color: 'text-chart-2', bg: 'bg-chart-2' }
    if (rsi <= 30) return { label: '超賣', color: 'text-chart-1', bg: 'bg-chart-1' }
    return { label: '中性', color: 'text-chart-3', bg: 'bg-chart-3' }
  }

  // MACD狀態判斷
  const getMacdStatus = (histogram: number) => {
    if (histogram > 0) return { label: '多頭', color: 'text-chart-1' }
    return { label: '空頭', color: 'text-chart-2' }
  }

  // ADX趨勢強度
  const getAdxStrength = (adx: number) => {
    if (adx >= 50) return '非常強'
    if (adx >= 25) return '強勢'
    if (adx >= 20) return '趨勢形成中'
    return '無明顯趨勢'
  }

  // CMF資金流向
  const getCmfStatus = (cmf: number) => {
    if (cmf > 0.05) return { label: '資金流入', color: 'text-chart-1' }
    if (cmf < -0.05) return { label: '資金流出', color: 'text-chart-2' }
    return { label: '中性', color: 'text-chart-3' }
  }

  const rsiStatus = getRsiStatus(indicators.rsi)
  const macdStatus = getMacdStatus(indicators.macd.histogram)
  const cmfStatus = getCmfStatus(indicators.cmf)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* RSI 卡片 */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-chart-3" />
              RSI 相對強弱
            </div>
            <Badge variant="outline" className={cn('text-[10px]', rsiStatus.color)}>
              {rsiStatus.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <ScoreGauge
              score={indicators.rsi}
              size="lg"
              type={indicators.rsi >= 70 ? 'bearish' : indicators.rsi <= 30 ? 'bullish' : 'info'}
            />
            <div className="space-y-1 text-right">
              <div className="text-xs text-muted-foreground">超買區</div>
              <Progress value={70} className="w-20 h-1.5" indicatorClassName="bg-chart-2/50" />
              <div className="text-xs text-muted-foreground">超賣區</div>
              <Progress value={30} className="w-20 h-1.5" indicatorClassName="bg-chart-1/50" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MACD 卡片 */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-chart-3" />
              MACD 動能
            </div>
            <Badge variant="outline" className={cn('text-[10px]', macdStatus.color)}>
              {macdStatus.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold">{indicators.macd.value.toFixed(2)}</div>
              <div className="text-[10px] text-muted-foreground">MACD</div>
            </div>
            <div>
              <div className="text-lg font-bold">{indicators.macd.signal.toFixed(2)}</div>
              <div className="text-[10px] text-muted-foreground">訊號線</div>
            </div>
            <div>
              <div className={cn('text-lg font-bold', macdStatus.color)}>
                {indicators.macd.histogram > 0 ? '+' : ''}
                {indicators.macd.histogram.toFixed(2)}
              </div>
              <div className="text-[10px] text-muted-foreground">柱狀圖</div>
            </div>
          </div>
          {/* 柱狀圖視覺化 */}
          <div className="flex items-end justify-center gap-0.5 h-8">
            {Array.from({ length: 10 }).map((_, i) => {
              const isPositive = Math.random() > 0.4
              const height = Math.random() * 100
              return (
                <div
                  key={i}
                  className={cn(
                    'w-2 rounded-sm transition-all',
                    isPositive ? 'bg-chart-1' : 'bg-chart-2'
                  )}
                  style={{ height: `${height}%` }}
                />
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ADX 趨勢強度 */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-chart-3" />
            ADX 趨勢強度
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <ScoreGauge
              score={indicators.adx}
              size="lg"
              type={indicators.adx >= 25 ? 'bullish' : 'info'}
            />
            <div className="text-right">
              <div className="text-sm font-medium">{getAdxStrength(indicators.adx)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {'>'}25 為趨勢確認
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ATR 波動率 */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Waves className="h-4 w-4 text-chart-4" />
            ATR 波動率
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${indicators.atr.toFixed(2)}</div>
          <div className="mt-2 text-xs text-muted-foreground">
            平均真實波幅 | 建議停損距離
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              1.5x ATR: ${(indicators.atr * 1.5).toFixed(2)}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              2x ATR: ${(indicators.atr * 2).toFixed(2)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* OBV 能量潮 */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4 text-chart-1" />
            OBV 能量潮
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(indicators.obv / 1e9).toFixed(2)}B
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            量能累積指標 | 驗證價格趨勢
          </div>
          <div className="mt-2 flex items-center gap-1">
            <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-3/4 bg-chart-1 rounded-full" />
            </div>
            <span className="text-xs text-chart-1">上升</span>
          </div>
        </CardContent>
      </Card>

      {/* CMF 資金流量 */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-chart-3" />
              CMF 資金流量
            </div>
            <Badge variant="outline" className={cn('text-[10px]', cmfStatus.color)}>
              {cmfStatus.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn('text-3xl font-bold', cmfStatus.color)}>
            {indicators.cmf > 0 ? '+' : ''}
            {indicators.cmf.toFixed(3)}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {'>'}0.05 資金流入 | {'<'}-0.05 資金流出
          </div>
          <Progress
            value={(indicators.cmf + 0.25) * 200}
            className="mt-2 h-2"
            indicatorClassName={cmfStatus.color === 'text-chart-1' ? 'bg-chart-1' : cmfStatus.color === 'text-chart-2' ? 'bg-chart-2' : 'bg-chart-3'}
          />
        </CardContent>
      </Card>
    </div>
  )
}
