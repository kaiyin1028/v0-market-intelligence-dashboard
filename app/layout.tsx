/**
 * 金融市場情報量化儀表板 - 根佈局
 * Market Intelligence Quant Dashboard - Root Layout
 */

import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

// 字型設定
const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

// SEO 元數據
export const metadata: Metadata = {
  title: {
    default: '市場情報量化儀表板 | Market Intelligence Quant Dashboard',
    template: '%s | 市場情報量化儀表板',
  },
  description: '專業多維度金融市場分析平台 - 技術分析、量價分析、籌碼分析、突破偵測、買賣訊號、回測與AI智能解讀',
  keywords: [
    '股票分析',
    '技術分析',
    '量價分析',
    '籌碼分析',
    '突破偵測',
    '買賣訊號',
    '回測',
    'AI分析',
    '量化交易',
  ],
  authors: [{ name: 'Market Intelligence Team' }],
  generator: 'Next.js',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

// 視窗設定
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-TW"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
