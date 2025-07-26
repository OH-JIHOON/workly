'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDownIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { isAuthenticated, logout, getCurrentUser } from '@/lib/auth'

interface HeaderProps {
  title: string
  showDropdown?: boolean
  dropdownItems?: string[]
  onDropdownItemClick?: (item: string) => void
}

export default function Header({ 
  title, 
  showDropdown = false, 
  dropdownItems = [],
  onDropdownItemClick
}: HeaderProps) {
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
    setUser(getCurrentUser())
  }, [])

  const handleLoginClick = () => {
    router.push('/auth/login')
  }

  const handleLogoutClick = async () => {
    try {
      await logout()
      setIsLoggedIn(false)
      setUser(null)
      setIsMobileMenuOpen(false)
      router.push('/auth/login')
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }

  const handleSettingsClick = () => {
    router.push('/settings')
    setIsMobileMenuOpen(false)
  }

  // 바깥 클릭 시 메뉴 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header 
      className="sticky top-0 h-[60px] bg-background flex items-center px-6 z-40"
      role="banner"
    >
      {/* 모바일 레이아웃 */}
      <div className="md:hidden w-full flex items-center justify-between">
        {/* 햄버거 메뉴 */}
        <div className="relative" ref={mobileMenuRef}>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="메뉴"
            aria-expanded={isMobileMenuOpen}
            aria-haspopup="true"
          >
            <Bars3Icon className="w-5 h-5" />
            <span className="sr-only">메뉴</span>
          </button>
          
          {isMobileMenuOpen && (
            <div 
              className="absolute top-full left-0 mt-2 bg-card border border-border rounded-xl shadow-lg min-w-36 py-2 z-50"
              role="menu"
              aria-label="메뉴 옵션"
            >
              {isLoggedIn ? (
                <button 
                  onClick={handleLogoutClick}
                  className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent cursor-pointer transition-colors"
                  role="menuitem"
                >
                  로그아웃
                </button>
              ) : (
                <button 
                  onClick={handleLoginClick}
                  className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent cursor-pointer transition-colors"
                  role="menuitem"
                >
                  로그인
                </button>
              )}
              <button 
                onClick={handleSettingsClick}
                className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent cursor-pointer transition-colors"
                role="menuitem"
              >
                설정
              </button>
            </div>
          )}
        </div>

        {/* 로고 */}
        <div className="flex items-center justify-center w-8 h-8 font-bold text-xl text-foreground">
          W
        </div>

        {/* 로그인/사용자 정보 */}
        {!isLoggedIn ? (
          <button 
            onClick={handleLoginClick}
            className="text-sm px-3 py-2 bg-foreground text-background rounded-xl font-medium transition-colors hover:opacity-90"
            aria-label="로그인 페이지로 이동"
          >
            로그인
          </button>
        ) : (
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <span className="text-xs font-medium">
              {user?.firstName?.[0] || 'U'}
            </span>
          </div>
        )}
      </div>

      {/* 데스크톱 레이아웃 */}
      <div className="hidden md:flex w-full items-center justify-center relative">
        {/* 타이틀 (중앙) */}
        <div className="flex items-center gap-2 relative" ref={dropdownRef}>
          <h1 className="text-base font-bold text-foreground">{title}</h1>
          
          {showDropdown && (
            <>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-center w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="드롭다운 메뉴"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                <ChevronDownIcon className="w-4 h-4" />
                <span className="sr-only">드롭다운 메뉴</span>
              </button>
              
              {isDropdownOpen && (
                <div 
                  className="absolute top-full right-0 mt-2 bg-card border border-border rounded-xl shadow-lg min-w-36 py-2 z-50"
                  role="menu"
                  aria-label="페이지 옵션"
                >
                  {dropdownItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onDropdownItemClick?.(item)
                        setIsDropdownOpen(false)
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent cursor-pointer transition-colors"
                      role="menuitem"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* 인증 버튼 (오른쪽) */}
        <div className="absolute right-0">
          {!isLoggedIn ? (
            <button 
              onClick={handleLoginClick}
              className="workly-button"
              aria-label="Google로 로그인하기"
            >
              Google로 시작하기
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {user?.firstName} {user?.lastName}
              </span>
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user?.firstName?.[0] || 'U'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}