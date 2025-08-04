'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, FileText, Lightbulb, FolderOpen, ClipboardList, BookOpen, Presentation } from 'lucide-react'
import Header from '@/components/layout/Header'
import UnifiedFilter from '@/components/ui/UnifiedFilter'
import MainContainer from '@/components/layout/MainContainer'
import WorklyFloatingActionButton from '@/components/ui/WorklyFloatingActionButton'
import LoginBanner from '@/components/ui/LoginBanner'
import { Button } from '@/components/ui/Button'
import MissionBoard from '@/components/board/MissionBoard'
import KnowledgeWiki from '@/components/board/KnowledgeWiki'
import ProjectShowcase from '@/components/board/ProjectShowcase'

type BoardSection = '임무 게시판' | '지식 위키' | '프로젝트 쇼케이스'

// 게시글 작성 모달 컴포넌트
function PostCreationModal({ 
  isOpen, 
  onClose, 
  section 
}: { 
  isOpen: boolean
  onClose: () => void
  section: BoardSection
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    console.log(`${section}에 새 게시글 작성:`, formData)
    alert(`"${formData.title}" 게시글이 ${section}에 성공적으로 등록되었습니다!`)
    
    // 폼 리셋
    setFormData({ title: '', description: '', category: '', tags: '' })
    onClose()
  }

  if (!isOpen) return null

  const getModalContent = () => {
    switch (section) {
      case '임무 게시판':
        return {
          icon: FileText,
          title: '새 임무 등록',
          description: '프리랜서나 팀원을 위한 새로운 임무를 등록하세요',
          categoryPlaceholder: '개발, 디자인, 마케팅 등',
          titlePlaceholder: '임무 제목을 입력하세요',
          descriptionPlaceholder: '임무에 대한 상세한 설명을 작성하세요'
        }
      case '지식 위키':
        return {
          icon: Lightbulb,
          title: '새 지식 문서 작성',
          description: '팀과 공유할 유용한 지식이나 문서를 작성하세요',
          categoryPlaceholder: 'Frontend, Backend, DevOps 등',
          titlePlaceholder: '문서 제목을 입력하세요',
          descriptionPlaceholder: '지식 내용을 상세히 작성하세요'
        }
      case '프로젝트 쇼케이스':
        return {
          icon: FolderOpen,
          title: '새 프로젝트 쇼케이스',
          description: '완성한 프로젝트를 다른 사람들과 공유하세요',
          categoryPlaceholder: '웹 개발, 모바일 앱, 이커머스 등',
          titlePlaceholder: '프로젝트 제목을 입력하세요',
          descriptionPlaceholder: '프로젝트 설명과 주요 기능을 작성하세요'
        }
      default:
        return {
          icon: FileText,
          title: '새 게시글',
          description: '새로운 게시글을 작성하세요',
          categoryPlaceholder: '카테고리',
          titlePlaceholder: '제목을 입력하세요',
          descriptionPlaceholder: '내용을 작성하세요'
        }
    }
  }

  const content = getModalContent()
  const Icon = content.icon

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black opacity-25" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
                <p className="text-sm text-gray-500">{content.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {/* 폼 */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제목 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder={content.titlePlaceholder}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카테고리
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder={content.categoryPlaceholder}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명 *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder={content.descriptionPlaceholder}
                rows={4}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                태그 (선택사항)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="태그를 쉼표로 구분하여 입력하세요"
              />
            </div>
            
            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="default"
                className="flex-1"
                disabled={!formData.title.trim() || !formData.description.trim()}
              >
                등록하기
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function BoardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState<BoardSection>('임무 게시판')
  const [searchQuery, setSearchQuery] = useState('')
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  
  // 필터 설정 상태
  const [showOnlyRecent, setShowOnlyRecent] = useState(false)
  const [boardSortOrder, setBoardSortOrder] = useState('latest')
  const [showOnlyMyPosts, setShowOnlyMyPosts] = useState(false)

  // 섹션 옵션 (아이콘 및 색상 추가)
  const sectionOptions = [
    { 
      key: '임무 게시판', 
      label: '임무 게시판', 
      count: 8,
      icon: <ClipboardList className="w-4 h-4" />,
      color: 'blue' as const
    },
    { 
      key: '지식 위키', 
      label: '지식 위키', 
      count: 24,
      icon: <BookOpen className="w-4 h-4" />,
      color: 'green' as const
    },
    { 
      key: '프로젝트 쇼케이스', 
      label: '프로젝트 쇼케이스', 
      count: 12,
      icon: <Presentation className="w-4 h-4" />,
      color: 'purple' as const
    },
  ]

  const handleSectionChange = (section: string) => {
    setActiveSection(section as BoardSection)
  }

  const handlePostCreation = () => {
    setIsPostModalOpen(true)
  }

  // 쿼리 파라미터로 전달된 액션 및 섹션 처리
  useEffect(() => {
    const action = searchParams.get('action')
    const section = searchParams.get('section')
    
    // 섹션 매개변수가 있으면 해당 섹션으로 전환
    if (section && ['임무 게시판', '지식 위키', '프로젝트 쇼케이스'].includes(section)) {
      setActiveSection(section as BoardSection)
    }
    
    // 게시글 작성 액션 처리
    if (action === 'add-post') {
      setIsPostModalOpen(true)
      // URL에서 action 쿼리 파라미터만 제거 (section은 유지)
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('action')
      router.replace(newUrl.pathname + newUrl.search)
    }
  }, [searchParams, router])

  const renderActiveSection = () => {
    switch (activeSection) {
      case '임무 게시판':
        return <MissionBoard searchQuery={searchQuery} />
      case '지식 위키':
        return <KnowledgeWiki searchQuery={searchQuery} />
      case '프로젝트 쇼케이스':
        return <ProjectShowcase searchQuery={searchQuery} />
      default:
        return <MissionBoard searchQuery={searchQuery} />
    }
  }

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <Header 
        title={activeSection}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {/* 로그인 배너 (헤더 바깥) */}
      <LoginBanner />
      
      {/* 메인 콘텐츠 */}
      <MainContainer>
        {/* 필터 칩 */}
        <div className="mb-0">
          <UnifiedFilter
            options={sectionOptions}
            activeFilter={activeSection}
            onFilterChange={handleSectionChange}
            variant="comfortable"
            style="modern"
            maxVisibleItems={3}
            settingsTitle="게시판 필터 설정"
            settings={[
              {
                key: 'recent',
                label: '최근 7일 게시글만',
                type: 'toggle',
                value: showOnlyRecent,
                onChange: setShowOnlyRecent
              },
              {
                key: 'sort',
                label: '정렬 기준',
                type: 'select',
                value: boardSortOrder,
                options: ['latest', 'popular', 'comments', 'views'],
                onChange: setBoardSortOrder
              },
              {
                key: 'myPosts',
                label: '내가 작성한 게시글만',
                type: 'toggle',
                value: showOnlyMyPosts,
                onChange: setShowOnlyMyPosts
              },
              // 섹션별 특화 설정
              ...(activeSection === '임무 게시판' ? [
                {
                  key: 'budget',
                  label: '예산 범위',
                  type: 'range',
                  value: [0, 500],
                  onChange: (value: [number, number]) => console.log('예산 필터:', value)
                },
                {
                  key: 'skills',
                  label: '필요 기술',
                  type: 'tag-selector',
                  value: [],
                  options: ['React', 'Node.js', 'Python', 'Design', 'Marketing'],
                  onChange: (value: string[]) => console.log('기술 필터:', value)
                },
                {
                  key: 'paymentType',
                  label: '결제 방식',
                  type: 'select',
                  value: 'all',
                  options: ['all', 'fixed', 'hourly'],
                  onChange: (value: string) => console.log('결제 방식:', value)
                }
              ] : []),
              ...(activeSection === '지식 위키' ? [
                {
                  key: 'difficulty',
                  label: '난이도',
                  type: 'select',
                  value: 'all',
                  options: ['all', 'beginner', 'intermediate', 'advanced'],
                  onChange: (value: string) => console.log('난이도 필터:', value)
                },
                {
                  key: 'category',
                  label: '카테고리',
                  type: 'tag-selector',
                  value: [],
                  options: ['Frontend', 'Backend', 'DevOps', 'Design', 'Product'],
                  onChange: (value: string[]) => console.log('카테고리 필터:', value)
                },
                {
                  key: 'docType',
                  label: '문서 타입',
                  type: 'select',
                  value: 'all',
                  options: ['all', 'tutorial', 'guide', 'reference', 'template'],
                  onChange: (value: string) => console.log('문서 타입:', value)
                }
              ] : []),
              ...(activeSection === '프로젝트 쇼케이스' ? [
                {
                  key: 'projectType',
                  label: '프로젝트 종류',
                  type: 'tag-selector',
                  value: [],
                  options: ['웹', '모바일', '데이터', '디자인', 'AI/ML'],
                  onChange: (value: string[]) => console.log('프로젝트 종류:', value)
                },
                {
                  key: 'teamSize',
                  label: '팀 구성',
                  type: 'select',
                  value: 'all',
                  options: ['all', 'individual', 'small', 'large'],
                  onChange: (value: string) => console.log('팀 구성:', value)
                },
                {
                  key: 'completeness',
                  label: '완성도',
                  type: 'select',
                  value: 'all',
                  options: ['all', 'prototype', 'mvp', 'complete'],
                  onChange: (value: string) => console.log('완성도:', value)
                }
              ] : [])
            ] as any}
          />
        </div>
        {renderActiveSection()}
      </MainContainer>
      
      {/* 플로팅 액션 버튼 */}
      <WorklyFloatingActionButton 
        onAddTask={() => console.log('업무 추가')}
        onAddProject={() => console.log('프로젝트 추가')}
        onAddGoal={() => console.log('목표 추가')}
      />

      {/* 게시글 작성 모달 */}
      <PostCreationModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        section={activeSection}
      />
    </div>
  )
}