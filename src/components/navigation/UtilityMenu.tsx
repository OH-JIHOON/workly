'use client'

import { UtilityMenuProps } from '@/types/unified-navigation.types'
import HamburgerMenu from './HamburgerMenu'

/**
 * 단순한 유틸리티 메뉴 컴포넌트
 * 햄버거 메뉴 포함
 */
export default function UtilityMenu({ 
  layout,
  className = '' 
}: UtilityMenuProps) {
  return (
    <div className={`utility-menu flex items-center justify-center ${className}`}>
      {/* 데스크톱과 모바일 모두에서 햄버거 메뉴 표시 */}
      <HamburgerMenu />
    </div>
  )
}