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
  
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* 좌측 네비게이션 (데스크톱) */}
      <LeftNavigation />
      
      {/* 메인 콘텐츠 */}
      <div className="md:ml-[76px]">
        {children}
      </div>
      
      {/* 하단 네비게이션 (모바일) */}
      <MobileNavigation />
    </div>
  )
}