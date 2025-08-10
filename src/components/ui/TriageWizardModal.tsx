'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  XMarkIcon, 
  TrashIcon, 
  CalendarIcon,
  FolderIcon,
  FlagIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { WorklyTask } from '@/types/workly-core.types'
import { TaskStatus } from '@/types/task.types'

interface TriageWizardModalProps {
  isOpen: boolean
  onClose: () => void
  tasks: WorklyTask[] // 미분류 업무들
  onTaskUpdate: (taskId: string, updates: Partial<WorklyTask>) => void
  onTaskDelete: (taskId: string) => void
}

interface DragTarget {
  type: 'delete' | 'schedule' | 'project'
  label: string
  icon: React.ReactNode
  action: string
}

export default function TriageWizardModal({
  isOpen,
  onClose,
  tasks,
  onTaskUpdate,
  onTaskDelete
}: TriageWizardModalProps) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedOver, setDraggedOver] = useState<string | null>(null)
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null)
  const [swipeDistance, setSwipeDistance] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  // PRD 명세: 미분류 업무만 표시 (프로젝트/목표 소속 없음)
  const untriagedTasks = tasks.filter(task => 
    !task.projectId && !task.goalId && task.status !== TaskStatus.DONE
  )
  
  // 디버깅: 미분류 업무가 없으면 전체 업무 중 완료되지 않은 것들을 보여줌
  const availableTasks = untriagedTasks.length > 0 ? untriagedTasks : 
    tasks.filter(task => task.status !== TaskStatus.DONE)

  console.log('TriageWizardModal - 전체 업무:', tasks.length)
  console.log('TriageWizardModal - 미분류 업무:', untriagedTasks.length)
  console.log('TriageWizardModal - 사용할 업무:', availableTasks.length)

  const currentTask = availableTasks[currentTaskIndex]
  const hasNextTask = currentTaskIndex < availableTasks.length - 1
  const hasPrevTask = currentTaskIndex > 0
  const completedCount = currentTaskIndex

  // 드래그 타겟 정의
  const dragTargets: DragTarget[] = [
    {
      type: 'delete',
      label: '삭제 (30일간 휴지통 보관)',
      icon: <TrashIcon className="w-6 h-6" />,
      action: 'delete'
    },
    {
      type: 'schedule',
      label: '날짜 지정',
      icon: <CalendarIcon className="w-6 h-6" />,
      action: 'schedule'
    },
    {
      type: 'project',
      label: '프로젝트에 추가',
      icon: <FolderIcon className="w-6 h-6" />,
      action: 'project'
    }
  ]

  // 모달이 열릴 때 첫 번째 업무로 초기화
  useEffect(() => {
    if (isOpen) {
      setCurrentTaskIndex(0)
      setSwipeDistance(0)
    }
  }, [isOpen])

  // 빈 업무 목록이면 모달 닫기
  useEffect(() => {
    if (isOpen && availableTasks.length === 0) {
      onClose()
    }
  }, [availableTasks.length, isOpen, onClose])

  if (!isOpen || !currentTask) return null

  // 스와이프 시작
  const handleTouchStart = (e: React.TouchEvent) => {
    setSwipeStartX(e.touches[0].clientX)
    setSwipeDistance(0)
  }

  // 스와이프 중
  const handleTouchMove = (e: React.TouchEvent) => {
    if (swipeStartX === null) return
    
    const currentX = e.touches[0].clientX
    const distance = currentX - swipeStartX
    
    // 왼쪽 스와이프만 처리 (삭제)
    if (distance < 0) {
      setSwipeDistance(Math.max(distance, -150)) // 최대 150px
    }
  }

  // 스와이프 끝
  const handleTouchEnd = () => {
    if (swipeDistance < -100) {
      // PRD 명세: 스와이프(왼쪽)으로 삭제
      handleDeleteTask()
    } else {
      setSwipeDistance(0)
    }
    setSwipeStartX(null)
  }

  // 드래그 시작
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.setData('text/plain', currentTask.id)
  }

  // 드래그 끝
  const handleDragEnd = () => {
    setIsDragging(false)
    setDraggedOver(null)
  }

  // 드롭 타겟 위로 드래그
  const handleDragOver = (e: React.DragEvent, targetType: string) => {
    e.preventDefault()
    setDraggedOver(targetType)
  }

  // 드롭 타겟에서 나감
  const handleDragLeave = () => {
    setDraggedOver(null)
  }

  // 드롭 처리
  const handleDrop = (e: React.DragEvent, target: DragTarget) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    
    if (taskId === currentTask.id) {
      switch (target.type) {
        case 'delete':
          handleDeleteTask()
          break
        case 'schedule':
          handleScheduleTask()
          break
        case 'project':
          handleAssignToProject()
          break
      }
    }
    
    setDraggedOver(null)
    setIsDragging(false)
  }

  // 업무 삭제 (30일간 휴지통)
  const handleDeleteTask = () => {
    onTaskDelete(currentTask.id)
    moveToNextTask()
  }

  // 날짜 지정 (임시로 3일 후로 설정 - 실제로는 캘린더 위젯 필요)
  const handleScheduleTask = () => {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 3)
    
    onTaskUpdate(currentTask.id, {
      dueDate: dueDate.toISOString(),
      scheduledDate: dueDate.toISOString()
    })
    moveToNextTask()
  }

  // 프로젝트 할당 (임시로 기본 프로젝트 - 실제로는 프로젝트 선택 필요)
  const handleAssignToProject = () => {
    onTaskUpdate(currentTask.id, {
      projectId: 'proj-1' // 임시 프로젝트 ID
    })
    moveToNextTask()
  }

  // 다음 업무로 이동
  const moveToNextTask = () => {
    if (hasNextTask) {
      setCurrentTaskIndex(prev => prev + 1)
    } else {
      onClose() // 모든 업무 처리 완료
    }
    setSwipeDistance(0)
  }

  // 이전 업무로 이동
  const moveToPrevTask = () => {
    if (hasPrevTask) {
      setCurrentTaskIndex(prev => prev - 1)
    }
    setSwipeDistance(0)
  }

  // 건너뛰기
  const handleSkip = () => {
    moveToNextTask()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-xl">🪄</span>
            </div>
            <div>
              <h2 className="workly-card-title">정리 마법사</h2>
              <p className="workly-caption">
                {completedCount}/{availableTasks.length} 완료
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 진행률 바 */}
        <div className="px-6 py-3 bg-gray-50">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / availableTasks.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 업무 카드 */}
        <div className="p-6">
          <div
            ref={cardRef}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`
              workly-card cursor-move select-none transition-all duration-200
              ${isDragging ? 'opacity-50 scale-95' : ''}
              ${swipeDistance < 0 ? 'bg-red-50' : ''}
            `}
            style={{
              transform: `translateX(${swipeDistance}px)`,
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-6 h-6 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                <FlagIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="workly-card-title mb-1">{currentTask.title}</h3>
                {currentTask.description && (
                  <p className="workly-caption text-gray-600 line-clamp-2">
                    {currentTask.description}
                  </p>
                )}
              </div>
            </div>
            
            {/* 태그들 */}
            <div className="flex flex-wrap gap-1 mb-3">
              {currentTask.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 힌트 텍스트 */}
            <div className="text-center text-xs text-gray-500 border-t border-gray-100 pt-3">
              <p>← 스와이프하여 삭제 또는 드래그하여 정리</p>
            </div>
          </div>

          {/* 삭제 표시 (스와이프 시) */}
          {swipeDistance < -50 && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-red-500">
              <TrashIcon className="w-8 h-8" />
              <p className="text-xs mt-1">삭제</p>
            </div>
          )}
        </div>

        {/* 드래그 타겟들 */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-3 gap-3">
            {dragTargets.map((target) => (
              <div
                key={target.type}
                onDragOver={(e) => handleDragOver(e, target.type)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, target)}
                className={`
                  p-4 border-2 border-dashed rounded-lg text-center transition-all
                  ${draggedOver === target.type
                    ? target.type === 'delete'
                      ? 'border-red-300 bg-red-50 text-red-600'
                      : target.type === 'schedule'
                      ? 'border-blue-300 bg-blue-50 text-blue-600'
                      : 'border-green-300 bg-green-50 text-green-600'
                    : 'border-gray-200 text-gray-500'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  {target.icon}
                  <span className="text-xs font-medium">{target.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-b-xl">
          <button
            onClick={moveToPrevTask}
            disabled={!hasPrevTask}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            이전
          </button>

          <button
            onClick={handleSkip}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            건너뛰기
          </button>

          <button
            onClick={moveToNextTask}
            disabled={!hasNextTask}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            다음
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}