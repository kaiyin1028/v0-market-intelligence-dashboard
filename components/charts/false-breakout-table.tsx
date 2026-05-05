'use client'

/**
 * 假突破風險表元件
 * False Breakout Risk Table Component
 * 
 * 顯示高假突破風險的股票列表
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FalseBreakoutRisk {
  ticker: string
  risk: number
  level: string
  reason: string
}

interface FalseBreakoutTableProps {
  data: FalseBreakoutRisk[]
}

export function FalseBreakoutTable({ data }: FalseBreakoutTableProps) {
  // 取得風險等級樣式
  const getRiskStyle = (risk: number) => {
    if (risk >= 70) return { color: 'text-chart-2', bg: 'bg-chart-2' }
    if (risk >= 50) return { color: 'text-chart-4', bg: 'bg-chart-4' }
    return { color: 'text-chart-3', bg: 'bg-chart-3' }
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-chart-4" />
          假突破風險監控
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item) => {
            const style = getRiskStyle(item.risk)
            return (
              <div
                key={item.ticker}
                className="flex items-center gap-3 rounded-lg bg-muted/30 p-3"
              >
                {/* 股票代碼 */}
                <div className="w-14 shrink-0">
                  <span className="font-mono text-sm font-semibold">
                    {item.ticker}
                  </span>
                </div>

                {/* 風險進度條 */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {item.reason}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] font-medium',
                        style.color,
                        `border-current/20`
                      )}
                    >
                      {item.level}
                    </Badge>
                  </div>
                  <Progress
                    value={item.risk}
                    className="h-1.5"
                    indicatorClassName={style.bg}
                  />
                </div>

                {/* 風險數值 */}
                <div className={cn('w-12 text-right font-mono text-sm font-bold', style.color)}>
                  {item.risk}%
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
