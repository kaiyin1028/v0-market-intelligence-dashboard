/**
 * 金融市場情報量化儀表板 - 類型定義
 * Market Intelligence Quant Dashboard - Type Definitions
 */

// ============================================
// 市場概覽相關類型
// ============================================

/** 市場指數資料 */
export interface MarketIndex {
  symbol: string           // 股票代碼
  name: string             // 名稱
  value: number            // 當前價值
  change: number           // 變動值
  changePercent: number    // 變動百分比
  sparklineData: number[]  // 走勢圖數據
  status: 'bullish' | 'bearish' | 'neutral'  // 多頭/空頭/中性狀態
}

/** 市場廣度指標 */
export interface MarketBreadth {
  advancers: number        // 上漲股票數
  decliners: number        // 下跌股票數
  unchanged: number        // 持平股票數
  ratio: number            // 漲跌比率
}

/** 市場摘要統計 */
export interface MarketSummary {
  bullishSignals: number   // 多頭訊號數量
  bearishSignals: number   // 空頭訊號數量
  falseBreakoutAlerts: number  // 假突破警示數量
  marketBreadth: MarketBreadth // 市場廣度
}

// ============================================
// 股票分析相關類型
// ============================================

/** 股票基本資料 */
export interface Stock {
  ticker: string           // 股票代碼
  name: string             // 公司名稱
  price: number            // 當前價格
  change: number           // 變動值
  changePercent: number    // 變動百分比
  volume: number           // 成交量
  marketCap: number        // 市值
  sector: string           // 產業類別
}

/** 技術指標數據 */
export interface TechnicalIndicators {
  rsi: number              // 相對強弱指標
  macd: {
    value: number          // MACD值
    signal: number         // 訊號線
    histogram: number      // 柱狀圖
  }
  adx: number              // 平均趨向指標
  atr: number              // 平均真實波幅
  obv: number              // 能量潮指標
  cmf: number              // 資金流量指標
  bollingerBands: {
    upper: number          // 上軌
    middle: number         // 中軌
    lower: number          // 下軌
  }
  movingAverages: {
    ma20: number           // 20日均線
    ma60: number           // 60日均線
    ma200: number          // 200日均線
  }
  vwap: number             // 成交量加權平均價
}

/** 量價分布數據 */
export interface VolumeProfile {
  priceLevel: number       // 價格水平
  volume: number           // 成交量
  buyVolume: number        // 買入量
  sellVolume: number       // 賣出量
}

/** 籌碼分析數據 */
export interface ChipDistribution {
  poc: number              // 成本密集區 (Point of Control)
  vah: number              // 價值區上緣 (Value Area High)
  val: number              // 價值區下緣 (Value Area Low)
  hvn: number[]            // 高成交量節點 (High Volume Nodes)
  lvn: number[]            // 低成交量節點 (Low Volume Nodes)
  chipPressure: number     // 籌碼壓力指數
  upperTrappedChips: number  // 上方套牢籌碼比例
  lowerSupportDensity: number // 下方支撐密度
}

/** 突破分析數據 */
export interface BreakoutAnalysis {
  breakoutLevel: number    // 突破價位
  trueBreakoutScore: number     // 真突破分數
  falseBreakoutRisk: number     // 假突破風險
  volumeRatio: number           // 成交量比率
  closeStrength: number         // 收盤強度
  obvConfirmation: boolean      // OBV確認
  rsiDivergence: boolean        // RSI背離
  upperChipPressure: number     // 上方籌碼壓力
}

/** 買賣訊號數據 */
export interface SignalData {
  buyScore: number         // 買入評分
  sellScore: number        // 賣出評分
  entryZone: {
    low: number            // 進場區間下緣
    high: number           // 進場區間上緣
  }
  stopLoss: number         // 停損價位
  targets: number[]        // 目標價位陣列
  riskRewardRatio: number  // 風險報酬比
}

