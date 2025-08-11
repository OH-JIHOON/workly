'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Squares2X2Icon,
  FolderIcon,
  InboxIcon,
  FlagIcon,
  UserIcon,
  Bars3Icon 
} from '@heroicons/react/24/outline'
import { 
  Squares2X2Icon as Squares2X2IconSolid,
  FolderIcon as FolderIconSolid,
  InboxIcon as InboxIconSolid,
  FlagIcon as FlagIconSolid,
  UserIcon as UserIconSolid 
} from '@heroicons/react/24/solid'
import { isAuthenticated, logout } from '@/lib/auth'
// CPERModal 제거됨 (inbox 페이지 삭제)

// 워클리 고유 방법론 - 3개 핵심 네비게이션 항목 (간소화)
const navigationItems = [
  { 
    name: '업무', 
    href: '/', 
    icon: Squares2X2Icon, 
    activeIcon: Squares2X2IconSolid 
  },
  { 
    name: '프로젝트', 
    href: '/projects', 
    icon: FolderIcon, 
    activeIcon: FolderIconSolid 
  },
  { 
    name: '프로필', 
    href: '/profile', 
    icon: UserIcon, 
    activeIcon: UserIconSolid 
  },
]

export default function LeftNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  // inbox 모달 상태 제거됨
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
  }, [])

  const handleLoginClick = () => {
    router.push('/auth/login')
    setIsMenuOpen(false)
  }

  const handleLogoutClick = async () => {
    try {
      await logout()
      setIsLoggedIn(false)
      setIsMenuOpen(false)
      router.push('/auth/login')
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }

  const handleSettingsClick = () => {
    router.push('/settings')
    setIsMenuOpen(false)
  }

  const handleBoardClick = (section?: string) => {
    if (section) {
      router.push(`/board?section=${encodeURIComponent(section)}`)
    } else {
      router.push('/board')
    }
    setIsMenuOpen(false)
  }

  // inbox 클릭 핸들러 제거됨

  // inbox 모달 핸들러 제거됨

  // 바깥 클릭 시 메뉴 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav 
      className="hidden md:flex fixed left-0 top-0 h-screen w-[76px] bg-background border-r border-border flex-col items-center py-5 z-50"
      role="navigation"
      aria-label="워클리 메인 네비게이션"
    >
      {/* 로고 */}
      <div className="mb-10">
        <Link 
          href="/" 
          className="flex items-center justify-center w-8 h-8 font-bold text-xl text-foreground"
          aria-label="워클리 홈으로 이동"
        >
          W
        </Link>
      </div>

      {/* 메뉴 항목들 */}
      <div className="flex flex-col items-center gap-2 flex-1 justify-center">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = isActive ? item.activeIcon : item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
              title={item.name}
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-6 h-6" />
              <span className="sr-only">{item.name}</span>
            </Link>
          )
        })}
      </div>

      {/* 햄버거 메뉴 */}
      <div className="mb-5 relative" ref={menuRef}>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="nav-item" 
          title="메뉴"
          aria-label="메뉴"
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          <Bars3Icon className="w-6 h-6" />
          <span className="sr-only">메뉴</span>
        </button>
        
        {isMenuOpen && (
          <div 
            className="absolute left-full bottom-0 ml-2 bg-card border border-border rounded-xl shadow-lg min-w-48 py-2 z-50"
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
                className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent cursor-pointer transition-colors"
                role="menuitem"
              >
                로그인
              </button>
            )}
          </div>
        )}
      </div>

      {/* CPER 수집함 모달 제거됨 (inbox 페이지 삭제) */}
    </nav>
  )
}