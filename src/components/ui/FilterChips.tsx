'use client'

import { ReactNode, useRef, useEffect, useState } from 'react'
import { ChevronDownIcon, XMarkIcon, FunnelIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'

interface FilterOption {
  key: string
  label: string
  count?: number
  icon?: ReactNode
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray'
}

interface FilterChipsProps {
  options: FilterOption[]
  activeFilter: string
  onFilterChange: (filter: string) => void
  className?: string
  variant?: 'compact' | 'comfortable' | 'spacious'
  style?: 'modern' | 'minimal' | 'glassmorphism' | 'neumorphism'
  showClearAll?: boolean
  maxVisibleItems?: number
  sortable?: boolean
  filterSettings?: {
    title: string
    settings: Array<{
      key: string
      label: string
      type: 'toggle' | 'select' | 'range'
      value?: any
      options?: string[]
      onChange: (value: any) => void
    }>
  }
}

/**
 * 최신 트렌드 통합 필터 칩 컴포넌트
 * - 반응형 디자인 (모바일/데스크톱 통일)
 * - 다양한 스타일 변형 지원
 * - 스마트 오버플로우 처리
 * - 접근성 최적화
 */
export default function FilterChips({ 
  options, 
  activeFilter, 
  onFilterChange,
  className = '',
  variant = 'comfortable',
  style = 'modern',
  showClearAll = false,
  maxVisibleItems,
  sortable = false,
  filterSettings
}: FilterChipsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showOverflow, setShowOverflow] = useState(false)
  const [overflowItems, setOverflowItems] = useState<FilterOption[]>([])
  const [visibleItems, setVisibleItems] = useState<FilterOption[]>(options)
  const [showFilterSettings, setShowFilterSettings] = useState(false)

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
        active: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25',
        inactive: 'text-blue-600 hover:bg-blue-50 border-blue-200 hover:border-blue-300'
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

  // 스타일 변형별 클래스
  const getStyleClasses = () => {
    switch (style) {
      case 'minimal':
        return {
          container: 'bg-transparent',
          active: 'bg-gray-900 text-white border-gray-900',
          inactive: 'bg-transparent text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400',
          badge: 'bg-white/20 text-white'
        }
      case 'glassmorphism':
        return {
          container: 'bg-white/10 backdrop-blur-lg',
          active: 'bg-white/20 text-gray-900 border-white/30 backdrop-blur-sm',
          inactive: 'bg-white/5 text-gray-700 hover:bg-white/10 border border-white/20 hover:border-white/30 backdrop-blur-sm',
          badge: 'bg-white/30 text-gray-900'
        }
      case 'neumorphism':
        return {
          container: 'bg-gray-100',
          active: 'bg-gray-100 text-gray-900 shadow-inner border-none',
          inactive: 'bg-gray-100 text-gray-600 hover:text-gray-900 shadow-lg hover:shadow-xl border-none',
          badge: 'bg-gray-200 text-gray-700'
        }
      default: // modern
        return {
          container: 'bg-gradient-to-r from-gray-50/50 to-white/50',
          active: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 border-none',
          inactive: 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md',
          badge: 'bg-white/20 text-white'
        }
    }
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

  const styleClasses = getStyleClasses()
  const variantClasses = getVariantClasses()

  const handleClearAll = () => {
    onFilterChange('')
  }

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
                ? styleClasses.active
                : styleClasses.inactive
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

  return (
    <div className={`relative ${styleClasses.container} ${className}`}>
      {/* 데스크톱: 가로 스크롤 + 오버플로우 */}
      <div className="hidden md:block">
        <div className="flex items-center gap-3 px-6 py-4">
          {/* 메인 필터 칩들 */}
          <div 
            ref={scrollContainerRef}
            className="flex space-x-2 overflow-x-auto scrollbar-hide flex-1"
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
                  ${variantClasses}
                  ${styleClasses.inactive}
                  rounded-full
                  transition-all duration-300
                  flex items-center gap-1
                  hover:scale-105 active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2
                `}
                aria-expanded={showOverflow}
                aria-haspopup="true"
              >
                <FunnelIcon className="w-4 h-4" />
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

          {/* 필터 설정 버튼 */}
          {filterSettings && (
            <div className="relative">
              <button
                onClick={() => setShowFilterSettings(!showFilterSettings)}
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
                aria-expanded={showFilterSettings}
                aria-haspopup="true"
                aria-label="필터 설정"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
              </button>

              {showFilterSettings && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[280px] p-4 z-50">
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">{filterSettings.title}</h3>
                  </div>
                  <div className="space-y-3">
                    {filterSettings.settings.map((setting) => (
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
                                {option === 'deadline' ? '마감일순' :
                                 option === 'priority' ? '우선순위순' :
                                 option === 'created' ? '생성일순' :
                                 option === 'updated' ? '수정일순' :
                                 option === 'latest' ? '최신순' :
                                 option === 'popular' ? '인기순' :
                                 option === 'comments' ? '댓글순' :
                                 option === 'views' ? '조회순' :
                                 option === 'recent' ? '최근순' :
                                 option === 'progress' ? '진행률순' :
                                 option === 'members' ? '멤버순' :
                                 option}
                              </option>
                            ))}
                          </select>
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

      {/* 모바일: 가로 스크롤 + 필터 설정 버튼 */}
      <div className="md:hidden">
        {/* 향상된 그라디언트 페이드 효과 */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10" />
        
        <div className="flex items-center gap-3">
          <div 
            ref={scrollContainerRef}
            className="flex space-x-3 overflow-x-auto scrollbar-hide px-4 py-3 flex-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {options.map((option) => renderChip(option))}
          </div>
          
          {/* 모바일 필터 설정 버튼 */}
          {filterSettings && (
            <div className="pr-4">
              <button
                onClick={() => setShowFilterSettings(!showFilterSettings)}
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
                aria-expanded={showFilterSettings}
                aria-haspopup="true"
                aria-label="필터 설정"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* 모바일 바텀시트 필터 설정 모달 */}
      {filterSettings && showFilterSettings && (
        <div className="md:hidden fixed inset-0 z-[60] flex items-end">
          <div 
            className="absolute inset-0 bg-black bg-opacity-25" 
            onClick={() => setShowFilterSettings(false)}
          />
          <div className="relative bg-white w-full max-h-[70vh] rounded-t-xl shadow-xl">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{filterSettings.title}</h3>
              <button
                onClick={() => setShowFilterSettings(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* 모달 콘텐츠 */}
            <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto">
              {filterSettings.settings.map((setting) => (
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
                          {option === 'deadline' ? '마감일순' :
                           option === 'priority' ? '우선순위순' :
                           option === 'created' ? '생성일순' :
                           option === 'updated' ? '수정일순' :
                           option === 'latest' ? '최신순' :
                           option === 'popular' ? '인기순' :
                           option === 'comments' ? '댓글순' :
                           option === 'views' ? '조회순' :
                           option === 'recent' ? '최근순' :
                           option === 'progress' ? '진행률순' :
                           option === 'members' ? '멤버순' :
                           option}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
            
            {/* 모달 푸터 */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowFilterSettings(false)}
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