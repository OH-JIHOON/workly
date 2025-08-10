'use client'

import UnifiedLayout from '@/components/navigation/UnifiedLayout'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

/**
 * 레거시 호환성을 위한 ConditionalLayout
 * 내부적으로 새로운 UnifiedLayout을 사용
 */
export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  return (
    <UnifiedLayout>
      {children}
    </UnifiedLayout>
  )
}