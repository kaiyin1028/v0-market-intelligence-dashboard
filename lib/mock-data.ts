/**
 * 金融市場情報量化儀表板 - 模擬數據
 * Market Intelligence Quant Dashboard - Mock Data
 * 
 * 此檔案包含所有頁面所需的模擬數據
 * 未來可替換為真實API數據
 */

import type {
  MarketIndex,
  MarketSummary,
  Stock,
  TechnicalIndicators,
  VolumeProfile,
  ChipDistribution,
  BreakoutAnalysis,
  SignalData,
  AIAnalysis,
  TradeSignal,
  BreakoutScanResult,
  BacktestResult,
  WatchlistItem,
  PortfolioRisk,
  CandlestickData,
  ChartMarker,
  SignalType,
} from '@/types'

// ============================================
// 市場指數數據
// ============================================

/** 生成隨機走勢圖數據 */
const generateSparkline = (base: number, volatility: number, points: number = 20): number[] => {
  const data: number[] = [base]
  for (let i = 1; i < points; i++) {
    const change = (Math.random() - 0.5) * volatility
    data.push(data[i - 1] + change)
  }
  return data
}

/** 主要市場指數 */
export const marketIndices: MarketIndex[] = [
  {
    symbol: 'SPX',
    name: 'S&P 500',
    value: 5234.18,
    change: 45.23,
    changePercent: 0.87,
    sparklineData: generateSparkline(5200, 20),
    status: 'bullish',
  },
  {
    symbol: 'NDX',
    name: '那斯達克',
    value: 18456.72,
    change: 156.89,
    changePercent: 0.86,
    sparklineData: generateSparkline(18300, 100),
    status: 'bullish',
  },
  {
    symbol: 'DJI',
    name: '道瓊工業',
    value: 39127.14,
    change: -89.56,
    changePercent: -0.23,
    sparklineData: generateSparkline(39200, 150),
    status: 'bearish',
  },
  {
    symbol: 'VIX',
    name: '恐慌指數',
    value: 14.23,
    change: -0.45,
    changePercent: -3.07,
    sparklineData: generateSparkline(14.5, 0.5),
    status: 'neutral',
  },
]

/** 市場摘要統計 */
export const marketSummary: MarketSummary = {
  bullishSignals: 127,
  bearishSignals: 43,
  falseBreakoutAlerts: 12,
  marketBreadth: {
    advancers: 312,
    decliners: 186,
    unchanged: 23,
    ratio: 1.68,
  },
}

// ============================================
// 股票分析數據
// ============================================

/** 預設股票 - AAPL */
export const defaultStock: Stock = {
  ticker: 'AAPL',
  name: '蘋果公司',
  price: 189.84,
  change: 2.45,
  changePercent: 1.31,
  volume: 52345678,
  marketCap: 2.95e12,
  sector: '科技',
}

/** AAPL 技術指標 */
export const defaultIndicators: TechnicalIndicators = {
  rsi: 58.7,
  macd: {
    value: 2.34,
    signal: 1.89,
    histogram: 0.45,
  },
  adx: 28.5,
  atr: 3.24,
  obv: 1234567890,
  cmf: 0.15,
  bollingerBands: {
    upper: 195.50,
    middle: 187.20,
    lower: 178.90,
  },
  movingAverages: {
    ma20: 186.45,
    ma60: 182.30,
    ma200: 175.80,
  },
  vwap: 188.92,
}

/** 量價分布數據 */
export const volumeProfileData: VolumeProfile[] = Array.from({ length: 20 }, (_, i) => {
  const priceLevel = 175 + i * 1.5
  const baseVolume = Math.random() * 5000000 + 1000000
  const buyRatio = Math.random()
  return {
    priceLevel,
    volume: baseVolume,
    buyVolume: baseVolume * buyRatio,
    sellVolume: baseVolume * (1 - buyRatio),
  }
})

