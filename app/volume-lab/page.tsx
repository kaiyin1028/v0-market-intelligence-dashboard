import { Metadata } from "next"
import { MainLayout } from "@/components/layout"
import { VolumeLabContent } from "@/components/pages/volume-lab-content"

/**
 * 量價實驗室頁面
 * 提供進階量價分析工具和視覺化圖表
 */
export const metadata: Metadata = {
  title: "量價實驗室 | 金融市場情報量化儀表板",
  description: "進階量價分析工具，包含量價分布、成交量異常偵測、主力成本分析等功能",
}

export default function VolumeLabPage() {
  return (
    <MainLayout>
      <VolumeLabContent />
    </MainLayout>
  )
}
