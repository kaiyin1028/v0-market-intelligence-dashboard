/**
 * 股票分析頁面
 * Stock Analysis Page
 * 
 * 提供個股技術面、籌碼面、量價面深度分析
 */

import { MainLayout } from '@/components/layout'
import { StockAnalysisContent } from '@/components/pages/stock-analysis-content'

export const metadata = {
  title: '股票分析',
  description: '個股技術分析、籌碼分析與AI智能解讀',
}

export default function StockAnalysisPage() {
  return (
    <MainLayout>
      <StockAnalysisContent />
    </MainLayout>
  )
}