/** 籌碼分布數據 */
export const chipDistribution: ChipDistribution = {
  poc: 187.50,
  vah: 192.30,
  val: 183.20,
  hvn: [187.50, 185.00, 190.00],
  lvn: [188.50, 184.00],
  chipPressure: 35,
  upperTrappedChips: 22.5,
  lowerSupportDensity: 67.8,
}

/** 突破分析數據 */
export const breakoutAnalysis: BreakoutAnalysis = {
  breakoutLevel: 192.50,
  trueBreakoutScore: 72,
  falseBreakoutRisk: 28,
  volumeRatio: 1.85,
  closeStrength: 78,
  obvConfirmation: true,
  rsiDivergence: false,
  upperChipPressure: 35,
}

/** 買賣訊號數據 */
export const signalData: SignalData = {
  buyScore: 68,
  sellScore: 32,
  entryZone: {
    low: 186.50,
    high: 189.00,
  },
  stopLoss: 182.00,
  targets: [195.00, 200.00, 208.00],
  riskRewardRatio: 2.8,
}

/** AI分析結果 */
export const aiAnalysis: AIAnalysis = {
  summary: 'AAPL 目前呈現穩健的多頭格局，技術面與籌碼面均顯示正向訊號。RSI 維持在中性偏多區間，MACD 柱狀圖持續擴張，顯示動能增強。量價結構良好，POC 位於當前價格下方提供支撐。建議關注192.50突破時機，若突破伴隨放量，則有望挑戰200整數關卡。',
  trendView: 'bullish',
  bullishReasons: [
    'MACD 金叉且柱狀圖擴張，動能增強',
    '價格站穩所有主要均線之上',
    '量價配合良好，OBV 持續上升',
    '籌碼結構健康，下方支撐密度高',
  ],
  bearishRisks: [
    '接近前高壓力區，短期可能震盪',
    'RSI 接近超買區域，需注意回檔風險',
    '美股大盤或恆生指數若轉弱可能拖累個股表現',
  ],
  keyLevels: {
    support: [186.50, 183.20, 180.00],
    resistance: [192.50, 195.00, 200.00],
  },
  confidence: 75,
}

// ============================================
// K線圖數據
// ============================================

/** 生成模擬K線數據 */
export const generateCandlestickData = (days: number = 60): CandlestickData[] => {
  const data: CandlestickData[] = []
  let currentPrice = 180

  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    const volatility = Math.random() * 4 + 1
    const trend = Math.random() > 0.45 ? 1 : -1
    
    const open = currentPrice
    const close = currentPrice + (Math.random() * volatility * trend)
    const high = Math.max(open, close) + Math.random() * volatility * 0.5
    const low = Math.min(open, close) - Math.random() * volatility * 0.5
    const volume = Math.floor(Math.random() * 50000000 + 20000000)

    data.push({
      date: date.toISOString().split('T')[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    })

    currentPrice = close
  }

  return data
}

/** 圖表買賣標記 */
export const chartMarkers: ChartMarker[] = [
  { date: '2024-01-15', type: 'buy', price: 182.50, label: '均線多頭排列買入' },
  { date: '2024-02-08', type: 'sell', price: 195.20, label: '達目標價減碼' },
  { date: '2024-02-28', type: 'buy', price: 185.30, label: 'VWAP支撐買入' },
]

// ============================================
// 訊號中心數據
// ============================================

