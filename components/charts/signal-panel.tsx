'use client'

/**
 * 買賣訊號面板元件
 * Buy/Sell Signal Panel Component
 * 
 * 顯示進場、停損、目標價與風險報酬比
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Target,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Percent,
} from 'lucide-react'
import { ScoreGauge } from '@/components/dashboard/score-gauge'
import type { SignalData } from '@/types'

interface SignalPanelProps {
  data: SignalData
  currentPrice: number
}

export function SignalPanel({ data, currentPrice }: SignalPanelProps) {
  // 計算目標價與停損的距離百分比
  const stopLossPercent = ((currentPrice - data.stopLoss) / currentPrice) * 100
  const targetPercents = data.targets.map(
    (target) => ((target - currentPrice) / currentPrice) * 100
  )

  // 判斷整體訊號
  const getOverallSignal = () => {
    if (data.buyScore >= 70 && data.sellScore <= 30) {
      return { label: '強力買入', color: 'text-chart-1', bg: 'bg-chart-1' }
    }
    if (data.buyScore >= 50) {
      return { label: '買入', color: 'text-chart-1', bg: 'bg-chart-1' }
    }
    if (data.sellScore >= 70) {
      return { label: '賣出', color: 'text-chart-2', bg: 'bg-chart-2' }
    }
    if (data.sellScore >= 50) {
      return { label: '減碼', color: 'text-chart-4', bg: 'bg-chart-4' }
    }
    return { label: '觀望', color: 'text-chart-3', bg: 'bg-chart-3' }
  }

  const overallSignal = getOverallSignal()

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-chart-1" />
            買賣訊號
          </div>
          <Badge
            className={cn(
              'font-medium',
              overallSignal.bg,
              'text-white'
            )}
          >
            {overallSignal.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 買賣評分 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <ScoreGauge
              score={data.buyScore}
              size="lg"
              label="買入評分"
              type="bullish"
            />
          </div>
          <div className="flex flex-col items-center">
            <ScoreGauge
              score={data.sellScore}
              size="lg"
              label="賣出評分"
              type="bearish"
            />
          </div>
        </div>

        {/* 進場區間 */}
        <div className="rounded-lg bg-chart-1/10 p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-chart-1" />
            <span className="text-sm font-medium text-chart-1">建議進場區間</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="text-lg font-bold">${data.entryZone.low.toFixed(2)}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-bold">${data.entryZone.high.toFixed(2)}</span>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {currentPrice >= data.entryZone.low && currentPrice <= data.entryZone.high
              ? '當前價格在進場區間內'
              : currentPrice < data.entryZone.low
                ? '當前價格低於進場區間'
                : '當前價格高於進場區間'}
          </p>
        </div>

        {/* 停損位 */}
        <div className="rounded-lg bg-chart-2/10 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-chart-2" />
              <span className="text-sm font-medium text-chart-2">停損價位</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">${data.stopLoss.toFixed(2)}</div>
              <div className="text-xs text-chart-2">-{stopLossPercent.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* 目標價位 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-chart-1" />
            <span className="text-sm font-medium">目標價位</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {data.targets.map((target, i) => (
              <div
                key={i}
                className="rounded-lg bg-chart-1/10 p-2 text-center"
              >
                <div className="text-[10px] text-muted-foreground">
                  目標 {i + 1}
                </div>
                <div className="text-sm font-bold">${target.toFixed(2)}</div>
                <div className="text-[10px] text-chart-1">
                  +{targetPercents[i].toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 風險報酬比 */}
        <div className="rounded-lg bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-chart-5" />
              <span className="text-sm font-medium">風險報酬比</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-xl font-bold',
                  data.riskRewardRatio >= 2
                    ? 'text-chart-1'
                    : data.riskRewardRatio >= 1.5
                      ? 'text-chart-4'
                      : 'text-chart-2'
                )}
              >
                1 : {data.riskRewardRatio.toFixed(1)}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px]',
                  data.riskRewardRatio >= 2
                    ? 'text-chart-1 border-chart-1/30'
                    : data.riskRewardRatio >= 1.5
                      ? 'text-chart-4 border-chart-4/30'
                      : 'text-chart-2 border-chart-2/30'
                )}
              >
                {data.riskRewardRatio >= 2
                  ? '優良'
                  : data.riskRewardRatio >= 1.5
                    ? '可接受'
                    : '偏低'}
              </Badge>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {data.riskRewardRatio >= 2
              ? '風險報酬比優良，符合交易標準。'
              : data.riskRewardRatio >= 1.5
                ? '風險報酬比可接受，可考慮進場。'
                : '風險報酬比偏低，建議等待更好進場點。'}
          </p>
        </div>

        {/* 價格視覺化 */}
        <div className="relative h-24 rounded-lg bg-muted/20 p-2">
          {/* 目標價線 */}
          {data.targets.map((target, i) => {
            const position = Math.min(
              ((target - data.stopLoss) / (data.targets[2] - data.stopLoss)) * 100,
              95
            )
            return (
              <div
                key={i}
                className="absolute left-0 right-0 flex items-center"
                style={{ bottom: `${position}%` }}
              >
                <div className="h-px flex-1 bg-chart-1/50" />
                <span className="ml-1 text-[9px] text-chart-1">T{i + 1}</span>
              </div>
            )
          })}

          {/* 當前價格線 */}
          <div
            className="absolute left-0 right-0 flex items-center"
            style={{
              bottom: `${
                ((currentPrice - data.stopLoss) / (data.targets[2] - data.stopLoss)) * 100
              }%`,
            }}
          >
            <div className="h-0.5 flex-1 bg-primary" />
            <span className="ml-1 text-[9px] font-medium text-primary">現價</span>
          </div>

          {/* 進場區間 */}
          <div
            className="absolute left-0 right-8 bg-chart-1/10"
            style={{
              bottom: `${
                ((data.entryZone.low - data.stopLoss) / (data.targets[2] - data.stopLoss)) * 100
              }%`,
              height: `${
                ((data.entryZone.high - data.entryZone.low) /
                  (data.targets[2] - data.stopLoss)) *
                100
              }%`,
            }}
          />

          {/* 停損線 */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center">
            <div className="h-px flex-1 bg-chart-2" />
            <span className="ml-1 text-[9px] text-chart-2">停損</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
