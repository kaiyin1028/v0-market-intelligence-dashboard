'use client'

/**
 * AI洞察卡片元件
 * AI Insight Card Component
 * 
 * 顯示AI分析摘要與信心度
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Bot, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react'
import { ScoreGauge } from './score-gauge'
import type { AIAnalysis } from '@/types'

interface AIInsightCardProps {
  /** AI分析結果 */
  analysis: AIAnalysis
  /** 股票代碼 */
  ticker?: string
  /** 是否精簡顯示 */
  compact?: boolean
}

export function AIInsightCard({ analysis, ticker, compact = false }: AIInsightCardProps) {
  // 趨勢配置
  const trendConfig = {
    bullish: {
      label: '多頭',
      icon: TrendingUp,
      className: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
    },
    bearish: {
      label: '空頭',
      icon: TrendingDown,
      className: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    },
    neutral: {
      label: '中性',
      icon: Minus,
      className: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
    },
  }

  const trend = trendConfig[analysis.trendView]
  const TrendIcon = trend.icon

  if (compact) {
    return (
      <Card className="glass-card ai-glow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-chart-5/10">
              <Bot className="h-5 w-5 text-chart-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">AI 市場簡報</span>
                <Badge variant="outline" className="text-[10px] bg-chart-5/5 text-chart-5 border-chart-5/20">
                  <Sparkles className="mr-1 h-3 w-3" />
                  本地 LLM
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {analysis.summary}
              </p>
            </div>
            <ScoreGauge score={analysis.confidence} size="sm" label="信心度" type="info" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card ai-glow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-chart-5/10">
              <Bot className="h-5 w-5 text-chart-5" />
            </div>
            <div>
              <CardTitle className="text-base">
                AI 分析師
                {ticker && <span className="ml-2 text-muted-foreground">| {ticker}</span>}
              </CardTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[10px] bg-chart-5/5 text-chart-5 border-chart-5/20">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Ollama 本地 LLM
                </Badge>
              </div>
            </div>
          </div>
          <ScoreGauge score={analysis.confidence} size="md" label="信心度" type="info" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 趨勢觀點 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">趨勢觀點：</span>
          <Badge variant="outline" className={cn('font-medium', trend.className)}>
            <TrendIcon className="mr-1 h-3.5 w-3.5" />
            {trend.label}
          </Badge>
        </div>

        {/* 摘要 */}
        <p className="text-sm leading-relaxed">{analysis.summary}</p>

        {/* 多空理由 */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* 多頭理由 */}
          <div className="rounded-lg bg-chart-1/5 p-3">
            <h4 className="flex items-center gap-1.5 text-sm font-medium text-chart-1">
              <TrendingUp className="h-4 w-4" />
              多頭理由
            </h4>
            <ul className="mt-2 space-y-1">
              {analysis.bullishReasons.map((reason, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-chart-1" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* 空頭風險 */}
          <div className="rounded-lg bg-chart-2/5 p-3">
            <h4 className="flex items-center gap-1.5 text-sm font-medium text-chart-2">
              <TrendingDown className="h-4 w-4" />
              空頭風險
            </h4>
            <ul className="mt-2 space-y-1">
              {analysis.bearishRisks.map((risk, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-chart-2" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 關鍵價位 */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-muted/30 p-3">
            <h4 className="text-xs font-medium text-muted-foreground">支撐位</h4>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {analysis.keyLevels.support.map((level, i) => (
                <Badge key={i} variant="secondary" className="text-xs font-mono">
                  ${level.toFixed(2)}
                </Badge>
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-muted/30 p-3">
            <h4 className="text-xs font-medium text-muted-foreground">阻力位</h4>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {analysis.keyLevels.resistance.map((level, i) => (
                <Badge key={i} variant="secondary" className="text-xs font-mono">
                  ${level.toFixed(2)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
