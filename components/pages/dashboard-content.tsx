'use client'

/**
 * 儀表板內容元件
 * 包含市場概覽、指標卡片、圖表與訊號動態
 * 明亮清爽專業風格設計，增加AIGC裝飾元素
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
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
} from 'lucide-react'
import { MetricCard, AIInsightCard } from '@/components/dashboard'
import { SectorHeatmap, SignalFeed, FalseBreakoutTable, IndexChart } from '@/components/charts'
import {
  marketIndices,
  marketSummary,
  sectorHeatmapData,
  signalFeed,
  falseBreakoutRisks,
  aiAnalysis,
} from '@/lib/mock-data'

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

/** AIGC 裝飾背景元件 */
function AIGCDecorativeBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* 漸層球體裝飾 */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-10 w-80 h-80 bg-gradient-to-tr from-accent/5 to-primary/5 rounded-full blur-3xl" />
      
      {/* 神經網路線條圖案 */}
      <svg className="absolute top-0 left-0 w-full h-full opacity-[0.015]" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="dashboardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        {/* 連接曲線 */}
        <path d="M0,200 Q300,100 600,200 T1200,200" stroke="url(#dashboardGradient)" strokeWidth="2" fill="none" />
        <path d="M0,400 Q400,300 800,400 T1200,400" stroke="url(#dashboardGradient)" strokeWidth="2" fill="none" />
        <path d="M0,600 Q200,500 500,600 T1200,600" stroke="url(#dashboardGradient)" strokeWidth="2" fill="none" />
        {/* 節點 */}
        <circle cx="150" cy="180" r="6" fill="hsl(var(--primary))" />
        <circle cx="450" cy="220" r="8" fill="hsl(var(--accent))" />
        <circle cx="750" cy="190" r="5" fill="hsl(var(--primary))" />
        <circle cx="300" cy="380" r="7" fill="hsl(var(--accent))" />
        <circle cx="600" cy="420" r="6" fill="hsl(var(--primary))" />
        <circle cx="900" cy="390" r="8" fill="hsl(var(--accent))" />
      </svg>
    </div>
  )
}

/** 頁面標題區元件 */
function PageHeader() {
  return (
    <div className="relative">
      {/* 標題裝飾背景 */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-primary to-accent rounded-full" />
      
      <div className="space-y-2 pl-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            市場情報量化儀表板
          </h1>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20">
            <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
            <span className="text-xs font-semibold text-accent">AI 驅動</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground lg:text-base">
            多維度技術分析、量價分析、籌碼分析與AI智能解讀
          </p>
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground/50">
            <Network className="h-4 w-4" />
            <div className="w-px h-4 bg-border" />
            <Cpu className="h-4 w-4" />
            <div className="w-px h-4 bg-border" />
            <CircuitBoard className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  )
}

/** 快捷功能卡片 */
function QuickActionCard({ 
  icon: Icon, 
  title, 
  description, 
  accent = false 
}: { 
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  accent?: boolean 
}) {
  return (
    <div className={`
      group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer
      ${accent 
        ? 'bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10' 
        : 'bg-card/80 border-border/50 hover:border-primary/30 hover:shadow-md hover:bg-card'
      }
    `}>
      {/* 裝飾角標 */}
      {accent && (
        <div className="absolute -top-1 -right-1">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent shadow-lg shadow-accent/30">
            <Zap className="h-3 w-3 text-white" />
          </div>
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className={`
          flex items-center justify-center w-10 h-10 rounded-xl transition-colors
          ${accent 
            ? 'bg-primary/15 text-primary group-hover:bg-primary/20' 
            : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
          }
        `}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
    </div>
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
          />
          <QuickActionCard 
            icon={Target} 
            title="突破掃描" 
            description="偵測交易機會"
          />
          <QuickActionCard 
            icon={Layers} 
            title="量價分析" 
            description="籌碼結構洞察"
          />
          <QuickActionCard 
            icon={LineChart} 
            title="技術指標" 
            description="多維度技術面"
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
          className="flex items-center justify-center gap-4 py-4 text-muted-foreground/20"
        >
          <Hexagon className="h-5 w-5" />
          <div className="flex items-center gap-2">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <Sparkles className="h-4 w-4 text-accent/30" />
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
          <Hexagon className="h-5 w-5" />
        </motion.div>
      </motion.div>
    </>
  )
}
