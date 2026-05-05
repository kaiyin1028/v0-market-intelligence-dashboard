'use client'

/**
 * AI洞察卡片元件
 * 顯示AI分析摘要與信心度
 * 明亮清爽專業風格設計，增加AIGC裝飾元素
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  Bot, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  Cpu, 
  Network, 
  Zap,
  CircuitBoard,
  BrainCircuit,
  MessageSquare,
} from 'lucide-react'
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

/** AIGC 裝飾背景 */
function AIGCBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 漸層背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.03] via-transparent to-primary/[0.03]" />
      
      {/* 神經網路圖案 */}
      <svg className="absolute top-0 right-0 w-full h-full opacity-[0.03]" viewBox="0 0 400 200">
        <defs>
          <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--accent))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
        </defs>
        {/* 連接線 */}
        <path d="M350,30 Q300,60 250,40 T150,70" stroke="url(#aiGradient)" strokeWidth="2" fill="none" />
        <path d="M380,80 Q330,110 280,90 T180,120" stroke="url(#aiGradient)" strokeWidth="2" fill="none" />
        <path d="M360,140 Q310,170 260,150 T160,180" stroke="url(#aiGradient)" strokeWidth="2" fill="none" />
        {/* 節點 */}
        <circle cx="350" cy="30" r="6" fill="hsl(var(--accent))" />
        <circle cx="250" cy="40" r="4" fill="hsl(var(--primary))" />
        <circle cx="150" cy="70" r="5" fill="hsl(var(--accent))" />
        <circle cx="280" cy="90" r="4" fill="hsl(var(--primary))" />
        <circle cx="180" cy="120" r="6" fill="hsl(var(--accent))" />
        <circle cx="260" cy="150" r="5" fill="hsl(var(--primary))" />
      </svg>
      
      {/* 浮動裝飾 */}
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-accent/20 animate-pulse" />
      <div className="absolute top-8 right-12 w-1.5 h-1.5 rounded-full bg-primary/30 animate-pulse delay-300" />
      <div className="absolute bottom-4 right-8 w-1 h-1 rounded-full bg-accent/25 animate-pulse delay-700" />
    </div>
  )
}

