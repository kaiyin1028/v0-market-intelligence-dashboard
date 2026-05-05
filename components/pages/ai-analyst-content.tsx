"use client"

/**
 * AI 分析師內容元件
 * 提供 AI 驅動的市場分析對話介面
 */

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Brain,
  Send,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  MessageSquare,
  Lightbulb,
  BarChart3,
  Zap,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { ScoreGauge } from "@/components/dashboard/score-gauge"
import { SignalBadge } from "@/components/dashboard/signal-badge"

/** 對話訊息類型 */
interface 對話訊息 {
  id: string
  角色: "user" | "assistant"
  內容: string
  時間: string
  分析數據?: {
    股票代號?: string
    評分?: number
    訊號?: string
    風險?: string
  }
}

/** 預設對話 */
const 預設對話: 對話訊息[] = [
  {
    id: "1",
    角色: "assistant",
    內容: "您好！我是 AI 分析師助手，專精於台股技術分析、量價分析和籌碼分析。您可以詢問我關於個股診斷、市場趨勢、投資建議等問題。請問有什麼可以幫您的嗎？",
    時間: "09:00",
  },
]

/** 快速提問建議 */
const 快速提問 = [
  "分析台積電近期走勢",
  "今日有哪些值得關注的突破訊號？",
  "外資近期動向如何？",
  "推薦適合短線操作的標的",
  "分析大盤後市展望",
]

/** AI 市場觀點 */
const AI市場觀點 = [
  {
    標題: "半導體族群動能強勁",
    內容: "受惠於 AI 晶片需求持續成長，台積電、聯發科等半導體龍頭股表現亮眼。建議關注製程領先且具備 AI 佈局的個股。",
    標籤: ["半導體", "AI"],
    情緒: "正面",
  },
  {
    標題: "金融股進入除息旺季",
    內容: "金融股即將進入除息旺季，富邦金、國泰金等高殖利率個股值得留意。但需注意除息前後的價格波動風險。",
    標籤: ["金融", "除息"],
    情緒: "中性",
  },
  {
    標題: "傳產股面臨壓力",
    內容: "受到原物料價格下跌影響，部分傳產股營運展望轉弱。建議暫時避開鋼鐵、塑化等景氣循環類股。",
    標籤: ["傳產", "原物料"],
    情緒: "負面",
  },
]

/** AI 推薦標的 */
const AI推薦標的 = [
  { 代號: "2330", 名稱: "台積電", 評分: 88, 訊號: "買入", 理由: "技術面多頭排列，外資持續買超" },
  { 代號: "2454", 名稱: "聯發科", 評分: 75, 訊號: "觀望", 理由: "整理格局，等待突破訊號" },
  { 代號: "2881", 名稱: "富邦金", 評分: 82, 訊號: "買入", 理由: "殖利率具吸引力，法人買盤進場" },
  { 代號: "2317", 名稱: "鴻海", 評分: 78, 訊號: "買入", 理由: "AI 伺服器題材發酵，量能放大" },
]

