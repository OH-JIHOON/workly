'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  Squares2X2Icon,
  FolderIcon,
  InboxIcon,
  FlagIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { 
  Squares2X2Icon as Squares2X2IconSolid,
  FolderIcon as FolderIconSolid,
  InboxIcon as InboxIconSolid,
  FlagIcon as FlagIconSolid,
  UserIcon as UserIconSolid 
} from '@heroicons/react/24/solid'
import { isAuthenticated } from '@/lib/auth'

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

export default function MobileNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
  }, [])

  const handleLoginClick = () => {
    router.push('/auth/login')
  }

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-card border-t border-border z-50"
      role="navigation"
      aria-label="워클리 모바일 네비게이션"
    >
      <div className="flex justify-between items-center h-full px-6">
        {navigationItems.map((item, index) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = isActive ? item.activeIcon : item.icon
          
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-center flex-1 h-full transition-colors relative ${
                isActive 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-6 h-6" />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}