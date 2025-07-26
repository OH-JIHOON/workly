'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  FolderIcon, 
  ChatBubbleLeftRightIcon, 
  BellIcon, 
  UserIcon 
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

export default function MobileNavigation() {
  const pathname = usePathname()

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-card border-t border-border z-50"
      role="navigation"
      aria-label="모바일 네비게이션"
    >
      <div className="flex justify-between items-center h-full px-6">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = isActive ? item.activeIcon : item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-center flex-1 h-full transition-colors ${
                isActive 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-6 h-6" />
              <span className="sr-only">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}