export function AIAnalystContent() {
  // 對話狀態
  const [對話列表, set對話列表] = useState<對話訊息[]>(預設對話)
  const [輸入內容, set輸入內容] = useState("")
  const [是否載入中, set是否載入中] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 自動捲動到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [對話列表])

  /** 發送訊息 */
  const 發送訊息 = async (訊息內容: string) => {
    if (!訊息內容.trim()) return

    // 新增使用者訊息
    const 使用者訊息: 對話訊息 = {
      id: Date.now().toString(),
      角色: "user",
      內容: 訊息內容,
      時間: new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" }),
    }
    set對話列表((prev) => [...prev, 使用者訊息])
    set輸入內容("")
    set是否載入中(true)

    // 模擬 AI 回覆
    setTimeout(() => {
      const AI回覆 = 生成AI回覆(訊息內容)
      set對話列表((prev) => [...prev, AI回覆])
      set是否載入中(false)
    }, 1500)
  }

  /** 生成 AI 回覆 (模擬) */
  const 生成AI回覆 = (問題: string): 對話訊息 => {
    const 時間 = new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })

    if (問題.includes("台積電") || 問題.includes("2330")) {
      return {
        id: Date.now().toString(),
        角色: "assistant",
        內容: `## 台積電 (2330) 技術分析

**當前狀態**：多頭趨勢中，短期均線支撐明確

**技術面分析**：
- 目前股價站穩 5 日、10 日、20 日均線上方，呈現多頭排列
- MACD 指標呈現黃金交叉，動能轉強
- RSI 位於 65 附近，尚未進入超買區

**籌碼面分析**：
- 外資近五日累計買超 12,500 張，態度偏多
- 投信連續三日買超，法人同步看好
- 融資維持低檔，籌碼結構健康

**操作建議**：
建議於回檔至 880-885 元區間布局，停損設於 865 元以下，目標價看至 920-950 元。`,
        時間,
        分析數據: {
          股票代號: "2330",
          評分: 88,
          訊號: "買入",
          風險: "中",
        },
      }
    }

    if (問題.includes("突破") || 問題.includes("訊號")) {
      return {
        id: Date.now().toString(),
        角色: "assistant",
        內容: `## 今日重要突破訊號

**高信心度突破 (> 80%)**：
1. **2330 台積電** - 突破 890 元壓力位，量能配合良好
2. **2881 富邦金** - 爆量突破，外資大單進場
3. **2303 聯電** - 突破三角收斂上緣

**中信心度突破 (60-80%)**：
1. **2454 聯發科** - 突破頭肩底頸線
2. **2382 廣達** - MACD 金叉突破

**注意事項**：
- 量能是否持續放大是關鍵
- 建議設定停損，避免假突破風險
- 盤後觀察外資動向確認`,
        時間,
      }
    }

    if (問題.includes("大盤") || 問題.includes("後市")) {
      return {
        id: Date.now().toString(),
        角色: "assistant",
        內容: `## 大盤後市展望分析

**整體評估**：短多格局，但需留意上檔壓力

**技術面觀察**：
- 加權指數站穩月線，短線有支撐
- 量能尚可，但未明顯放大
- 上檔 21,500 點有套牢賣壓

**產業輪動**：
- 強勢：半導體、AI 伺服器、金融
- 弱勢：傳產、航運、鋼鐵

**操作策略**：
1. 維持 6-7 成持股水位
2. 聚焦法人買超的強勢股
3. 保留現金應對市場波動
4. 逢低佈局而非追高`,
        時間,
      }
    }

    // 預設回覆
    return {
      id: Date.now().toString(),
      角色: "assistant",
      內容: `感謝您的提問！

根據目前市場狀況，我建議您關注以下幾個面向：

1. **技術分析**：觀察均線排列和量價配合度
2. **籌碼分析**：追蹤三大法人動向
3. **風險控制**：設定明確的停損停利點

如需更詳細的個股分析，請提供具體的股票代號，我會為您進行深入診斷。`,
      時間,
    }
  }

  return (
    <div className="grid h-[calc(100vh-10rem)] gap-6 lg:grid-cols-3">
      {/* 左側：AI 對話區 */}
      <Card className="glass-card flex flex-col border-border/50 lg:col-span-2">
        <CardHeader className="border-b border-border/50 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-5 w-5 text-primary" />
            AI 智慧分析師
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="mr-1 h-3 w-3" />
              本地 AI
            </Badge>
          </CardTitle>
        </CardHeader>

        {/* 對話區域 */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {對話列表.map((訊息) => (
              <div
                key={訊息.id}
                className={`flex gap-3 ${
                  訊息.角色 === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="h-8 w-8">
                  {訊息.角色 === "assistant" ? (
                    <>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Brain className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback>U</AvatarFallback>
                  )}
                </Avatar>

                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    訊息.角色 === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{訊息.內容}</div>

                  {訊息.分析數據 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/20 pt-3">
                      {訊息.分析數據.評分 && (
                        <Badge variant="outline" className="gap-1">
                          <Target className="h-3 w-3" />
                          評分: {訊息.分析數據.評分}
                        </Badge>
                      )}
                      {訊息.分析數據.訊號 && (
                        <SignalBadge
                          signal={訊息.分析數據.訊號 as "買入" | "賣出" | "觀望"}
                          strength={訊息.分析數據.評分 || 70}
                        />
                      )}
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs opacity-60">{訊息.時間}</span>
                    {訊息.角色 === "assistant" && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {是否載入中 && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Brain className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 rounded-lg bg-muted p-4">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI 分析中...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* 快速提問 */}
        <div className="border-t border-border/50 p-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {快速提問.map((提問) => (
              <Button
                key={提問}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => 發送訊息(提問)}
              >
                {提問}
              </Button>
            ))}
          </div>

          {/* 輸入區域 */}
          <div className="flex gap-2">
            <Input
              placeholder="輸入您的問題..."
              value={輸入內容}
              onChange={(e) => set輸入內容(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  發送訊息(輸入內容)
                }
              }}
              disabled={是否載入中}
            />
            <Button
              onClick={() => 發送訊息(輸入內容)}
              disabled={是否載入中 || !輸入內容.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* 右側：AI 洞察面板 */}
      <div className="space-y-6">
        {/* AI 市場觀點 */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-primary" />
              AI 市場觀點
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {AI市場觀點.map((觀點, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border/50 p-3 transition-all hover:border-primary/50"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{觀點.標題}</span>
                  {觀點.情緒 === "正面" ? (
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  ) : 觀點.情緒 === "負面" ? (
                    <TrendingDown className="h-4 w-4 text-rose-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{觀點.內容}</p>
                <div className="mt-2 flex gap-1">
                  {觀點.標籤.map((標籤) => (
                    <Badge key={標籤} variant="secondary" className="text-xs">
                      {標籤}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI 推薦標的 */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-primary" />
              AI 推薦關注
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {AI推薦標的.map((標的) => (
              <div
                key={標的.代號}
                className="flex items-center justify-between rounded-lg border border-border/50 p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{標的.代號}</span>
                    <span className="text-sm text-muted-foreground">
                      {標的.名稱}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {標的.理由}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <ScoreGauge score={標的.評分} label="" size="xs" />
                  <SignalBadge
                    signal={標的.訊號 as "買入" | "賣出" | "觀望"}
                    strength={標的.評分}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
