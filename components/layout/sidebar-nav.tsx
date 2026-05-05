'use client'

/**
 * 側邊欄導航元件
 * Sidebar Navigation Component
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Zap,
  Activity,
  FlaskConical,
  History,
  Bot,
  Star,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useState } from 'react'

/** 導航項目定義 */
const navItems = [
  {
    title: '儀表板',
    href: '/',
    icon: LayoutDashboard,
    description: '市場概覽與關鍵指標',
  },
  {
    title: '市場概覽',
    href: '/market-overview',
    icon: TrendingUp,
    description: '大盤走勢與產業分析',
  },
  {
    title: '股票分析',
    href: '/stock-analysis',
    icon: BarChart3,
    description: '個股技術面與籌碼面分析',
  },
  {
    title: '突破掃描器',
    href: '/breakout-scanner',
    icon: Zap,
    description: '偵測真假突破訊號',
  },
  {
    title: '訊號中心',
    href: '/signal-center',
    icon: Activity,
    description: '買賣訊號彙整',
  },
  {
    title: '量價實驗室',
    href: '/volume-lab',
    icon: FlaskConical,
    description: '籌碼分布深度分析',
  },
  {
    title: '回測系統',
    href: '/backtesting',
    icon: History,
    description: '策略回測與績效分析',
  },
  {
    title: 'AI 分析師',
    href: '/ai-analyst',
    icon: Bot,
    description: '本地LLM智能解讀',
  },
  {
    title: '觀察清單',
    href: '/watchlist',
    icon: Star,
    description: '自選股追蹤',
  },
  {
    title: '組合風控',
    href: '/portfolio-risk',
    icon: Shield,
    description: '投資組合風險管理',
  },
  {
    title: '系統設定',
    href: '/settings',
    icon: Settings,
    description: '參數與偏好設定',
  },
]

interface SidebarNavProps {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function SidebarNav({ collapsed = false, onCollapsedChange }: SidebarNavProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(collapsed)

  const handleToggle = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    onCollapsedChange?.(newState)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo 區域 */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          {!isCollapsed ? (
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <BarChart3 className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-sidebar-foreground">
                  市場情報
                </span>
                <span className="text-xs text-sidebar-foreground/60">
                  量化儀表板
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/" className="mx-auto">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <BarChart3 className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
            </Link>
          )}
        </div>

        {/* 導航列表 */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-primary'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/50'
                    )}
                  />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              )

              if (isCollapsed) {
                return (
                  <li key={item.href}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {linkContent}
                      </TooltipTrigger>
                      <TooltipContent side="right" className="flex flex-col">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                )
              }

              return <li key={item.href}>{linkContent}</li>
            })}
          </ul>
        </nav>

        {/* 收合按鈕 */}
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className={cn(
              'w-full justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
              isCollapsed && 'px-0'
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>收合側邊欄</span>
              </>
            )}
          </Button>
        </div>

        {/* AI 徽章 */}
        {!isCollapsed && (
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent/30 px-3 py-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ai-glow/20">
                <Bot className="h-3.5 w-3.5 text-ai-glow" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-sidebar-foreground">
                  本地 AI 引擎
                </span>
                <span className="text-[10px] text-sidebar-foreground/50">
                  Ollama 連線中
                </span>
              </div>
              <div className="ml-auto h-2 w-2 animate-pulse rounded-full bg-chart-1" />
            </div>
          </div>
        )}
      </aside>
    </TooltipProvider>
  )
}
