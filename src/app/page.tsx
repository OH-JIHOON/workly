'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ContentHeader from '@/components/layout/ContentHeader'
import MainContainer from '@/components/layout/MainContainer'
import LoginBanner from '@/components/ui/LoginBanner'
import QuickAddInput from '@/components/ui/QuickAddInput'
import { WorkList } from '@/components/works'
import { useWorks } from '@/hooks/useWorks'
import { useAuth } from '@/lib/stores/auth.store'

function WorksPageContent() {
  const { createWork } = useWorks()
  const { isAuthenticated, user, isLoading } = useAuth()

  // 빠른 워크 생성 핸들러
  const handleQuickAddWork = async (title: string) => {
    if (!isAuthenticated || !user) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      await createWork({ title })
    } catch (error) {
      console.error('워크 생성 실패:', error)
      alert('워크 생성에 실패했습니다.')
    }
  }

  // 로딩 중이거나 인증되지 않은 경우
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ContentHeader title="Work" />
        
        <MainContainer className="pb-20 md:pb-20">
          <div className="p-8 text-center">
            {isLoading ? (
              <>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">로딩 중...</h3>
                <p className="text-sm text-gray-500">인증 상태를 확인하고 있습니다.</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">로그인이 필요합니다</h3>
                <p className="text-sm text-gray-500">워클리의 작업 관리 기능을 사용하려면 로그인해 주세요.</p>
              </>
            )}
          </div>
        </MainContainer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ContentHeader title="Work" />
      
      <MainContainer className="pb-20 md:pb-20">
        <WorkList />
      </MainContainer>
      
      {/* 데스크톱: 메인 컨텐츠 영역(720px) 하단에 fixed 고정 */}
      {isAuthenticated && (
        <div className="hidden md:block fixed bottom-4 left-[76px] right-0 z-[65]">
          <div className="w-full max-w-[720px] mx-auto">
            <QuickAddInput
              placeholder="새 워크를 추가하세요..."
              onTaskCreate={handleQuickAddWork}
            />
          </div>
        </div>
      )}
      
      {/* 모바일: 하단 네비게이션 바로 위에 fixed 고정 */}
      {isAuthenticated && (
        <div className="md:hidden fixed left-0 right-0 bottom-16 bg-white border-t border-gray-200 px-4 pt-3 pb-4 z-[65]">
          <QuickAddInput
            placeholder="새 워크를 추가하세요..."
            onTaskCreate={handleQuickAddWork}
          />
        </div>
      )}
    </div>
  )
}

export default function WorksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <WorksPageContent />
    </Suspense>
  )
}