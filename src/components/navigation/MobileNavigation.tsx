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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-15 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = isActive ? item.activeIcon : item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-center w-11 h-11 transition-colors ${
                isActive 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-6 h-6" />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}