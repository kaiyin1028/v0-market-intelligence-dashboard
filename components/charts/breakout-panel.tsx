'use client'

/**
 * 突破分析面板元件
 * Breakout Analysis Panel Component
 * 
 * 顯示真假突破分析指標
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  Zap,
  AlertTriangle,
  Volume2,
  Target,
  CheckCircle,
  XCircle,
  TrendingUp,
  Layers,
} from 'lucide-react'
import { ScoreGauge } from '@/components/dashboard/score-gauge'
import type { BreakoutAnalysis } from '@/types'

interface BreakoutPanelProps {
  data: BreakoutAnalysis
}

export function BreakoutPanel({ data }: BreakoutPanelProps) {
  // 突破評分判斷
  const getBreakoutStatus = (score: number) => {
    if (score >= 70) return { label: '高機率真突破', color: 'text-chart-1', type: 'bullish' as const }
    if (score >= 50) return { label: '突破中等', color: 'text-chart-4', type: 'warning' as const }
    return { label: '突破訊號弱', color: 'text-chart-2', type: 'bearish' as const }
  }

  // 假突破風險判斷
  const getRiskStatus = (risk: number) => {
    if (risk >= 60) return { label: '高風險', color: 'text-chart-2', bg: 'bg-chart-2' }
    if (risk >= 40) return { label: '中等風險', color: 'text-chart-4', bg: 'bg-chart-4' }
    return { label: '低風險', color: 'text-chart-1', bg: 'bg-chart-1' }
  }

  const breakoutStatus = getBreakoutStatus(data.trueBreakoutScore)
  const riskStatus = getRiskStatus(data.falseBreakoutRisk)

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 text-chart-4" />
          突破分析
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 突破價位 */}
        <div className="rounded-lg bg-muted/30 p-3 text-center">
          <div className="text-xs text-muted-foreground">突破價位</div>
          <div className="text-2xl font-bold">${data.breakoutLevel.toFixed(2)}</div>
        </div>

        {/* 評分儀表 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <ScoreGauge
              score={data.trueBreakoutScore}
              size="lg"
              label="真突破分數"
              type={breakoutStatus.type}
            />
          </div>
          <div className="flex flex-col items-center">
            <ScoreGauge
              score={data.falseBreakoutRisk}
              size="lg"
              label="假突破風險"
              type={data.falseBreakoutRisk >= 60 ? 'bearish' : data.falseBreakoutRisk >= 40 ? 'warning' : 'bullish'}
            />
          </div>
        </div>

        {/* 詳細指標 */}
        <div className="space-y-3">
          {/* 成交量比率 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">成交量比率</span>
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  data.volumeRatio >= 1.5 ? 'text-chart-1' : data.volumeRatio >= 1 ? 'text-chart-4' : 'text-chart-2'
                )}
              >
                {data.volumeRatio.toFixed(2)}x
              </span>
            </div>
            <Progress
              value={Math.min(data.volumeRatio * 50, 100)}
              className="h-1.5"
              indicatorClassName={
                data.volumeRatio >= 1.5 ? 'bg-chart-1' : data.volumeRatio >= 1 ? 'bg-chart-4' : 'bg-chart-2'
              }
            />
            <p className="text-[10px] text-muted-foreground">
              建議 {'>'}1.5x 確認有效突破
            </p>
          </div>

          {/* 收盤強度 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">收盤強度</span>
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  data.closeStrength >= 70 ? 'text-chart-1' : data.closeStrength >= 50 ? 'text-chart-4' : 'text-chart-2'
                )}
              >
                {data.closeStrength}%
              </span>
            </div>
            <Progress
              value={data.closeStrength}
              className="h-1.5"
              indicatorClassName={
                data.closeStrength >= 70 ? 'bg-chart-1' : data.closeStrength >= 50 ? 'bg-chart-4' : 'bg-chart-2'
              }
            />
            <p className="text-[10px] text-muted-foreground">
              收盤在當日波幅的相對位置
            </p>
          </div>

          {/* 上方籌碼壓力 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">上方籌碼壓力</span>
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  data.upperChipPressure <= 30 ? 'text-chart-1' : data.upperChipPressure <= 50 ? 'text-chart-4' : 'text-chart-2'
                )}
              >
                {data.upperChipPressure}%
              </span>
            </div>
            <Progress
              value={data.upperChipPressure}
              className="h-1.5"
              indicatorClassName={
                data.upperChipPressure <= 30 ? 'bg-chart-1' : data.upperChipPressure <= 50 ? 'bg-chart-4' : 'bg-chart-2'
              }
            />
          </div>
        </div>

        {/* 確認指標 */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg p-2',
              data.obvConfirmation ? 'bg-chart-1/10' : 'bg-chart-2/10'
            )}
          >
            {data.obvConfirmation ? (
              <CheckCircle className="h-4 w-4 text-chart-1" />
            ) : (
              <XCircle className="h-4 w-4 text-chart-2" />
            )}
            <div>
              <div className="text-xs font-medium">OBV 確認</div>
              <div className="text-[10px] text-muted-foreground">
                {data.obvConfirmation ? '量能支持突破' : '量能未確認'}
              </div>
            </div>
          </div>
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg p-2',
              !data.rsiDivergence ? 'bg-chart-1/10' : 'bg-chart-4/10'
            )}
          >
            {!data.rsiDivergence ? (
              <CheckCircle className="h-4 w-4 text-chart-1" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-chart-4" />
            )}
            <div>
              <div className="text-xs font-medium">RSI 背離</div>
              <div className="text-[10px] text-muted-foreground">
                {data.rsiDivergence ? '存在背離風險' : '無背離訊號'}
              </div>
            </div>
          </div>
        </div>

        {/* 結論 */}
        <div
          className={cn(
            'rounded-lg p-3',
            breakoutStatus.type === 'bullish'
              ? 'bg-chart-1/10'
              : breakoutStatus.type === 'warning'
                ? 'bg-chart-4/10'
                : 'bg-chart-2/10'
          )}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className={cn('h-4 w-4', breakoutStatus.color)} />
            <span className={cn('text-sm font-medium', breakoutStatus.color)}>
              {breakoutStatus.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {data.trueBreakoutScore >= 70
              ? '多項指標確認突破有效性，建議關注後續走勢並設定好停損。'
              : data.trueBreakoutScore >= 50
                ? '突破訊號中等，建議等待回測確認或額外指標支持。'
                : '突破訊號較弱，假突破風險較高，建議觀望或輕倉參與。'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
