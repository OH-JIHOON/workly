'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MagnifyingGlassIcon, 
  Bars3Icon 
} from '@heroicons/react/24/outline'
import { UtilityMenuProps } from '@/types/unified-navigation.types'
import { UTILITY_CONFIG } from '@/constants/navigation'
import { isAuthenticated, logout, getCurrentUser } from '@/lib/auth'
import SearchDropdown from './SearchDropdown'
import HamburgerMenu from './HamburgerMenu'

/**
 * 유틸리티 메뉴 컴포넌트
 * 검색, 더보기 메뉴 등 부가 기능만 담당하는 순수 컴포넌트
 * 
 * 위치:
 * - 데스크톱: 좌측 사이드바 하단
 * - 모바일: 헤더 좌우
 */
export default function UtilityMenu({ 
  layout, 
  onSearchClick,
  onMenuItemClick,
  isAuthenticated: authProp,
  className = '' 
}: UtilityMenuProps) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(authProp ?? false)
  const [user, setUser] = useState(null)
  
  // 검색 드롭다운 상태
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchDropdownRef = useRef<HTMLDivElement>(null)
  
  // 햄버거 메뉴 상태
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 인증 상태 확인
  useEffect(() => {
    if (authProp === undefined) {
      setIsLoggedIn(isAuthenticated())
      setUser(getCurrentUser() as any)
    }
  }, [authProp])

  // 바깥 클릭 시 메뉴 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false)
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 검색 핸들러
  const handleSearchClick = () => {
    if (layout === 'desktop') {
      setIsSearchDropdownOpen(!isSearchDropdownOpen)
    } else {
      router.push('/search')
    }
    onSearchClick?.()
  }

  // 메뉴 아이템 클릭 핸들러
  const handleMenuItemClick = async (action: string) => {
    setIsMenuOpen(false)
    
    switch (action) {
      case 'board':
        router.push('/board')
        break
      case 'board:mission':
        router.push('/board?section=임무 게시판')
        break
      case 'board:wiki':
        router.push('/board?section=지식 위키')
        break
      case 'board:showcase':
        router.push('/board?section=프로젝트 쇼케이스')
        break
      case 'settings':
        router.push('/settings')
        break
      case 'auth':
        if (isLoggedIn) {
          try {
            await logout()
            setIsLoggedIn(false)
            setUser(null)
            router.push('/auth/login')
          } catch (error) {
            console.error('로그아웃 오류:', error)
          }
        } else {
          router.push('/auth/login')
        }
        break
      default:
        onMenuItemClick?.(action)
    }
  }

  // 빠른 검색 액션 핸들러
  const handleQuickActionClick = (action: string) => {
    setIsSearchDropdownOpen(false)
    
    switch (action) {
      case 'my-tasks':
        router.push('/?filters=["all"]')
        break
      case 'active-projects':
        router.push('/projects')
        break
      case 'recent-posts':
        router.push('/board')
        break
    }
  }

  // 데스크톱 레이아웃
  if (layout === 'desktop') {
    return (
      <div className={`mb-5 relative ${className}`} ref={menuRef}>
        {/* 햄버거 메뉴 버튼 */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="nav-item w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent" 
          title="메뉴"
          aria-label="메뉴"
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          <Bars3Icon className="w-6 h-6" />
          <span className="sr-only">메뉴</span>
        </button>
        
        {/* 햄버거 드롭다운 메뉴 */}
        <HamburgerMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onMenuItemClick={handleMenuItemClick}
          isAuthenticated={isLoggedIn}
        />
      </div>
    )
  }
  
  // 모바일 레이아웃
  return (
    <div className={`flex items-center justify-between w-full ${className}`}>
      {/* 왼쪽: 햄버거 메뉴 */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="메뉴"
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          <Bars3Icon className="w-5 h-5" />
          <span className="sr-only">메뉴</span>
        </button>
        
        <HamburgerMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onMenuItemClick={handleMenuItemClick}
          isAuthenticated={isLoggedIn}
        />
      </div>

      {/* 오른쪽: 검색 아이콘 */}
      <button
        onClick={handleSearchClick}
        className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="검색"
      >
        <MagnifyingGlassIcon className="w-5 h-5" />
        <span className="sr-only">검색</span>
      </button>
    </div>
  )
}