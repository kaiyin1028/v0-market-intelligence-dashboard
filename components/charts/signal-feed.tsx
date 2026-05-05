'use client'

/**
 * 訊號動態元件
 * 顯示即時訊號更新列表
 * 明亮清爽專業風格設計
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Activity, Radio, Zap, Clock, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SignalBadge } from '@/components/dashboard/signal-badge'
import { cn } from '@/lib/utils'
import type { SignalType } from '@/types'

interface SignalFeedItem {
  id: string
  ticker: string
  signal: SignalType
  message: string
  time: string
}

interface SignalFeedProps {
  data: SignalFeedItem[]
}

/** 訊號類型圖標配置 */
const signalIconConfig: Record<SignalType, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  buy: { icon: TrendingUp, color: 'text-success' },
  sell: { icon: TrendingDown, color: 'text-danger' },
  hold: { icon: Activity, color: 'text-warning' },
  breakout: { icon: Zap, color: 'text-primary' },
  false_breakout: { icon: AlertTriangle, color: 'text-danger' },
  accumulation: { icon: TrendingUp, color: 'text-success' },
  distribution: { icon: TrendingDown, color: 'text-danger' },
}

export function SignalFeed({ data }: SignalFeedProps) {
  return (
    <Card className="relative overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-accent/[0.02] pointer-events-none" />
      
      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Radio className="h-4 w-4 text-primary" />
            </div>
            訊號動態
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20 rounded-full">
              即時更新
            </Badge>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative p-0">
        <ScrollArea className="h-[300px]">
          <div className="space-y-1 px-4 pb-4">
            {data.map((item, index) => {
              const iconConfig = signalIconConfig[item.signal]
              const IconComponent = iconConfig?.icon || Activity
              
              return (
                <div
                  key={item.id}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl p-3 transition-all duration-200',
                    'hover:bg-muted/50 hover:shadow-sm cursor-pointer',
                    'border border-transparent hover:border-border/40'
                  )}
                >
                  {/* 訊號圖標 */}
                  <div className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
                    item.signal === 'buy' || item.signal === 'breakout' || item.signal === 'accumulation'
                      ? 'bg-success/10 text-success group-hover:bg-success/15'
                      : item.signal === 'sell' || item.signal === 'false_breakout' || item.signal === 'distribution'
                      ? 'bg-danger/10 text-danger group-hover:bg-danger/15'
                      : 'bg-warning/10 text-warning group-hover:bg-warning/15'
                  )}>
                    <IconComponent className="h-4 w-4" />
                  </div>

                  {/* 股票代碼 */}
                  <div className="w-14 shrink-0">
                    <span className="font-mono text-sm font-bold text-foreground">
                      {item.ticker}
                    </span>
                  </div>

                  {/* 訊號徽章 */}
                  <SignalBadge signal={item.signal} size="sm" />

                  {/* 訊息 */}
                  <p className="flex-1 truncate text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors">
                    {item.message}
                  </p>

                  {/* 時間 */}
                  <div className="flex items-center gap-1 shrink-0 text-[10px] text-muted-foreground/60">
                    <Clock className="h-3 w-3" />
                    {item.time}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
        
        {/* 底部漸層遮罩 */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
      </CardContent>
    </Card>
  )
}
