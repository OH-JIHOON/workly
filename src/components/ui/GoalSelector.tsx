'use client'

import { Fragment, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { 
  FlagIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
// import { worklyApi } from '@/lib/api/workly-api' // Deprecated - using mock data instead

interface Goal {
  id: string
  title: string
  vision?: string
  status: 'planning' | 'active' | 'completed' | 'paused'
  progress: number
  targetDate?: string
  kpis?: Array<{
    name: string
    currentValue: number
    targetValue: number
    unit: string
  }>
}

interface GoalSelectorProps {
  value: string | null
  onChange: (goalId: string | null) => void
  disabled?: boolean
  className?: string
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  allowClear?: boolean
}

export default function GoalSelector({
  value,
  onChange,
  disabled = false,
  className = '',
  placeholder = '목표 선택',
  size = 'md',
  allowClear = true
}: GoalSelectorProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // 목표 목록 로드
  useEffect(() => {
    const loadGoals = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // TODO: 실제 API 호출로 교체
        console.log('Mock API call - get goals')
        const response = { data: [] }
        
        setGoals(response.data || [])
      } catch (err) {
        console.error('목표 목록 로드 실패:', err)
        setError('목표 목록을 불러올 수 없습니다.')
        
        // 목업 데이터 사용 (API 실패시 fallback)
        setGoals([
          {
            id: '1',
            title: '워클리 사용자 10만명 달성',
            vision: '많은 사람들이 효율적으로 업무를 관리할 수 있도록 돕기',
            status: 'active',
            progress: 35,
            targetDate: '2024-12-31T00:00:00.000Z',
            kpis: [
              { name: '월간 활성 사용자', currentValue: 35000, targetValue: 100000, unit: '명' }
            ]
          },
          {
            id: '2',
            title: '제품 품질 향상',
            vision: '최고 수준의 사용자 경험 제공',
            status: 'active',
            progress: 68,
            targetDate: '2024-09-30T00:00:00.000Z',
            kpis: [
              { name: '사용자 만족도', currentValue: 8.2, targetValue: 9.0, unit: '점' },
              { name: '버그 발생률', currentValue: 2.1, targetValue: 1.0, unit: '%' }
            ]
          },
          {
            id: '3',
            title: '팀 생산성 향상',
            vision: '효율적인 협업 문화 구축',
            status: 'active',
            progress: 72,
            targetDate: '2024-08-31T00:00:00.000Z',
            kpis: [
              { name: '작업 완료율', currentValue: 85, targetValue: 95, unit: '%' }
            ]
          },
          {
            id: '4',
            title: '시장 확장',
            vision: '글로벌 시장 진출을 통한 성장',
            status: 'planning',
            progress: 15,
            targetDate: '2025-06-30T00:00:00.000Z',
            kpis: [
              { name: '해외 사용자 비율', currentValue: 5, targetValue: 25, unit: '%' }
            ]
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadGoals()
  }, [])

  // 선택된 목표 찾기
  const selectedGoal = goals.find(goal => goal.id === value)

  // 검색 필터링
  const filteredGoals = goals.filter(goal =>
    goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (goal.vision && goal.vision.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const sizeClasses = {
    sm: 'text-sm py-1.5 pl-2 pr-8',
    md: 'text-sm py-2 pl-3 pr-10', 
    lg: 'text-base py-3 pl-4 pr-12'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'planning':
        return 'text-blue-600 bg-blue-100'
      case 'completed':
        return 'text-purple-600 bg-purple-100'
      case 'paused':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusLabel = (status: Goal['status']) => {
    switch (status) {
      case 'active':
        return '진행중'
      case 'planning':
        return '계획중'
      case 'completed':
        return '완료'
      case 'paused':
        return '일시정지'
      default:
        return '알 수 없음'
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChange(null)
  }

  return (
    <div className={className}>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button 
            className={`
              relative w-full cursor-pointer rounded-lg border border-gray-300 bg-white shadow-sm 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400
              ${sizeClasses[size]}
            `}
          >
            <span className="flex items-center gap-2">
              <FlagIcon className={`${iconSizes[size]} text-gray-500 flex-shrink-0`} />
              {selectedGoal ? (
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="block truncate font-medium text-gray-900">
                      {selectedGoal.title}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(selectedGoal.status)}`}>
                      {getStatusLabel(selectedGoal.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${selectedGoal.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{selectedGoal.progress}%</span>
                  </div>
                </div>
              ) : (
                <span className="block truncate text-gray-500">{placeholder}</span>
              )}
            </span>
            
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              {allowClear && selectedGoal ? (
                <button
                  onClick={handleClear}
                  className="pointer-events-auto flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  title="선택 해제"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              ) : (
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              )}
            </span>
          </Listbox.Button>
          
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {/* 검색 입력 */}
              <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="목표 검색..."
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 선택 해제 옵션 */}
              {allowClear && (
                <Listbox.Option
                  value={null}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <div className="flex items-center gap-2">
                        <XMarkIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span className={`block italic ${selected ? 'font-semibold' : ''}`}>
                          목표 없음
                        </span>
                      </div>
                      {selected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              )}

              {/* 구분선 */}
              {allowClear && filteredGoals.length > 0 && (
                <div className="border-t border-gray-100 my-1" />
              )}

              {loading ? (
                <div className="py-4 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    로딩 중...
                  </div>
                </div>
              ) : error ? (
                <div className="py-4 text-center text-red-500 text-sm">
                  {error}
                </div>
              ) : filteredGoals.length === 0 ? (
                <div className="py-4 text-center text-gray-500 text-sm">
                  {searchQuery ? '검색 결과가 없습니다.' : '목표가 없습니다.'}
                </div>
              ) : (
                filteredGoals.map((goal) => (
                  <Listbox.Option
                    key={goal.id}
                    className={({ active, selected }) =>
                      `relative cursor-pointer select-none py-3 pl-3 pr-9 ${
                        active || selected
                          ? 'bg-blue-50 text-blue-900'
                          : 'text-gray-900 hover:bg-gray-50'
                      }`
                    }
                    value={goal.id}
                  >
                    {({ selected }) => (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 flex items-center">
                            <FlagIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-medium truncate ${selected ? 'font-semibold' : ''}`}>
                                {goal.title}
                              </span>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${getStatusColor(goal.status)}`}>
                                {getStatusLabel(goal.status)}
                              </span>
                            </div>
                            
                            {goal.vision && (
                              <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                                {goal.vision}
                              </p>
                            )}
                            
                            {/* 진행률 바 */}
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${goal.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 font-medium">{goal.progress}%</span>
                            </div>

                            {/* KPI 표시 */}
                            {goal.kpis && goal.kpis.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <TrophyIcon className="w-3 h-3" />
                                <span>
                                  {goal.kpis[0].name}: {goal.kpis[0].currentValue.toLocaleString()}/{goal.kpis[0].targetValue.toLocaleString()}{goal.kpis[0].unit}
                                  {goal.kpis.length > 1 && ` 외 ${goal.kpis.length - 1}개`}
                                </span>
                              </div>
                            )}

                            {/* 목표 날짜 */}
                            {goal.targetDate && (
                              <div className="text-xs text-gray-400 mt-1">
                                목표: {new Date(goal.targetDate).toLocaleDateString('ko-KR')}
                              </div>
                            )}
                          </div>
                        </div>

                        {selected && (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}