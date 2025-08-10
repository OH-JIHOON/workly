'use client'

import { HamburgerMenuProps } from '@/types/unified-navigation.types'
import { UTILITY_CONFIG } from '@/constants/navigation'

/**
 * 햄버거 메뉴 드롭다운 컴포넌트
 * 게시판, 설정, 로그인/로그아웃 등 유틸리티 메뉴
 */
export default function HamburgerMenu({
  isOpen,
  onClose,
  onMenuItemClick,
  isAuthenticated
}: HamburgerMenuProps) {
  
  if (!isOpen) return null
  
  // 데스크톱용: 좌측 사이드바에서 우측으로 열림 (SSR 호환)
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768
  const positionClasses = isDesktop 
    ? "absolute left-full bottom-0 ml-2"
    : "absolute top-full left-0 mt-2"
  
  return (
    <div 
      className={`${positionClasses} bg-card border border-border rounded-xl shadow-lg min-w-48 py-2 z-50`}
      role="menu"
      aria-label="메뉴 옵션"
    >
      {/* 게시판 섹션 */}
      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
        게시판
      </div>
      
      {UTILITY_CONFIG.menu.sections[0].items.map((item) => (
        <button
          key={item.action}
          onClick={() => onMenuItemClick(item.action)}
          className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent cursor-pointer transition-colors"
          role="menuitem"
        >
          {item.label}
        </button>
      ))}
      
      {/* 구분선 */}
      <div className="border-t border-border my-2" />
      
      {/* 계정 섹션 */}
      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        계정
      </div>
      
      <button
        onClick={() => onMenuItemClick('settings')}
        className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent cursor-pointer transition-colors"
        role="menuitem"
      >
        설정
      </button>
      
      {/* 로그인/로그아웃 버튼 */}
      {isAuthenticated ? (
        <button
          onClick={() => onMenuItemClick('auth')}
          className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent cursor-pointer transition-colors"
          role="menuitem"
        >
          로그아웃
        </button>
      ) : (
        <button
          onClick={() => onMenuItemClick('auth')}
          className="w-full text-left px-4 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors relative"
          role="menuitem"
        >
          <span className="flex items-center">
            로그인
            <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          </span>
        </button>
      )}
    </div>
  )
}