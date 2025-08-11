'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { UnifiedLayoutProps, NavigationLayout } from '@/types/unified-navigation.types'
import { NAVIGATION_ITEMS, NAVIGATION_CONFIG } from '@/constants/navigation'
import { isAuthenticated } from '@/lib/auth'
import BrandHeader from './BrandHeader'
import PureNavigation from './PureNavigation'
import UtilityMenu from './UtilityMenu'
// CPERModal 제거됨 (inbox 페이지 삭제)

/**
 * 통합 네비게이션 레이아웃 컴포넌트
 * 모든 네비게이션 요소를 조율하는 마스터 컴포넌트
 */
export default function UnifiedLayout({ 
  children, 
  layout: layoutProp,
  hideNavigation = false 
}: UnifiedLayoutProps) {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  // inbox 관련 상태 제거됨
  
  // 레이아웃 자동 감지
  const [detectedLayout, setDetectedLayout] = useState<NavigationLayout>('desktop')
  
  useEffect(() => {
    const checkLayout = () => {
      setDetectedLayout(window.innerWidth < 768 ? 'mobile' : 'desktop')
    }
    
    checkLayout()
    window.addEventListener('resize', checkLayout)
    return () => window.removeEventListener('resize', checkLayout)
  }, [])
  
  const layout = layoutProp || detectedLayout
  
  // 인증 상태 확인
  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
  }, [])
  
  // 인증 관련 페이지에서는 네비게이션을 숨김
  const isAuthPage = pathname?.startsWith('/auth')
  const isProjectDetailPage = pathname?.match(/^\/projects\/[^\/]+$/)
  const shouldHideNavigation = hideNavigation || isAuthPage
  
  // 네비게이션 이벤트 핸들러들
  const handleNavigationItemClick = (item: typeof NAVIGATION_ITEMS[0]) => {
    console.log('네비게이션 아이템 클릭:', item.name)
  }
  
  const handleModalOpen = (modalType: string) => {
    // inbox 관련 기능 제거됨
    console.log('모달 타입:', modalType)
  }
  
  // inbox 모달 핸들러 제거됨
  
  const handleTaskCreated = (task: any) => {
    console.log('CPER 업무 생성:', task)
    // TODO: 실제 업무 생성 로직 구현
  }
  
  // inbox 아이템 생성 핸들러 제거됨
  
  if (shouldHideNavigation) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    )
  }
  
  // 데스크톱 레이아웃
  if (layout === 'desktop') {
    return (
      <div className="min-h-screen bg-background">
        {/* 좌측 사이드바 */}
        {!isProjectDetailPage && (
          <aside 
            className="fixed left-0 top-0 h-screen w-[76px] bg-background border-r border-border flex-col items-center py-5 z-50 flex"
            role="navigation"
            aria-label="워클리 메인 네비게이션"
          >
            {/* 상단: 브랜드 */}
            <BrandHeader layout="desktop" />
            
            {/* 중앙: 순수 네비게이션 */}
            <PureNavigation 
              layout="desktop"
              items={NAVIGATION_ITEMS}
              currentPath={pathname}
              onItemClick={handleNavigationItemClick as any}
              onModalOpen={handleModalOpen}
            />
            
            {/* 하단: 유틸리티 메뉴 */}
            <UtilityMenu 
              layout="desktop"
              isAuthenticated={isLoggedIn}
            />
          </aside>
        )}
        
        {/* 메인 콘텐츠 */}
        <div className={isProjectDetailPage ? '' : 'md:ml-[76px]'}>
          {children}
        </div>
        
        {/* CPER 수집함 모달 제거됨 */}
      </div>
    )
  }
  
  // 모바일 레이아웃
  return (
    <div className="min-h-screen bg-background">
      {/* 상단 헤더 (유틸리티 메뉴 + 브랜드) */}
      {!isProjectDetailPage && (
        <header 
          className="sticky top-0 h-[60px] bg-background z-40 w-full border-b border-border"
          role="banner"
        >
          <div className="w-full max-w-[720px] mx-auto h-full flex items-center px-6">
            <UtilityMenu 
              layout="mobile"
              isAuthenticated={isLoggedIn}
            />
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <BrandHeader layout="mobile" />
            </div>
          </div>
        </header>
      )}
      
      {/* 메인 콘텐츠 */}
      <div className="pb-20">
        {children}
      </div>
      
      {/* 하단 네비게이션 */}
      {!isProjectDetailPage && (
        <nav 
          className="fixed bottom-0 left-0 right-0 h-[60px] bg-card border-t border-border z-50"
          role="navigation"
          aria-label="워클리 모바일 네비게이션"
        >
          <PureNavigation 
            layout="mobile"
            items={NAVIGATION_ITEMS}
            currentPath={pathname}
            onItemClick={handleNavigationItemClick as any}
            onModalOpen={handleModalOpen}
          />
        </nav>
      )}
      
      {/* CPER 수집함 모달 제거됨 */}
    </div>
  )
}