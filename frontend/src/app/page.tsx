'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import FloatingActionButton from '@/components/ui/FloatingActionButton'
import HomeTaskDashboard from '@/components/home/HomeTaskDashboard'
import TaskCreationWizard from '@/components/tasks/TaskCreationWizard'
import { isAuthenticated } from '@/lib/auth'
import { GTDTask, TaskStatus, TaskPriority, TaskType, CreateTaskDto } from '@/types/task.types'

// 임시 목업 데이터 (실제로는 API에서 가져옴)
const mockTasks: GTDTask[] = [
  {
    id: '1',
    title: '프로젝트 기획서 작성',
    description: '새로운 프로젝트의 기획서를 작성하고 팀과 공유',
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    type: TaskType.TASK,
    dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6시간 후
    estimatedHours: 3,
    projectId: 'proj1',
    assigneeId: 'user1',
    reporterId: 'user1',
    actualHours: 0,
    progress: 0,
    tags: ['기획', '문서'],
    customFields: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [],
    labels: [],
    comments: [],
    dependencies: [],
    dependents: [],
    watchers: [],
    timeEntries: [],
    reporter: { id: 'user1', firstName: '김', lastName: '워클리', email: 'user@workly.com' },
    project: { id: 'proj1', name: '워클리 플랫폼', description: '핵심 플랫폼 개발', ownerId: 'user1' },
    // GTD 확장 필드
    momentumScore: { reach: 0, impact: 0, confidence: 0, effort: 0, total: 0 },
    gtdContext: 'next',
    isActionable: true,
    canComplete2Minutes: false,
    clarified: true
  },
  {
    id: '2',
    title: '디자인 시스템 업데이트',
    description: '새로운 컴포넌트들을 디자인 시스템에 추가',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    type: TaskType.IMPROVEMENT,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1일 후
    estimatedHours: 4,
    assigneeId: 'user1',
    reporterId: 'user1',
    actualHours: 1,
    progress: 25,
    tags: ['디자인', 'UI'],
    customFields: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [],
    labels: [],
    comments: [],
    dependencies: [],
    dependents: [],
    watchers: [],
    timeEntries: [],
    reporter: { id: 'user1', firstName: '김', lastName: '워클리', email: 'user@workly.com' },
    momentumScore: { reach: 0, impact: 0, confidence: 0, effort: 0, total: 0 },
    gtdContext: 'next',
    isActionable: true,
    canComplete2Minutes: false,
    clarified: true
  },
  {
    id: '3',
    title: 'API 문서 검토',
    description: '백엔드 API 문서를 검토하고 피드백 제공',
    status: TaskStatus.DONE,
    priority: TaskPriority.MEDIUM,
    type: TaskType.TASK,
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전 완료
    estimatedHours: 1,
    assigneeId: 'user1',
    reporterId: 'user1',
    actualHours: 1,
    progress: 100,
    tags: ['개발', '문서'],
    customFields: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [],
    labels: [],
    comments: [],
    dependencies: [],
    dependents: [],
    watchers: [],
    timeEntries: [],
    reporter: { id: 'user1', firstName: '김', lastName: '워클리', email: 'user@workly.com' },
    momentumScore: { reach: 0, impact: 0, confidence: 0, effort: 0, total: 0 },
    gtdContext: 'next',
    isActionable: true,
    canComplete2Minutes: false,
    clarified: true
  },
  {
    id: '4',
    title: '보안 취약점 점검',
    description: '시스템 전반의 보안 취약점 분석 및 개선',
    status: TaskStatus.TODO,
    priority: TaskPriority.URGENT,
    type: TaskType.BUG,
    dueDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1시간 전 마감 (지남)
    estimatedHours: 6,
    assigneeId: 'user1',
    reporterId: 'user1',
    actualHours: 0,
    progress: 0,
    tags: ['보안', '점검'],
    customFields: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [],
    labels: [],
    comments: [],
    dependencies: [],
    dependents: [],
    watchers: [],
    timeEntries: [],
    reporter: { id: 'user1', firstName: '김', lastName: '워클리', email: 'user@workly.com' },
    momentumScore: { reach: 0, impact: 0, confidence: 0, effort: 0, total: 0 },
    gtdContext: 'next',
    isActionable: true,
    canComplete2Minutes: false,
    clarified: true
  },
  {
    id: '5',
    title: '이메일 확인하기',
    description: '오늘 받은 중요한 이메일들 확인',
    status: TaskStatus.TODO,
    priority: TaskPriority.LOW,
    type: TaskType.TASK,
    estimatedHours: 0.1,
    assigneeId: 'user1',
    reporterId: 'user1',
    actualHours: 0,
    progress: 0,
    tags: ['일상', '커뮤니케이션'],
    customFields: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [],
    labels: [],
    comments: [],
    dependencies: [],
    dependents: [],
    watchers: [],
    timeEntries: [],
    reporter: { id: 'user1', firstName: '김', lastName: '워클리', email: 'user@workly.com' },
    momentumScore: { reach: 0, impact: 0, confidence: 0, effort: 0, total: 0 },
    gtdContext: 'next',
    isActionable: true,
    canComplete2Minutes: true,
    clarified: true
  },
  {
    id: '6',
    title: '새로운 아이디어 정리',
    description: '브레인스토밍에서 나온 아이디어들을 정리하고 분류',
    status: TaskStatus.TODO,
    priority: TaskPriority.LOW,
    type: TaskType.TASK,
    assigneeId: 'user1',
    reporterId: 'user1',
    actualHours: 0,
    progress: 0,
    tags: ['아이디어', '정리'],
    customFields: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [],
    labels: [],
    comments: [],
    dependencies: [],
    dependents: [],
    watchers: [],
    timeEntries: [],
    reporter: { id: 'user1', firstName: '김', lastName: '워클리', email: 'user@workly.com' },
    momentumScore: { reach: 0, impact: 0, confidence: 0, effort: 0, total: 0 },
    gtdContext: 'someday',
    isActionable: true,
    canComplete2Minutes: false,
    clarified: false
  }
]

