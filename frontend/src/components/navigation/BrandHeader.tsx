'use client'

import Link from 'next/link'
import { BrandHeaderProps } from '@/types/unified-navigation.types'
import { BRAND_CONFIG } from '@/constants/navigation'

/**
 * 브랜드 헤더 컴포넌트
 * 로고와 브랜드 요소만 담당하는 순수 컴포넌트
 * 
 * 위치:
 * - 데스크톱: 좌측 사이드바 상단
 * - 모바일: 헤더 중앙
 */
export default function BrandHeader({ layout, className = '' }: BrandHeaderProps) {
  const config = BRAND_CONFIG.logo[layout]
  
  // 데스크톱 스타일
  if (layout === 'desktop') {
    return (
      <div className={`flex items-center justify-center mb-10 ${className}`}>
        <Link 
          href="/" 
          className="flex items-center justify-center w-8 h-8 font-bold text-xl text-foreground hover:text-primary transition-colors"
          aria-label="워클리 홈으로 이동"
        >
          {config.showIcon && BRAND_CONFIG.shortName}
          {config.showText && (
            <span className="ml-2 hidden lg:block">{BRAND_CONFIG.name}</span>
          )}
        </Link>
      </div>
    )
  }
  
  // 모바일 스타일
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Link 
        href="/" 
        className="flex items-center justify-center w-8 h-8 font-bold text-xl text-foreground"
        aria-label="워클리 홈으로 이동"
      >
        {config.showIcon && BRAND_CONFIG.shortName}
        {config.showText && (
          <span className="ml-2">{BRAND_CONFIG.name}</span>
        )}
      </Link>
    </div>
  )
}