'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  ClipboardDocumentIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  CalendarIcon,
  UserIcon,
  FlagIcon
} from '@heroicons/react/24/outline'
import ContentHeader from '@/components/layout/ContentHeader'
import MainContainer from '@/components/layout/MainContainer'
import CalendarToggleFAB from '@/components/ui/CalendarToggleFAB'
import LoginBanner from '@/components/ui/LoginBanner'
import QuickAddInput from '@/components/ui/QuickAddInput'
// ResponsiveWorkCard, CollapsibleCalendar 제거됨 - 목업 상태였음
import { WorkStatus, WorkPriority, WorkType, WorkDetail } from '@/types/work.types'
// PaginatedResponse 타입을 로컬에서 정의
interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
import { isAuthenticated } from '@/lib/auth'
// AdvancedFilterPanel 제거됨 - 간단한 필터만 사용
// WorkDetailModal 제거됨 - 목업 상태였음
import { api } from '@/lib/api'

// 워클리 업무 인터페이스 (레거시 GTDWork 대체)
interface WorklyWork {
  id: string
  title: string
  description?: string
  status: WorkStatus
  priority: WorkPriority
  type: WorkType
  goalId?: string  // 워클리 방법론: 목표 연계 (선택적)
  projectId?: string  // 워클리 방법론: 프로젝트 연계 (선택적)
  assigneeId: string
  assignee: {
    id: string
    name: string
    email: string
  }
  dueDate?: string
  scheduledDate?: string  // 워클리: 실행 예정일
  tags: string[]
  createdAt: string
  updatedAt: string
  isToday?: boolean  // 워클리: 오늘 할 일 표시
  isFocused?: boolean  // 워클리: 집중 모드 표시
}

// API 응답 타입 (백엔드와 호환)
interface BackendWork {
  id: string
  title: string
  description?: string
  status: WorkStatus
  priority: WorkPriority
  type: WorkType
  projectId?: string
  goalId?: string
  assigneeId: string
  assignee: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  dueDate?: string
  startDate?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
  progress?: number
  estimatedHours?: number
}


function WorksPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [works, setWorks] = useState<WorklyWork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 캘린더 상태 관리
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false)
  const [isDragMode, setIsDragMode] = useState(false)
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)
  
  // 새로 생성된 업무 애니메이션 추적
  const [newlyCreatedTaskId, setNewlyCreatedTaskId] = useState<string | null>(null)

  
  // 캘린더 필터 제거됨
  const showNoDue = false
  const showOverdue = false
  
  // 상세 필터 상태 관리
  // AdvancedFilters 제거됨 - 간단한 필터만 사용
  
  // 업무 상세 모달 상태 관리
  const [selectedWork, setSelectedWork] = useState<WorkDetail | null>(null)
  const [isWorkDetailOpen, setIsWorkDetailOpen] = useState(false)
  
  // 목업 프로젝트와 목표 데이터
  const availableProjects = [
    { id: 'proj-1', name: '워클리 네비게이션 시스템' },
    { id: 'proj-2', name: '데이터베이스 최적화' }
  ]
  
  const availableGoals = [
    { id: 'goal-1', name: 'Q4 사용자 경험 개선' },
    { id: 'goal-2', name: '차세대 기능 개발' }
  ]
  
  // 백엔드 응답을 프론트엔드 형식으로 변환
  const transformBackendWork = (backendWork: BackendWork): WorklyWork => {
    const today = new Date()
    const dueDate = backendWork.dueDate ? new Date(backendWork.dueDate) : null
    
    return {
      id: backendWork.id,
      title: backendWork.title,
      description: backendWork.description,
      status: backendWork.status,
      priority: backendWork.priority,
      type: backendWork.type,
      goalId: backendWork.goalId,
      projectId: backendWork.projectId,
      assigneeId: backendWork.assigneeId,
      assignee: {
        id: backendWork.assignee.id,
        name: `${backendWork.assignee.firstName} ${backendWork.assignee.lastName}`,
        email: backendWork.assignee.email
      },
      dueDate: backendWork.dueDate,
      scheduledDate: backendWork.startDate,
      tags: backendWork.tags || [],
      createdAt: backendWork.createdAt,
      updatedAt: backendWork.updatedAt,
      // 오늘 할 일 계산: 마감일이 오늘이거나 이미 지났고 완료되지 않은 업무
      isToday: dueDate ? (dueDate <= today && backendWork.status !== WorkStatus.COMPLETED) : false,
      isFocused: backendWork.priority === WorkPriority.URGENT || backendWork.priority === WorkPriority.HIGH
    }
  }
  
  // 상세 필터가 활성화되었는지 확인
  // hasAdvancedFilters 제거됨 - 간단한 필터만 사용
  const hasAdvancedFilters = false

  // 간소화된 필터 옵션들 (실시간 업데이트)
  const filterOptions = [
    { 
      key: 'today',
      label: '오늘 할 일',
      count: works.filter(t => t.isToday && t.status !== WorkStatus.COMPLETED).length
    },
    { 
      key: 'in-progress',
      label: '진행 중',
      count: works.filter(t => t.status === WorkStatus.IN_PROGRESS).length
    },
    { 
      key: 'completed',
      label: '완료됨',
      count: works.filter(t => t.status === WorkStatus.COMPLETED).length
    },
    { 
      key: 'high-priority',
      label: '중요 업무',
      count: works.filter(t => t.priority === WorkPriority.HIGH || t.priority === WorkPriority.URGENT).length
    },
    { 
      key: 'all',
      label: '전체 업무',
      count: works.length
    }
  ]

  // 통합 필터링 로직 (기본 + 캘린더 + 상세 필터)
  const filteredWorks = works.filter(task => {
    // 1. 기본 필터 적용
    let includeTask = !activeFilters.length
    
    if (activeFilters.length > 0) {
      includeTask = activeFilters.some(filter => {
        switch (filter) {
          case 'today':
            return task.isToday && task.status !== WorkStatus.COMPLETED
          case 'in-progress':
            return task.status === WorkStatus.IN_PROGRESS
          case 'completed':
            return task.status === WorkStatus.COMPLETED
          case 'high-priority':
            return (task.priority === WorkPriority.HIGH || task.priority === WorkPriority.URGENT) && 
                   task.status !== WorkStatus.COMPLETED
          case 'all':
            return true
          default:
            return true
        }
      })
    }

    // 2. 캘린더 필터 적용
    if (showNoDue || showOverdue) {
      const today = new Date()
      const taskDueDate = task.dueDate ? new Date(task.dueDate) : null
      
      let calendarMatch = false
      
      if (showNoDue && !taskDueDate) {
        calendarMatch = true
      }
      
      if (showOverdue && taskDueDate && taskDueDate < today && task.status !== WorkStatus.COMPLETED) {
        calendarMatch = true  
      }
      
      includeTask = includeTask && calendarMatch
    }

    // 상세 필터 제거됨 - 간단한 인터페이스를 위해
    
    return includeTask
  })

  // 경험치 계산 함수
  const calculateExperience = (task: WorklyWork): number => {
    let baseXP = 10 // 기본 경험치
    
    // 우선순위별 경험치 배수
    switch (task.priority) {
      case WorkPriority.URGENT:
        baseXP *= 3
        break
      case WorkPriority.HIGH:
        baseXP *= 2
        break
      case WorkPriority.MEDIUM:
        baseXP *= 1.5
        break
      case WorkPriority.LOW:
        baseXP *= 1
        break
    }
    
    // 업무 유형별 추가 경험치
    switch (task.type) {
      case WorkType.EPIC:
        baseXP += 50
        break
      case WorkType.FEATURE:
        baseXP += 30
        break
      case WorkType.BUG:
        baseXP += 20
        break
      case WorkType.IMPROVEMENT:
        baseXP += 15
        break
    }
    
    // 연체된 업무 완료 시 보너스
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate)
      const today = new Date()
      if (dueDate < today) {
        baseXP *= 1.5 // 연체 업무 완료 보너스
      }
    }
    
    return Math.round(baseXP)
  }

  // 업무 완료 토글 핸들러
  const handleToggleComplete = async (taskId: string, completed: boolean): Promise<{ xpGained?: number }> => {
    try {
      const task = works.find(t => t.id === taskId)
      if (!task) return { xpGained: 0 }

      // 낙관적 업데이트
      setWorks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId 
            ? { ...t, status: completed ? WorkStatus.COMPLETED : WorkStatus.TODO }
            : t
        )
      )

      // 백엔드 API 호출
      const newStatus = completed ? WorkStatus.COMPLETED : WorkStatus.TODO
      console.log('🔄 API 호출:', { taskId, completed, newStatus })
      // TODO: 실제 API 호출로 교체
      console.log('Mock API call - task status update:', { taskId, newStatus })

      // 완료 시 경험치 획득 및 프로젝트 진행률 업데이트
      if (completed) {
        const xpGained = calculateExperience(task)
        console.log(`🎉 업무 완료! +${xpGained}XP 획득`)
        
        // TODO: 실제 사용자 경험치 업데이트 API 호출
        // await api.post('/api/v1/users/me/experience', { amount: xpGained })
        
        // TODO: 프로젝트 진행률 업데이트
        if (task.projectId) {
          console.log(`📊 프로젝트 진행률 업데이트: ${task.projectId}`)
          // await api.patch(`/api/v1/projects/${task.projectId}/update-progress`)
        }
        
        return { xpGained }
      }
      
      return { xpGained: 0 }

    } catch (error) {
      console.error('업무 상태 변경 실패:', error)
      
      // 실패 시 롤백
      setWorks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId 
            ? { ...t, status: completed ? WorkStatus.TODO : WorkStatus.COMPLETED }
            : t
        )
      )
      
      throw error
    }
  }

  // 데이터 로딩 함수
  const loadTasks = async () => {
    if (!isAuthenticated()) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      // TODO: 실제 API 호출로 교체
      console.log('Mock API call - get all tasks')
      const response = { 
        items: [], 
        data: [], 
        total: 0, 
        page: 1, 
        limit: 10 
      } as PaginatedResponse<BackendWork>
      
      // items 배열에서 실제 태스크 데이터 추출
      const backendWorks = (response as any).items || (response as any).data || []
      
      // 프론트엔드 형식으로 변환
      const transformedWorks = backendWorks.map(transformBackendWork)
      
      setWorks(transformedWorks)
    } catch (err) {
      console.error('업무 로딩 실패:', err)
      setError('업무를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 로그인 상태 확인 및 데이터 로딩
  useEffect(() => {
    const loggedIn = isAuthenticated()
    setIsLoggedIn(loggedIn)
    
    if (loggedIn) {
      loadTasks()
    } else {
      setIsLoading(false)
    }
  }, [])

  // URL 쿼리 파라미터에서 필터 상태 초기화
  useEffect(() => {
    const filters = searchParams.get('filters')
    const advanced = searchParams.get('advanced')
    
    if (filters) {
      try {
        const parsedFilters = JSON.parse(decodeURIComponent(filters))
        if (Array.isArray(parsedFilters)) {
          setActiveFilters(parsedFilters)
        }
      } catch (e) {
        console.warn('Invalid filters in URL:', e)
        setActiveFilters([]) // 파싱 실패 시 빈 배열
      }
    } else {
      // URL에 필터가 없으면 빈 상태로 유지
      setActiveFilters([])
    }
    
    // advanced 파라미터 제거됨 - 간단한 필터만 사용
  }, [searchParams])

  // 필터 상태가 변경될 때 URL 업데이트
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (activeFilters.length > 0) {
      params.set('filters', encodeURIComponent(JSON.stringify(activeFilters)))
    }
    
    // 상세 필터 URL 파라미터 제거됨
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    window.history.replaceState({}, '', newUrl)
  }, [activeFilters, hasAdvancedFilters])


  const handleTaskClick = async (task: WorklyWork) => {
    try {
      // 실제 API에서 상세 정보 가져오기
      // worklyAPI는 deprecated이므로 목업 데이터 사용
      const taskDetail = {
        ...task,
        // WorkDetail에 필요한 추가 필드들
        descriptionMarkdown: task.description || '',
        checklist: [],
        relationships: [],
        wikiReferences: [],
        reporterId: task.assignee?.id || task.assigneeId,
        reporter: task.assignee || { id: task.assigneeId, firstName: '담당', lastName: '자', email: 'user@workly.com' },
        actualHours: 0,
        progress: 0,
        customFields: {},
        subworks: [],
        labels: [],
        estimatedTimeMinutes: 0,
        loggedTimeMinutes: 0,
        comments: [],
        dependencies: [],
        dependents: [],
        watchers: [],
        timeEntries: []
      } as WorkDetail
      
      setSelectedWork(taskDetail)
      setIsWorkDetailOpen(true)
    } catch (error) {
      console.error('업무 상세 정보 로딩 실패:', error)
      // 에러 시 기본 WorkDetail 생성
      const basicWorkDetail: WorkDetail = {
        ...task,
        descriptionMarkdown: task.description || '',
        checklist: [],
        relationships: [],
        wikiReferences: [],
        reporterId: task.assigneeId || 'unknown',
        actualHours: 0,
        progress: 0,
        customFields: {},
        subworks: [],
        labels: [],
        comments: [],
        dependencies: [],
        dependents: [],
        watchers: [],
        timeEntries: [],
        estimatedTimeMinutes: undefined,
        loggedTimeMinutes: 0,
      }
      
      setSelectedWork(basicWorkDetail)
      setIsWorkDetailOpen(true)
    }
  }
  
  // 업무 상세 저장 핸들러
  const handleWorkDetailSave = async (taskDetail: WorkDetail) => {
    if (!isAuthenticated()) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      // 상세 정보 업데이트 API 호출
      const updateData = {
        title: taskDetail.title,
        description: taskDetail.description,
        dueDate: taskDetail.dueDate,
        estimatedHours: taskDetail.estimatedTimeMinutes ? taskDetail.estimatedTimeMinutes / 60 : undefined,
        descriptionMarkdown: taskDetail.descriptionMarkdown,
        estimatedTimeMinutes: taskDetail.estimatedTimeMinutes,
        loggedTimeMinutes: taskDetail.loggedTimeMinutes,
        // 체크리스트, 관계, 위키 참조는 일단 제외
      }

      // TODO: 실제 API 호출로 교체
      console.log('Mock API call - update task detail:', { taskId: taskDetail.id, updateData })
      const updatedBackendWork = { id: taskDetail.id } as BackendWork
      
      // 백엔드 응답을 프론트엔드 형식으로 변환
      const updatedTask = transformBackendWork(updatedBackendWork)

      // 로컬 상태 업데이트
      setWorks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskDetail.id ? updatedTask : task
        )
      )
    } catch (err) {
      console.error('업무 상세 저장 실패:', err)
      alert('업무 상세 정보 저장에 실패했습니다.')
    }
  }

  // PRD 명세: 빠른 추가 - Enter 입력 시 새 업무가 리스트 최상단에 생성
  const handleQuickAddTask = async (title: string) => {
    if (!isAuthenticated()) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      // TODO: 실제 API 호출로 교체
      console.log('Mock API call - create task:', { title })
      const newBackendWork = { 
        id: 'mock-' + Date.now(),
        title,
        status: WorkStatus.TODO,
        priority: WorkPriority.MEDIUM,
        type: WorkType.WORK,
        tags: [],
        assigneeId: 'mock-user',
        assignee: { id: 'mock-user', name: 'Mock User', email: 'mock@example.com' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as BackendWork

      // 백엔드 응답을 프론트엔드 형식으로 변환
      const newTask = transformBackendWork(newBackendWork)

      // 리스트 최상단에 추가
      setWorks(prevTasks => [newTask, ...prevTasks])
      
      // 새로 생성된 업무 애니메이션 적용
      setNewlyCreatedTaskId(newTask.id)
      
      // 500ms 후 애니메이션 상태 제거
      setTimeout(() => {
        setNewlyCreatedTaskId(null)
      }, 500)
    } catch (err) {
      console.error('업무 생성 실패:', err)
      alert('업무 생성에 실패했습니다.')
    }
  }

  // 정리 마법사: 업무 업데이트
  const handleTaskUpdate = async (taskId: string, updates: Partial<WorklyWork>) => {
    if (!isAuthenticated()) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      // 백엔드 업데이트 데이터 준비
      const updateData: any = {}
      
      if (updates.title) updateData.title = updates.title
      if (updates.description) updateData.description = updates.description
      if (updates.status) updateData.status = updates.status
      if (updates.priority) updateData.priority = updates.priority
      if (updates.type) updateData.type = updates.type
      if (updates.dueDate) updateData.dueDate = updates.dueDate
      if (updates.scheduledDate) updateData.startDate = updates.scheduledDate
      if (updates.tags) updateData.tags = updates.tags

      // TODO: 실제 API 호출로 교체
      console.log('Mock API call - update task:', { taskId, updateData })
      const updatedBackendWork = { id: taskId, ...updateData } as BackendWork

      // 백엔드 응답을 프론트엔드 형식으로 변환
      const updatedTask = transformBackendWork(updatedBackendWork)

      // 로컬 상태 업데이트
      setWorks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? updatedTask : task
        )
      )
    } catch (err) {
      console.error('업무 수정 실패:', err)
      alert('업무 수정에 실패했습니다.')
    }
  }

  // 정리 마법사: 업무 삭제 (30일간 휴지통)
  const handleTaskDelete = async (taskId: string) => {
    if (!isAuthenticated()) {
      alert('로그인이 필요합니다.')
      return
    }

    if (!confirm('이 업무를 삭제하시겠습니까?')) {
      return
    }

    try {
      // TODO: 실제 API 호출로 교체
      console.log('Mock API call - delete task:', { taskId })

      // 로컬 상태에서 제거
      setWorks(prevTasks => prevTasks.filter(task => task.id !== taskId))
    } catch (err) {
      console.error('업무 삭제 실패:', err)
      alert('업무 삭제에 실패했습니다.')
    }
  }

  // 드래그 앤 드롭 핸들러들
  const handleDragStart = (taskId: string) => {
    setDraggingTaskId(taskId)
    setIsDragMode(true)
    
    // 달력이 닫혀있을 때만 열기
    if (!isCalendarExpanded) {
      setIsCalendarExpanded(true)
    }
    
    // 햅틱 피드백 (지원되는 경우)
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  const handleDragEnd = () => {
    setDraggingTaskId(null)
    setIsDragMode(false)
    // 캘린더는 날짜 선택 시 자동으로 닫히므로 여기서는 닫지 않음
  }

  const handleDateSelect = (date: Date) => {
    if (draggingTaskId) {
      // 드래그 중인 업무의 마감일 설정
      handleTaskUpdate(draggingTaskId, {
        dueDate: date.toISOString()
      })
      console.log(`업무 ${draggingTaskId}의 마감일을 ${date.toLocaleDateString('ko-KR')}로 설정`)
      
      // 드래그 앤 드롭인 경우 달력을 열어둠
      setIsDragMode(false)
      setDraggingTaskId(null)
      // setIsCalendarExpanded는 호출하지 않음 - 달력 유지
    } else {
      // 일반 클릭인 경우에만 달력 닫기
      setIsCalendarExpanded(false)
    }
  }

  const handleCalendarClose = () => {
    setIsCalendarExpanded(false)
    setIsDragMode(false)
    setDraggingTaskId(null)
  }

  const handleCalendarToggle = () => {
    setIsCalendarExpanded(!isCalendarExpanded)
    if (!isCalendarExpanded) {
      // 펼칠 때는 드래그 모드가 아닌 일반 모드
      setIsDragMode(false)
      setDraggingTaskId(null)
    }
  }

  // 스와이프 액션 핸들러들
  const handleTaskDelegate = (taskId: string) => {
    console.log('위임:', taskId)
    // TODO: 위임 기능 구현
  }

  const handleTaskDefer = (taskId: string) => {
    console.log('보류:', taskId)
    // TODO: 보류 기능 구현
    handleTaskUpdate(taskId, { status: WorkStatus.DEFERRED })
  }

  const handleTaskConvertToProject = (taskId: string) => {
    console.log('프로젝트로 전환:', taskId)
    // TODO: 프로젝트 전환 기능 구현
  }

  // 날짜별 업무 개수 계산
  const getTasksWithDates = () => {
    const tasksWithDates: { [dateKey: string]: number } = {}
    
    works.forEach(task => {
      if (task.dueDate) {
        const dateKey = task.dueDate.split('T')[0] // YYYY-MM-DD 형식
        tasksWithDates[dateKey] = (tasksWithDates[dateKey] || 0) + 1
      }
    })
    
    return tasksWithDates
  }

  // 에러 발생 시 에러 화면 표시
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <ContentHeader title="Work" />
        <MainContainer>
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-red-600 mb-4">
                <ClipboardDocumentIcon className="w-16 h-16 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">오류가 발생했습니다</h3>
              </div>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  loadTasks()
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        </MainContainer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <ContentHeader title="Work" />
      
      {/* 로그인 배너 (헤더 바깥) */}
      <LoginBanner />
      
      {/* 메인 콘텐츠 */}
      <MainContainer className="pb-20 md:pb-20">
        {/* 필터 관리자 제거됨 - 더 간결한 인터페이스를 위해 */}

        {/* 업무 목록 */}
        <div className="workly-list-card overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="workly-caption mt-2">업무를 불러오는 중...</p>
            </div>
          ) : filteredWorks.length === 0 ? (
            <div className="p-8 text-center">
              <ClipboardDocumentIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="workly-card-title text-gray-600 mb-1">Work가 없습니다</h3>
              <p className="workly-caption mb-4">하단의 입력창에서 새로운 업무를 추가해보세요!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredWorks.map((task) => (
                <div 
                  key={task.id}
                  className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                >
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {task.priority} 우선순위
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </MainContainer>
      
      {/* 데스크톱: 메인 컨텐츠 영역(720px) 하단에 fixed 고정 */}
      {isLoggedIn && (
        <div className="hidden md:block fixed bottom-4 left-[76px] right-0 z-[65]">
          <div className="w-full max-w-[720px] mx-auto">
            <QuickAddInput
              placeholder="무엇을 해야 하나요?"
              onTaskCreate={handleQuickAddTask}
            />
          </div>
        </div>
      )}
      
      {/* 모바일: 하단 네비게이션 바로 위에 fixed 고정 */}
      {isLoggedIn && (
        <div className="md:hidden fixed left-0 right-0 bottom-16 bg-white border-t border-gray-200 px-4 pt-3 pb-4 z-[65]">
          <QuickAddInput
            placeholder="무엇을 해야 하나요?"
            onTaskCreate={handleQuickAddTask}
          />
        </div>
      )}
      
      {/* 캘린더 기능 제거됨 - 목업 상태였음 */}
      
      {/* 캘린더 토글 FAB - 임시 숨김 */}
      {false && (
        <div className={`
          fixed right-4 md:right-6 z-[70] transition-all duration-300
          ${isCalendarExpanded 
            ? 'bottom-[560px] md:bottom-[480px]' 
            : 'bottom-[88px] md:bottom-6'
          }
        `}>
          <CalendarToggleFAB 
            isCalendarExpanded={isCalendarExpanded}
            onToggle={handleCalendarToggle}
          />
        </div>
      )}
      
      {/* 상세 필터 패널 제거됨 - 간단한 필터만 사용 */}
      
      {/* 업무 상세 모달 제거됨 - 목업 상태였음 */}
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