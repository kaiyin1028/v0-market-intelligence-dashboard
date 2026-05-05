'use client'

/**
 * 技術指標卡片元件
 * Technical Indicator Cards Component
 * 
 * 顯示RSI、MACD、ADX、ATR、OBV、CMF等指標
 * 高端機構級設計，清晰的視覺層次
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Gauge,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Waves,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Zap,
} from 'lucide-react'
import { ScoreGauge } from '@/components/dashboard/score-gauge'
import type { TechnicalIndicators } from '@/types'

interface IndicatorCardsProps {
  股票代號?: string
  indicators?: TechnicalIndicators
}

/** 模擬指標數據 */
const 模擬指標數據: TechnicalIndicators = {
  rsi: 65,
  macd: {
    value: 12.5,
    signal: 10.2,
    histogram: 2.3,
  },
  adx: 32,
  atr: 15.8,
  obv: 2500000000,
  cmf: 0.12,
}

/** 指標卡片容器 */
function IndicatorCard({ 
  children, 
  className,
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn(
      'glass-card border-border/40 overflow-hidden transition-all duration-300 hover:shadow-lg',
      className
    )}>
      {children}
    </Card>
  )
}

export function IndicatorCards({ 股票代號, indicators = 模擬指標數據 }: IndicatorCardsProps) {
  // RSI狀態判斷
  const getRsiStatus = (rsi: number) => {
    if (rsi >= 70) return { 
      label: '超買區', 
      color: 'text-danger', 
      bg: 'bg-danger/12', 
      border: 'border-danger/25',
      advice: '建議觀望或減碼'
    }
    if (rsi <= 30) return { 
      label: '超賣區', 
      color: 'text-success', 
      bg: 'bg-success/12', 
      border: 'border-success/25',
      advice: '可考慮進場布局'
    }
    return { 
      label: '中性區', 
      color: 'text-primary', 
      bg: 'bg-primary/12', 
      border: 'border-primary/25',
      advice: '觀察後續方向'
    }
  }

  // MACD狀態判斷
  const getMacdStatus = (histogram: number) => {
    if (histogram > 0) return { 
      label: '多頭動能', 
      color: 'text-success', 
      bg: 'bg-success/12',
      border: 'border-success/25',
      icon: TrendingUp 
    }
    return { 
      label: '空頭動能', 
      color: 'text-danger', 
      bg: 'bg-danger/12',
      border: 'border-danger/25',
      icon: TrendingDown 
    }
  }

  // ADX趨勢強度
  const getAdxStatus = (adx: number) => {
    if (adx >= 50) return { label: '非常強勢', color: 'text-success' }
    if (adx >= 25) return { label: '趨勢明確', color: 'text-primary' }
    if (adx >= 20) return { label: '趨勢形成', color: 'text-warning' }
    return { label: '盤整狀態', color: 'text-muted-foreground' }
  }

  // CMF資金流向
  const getCmfStatus = (cmf: number) => {
    if (cmf > 0.05) return { 
      label: '資金流入', 
      color: 'text-success', 
      bg: 'bg-success/12',
      border: 'border-success/25',
      icon: ArrowUpRight 
    }
    if (cmf < -0.05) return { 
      label: '資金流出', 
      color: 'text-danger', 
      bg: 'bg-danger/12',
      border: 'border-danger/25',
      icon: ArrowDownRight 
    }
    return { 
      label: '資金中性', 
      color: 'text-muted-foreground', 
      bg: 'bg-muted/30',
      border: 'border-border/50',
      icon: Activity 
    }
  }

  const rsiStatus = getRsiStatus(indicators.rsi)
  const macdStatus = getMacdStatus(indicators.macd.histogram)
  const adxStatus = getAdxStatus(indicators.adx)
  const cmfStatus = getCmfStatus(indicators.cmf)

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {/* RSI 相對強弱指標 */}
      <IndicatorCard>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-chart-3/10">
                <Gauge className="h-4 w-4 text-chart-3" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">RSI 相對強弱</CardTitle>
                <CardDescription className="text-[10px]">Relative Strength Index</CardDescription>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={cn('text-[10px] rounded-full font-semibold', rsiStatus.bg, rsiStatus.color, rsiStatus.border)}
            >
              {rsiStatus.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4">
            <ScoreGauge
              score={indicators.rsi}
              size="lg"
              type={indicators.rsi >= 70 ? 'bearish' : indicators.rsi <= 30 ? 'bullish' : 'info'}
            />
            <div className="flex-1 space-y-3">
              {/* 區間指示 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">超買線 70</span>
                  <span className="text-danger font-medium">賣出訊號</span>
                </div>
                <div className="relative h-1.5 rounded-full bg-muted/30">
                  <div 
                    className="absolute h-full rounded-full bg-gradient-to-r from-success via-warning to-danger"
                    style={{ width: '100%' }}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-foreground border-2 border-background shadow-sm"
                    style={{ left: `${indicators.rsi}%`, transform: 'translate(-50%, -50%)' }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-success font-medium">買入訊號</span>
                  <span className="text-muted-foreground">超賣線 30</span>
                </div>
              </div>
              {/* 建議 */}
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/30">
                <Info className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground">{rsiStatus.advice}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </IndicatorCard>

      {/* MACD 動能指標 */}
      <IndicatorCard>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-chart-3/10">
                <Activity className="h-4 w-4 text-chart-3" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">MACD 動能</CardTitle>
                <CardDescription className="text-[10px]">Moving Average Convergence</CardDescription>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={cn('text-[10px] rounded-full font-semibold', macdStatus.bg, macdStatus.color, macdStatus.border)}
            >
              <macdStatus.icon className="h-2.5 w-2.5 mr-0.5" />
              {macdStatus.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* 數值區塊 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <div className="text-lg font-bold">{indicators.macd.value.toFixed(2)}</div>
              <div className="text-[10px] text-muted-foreground">MACD線</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <div className="text-lg font-bold">{indicators.macd.signal.toFixed(2)}</div>
              <div className="text-[10px] text-muted-foreground">訊號線</div>
            </div>
            <div className={cn('text-center p-2 rounded-lg', macdStatus.bg)}>
              <div className={cn('text-lg font-bold', macdStatus.color)}>
                {indicators.macd.histogram > 0 ? '+' : ''}
                {indicators.macd.histogram.toFixed(2)}
              </div>
              <div className="text-[10px] text-muted-foreground">柱狀圖</div>
            </div>
          </div>
          
          {/* 柱狀圖視覺化 */}
          <div className="p-3 rounded-lg bg-muted/20">
            <div className="flex items-end justify-center gap-0.5 h-10">
              {Array.from({ length: 12 }).map((_, i) => {
                const isPositive = i >= 6 ? Math.random() > 0.3 : Math.random() > 0.6
                const height = 20 + Math.random() * 80
                return (
                  <div
                    key={i}
                    className={cn(
                      'w-2 rounded-sm transition-all duration-300',
                      isPositive ? 'bg-success' : 'bg-danger'
                    )}
                    style={{ height: `${height}%`, opacity: 0.5 + (i / 24) }}
                  />
                )
              })}
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-2">近12期柱狀圖走勢</p>
          </div>
        </CardContent>
      </IndicatorCard>

      {/* ADX 趨勢強度 */}
      <IndicatorCard>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-chart-3/10">
                <TrendingUp className="h-4 w-4 text-chart-3" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">ADX 趨勢強度</CardTitle>
                <CardDescription className="text-[10px]">Average Directional Index</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4">
            <ScoreGauge
              score={indicators.adx}
              size="lg"
              type={indicators.adx >= 25 ? 'bullish' : 'warning'}
              label={adxStatus.label}
            />
            <div className="flex-1 space-y-3">
              {/* 強度指示 */}
              <div className="space-y-2">
                {[
                  { min: 50, label: '非常強勢', color: 'bg-success' },
                  { min: 25, label: '趨勢明確', color: 'bg-primary' },
                  { min: 20, label: '趨勢形成', color: 'bg-warning' },
                  { min: 0, label: '無趨勢', color: 'bg-muted' },
                ].map((level) => (
                  <div key={level.min} className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', level.color)} />
                    <span className="text-[10px] text-muted-foreground flex-1">{level.label}</span>
                    <span className="text-[10px] text-muted-foreground">{'>='}{level.min}</span>
                    {indicators.adx >= level.min && indicators.adx < (level.min === 50 ? 100 : level.min + (level.min === 0 ? 20 : 25)) && (
                      <Zap className="h-3 w-3 text-warning animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </IndicatorCard>

      {/* ATR 波動率 */}
      <IndicatorCard>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-chart-4/10">
              <Waves className="h-4 w-4 text-chart-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">ATR 波動率</CardTitle>
              <CardDescription className="text-[10px]">Average True Range</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">${indicators.atr.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground">/ 交易日</span>
          </div>
          
          <div className="space-y-2">
            <p className="text-[11px] text-muted-foreground">建議停損距離參考</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-warning/8 border border-warning/15">
                <div className="text-xs font-semibold text-warning">1.5x ATR</div>
                <div className="text-sm font-bold mt-0.5">${(indicators.atr * 1.5).toFixed(2)}</div>
                <div className="text-[10px] text-muted-foreground">短線停損</div>
              </div>
              <div className="p-2.5 rounded-lg bg-danger/8 border border-danger/15">
                <div className="text-xs font-semibold text-danger">2.0x ATR</div>
                <div className="text-sm font-bold mt-0.5">${(indicators.atr * 2).toFixed(2)}</div>
                <div className="text-[10px] text-muted-foreground">波段停損</div>
              </div>
            </div>
          </div>
        </CardContent>
      </IndicatorCard>

      {/* OBV 能量潮 */}
      <IndicatorCard>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-success/10">
                <BarChart3 className="h-4 w-4 text-success" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">OBV 能量潮</CardTitle>
                <CardDescription className="text-[10px]">On-Balance Volume</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] rounded-full font-semibold bg-success/12 text-success border-success/25">
              <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
              上升
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{(indicators.obv / 1e9).toFixed(2)}</span>
            <span className="text-lg font-semibold text-muted-foreground">B</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">量能累積趨勢</span>
              <span className="text-success font-medium">+12.5% (5日)</span>
            </div>
            <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-success/60 to-success rounded-full" />
            </div>
            <p className="text-[10px] text-muted-foreground">OBV上升驗證價格上漲的有效性</p>
          </div>
        </CardContent>
      </IndicatorCard>

      {/* CMF 資金流量 */}
      <IndicatorCard>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-chart-3/10">
                <DollarSign className="h-4 w-4 text-chart-3" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">CMF 資金流量</CardTitle>
                <CardDescription className="text-[10px]">Chaikin Money Flow</CardDescription>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={cn('text-[10px] rounded-full font-semibold', cmfStatus.bg, cmfStatus.color, cmfStatus.border)}
            >
              <cmfStatus.icon className="h-2.5 w-2.5 mr-0.5" />
              {cmfStatus.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex items-baseline gap-1">
            <span className={cn('text-3xl font-bold', cmfStatus.color)}>
              {indicators.cmf > 0 ? '+' : ''}
              {indicators.cmf.toFixed(3)}
            </span>
          </div>
          
          <div className="space-y-2">
            {/* CMF 量表 */}
            <div className="relative h-3 rounded-full bg-gradient-to-r from-danger/30 via-muted/30 to-success/30 overflow-hidden">
              <div 
                className="absolute top-0 h-full w-1 rounded-full bg-foreground shadow-sm"
                style={{ left: `${(indicators.cmf + 0.25) * 200}%`, transform: 'translateX(-50%)' }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="text-danger">-0.25 流出</span>
              <span>0</span>
              <span className="text-success">+0.25 流入</span>
            </div>
            <p className="text-[10px] text-muted-foreground p-2 rounded-lg bg-muted/20">
              CMF {'>'}0.05 表示資金淨流入，{'<'}-0.05 表示資金淨流出
            </p>
          </div>
        </CardContent>
      </IndicatorCard>
    </div>
  )
}
