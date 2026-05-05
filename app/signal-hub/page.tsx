import { Metadata } from "next"
import { MainLayout } from "@/components/layout"
import { SignalHubContent } from "@/components/pages/signal-hub-content"

/**
 * 訊號中心頁面
 * 整合所有交易訊號，提供統一的訊號管理介面
 */
export const metadata: Metadata = {
  title: "訊號中心 | 金融市場情報量化儀表板",
  description: "整合技術分析、量價分析、籌碼分析的交易訊號中心，提供即時買賣建議",
}

export default function SignalHubPage() {
  return (
    <MainLayout>
      <SignalHubContent />
    </MainLayout>
  )
}
