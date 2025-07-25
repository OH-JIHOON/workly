'use client'

import { useState } from 'react'

interface MobileTabsProps {
  tabs: string[]
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export default function MobileTabs({ tabs, activeTab, onTabChange }: MobileTabsProps) {
  const [currentTab, setCurrentTab] = useState(activeTab || tabs[0])

  const handleTabClick = (tab: string) => {
    setCurrentTab(tab)
    onTabChange?.(tab)
  }

  return (
    <div className="md:hidden bg-background border-b border-border">
      <div className="flex w-full">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              currentTab === tab
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  )
}