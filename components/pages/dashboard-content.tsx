'use client'

/**
 * 儀表板內容元件
 * 包含市場概覽、指標卡片、圖表與訊號動態
 * 明亮清爽專業風格設計，增加AIGC裝飾元素和AI生成圖片
 */

import { useMemo } from 'react'
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
  Globe,
  Flame,
  Clock,
  Eye,
  Shield,
  Rocket,
  Star,
  Radio,
} from 'lucide-react'
import { MetricCard, AIInsightCard } from '@/components/dashboard'
import { SectorHeatmap, SignalFeed, FalseBreakoutTable, IndexChart } from '@/components/charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  marketIndices,
  marketSummary,
  sectorHeatmapData,
  signalFeed,
  falseBreakoutRisks,
  aiAnalysis,
} from '@/lib/mock-data'
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
      ease: [0.25, 0.1, 0.25, 1],
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

/** 市場情緒卡片 */
function MarketSentimentCard() {
  return (
    <Card className="glass-card border-border/30 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]">
        <Image
          src="/images/ai-data-flow.jpg"
          alt=""
          fill
          className="object-cover"
        />
      </div>
      <CardHeader className="relative pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
              <Gauge className="h-4 w-4 text-emerald-500" />
            </div>
            <span>市場情緒指數</span>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
            偏多
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {/* 情緒儀表 */}
        <div className="relative h-4 rounded-full bg-gradient-to-r from-rose-500/20 via-amber-500/20 to-emerald-500/20 overflow-hidden">
          <div 
            className="absolute top-0 h-full w-1.5 bg-white shadow-lg rounded-full transition-all"
            style={{ left: '72%' }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span className="text-rose-500">極度恐懼</span>
          <span className="text-amber-500">中性</span>
          <span className="text-emerald-500">極度貪婪</span>
        </div>
        
        {/* 分項指標 */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { 標籤: '波動率指數', 值: 'VIX 15.2', 顏色: 'text-emerald-500', 狀態: 'low' },
            { 標籤: '看漲比例', 值: '68.5%', 顏色: 'text-emerald-500', 狀態: 'high' },
            { 標籤: '融資餘額', 值: '+2.3%', 顏色: 'text-cyan-500', 狀態: 'up' },
            { 標籤: '期權PC比', 值: '0.85', 顏色: 'text-amber-500', 狀態: 'neutral' },
          ].map((item) => (
            <div key={item.標籤} className="flex items-center justify-between rounded-lg bg-muted/30 p-2">
              <span className="text-[10px] text-muted-foreground">{item.標籤}</span>
              <span className={cn('text-xs font-semibold', item.顏色)}>{item.值}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/** 即時資訊速報卡片 */
function LiveNewsCard() {
  const newsItems = [
    { time: '10:32', title: '聯準會會議紀要釋放鴿派信號', type: 'positive', icon: Globe },
    { time: '09:45', title: '蘋果新品發布會將於下週舉行', type: 'neutral', icon: Flame },
    { time: '09:12', title: '科技股盤前普遍上漲', type: 'positive', icon: TrendingUp },
    { time: '08:30', title: '非農就業數據好於預期', type: 'positive', icon: BarChart3 },
  ]
  
  return (
    <Card className="glass-card border-border/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20">
              <Radio className="h-4 w-4 text-violet-500" />
            </div>
            <span>即時資訊速報</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            即時更新
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {newsItems.map((item, idx) => {
          const Icon = item.icon
          return (
            <div key={idx} className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/30">
              <div className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg',
                item.type === 'positive' ? 'bg-emerald-500/15 text-emerald-500' :
                item.type === 'negative' ? 'bg-rose-500/15 text-rose-500' :
                'bg-muted text-muted-foreground'
              )}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium line-clamp-1">{item.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{item.time}</span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export function DashboardContent() {
  // 取得主要指數數據
  const spIndex = useMemo(
    () => marketIndices.find((i) => i.symbol === 'SPX'),
    []
  )

  return (
    <>
      <AIGCDecorativeBackground />
      
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
        <motion.div
          variants={itemVariants}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {marketIndices.map((index, i) => (
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

        {/* 市場統計卡片 */}
        <motion.div
          variants={itemVariants}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <MetricCard
            title="市場廣度"
            value={`${marketSummary.marketBreadth.advancers}/${marketSummary.marketBreadth.decliners}`}
            badge={`比率 ${marketSummary.marketBreadth.ratio.toFixed(2)}`}
            icon={Gauge}
            status={marketSummary.marketBreadth.ratio > 1 ? 'bullish' : 'bearish'}
            index={4}
          />
          <MetricCard
            title="多頭訊號"
            value={marketSummary.bullishSignals}
            icon={TrendingUp}
            status="bullish"
            badge="今日"
            index={5}
          />
          <MetricCard
            title="空頭訊號"
            value={marketSummary.bearishSignals}
            icon={TrendingDown}
            status="bearish"
            badge="今日"
            index={6}
          />
          <MetricCard
            title="假突破警示"
            value={marketSummary.falseBreakoutAlerts}
            icon={AlertTriangle}
            status="neutral"
            badge="需關注"
            index={7}
          />
        </motion.div>

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
            <SectorHeatmap data={sectorHeatmapData} />
          </motion.div>

          {/* 右側：訊號動態與風險監控 */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* 市場情緒卡片 */}
            <MarketSentimentCard />
            
            {/* 即時資訊速報 */}
            <LiveNewsCard />

            {/* 訊號動態 */}
            <SignalFeed data={signalFeed} />

            {/* 假突破風險表 */}
            <FalseBreakoutTable data={falseBreakoutRisks} />
          </motion.div>
        </div>

        {/* AI 市場簡報 */}
        <motion.div variants={itemVariants}>
          <AIInsightCard analysis={aiAnalysis} compact />
        </motion.div>

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
