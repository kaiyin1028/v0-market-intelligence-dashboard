'use client'

/**
 * 儀表板內容元件
 * 包含市場概覽、指標卡片、圖表與訊號動態
 * 明亮清爽專業風格設計，增加AIGC裝飾元素和AI生成圖片
 */

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  AlertTriangle,
  Gauge,
  Sparkles,
  Zap,
  Brain,
  LineChart,
  PieChart,
  Target,
  Layers,
  Cpu,
  Network,
  CircuitBoard,
  Hexagon,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Rocket,
  Star,
  Radio,
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard'
import { SectorHeatmap, SignalFeed, FalseBreakoutTable, IndexChart } from '@/components/charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getMarketOverview } from '@/lib/api'
import { cn } from '@/lib/utils'

/** 動畫變體配置 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
}

/** AIGC 裝飾背景元件 - 包含 AI 生成圖片 */
function AIGCDecorativeBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* AI 生成的神經網路背景圖片 */}
      <div className="absolute top-0 right-0 w-[600px] h-[400px] opacity-[0.03] dark:opacity-[0.06]">
        <Image
          src="/images/ai-neural-bg.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-background/50 to-background" />
      </div>
      
      {/* 漸層球體裝飾 */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-emerald-500/8 to-cyan-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-40 left-10 w-80 h-80 bg-gradient-to-tr from-violet-500/8 to-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-amber-500/5 to-rose-500/3 rounded-full blur-3xl" />
      
      {/* 神經網路線條圖案 */}
      <svg className="absolute top-0 left-0 w-full h-full opacity-[0.02]" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="dashboardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="50%" stopColor="hsl(var(--chart-1))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        {/* 連接曲線 */}
        <path d="M0,200 Q300,100 600,200 T1200,200" stroke="url(#dashboardGradient)" strokeWidth="2" fill="none" />
        <path d="M0,400 Q400,300 800,400 T1200,400" stroke="url(#dashboardGradient)" strokeWidth="2" fill="none" />
        <path d="M0,600 Q200,500 500,600 T1200,600" stroke="url(#dashboardGradient)" strokeWidth="2" fill="none" />
        {/* 彩色節點 */}
        <circle cx="150" cy="180" r="8" fill="hsl(var(--chart-1))" />
        <circle cx="450" cy="220" r="10" fill="hsl(var(--chart-2))" />
        <circle cx="750" cy="190" r="6" fill="hsl(var(--chart-3))" />
        <circle cx="300" cy="380" r="9" fill="hsl(var(--chart-4))" />
        <circle cx="600" cy="420" r="7" fill="hsl(var(--chart-5))" />
        <circle cx="900" cy="390" r="11" fill="hsl(var(--accent))" />
        <circle cx="1050" cy="200" r="8" fill="hsl(var(--primary))" />
      </svg>
    </div>
  )
}

