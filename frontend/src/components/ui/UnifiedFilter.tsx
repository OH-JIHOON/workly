'use client'

import { ReactNode, useRef, useEffect, useState } from 'react'
import { ChevronDownIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'

interface FilterOption {
  key: string
  label: string
  count?: number
  icon?: ReactNode
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray'
}

interface FilterSetting {
  key: string
  label: string
  type: 'toggle' | 'select' | 'multi-select' | 'range' | 'tag-selector' | 'date-range'
  value?: any
  options?: string[] | FilterOption[]
  placeholder?: string
  validation?: (value: any) => boolean
  dependency?: string // 다른 설정에 의존
  onChange: (value: any) => void
}

interface UnifiedFilterProps {
  // 메인 필터 칩들
  options: FilterOption[]
  activeFilter: string
  onFilterChange: (filter: string) => void
  
  // 설정
  settings?: FilterSetting[]
  settingsTitle?: string
  
  // 스타일 옵션
  className?: string
  variant?: 'compact' | 'comfortable' | 'spacious'
  style?: 'modern' | 'minimal' | 'glassmorphism'
  maxVisibleItems?: number
}

export default function UnifiedFilter({ 
  options, 
  activeFilter, 
  onFilterChange,
  settings = [],
  settingsTitle = '필터 설정',
  className = '',
  variant = 'comfortable',
  style = 'modern',
  maxVisibleItems
}: UnifiedFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showOverflow, setShowOverflow] = useState(false)
  const [overflowItems, setOverflowItems] = useState<FilterOption[]>([])
  const [visibleItems, setVisibleItems] = useState<FilterOption[]>(options)
  const [showSettings, setShowSettings] = useState(false)

  // 오버플로우 처리
  useEffect(() => {
    if (maxVisibleItems && options.length > maxVisibleItems) {
      setVisibleItems(options.slice(0, maxVisibleItems))
      setOverflowItems(options.slice(maxVisibleItems))
    } else {
      setVisibleItems(options)
      setOverflowItems([])
    }
  }, [options, maxVisibleItems])

  // 활성 필터로 자동 스크롤
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector(`[data-filter="${activeFilter}"]`)
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    }
  }, [activeFilter])

  // 색상별 클래스
  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: {
        active: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25',
        inactive: 'text-blue-600 hover:bg-blue-50 border-blue-200 hover:border-blue-300'
      },
      green: {
        active: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25',
        inactive: 'text-green-600 hover:bg-green-50 border-green-200 hover:border-green-300'
      },
      purple: {
        active: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25',
        inactive: 'text-purple-600 hover:bg-purple-50 border-purple-200 hover:border-purple-300'
      },
      orange: {
        active: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25',
        inactive: 'text-orange-600 hover:bg-orange-50 border-orange-200 hover:border-orange-300'
      },
      red: {
        active: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25',
        inactive: 'text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300'
      },
      gray: {
        active: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/25',
        inactive: 'text-gray-600 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
      }
    }
    
    return colors[color as keyof typeof colors] || colors.gray
  }

  // 변형별 패딩 클래스
  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'px-3 py-1.5 text-xs'
      case 'spacious':
        return 'px-6 py-3 text-base'
      default: // comfortable
        return 'px-4 py-2 text-sm'
    }
  }

  const variantClasses = getVariantClasses()

  const renderChip = (option: FilterOption, isOverflow = false) => {
    const isActive = activeFilter === option.key
    const colorClasses = option.color ? getColorClasses(option.color, isActive) : null
    
    return (
      <button
        key={option.key}
        data-filter={option.key}
        onClick={() => onFilterChange(option.key)}
        className={`
          flex-shrink-0
          ${variantClasses}
          font-medium
          rounded-full
          transition-all duration-300
          flex items-center gap-2
          min-w-max
          transform hover:scale-105 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2
          ${
            colorClasses
              ? isActive 
                ? `${colorClasses.active} border-none`
                : `bg-white ${colorClasses.inactive} border`
              : isActive
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 border-none'
                : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md'
          }
          ${isOverflow ? 'w-full justify-start' : ''}
        `}
        aria-pressed={isActive}
        role="button"
      >
      {option.icon && (
        <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          {option.icon}
        </span>
      )}
      <span className="whitespace-nowrap">{option.label}</span>
      {option.count !== undefined && option.count > 0 && (
        <span 
          className={`
            text-xs 
            min-w-[20px] 
            h-5
            rounded-full 
            flex 
            items-center 
            justify-center 
            font-semibold
            flex-shrink-0
            ${
              isActive 
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-600'
            }
          `}
        >
          {option.count > 999 ? '999+' : option.count}
        </span>
      )}
      </button>
    )
  }

  const getOptionLabel = (option: string) => {
    const labels: { [key: string]: string } = {
      'deadline': '마감일순',
      'priority': '우선순위순',
      'created': '생성일순',
      'updated': '수정일순',
      'momentum': '모멘텀 점수순',
      'energy': '에너지 레벨순',
      'latest': '최신순',
      'popular': '인기순',
      'comments': '댓글순',
      'views': '조회순',
      'recent': '최근순',
      'progress': '진행률순',
      'members': '멤버순',
      'objectives': 'OKR 진행률순',
      'all': '전체',
      'recruiting': '모집 중',
      'closed': '모집 완료',
      '24h': '24시간 이내',
      '7d': '7일 이내',
      '30d': '30일 이내',
      '1-2명': '1-2명',
      '3-5명': '3-5명',
      '6명 이상': '6명 이상',
      'fixed': '고정 금액',
      'hourly': '시간제',
      'beginner': '초급',
      'intermediate': '중급',
      'advanced': '고급',
      'tutorial': '튜토리얼',
      'guide': '가이드',
      'reference': '참고자료',
      'template': '템플릿',
      'individual': '개인',
      'small': '2-3명',
      'large': '4명+',
      'prototype': '프로토타입',
      'mvp': 'MVP',
      'complete': '완제품'
    }
    return labels[option] || option
  }

  return (
    <div className={`relative bg-gradient-to-r from-gray-50/50 to-white/50 ${className}`}>
      {/* 데스크톱 */}
      <div className="hidden md:block">
        <div className="flex items-center gap-3 px-6 py-4">
          {/* 메인 필터 칩들 */}
          <div 
            ref={scrollContainerRef}
            className="flex space-x-2 overflow-x-auto scrollbar-hide flex-1 px-3 py-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {visibleItems.map((option) => renderChip(option))}
          </div>

          {/* 오버플로우 메뉴 */}
          {overflowItems.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowOverflow(!showOverflow)}
                className={`
                  text-gray-600 hover:text-gray-900 hover:bg-gray-50
                  border border-gray-300 hover:border-gray-400
                  rounded-full
                  transition-all duration-300
                  flex items-center gap-1
                  hover:scale-105 active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2
                  ${variantClasses}
                `}
                aria-expanded={showOverflow}
                aria-haspopup="true"
              >
                <span>+{overflowItems.length}</span>
                <ChevronDownIcon className={`w-3 h-3 transition-transform ${showOverflow ? 'rotate-180' : ''}`} />
              </button>

              {showOverflow && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[200px] py-2 z-50">
                  <div className="space-y-1 px-2">
                    {overflowItems.map((option) => renderChip(option, true))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 설정 버튼 */}
          {settings.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`
                  text-gray-600 hover:text-gray-900 hover:bg-gray-50
                  border border-gray-300 hover:border-gray-400
                  rounded-full
                  transition-all duration-300
                  flex items-center justify-center
                  hover:scale-105 active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2
                  w-11 h-11
                  min-w-[2.75rem]
                  p-0
                  bg-white
                  shadow-sm
                `}
                aria-expanded={showSettings}
                aria-haspopup="true"
                aria-label="필터 설정"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
              </button>

              {showSettings && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[280px] p-4 z-50">
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">{settingsTitle}</h3>
                  </div>
                  <div className="space-y-3">
                    {settings.map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">{setting.label}</label>
                        {setting.type === 'toggle' && (
                          <button
                            onClick={() => setting.onChange(!setting.value)}
                            className={`
                              w-10 h-6 rounded-full transition-colors relative
                              ${setting.value ? 'bg-blue-600' : 'bg-gray-300'}
                            `}
                          >
                            <div className={`
                              w-4 h-4 bg-white rounded-full absolute top-1 transition-transform
                              ${setting.value ? 'translate-x-5' : 'translate-x-1'}
                            `} />
                          </button>
                        )}
                        {setting.type === 'select' && setting.options && (
                          <select 
                            value={setting.value || ''}
                            onChange={(e) => setting.onChange(e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {setting.options.map((option) => (
                              <option key={option} value={option}>
                                {getOptionLabel(option)}
                              </option>
                            ))}
                          </select>
                        )}
                        {setting.type === 'multi-select' && setting.options && (
                          <div className="relative">
                            <select 
                              multiple
                              value={setting.value || []}
                              onChange={(e) => {
                                const values = Array.from(e.target.selectedOptions, option => option.value)
                                setting.onChange(values)
                              }}
                              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px]"
                            >
                              {setting.options.map((option) => (
                                <option key={option} value={option}>
                                  {getOptionLabel(option)}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        {setting.type === 'range' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="최소"
                              value={setting.value?.[0] || ''}
                              onChange={(e) => {
                                const newValue = [parseInt(e.target.value) || 0, setting.value?.[1] || 100]
                                setting.onChange(newValue)
                              }}
                              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 w-16"
                            />
                            <span className="text-gray-400">~</span>
                            <input
                              type="number"
                              placeholder="최대"
                              value={setting.value?.[1] || ''}
                              onChange={(e) => {
                                const newValue = [setting.value?.[0] || 0, parseInt(e.target.value) || 100]
                                setting.onChange(newValue)
                              }}
                              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 w-16"
                            />
                          </div>
                        )}
                        {setting.type === 'tag-selector' && setting.options && (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {setting.options.map((option) => {
                              const isSelected = setting.value?.includes(option)
                              return (
                                <button
                                  key={option}
                                  onClick={() => {
                                    const currentValue = setting.value || []
                                    const newValue = isSelected 
                                      ? currentValue.filter((v: string) => v !== option)
                                      : [...currentValue, option]
                                    setting.onChange(newValue)
                                  }}
                                  className={`
                                    px-2 py-1 text-xs rounded-full border transition-colors
                                    ${isSelected 
                                      ? 'bg-blue-100 border-blue-300 text-blue-700' 
                                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                    }
                                  `}
                                >
                                  {getOptionLabel(option)}
                                </button>
                              )
                            })}
                          </div>
                        )}
                        {setting.type === 'date-range' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="date"
                              value={setting.value?.[0] || ''}
                              onChange={(e) => {
                                const newValue = [e.target.value, setting.value?.[1] || '']
                                setting.onChange(newValue)
                              }}
                              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-gray-400">~</span>
                            <input
                              type="date"
                              value={setting.value?.[1] || ''}
                              onChange={(e) => {
                                const newValue = [setting.value?.[0] || '', e.target.value]
                                setting.onChange(newValue)
                              }}
                              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 모바일 */}
      <div className="md:hidden">
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10" />
        
        <div className="flex items-center gap-3">
          <div 
            ref={scrollContainerRef}
            className="flex space-x-3 overflow-x-auto scrollbar-hide px-5 py-3 flex-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {options.map((option) => renderChip(option))}
          </div>
          
          {/* 모바일 설정 버튼 */}
          {settings.length > 0 && (
            <div className="pr-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`
                  text-gray-600 hover:text-gray-900 hover:bg-gray-50
                  border border-gray-300 hover:border-gray-400
                  rounded-full
                  transition-all duration-300
                  flex items-center justify-center
                  hover:scale-105 active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2
                  w-11 h-11
                  min-w-[2.75rem]
                  p-0
                  bg-white
                  shadow-sm
                `}
                aria-expanded={showSettings}
                aria-haspopup="true"
                aria-label="필터 설정"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* 모바일 바텀시트 설정 모달 */}
      {settings.length > 0 && showSettings && (
        <div className="md:hidden fixed inset-0 z-[60] flex items-end">
          <div 
            className="absolute inset-0 bg-black bg-opacity-25" 
            onClick={() => setShowSettings(false)}
          />
          <div className="relative bg-white w-full max-h-[70vh] rounded-t-xl shadow-xl">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{settingsTitle}</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* 모달 콘텐츠 */}
            <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto">
              {settings.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between py-2">
                  <label className="text-sm font-medium text-gray-700">{setting.label}</label>
                  {setting.type === 'toggle' && (
                    <button
                      onClick={() => setting.onChange(!setting.value)}
                      className={`
                        w-12 h-7 rounded-full transition-colors relative
                        ${setting.value ? 'bg-blue-600' : 'bg-gray-300'}
                      `}
                    >
                      <div className={`
                        w-5 h-5 bg-white rounded-full absolute top-1 transition-transform
                        ${setting.value ? 'translate-x-6' : 'translate-x-1'}
                      `} />
                    </button>
                  )}
                  {setting.type === 'select' && setting.options && (
                    <select 
                      value={setting.value || ''}
                      onChange={(e) => setting.onChange(e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                    >
                      {setting.options.map((option) => (
                        <option key={option} value={option}>
                          {getOptionLabel(option)}
                        </option>
                      ))}
                    </select>
                  )}
                  {setting.type === 'multi-select' && setting.options && (
                    <div className="relative">
                      <select 
                        multiple
                        value={setting.value || []}
                        onChange={(e) => {
                          const values = Array.from(e.target.selectedOptions, option => option.value)
                          setting.onChange(values)
                        }}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px] min-h-[100px]"
                      >
                        {setting.options.map((option) => (
                          <option key={option} value={option}>
                            {getOptionLabel(option)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {setting.type === 'range' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="최소"
                        value={setting.value?.[0] || ''}
                        onChange={(e) => {
                          const newValue = [parseInt(e.target.value) || 0, setting.value?.[1] || 100]
                          setting.onChange(newValue)
                        }}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-16"
                      />
                      <span className="text-gray-400">~</span>
                      <input
                        type="number"
                        placeholder="최대"
                        value={setting.value?.[1] || ''}
                        onChange={(e) => {
                          const newValue = [setting.value?.[0] || 0, parseInt(e.target.value) || 100]
                          setting.onChange(newValue)
                        }}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-16"
                      />
                    </div>
                  )}
                  {setting.type === 'tag-selector' && setting.options && (
                    <div className="flex flex-wrap gap-1 max-w-[240px]">
                      {setting.options.map((option) => {
                        const isSelected = setting.value?.includes(option)
                        return (
                          <button
                            key={option}
                            onClick={() => {
                              const currentValue = setting.value || []
                              const newValue = isSelected 
                                ? currentValue.filter((v: string) => v !== option)
                                : [...currentValue, option]
                              setting.onChange(newValue)
                            }}
                            className={`
                              px-3 py-1.5 text-xs rounded-full border transition-colors
                              ${isSelected 
                                ? 'bg-blue-100 border-blue-300 text-blue-700' 
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                              }
                            `}
                          >
                            {getOptionLabel(option)}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {setting.type === 'date-range' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={setting.value?.[0] || ''}
                        onChange={(e) => {
                          const newValue = [e.target.value, setting.value?.[1] || '']
                          setting.onChange(newValue)
                        }}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-400">~</span>
                      <input
                        type="date"
                        value={setting.value?.[1] || ''}
                        onChange={(e) => {
                          const newValue = [setting.value?.[0] || '', e.target.value]
                          setting.onChange(newValue)
                        }}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* 모달 푸터 */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}