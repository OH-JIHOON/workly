'use client'

import { ReactNode } from 'react'

interface MainContainerProps {
  children: ReactNode
  className?: string
}

/**
 * 메인 컨텐츠 영역 컨테이너
 * - 데스크톱: 720px 고정폭, 중앙 정렬
 * - 모바일: 좌우 여백 없이 전체 폭 사용
 */
export default function MainContainer({ children, className = '' }: MainContainerProps) {
  return (
    <main 
      className={`
        w-full 
        max-w-[720px] 
        mx-auto 
        px-0 md:px-0
        ${className}
      `}
      role="main"
    >
      {children}
    </main>
  )
}