/** 頁面標題區元件 */
function PageHeader() {
  return (
    <div className="relative">
      {/* 標題裝飾背景 */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-14 bg-gradient-to-b from-emerald-500 via-cyan-500 to-violet-500 rounded-full shadow-lg shadow-primary/20" />
      
      <div className="space-y-2 pl-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text">
            市場情報量化儀表板
          </h1>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 border border-emerald-500/25">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">AI 驅動</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground lg:text-base">
            多維度技術分析、量價分析、籌碼分析與AI智能解讀
          </p>
          <div className="hidden sm:flex items-center gap-2">
            <Network className="h-4 w-4 text-emerald-500/50" />
            <div className="w-px h-4 bg-border" />
            <Cpu className="h-4 w-4 text-cyan-500/50" />
            <div className="w-px h-4 bg-border" />
            <CircuitBoard className="h-4 w-4 text-violet-500/50" />
          </div>
        </div>
      </div>
    </div>
  )
}

/** 快捷功能卡片 - 帶有彩色圖標 */
function QuickActionCard({ 
  icon: Icon, 
  title, 
  description, 
  accent = false,
  color = 'primary',
  badge,
}: { 
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  accent?: boolean
  color?: 'emerald' | 'cyan' | 'violet' | 'amber' | 'rose' | 'primary'
  badge?: string
}) {
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/25',
      glow: 'shadow-emerald-500/20',
      gradient: 'from-emerald-500/15 to-emerald-500/5',
    },
    cyan: {
      bg: 'bg-cyan-500/15',
      text: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-500/25',
      glow: 'shadow-cyan-500/20',
      gradient: 'from-cyan-500/15 to-cyan-500/5',
    },
    violet: {
      bg: 'bg-violet-500/15',
      text: 'text-violet-600 dark:text-violet-400',
      border: 'border-violet-500/25',
      glow: 'shadow-violet-500/20',
      gradient: 'from-violet-500/15 to-violet-500/5',
    },
    amber: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/25',
      glow: 'shadow-amber-500/20',
      gradient: 'from-amber-500/15 to-amber-500/5',
    },
    rose: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/25',
      glow: 'shadow-rose-500/20',
      gradient: 'from-rose-500/15 to-rose-500/5',
    },
    primary: {
      bg: 'bg-primary/15',
      text: 'text-primary',
      border: 'border-primary/25',
      glow: 'shadow-primary/20',
      gradient: 'from-primary/15 to-primary/5',
    },
  }
  
  const c = colorClasses[color]
  
  return (
    <div className={cn(
      'group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden',
      accent 
        ? `bg-gradient-to-br ${c.gradient} ${c.border} hover:shadow-lg ${c.glow}` 
        : 'bg-card/80 border-border/50 hover:border-primary/30 hover:shadow-md hover:bg-card'
    )}>
      {/* 背景裝飾 */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-current opacity-[0.02] rounded-full blur-xl" />
      
      {/* 標籤角標 */}
      {badge && (
        <div className="absolute -top-1 -right-1">
          <div className={cn('flex items-center justify-center px-2 py-0.5 rounded-full text-[9px] font-bold text-white', c.bg.replace('/15', ''))}>
            {badge}
          </div>
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className={cn(
          'flex items-center justify-center w-11 h-11 rounded-xl transition-all',
          c.bg, c.text
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <ArrowUpRight className={cn('h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity', c.text)} />
      </div>
    </div>
  )
}

export function DashboardContent() {
  const [data, setData] = useState({
    indices: [] as any[],
    summary: { marketBreadth: { advancers: 0, decliners: 0, unchanged: 0, ratio: 0 }, bullishSignals: 0, bearishSignals: 0, falseBreakoutAlerts: 0 },
    sectorHeatmap: [] as any[],
    signalFeed: [] as any[],
    falseBreakoutRisks: [] as any[],
  })
  const [loading, setLoading] = useState(true)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = () => {
      setLoading(true)
      getMarketOverview()
        .then((res) => {
          if (!cancelled) {
            setData(res.data)
            setFallback(res.fallback)
          }
        })
        .catch(() => {
          if (!cancelled) setFallback(true)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }
    load()
    const interval = setInterval(load, 5000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  const hasRealData = data.indices.length > 0

  // 取得主要指數數據
  const spIndex = useMemo(
    () => data.indices.find((i) => i.symbol === 'SPX'),
    [data.indices]
  )

  return (
    <>
      <AIGCDecorativeBackground />

      {loading && (
        <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/20 px-4 py-2 text-sm text-primary">
          <Activity className="h-4 w-4 animate-spin" />
          正在載入市場數據...
        </div>
      )}
      {!loading && hasRealData && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400">
          <Radio className="h-4 w-4 animate-pulse" />
          即時數據模式 — 市場數據已連線
        </div>
      )}
      {!loading && !hasRealData && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-500/5 border border-amber-500/20 px-4 py-2 text-sm text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          暫無即時數據 — FutuOpenD 未連線
        </div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* 頁面標題區 */}
        <motion.div variants={itemVariants}>
          <PageHeader />
        </motion.div>

        {/* 快捷功能區 */}
        <motion.div
          variants={itemVariants}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <QuickActionCard
            icon={Brain}
            title="AI 即時分析"
            description="智能市場解讀"
            accent
            color="emerald"
            badge="HOT"
          />
          <QuickActionCard
            icon={Target}
            title="突破掃描"
            description="偵測交易機會"
            color="cyan"
          />
          <QuickActionCard
            icon={Layers}
            title="量價分析"
            description="籌碼結構洞察"
            color="violet"
          />
          <QuickActionCard
            icon={Rocket}
            title="策略回測"
            description="驗證交易策略"
            color="amber"
          />
        </motion.div>

        {/* 關鍵指標卡片 */}
        {hasRealData ? (
          <motion.div
            variants={itemVariants}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {data.indices.map((index, i) => (
              <MetricCard
                key={index.symbol}
                title={index.name}
                value={index.value}
                change={index.change}
                changePercent={index.changePercent}
                sparklineData={index.sparklineData}
                status={index.status}
                badge={index.symbol}
                icon={index.status === 'bullish' ? TrendingUp : index.status === 'bearish' ? TrendingDown : Activity}
                index={i}
              />
            ))}
          </motion.div>
        ) : !loading ? (
          <motion.div variants={itemVariants} className="rounded-xl border border-dashed border-border/50 bg-muted/20 p-8 text-center">
            <BarChart3 className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">暫無即時指數數據</p>
            <p className="text-xs text-muted-foreground/60 mt-1">請檢查網路連線或稍後再試</p>
          </motion.div>
        ) : null}

        {/* 市場統計卡片 */}
        {hasRealData && (
          <motion.div
            variants={itemVariants}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <MetricCard
              title="市場廣度"
              value={`${data.summary.marketBreadth.advancers}/${data.summary.marketBreadth.decliners}`}
              badge={`比率 ${data.summary.marketBreadth.ratio.toFixed(2)}`}
              icon={Gauge}
              status={data.summary.marketBreadth.ratio > 1 ? 'bullish' : 'bearish'}
              index={4}
            />
            <MetricCard
              title="多頭訊號"
              value={data.summary.bullishSignals}
              icon={TrendingUp}
              status="bullish"
              badge="今日"
              index={5}
            />
            <MetricCard
              title="空頭訊號"
              value={data.summary.bearishSignals}
              icon={TrendingDown}
              status="bearish"
              badge="今日"
              index={6}
            />
            <MetricCard
              title="假突破警示"
              value={data.summary.falseBreakoutAlerts}
              icon={AlertTriangle}
              status="neutral"
              badge="需關注"
              index={7}
            />
          </motion.div>
        )}

        {/* 主要內容區 */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 左側：主圖表 */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {/* 主指數圖表 */}
            {spIndex && (
              <IndexChart
                title="S&P 500 指數"
                symbol={spIndex.symbol}
                currentPrice={spIndex.value}
                change={spIndex.change}
                changePercent={spIndex.changePercent}
              />
            )}

            {/* 產業熱力圖 */}
            {data.sectorHeatmap.length > 0 && (
              <SectorHeatmap data={data.sectorHeatmap} />
            )}
          </motion.div>

          {/* 右側：訊號動態與風險監控 */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* 訊號動態 */}
            {data.signalFeed.length > 0 && (
              <SignalFeed data={data.signalFeed} />
            )}

            {/* 假突破風險表 */}
            {data.falseBreakoutRisks.length > 0 && (
              <FalseBreakoutTable data={data.falseBreakoutRisks} />
            )}
          </motion.div>
        </div>

        {/* 底部裝飾 */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-4 py-6 text-muted-foreground/20"
        >
          <Hexagon className="h-5 w-5 text-emerald-500/20" />
          <div className="flex items-center gap-3">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <Sparkles className="h-4 w-4 text-cyan-500/40" />
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          </div>
          <Hexagon className="h-5 w-5 text-violet-500/20" />
        </motion.div>
      </motion.div>
    </>
  )
}
