'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  XMarkIcon, 
  CalendarDaysIcon,
  CheckCircleIcon,
  FlagIcon,
  UsersIcon,
  EyeIcon,
  BuildingOfficeIcon,
  TagIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { ProjectStatus, ProjectPriority, ProjectVisibility } from '@/types/project.types'

export interface ProjectAdvancedFilters {
  // 마감일 필터
  dueDate?: 'overdue' | 'this-week' | 'this-month' | 'no-due' | 'custom'
  dueDateRange?: { start: string; end: string }
  
  // 상태 필터 (다중 선택)
  status?: ProjectStatus[]
  
  // 우선순위 필터
  priority?: ProjectPriority[]
  
  // 가시성 필터
  visibility?: ProjectVisibility[]
  
  // 멤버 필터
  memberIds?: string[]
  
  // 태그 필터
  tags?: string[]
  
  // 진행률 필터
  progressRange?: { min: number; max: number }
  
  // 특수 필터
  isRecruiting?: boolean // 모집 중
  isOverdue?: boolean // 기한 초과
  hasGoal?: boolean // 목표 연결됨
}

interface ProjectAdvancedFilterPanelProps {
  isOpen: boolean
  onClose: () => void
  filters: ProjectAdvancedFilters
  onFiltersChange: (filters: ProjectAdvancedFilters) => void
  availableMembers?: Array<{ id: string; name: string; avatar?: string }>
  availableTags?: string[]
}

