import { Metadata } from "next"
import { MainLayout } from "@/components/layout"
import { SettingsContent } from "@/components/pages/settings-content"

/**
 * 設定頁面
 * 管理應用程式的各項設定
 */
export const metadata: Metadata = {
  title: "設定 | 金融市場情報量化儀表板",
  description: "管理應用程式設定，包含通知、顯示、資料來源等偏好設定",
}

export default function SettingsPage() {
  return (
    <MainLayout>
      <SettingsContent />
    </MainLayout>
  )
}
