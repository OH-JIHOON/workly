'use client'

import { useState, useEffect } from 'react'
import { 
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  BoltIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import { Task, TaskStatus, TaskPriority } from '@/types/task.types'

// 목업 오늘의 업무 데이터
const mockTodayTasks: Task[] = [
  {
    id: '1',
    title: '사용자 피드백 정리 및 분석',
    description: '베타 테스트 사용자 피드백을 분석하고 개선 방향 수립',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    projectId: 'proj-1',
    project: { id: 'proj-1', name: '워클리 플랫폼 개선', color: '#3B82F6' },
    assigneeId: 'user1',
    assignee: { id: 'user1', name: '김워클리', email: 'workly@example.com' },
    dueDate: new Date().toISOString(),
    estimatedHours: 4,
    actualHours: 2.5,
    completionRate: 60,
    tags: ['분석', '피드백', 'UX'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'API 성능 최적화',
    description: '사용자 대시보드 API 응답 시간 개선',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    projectId: 'proj-2',
    project: { id: 'proj-2', name: '백엔드 최적화', color: '#10B981' },
    assigneeId: 'user1',
    assignee: { id: 'user1', name: '김워클리', email: 'workly@example.com' },
    dueDate: new Date().toISOString(),
    estimatedHours: 3,
    actualHours: 0,
    completionRate: 0,
    tags: ['성능', 'API', '최적화'],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    title: '팀 회의 준비',
    description: '주간 스프린트 회의 아젠다 작성',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.LOW,
    assigneeId: 'user1',
    assignee: { id: 'user1', name: '김워클리', email: 'workly@example.com' },
    dueDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    estimatedHours: 1,
    actualHours: 0.5,
    completionRate: 100,
    tags: ['회의', '계획'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  }
]

interface ExecuteWorkflowDashboardProps {
  className?: string
}

export default function ExecuteWorkflowDashboard({ className = '' }: ExecuteWorkflowDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>(mockTodayTasks)
  const [focusMode, setFocusMode] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0) // 분 단위
  const [currentFocusTask, setCurrentFocusTask] = useState<Task | null>(null)

  // 통계 계산
  const todayStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
    inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    todo: tasks.filter(t => t.status === TaskStatus.TODO).length,
    totalEstimated: tasks.reduce((acc, task) => acc + (task.estimatedHours || 0), 0),
    totalActual: tasks.reduce((acc, task) => acc + (task.actualHours || 0), 0),
    completionRate: Math.round(
      (tasks.filter(t => t.status === TaskStatus.COMPLETED).length / tasks.length) * 100
    )
  }

  // 집중 모드 시간 추적
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (focusMode && currentFocusTask) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1)
      }, 60000) // 1분마다 업데이트
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [focusMode, currentFocusTask])

  const handleStartFocus = (task: Task) => {
    setCurrentFocusTask(task)
    setFocusMode(true)
    setTimeSpent(0)
  }

  const handleStopFocus = () => {
    setFocusMode(false)
    setCurrentFocusTask(null)
    // 실제로는 시간 기록을 저장
  }

  const handleTaskStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: newStatus,
            completedAt: newStatus === TaskStatus.COMPLETED ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString()
          }
        : task
    ))
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT: return 'text-red-600 bg-red-100'
      case TaskPriority.HIGH: return 'text-blue-600 bg-blue-100'
      case TaskPriority.MEDIUM: return 'text-blue-600 bg-blue-100'
      case TaskPriority.LOW: return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO: return 'text-gray-600 bg-gray-100'
      case TaskStatus.IN_PROGRESS: return 'text-blue-600 bg-blue-100'
      case TaskStatus.COMPLETED: return 'text-green-600 bg-green-100'
      case TaskStatus.ON_HOLD: return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 집중 모드 배너 */}
      {focusMode && currentFocusTask && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <BoltIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">집중 모드 활성</h3>
                <p className="text-sm opacity-90">{currentFocusTask.title}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
              <button
                onClick={handleStopFocus}
                className="text-sm px-3 py-1 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 mt-1"
              >
                종료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 오늘의 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">완료율</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{todayStats.completionRate}%</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">완료</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{todayStats.completed}/{todayStats.total}</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-gray-600">예상 시간</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{todayStats.totalEstimated}h</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center space-x-2">
            <FireIcon className="w-5 h-5 text-red-600" />
            <span className="text-sm text-gray-600">실제 시간</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{todayStats.totalActual}h</div>
        </div>
      </div>

      {/* 오늘의 업무 목록 */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">오늘의 업무</h2>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </span>
          </div>
        </div>
        
        <div className="divide-y">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status === TaskStatus.TODO ? '대기' :
                       task.status === TaskStatus.IN_PROGRESS ? '진행중' :
                       task.status === TaskStatus.COMPLETED ? '완료' : '보류'}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {task.project && (
                      <div className="flex items-center space-x-1">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: task.project.color }}
                        />
                        <span>{task.project.name}</span>
                      </div>
                    )}
                    <span>{task.estimatedHours}h 예상</span>
                    {task.actualHours > 0 && (
                      <span>{task.actualHours}h 소요</span>
                    )}
                  </div>
                  
                  {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {task.status !== TaskStatus.COMPLETED && (
                    <button
                      onClick={() => handleStartFocus(task)}
                      disabled={focusMode}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50"
                      title="집중 모드 시작"
                    >
                      <PlayIcon className="w-4 h-4" />
                    </button>
                  )}
                  
                  <select
                    value={task.status}
                    onChange={(e) => handleTaskStatusChange(task.id, e.target.value as TaskStatus)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value={TaskStatus.TODO}>대기</option>
                    <option value={TaskStatus.IN_PROGRESS}>진행중</option>
                    <option value={TaskStatus.COMPLETED}>완료</option>
                    <option value={TaskStatus.ON_HOLD}>보류</option>
                  </select>
                </div>
              </div>
              
              {/* 진행률 바 */}
              {task.completionRate > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">진행률</span>
                    <span className="font-medium">{task.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${task.completionRate}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {tasks.length === 0 && (
          <div className="p-8 text-center">
            <CalendarDaysIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-1">오늘 할 일이 없습니다</h3>
            <p className="text-gray-500 text-sm">수집함에서 새로운 업무를 계획해보세요!</p>
          </div>
        )}
      </div>
    </div>
  )
}