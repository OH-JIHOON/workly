/**
 * 통합 네비게이션 시스템 타입 정의
 */

import { ComponentType } from 'react'

// 레이아웃 타입
export type NavigationLayout = 'desktop' | 'mobile'

// 네비게이션 아이템 타입
export interface NavigationItem {
  id: string
  name: string
  href: string
  icon: ComponentType<{ className?: string }>
  activeIcon: ComponentType<{ className?: string }>
  isCenter?: boolean  // 중심 항목 표시
  isModal?: boolean   // 모달로 열기
}

// 브랜드 컴포넌트 Props
export interface BrandHeaderProps {
  layout: NavigationLayout
  className?: string
}

// 순수 네비게이션 컴포넌트 Props
export interface PureNavigationProps {
  layout: NavigationLayout
  items: readonly NavigationItem[]
  currentPath: string
  onItemClick?: (item: NavigationItem) => void
  onModalOpen?: (modalType: string) => void
  className?: string
}

// 유틸리티 메뉴 컴포넌트 Props
export interface UtilityMenuProps {
  layout: NavigationLayout
  onSearchClick?: () => void
  onMenuItemClick?: (action: string) => void
  isAuthenticated?: boolean
  className?: string
}

// 통합 레이아웃 컴포넌트 Props
export interface UnifiedLayoutProps {
  children: React.ReactNode
  layout?: NavigationLayout // auto-detect if not provided
  hideNavigation?: boolean   // 인증 페이지 등에서 사용
}

// 유틸리티 메뉴 섹션
export interface UtilityMenuSection {
  title: string
  items: UtilityMenuItem[]
}

export interface UtilityMenuItem {
  label: string
  action: string
  icon?: ComponentType<{ className?: string }>
  danger?: boolean  // 위험한 액션 (로그아웃 등)
}

// 검색 드롭다운 Props
export interface SearchDropdownProps {
  isOpen: boolean
  onClose: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onQuickActionClick: (action: string) => void
}

// 햄버거 메뉴 Props
export interface HamburgerMenuProps {
  isOpen: boolean
  onClose: () => void
  onMenuItemClick: (action: string) => void
  isAuthenticated: boolean
}