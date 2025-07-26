'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import FloatingActionButton from '@/components/ui/FloatingActionButton'
import MobileTabs from '@/components/ui/MobileTabs'

const tasks = [
  {
    id: 1,
    title: '프로젝트 기획서 작성',
    description: '새로운 프로젝트의 기획서를 작성하고 팀과 공유',
    category: '기획',
    deadline: '오늘 오후 6시',
    completed: false
  },
  {
    id: 2,
    title: '디자인 시스템 업데이트',
    description: '새로운 컴포넌트들을 디자인 시스템에 추가',
    category: '디자인',
    deadline: '내일',
    completed: false
  },
  {
    id: 3,
    title: 'API 문서 검토',
    description: '백엔드 API 문서를 검토하고 피드백 제공',
    category: '개발',
    deadline: '완료됨',
    completed: true
  },
  {
    id: 4,
    title: '사용자 인터뷰 진행',
    description: '신규 기능에 대한 사용자 피드백 수집 및 분석',
    category: '리서치',
    deadline: '이번 주 금요일',
    completed: false
  },
  {
    id: 5,
    title: '데이터베이스 최적화',
    description: '쿼리 성능 개선 및 인덱스 재구성 작업',
    category: '개발',
    deadline: '다음 주',
    completed: false
  },
  {
    id: 6,
    title: '모바일 앱 UI 개선',
    description: '사용성 향상을 위한 UI/UX 개선 작업',
    category: '디자인',
    deadline: '월말',
    completed: false
  },
  {
    id: 7,
    title: '보안 취약점 점검',
    description: '시스템 전반의 보안 취약점 분석 및 개선',
    category: '보안',
    deadline: '긴급',
    completed: false
  },
  {
    id: 8,
    title: '마케팅 전략 수립',
    description: 'Q4 마케팅 캠페인 계획 및 예산 수립',
    category: '마케팅',
    deadline: '내일',
    completed: false
  },
  {
    id: 9,
    title: '테스트 코드 작성',
    description: '신규 기능에 대한 단위 테스트 및 통합 테스트 작성',
    category: '개발',
    deadline: '이번 주',
    completed: true
  },
  {
    id: 10,
    title: '고객 지원 개선',
    description: '고객 문의 응답 시간 단축 및 FAQ 업데이트',
    category: '지원',
    deadline: '다음 주',
    completed: false
  },
  {
    id: 11,
    title: '성과 리포트 작성',
    description: '분기별 성과 분석 및 개선 방안 도출',
    category: '분석',
    deadline: '분기말',
    completed: true
  }
]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('업무')

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    console.log('Tab changed:', tab)
  }

  const handleDropdownChange = (item: string) => {
    setActiveTab(item)
  }

  // 탭에 따라 업무 필터링
  const filteredTasks = activeTab === '완료한 업무' 
    ? tasks.filter(task => task.completed)
    : tasks.filter(task => !task.completed)

  const renderTaskCard = (task: any, isLast: boolean) => {
    const deadlineColor = task.deadline === '긴급' ? 'text-red-500' : 
                         task.completed ? 'text-green-600' : 'text-muted-foreground'
    
    return (
      <article 
        className={`p-6 ${!isLast ? 'border-b border-border' : ''} ${task.completed ? 'opacity-50' : ''}`}
        aria-labelledby={`task-${task.id}-title`}
        aria-describedby={`task-${task.id}-description task-${task.id}-meta`}
      >
        <div className="flex items-start gap-3">
          <input 
            type="checkbox" 
            checked={task.completed}
            readOnly
            className="mt-1 w-5 h-5 rounded border border-border"
            aria-label={`${task.title} ${task.completed ? '완료됨' : '미완료'}`}
          />
          <div className="flex-1">
            <h3 
              id={`task-${task.id}-title`}
              className={`font-medium text-foreground ${task.completed ? 'line-through' : ''}`}
            >
              {task.title}
            </h3>
            <p 
              id={`task-${task.id}-description`}
              className={`text-sm text-muted-foreground mt-1 ${task.completed ? 'line-through' : ''}`}
            >
              {task.description}
            </p>
            <div id={`task-${task.id}-meta`} className="flex items-center gap-2 mt-3">
              <span 
                className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-lg"
                aria-label={`카테고리: ${task.category}`}
              >
                {task.category}
              </span>
              <span 
                className={`text-xs ${deadlineColor}`}
                aria-label={task.completed ? '상태: 완료됨' : `마감일: ${task.deadline}`}
              >
                {task.completed ? '완료됨' : `마감: ${task.deadline}`}
              </span>
            </div>
          </div>
        </div>
      </article>
    )
  }

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <Header 
        title="업무" 
        showDropdown={true}
        dropdownItems={['업무', '완료한 업무']}
        onDropdownItemClick={handleDropdownChange}
      />
      
      {/* 모바일 탭 */}
      <MobileTabs 
        tabs={['업무', '완료한 업무']}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      
      {/* 메인 콘텐츠 */}
      <main className="max-w-[640px] mx-auto md:px-6 md:py-6 pb-20 md:pb-6" role="main">
        {/* 투두 앱 업무 카드들이 들어갈 영역 */}
        <section 
          className="bg-card md:border border-border md:rounded-lg md:shadow-sm overflow-hidden"
          aria-label={`${activeTab} 목록`}
        >
          <h2 className="sr-only">{activeTab} 목록</h2>
          {filteredTasks.length > 0 ? (
            <ul role="list">
              {filteredTasks.map((task, index) => (
                <li key={task.id}>
                  {renderTaskCard(task, index === filteredTasks.length - 1)}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              {activeTab === '완료한 업무' ? '완료한 업무가 없습니다.' : '진행 중인 업무가 없습니다.'}
            </div>
          )}
        </section>
      </main>
      
      {/* 플로팅 액션 버튼 */}
      <FloatingActionButton />
    </div>
  )
}