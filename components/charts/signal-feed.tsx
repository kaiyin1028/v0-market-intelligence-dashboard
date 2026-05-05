'use client'

/**
 * 訊號動態元件
 * Signal Feed Component
 * 
 * 顯示即時訊號更新列表
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Activity } from 'lucide-react'
import { SignalBadge } from '@/components/dashboard/signal-badge'
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

export function SignalFeed({ data }: SignalFeedProps) {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" />
          訊號動態
          <span className="ml-auto flex h-2 w-2 animate-pulse rounded-full bg-chart-1" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="space-y-1 px-4 pb-4">
            {data.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50"
              >
                {/* 股票代碼 */}
                <div className="w-14 shrink-0">
                  <span className="font-mono text-sm font-semibold">
                    {item.ticker}
                  </span>
                </div>

                {/* 訊號徽章 */}
                <SignalBadge signal={item.signal} size="sm" />

                {/* 訊息 */}
                <p className="flex-1 truncate text-xs text-muted-foreground">
                  {item.message}
                </p>

                {/* 時間 */}
                <span className="shrink-0 text-[10px] text-muted-foreground/60">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
