import { Metadata } from "next"
import { MainLayout } from "@/components/layout"
import { WatchlistContent } from "@/components/pages/watchlist-content"

/**
 * 自選股頁面
 * 管理使用者的自選股清單
 */
export const metadata: Metadata = {
  title: "自選股 | 金融市場情報量化儀表板",
  description: "管理您的自選股清單，即時追蹤關注標的的價格變動和訊號提醒",
}

export default function WatchlistPage() {
  return (
    <MainLayout>
      <WatchlistContent />
    </MainLayout>
  )
}