export default function ProjectAdvancedFilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableMembers = [],
  availableTags = []
}: ProjectAdvancedFilterPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [localFilters, setLocalFilters] = useState<ProjectAdvancedFilters>(filters)

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
  const updateLocalFilters = (updates: Partial<ProjectAdvancedFilters>) => {
    const newFilters = { ...localFilters, ...updates }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  // 마감일 필터 옵션들
  const dueDateOptions = [
    { key: 'overdue', label: '기한 초과', icon: ClockIcon, color: 'text-red-600' },
    { key: 'this-week', label: '이번 주 마감', icon: CalendarDaysIcon, color: 'text-blue-600' },
    { key: 'this-month', label: '이번 달 마감', icon: CalendarDaysIcon, color: 'text-blue-500' },
    { key: 'no-due', label: '마감일 없음', icon: CalendarDaysIcon, color: 'text-gray-500' }
  ]

  // 상태 필터 옵션들
  const statusOptions = [
    { key: ProjectStatus.PLANNING, label: '계획 중', icon: BuildingOfficeIcon, color: 'text-blue-600' },
    { key: ProjectStatus.ACTIVE, label: '진행 중', icon: CheckCircleIcon, color: 'text-green-600' },
    { key: ProjectStatus.ON_HOLD, label: '일시중단', icon: ClockIcon, color: 'text-amber-600' },
    { key: ProjectStatus.COMPLETED, label: '완료', icon: CheckCircleIcon, color: 'text-green-700' },
    { key: ProjectStatus.CANCELLED, label: '취소', icon: XMarkIcon, color: 'text-gray-500' },
    { key: ProjectStatus.ARCHIVED, label: '보관됨', icon: BuildingOfficeIcon, color: 'text-gray-400' }
  ]

  // 우선순위 필터 옵션들
  const priorityOptions = [
    { key: ProjectPriority.URGENT, label: '긴급', icon: FlagIcon, color: 'text-red-600' },
    { key: ProjectPriority.HIGH, label: '높음', icon: FlagIcon, color: 'text-orange-600' },
    { key: ProjectPriority.MEDIUM, label: '보통', icon: FlagIcon, color: 'text-blue-600' },
    { key: ProjectPriority.LOW, label: '낮음', icon: FlagIcon, color: 'text-gray-500' }
  ]

  // 가시성 필터 옵션들
  const visibilityOptions = [
    { key: ProjectVisibility.PRIVATE, label: '비공개', icon: EyeIcon, color: 'text-gray-600' },
    { key: ProjectVisibility.TEAM, label: '팀', icon: UsersIcon, color: 'text-blue-600' },
    { key: ProjectVisibility.PUBLIC, label: '공개', icon: EyeIcon, color: 'text-green-600' }
  ]

  // 특수 필터 옵션들
  const specialFilters = [
    { 
      key: 'isRecruiting', 
      label: '멤버 모집 중', 
      icon: UsersIcon, 
      color: 'text-green-600',
      description: '새로운 팀원을 찾는 프로젝트'
    },
    { 
      key: 'isOverdue', 
      label: '기한 초과', 
      icon: ClockIcon, 
      color: 'text-red-600',
      description: '마감일이 지난 프로젝트'
    },
    { 
      key: 'hasGoal', 
      label: '목표 연결됨', 
      icon: FlagIcon, 
      color: 'text-blue-600',
      description: '상위 목표가 설정된 프로젝트'
    }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-25 flex items-start justify-center pt-20">
      <div 
        ref={panelRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto scrollbar-on-hover"
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

        {/* 우선순위 필터 */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <FlagIcon className="w-4 h-4" />
            우선순위
          </h3>
          <div className="space-y-2">
            {priorityOptions.map((option) => {
              const Icon = option.icon
              const isSelected = localFilters.priority?.includes(option.key) || false
              
              return (
                <button
                  key={option.key}
                  onClick={() => {
                    const currentPriority = localFilters.priority || []
                    const newPriority = isSelected
                      ? currentPriority.filter(p => p !== option.key)
                      : [...currentPriority, option.key]
                    
                    updateLocalFilters({ 
                      priority: newPriority.length > 0 ? newPriority : undefined 
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

        {/* 가시성 필터 */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <EyeIcon className="w-4 h-4" />
            가시성
          </h3>
          <div className="space-y-2">
            {visibilityOptions.map((option) => {
              const Icon = option.icon
              const isSelected = localFilters.visibility?.includes(option.key) || false
              
              return (
                <button
                  key={option.key}
                  onClick={() => {
                    const currentVisibility = localFilters.visibility || []
                    const newVisibility = isSelected
                      ? currentVisibility.filter(v => v !== option.key)
                      : [...currentVisibility, option.key]
                    
                    updateLocalFilters({ 
                      visibility: newVisibility.length > 0 ? newVisibility : undefined 
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

        {/* 특수 필터 */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <TagIcon className="w-4 h-4" />
            특수 필터
          </h3>
          <div className="space-y-2">
            {specialFilters.map((filter) => {
              const Icon = filter.icon
              const isSelected = localFilters[filter.key as keyof ProjectAdvancedFilters] as boolean || false
              
              return (
                <button
                  key={filter.key}
                  onClick={() => {
                    updateLocalFilters({ 
                      [filter.key]: isSelected ? undefined : true
                    } as Partial<ProjectAdvancedFilters>)
                  }}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${filter.color} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1">
                    <span className="text-sm text-gray-700 font-medium">{filter.label}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{filter.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 멤버 필터 */}
        {availableMembers.length > 0 && (
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              팀 멤버
            </h3>
            <div className="space-y-2">
              {availableMembers.map((member) => {
                const isSelected = localFilters.memberIds?.includes(member.id) || false
                
                return (
                  <button
                    key={member.id}
                    onClick={() => {
                      const currentMembers = localFilters.memberIds || []
                      const newMembers = isSelected
                        ? currentMembers.filter(m => m !== member.id)
                        : [...currentMembers, member.id]
                      
                      updateLocalFilters({ 
                        memberIds: newMembers.length > 0 ? newMembers : undefined 
                      })
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="w-6 h-6 rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-white font-medium">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-gray-700 truncate">{member.name}</span>
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

        {/* 태그 필터 */}
        {availableTags.length > 0 && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <TagIcon className="w-4 h-4" />
              태그
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = localFilters.tags?.includes(tag) || false
                
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      const currentTags = localFilters.tags || []
                      const newTags = isSelected
                        ? currentTags.filter(t => t !== tag)
                        : [...currentTags, tag]
                      
                      updateLocalFilters({ 
                        tags: newTags.length > 0 ? newTags : undefined 
                      })
                    }}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      isSelected
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}