export default function HomePage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<GTDTask[]>(mockTasks)
  const [isLoading, setIsLoading] = useState(false)
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  useEffect(() => {
    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    if (!isAuthenticated()) {
      router.push('/auth/login')
    }
  }, [router])

  // 업무 완료/미완료 토글
  const handleTaskToggle = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE,
              completedAt: task.status === TaskStatus.DONE ? undefined : new Date().toISOString(),
              progress: task.status === TaskStatus.DONE ? 0 : 100
            }
          : task
      )
    )
  }

  // 업무 편집 (임시로 콘솔 로그)
  const handleTaskEdit = (task: GTDTask) => {
    console.log('Edit task:', task.title)
    // TODO: 업무 편집 모달 또는 페이지로 이동
  }

  // 새 업무 생성 위자드 열기
  const handleCreateTask = () => {
    setIsWizardOpen(true)
  }

  // 위자드에서 업무 생성 완료
  const handleTaskCreated = (taskData: CreateTaskDto) => {
    const newId = (Math.max(...tasks.map(t => parseInt(t.id))) + 1).toString()
    
    const newTask: GTDTask = {
      id: newId,
      title: taskData.title,
      description: taskData.description,
      status: TaskStatus.TODO,
      priority: taskData.priority || TaskPriority.MEDIUM,
      type: taskData.type || TaskType.TASK,
      dueDate: taskData.dueDate,
      estimatedHours: taskData.estimatedHours,
      projectId: taskData.projectId,
      assigneeId: taskData.assigneeId || 'user1',
      reporterId: 'user1',
      actualHours: 0,
      progress: 0,
      tags: taskData.tags || [],
      customFields: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [],
      labels: [],
      comments: [],
      dependencies: [],
      dependents: [],
      watchers: [],
      timeEntries: [],
      reporter: { id: 'user1', firstName: '김', lastName: '워클리', email: 'user@workly.com' },
      project: taskData.projectId ? { id: taskData.projectId, name: '워클리 플랫폼', description: '핵심 플랫폼 개발', ownerId: 'user1' } : undefined,
      // GTD 확장 필드
      momentumScore: { reach: 0, impact: 0, confidence: 0, effort: 0, total: 0 },
      gtdContext: 'next',
      isActionable: true,
      canComplete2Minutes: taskData.estimatedHours ? taskData.estimatedHours <= 0.1 : false,
      clarified: true
    }

    setTasks(prevTasks => [newTask, ...prevTasks])
    setIsWizardOpen(false)
    
    console.log('새 업무 생성됨:', newTask.title)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header 
        title="워클리" 
        showDropdown={false}
      />
      
      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-6" role="main">
        {/* GTD 기반 홈 대시보드 */}
        <HomeTaskDashboard
          tasks={tasks}
          onTaskToggle={handleTaskToggle}
          onTaskEdit={handleTaskEdit}
          onCreateTask={handleCreateTask}
          isLoading={isLoading}
        />
      </main>
      
      {/* 플로팅 액션 버튼 */}
      <FloatingActionButton 
        onAddTask={handleCreateTask}
        onAddProject={() => console.log('프로젝트 추가')}
        onAddPost={() => console.log('게시글 추가')}
      />
      
      {/* 업무 생성 위자드 */}
      <TaskCreationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSubmit={handleTaskCreated}
        projects={[
          { id: 'proj1', name: '워클리 플랫폼' },
          { id: 'proj2', name: '마케팅 캠페인' },
          { id: 'proj3', name: '고객 지원 개선' }
        ]}
      />
    </div>
  )
}