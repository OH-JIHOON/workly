'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  HomeIcon, 
  FolderIcon, 
  ChatBubbleLeftRightIcon, 
  BellIcon, 
  UserIcon,
  Bars3Icon 
} from '@heroicons/react/24/outline'
import { 
  HomeIcon as HomeIconSolid, 
  FolderIcon as FolderIconSolid, 
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid, 
  BellIcon as BellIconSolid, 
  UserIcon as UserIconSolid 
} from '@heroicons/react/24/solid'

const navigationItems = [
  { 
    name: '업무', 
    href: '/', 
    icon: HomeIcon, 
    activeIcon: HomeIconSolid 
  },
  { 
    name: '프로젝트', 
    href: '/projects', 
    icon: FolderIcon, 
    activeIcon: FolderIconSolid 
  },
  { 
    name: '게시판', 
    href: '/board', 
    icon: ChatBubbleLeftRightIcon, 
    activeIcon: ChatBubbleLeftRightIconSolid 
  },
  { 
    name: '활동', 
    href: '/activity', 
    icon: BellIcon, 
    activeIcon: BellIconSolid 
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
  const menuRef = useRef<HTMLDivElement>(null)

  const handleLoginClick = () => {
    router.push('/login')
    setIsMenuOpen(false)
  }

  const handleSettingsClick = () => {
    router.push('/settings')
    setIsMenuOpen(false)
  }

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
    <nav className="hidden md:flex fixed left-0 top-0 h-screen w-[76px] bg-background border-r border-border flex-col items-center py-5 z-50">
      {/* 로고 */}
      <div className="mb-10">
        <Link href="/" className="flex items-center justify-center w-8 h-8 font-bold text-xl text-foreground">
          W
        </Link>
      </div>

      {/* 메뉴 항목들 */}
      <div className="flex flex-col items-center gap-2 flex-1 justify-center">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = isActive ? item.activeIcon : item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
              title={item.name}
            >
              <Icon className="w-6 h-6" />
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
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        
        {isMenuOpen && (
          <div className="absolute left-full bottom-0 ml-2 bg-card border border-border rounded-xl shadow-lg min-w-36 py-2 z-50">
            <div 
              onClick={handleLoginClick}
              className="px-4 py-3 text-sm text-foreground hover:bg-accent cursor-pointer transition-colors"
            >
              로그인
            </div>
            <div 
              onClick={handleSettingsClick}
              className="px-4 py-3 text-sm text-foreground hover:bg-accent cursor-pointer transition-colors"
            >
              설정
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}