// ============================================
// AI分析相關類型
// ============================================

/** AI分析師回應 */
export interface AIAnalysis {
  summary: string          // 摘要
  trendView: 'bullish' | 'bearish' | 'neutral'  // 趨勢觀點
  bullishReasons: string[] // 多頭理由
  bearishRisks: string[]   // 空頭風險
  keyLevels: {
    support: number[]      // 支撐位
    resistance: number[]   // 阻力位
  }
  confidence: number       // 信心度 (0-100)
}

/** AI對話訊息 */
export interface AIMessage {
  id: string               // 訊息ID
  role: 'user' | 'assistant'  // 角色
  content: string          // 內容
  timestamp: Date          // 時間戳記
  analysis?: AIAnalysis    // AI分析結果
}

// ============================================
// 訊號中心相關類型
// ============================================

/** 交易訊號 */
export interface TradeSignal {
  id: string               // 訊號ID
  ticker: string           // 股票代碼
  name: string             // 公司名稱
  signalType: SignalType   // 訊號類型
  timeframe: Timeframe     // 時間週期
  score: number            // 評分
  entryPrice: number       // 進場價格
  stopLoss: number         // 停損價位
  target: number           // 目標價位
  riskRewardRatio: number  // 風險報酬比
  reason: string           // 主要原因
  aiExplanation: string    // AI說明
  createdAt: Date          // 建立時間
}

/** 訊號類型 */
export type SignalType = 
  | 'strong-buy'   // 強力買入
  | 'buy'          // 買入
  | 'watch'        // 觀察
  | 'reduce'       // 減碼
  | 'sell'         // 賣出
  | 'short'        // 做空

/** 時間週期 */
export type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y'

// ============================================
// 突破掃描器相關類型
// ============================================

/** 突破掃描結果 */
export interface BreakoutScanResult {
  id: string               // ID
  ticker: string           // 股票代碼
  name: string             // 公司名稱
  price: number            // 當前價格
  breakoutLevel: number    // 突破價位
  volumeRatio: number      // 成交量比率
  closeStrength: number    // 收盤強度 (0-100)
  obvConfirmation: boolean // OBV確認
  rsiState: 'overbought' | 'oversold' | 'neutral'  // RSI狀態
  macdState: 'bullish' | 'bearish' | 'neutral'     // MACD狀態
  chipPressure: number     // 籌碼壓力 (0-100)
  falseBreakoutRisk: number  // 假突破風險 (0-100)
  signal: SignalType       // 訊號類型
  sector: string           // 產業類別
}

// ============================================
// 回測相關類型
// ============================================

/** 回測策略類型 */
export type StrategyType = 
  | 'breakout'         // 突破策略
  | 'ma-crossover'     // 均線交叉策略
  | 'rsi-reversal'     // RSI反轉策略
  | 'macd-trend'       // MACD趨勢策略
  | 'vwap-pullback'    // VWAP回測策略
  | 'volume-profile'   // 量價分布突破策略
  | 'multi-factor'     // 多因子複合策略

/** 回測參數 */
export interface BacktestParams {
  strategy: StrategyType   // 策略類型
  tickers: string[]        // 股票池
  startDate: Date          // 開始日期
  endDate: Date            // 結束日期
  initialCapital: number   // 初始資金
  parameters: Record<string, number>  // 策略參數
}

/** 回測結果 */
export interface BacktestResult {
  totalReturn: number       // 總報酬率
  annualizedReturn: number  // 年化報酬率
  maxDrawdown: number       // 最大回撤
  winRate: number           // 勝率
  profitFactor: number      // 獲利因子
  sharpeRatio: number       // 夏普比率
  sortinoRatio: number      // 索提諾比率
  calmarRatio: number       // 卡爾瑪比率
  numberOfTrades: number    // 交易次數
  avgHoldingPeriod: number  // 平均持有天數
  equityCurve: { date: string; value: number }[]  // 權益曲線
  drawdownCurve: { date: string; value: number }[] // 回撤曲線
  monthlyReturns: { month: string; return: number }[]  // 月度報酬
  tradeDistribution: { range: string; count: number }[] // 交易分布
}

