'use client'

import React from 'react'
import { GTDTask, TaskStatus, TaskPriority } from '@/types/task.types'

interface TaskCardProps {
  task: GTDTask
  isLast?: boolean
  onToggleComplete?: (taskId: string) => void
  onEdit?: (task: GTDTask) => void
  showMomentumScore?: boolean
}

export default function TaskCard({ 
  task, 
  isLast = false, 
  onToggleComplete,
  onEdit,
  showMomentumScore = true 
}: TaskCardProps) {
  const isCompleted = task.status === TaskStatus.DONE
  
  // 우선순위 색상 매핑
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return 'text-red-500 bg-red-50'
      case TaskPriority.HIGH:
        return 'text-orange-500 bg-orange-50'
      case TaskPriority.MEDIUM:
        return 'text-yellow-500 bg-yellow-50'
      case TaskPriority.LOW:
        return 'text-blue-500 bg-blue-50'
      default:
        return 'text-gray-500 bg-gray-50'
    }
  }

  // 마감일 색상 및 텍스트
  const getDueDateInfo = () => {
    if (isCompleted) {
      return { text: '완료됨', color: 'text-green-600' }
    }
    
    if (!task.dueDate) {
      return { text: '마감일 없음', color: 'text-gray-500' }
    }

    const now = new Date()
    const dueDate = new Date(task.dueDate)
    const timeDiff = dueDate.getTime() - now.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

    if (daysDiff < 0) {
      return { text: `${Math.abs(daysDiff)}일 지남`, color: 'text-red-500' }
    } else if (daysDiff === 0) {
      return { text: '오늘 마감', color: 'text-orange-500' }
    } else if (daysDiff === 1) {
      return { text: '내일 마감', color: 'text-orange-400' }
    } else if (daysDiff <= 7) {
      return { text: `${daysDiff}일 남음`, color: 'text-yellow-500' }
    } else {
      const options: Intl.DateTimeFormatOptions = { 
        month: 'short', 
        day: 'numeric' 
      }
      return { 
        text: dueDate.toLocaleDateString('ko-KR', options), 
        color: 'text-gray-500' 
      }
    }
  }

  const dueDateInfo = getDueDateInfo()

  // 모멘텀 점수 시각화
  const renderMomentumScore = () => {
    if (!showMomentumScore || isCompleted) return null

    const score = task.momentumScore.total
    const getScoreColor = (score: number) => {
      if (score >= 8) return 'bg-red-500'
      if (score >= 6) return 'bg-orange-500'
      if (score >= 4) return 'bg-yellow-500'
      return 'bg-gray-400'
    }

    return (
      <div className="flex items-center gap-1">
        <div 
          className={`w-2 h-2 rounded-full ${getScoreColor(score)}`}
          title={`모멘텀 점수: ${score.toFixed(1)}`}
        />
        {score >= 7 && (
          <span className="text-xs text-orange-600 font-medium">우선</span>
        )}
      </div>
    )
  }

  // 프로젝트 진행률 표시
  const renderProjectProgress = () => {
    if (!task.project || isCompleted) return null

    // 임시 진행률 (실제로는 프로젝트에서 계산)
    const progress = 65 // 실제 구현 시 프로젝트 진행률 API에서 가져옴

    return (
      <div className="mt-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{task.project.name}</span>
          <div className="flex-1 bg-gray-200 rounded-full h-1">
            <div 
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span>{progress}%</span>
        </div>
      </div>
    )
  }

  const handleCheckboxChange = () => {
    if (onToggleComplete) {
      onToggleComplete(task.id)
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // 체크박스 클릭은 제외
    if ((e.target as HTMLElement).type === 'checkbox') {
      return
    }
    
    if (onEdit) {
      onEdit(task)
    }
  }

  return (
    <article 
      className={`p-4 ${!isLast ? 'border-b border-gray-100' : ''} ${
        isCompleted ? 'opacity-60' : ''
      } hover:bg-gray-50 transition-colors cursor-pointer`}
      onClick={handleCardClick}
      aria-labelledby={`task-${task.id}-title`}
      aria-describedby={`task-${task.id}-description task-${task.id}-meta`}
    >
      <div className="flex items-start gap-3">
        {/* 체크박스 */}
        <div className="mt-1">
          <input 
            type="checkbox" 
            checked={isCompleted}
            onChange={handleCheckboxChange}
            className="w-5 h-5 rounded border-2 border-gray-300 
                     checked:bg-green-500 checked:border-green-500 
                     focus:ring-2 focus:ring-green-200 transition-colors"
            aria-label={`${task.title} ${isCompleted ? '완료됨' : '미완료'}`}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        {/* 업무 내용 */}
        <div className="flex-1 min-w-0">
          {/* 제목과 모멘텀 점수 */}
          <div className="flex items-start justify-between gap-2">
            <h3 
              id={`task-${task.id}-title`}
              className={`font-medium text-gray-900 leading-tight ${
                isCompleted ? 'line-through text-gray-500' : ''
              }`}
            >
              {task.title}
            </h3>
            {renderMomentumScore()}
          </div>
          
          {/* 설명 */}
          {task.description && (
            <p 
              id={`task-${task.id}-description`}
              className={`text-sm text-gray-600 mt-1 ${
                isCompleted ? 'line-through' : ''
              }`}
            >
              {task.description}
            </p>
          )}
          
          {/* 메타 정보 */}
          <div id={`task-${task.id}-meta`} className="flex items-center gap-2 mt-3 flex-wrap">
            {/* 우선순위 */}
            <span 
              className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(task.priority)}`}
              aria-label={`우선순위: ${task.priority}`}
            >
              {task.priority}
            </span>
            
            {/* 마감일 */}
            <span 
              className={`text-xs ${dueDateInfo.color}`}
              aria-label={isCompleted ? '상태: 완료됨' : `마감일: ${dueDateInfo.text}`}
            >
              {dueDateInfo.text}
            </span>
            
            {/* 예상 시간 */}
            {task.estimatedHours && !isCompleted && (
              <span className="text-xs text-gray-500">
                {task.estimatedHours}시간 예상
              </span>
            )}
            
            {/* GTD 컨텍스트 */}
            {task.gtdContext !== 'next' && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {task.gtdContext === 'inbox' && '수신함'}
                {task.gtdContext === 'waiting' && '대기중'}
                {task.gtdContext === 'someday' && '언젠가'}
              </span>
            )}
          </div>
          
          {/* 프로젝트 진행률 */}
          {renderProjectProgress()}
        </div>
      </div>
    </article>
  )
}