/** 交易訊號列表 */
export const tradeSignals: TradeSignal[] = [
  {
    id: '1',
    ticker: 'NVDA',
    name: '輝達',
    signalType: 'strong-buy',
    timeframe: '1D',
    score: 92,
    entryPrice: 875.50,
    stopLoss: 840.00,
    target: 950.00,
    riskRewardRatio: 2.1,
    reason: 'AI晶片需求強勁，突破歷史新高',
    aiExplanation: '量價齊揚，籌碼結構健康，多頭動能強勁，建議積極布局。',
    createdAt: new Date('2024-03-15T09:30:00'),
  },
  {
    id: '2',
    ticker: 'MSFT',
    name: '微軟',
    signalType: 'buy',
    timeframe: '1D',
    score: 78,
    entryPrice: 425.20,
    stopLoss: 410.00,
    target: 455.00,
    riskRewardRatio: 1.96,
    reason: '雲端業務持續成長，技術面轉多',
    aiExplanation: 'MACD金叉確認，均線多頭排列，建議分批進場。',
    createdAt: new Date('2024-03-15T10:15:00'),
  },
  {
    id: '3',
    ticker: 'GOOGL',
    name: 'Alphabet',
    signalType: 'watch',
    timeframe: '1W',
    score: 55,
    entryPrice: 152.30,
    stopLoss: 145.00,
    target: 165.00,
    riskRewardRatio: 1.74,
    reason: 'AI搜尋競爭加劇，等待明確方向',
    aiExplanation: '價格在區間整理，等待突破方向確認後再行動。',
    createdAt: new Date('2024-03-15T11:00:00'),
  },
  {
    id: '4',
    ticker: 'TSLA',
    name: '特斯拉',
    signalType: 'reduce',
    timeframe: '1D',
    score: 35,
    entryPrice: 175.80,
    stopLoss: 168.00,
    target: 155.00,
    riskRewardRatio: -2.67,
    reason: '銷量數據不如預期，籌碼鬆動',
    aiExplanation: '跌破重要支撐，建議減碼觀望，等待止穩訊號。',
    createdAt: new Date('2024-03-15T11:30:00'),
  },
  {
    id: '5',
    ticker: 'META',
    name: 'Meta',
    signalType: 'buy',
    timeframe: '1D',
    score: 82,
    entryPrice: 505.40,
    stopLoss: 485.00,
    target: 550.00,
    riskRewardRatio: 2.19,
    reason: 'Reality Labs虧損收窄，廣告業務復甦',
    aiExplanation: '站穩500整數關卡，量能配合良好，多頭格局明確。',
    createdAt: new Date('2024-03-15T12:00:00'),
  },
  {
    id: '6',
    ticker: 'AMD',
    name: '超微',
    signalType: 'strong-buy',
    timeframe: '1D',
    score: 88,
    entryPrice: 178.90,
    stopLoss: 168.00,
    target: 210.00,
    riskRewardRatio: 2.85,
    reason: 'AI晶片市占率提升，營收展望上調',
    aiExplanation: '突破頸線壓力，OBV創新高，籌碼集中度上升。',
    createdAt: new Date('2024-03-15T13:00:00'),
  },
  {
    id: '7',
    ticker: 'INTC',
    name: '英特爾',
    signalType: 'sell',
    timeframe: '1W',
    score: 22,
    entryPrice: 42.50,
    stopLoss: 45.00,
    target: 35.00,
    riskRewardRatio: -3.0,
    reason: '製程落後競爭對手，市占率流失',
    aiExplanation: '跌破年線支撐，MACD死叉，建議離場觀望。',
    createdAt: new Date('2024-03-15T14:00:00'),
  },
  {
    id: '8',
    ticker: 'AMZN',
    name: '亞馬遜',
    signalType: 'buy',
    timeframe: '1D',
    score: 75,
    entryPrice: 178.50,
    stopLoss: 170.00,
    target: 195.00,
    riskRewardRatio: 1.94,
    reason: 'AWS成長加速，零售業務改善',
    aiExplanation: '突破盤整區間，量價配合，短線看多。',
    createdAt: new Date('2024-03-15T14:30:00'),
  },
]

// ============================================
// 突破掃描器數據
// ============================================

