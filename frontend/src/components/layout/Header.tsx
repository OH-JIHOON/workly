'use client'

import { useState } from 'react'
import { ChevronDownIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'

interface HeaderProps {
  title: string
  showDropdown?: boolean
  dropdownItems?: string[]
}

export default function Header({ 
  title, 
  showDropdown = false, 
  dropdownItems = [] 
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 h-15 bg-background border-b border-border flex items-center justify-center px-6 z-40">
      {/* 모바일용 로고 */}
      <div className="md:hidden absolute left-1/2 transform -translate-x-1/2">
        <div className="flex items-center justify-center w-8 h-8 font-bold text-xl text-foreground">
          W
        </div>
      </div>

      {/* 데스크톱용 타이틀 섹션 */}
      <div className="hidden md:flex items-center gap-2 relative">
        <h1 className="text-base font-bold text-foreground">{title}</h1>
        
        {showDropdown && (
          <>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-center w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-xl shadow-lg min-w-36 py-2 z-50">
                {dropdownItems.map((item, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 text-sm text-foreground hover:bg-accent cursor-pointer transition-colors"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 데스크톱용 인증 버튼 */}
      <div className="hidden md:flex absolute right-5 gap-3">
        <button className="workly-button-outline">Sign in</button>
        <button className="workly-button">Sign up</button>
      </div>

      {/* 모바일용 메뉴 버튼 */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden absolute right-0 flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
      >
        <EllipsisHorizontalIcon className="w-5 h-5" />
        
        {isMobileMenuOpen && (
          <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-xl shadow-lg min-w-36 py-2 z-50">
            <div className="px-4 py-3 text-sm text-foreground hover:bg-accent cursor-pointer transition-colors">
              Sign in
            </div>
            <div className="px-4 py-3 text-sm text-foreground hover:bg-accent cursor-pointer transition-colors">
              Sign up
            </div>
            <div className="px-4 py-3 text-sm text-foreground hover:bg-accent cursor-pointer transition-colors">
              Settings
            </div>
            <div className="px-4 py-3 text-sm text-foreground hover:bg-accent cursor-pointer transition-colors">
              Help
            </div>
          </div>
        )}
      </button>
    </header>
  )
}