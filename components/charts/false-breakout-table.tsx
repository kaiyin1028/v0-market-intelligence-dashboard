'use client'

/**
 * 假突破風險表元件
 * 顯示高假突破風險的股票列表
 * 明亮清爽專業風格設計
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ShieldAlert, TrendingDown, Activity, Eye } from 'lucide-react'
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
    if (risk >= 70) return { 
      color: 'text-danger', 
      bg: 'bg-danger',
      bgLight: 'bg-danger/10',
      borderColor: 'border-danger/20',
      icon: ShieldAlert,
    }
    if (risk >= 50) return { 
      color: 'text-warning', 
      bg: 'bg-warning',
      bgLight: 'bg-warning/10',
      borderColor: 'border-warning/20',
      icon: AlertTriangle,
    }
    return { 
      color: 'text-primary', 
      bg: 'bg-primary',
      bgLight: 'bg-primary/10',
      borderColor: 'border-primary/20',
      icon: Eye,
    }
  }

  // 計算統計數據
  const highRiskCount = data.filter(d => d.risk >= 70).length
  const mediumRiskCount = data.filter(d => d.risk >= 50 && d.risk < 70).length

  return (
    <Card className="relative overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 bg-gradient-to-b from-warning/[0.02] via-transparent to-danger/[0.02] pointer-events-none" />
      
      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-warning/10">
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
            假突破風險監控
          </div>
          <div className="flex items-center gap-2">
            {highRiskCount > 0 && (
              <Badge variant="outline" className="text-[10px] bg-danger/10 text-danger border-danger/20 rounded-full">
                {highRiskCount} 高風險
              </Badge>
            )}
            {mediumRiskCount > 0 && (
              <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/20 rounded-full">
                {mediumRiskCount} 中風險
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="space-y-2.5">
          {data.map((item) => {
            const style = getRiskStyle(item.risk)
            const IconComponent = style.icon
            
            return (
              <div
                key={item.ticker}
                className={cn(
                  'group flex items-center gap-3 rounded-xl p-3 transition-all duration-200',
                  'border hover:shadow-sm cursor-pointer',
                  style.bgLight,
                  style.borderColor
                )}
              >
                {/* 風險圖標 */}
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
                  style.bgLight,
                  style.color
                )}>
                  <IconComponent className="h-4 w-4" />
                </div>

                {/* 股票代碼 */}
                <div className="w-14 shrink-0">
                  <span className="font-mono text-sm font-bold text-foreground">
                    {item.ticker}
                  </span>
                </div>

                {/* 風險進度條 */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                      {item.reason}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] font-semibold rounded-full px-2',
                        style.color,
                        style.borderColor,
                        style.bgLight
                      )}
                    >
                      {item.level}
                    </Badge>
                  </div>
                  <Progress
                    value={item.risk}
                    className="h-2 bg-muted/30"
                    indicatorClassName={style.bg}
                  />
                </div>

                {/* 風險數值 */}
                <div className={cn(
                  'w-14 text-right font-mono text-sm font-bold',
                  style.color
                )}>
                  {item.risk}%
                </div>
              </div>
            )
          })}
        </div>
        
        {/* 圖例 */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border/30">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-danger" />
            <span className="text-[10px] text-muted-foreground">高風險 70%+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-warning" />
            <span className="text-[10px] text-muted-foreground">中風險 50-70%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-[10px] text-muted-foreground">低風險 {'<'}50%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
