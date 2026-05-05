"use client"

/**
 * 側邊導航欄元件
 * 提供主要導航功能，包含導航連結、品牌標識和AIGC裝飾元素
 * 明亮清爽專業風格設計
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  LineChart,
  Radar,
  Radio,
  FlaskConical,
  History,
  Brain,
  Star,
  Settings,
  TrendingUp,
  Sparkles,
  Zap,
  Activity,
  BarChart3,
  Target,
  Cpu,
  Network,
  CircuitBoard,
  Waves,
  ChevronLeft,
  ChevronRight,
  Hexagon,
  Triangle,
  Circle,
  Bot,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useState } from 'react'

/** 導航項目介面定義 */
interface NavItem {
  /** 導航項目標題 */
  title: string
  /** 導航項目路徑 */
  href: string
  /** 導航項目圖標 */
  icon: React.ComponentType<{ className?: string }>
  /** 導航項目描述 */
  description?: string
  /** 是否為新功能 */
  isNew?: boolean
  /** 是否為AI功能 */
  isAI?: boolean
}

/** 主要導航項目配置 */
const mainNavItems: NavItem[] = [
  {
    title: '市場儀表板',
    href: '/',
    icon: LayoutDashboard,
    description: '市場概覽與即時動態',
  },
  {
    title: '股票分析',
    href: '/stock-analysis',
    icon: LineChart,
    description: '深度技術分析',
  },
  {
    title: '突破掃描器',
    href: '/breakout-scanner',
    icon: Radar,
    description: '即時突破偵測',
    isNew: true,
  },
  {
    title: '訊號中心',
    href: '/signal-hub',
    icon: Radio,
    description: '整合交易訊號',
  },
]

/** 進階功能導航項目配置 */
const advancedNavItems: NavItem[] = [
  {
    title: '量價實驗室',
    href: '/volume-lab',
    icon: FlaskConical,
    description: '量價關係分析',
  },
  {
    title: '策略回測',
    href: '/backtest',
    icon: History,
    description: '歷史績效驗證',
  },
  {
    title: 'AI 分析師',
    href: '/ai-analyst',
    icon: Brain,
    description: '智慧對話分析',
    isAI: true,
  },
]

/** 其他導航項目配置 */
const otherNavItems: NavItem[] = [
  {
    title: '自選股清單',
    href: '/watchlist',
    icon: Star,
    description: '追蹤關注股票',
  },
  {
    title: '系統設定',
    href: '/settings',
    icon: Settings,
    description: '偏好設定',
  },
]

/** AIGC 裝飾背景元件 - 流動線條與幾何圖案 */
function AIGCBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 漸層背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-accent/[0.02]" />
      
      {/* 神經網路圖案 */}
      <svg className="absolute top-0 left-0 w-full h-full opacity-[0.04]" viewBox="0 0 200 800">
        <defs>
          <linearGradient id="sidebarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        {/* 連接曲線 */}
        <path d="M20,80 Q100,120 180,100" stroke="url(#sidebarGradient)" strokeWidth="1.5" fill="none" />
        <path d="M30,200 Q80,250 170,230" stroke="url(#sidebarGradient)" strokeWidth="1.5" fill="none" />
        <path d="M10,350 Q90,380 160,400" stroke="url(#sidebarGradient)" strokeWidth="1.5" fill="none" />
        <path d="M40,500 Q120,550 180,530" stroke="url(#sidebarGradient)" strokeWidth="1.5" fill="none" />
        <path d="M20,650 Q70,680 150,700" stroke="url(#sidebarGradient)" strokeWidth="1.5" fill="none" />
        {/* 節點圓點 */}
        <circle cx="20" cy="80" r="4" fill="hsl(var(--primary))" />
        <circle cx="180" cy="100" r="5" fill="hsl(var(--accent))" />
        <circle cx="30" cy="200" r="4" fill="hsl(var(--primary))" />
        <circle cx="170" cy="230" r="6" fill="hsl(var(--accent))" />
        <circle cx="90" cy="380" r="5" fill="hsl(var(--primary))" />
        <circle cx="160" cy="400" r="4" fill="hsl(var(--accent))" />
        <circle cx="120" cy="550" r="5" fill="hsl(var(--primary))" />
        <circle cx="70" cy="680" r="4" fill="hsl(var(--accent))" />
        {/* 裝飾性六角形 */}
        <polygon points="100,300 115,308 115,324 100,332 85,324 85,308" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.5" />
        <polygon points="50,450 60,455 60,465 50,470 40,465 40,455" fill="none" stroke="hsl(var(--accent))" strokeWidth="1" opacity="0.5" />
      </svg>
      
      {/* 浮動裝飾點 */}
      <div className="absolute top-20 right-4 w-2 h-2 rounded-full bg-primary/20 animate-pulse" />
      <div className="absolute top-40 right-8 w-1.5 h-1.5 rounded-full bg-accent/30 animate-pulse delay-300" />
      <div className="absolute top-60 right-3 w-1 h-1 rounded-full bg-primary/25 animate-pulse delay-700" />
    </div>
  )
}