/** 突破掃描結果 */
export const breakoutScanResults: BreakoutScanResult[] = [
  {
    id: '1',
    ticker: 'NVDA',
    name: '輝達',
    price: 878.35,
    breakoutLevel: 875.00,
    volumeRatio: 2.45,
    closeStrength: 92,
    obvConfirmation: true,
    rsiState: 'overbought',
    macdState: 'bullish',
    chipPressure: 15,
    falseBreakoutRisk: 12,
    signal: 'strong-buy',
    sector: '科技',
  },
  {
    id: '2',
    ticker: 'AMD',
    name: '超微',
    price: 180.25,
    breakoutLevel: 178.00,
    volumeRatio: 1.95,
    closeStrength: 85,
    obvConfirmation: true,
    rsiState: 'neutral',
    macdState: 'bullish',
    chipPressure: 22,
    falseBreakoutRisk: 18,
    signal: 'strong-buy',
    sector: '科技',
  },
  {
    id: '3',
    ticker: 'AAPL',
    name: '蘋果公司',
    price: 189.84,
    breakoutLevel: 188.50,
    volumeRatio: 1.35,
    closeStrength: 68,
    obvConfirmation: true,
    rsiState: 'neutral',
    macdState: 'bullish',
    chipPressure: 35,
    falseBreakoutRisk: 32,
    signal: 'buy',
    sector: '科技',
  },
  {
    id: '4',
    ticker: 'META',
    name: 'Meta',
    price: 508.90,
    breakoutLevel: 505.00,
    volumeRatio: 1.68,
    closeStrength: 78,
    obvConfirmation: true,
    rsiState: 'neutral',
    macdState: 'bullish',
    chipPressure: 28,
    falseBreakoutRisk: 25,
    signal: 'buy',
    sector: '科技',
  },
  {
    id: '5',
    ticker: 'TSLA',
    name: '特斯拉',
    price: 176.25,
    breakoutLevel: 180.00,
    volumeRatio: 0.85,
    closeStrength: 35,
    obvConfirmation: false,
    rsiState: 'oversold',
    macdState: 'bearish',
    chipPressure: 72,
    falseBreakoutRisk: 78,
    signal: 'sell',
    sector: '消費非必需品',
  },
  {
    id: '6',
    ticker: 'JPM',
    name: '摩根大通',
    price: 198.45,
    breakoutLevel: 195.00,
    volumeRatio: 1.42,
    closeStrength: 72,
    obvConfirmation: true,
    rsiState: 'neutral',
    macdState: 'bullish',
    chipPressure: 30,
    falseBreakoutRisk: 28,
    signal: 'buy',
    sector: '金融',
  },
  {
    id: '7',
    ticker: 'XOM',
    name: '埃克森美孚',
    price: 118.75,
    breakoutLevel: 120.00,
    volumeRatio: 0.95,
    closeStrength: 45,
    obvConfirmation: false,
    rsiState: 'neutral',
    macdState: 'neutral',
    chipPressure: 55,
    falseBreakoutRisk: 58,
    signal: 'watch',
    sector: '能源',
  },
  {
    id: '8',
    ticker: 'UNH',
    name: '聯合健康',
    price: 512.30,
    breakoutLevel: 508.00,
    volumeRatio: 1.28,
    closeStrength: 65,
    obvConfirmation: true,
    rsiState: 'neutral',
    macdState: 'bullish',
    chipPressure: 38,
    falseBreakoutRisk: 35,
    signal: 'buy',
    sector: '醫療保健',
  },
]

// ============================================
// 回測結果數據
// ============================================

/** 模擬回測結果 */
export const backtestResult: BacktestResult = {
  totalReturn: 45.8,
  annualizedReturn: 28.5,
  maxDrawdown: -12.3,
  winRate: 62.5,
  profitFactor: 1.85,
  sharpeRatio: 1.42,
  sortinoRatio: 2.15,
  calmarRatio: 2.32,
  numberOfTrades: 156,
  avgHoldingPeriod: 8.5,
  equityCurve: Array.from({ length: 252 }, (_, i) => ({
    date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
    value: 100000 * (1 + (i / 252) * 0.458 + Math.random() * 0.05 - 0.025),
  })),
  drawdownCurve: Array.from({ length: 252 }, (_, i) => ({
    date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
    value: -Math.random() * 12,
  })),
  monthlyReturns: [
    { month: '一月', return: 5.2 },
    { month: '二月', return: 3.8 },
    { month: '三月', return: -2.1 },
    { month: '四月', return: 4.5 },
    { month: '五月', return: 6.2 },
    { month: '六月', return: -1.5 },
    { month: '七月', return: 3.2 },
    { month: '八月', return: 7.8 },
    { month: '九月', return: -3.2 },
    { month: '十月', return: 5.5 },
    { month: '十一月', return: 8.2 },
    { month: '十二月', return: 4.1 },
  ],
  tradeDistribution: [
    { range: '-10% 以下', count: 5 },
    { range: '-10% ~ -5%', count: 12 },
    { range: '-5% ~ 0%', count: 42 },
    { range: '0% ~ 5%', count: 48 },
    { range: '5% ~ 10%', count: 35 },
    { range: '10% 以上', count: 14 },
  ],
}

