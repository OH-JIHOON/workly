'use client'

interface ContentHeaderProps {
  title: string
  className?: string
}

/**
 * 콘텐츠 헤더 컴포넌트
 * 페이지 제목만 담당하는 단순한 헤더
 * 네비게이션 요소들은 UnifiedLayout에서 처리
 */
export default function ContentHeader({ title, className = '' }: ContentHeaderProps) {
  return (
    <header 
      className={`sticky top-0 h-[60px] bg-background z-50 w-full ${className}`}
      role="banner"
    >
      <div className="w-full max-w-[720px] mx-auto h-full flex items-center justify-center px-6 md:px-0">
        <h1 className="workly-page-title">{title}</h1>
      </div>
    </header>
  )
}