// ============================================
// 觀察清單相關類型
// ============================================

/** 觀察清單項目 */
export interface WatchlistItem {
  id: string               // ID
  ticker: string           // 股票代碼
  name: string             // 公司名稱
  price: number            // 當前價格
  change: number           // 變動值
  changePercent: number    // 變動百分比
  signalBadge?: SignalType // 訊號標籤
  breakoutRisk: number     // 突破風險
  volumeAnomaly: boolean   // 成交量異常
  sector: string           // 產業類別
  addedAt: Date            // 加入時間
}

// ============================================
// 投資組合風險相關類型
// ============================================

/** 投資組合持倉 */
export interface PortfolioPosition {
  ticker: string           // 股票代碼
  name: string             // 公司名稱
  shares: number           // 持有股數
  avgCost: number          // 平均成本
  currentPrice: number     // 當前價格
  marketValue: number      // 市值
  gainLoss: number         // 損益
  gainLossPercent: number  // 損益百分比
  weight: number           // 權重
  sector: string           // 產業類別
  riskContribution: number // 風險貢獻度
}

/** 投資組合風險指標 */
export interface PortfolioRisk {
  totalValue: number       // 投資組合總值
  totalGainLoss: number    // 總損益
  totalGainLossPercent: number  // 總損益百分比
  sectorExposure: { sector: string; weight: number }[]  // 產業曝險
  signalExposure: { signal: SignalType; weight: number }[]  // 訊號曝險
  drawdownRisk: number     // 回撤風險
  correlationMatrix: number[][]  // 相關性矩陣
  positions: PortfolioPosition[]  // 持倉明細
}

// ============================================
// 設定相關類型
// ============================================

/** 系統設定 */
export interface Settings {
  theme: 'light' | 'dark' | 'system'  // 主題設定
  dataSource: string       // 數據來源
  ollamaEndpoint: string   // Ollama本地端點
  indicatorParams: {       // 指標參數
    rsiPeriod: number      // RSI週期
    macdFast: number       // MACD快線
    macdSlow: number       // MACD慢線
    macdSignal: number     // MACD訊號線
    adxPeriod: number      // ADX週期
    atrPeriod: number      // ATR週期
  }
  signalWeights: {         // 訊號權重
    technical: number      // 技術面權重
    volume: number         // 成交量權重
    chip: number           // 籌碼面權重
    ai: number             // AI權重
  }
  notifications: {         // 通知設定
    breakoutAlerts: boolean     // 突破警示
    signalAlerts: boolean       // 訊號警示
    volumeAlerts: boolean       // 成交量警示
    priceAlerts: boolean        // 價格警示
  }
}

// ============================================
// K線圖相關類型
// ============================================

/** K線數據 */
export interface CandlestickData {
  date: string             // 日期
  open: number             // 開盤價
  high: number             // 最高價
  low: number              // 最低價
  close: number            // 收盤價
  volume: number           // 成交量
}

/** 圖表標記 */
export interface ChartMarker {
  date: string             // 日期
  type: 'buy' | 'sell'     // 類型
  price: number            // 價格
  label: string            // 標籤
}

// ============================================
// 產業類別列表
// ============================================

export const SECTORS = [
  '科技',      // Technology
  '金融',      // Financial
  '醫療保健',  // Healthcare
  '消費必需品',// Consumer Staples
  '消費非必需品', // Consumer Discretionary
  '工業',      // Industrials
  '能源',      // Energy
  '原物料',    // Materials
  '公用事業',  // Utilities
  '房地產',    // Real Estate
  '通訊服務',  // Communication Services
] as const

export type Sector = typeof SECTORS[number]
