'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  ClipboardDocumentIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  CalendarIcon,
  UserIcon,
  FlagIcon
} from '@heroicons/react/24/outline'
import Header from '@/components/layout/Header'
import MainContainer from '@/components/layout/MainContainer'
import SimpleFilterChips from '@/components/ui/SimpleFilterChips'
import CalendarToggleFAB from '@/components/ui/CalendarToggleFAB'
import LoginBanner from '@/components/ui/LoginBanner'
import QuickAddInput from '@/components/ui/QuickAddInput'
import ResponsiveTaskCard from '@/components/tasks/ResponsiveTaskCard'
import CollapsibleCalendar from '@/components/tasks/CollapsibleCalendar'
import { TaskStatus, TaskPriority, TaskType, TaskDetail } from '@/types/task.types'
import { isAuthenticated } from '@/lib/auth'
import { useCalendarFilterStore } from '@/lib/stores/calendarFilterStore'
import AdvancedFilterPanel, { AdvancedFilters } from '@/components/ui/AdvancedFilterPanel'
import TaskDetailModal from '@/components/tasks/TaskDetailModal'
import { api } from '@/lib/api'

// 워클리 업무 인터페이스 (레거시 GTDTask 대체)
interface WorklyTask {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  type: TaskType
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
interface BackendTask {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  type: TaskType
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


export default function TasksPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tasks, setTasks] = useState<WorklyTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>(['today'])
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 캘린더 상태 관리
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false)
  const [isDragMode, setIsDragMode] = useState(false)
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)

  
  // 캘린더 필터 상태 구독
  const { showNoDue, showOverdue } = useCalendarFilterStore()
  
  // 상세 필터 상태 관리
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({})
  
  // 업무 상세 모달 상태 관리
  const [selectedTask, setSelectedTask] = useState<TaskDetail | null>(null)
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)
  
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
  const transformBackendTask = (backendTask: BackendTask): WorklyTask => {
    const today = new Date()
    const dueDate = backendTask.dueDate ? new Date(backendTask.dueDate) : null
    
    return {
      id: backendTask.id,
      title: backendTask.title,
      description: backendTask.description,
      status: backendTask.status,
      priority: backendTask.priority,
      type: backendTask.type,
      goalId: backendTask.goalId,
      projectId: backendTask.projectId,
      assigneeId: backendTask.assigneeId,
      assignee: {
        id: backendTask.assignee.id,
        name: `${backendTask.assignee.firstName} ${backendTask.assignee.lastName}`,
        email: backendTask.assignee.email
      },
      dueDate: backendTask.dueDate,
      scheduledDate: backendTask.startDate,
      tags: backendTask.tags || [],
      createdAt: backendTask.createdAt,
      updatedAt: backendTask.updatedAt,
      // 오늘 할 일 계산: 마감일이 오늘이거나 이미 지났고 완료되지 않은 업무
      isToday: dueDate ? (dueDate <= today && backendTask.status !== TaskStatus.DONE) : false,
      isFocused: backendTask.priority === TaskPriority.URGENT || backendTask.priority === TaskPriority.HIGH
    }
  }
  
  // 상세 필터가 활성화되었는지 확인
  const hasAdvancedFilters = Boolean(
    advancedFilters.dueDate || 
    advancedFilters.status?.length || 
    advancedFilters.projectIds?.length || 
    advancedFilters.goalIds?.length
  )

  // 간소화된 필터 옵션들 (실시간 업데이트)
  const filterOptions = [
    { 
      key: 'today',
      label: '오늘 할 일',
      count: tasks.filter(t => t.isToday && t.status !== TaskStatus.DONE).length
    },
    { 
      key: 'in-progress',
      label: '진행 중',
      count: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length
    },
    { 
      key: 'completed',
      label: '완료됨',
      count: tasks.filter(t => t.status === TaskStatus.DONE).length
    },
    { 
      key: 'high-priority',
      label: '중요 업무',
      count: tasks.filter(t => t.priority === TaskPriority.HIGH || t.priority === TaskPriority.URGENT).length
    },
    { 
      key: 'all',
      label: '전체 업무',
      count: tasks.length
    }
  ]

  // 통합 필터링 로직 (기본 + 캘린더 + 상세 필터)
  const filteredTasks = tasks.filter(task => {
    // 1. 기본 필터 적용
    let includeTask = !activeFilters.length
    
    if (activeFilters.length > 0) {
      includeTask = activeFilters.some(filter => {
        switch (filter) {
          case 'today':
            return task.isToday && task.status !== TaskStatus.DONE
          case 'in-progress':
            return task.status === TaskStatus.IN_PROGRESS
          case 'completed':
            return task.status === TaskStatus.DONE
          case 'high-priority':
            return (task.priority === TaskPriority.HIGH || task.priority === TaskPriority.URGENT) && 
                   task.status !== TaskStatus.DONE
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
      
      if (showOverdue && taskDueDate && taskDueDate < today && task.status !== TaskStatus.DONE) {
        calendarMatch = true  
      }
      
      includeTask = includeTask && calendarMatch
    }

    // 3. 상세 필터 적용
    if (hasAdvancedFilters) {
      let advancedMatch = true
      
      // 마감일 필터
      if (advancedFilters.dueDate) {
        const today = new Date()
        const taskDueDate = task.dueDate ? new Date(task.dueDate) : null
        
        switch (advancedFilters.dueDate) {
          case 'overdue':
            advancedMatch = advancedMatch && taskDueDate && taskDueDate < today && task.status !== TaskStatus.DONE
            break
          case 'today':
            advancedMatch = advancedMatch && taskDueDate && taskDueDate.toDateString() === today.toDateString()
            break
          case 'this-week':
            if (taskDueDate) {
              const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
              advancedMatch = advancedMatch && taskDueDate >= today && taskDueDate <= weekFromNow
            } else {
              advancedMatch = false
            }
            break
          case 'no-due':
            advancedMatch = advancedMatch && !taskDueDate
            break
        }
      }
      
      // 상태 필터
      if (advancedFilters.status?.length) {
        advancedMatch = advancedMatch && advancedFilters.status.includes(task.status)
      }
      
      // 프로젝트 필터
      if (advancedFilters.projectIds?.length) {
        advancedMatch = advancedMatch && task.projectId && advancedFilters.projectIds.includes(task.projectId)
      }
      
      // 목표 필터
      if (advancedFilters.goalIds?.length) {
        advancedMatch = advancedMatch && task.goalId && advancedFilters.goalIds.includes(task.goalId)
      }
      
      includeTask = includeTask && advancedMatch
    }
    
    return includeTask
  })

  // 데이터 로딩 함수
  const loadTasks = async () => {
    if (!isAuthenticated()) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      // 모든 업무 조회
      const backendTasks = await api.get<BackendTask[]>('/api/v1/tasks')
      
      // 프론트엔드 형식으로 변환
      const transformedTasks = backendTasks.map(transformBackendTask)
      
      setTasks(transformedTasks)
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
      }
    }
    
    if (advanced) {
      try {
        const parsedAdvanced = JSON.parse(decodeURIComponent(advanced))
        setAdvancedFilters(parsedAdvanced)
      } catch (e) {
        console.warn('Invalid advanced filters in URL:', e)
      }
    }
  }, [searchParams])

  // 필터 상태가 변경될 때 URL 업데이트
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (activeFilters.length > 0) {
      params.set('filters', encodeURIComponent(JSON.stringify(activeFilters)))
    }
    
    if (hasAdvancedFilters) {
      params.set('advanced', encodeURIComponent(JSON.stringify(advancedFilters)))
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    window.history.replaceState({}, '', newUrl)
  }, [activeFilters, advancedFilters, hasAdvancedFilters])


  const handleTaskClick = (task: WorklyTask) => {
    // WorklyTask를 TaskDetail로 변환
    const taskDetail: TaskDetail = {
      ...task,
      descriptionMarkdown: task.description,
      checklist: [
        { id: 'check-1', text: '기본 요구사항 검토', completed: false, order: 0 },
        { id: 'check-2', text: '설계 문서 작성', completed: true, order: 1 },
        { id: 'check-3', text: '코드 구현', completed: false, order: 2 }
      ],
      relationships: [],
      wikiReferences: [
        { id: 'wiki-1', title: '워클리 디자인 가이드', url: '/wiki/design-guide', description: '워클리 UI/UX 디자인 표준' },
        { id: 'wiki-2', title: 'CPER 워크플로우', url: '/wiki/cper', description: 'Capture-Plan-Execute-Review 방법론' }
      ],
      estimatedTimeMinutes: task.id === '1' ? 120 : undefined,
      loggedTimeMinutes: task.id === '1' ? 80 : undefined
    }
    
    setSelectedTask(taskDetail)
    setIsTaskDetailOpen(true)
  }
  
  // 업무 상세 저장 핸들러
  const handleTaskDetailSave = async (taskDetail: TaskDetail) => {
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

      const updatedBackendTask = await api.put<BackendTask>(`/api/v1/tasks/${taskDetail.id}/detail`, updateData)
      
      // 백엔드 응답을 프론트엔드 형식으로 변환
      const updatedTask = transformBackendTask(updatedBackendTask)

      // 로컬 상태 업데이트
      setTasks(prevTasks => 
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
      // 업무 생성 API 호출
      const newBackendTask = await api.post<BackendTask>('/api/v1/tasks', {
        title: title,
        priority: TaskPriority.MEDIUM, // 기본 우선순위
        type: TaskType.TASK,
        tags: []
      })

      // 백엔드 응답을 프론트엔드 형식으로 변환
      const newTask = transformBackendTask(newBackendTask)

      // 리스트 최상단에 추가
      setTasks(prevTasks => [newTask, ...prevTasks])
    } catch (err) {
      console.error('업무 생성 실패:', err)
      alert('업무 생성에 실패했습니다.')
    }
  }

  // 정리 마법사: 업무 업데이트
  const handleTaskUpdate = async (taskId: string, updates: Partial<WorklyTask>) => {
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

      // 업무 수정 API 호출
      const updatedBackendTask = await api.put<BackendTask>(`/api/v1/tasks/${taskId}`, updateData)

      // 백엔드 응답을 프론트엔드 형식으로 변환
      const updatedTask = transformBackendTask(updatedBackendTask)

      // 로컬 상태 업데이트
      setTasks(prevTasks => 
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
      // 업무 삭제 API 호출
      await api.delete(`/api/v1/tasks/${taskId}`)

      // 로컬 상태에서 제거
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))
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
    handleTaskUpdate(taskId, { status: TaskStatus.DEFERRED })
  }

  const handleTaskConvertToProject = (taskId: string) => {
    console.log('프로젝트로 전환:', taskId)
    // TODO: 프로젝트 전환 기능 구현
  }

  // 날짜별 업무 개수 계산
  const getTasksWithDates = () => {
    const tasksWithDates: { [dateKey: string]: number } = {}
    
    tasks.forEach(task => {
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
        <Header title="업무" />
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <Header title="업무" />
      
      {/* 로그인 배너 (헤더 바깥) */}
      <LoginBanner />
      
      {/* 메인 콘텐츠 */}
      <MainContainer>
        {/* 필터 관리자 - 로그인된 사용자만 표시 */}
        {isLoggedIn && (
          <div className="mb-4">
            <SimpleFilterChips
              options={filterOptions}
              activeFilters={activeFilters}
              onFilterChange={setActiveFilters}
              onAdvancedFilterClick={() => setShowAdvancedFilters(true)}
              hasAdvancedFilters={hasAdvancedFilters}
            />
          </div>
        )}

        {/* PRD 명세: 빠른 추가 입력창 - 로그인된 사용자만 표시 */}
        {isLoggedIn && (
          <div className="mb-4">
            <QuickAddInput
              placeholder="무엇을 해야 하나요?"
              onTaskCreate={handleQuickAddTask}
            />
          </div>
        )}

        {/* 업무 목록 */}
        <div className="workly-list-card overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="workly-caption mt-2">업무를 불러오는 중...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-8 text-center">
              <ClipboardDocumentIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="workly-card-title text-gray-600 mb-1">업무가 없습니다</h3>
              <p className="workly-caption mb-4">우측 하단의 수집함 버튼(+)을 눌러 업무를 추가해보세요!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTasks.map((task) => (
                <ResponsiveTaskCard
                  key={task.id}
                  task={task}
                  onClick={() => handleTaskClick(task)}
                  onDelete={handleTaskDelete}
                  onDelegate={handleTaskDelegate}
                  onDefer={handleTaskDefer}
                  onConvertToProject={handleTaskConvertToProject}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragMode={isDragMode}
                />
              ))}
            </div>
          )}
        </div>
      </MainContainer>
      
      {/* 접이식 캘린더 - 모바일 네비 덮어서 전체, 데스크톱 사이드바 제외 */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 z-[60]">
        <CollapsibleCalendar
          isExpanded={isCalendarExpanded}
          onDateSelect={handleDateSelect}
          onClose={handleCalendarClose}
          onToggle={handleCalendarToggle}
          tasksWithDates={getTasksWithDates()}
          keepOpenOnDrop={true}
          isDragMode={isDragMode}
        />
      </div>
      
      {/* 캘린더 토글 FAB - 캘린더 높이만큼 위로 이동 */}
      <div className={`
        fixed right-4 md:right-6 z-[70] transition-all duration-300
        ${isCalendarExpanded 
          ? 'bottom-[480px] md:bottom-[480px]' 
          : 'bottom-[72px] md:bottom-6'
        }
      `}>
        <CalendarToggleFAB 
          isCalendarExpanded={isCalendarExpanded}
          onToggle={handleCalendarToggle}
        />
      </div>
      
      {/* 상세 필터 패널 */}
      <AdvancedFilterPanel
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        availableProjects={availableProjects}
        availableGoals={availableGoals}
      />
      
      {/* 업무 상세 모달 */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskDetailOpen}
        onClose={() => {
          setIsTaskDetailOpen(false)
          setSelectedTask(null)
        }}
        onSave={handleTaskDetailSave}
      />
    </div>
  )
}