'use client'

/**
 * 頂部導航列元件
 * 提供搜尋、通知、主題切換等功能
 * 明亮清爽專業風格設計
 */

import { useState } from 'react'
import { useTheme } from 'next-themes'
import {
  Search,
  Bell,
  User,
  Sun,
  Moon,
  Monitor,
  Clock,
  TrendingUp,
  TrendingDown,
  Menu,
  Sparkles,
  Zap,
  Activity,
  BarChart2,
  Globe,
  Wifi,
  ChevronDown,
  Settings,
  LogOut,
  CreditCard,
  HelpCircle,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { SidebarNav } from './sidebar-nav'

/** 時間週期選項 */
const timeframes = [
  { value: '1D', label: '日線', icon: Clock },
  { value: '1W', label: '週線', icon: Clock },
  { value: '1M', label: '月線', icon: Clock },
  { value: '3M', label: '季線', icon: Clock },
  { value: '6M', label: '半年線', icon: Clock },
  { value: '1Y', label: '年線', icon: Clock },
  { value: '5Y', label: '五年線', icon: Clock },
]

/** 通知類型配置 */
const notificationTypeConfig = {
  bullish: {
    icon: TrendingUp,
    iconClass: 'text-success',
    bgClass: 'bg-success/10',
    borderClass: 'border-success/20',
  },
  bearish: {
    icon: TrendingDown,
    iconClass: 'text-danger',
    bgClass: 'bg-danger/10',
    borderClass: 'border-danger/20',
  },
  info: {
    icon: Info,
    iconClass: 'text-primary',
    bgClass: 'bg-primary/10',
    borderClass: 'border-primary/20',
  },
  warning: {
    icon: AlertCircle,
    iconClass: 'text-warning',
    bgClass: 'bg-warning/10',
    borderClass: 'border-warning/20',
  },
  success: {
    icon: CheckCircle2,
    iconClass: 'text-success',
    bgClass: 'bg-success/10',
    borderClass: 'border-success/20',
  },
}

/** 模擬通知數據 */
const notifications = [
  {
    id: '1',
    title: 'NVDA 突破新高',
    message: '成交量放大 2.5 倍，真突破機率高達 87%',
    time: '2 分鐘前',
    type: 'bullish' as const,
    isRead: false,
  },
  {
    id: '2',
    title: 'TSLA 假突破警示',
    message: '量能不足，假突破風險評估 78%',
    time: '5 分鐘前',
    type: 'warning' as const,
    isRead: false,
  },
  {
    id: '3',
    title: 'AI 分析報告完成',
    message: 'AAPL 多因子深度分析報告已生成',
    time: '10 分鐘前',
    type: 'info' as const,
    isRead: true,
  },
  {
    id: '4',
    title: '策略回測完畢',
    message: '均線交叉策略回測完成，勝率 62.3%',
    time: '15 分鐘前',
    type: 'success' as const,
    isRead: true,
  },
]

interface TopBarProps {
  sidebarCollapsed?: boolean
}

export function TopBar({ sidebarCollapsed = false }: TopBarProps) {
  const { theme, setTheme } = useTheme()
  const [timeframe, setTimeframe] = useState('1D')
  const [searchQuery, setSearchQuery] = useState('')

  // 模擬市場狀態
  const marketStatus = {
    isOpen: true,
    statusText: '美股交易中',
    time: '09:45:32 ET',
    change: '+1.24%',
    isPositive: true,
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <header
      className={cn(
        'fixed top-0 z-30 flex h-16 items-center border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all duration-300',
        sidebarCollapsed ? 'left-[72px] w-[calc(100%-72px)]' : 'left-64 w-[calc(100%-16rem)]',
        'max-lg:left-0 max-lg:w-full'
      )}
    >
      {/* 頂部裝飾線條 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        {/* 左側：行動版選單 + 搜尋列 */}
        <div className="flex items-center gap-4">
          {/* 行動版選單按鈕 */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-xl">
                <Menu className="h-5 w-5" />
                <span className="sr-only">開啟選單</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarNav />
            </SheetContent>
          </Sheet>

          {/* 搜尋列 */}
          <div className="relative hidden sm:block">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="search"
              placeholder="搜尋股票代碼、公司名稱..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-muted/30 pl-9 pr-20 rounded-xl border-border/50 focus:border-primary/50 focus:bg-background lg:w-80"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border/60 bg-muted/50 px-1.5 text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        {/* 右側：市場狀態、時間週期、主題、通知、用戶 */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* 市場狀態指示器 */}
          <div className="hidden items-center gap-3 rounded-xl bg-muted/30 border border-border/40 px-3 py-1.5 md:flex">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background',
                    marketStatus.isOpen ? 'animate-pulse bg-success' : 'bg-muted-foreground'
                  )}
                />
              </div>
              <span className="text-xs font-medium text-foreground">
                {marketStatus.statusText}
              </span>
            </div>
            <div className="w-px h-4 bg-border/60" />
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-mono">
                {marketStatus.time}
              </span>
            </div>
            <div className="w-px h-4 bg-border/60" />
            <div className={cn(
              'flex items-center gap-1 text-xs font-semibold',
              marketStatus.isPositive ? 'text-success' : 'text-danger'
            )}>
              {marketStatus.isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {marketStatus.change}
            </div>
          </div>

          {/* 時間週期選擇器 */}
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-24 bg-muted/30 border-border/40 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map((tf) => (
                <SelectItem key={tf.value} value={tf.value}>
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
                    {tf.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* AI 快捷按鈕 */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-muted-foreground hover:text-primary rounded-xl hover:bg-primary/8"
          >
            <Sparkles className="h-4 w-4" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="sr-only">AI 助手</span>
          </Button>

          {/* 主題切換 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground rounded-xl hover:bg-muted/50">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">切換主題</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => setTheme('light')} className="rounded-lg">
                <Sun className="mr-2 h-4 w-4 text-warning" />
                淺色模式
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')} className="rounded-lg">
                <Moon className="mr-2 h-4 w-4 text-primary" />
                深色模式
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')} className="rounded-lg">
                <Monitor className="mr-2 h-4 w-4 text-muted-foreground" />
                跟隨系統
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 通知中心 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground rounded-xl hover:bg-muted/50">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-white shadow-lg shadow-danger/30">
                    {unreadCount}
                  </span>
                )}
                <span className="sr-only">通知</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 rounded-xl p-0">
              <DropdownMenuLabel className="flex items-center justify-between p-4 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <span className="font-semibold">通知中心</span>
                </div>
                <Badge variant="secondary" className="rounded-full text-xs bg-primary/10 text-primary border-primary/20">
                  {unreadCount} 則未讀
                </Badge>
              </DropdownMenuLabel>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => {
                  const config = notificationTypeConfig[notification.type]
                  const Icon = config.icon
                  
                  return (
                    <DropdownMenuItem
                      key={notification.id}
                      className={cn(
                        'flex flex-col items-start gap-2 p-4 cursor-pointer border-b border-border/20 last:border-0',
                        !notification.isRead && 'bg-primary/[0.02]'
                      )}
                    >
                      <div className="flex w-full items-start justify-between gap-3">
                        <div className={cn(
                          'flex items-center justify-center w-8 h-8 rounded-lg',
                          config.bgClass,
                          'border',
                          config.borderClass
                        )}>
                          <Icon className={cn('h-4 w-4', config.iconClass)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{notification.title}</span>
                            {!notification.isRead && (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {notification.time}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  )
                })}
              </div>
              
              <div className="p-3 border-t border-border/40 bg-muted/20">
                <Button variant="ghost" className="w-full justify-center text-sm text-primary hover:bg-primary/8 rounded-lg">
                  查看所有通知
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 用戶選單 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground rounded-xl hover:bg-muted/50 px-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <ChevronDown className="h-3.5 w-3.5 hidden sm:block" />
                <span className="sr-only">用戶選單</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">量化交易員</p>
                  <p className="text-xs text-muted-foreground">user@quantflow.ai</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg">
                <User className="mr-2 h-4 w-4" />
                個人資料
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg">
                <Settings className="mr-2 h-4 w-4" />
                偏好設定
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg">
                <CreditCard className="mr-2 h-4 w-4" />
                訂閱方案
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg">
                <HelpCircle className="mr-2 h-4 w-4" />
                說明中心
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg">
                <MessageSquare className="mr-2 h-4 w-4" />
                意見回饋
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg text-danger focus:text-danger">
                <LogOut className="mr-2 h-4 w-4" />
                登出
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
