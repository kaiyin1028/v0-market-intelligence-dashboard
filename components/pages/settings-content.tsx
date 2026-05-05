"use client"

/**
 * 設定內容元件
 * 管理應用程式的各項偏好設定
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Settings,
  Bell,
  Palette,
  Database,
  Brain,
  Shield,
  Monitor,
  Save,
} from "lucide-react"

export function SettingsContent() {
  // 通知設定
  const [啟用通知, set啟用通知] = useState(true)
  const [突破通知, set突破通知] = useState(true)
  const [訊號通知, set訊號通知] = useState(true)
  const [每日報告, set每日報告] = useState(false)

  // 顯示設定
  const [主題, set主題] = useState("dark")
  const [語言, set語言] = useState("zh-TW")
  const [圖表風格, set圖表風格] = useState("modern")

  // AI 設定
  const [AI模型, setAI模型] = useState("gpt-4")
  const [分析深度, set分析深度] = useState([70])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">設定</h1>
        <p className="text-muted-foreground">管理您的應用程式偏好設定</p>
      </div>

      <Tabs defaultValue="通知" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="通知" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">通知</span>
          </TabsTrigger>
          <TabsTrigger value="顯示" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">顯示</span>
          </TabsTrigger>
          <TabsTrigger value="資料" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">資料</span>
          </TabsTrigger>
          <TabsTrigger value="AI" className="gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">AI</span>
          </TabsTrigger>
          <TabsTrigger value="安全" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">安全</span>
          </TabsTrigger>
        </TabsList>

        {/* 通知設定 */}
        <TabsContent value="通知" className="space-y-4">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4 text-primary" />
                通知設定
              </CardTitle>
              <CardDescription>管理您要接收的通知類型</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>啟用通知</Label>
                  <p className="text-sm text-muted-foreground">
                    接收所有類型的通知
                  </p>
                </div>
                <Switch checked={啟用通知} onCheckedChange={set啟用通知} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>突破訊號通知</Label>
                  <p className="text-sm text-muted-foreground">
                    當自選股出現突破訊號時通知
                  </p>
                </div>
                <Switch
                  checked={突破通知}
                  onCheckedChange={set突破通知}
                  disabled={!啟用通知}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>買賣訊號通知</Label>
                  <p className="text-sm text-muted-foreground">
                    當出現買入或賣出訊號時通知
                  </p>
                </div>
                <Switch
                  checked={訊號通知}
                  onCheckedChange={set訊號通知}
                  disabled={!啟用通知}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>每日市場報告</Label>
                  <p className="text-sm text-muted-foreground">
                    每日收盤後發送市場摘要
                  </p>
                </div>
                <Switch
                  checked={每日報告}
                  onCheckedChange={set每日報告}
                  disabled={!啟用通知}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 顯示設定 */}
        <TabsContent value="顯示" className="space-y-4">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4 text-primary" />
                顯示設定
              </CardTitle>
              <CardDescription>自訂介面外觀</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>主題</Label>
                <Select value={主題} onValueChange={set主題}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">淺色模式</SelectItem>
                    <SelectItem value="dark">深色模式</SelectItem>
                    <SelectItem value="system">跟隨系統</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>語言</Label>
                <Select value={語言} onValueChange={set語言}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-TW">繁體中文</SelectItem>
                    <SelectItem value="zh-CN">简体中文</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>圖表風格</Label>
                <Select value={圖表風格} onValueChange={set圖表風格}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">現代風格</SelectItem>
                    <SelectItem value="classic">經典風格</SelectItem>
                    <SelectItem value="minimal">極簡風格</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 資料設定 */}
        <TabsContent value="資料" className="space-y-4">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4 text-primary" />
                資料來源設定
              </CardTitle>
              <CardDescription>設定市場資料的來源和更新頻率</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>資料更新頻率</Label>
                <Select defaultValue="5">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">每 1 秒</SelectItem>
                    <SelectItem value="5">每 5 秒</SelectItem>
                    <SelectItem value="10">每 10 秒</SelectItem>
                    <SelectItem value="30">每 30 秒</SelectItem>
                    <SelectItem value="60">每 1 分鐘</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>歷史資料範圍</Label>
                <Select defaultValue="1y">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">近三個月</SelectItem>
                    <SelectItem value="6m">近半年</SelectItem>
                    <SelectItem value="1y">近一年</SelectItem>
                    <SelectItem value="3y">近三年</SelectItem>
                    <SelectItem value="5y">近五年</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>自動快取</Label>
                  <p className="text-sm text-muted-foreground">
                    快取資料以提升載入速度
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI 設定 */}
        <TabsContent value="AI" className="space-y-4">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-4 w-4 text-primary" />
                AI 分析設定
              </CardTitle>
              <CardDescription>設定 AI 分析師的偏好</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>AI 模型</Label>
                <Select value={AI模型} onValueChange={setAI模型}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4 (推薦)</SelectItem>
                    <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="local">本地模型</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>分析深度</Label>
                  <span className="text-sm text-muted-foreground">
                    {分析深度}%
                  </span>
                </div>
                <Slider
                  value={分析深度}
                  onValueChange={set分析深度}
                  min={30}
                  max={100}
                  step={10}
                />
                <p className="text-sm text-muted-foreground">
                  較高的分析深度會提供更詳細的分析，但可能需要較長的處理時間
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>自動分析</Label>
                  <p className="text-sm text-muted-foreground">
                    自動分析自選股的變化
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>API 金鑰</Label>
                <Input type="password" placeholder="輸入您的 OpenAI API 金鑰" />
                <p className="text-sm text-muted-foreground">
                  使用您自己的 API 金鑰可獲得更好的效能
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全設定 */}
        <TabsContent value="安全" className="space-y-4">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" />
                安全與隱私
              </CardTitle>
              <CardDescription>管理帳戶安全和隱私設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>雙重驗證</Label>
                  <p className="text-sm text-muted-foreground">
                    啟用雙重驗證以增強帳戶安全
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>登入通知</Label>
                  <p className="text-sm text-muted-foreground">
                    在新裝置登入時發送通知
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>資料分析</Label>
                  <p className="text-sm text-muted-foreground">
                    允許匿名使用資料以改善服務
                  </p>
                </div>
                <Switch />
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full">
                  變更密碼
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 儲存按鈕 */}
      <div className="flex justify-end">
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          儲存設定
        </Button>
      </div>
    </div>
  )
}
