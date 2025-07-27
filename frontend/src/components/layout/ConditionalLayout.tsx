'use client'

import { usePathname } from 'next/navigation'
import LeftNavigation from '@/components/navigation/LeftNavigation'
import MobileNavigation from '@/components/navigation/MobileNavigation'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // 인증 관련 페이지에서는 네비게이션을 숨김
  const isAuthPage = pathname?.startsWith('/auth')
  
  // 프로젝트 상세 페이지에서는 모바일 네비게이션을 숨김
  const isProjectDetailPage = pathname?.match(/^\/projects\/[^\/]+$/)
  
  // 프로젝트 상세 페이지에서는 좌측 네비게이션을 숨김
  const shouldHideLeftNav = isProjectDetailPage
  
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* 좌측 네비게이션 (데스크톱) - 프로젝트 상세 페이지에서는 숨김 */}
      {!shouldHideLeftNav && <LeftNavigation />}
      
      {/* 메인 콘텐츠 */}
      <div className={shouldHideLeftNav ? "" : "md:ml-[76px]"}>
        {children}
      </div>
      
      {/* 하단 네비게이션 (모바일) - 프로젝트 상세 페이지에서는 숨김 */}
      {!isProjectDetailPage && <MobileNavigation />}
    </div>
  )
}