/** 導航項目元件 */
function NavItemComponent({ 
  item, 
  isActive, 
  isCollapsed 
}: { 
  item: NavItem
  isActive: boolean
  isCollapsed: boolean 
}) {
  const Icon = item.icon
  
  const content = (
    <Link
      href={item.href}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300',
        'hover:bg-gradient-to-r hover:from-primary/8 hover:to-accent/5 hover:shadow-sm',
        isActive
          ? 'bg-gradient-to-r from-primary/12 to-accent/8 text-primary shadow-sm border border-primary/15'
          : 'text-muted-foreground hover:text-foreground',
        isCollapsed && 'justify-center px-2'
      )}
    >
      {/* 活躍指示器 */}
      {isActive && !isCollapsed && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full" />
      )}
      
      {/* 圖標容器 */}
      <div className={cn(
        'relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300',
        isActive 
          ? 'bg-primary/15 text-primary' 
          : 'bg-muted/40 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
      )}>
        <Icon className="h-4 w-4" />
        {/* AI功能發光效果 */}
        {item.isAI && (
          <div className="absolute -top-0.5 -right-0.5">
            <Sparkles className="h-3 w-3 text-accent animate-pulse" />
          </div>
        )}
        {/* 新功能指示點 */}
        {item.isNew && (
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-success animate-pulse" />
        )}
      </div>
      
      {/* 標題與標籤 */}
      {!isCollapsed && (
        <>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate">{item.title}</span>
            </div>
          </div>
          
          {/* 標籤 */}
          {item.isNew && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-success/15 text-success border border-success/25">
              NEW
            </span>
          )}
          {item.isAI && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-accent/15 text-accent border border-accent/25">
              <Sparkles className="h-2.5 w-2.5" />
              AI
            </span>
          )}
          
          {/* 懸停箭頭指示器 */}
          <div className={cn(
            'opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0.5',
            isActive && 'opacity-100'
          )}>
            <TrendingUp className="h-3 w-3 text-primary/60" />
          </div>
        </>
      )}
    </Link>
  )

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="right" className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.title}</span>
            {item.isNew && (
              <span className="text-[10px] px-1 py-0.5 rounded bg-success/15 text-success">NEW</span>
            )}
            {item.isAI && (
              <span className="text-[10px] px-1 py-0.5 rounded bg-accent/15 text-accent">AI</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{item.description}</span>
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}

/** 導航分組標題 */
function NavGroupTitle({ 
  title, 
  icon: Icon,
  isCollapsed 
}: { 
  title: string
  icon: React.ComponentType<{ className?: string }>
  isCollapsed: boolean 
}) {
  if (isCollapsed) {
    return (
      <div className="flex justify-center py-2">
        <div className="w-6 h-px bg-border/60" />
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
      <Icon className="h-3 w-3" />
      <span>{title}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
    </div>
  )
}

interface SidebarNavProps {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

/** 側邊欄主元件 */
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
      <aside className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-border/40 bg-card/95 backdrop-blur-xl transition-all duration-300',
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}>
        <AIGCBackground />
        
        <div className="relative flex h-full flex-col">
          {/* 品牌標識區域 */}
          <div className="flex h-16 items-center border-b border-border/40 px-4">
            {!isCollapsed ? (
              <Link href="/" className="flex items-center gap-3">
                {/* Logo 容器 */}
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25">
                  <Activity className="h-5 w-5 text-white" />
                  {/* 發光效果 */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent opacity-40 blur-md -z-10" />
                </div>
                
                <div className="flex flex-col">
                  <span className="text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    QuantFlow
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
                    智慧量化情報平台
                  </span>
                </div>
              </Link>
            ) : (
              <Link href="/" className="mx-auto">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25">
                  <Activity className="h-5 w-5 text-white" />
                </div>
              </Link>
            )}
          </div>

          {/* 導航選單區域 */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
            {/* 主要功能 */}
            <div className="space-y-1">
              <NavGroupTitle title="主要功能" icon={BarChart3} isCollapsed={isCollapsed} />
              {mainNavItems.map((item) => (
                <NavItemComponent
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>

            {/* 進階分析 */}
            <div className="space-y-1">
              <NavGroupTitle title="進階分析" icon={Target} isCollapsed={isCollapsed} />
              {advancedNavItems.map((item) => (
                <NavItemComponent
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>

            {/* 其他功能 */}
            <div className="space-y-1">
              <NavGroupTitle title="其他" icon={Settings} isCollapsed={isCollapsed} />
              {otherNavItems.map((item) => (
                <NavItemComponent
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </nav>

          {/* 收合按鈕 */}
          <div className="border-t border-border/40 p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className={cn(
                'w-full justify-center text-muted-foreground hover:bg-primary/8 hover:text-foreground rounded-xl',
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

          {/* 底部狀態區域 */}
          <div className="border-t border-border/40 p-4">
            {!isCollapsed ? (
              <>
                {/* AI 狀態指示器 */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/8 to-accent/5 border border-primary/15">
                  <div className="relative">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                      <Bot className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-card animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">AI 引擎運作中</p>
                    <p className="text-[10px] text-muted-foreground">本地 LLM 已連線</p>
                  </div>
                  <Zap className="h-4 w-4 text-warning animate-pulse" />
                </div>
                
                {/* 裝飾性圖案 */}
                <div className="mt-3 flex items-center justify-center gap-3 text-muted-foreground/20">
                  <Hexagon className="h-4 w-4" />
                  <Circle className="h-3 w-3" />
                  <Triangle className="h-4 w-4" />
                  <Circle className="h-3 w-3" />
                  <Hexagon className="h-4 w-4" />
                </div>
              </>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                      <Bot className="h-4 w-4 text-primary" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-success border-2 border-card animate-pulse" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-medium">AI 引擎運作中</p>
                  <p className="text-xs text-muted-foreground">本地 LLM 已連線</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
