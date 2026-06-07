"use client"

/**
 * 自選股內容元件
 * 顯示和管理使用者的自選股清單
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Star,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Trash2,
  Bell,
  BarChart3,
  SortAsc,
  SortDesc,
  Folder,
} from "lucide-react"
import { SignalBadge } from "@/components/dashboard/signal-badge"
import { Sparkline } from "@/components/dashboard/sparkline"

/** 自選股資料結構 */
interface 自選股 {
  代號: string
  名稱: string
  現價: number
  漲跌: number
  漲跌幅: number
  成交量: number
  評分: number
  訊號: "買入" | "賣出" | "觀望"
  分類: string
  走勢: number[]
  提醒: boolean
}

/** 模擬自選股資料 */
const 模擬自選股: 自選股[] = [
  {
    代號: "AAPL",
    名稱: "Apple",
    現價: 232.5,
    漲跌: 3.2,
    漲跌幅: 1.39,
    成交量: 45892000,
    評分: 88,
    訊號: "買入",
    分類: "科技",
    走勢: [225, 228, 226, 230, 229, 231, 232.5],
    提醒: true,
  },
  {
    代號: "NVDA",
    名稱: "NVIDIA",
    現價: 138.5,
    漲跌: 4.2,
    漲跌幅: 3.12,
    成交量: 285600000,
    評分: 92,
    訊號: "買入",
    分類: "半導體",
    走勢: [130, 132, 131, 135, 134, 136, 138.5],
    提醒: true,
  },
  {
    代號: "0700.HK",
    名稱: "騰訊控股",
    現價: 385.0,
    漲跌: 5.0,
    漲跌幅: 1.32,
    成交量: 18562000,
    評分: 78,
    訊號: "觀望",
    分類: "科技",
    走勢: [378, 380, 379, 382, 381, 383, 385],
    提醒: false,
  },
  {
    代號: "TSLA",
    名稱: "Tesla",
    現價: 248.5,
    漲跌: -3.5,
    漲跌幅: -1.39,
    成交量: 95820000,
    評分: 72,
    訊號: "觀望",
    分類: "汽車",
    走勢: [255, 253, 252, 250, 251, 249, 248.5],
    提醒: true,
  },
  {
    代號: "MSFT",
    名稱: "Microsoft",
    現價: 438.0,
    漲跌: 2.8,
    漲跌幅: 0.64,
    成交量: 18500000,
    評分: 86,
    訊號: "買入",
    分類: "科技",
    走勢: [432, 434, 433, 436, 435, 437, 438],
    提醒: false,
  },
  {
    代號: "3690.HK",
    名稱: "美團",
    現價: 128.5,
    漲跌: 1.5,
    漲跌幅: 1.18,
    成交量: 25890000,
    評分: 82,
    訊號: "買入",
    分類: "本地生活",
    走勢: [124, 125, 125.5, 126, 127, 127.5, 128.5],
    提醒: false,
  },
  {
    代號: "GOOGL",
    名稱: "Alphabet",
    現價: 178.5,
    漲跌: 1.2,
    漲跌幅: 0.68,
    成交量: 18520000,
    評分: 84,
    訊號: "買入",
    分類: "科技",
    走勢: [175, 176, 175.5, 177, 176.5, 178, 178.5],
    提醒: false,
  },
]

/** 分類選項 */
const 分類選項 = ["全部", "半導體", "金融", "電子代工", "光學", "電信"]