// ============================================
// 觀察清單數據
// ============================================

/** 觀察清單 */
export const watchlist: WatchlistItem[] = [
  {
    id: '1',
    ticker: 'NVDA',
    name: '輝達',
    price: 878.35,
    change: 25.60,
    changePercent: 3.0,
    signalBadge: 'strong-buy',
    breakoutRisk: 12,
    volumeAnomaly: true,
    sector: '科技',
    addedAt: new Date('2024-03-01'),
  },
  {
    id: '2',
    ticker: 'AAPL',
    name: '蘋果公司',
    price: 189.84,
    change: 2.45,
    changePercent: 1.31,
    signalBadge: 'buy',
    breakoutRisk: 32,
    volumeAnomaly: false,
    sector: '科技',
    addedAt: new Date('2024-02-15'),
  },
  {
    id: '3',
    ticker: 'MSFT',
    name: '微軟',
    price: 425.22,
    change: 5.18,
    changePercent: 1.23,
    signalBadge: 'buy',
    breakoutRisk: 25,
    volumeAnomaly: false,
    sector: '科技',
    addedAt: new Date('2024-02-20'),
  },
  {
    id: '4',
    ticker: 'TSLA',
    name: '特斯拉',
    price: 176.25,
    change: -8.50,
    changePercent: -4.6,
    signalBadge: 'reduce',
    breakoutRisk: 78,
    volumeAnomaly: true,
    sector: '消費非必需品',
    addedAt: new Date('2024-01-10'),
  },
  {
    id: '5',
    ticker: 'AMD',
    name: '超微',
    price: 180.25,
    change: 6.75,
    changePercent: 3.89,
    signalBadge: 'strong-buy',
    breakoutRisk: 18,
    volumeAnomaly: true,
    sector: '科技',
    addedAt: new Date('2024-03-10'),
  },
]

// ============================================
// 投資組合風險數據
// ============================================

/** 投資組合風險數據 */
export const portfolioRisk: PortfolioRisk = {
  totalValue: 1250000,
  totalGainLoss: 185000,
  totalGainLossPercent: 17.4,
  sectorExposure: [
    { sector: '科技', weight: 45 },
    { sector: '金融', weight: 18 },
    { sector: '醫療保健', weight: 15 },
    { sector: '消費非必需品', weight: 12 },
    { sector: '能源', weight: 10 },
  ],
  signalExposure: [
    { signal: 'strong-buy', weight: 35 },
    { signal: 'buy', weight: 40 },
    { signal: 'watch', weight: 15 },
    { signal: 'reduce', weight: 8 },
    { signal: 'sell', weight: 2 },
  ],
  drawdownRisk: 15.5,
  correlationMatrix: [
    [1.0, 0.85, 0.72, 0.45, 0.32],
    [0.85, 1.0, 0.68, 0.52, 0.28],
    [0.72, 0.68, 1.0, 0.38, 0.42],
    [0.45, 0.52, 0.38, 1.0, 0.55],
    [0.32, 0.28, 0.42, 0.55, 1.0],
  ],
  positions: [
    {
      ticker: 'NVDA',
      name: '輝達',
      shares: 150,
      avgCost: 750.00,
      currentPrice: 878.35,
      marketValue: 131752.50,
      gainLoss: 19252.50,
      gainLossPercent: 17.1,
      weight: 10.5,
      sector: '科技',
      riskContribution: 2.8,
    },
    {
      ticker: 'AAPL',
      name: '蘋果公司',
      shares: 500,
      avgCost: 165.00,
      currentPrice: 189.84,
      marketValue: 94920.00,
      gainLoss: 12420.00,
      gainLossPercent: 15.1,
      weight: 7.6,
      sector: '科技',
      riskContribution: 1.8,
    },
    {
      ticker: 'MSFT',
      name: '微軟',
      shares: 300,
      avgCost: 380.00,
      currentPrice: 425.22,
      marketValue: 127566.00,
      gainLoss: 13566.00,
      gainLossPercent: 11.9,
      weight: 10.2,
      sector: '科技',
      riskContribution: 2.2,
    },
    {
      ticker: 'JPM',
      name: '摩根大通',
      shares: 400,
      avgCost: 175.00,
      currentPrice: 198.45,
      marketValue: 79380.00,
      gainLoss: 9380.00,
      gainLossPercent: 13.4,
      weight: 6.4,
      sector: '金融',
      riskContribution: 1.5,
    },
    {
      ticker: 'UNH',
      name: '聯合健康',
      shares: 200,
      avgCost: 485.00,
      currentPrice: 512.30,
      marketValue: 102460.00,
      gainLoss: 5460.00,
      gainLossPercent: 5.6,
      weight: 8.2,
      sector: '醫療保健',
      riskContribution: 1.2,
    },
  ],
}

