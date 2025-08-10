/**
 * 통합 네비게이션 시스템 상수
 * 워클리 고유 방법론 - 3개 핵심 네비게이션 항목 (간소화)
 */

import { 
  Squares2X2Icon,
  FolderIcon,
  InboxIcon,
  FlagIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { 
  Squares2X2Icon as Squares2X2IconSolid,
  FolderIcon as FolderIconSolid,
  InboxIcon as InboxIconSolid,
  FlagIcon as FlagIconSolid,
  UserIcon as UserIconSolid 
} from '@heroicons/react/24/solid'

// 네비게이션 설정 상수
export const NAVIGATION_CONFIG = {
  DESKTOP_SIDEBAR_WIDTH: 76,
  MOBILE_HEADER_HEIGHT: 60,
  MOBILE_NAV_HEIGHT: 60,
  BRAND_POSITION: {
    desktop: 'sidebar-top',
    mobile: 'header-center'
  },
  UTILITY_POSITION: {
    desktop: 'sidebar-bottom',
    mobile: 'header-left'
  }
} as const

// 워클리 3개 핵심 네비게이션 항목 (간소화)
export const NAVIGATION_ITEMS = [
  { 
    id: 'tasks',
    name: 'Work', 
    href: '/', 
    icon: Squares2X2Icon, 
    activeIcon: Squares2X2IconSolid 
  },
  { 
    id: 'projects',
    name: 'Workspace', 
    href: '/projects', 
    icon: FolderIcon, 
    activeIcon: FolderIconSolid 
  },
  { 
    id: 'profile',
    name: 'Worker', 
    href: '/profile', 
    icon: UserIcon, 
    activeIcon: UserIconSolid 
  },
] as const

// 브랜드 설정
export const BRAND_CONFIG = {
  name: 'Workly',
  shortName: 'W',
  logo: {
    desktop: {
      showText: false,
      showIcon: true
    },
    mobile: {
      showText: false, 
      showIcon: true
    }
  }
} as const

// 유틸리티 메뉴 설정
export const UTILITY_CONFIG = {
  search: {
    enabled: true,
    placeholder: 'Work, Workspace, 게시글 통합검색...'
  },
  menu: {
    sections: [
      {
        title: '게시판',
        items: [
          { label: '전체 게시판', action: 'board' },
          { label: '임무 게시판', action: 'board:mission' },
          { label: '지식 위키', action: 'board:wiki' },
          { label: '프로젝트 쇼케이스', action: 'board:showcase' }
        ]
      },
      {
        title: '계정',
        items: [
          { label: '설정', action: 'settings' },
          { label: '로그인/로그아웃', action: 'auth' }
        ]
      }
    ]
  }
} as const