export function WatchlistContent() {
  // 狀態
  const [搜尋關鍵字, set搜尋關鍵字] = useState("")
  const [選擇分類, set選擇分類] = useState("全部")
  const [排序欄位, set排序欄位] = useState<string | null>(null)
  const [排序方向, set排序方向] = useState<"asc" | "desc">("desc")

  // 篩選與排序
  let 篩選後資料 = 模擬自選股.filter((股票) => {
    const 符合搜尋 =
      股票.代號.includes(搜尋關鍵字) || 股票.名稱.includes(搜尋關鍵字)
    const 符合分類 = 選擇分類 === "全部" || 股票.分類 === 選擇分類
    return 符合搜尋 && 符合分類
  })

  if (排序欄位) {
    篩選後資料 = [...篩選後資料].sort((a, b) => {
      const aVal = a[排序欄位 as keyof 自選股]
      const bVal = b[排序欄位 as keyof 自選股]
      if (typeof aVal === "number" && typeof bVal === "number") {
        return 排序方向 === "asc" ? aVal - bVal : bVal - aVal
      }
      return 0
    })
  }

  /** 切換排序 */
  const 切換排序 = (欄位: string) => {
    if (排序欄位 === 欄位) {
      set排序方向(排序方向 === "asc" ? "desc" : "asc")
    } else {
      set排序欄位(欄位)
      set排序方向("desc")
    }
  }

  return (
    <div className="space-y-6">
      {/* 頂部統計 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">自選股數量</p>
                <p className="text-2xl font-bold">{模擬自選股.length}</p>
              </div>
              <Star className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">上漲</p>
                <p className="text-2xl font-bold text-emerald-500">
                  {模擬自選股.filter((s) => s.漲跌 > 0).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">下跌</p>
                <p className="text-2xl font-bold text-rose-500">
                  {模擬自選股.filter((s) => s.漲跌 < 0).length}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-rose-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">買入訊號</p>
                <p className="text-2xl font-bold text-cyan-500">
                  {模擬自選股.filter((s) => s.訊號 === "買入").length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-cyan-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜尋與篩選 */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜尋股票代號或名稱..."
                value={搜尋關鍵字}
                onChange={(e) => set搜尋關鍵字(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={選擇分類} onValueChange={set選擇分類}>
              <SelectTrigger className="w-32">
                <Folder className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {分類選項.map((分類) => (
                  <SelectItem key={分類} value={分類}>
                    {分類}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                新增自選股
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 自選股列表 */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12"></TableHead>
                <TableHead className="w-32">股票</TableHead>
                <TableHead
                  className="w-24 cursor-pointer text-right"
                  onClick={() => 切換排序("現價")}
                >
                  <div className="flex items-center justify-end gap-1">
                    現價
                    {排序欄位 === "現價" &&
                      (排序方向 === "asc" ? (
                        <SortAsc className="h-3 w-3" />
                      ) : (
                        <SortDesc className="h-3 w-3" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="w-24 cursor-pointer text-right"
                  onClick={() => 切換排序("漲跌幅")}
                >
                  <div className="flex items-center justify-end gap-1">
                    漲跌幅
                    {排序欄位 === "漲跌幅" &&
                      (排序方向 === "asc" ? (
                        <SortAsc className="h-3 w-3" />
                      ) : (
                        <SortDesc className="h-3 w-3" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="w-24 cursor-pointer text-right"
                  onClick={() => 切換排序("成交量")}
                >
                  <div className="flex items-center justify-end gap-1">
                    成交量
                    {排序欄位 === "成交量" &&
                      (排序方向 === "asc" ? (
                        <SortAsc className="h-3 w-3" />
                      ) : (
                        <SortDesc className="h-3 w-3" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="w-24">走勢</TableHead>
                <TableHead
                  className="w-20 cursor-pointer text-center"
                  onClick={() => 切換排序("評分")}
                >
                  <div className="flex items-center justify-center gap-1">
                    評分
                    {排序欄位 === "評分" &&
                      (排序方向 === "asc" ? (
                        <SortAsc className="h-3 w-3" />
                      ) : (
                        <SortDesc className="h-3 w-3" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="w-24">訊號</TableHead>
                <TableHead className="w-20">分類</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {篩選後資料.map((股票) => (
                <TableRow
                  key={股票.代號}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          股票.提醒
                            ? "fill-amber-500 text-amber-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-bold">{股票.代號}</div>
                      <div className="text-xs text-muted-foreground">
                        {股票.名稱}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {股票.現價.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className={
                        股票.漲跌 >= 0 ? "text-emerald-500" : "text-rose-500"
                      }
                    >
                      <div className="font-mono font-medium">
                        {股票.漲跌 >= 0 ? "+" : ""}
                        {股票.漲跌.toFixed(2)}
                      </div>
                      <div className="text-xs">
                        {股票.漲跌幅 >= 0 ? "+" : ""}
                        {股票.漲跌幅.toFixed(2)}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {(股票.成交量 / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell>
                    <Sparkline
                      data={股票.走勢}
                      status={股票.漲跌 >= 0 ? "bullish" : "bearish"}
                      height={32}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={
                        股票.評分 >= 80
                          ? "border-emerald-500/50 text-emerald-500"
                          : 股票.評分 >= 60
                            ? "border-amber-500/50 text-amber-500"
                            : "border-rose-500/50 text-rose-500"
                      }
                    >
                      {股票.評分}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <SignalBadge signal={股票.訊號 === "買入" ? "buy" : 股票.訊號 === "賣出" ? "sell" : "hold"} size="sm" />
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {股票.分類}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          查看分析
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Bell className="mr-2 h-4 w-4" />
                          設定提醒
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-500">
                          <Trash2 className="mr-2 h-4 w-4" />
                          移除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
