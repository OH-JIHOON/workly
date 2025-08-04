'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  PlusIcon, 
  FlagIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ChartBarIcon,
  CalendarIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import Header from '@/components/layout/Header'
import MainContainer from '@/components/layout/MainContainer'
import FilterManager from '@/components/ui/FilterManager'
import WorklyFloatingActionButton from '@/components/ui/WorklyFloatingActionButton'
import LoginBanner from '@/components/ui/LoginBanner'
import { isAuthenticated } from '@/lib/auth'
import { 
  Goal, 
  GoalStatus, 
  GoalPriority, 
  GoalType, 
  GoalTimeframe,
  CreateGoalDto 
} from '@/shared/types/goal.types'

// 목업 목표 데이터
const mockGoals: Goal[] = [
  {
    id: '1',
    title: '워클리 플랫폼 완성',
    description: '사용자들이 목표를 효과적으로 관리할 수 있는 플랫폼 구축',
    status: GoalStatus.ACTIVE,
    priority: GoalPriority.HIGH,
    type: GoalType.ORGANIZATIONAL,
    timeframe: GoalTimeframe.MEDIUM_TERM,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    targetDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 75,
    metrics: [
      {
        id: 'm1',
        name: '사용자 등록 수',
        targetValue: 1000,
        currentValue: 750,
        unit: '명',
        description: '베타 테스트 사용자 확보'
      },
      {
        id: 'm2',
        name: '기능 완성도',
        targetValue: 100,
        currentValue: 85,
        unit: '%',
        description: '핵심 기능 개발 완료'
      }
    ],
    tags: ['플랫폼', 'MVP', '사업'],
    color: '#3B82F6',
    icon: '🚀',
    ownerId: 'user1',
    owner: { id: 'user1', name: '김워클리', email: 'workly@example.com' },
    projectCount: 3,
    completedProjectCount: 2,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    isOverdue: false,
    isDueSoon: false
  },
  {
    id: '2',
    title: '개인 역량 강화',
    description: '새로운 기술 스택 습득 및 전문성 향상',
    status: GoalStatus.ACTIVE,
    priority: GoalPriority.MEDIUM,
    type: GoalType.PERSONAL,
    timeframe: GoalTimeframe.LONG_TERM,
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    targetDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 45,
    metrics: [
      {
        id: 'm3',
        name: '학습 시간',
        targetValue: 200,
        currentValue: 90,
        unit: '시간',
        description: '온라인 강의 및 실습'
      }
    ],
    tags: ['학습', '역량개발', '개인성장'],
    color: '#10B981',
    icon: '📚',
    ownerId: 'user1',
    owner: { id: 'user1', name: '김워클리', email: 'workly@example.com' },
    projectCount: 2,
    completedProjectCount: 0,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    isOverdue: false,
    isDueSoon: false
  },
  {
    id: '3',
    title: '건강한 라이프 스타일',
    description: '규칙적인 운동과 건강한 식습관 유지',
    status: GoalStatus.COMPLETED,
    priority: GoalPriority.HIGH,
    type: GoalType.PERSONAL,
    timeframe: GoalTimeframe.SHORT_TERM,
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    targetDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 100,
    metrics: [
      {
        id: 'm4',
        name: '운동 일수',
        targetValue: 60,
        currentValue: 65,
        unit: '일',
        description: '3개월간 운동 지속'
      }
    ],
    tags: ['건강', '운동', '습관'],
    color: '#8B5CF6',
    icon: '💪',
    ownerId: 'user1',
    owner: { id: 'user1', name: '김워클리', email: 'workly@example.com' },
    projectCount: 1,
    completedProjectCount: 1,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isOverdue: false,
    isDueSoon: false
  }
]