// ============================================
// 產業熱力圖數據
// ============================================

/** 產業熱力圖數據 */
export const sectorHeatmapData = [
  { sector: '科技', change: 1.85, stocks: 45 },
  { sector: '金融', change: 0.92, stocks: 38 },
  { sector: '醫療保健', change: -0.35, stocks: 42 },
  { sector: '消費非必需品', change: -1.25, stocks: 35 },
  { sector: '工業', change: 0.55, stocks: 32 },
  { sector: '能源', change: -0.78, stocks: 28 },
  { sector: '原物料', change: 0.42, stocks: 22 },
  { sector: '公用事業', change: 0.15, stocks: 18 },
  { sector: '房地產', change: -0.62, stocks: 25 },
  { sector: '通訊服務', change: 1.12, stocks: 20 },
  { sector: '消費必需品', change: 0.28, stocks: 30 },
]

// ============================================
// 訊號動態數據
// ============================================

/** 訊號動態列表 */
export const signalFeed = [
  { id: '1', ticker: 'NVDA', signal: 'strong-buy' as SignalType, message: '突破歷史新高，量價齊揚', time: '09:35' },
  { id: '2', ticker: 'AMD', signal: 'buy' as SignalType, message: 'MACD金叉確認，動能轉強', time: '09:42' },
  { id: '3', ticker: 'TSLA', signal: 'sell' as SignalType, message: '跌破關鍵支撐，籌碼鬆動', time: '10:15' },
  { id: '4', ticker: 'AAPL', signal: 'buy' as SignalType, message: 'VWAP支撐有效，短線看多', time: '10:28' },
  { id: '5', ticker: 'META', signal: 'buy' as SignalType, message: '站穩500整數關卡', time: '10:45' },
  { id: '6', ticker: 'GOOGL', signal: 'watch' as SignalType, message: '等待突破方向確認', time: '11:02' },
  { id: '7', ticker: 'MSFT', signal: 'buy' as SignalType, message: '均線多頭排列，趨勢向上', time: '11:18' },
  { id: '8', ticker: 'INTC', signal: 'sell' as SignalType, message: '跌破年線支撐', time: '11:35' },
]

/** 假突破風險表 */
export const falseBreakoutRisks = [
  { ticker: 'TSLA', risk: 78, level: '高', reason: '量能不足，籌碼壓力大' },
  { ticker: 'XOM', risk: 58, level: '中', reason: '收盤未能站穩突破位' },
  { ticker: 'BA', risk: 65, level: '中高', reason: 'RSI背離，OBV未確認' },
  { ticker: 'DIS', risk: 52, level: '中', reason: '上方套牢籌碼較多' },
  { ticker: 'NFLX', risk: 45, level: '中低', reason: '量價配合尚可，需觀察' },
]
