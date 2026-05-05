'use client'

/**
 * 主佈局元件
 * Main Layout Component
 * 
 * 包含側邊欄、頂部導航與主內容區域
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SidebarNav } from './sidebar-nav'
import { TopBar } from './top-bar'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="relative min-h-screen bg-background neural-pattern">
      {/* 側邊欄 - 桌面版 */}
      <div className="hidden lg:block">
        <SidebarNav
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      </div>

      {/* 頂部導航 */}
      <TopBar sidebarCollapsed={sidebarCollapsed} />

      {/* 主內容區域 */}
      <main
        className={cn(
          'min-h-screen pt-16 transition-all duration-300',
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        )}
      >
        <div className="container mx-auto p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
