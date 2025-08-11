'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  PlusIcon, 
  InboxIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  DocumentTextIcon,
  LightBulbIcon,
  LinkIcon,
  MicrophoneIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import Header from '@/components/layout/Header'
import MainContainer from '@/components/layout/MainContainer'
import FilterManager from '@/components/ui/FilterManager'
import WorklyFloatingActionButton from '@/components/ui/WorklyFloatingActionButton'
import LoginBanner from '@/components/ui/LoginBanner'
import PlanWorkflowModal from '@/components/workflow/PlanWorkflowModal'
import { isAuthenticated } from '@/lib/auth'
import { 
  InboxItem, 
  InboxItemType, 
  InboxItemStatus, 
  InboxItemPriority,
  QuickCaptureDto 
} from '@/types/inbox.types'

// 목업 수집함 데이터 (CPER 워크플로우의 '수집' 단계)
const mockInboxItems: InboxItem[] = [
  {
    id: '1',
    title: '사용자 피드백 정리',
    content: '베타 테스트 사용자들로부터 받은 피드백을 정리하고 개선 방향 수립',
    type: InboxItemType.TASK_IDEA,
    status: InboxItemStatus.CAPTURED,
    priority: InboxItemPriority.HIGH,
    source: 'manual',
    captureContext: {
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    attachments: [],
    relatedUrls: [],
    tags: ['피드백', '개선', 'UX'],
    userId: 'user1',
    user: { id: 'user1', name: '김워클리', email: 'workly@example.com' },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    daysSinceCapture: 0
  },
  {
    id: '2',
    title: '새로운 디자인 시스템 아이디어',
    content: '더 일관성 있는 UI를 위한 컴포넌트 기반 디자인 시스템 구축 아이디어',
    type: InboxItemType.PROJECT_IDEA,
    status: InboxItemStatus.CLARIFIED,
    priority: InboxItemPriority.MEDIUM,
    source: 'web_clipper',
    captureContext: {
      url: 'https://example.com/design-systems',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    attachments: [],
    relatedUrls: ['https://example.com/design-systems'],
    tags: ['디자인', '시스템', 'UI'],
    scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'user1',
    user: { id: 'user1', name: '김워클리', email: 'workly@example.com' },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    daysSinceCapture: 1
  },
  {
    id: '3',
    title: '팀 회의 메모',
    content: '주간 스프린트 회의에서 논의된 주요 이슈들과 액션 아이템',
    type: InboxItemType.MEETING_NOTE,
    status: InboxItemStatus.ORGANIZED,
    priority: InboxItemPriority.MEDIUM,
    source: 'mobile_app',
    captureContext: {
      deviceType: 'iPhone',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    attachments: [],
    relatedUrls: [],
    tags: ['회의', '스프린트', '액션아이템'],
    processedInto: {
      type: 'task',
      id: 'task-123',
      title: '스프린트 백로그 업데이트'
    },
    processedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'user1',
    user: { id: 'user1', name: '김워클리', email: 'workly@example.com' },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    daysSinceCapture: 3
  },
  {
    id: '4',
    title: '영감을 주는 아티클',
    content: '생산성 앱의 미래에 대한 흥미로운 관점',
    type: InboxItemType.INSPIRATION,
    status: InboxItemStatus.DEFERRED,
    priority: InboxItemPriority.LOW,
    source: 'web_clipper',
    captureContext: {
      url: 'https://example.com/productivity-future',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    attachments: [],
    relatedUrls: ['https://example.com/productivity-future'],
    tags: ['영감', '미래', '생산성'],
    scheduledFor: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'user1',
    user: { id: 'user1', name: '김워클리', email: 'workly@example.com' },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    daysSinceCapture: 5
  }
]

// 타입별 아이콘 매핑
const getTypeIcon = (type: InboxItemType) => {
  switch (type) {
    case InboxItemType.QUICK_NOTE: return DocumentTextIcon
    case InboxItemType.TASK_IDEA: return CheckCircleIcon
    case InboxItemType.PROJECT_IDEA: return LightBulbIcon
    case InboxItemType.GOAL_IDEA: return LightBulbIcon
    case InboxItemType.MEETING_NOTE: return DocumentTextIcon
    case InboxItemType.FEEDBACK: return ExclamationTriangleIcon
    case InboxItemType.INSPIRATION: return LightBulbIcon
    case InboxItemType.REMINDER: return ClockIcon
    case InboxItemType.LINK: return LinkIcon
    case InboxItemType.FILE: return DocumentTextIcon
    default: return DocumentTextIcon
  }
}

// 상태별 색상 및 라벨
const getStatusInfo = (status: InboxItemStatus) => {
  switch (status) {
    case InboxItemStatus.CAPTURED:
      return { color: 'text-blue-600 bg-blue-100', label: '수집됨' }
    case InboxItemStatus.CLARIFIED:
      return { color: 'text-yellow-600 bg-yellow-100', label: '명확화됨' }
    case InboxItemStatus.ORGANIZED:
      return { color: 'text-green-600 bg-green-100', label: '정리됨' }
    case InboxItemStatus.DEFERRED:
      return { color: 'text-purple-600 bg-purple-100', label: '미루어짐' }
    default:
      return { color: 'text-gray-600 bg-gray-100', label: '알 수 없음' }
  }
}

// 우선순위 색상
const getPriorityColor = (priority: InboxItemPriority) => {
  switch (priority) {
    case InboxItemPriority.URGENT: return 'text-red-600'
    case InboxItemPriority.HIGH: return 'text-orange-600'
    case InboxItemPriority.MEDIUM: return 'text-blue-600'
    case InboxItemPriority.LOW: return 'text-gray-600'
    default: return 'text-gray-600'
  }
}

// 수집함 아이템 카드 컴포넌트
function InboxItemCard({ item, onClick }: { item: InboxItem; onClick: () => void }) {
  const TypeIcon = getTypeIcon(item.type)
  const statusInfo = getStatusInfo(item.status)
  
  return (
    <div 
      className="p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      {/* 아이템 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <TypeIcon className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                {item.title}
              </h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2">{item.content}</p>
          </div>
        </div>
        <div className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
          {item.priority.toUpperCase()}
        </div>
      </div>

      {/* 처리 결과 (정리된 항목만) */}
      {item.processedInto && (
        <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">
              <span className="font-medium">{item.processedInto.type === 'task' ? '업무' : item.processedInto.type === 'project' ? '프로젝트' : '목표'}</span>로 전환: 
              <span className="ml-1">{item.processedInto.title}</span>
            </span>
          </div>
        </div>
      )}

      {/* 스케줄 정보 */}
      {item.scheduledFor && (
        <div className="mb-3 flex items-center space-x-2 text-sm text-gray-600">
          <CalendarIcon className="w-4 h-4" />
          <span>
            {new Date(item.scheduledFor).toLocaleDateString('ko-KR')}에 다시 검토
          </span>
        </div>
      )}

      {/* 메타 정보 */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>{item.daysSinceCapture}일 전 수집</span>
          <span className="capitalize">{item.source.replace('_', ' ')}</span>
          {item.relatedUrls.length > 0 && (
            <div className="flex items-center space-x-1">
              <LinkIcon className="w-4 h-4" />
              <span>{item.relatedUrls.length}개 링크</span>
            </div>
          )}
        </div>
        <div className="text-xs">
          {new Date(item.createdAt).toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>

      {/* 태그 */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {item.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full"
            >
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              +{item.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function InboxPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [inboxItems, setInboxItems] = useState<InboxItem[]>(mockInboxItems)
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState('모든 항목')
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false)
  const [quickCaptureText, setQuickCaptureText] = useState('')
  const [selectedItemForPlan, setSelectedItemForPlan] = useState<InboxItem | null>(null)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 필터 설정 상태
  const [showOnlyPending, setShowOnlyPending] = useState(false)
  const [sortOrder, setSortOrder] = useState('recent')
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [priorityFilter, setPriorityFilter] = useState<string[]>([])

  // 로그인 상태 초기화
  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
  }, [])

  // 기본 필터 칩들 (CPER 워크플로우 기반)
  const defaultChips = [
    { 
      id: 'all',
      label: '모든 항목', 
      isDefault: true,
      conditions: [],
      count: inboxItems.length,
      icon: <InboxIcon className="w-4 h-4" />,
      color: 'gray' as const
    },
    { 
      id: 'captured',
      label: '수집됨', 
      isDefault: true,
      conditions: [{ key: 'status', operator: 'equals' as const, value: InboxItemStatus.CAPTURED, label: '상태: 수집됨' }],
      count: inboxItems.filter(i => i.status === InboxItemStatus.CAPTURED).length,
      icon: <InboxIcon className="w-4 h-4" />,
      color: 'blue' as const
    },
    { 
      id: 'clarified',
      label: '명확화됨', 
      isDefault: true,
      conditions: [{ key: 'status', operator: 'equals' as const, value: InboxItemStatus.CLARIFIED, label: '상태: 명확화됨' }],
      count: inboxItems.filter(i => i.status === InboxItemStatus.CLARIFIED).length,
      icon: <ClockIcon className="w-4 h-4" />,
      color: 'orange' as const
    },
    { 
      id: 'organized',
      label: '정리됨', 
      isDefault: true,
      conditions: [{ key: 'status', operator: 'equals' as const, value: InboxItemStatus.ORGANIZED, label: '상태: 정리됨' }],
      count: inboxItems.filter(i => i.status === InboxItemStatus.ORGANIZED).length,
      icon: <CheckCircleIcon className="w-4 h-4" />,
      color: 'green' as const
    },
    { 
      id: 'urgent',
      label: '긴급', 
      isDefault: true,
      conditions: [{ key: 'priority', operator: 'equals' as const, value: InboxItemPriority.URGENT, label: '우선순위: 긴급' }],
      count: inboxItems.filter(i => i.priority === InboxItemPriority.URGENT).length,
      icon: <ExclamationTriangleIcon className="w-4 h-4" />,
      color: 'red' as const
    },
  ]

  // 필터링된 수집함 항목
  const filteredItems = inboxItems.filter(item => {
    switch (activeFilter) {
      case '수집됨':
        return item.status === InboxItemStatus.CAPTURED
      case '명확화됨':
        return item.status === InboxItemStatus.CLARIFIED
      case '정리됨':
        return item.status === InboxItemStatus.ORGANIZED
      case '긴급':
        return item.priority === InboxItemPriority.URGENT
      case '모든 항목':
      default:
        return true
    }
  })

  // 쿼리 파라미터 처리
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'quick-capture') {
      setIsQuickCaptureOpen(true)
      router.replace('/inbox')
    }
  }, [searchParams, router])

  const handleQuickCapture = () => {
    setIsQuickCaptureOpen(true)
  }

  const handleSubmitQuickCapture = () => {
    if (!quickCaptureText.trim()) return

    // 새 항목 생성 (목업)
    const newItem: InboxItem = {
      id: Date.now().toString(),
      title: quickCaptureText.trim(),
      content: quickCaptureText.trim(),
      type: InboxItemType.QUICK_NOTE,
      status: InboxItemStatus.CAPTURED,
      priority: InboxItemPriority.MEDIUM,
      source: 'manual',
      captureContext: {
        timestamp: new Date().toISOString()
      },
      attachments: [],
      relatedUrls: [],
      tags: [],
      userId: 'user1',
      user: { id: 'user1', name: '김워클리', email: 'workly@example.com' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      daysSinceCapture: 0
    }

    setInboxItems(prev => [newItem, ...prev])
    setQuickCaptureText('')
    setIsQuickCaptureOpen(false)
  }

  const handleItemClick = (item: InboxItem) => {
    if (item.status === InboxItemStatus.CAPTURED || item.status === InboxItemStatus.CLARIFIED) {
      // 계획 모달 열기
      setSelectedItemForPlan(item)
      setIsPlanModalOpen(true)
    } else {
      router.push(`/inbox/${item.id}`)
    }
  }

  const handlePlanComplete = (processedItem: InboxItem) => {
    setInboxItems(prev => prev.map(item => 
      item.id === processedItem.id ? processedItem : item
    ))
    setSelectedItemForPlan(null)
    setIsPlanModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <Header title="수집함" />
      
      {/* 로그인 배너 (헤더 바깥) */}
      <LoginBanner />
      
      {/* CPER 워크플로우 인디케이터 */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <InboxIcon className="w-5 h-5" />
            <span className="font-medium">CPER 워크플로우 - 수집(Capture) 단계</span>
          </div>
          <button
            onClick={handleQuickCapture}
            className="flex items-center space-x-2 px-3 py-1 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="text-sm">빠른 수집</span>
          </button>
        </div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <MainContainer>
        {/* 필터 관리자 - 로그인된 사용자만 표시 */}
        {isLoggedIn && (
          <div className="mb-0">
            <FilterManager
            defaultChips={defaultChips}
            activeChipId={activeFilter}
            onChipChange={setActiveFilter}
            settingsTitle="수집함 필터 설정"
            settings={[
              {
                key: 'pendingOnly',
                label: '처리 대기 항목만',
                type: 'toggle',
                value: showOnlyPending,
                onChange: setShowOnlyPending
              },
              {
                key: 'type',
                label: '항목 유형',
                type: 'tag-selector',
                value: typeFilter,
                options: ['quick_note', 'task_idea', 'project_idea', 'meeting_note', 'inspiration'],
                onChange: setTypeFilter
              },
              {
                key: 'priority',
                label: '우선순위',
                type: 'tag-selector',
                value: priorityFilter,
                options: ['urgent', 'high', 'medium', 'low'],
                onChange: setPriorityFilter
              },
              {
                key: 'sort',
                label: '정렬 기준',
                type: 'select',
                value: sortOrder,
                options: ['recent', 'priority', 'type', 'status'],
                onChange: setSortOrder
              }
            ]}
            getChipCount={(conditions) => {
              let filteredItems = inboxItems
              
              conditions.forEach(condition => {
                switch (condition.key) {
                  case 'status':
                    filteredItems = filteredItems.filter(i => i.status === condition.value)
                    break
                  case 'priority':
                    filteredItems = filteredItems.filter(i => i.priority === condition.value)
                    break
                }
              })
              
              return filteredItems.length
            }}
            />
          </div>
        )}

        {/* 수집함 항목 목록 */}
        <div className="bg-white border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">수집함을 불러오는 중...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <InboxIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-1">수집함이 비어있습니다</h3>
              <p className="text-gray-500 text-sm mb-4">아이디어나 할 일을 빠르게 수집해보세요!</p>
              <button
                onClick={handleQuickCapture}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                <PlusIcon className="w-4 h-4" />
                <span>빠른 수집</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredItems.map((item) => (
                <InboxItemCard
                  key={item.id}
                  item={item}
                  onClick={() => handleItemClick(item)}
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
          // TODO: 수집함에서 업무 생성 로직 구현
        }}
        onInboxItemCreated={(inboxItem) => {
          console.log('빠른 수집:', inboxItem)
          // 수집함 페이지에서는 빠른 수집이 바로 목록에 추가되어야 함
          setInboxItems(prev => [inboxItem, ...prev])
        }}
      />

      {/* 빠른 수집 모달 */}
      {isQuickCaptureOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-2 mb-4">
              <InboxIcon className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-semibold">빠른 수집</h3>
            </div>
            <textarea
              value={quickCaptureText}
              onChange={(e) => setQuickCaptureText(e.target.value)}
              placeholder="떠오른 아이디어나 할 일을 입력하세요..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              rows={4}
              autoFocus
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setIsQuickCaptureOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                onClick={handleSubmitQuickCapture}
                disabled={!quickCaptureText.trim()}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                수집하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 계획 워크플로우 모달 */}
      {selectedItemForPlan && (
        <PlanWorkflowModal
          isOpen={isPlanModalOpen}
          onClose={() => {
            setIsPlanModalOpen(false)
            setSelectedItemForPlan(null)
          }}
          inboxItem={selectedItemForPlan}
          onProcessComplete={handlePlanComplete}
        />
      )}
    </div>
  )
}

export default function InboxPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <InboxPageContent />
    </Suspense>
  )
}