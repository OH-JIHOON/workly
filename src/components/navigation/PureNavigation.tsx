'use client'

import Link from 'next/link'
import { PureNavigationProps } from '@/types/unified-navigation.types'

/**
 * 순수 네비게이션 컴포넌트
 * 5개 핵심 메뉴만 담당하는 순수 컴포넌트
 * 
 * 특징:
 * - 브랜드나 유틸리티 요소 없음
 * - 순수하게 네비게이션 로직만 관리
 * - 데스크톱/모바일 동일한 로직, 다른 스타일
 */
export default function PureNavigation({ 
  layout, 
  items, 
  currentPath, 
  onItemClick,
  onModalOpen,
  className = '' 
}: PureNavigationProps) {
  
  // 활성 상태 확인
  const isItemActive = (href: string) => {
    return currentPath === href || (href !== '/' && currentPath.startsWith(href))
  }
  
  // 아이템 클릭 핸들러
  const handleItemClick = (item: typeof items[0]) => {
    if (item.isModal) {
      onModalOpen?.(item.id)
    } else {
      onItemClick?.(item)
    }
  }
  
  // 데스크톱 세로 레이아웃
  if (layout === 'desktop') {
    return (
      <nav 
        className={`flex flex-col items-center gap-2 flex-1 justify-center ${className}`}
        role="navigation"
        aria-label="워클리 메인 네비게이션"
      >
        {items.map((item) => {
          const isActive = isItemActive(item.href)
          const Icon = isActive ? item.activeIcon : item.icon
          
          // 모달 아이템은 버튼으로 렌더링
          if (item.isModal) {
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`
                  nav-item ${isActive ? 'active' : ''} ${item.isCenter ? 'relative' : ''}
                  w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }
                `}
                title={item.name}
                aria-label={item.name}
              >
                <Icon className="w-6 h-6" />
                {/* CPER 워크플로우 중심 표시 */}
                {item.isCenter && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                )}
                <span className="sr-only">{item.name}</span>
              </button>
            )
          }
          
          // 일반 링크 아이템
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                nav-item ${isActive ? 'active' : ''} ${item.isCenter ? 'relative' : ''}
                w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
                ${isActive 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }
              `}
              title={item.name}
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onItemClick?.(item)}
            >
              <Icon className="w-6 h-6" />
              {/* CPER 워크플로우 중심 표시 */}
              {item.isCenter && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              )}
              <span className="sr-only">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    )
  }
  
  // 모바일 가로 레이아웃
  return (
    <nav 
      className={`flex justify-between items-center h-full px-6 ${className}`}
      role="navigation"
      aria-label="워클리 모바일 네비게이션"
    >
      {items.map((item) => {
        const isActive = isItemActive(item.href)
        const Icon = isActive ? item.activeIcon : item.icon
        
        // 모달 아이템은 버튼으로 렌더링
        if (item.isModal) {
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`
                flex items-center justify-center flex-1 h-full transition-colors relative
                ${isActive 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
              aria-label={item.name}
            >
              <Icon className="w-6 h-6" />
              {/* CPER 워크플로우 중심 표시 */}
              {item.isCenter && (
                <div className="absolute top-2 right-1/2 translate-x-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              )}
              <span className="sr-only">{item.name}</span>
            </button>
          )
        }
        
        // 일반 링크 아이템
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`
              flex items-center justify-center flex-1 h-full transition-colors relative
              ${isActive 
                ? 'text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
            aria-label={item.name}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onItemClick?.(item)}
          >
            <Icon className="w-6 h-6" />
            {/* CPER 워크플로우 중심 표시 */}
            {item.isCenter && (
              <div className="absolute top-2 right-1/2 translate-x-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            )}
            <span className="sr-only">{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}