// 목표 카드 컴포넌트
function GoalCard({ goal, onClick }: { goal: Goal; onClick: () => void }) {
  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.ACTIVE: return 'text-blue-600 bg-blue-100'
      case GoalStatus.COMPLETED: return 'text-green-600 bg-green-100'
      case GoalStatus.ON_HOLD: return 'text-yellow-600 bg-yellow-100'
      case GoalStatus.CANCELLED: return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusLabel = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.ACTIVE: return '진행 중'
      case GoalStatus.COMPLETED: return '완료'
      case GoalStatus.ON_HOLD: return '보류'
      case GoalStatus.CANCELLED: return '취소'
      case GoalStatus.DRAFT: return '초안'
      default: return '알 수 없음'
    }
  }

  const getPriorityColor = (priority: GoalPriority) => {
    switch (priority) {
      case GoalPriority.URGENT: return 'text-red-600'
      case GoalPriority.HIGH: return 'text-orange-600'
      case GoalPriority.MEDIUM: return 'text-blue-600'
      case GoalPriority.LOW: return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div 
      className="p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer group border-l-4"
      style={{ borderLeftColor: goal.color }}
      onClick={onClick}
    >
      {/* 목표 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
            style={{ backgroundColor: goal.color }}
          >
            {goal.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-gray-700">
                {goal.title}
              </h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                {getStatusLabel(goal.status)}
              </span>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2">{goal.description}</p>
          </div>
        </div>
        <div className={`text-sm font-medium ${getPriorityColor(goal.priority)}`}>
          {goal.priority.toUpperCase()}
        </div>
      </div>

      {/* 진행률 */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">목표 달성률</span>
          <span className="font-medium">{goal.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${goal.progress}%`,
              backgroundColor: goal.color 
            }}
          />
        </div>
      </div>

      {/* 메트릭 정보 */}
      {goal.metrics.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {goal.metrics.slice(0, 2).map((metric) => (
              <div key={metric.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{metric.name}</span>
                  <span className="text-sm font-medium">
                    {metric.currentValue}/{metric.targetValue} {metric.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div 
                    className="h-1 rounded-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${Math.min((metric.currentValue / metric.targetValue) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 프로젝트 및 일정 정보 */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <UsersIcon className="w-4 h-4" />
            <span>{goal.completedProjectCount}/{goal.projectCount} 프로젝트</span>
          </div>
          {goal.targetDate && (
            <div className="flex items-center space-x-1">
              <CalendarIcon className="w-4 h-4" />
              <span>
                {new Date(goal.targetDate).toLocaleDateString('ko-KR')}까지
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <ChartBarIcon className="w-4 h-4 text-green-600" />
          <span className="text-green-600">순조롭게 진행</span>
        </div>
      </div>

      {/* 태그 */}
      {goal.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {goal.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {tag}
            </span>
          ))}
          {goal.tags.length > 3 && (
            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              +{goal.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default function GoalsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [goals, setGoals] = useState<Goal[]>(mockGoals)
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState('전체 목표')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 필터 설정 상태
  const [showOnlyMyGoals, setShowOnlyMyGoals] = useState(false)
  const [goalSortOrder, setGoalSortOrder] = useState('progress')
  const [progressRange, setProgressRange] = useState<[number, number]>([0, 100])
  const [timeframeFilter, setTimeframeFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState('all')

  // 로그인 상태 초기화
  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
  }, [])

  // 기본 필터 칩들
  const defaultChips = [
    { 
      id: 'all',
      label: '전체 목표', 
      isDefault: true,
      conditions: [],
      count: goals.length,
      icon: <FlagIcon className="w-4 h-4" />,
      color: 'gray' as const
    },
    { 
      id: 'active',
      label: '진행 중', 
      isDefault: true,
      conditions: [{ key: 'status', operator: 'equals' as const, value: GoalStatus.ACTIVE, label: '상태: 진행 중' }],
      count: goals.filter(g => g.status === GoalStatus.ACTIVE).length,
      icon: <ClockIcon className="w-4 h-4" />,
      color: 'blue' as const
    },
    { 
      id: 'completed',
      label: '완료됨', 
      isDefault: true,
      conditions: [{ key: 'status', operator: 'equals' as const, value: GoalStatus.COMPLETED, label: '상태: 완료' }],
      count: goals.filter(g => g.status === GoalStatus.COMPLETED).length,
      icon: <CheckCircleIcon className="w-4 h-4" />,
      color: 'green' as const
    },
    { 
      id: 'high-priority',
      label: '중요 목표', 
      isDefault: true,
      conditions: [{ key: 'priority', operator: 'in' as const, value: [GoalPriority.HIGH, GoalPriority.URGENT], label: '우선순위: 높음+긴급' }],
      count: goals.filter(g => g.priority === GoalPriority.HIGH || g.priority === GoalPriority.URGENT).length,
      icon: <ChartBarIcon className="w-4 h-4" />,
      color: 'orange' as const
    },
  ]

  // 필터링된 목표 목록
  const filteredGoals = goals.filter(goal => {
    switch (activeFilter) {
      case '진행 중':
        return goal.status === GoalStatus.ACTIVE
      case '완료됨':
        return goal.status === GoalStatus.COMPLETED
      case '중요 목표':
        return goal.priority === GoalPriority.HIGH || goal.priority === GoalPriority.URGENT
      case '전체 목표':
      default:
        return true
    }
  })


  const handleGoalClick = (goal: Goal) => {
    router.push(`/goals/${goal.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <Header title="목표" />
      
      {/* 로그인 배너 (헤더 바깥) */}
      <LoginBanner />
      
      {/* 메인 콘텐츠 */}
      <MainContainer>
        {/* 필터 관리자 - 로그인된 사용자만 표시 */}
        {isLoggedIn && (
          <div className="mb-0">
            <FilterManager
            defaultChips={defaultChips}
            activeChipId={activeFilter}
            onChipChange={setActiveFilter}
            settingsTitle="목표 필터 설정"
            settings={[
              {
                key: 'myOnly',
                label: '내 목표만',
                type: 'toggle',
                value: showOnlyMyGoals,
                onChange: setShowOnlyMyGoals
              },
              {
                key: 'progress',
                label: '달성률 범위',
                type: 'range',
                value: progressRange,
                onChange: setProgressRange
              },
              {
                key: 'timeframe',
                label: '시간 범위',
                type: 'tag-selector',
                value: timeframeFilter,
                options: ['short_term', 'medium_term', 'long_term'],
                onChange: setTimeframeFilter
              },
              {
                key: 'status',
                label: '상태',
                type: 'select',
                value: statusFilter,
                options: ['all', 'active', 'completed', 'on_hold'],
                onChange: setStatusFilter
              },
              {
                key: 'sort',
                label: '정렬 기준',
                type: 'select',
                value: goalSortOrder,
                options: ['progress', 'deadline', 'priority', 'created'],
                onChange: setGoalSortOrder
              }
            ]}
            getChipCount={(conditions) => {
              let filteredGoals = goals
              
              conditions.forEach(condition => {
                switch (condition.key) {
                  case 'status':
                    filteredGoals = filteredGoals.filter(g => g.status === condition.value)
                    break
                  case 'priority':
                    if (Array.isArray(condition.value)) {
                      filteredGoals = filteredGoals.filter(g => condition.value.includes(g.priority))
                    }
                    break
                }
              })
              
              return filteredGoals.length
            }}
            />
          </div>
        )}

        {/* 목표 목록 */}
        <div className="bg-white border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">목표를 불러오는 중...</p>
            </div>
          ) : filteredGoals.length === 0 ? (
            <div className="p-8 text-center">
              <FlagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-1">목표가 없습니다</h3>
              <p className="text-gray-500 text-sm mb-4">우측 하단의 수집함 버튼(+)을 눌러 목표를 추가해보세요!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onClick={() => handleGoalClick(goal)}
                />
              ))}
            </div>
          )}
        </div>
      </MainContainer>
      
      {/* 워클리 플로팅 액션 버튼 */}
      <WorklyFloatingActionButton 
        onTaskCreated={(task) => {
          console.log('CPER 업무 생성:', task)
          // TODO: 목표 관련 업무 생성 로직 구현
        }}
        onInboxItemCreated={(inboxItem) => {
          console.log('빠른 수집:', inboxItem)
          // TODO: 목표 관련 아이디어 수집 로직 구현
        }}
      />
    </div>
  )
}