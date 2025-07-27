'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { GTDTask, HomeDashboardFilter, TaskStatus, MomentumScore } from '@/types/task.types'
import TaskCard from '@/components/tasks/TaskCard'
import { Search, Filter, Plus } from 'lucide-react'

interface HomeTaskDashboardProps {
  tasks: GTDTask[]
  onTaskToggle?: (taskId: string) => void
  onTaskEdit?: (task: GTDTask) => void
  onCreateTask?: () => void
  isLoading?: boolean
}

export default function HomeTaskDashboard({
  tasks,
  onTaskToggle,
  onTaskEdit,
  onCreateTask,
  isLoading = false
}: HomeTaskDashboardProps) {
  const [activeFilter, setActiveFilter] = useState<HomeDashboardFilter>('today')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // 모멘텀 점수 계산 함수
  const calculateMomentumScore = (task: GTDTask): MomentumScore => {
    let reach = 5 // 기본값
    let impact = 5
    let confidence = task.clarified ? 8 : 4
    let effort = 5

    // Reach: 프로젝트 중요도 (프로젝트가 있으면 +2)
    if (task.projectId) {
      reach += 2
    }

    // Impact: 마감일과 우선순위 기반
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate)
      const now = new Date()
      const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24))
      
      if (daysDiff < 0) impact = 10 // 지난 업무
      else if (daysDiff === 0) impact = 9 // 오늘 마감
      else if (daysDiff === 1) impact = 8 // 내일 마감
      else if (daysDiff <= 3) impact = 7 // 3일 이내
      else if (daysDiff <= 7) impact = 6 // 일주일 이내
      else impact = 4 // 그 이후
    }

    // 우선순위 보너스
    switch (task.priority) {
      case 'urgent': impact += 3; break
      case 'high': impact += 2; break
      case 'medium': impact += 1; break
      case 'low': break
    }

    // Effort: 예상 시간 역가중치
    if (task.estimatedHours) {
      if (task.estimatedHours <= 1) effort = 9
      else if (task.estimatedHours <= 2) effort = 8
      else if (task.estimatedHours <= 4) effort = 6
      else if (task.estimatedHours <= 8) effort = 4
      else effort = 2
    }

    // 2분 규칙 보너스
    if (task.canComplete2Minutes) {
      effort = 10
      confidence = 10
    }

    // 점수 정규화 (0-10)
    reach = Math.min(10, Math.max(0, reach))
    impact = Math.min(10, Math.max(0, impact))
    confidence = Math.min(10, Math.max(0, confidence))
    effort = Math.min(10, Math.max(0, effort))

    // 총점 계산 (가중 평균)
    const total = (reach * 0.2 + impact * 0.4 + confidence * 0.2 + effort * 0.2)

    return { reach, impact, confidence, effort, total }
  }

  // 업무 목록 필터링 및 정렬
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks

    // 검색 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.project?.name.toLowerCase().includes(query)
      )
    }

    // 상태별 필터링
    switch (activeFilter) {
      case 'today':
        filtered = filtered.filter(task => 
          task.status !== TaskStatus.DONE && 
          task.status !== TaskStatus.CANCELLED &&
          task.gtdContext === 'next'
        )
        break
      case 'completed':
        filtered = filtered.filter(task => 
          task.status === TaskStatus.DONE
        )
        break
      case 'someday':
        filtered = filtered.filter(task => 
          task.gtdContext === 'someday'
        )
        break
      case 'all':
        // 모든 업무 표시
        break
    }

    // 모멘텀 점수 계산 및 업데이트
    const tasksWithScore = filtered.map(task => ({
      ...task,
      momentumScore: calculateMomentumScore(task)
    }))

    // 정렬: 완료된 업무는 별도, 나머지는 모멘텀 점수순
    if (activeFilter === 'completed') {
      return tasksWithScore.sort((a, b) => 
        new Date(b.completedAt || b.updatedAt).getTime() - 
        new Date(a.completedAt || a.updatedAt).getTime()
      )
    } else {
      return tasksWithScore.sort((a, b) => 
        b.momentumScore.total - a.momentumScore.total
      )
    }
  }, [tasks, activeFilter, searchQuery])

  // 필터 옵션
  const filterOptions = [
    { key: 'today' as const, label: '오늘', count: filteredAndSortedTasks.length },
    { key: 'completed' as const, label: '완료됨', count: tasks.filter(t => t.status === TaskStatus.DONE).length },
    { key: 'all' as const, label: '전체', count: tasks.length },
    { key: 'someday' as const, label: '나중에', count: tasks.filter(t => t.gtdContext === 'someday').length },
  ]

  const renderFilterTabs = () => (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg mb-4">
      {filterOptions.map(option => (
        <button
          key={option.key}
          onClick={() => setActiveFilter(option.key)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 ${
            activeFilter === option.key
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          {option.label}
          {option.count > 0 && (
            <span className={`ml-1 text-xs ${
              activeFilter === option.key ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {option.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )

  const renderSearchBar = () => (
    <div className={`transition-all duration-300 overflow-hidden ${
      showSearch ? 'max-h-20 mb-4' : 'max-h-0'
    }`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="업무, 프로젝트 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                   bg-white text-sm"
          autoFocus={showSearch}
        />
      </div>
    </div>
  )

  const renderTopSection = () => (
    <div className="p-4 border-b border-gray-100">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-900">
          내 업무
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2 rounded-lg transition-colors ${
              showSearch ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
            }`}
            aria-label="검색"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={onCreateTask}
            className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            aria-label="업무 추가"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 검색바 */}
      {renderSearchBar()}

      {/* 필터 탭 */}
      {renderFilterTabs()}
    </div>
  )

  const renderTaskList = () => {
    if (isLoading) {
      return (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">업무를 불러오는 중...</p>
        </div>
      )
    }

    if (filteredAndSortedTasks.length === 0) {
      return (
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-2">
            {activeFilter === 'today' && '📋'}
            {activeFilter === 'completed' && '✅'}
            {activeFilter === 'someday' && '🔮'}
            {activeFilter === 'all' && '📝'}
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-1">
            {searchQuery ? '검색 결과가 없습니다' : 
             activeFilter === 'today' ? '오늘 할 업무가 없습니다' :
             activeFilter === 'completed' ? '완료된 업무가 없습니다' :
             activeFilter === 'someday' ? '나중에 할 업무가 없습니다' :
             '업무가 없습니다'}
          </h3>
          <p className="text-gray-500 text-sm">
            {!searchQuery && activeFilter === 'today' && '새로운 업무를 추가해보세요!'}
          </p>
        </div>
      )
    }

    return (
      <div className="divide-y divide-gray-100">
        {filteredAndSortedTasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            isLast={index === filteredAndSortedTasks.length - 1}
            onToggleComplete={onTaskToggle}
            onEdit={onTaskEdit}
            showMomentumScore={activeFilter === 'today'}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {renderTopSection()}
      {renderTaskList()}
    </div>
  )
}