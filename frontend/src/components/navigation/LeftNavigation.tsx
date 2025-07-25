'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  FolderIcon, 
  ChatBubbleLeftRightIcon, 
  BellIcon, 
  UserIcon,
  EllipsisVerticalIcon 
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

  return (
    <nav className="fixed left-0 top-0 h-screen w-18 bg-background border-r border-border flex flex-col items-center py-5 z-50">
      {/* 로고 */}
      <div className="mb-10">
        <Link href="/" className="flex items-center justify-center w-8 h-8 font-bold text-xl text-foreground">
          W
        </Link>
      </div>

      {/* 메뉴 항목들 */}
      <div className="flex flex-col items-center gap-5 flex-1 justify-center">
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

      {/* 오버플로우 메뉴 */}
      <div className="mb-5">
        <button className="nav-item" title="더보기">
          <EllipsisVerticalIcon className="w-6 h-6" />
        </button>
      </div>
    </nav>
  )
}