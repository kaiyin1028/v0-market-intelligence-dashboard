'use client'

/**
 * 儀表板內容元件
 * Dashboard Content Component
 * 
 * 包含市場概覽、指標卡片、圖表與訊號動態
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

// 動畫變體
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

export function DashboardContent() {
  // 取得主要指數數據
  const spIndex = useMemo(
    () => marketIndices.find((i) => i.symbol === 'SPX'),
    []
  )

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* 頁面標題區 */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          市場情報量化儀表板
        </h1>
        <p className="text-sm text-muted-foreground lg:text-base">
          多維度技術分析、量價分析、籌碼分析與AI智能解讀
        </p>
      </motion.div>

      {/* 關鍵指標卡片 */}
      <motion.div
        variants={itemVariants}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {marketIndices.map((index) => (
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
        />
        <MetricCard
          title="多頭訊號"
          value={marketSummary.bullishSignals}
          icon={TrendingUp}
          status="bullish"
          badge="今日"
        />
        <MetricCard
          title="空頭訊號"
          value={marketSummary.bearishSignals}
          icon={TrendingDown}
          status="bearish"
          badge="今日"
        />
        <MetricCard
          title="假突破警示"
          value={marketSummary.falseBreakoutAlerts}
          icon={AlertTriangle}
          status="neutral"
          badge="需關注"
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
    </motion.div>
  )
}