export function AIInsightCard({ analysis, ticker, compact = false }: AIInsightCardProps) {
  // 趨勢配置
  const trendConfig = {
    bullish: {
      label: '多頭趨勢',
      icon: TrendingUp,
      className: 'bg-success/10 text-success border-success/20',
      bgClassName: 'bg-success/5',
    },
    bearish: {
      label: '空頭趨勢',
      icon: TrendingDown,
      className: 'bg-danger/10 text-danger border-danger/20',
      bgClassName: 'bg-danger/5',
    },
    neutral: {
      label: '中性盤整',
      icon: Minus,
      className: 'bg-warning/10 text-warning border-warning/20',
      bgClassName: 'bg-warning/5',
    },
  }

  const trend = trendConfig[analysis.trendView]
  const TrendIcon = trend.icon

  if (compact) {
    return (
      <Card className="relative overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm">
        <AIGCBackground />
        
        <CardContent className="relative p-4">
          <div className="flex items-start gap-4">
            {/* AI 圖標 */}
            <div className="relative flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-primary/10 border border-accent/20">
                <BrainCircuit className="h-6 w-6 text-accent" />
              </div>
              <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-success border-2 border-card">
                <Zap className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            
            {/* 內容 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground">AI 市場簡報</span>
                <Badge variant="outline" className="text-[10px] bg-accent/5 text-accent border-accent/20 rounded-full">
                  <Sparkles className="mr-1 h-2.5 w-2.5" />
                  本地 LLM
                </Badge>
                <Badge variant="outline" className={cn('text-[10px] rounded-full', trend.className)}>
                  <TrendIcon className="mr-1 h-2.5 w-2.5" />
                  {trend.label}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {analysis.summary}
              </p>
            </div>
            
            {/* 信心度儀表 */}
            <div className="flex-shrink-0">
              <ScoreGauge score={analysis.confidence} size="sm" label="信心度" type="info" />
            </div>
          </div>
          
          {/* 底部裝飾 */}
          <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-border/30">
            <div className="flex items-center gap-1.5 text-muted-foreground/40">
              <Cpu className="h-3.5 w-3.5" />
              <span className="text-[10px]">神經網路分析</span>
            </div>
            <div className="w-px h-3 bg-border/50" />
            <div className="flex items-center gap-1.5 text-muted-foreground/40">
              <Network className="h-3.5 w-3.5" />
              <span className="text-[10px]">多因子模型</span>
            </div>
            <div className="w-px h-3 bg-border/50" />
            <div className="flex items-center gap-1.5 text-muted-foreground/40">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="text-[10px]">即時解讀</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm">
      <AIGCBackground />
      
      <CardHeader className="relative pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-primary/10 border border-accent/20">
                <BrainCircuit className="h-5.5 w-5.5 text-accent" />
              </div>
              <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-success border-2 border-card animate-pulse">
                <Zap className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                AI 分析師
                {ticker && <span className="text-muted-foreground font-normal">| {ticker}</span>}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] bg-accent/5 text-accent border-accent/20 rounded-full">
                  <Sparkles className="mr-1 h-2.5 w-2.5" />
                  Ollama 本地 LLM
                </Badge>
                <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20 rounded-full">
                  <CircuitBoard className="mr-1 h-2.5 w-2.5" />
                  即時運算
                </Badge>
              </div>
            </div>
          </div>
          <ScoreGauge score={analysis.confidence} size="md" label="信心度" type="info" />
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        {/* 趨勢觀點 */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">趨勢觀點：</span>
          <Badge variant="outline" className={cn('font-medium rounded-full px-3', trend.className)}>
            <TrendIcon className="mr-1.5 h-3.5 w-3.5" />
            {trend.label}
          </Badge>
        </div>

        {/* 摘要 */}
        <div className={cn('p-4 rounded-xl border', trend.bgClassName, 'border-border/30')}>
          <p className="text-sm leading-relaxed text-foreground">{analysis.summary}</p>
        </div>

        {/* 多空理由 */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* 多頭理由 */}
          <div className="rounded-xl bg-success/5 border border-success/15 p-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-success">
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-success/15">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              多頭理由
            </h4>
            <ul className="mt-3 space-y-2">
              {analysis.bullishReasons.map((reason, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* 空頭風險 */}
          <div className="rounded-xl bg-danger/5 border border-danger/15 p-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-danger">
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-danger/15">
                <TrendingDown className="h-3.5 w-3.5" />
              </div>
              空頭風險
            </h4>
            <ul className="mt-3 space-y-2">
              {analysis.bearishRisks.map((risk, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 關鍵價位 */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-muted/20 border border-border/30 p-4">
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              支撐位
            </h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {analysis.keyLevels.support.map((level, i) => (
                <Badge key={i} variant="secondary" className="text-xs font-mono bg-success/10 text-success border-success/20 rounded-full">
                  ${level.toFixed(2)}
                </Badge>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-muted/20 border border-border/30 p-4">
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-danger" />
              阻力位
            </h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {analysis.keyLevels.resistance.map((level, i) => (
                <Badge key={i} variant="secondary" className="text-xs font-mono bg-danger/10 text-danger border-danger/20 rounded-full">
                  ${level.toFixed(2)}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* 底部裝飾 */}
        <div className="flex items-center justify-center gap-4 pt-3 border-t border-border/30">
          <div className="flex items-center gap-1.5 text-muted-foreground/40">
            <Cpu className="h-3.5 w-3.5" />
            <span className="text-[10px]">深度學習</span>
          </div>
          <div className="w-px h-3 bg-border/50" />
          <div className="flex items-center gap-1.5 text-muted-foreground/40">
            <Network className="h-3.5 w-3.5" />
            <span className="text-[10px]">多因子模型</span>
          </div>
          <div className="w-px h-3 bg-border/50" />
          <div className="flex items-center gap-1.5 text-muted-foreground/40">
            <Bot className="h-3.5 w-3.5" />
            <span className="text-[10px]">自然語言生成</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
