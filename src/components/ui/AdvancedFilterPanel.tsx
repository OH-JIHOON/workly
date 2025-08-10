'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  XMarkIcon, 
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  FlagIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline'
import { TaskStatus, TaskPriority } from '@/types/task.types'

export interface AdvancedFilters {
  // 마감일 필터
  dueDate?: 'overdue' | 'today' | 'this-week' | 'no-due' | 'custom'
  dueDateRange?: { start: string; end: string }
  
  // 상태 필터
  status?: TaskStatus[]
  
  // 소속 필터 
  projectIds?: string[]
  goalIds?: string[]
}

interface AdvancedFilterPanelProps {
  isOpen: boolean
  onClose: () => void
  filters: AdvancedFilters
  onFiltersChange: (filters: AdvancedFilters) => void
  availableProjects?: Array<{ id: string; name: string }>
  availableGoals?: Array<{ id: string; name: string }>
}

export default function AdvancedFilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableProjects = [],
  availableGoals = []
}: AdvancedFilterPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters)

  // 패널 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onClose])

  // 로컬 필터 업데이트
  const updateLocalFilters = (updates: Partial<AdvancedFilters>) => {
    const newFilters = { ...localFilters, ...updates }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  // 마감일 필터 옵션들
  const dueDateOptions = [
    { key: 'overdue', label: '기한 초과', icon: ClockIcon, color: 'text-red-600' },
    { key: 'today', label: '오늘 마감', icon: CalendarDaysIcon, color: 'text-blue-600' },
    { key: 'this-week', label: '이번 주 내 마감', icon: CalendarDaysIcon, color: 'text-blue-500' },
    { key: 'no-due', label: '마감일 없음', icon: CalendarDaysIcon, color: 'text-gray-500' }
  ]

  // 상태 필터 옵션들
  const statusOptions = [
    { key: TaskStatus.TODO, label: '할 일', icon: CheckCircleIcon, color: 'text-gray-600' },
    { key: TaskStatus.IN_PROGRESS, label: '진행 중', icon: ClockIcon, color: 'text-blue-600' },
    { key: TaskStatus.DONE, label: '완료', icon: CheckCircleIcon, color: 'text-green-600' },
    { key: TaskStatus.IN_REVIEW, label: '검토 중', icon: FlagIcon, color: 'text-purple-600' },
    { key: TaskStatus.DEFERRED, label: '보류', icon: ClockIcon, color: 'text-yellow-600' }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-25 flex items-start justify-center pt-20">
      <div 
        ref={panelRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">상세 필터</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 마감일 필터 */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <CalendarDaysIcon className="w-4 h-4" />
            마감일
          </h3>
          <div className="space-y-2">
            {dueDateOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.key}
                  onClick={() => updateLocalFilters({ 
                    dueDate: localFilters.dueDate === option.key ? undefined : option.key as any 
                  })}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                    localFilters.dueDate === option.key
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${option.color}`} />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 상태 필터 */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4" />
            상태
          </h3>
          <div className="space-y-2">
            {statusOptions.map((option) => {
              const Icon = option.icon
              const isSelected = localFilters.status?.includes(option.key) || false
              
              return (
                <button
                  key={option.key}
                  onClick={() => {
                    const currentStatus = localFilters.status || []
                    const newStatus = isSelected
                      ? currentStatus.filter(s => s !== option.key)
                      : [...currentStatus, option.key]
                    
                    updateLocalFilters({ 
                      status: newStatus.length > 0 ? newStatus : undefined 
                    })
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${option.color}`} />
                  <span className="text-sm text-gray-700">{option.label}</span>
                  {isSelected && (
                    <div className="ml-auto w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 소속 필터 */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <RectangleStackIcon className="w-4 h-4" />
            소속
          </h3>
          
          {/* 프로젝트 */}
          {availableProjects.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-600 mb-2">프로젝트</h4>
              <div className="space-y-1">
                {availableProjects.map((project) => {
                  const isSelected = localFilters.projectIds?.includes(project.id) || false
                  
                  return (
                    <button
                      key={project.id}
                      onClick={() => {
                        const currentProjects = localFilters.projectIds || []
                        const newProjects = isSelected
                          ? currentProjects.filter(p => p !== project.id)
                          : [...currentProjects, project.id]
                        
                        updateLocalFilters({ 
                          projectIds: newProjects.length > 0 ? newProjects : undefined 
                        })
                      }}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                        isSelected
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{project.name}</span>
                      {isSelected && (
                        <div className="ml-auto w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 목표 */}
          {availableGoals.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-2">목표</h4>
              <div className="space-y-1">
                {availableGoals.map((goal) => {
                  const isSelected = localFilters.goalIds?.includes(goal.id) || false
                  
                  return (
                    <button
                      key={goal.id}
                      onClick={() => {
                        const currentGoals = localFilters.goalIds || []
                        const newGoals = isSelected
                          ? currentGoals.filter(g => g !== goal.id)
                          : [...currentGoals, goal.id]
                        
                        updateLocalFilters({ 
                          goalIds: newGoals.length > 0 ? newGoals : undefined 
                        })
                      }}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                        isSelected
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <FlagIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{goal.name}</span>
                      {isSelected && (
                        <div className="ml-auto w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}