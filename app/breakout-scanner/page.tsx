import { Metadata } from "next"
import { MainLayout } from "@/components/layout"
import { BreakoutScannerContent } from "@/components/pages/breakout-scanner-content"

/**
 * 突破掃描器頁面
 * 自動偵測價格突破、型態突破等交易機會
 */
export const metadata: Metadata = {
  title: "突破掃描器 | 金融市場情報量化儀表板",
  description: "自動掃描市場中的價格突破、型態突破和成交量異常，即時發現交易機會",
}

export default function BreakoutScannerPage() {
  return (
    <MainLayout>
      <BreakoutScannerContent />
    </MainLayout>
  )
}
