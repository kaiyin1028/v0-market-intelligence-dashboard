/**
 * 市場情報量化儀表板 - 首頁
 * Market Intelligence Quant Dashboard - Home Page
 * 
 * 顯示市場概覽、關鍵指標、訊號動態與AI分析摘要
 */

import { MainLayout } from '@/components/layout'
import { DashboardContent } from '@/components/pages/dashboard-content'

export default function DashboardPage() {
  return (
    <MainLayout>
      <DashboardContent />
    </MainLayout>
  )
}
