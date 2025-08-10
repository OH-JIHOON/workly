'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDownIcon, Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { isAuthenticated, logout, getCurrentUser } from '@/lib/auth'

interface FilterOption {
  key: string
  label: string
  count?: number
}

interface HeaderProps {
  title: string
  showDropdown?: boolean
  dropdownItems?: string[]
  onDropdownItemClick?: (item: string) => void
  // 새로운 필터 시스템 props
  filterOptions?: FilterOption[]
  activeFilter?: string
  onFilterChange?: (filter: string) => void
  showMobileFilters?: boolean
  // 검색 기능 props
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export default function Header({ 
  title, 
  showDropdown = false, 
  dropdownItems = [],
  onDropdownItemClick,
  filterOptions = [],
  activeFilter = '',
  onFilterChange,
  showMobileFilters = false,
  searchQuery = '',
  onSearchChange
}: HeaderProps) {
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const searchDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
    setUser(getCurrentUser() as any)
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

  const handleBoardClick = (section?: string) => {
    if (section) {
      router.push(`/board?section=${encodeURIComponent(section)}`)
    } else {
      router.push('/board')
    }
    setIsMobileMenuOpen(false)
  }

  const handleDesktopSearchClick = () => {
    setIsSearchDropdownOpen(!isSearchDropdownOpen)
  }

  const handleMobileSearchClick = () => {
    router.push('/search')
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
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 필터 시스템이 있을 때 헤더 높이 조정
  const headerHeight = showMobileFilters ? 'min-h-[60px]' : 'h-[60px]'
  
  return (
    <header 
      className={`sticky top-0 ${headerHeight} bg-background z-40 w-full`}
      role="banner"
    >
      {/* 720px 제약된 헤더 콘텐츠 */}
      <div className="w-full max-w-[720px] mx-auto h-[60px] flex items-center px-6 md:px-0 relative">
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
                className="absolute top-full left-0 mt-2 bg-card border border-border rounded-xl shadow-lg min-w-48 py-2 z-50"
                role="menu"
                aria-label="메뉴 옵션"
              >
                {/* 게시판 섹션 */}
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                  게시판
                </div>
                <button 
                  onClick={() => handleBoardClick()}
                  className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent cursor-pointer transition-colors"
                  role="menuitem"
                >
                  전체 게시판
                </button>
                <button 
                  onClick={() => handleBoardClick('임무 게시판')}
                  className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent cursor-pointer transition-colors"
                  role="menuitem"
                >
                  임무 게시판
                </button>
                <button 
                  onClick={() => handleBoardClick('지식 위키')}
                  className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent cursor-pointer transition-colors"
                  role="menuitem"
                >
                  지식 위키
                </button>
                <button 
                  onClick={() => handleBoardClick('프로젝트 쇼케이스')}
                  className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent cursor-pointer transition-colors"
                  role="menuitem"
                >
                  프로젝트 쇼케이스
                </button>
                
                {/* 구분선 */}
                <div className="border-t border-border my-2"></div>
                
                {/* 계정 섹션 */}
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  계정
                </div>
                <button 
                  onClick={handleSettingsClick}
                  className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent cursor-pointer transition-colors"
                  role="menuitem"
                >
                  설정
                </button>
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
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors relative"
                    role="menuitem"
                  >
                    <span className="flex items-center">
                      로그인
                      <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 로고 */}
          <div className="flex items-center justify-center w-8 h-8 font-bold text-xl text-foreground">
            W
          </div>

          {/* 검색 아이콘 (우측) */}
          <button
            onClick={handleMobileSearchClick}
            className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="검색"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            <span className="sr-only">검색</span>
          </button>
        </div>

        {/* 데스크톱 레이아웃 */}
        <div className="hidden md:flex w-full items-center">
          {/* 왼쪽: 검색 아이콘 */}
          <div className="relative" ref={searchDropdownRef}>
            <button
              onClick={handleDesktopSearchClick}
              className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="검색"
              aria-expanded={isSearchDropdownOpen}
              aria-haspopup="true"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              <span className="sr-only">검색</span>
            </button>
            
            {/* 검색 드롭다운 */}
            {isSearchDropdownOpen && (
              <div 
                className="absolute top-full left-0 mt-2 bg-card border border-border rounded-xl shadow-lg w-80 py-3 px-4 z-50"
                role="menu"
                aria-label="검색"
              >
                <div className="mb-3">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="업무, 프로젝트, 게시글 통합검색..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-2">빠른 검색</div>
                <div className="space-y-1">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                    📋 내 업무
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                    🚀 진행 중 프로젝트
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                    📝 최근 게시글
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 중앙: 타이틀 */}
          <div className="flex-1 flex items-center justify-center">
            <h1 className="workly-page-title">{title}</h1>
          </div>

          {/* 오른쪽: 빈 공간 */}
          <div className="flex items-center">
            {/* 로그인 버튼은 헤더 바깥(각 페이지)에 배치 */}
          </div>
        </div>
      </div>
    </header>
  )
}