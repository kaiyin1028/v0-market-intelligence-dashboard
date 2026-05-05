'use client'

/**
 * 頂部導航列元件
 * Top Navigation Bar Component
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
  { value: '1D', label: '日線' },
  { value: '1W', label: '週線' },
  { value: '1M', label: '月線' },
  { value: '3M', label: '季線' },
  { value: '6M', label: '半年線' },
  { value: '1Y', label: '年線' },
  { value: '5Y', label: '五年線' },
]

/** 模擬通知數據 */
const notifications = [
  {
    id: '1',
    title: 'NVDA 突破新高',
    message: '成交量放大 2.5 倍，真突破機率高',
    time: '2 分鐘前',
    type: 'bullish',
  },
  {
    id: '2',
    title: 'TSLA 假突破警示',
    message: '量能不足，假突破風險 78%',
    time: '5 分鐘前',
    type: 'bearish',
  },
  {
    id: '3',
    title: 'AI 分析完成',
    message: 'AAPL 多因子分析報告已生成',
    time: '10 分鐘前',
    type: 'info',
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
  }

  return (
    <header
      className={cn(
        'fixed top-0 z-30 flex h-16 items-center border-b border-border bg-background/95 backdrop-blur transition-all duration-300',
        sidebarCollapsed ? 'left-16 w-[calc(100%-4rem)]' : 'left-64 w-[calc(100%-16rem)]',
        'max-lg:left-0 max-lg:w-full'
      )}
    >
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        {/* 左側：行動版選單 + 搜尋列 */}
        <div className="flex items-center gap-4">
          {/* 行動版選單按鈕 */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜尋股票代碼、公司名稱..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-secondary/50 pl-9 lg:w-80"
            />
          </div>
        </div>

        {/* 右側：市場狀態、時間週期、主題、通知、用戶 */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* 市場狀態指示器 */}
          <div className="hidden items-center gap-2 rounded-lg bg-secondary/50 px-3 py-1.5 md:flex">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                marketStatus.isOpen ? 'animate-pulse bg-chart-1' : 'bg-muted-foreground'
              )}
            />
            <span className="text-xs font-medium text-foreground/80">
              {marketStatus.statusText}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {marketStatus.time}
            </div>
          </div>

          {/* 時間週期選擇器 */}
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-24 bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map((tf) => (
                <SelectItem key={tf.value} value={tf.value}>
                  {tf.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 主題切換 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">切換主題</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                淺色模式
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                深色模式
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-4 w-4" />
                跟隨系統
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 通知中心 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground">
                <Bell className="h-4 w-4" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-chart-2 text-[10px] font-medium text-white">
                  3
                </span>
                <span className="sr-only">通知</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>通知中心</span>
                <Badge variant="secondary" className="text-xs">
                  3 則未讀
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 p-3"
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      {notification.type === 'bullish' && (
                        <TrendingUp className="h-4 w-4 text-chart-1" />
                      )}
                      {notification.type === 'bearish' && (
                        <TrendingDown className="h-4 w-4 text-chart-2" />
                      )}
                      {notification.type === 'info' && (
                        <div className="h-4 w-4 rounded-full bg-chart-3" />
                      )}
                      <span className="font-medium">{notification.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {notification.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {notification.message}
                  </p>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-sm text-primary">
                查看所有通知
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 用戶選單 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="sr-only">用戶選單</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>我的帳戶</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>個人資料</DropdownMenuItem>
              <DropdownMenuItem>偏好設定</DropdownMenuItem>
              <DropdownMenuItem>API 金鑰</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>登出</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
