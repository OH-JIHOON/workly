'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import MainContainer from '@/components/layout/MainContainer'
import FloatingActionButton from '@/components/ui/FloatingActionButton'

export default function BoardPage() {
  const [currentFilter, setCurrentFilter] = useState('전체 글')
  const [searchQuery, setSearchQuery] = useState('')

  // 필터 옵션
  const filterOptions = [
    { key: '전체 글', label: '전체 글', count: 24 },
    { key: '공지사항', label: '공지사항', count: 3 },
    { key: '자유게시판', label: '자유게시판', count: 15 },
    { key: '질문답변', label: '질문답변', count: 6 },
  ]

  // 동적 헤더 타이틀
  const getHeaderTitle = () => {
    return currentFilter
  }

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter)
  }

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <Header 
        title={getHeaderTitle()}
        filterOptions={filterOptions}
        activeFilter={currentFilter}
        onFilterChange={handleFilterChange}
        showMobileFilters={true}
      />
      
      {/* 메인 콘텐츠 */}
      <MainContainer>

        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="p-8 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">게시판 페이지</h2>
            <p className="text-muted-foreground">게시판 기능이 여기에 추가될 예정입니다.</p>
          </div>
        </div>
      </MainContainer>
      
      {/* 플로팅 액션 버튼 */}
      <FloatingActionButton />
    </div>
  )
}