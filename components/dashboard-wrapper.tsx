'use client'

import { useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import type { Profile } from '@/lib/types/database'

interface DashboardWrapperProps {
  profile: Profile
  children: React.ReactNode
}

export function DashboardWrapper({ profile, children }: DashboardWrapperProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="min-h-screen">
      <DashboardSidebar profile={profile} isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      <main className={
        isCollapsed 
          ? "lg:ml-16 min-h-screen pt-14 lg:pt-0 transition-all duration-300"
          : "lg:ml-64 min-h-screen pt-14 lg:pt-0 transition-all duration-300"
      }>
        <div className="p-1 sm:p-1 lg:p-0">
          {children}
        </div>
      </main>
    </div>
  )
}