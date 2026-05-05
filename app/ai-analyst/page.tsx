import { Metadata } from "next"
import { MainLayout } from "@/components/layout"
import { AIAnalystContent } from "@/components/pages/ai-analyst-content"

/**
 * AI 分析師頁面
 * 提供 AI 驅動的市場分析和投資建議
 */
export const metadata: Metadata = {
  title: "AI 分析師 | 金融市場情報量化儀表板",
  description: "AI 驅動的智慧市場分析，提供個股診斷、市場解讀、投資建議等功能",
}

export default function AIAnalystPage() {
  return (
    <MainLayout>
      <AIAnalystContent />
    </MainLayout>
  )
}
