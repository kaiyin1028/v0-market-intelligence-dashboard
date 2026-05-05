import { Metadata } from "next"
import { MainLayout } from "@/components/layout"
import { BacktestContent } from "@/components/pages/backtest-content"

/**
 * 回測頁面
 * 提供策略回測和績效分析功能
 */
export const metadata: Metadata = {
  title: "策略回測 | 金融市場情報量化儀表板",
  description: "量化策略回測工具，支援多種技術指標組合，提供詳細的績效分析報告",
}

export default function BacktestPage() {
  return (
    <MainLayout>
      <BacktestContent />
    </MainLayout>
  )
}
