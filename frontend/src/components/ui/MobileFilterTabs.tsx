'use client'

import { ReactNode, useRef, useEffect } from 'react'

interface FilterOption {
  key: string
  label: string
  count?: number
  icon?: ReactNode
}

interface MobileFilterTabsProps {
  options: FilterOption[]
  activeFilter: string
  onFilterChange: (filter: string) => void
  className?: string
  variant?: 'chips' | 'tabs' | 'cards'
}

/**
 * 향상된 모바일 필터 컴포넌트
 * - 스크롤 가능한 무한 확장성
 * - 모던한 디자인 변형 지원
 * - 자동 중앙 정렬 및 스크롤
 */
export default function MobileFilterTabs({ 
  options, 
  activeFilter, 
  onFilterChange,
  className = '',
  variant = 'chips'
}: MobileFilterTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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

  if (variant === 'chips') {
    return (
      <div className={`relative bg-gradient-to-r from-gray-50 to-white px-4 py-3 ${className}`}>
        {/* 그라디언트 페이드 효과 */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
        
        <div 
          ref={scrollContainerRef}
          className="flex space-x-2 overflow-x-auto scrollbar-hide pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {options.map((option) => (
            <button
              key={option.key}
              data-filter={option.key}
              onClick={() => onFilterChange(option.key)}
              className={`
                flex-shrink-0
                px-4 py-2
                text-sm font-medium
                rounded-full
                transition-all duration-300
                flex items-center gap-2
                min-w-max
                transform hover:scale-105
                ${
                  activeFilter === option.key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              {option.icon && (
                <span className="w-4 h-4 flex items-center justify-center">
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
                    ${
                      activeFilter === option.key 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }
                  `}
                >
                  {option.count > 99 ? '99+' : option.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'cards') {
    return (
      <div className={`bg-gray-50 p-4 ${className}`}>
        <div 
          ref={scrollContainerRef}
          className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {options.map((option) => (
            <button
              key={option.key}
              data-filter={option.key}
              onClick={() => onFilterChange(option.key)}
              className={`
                flex-shrink-0 
                min-w-[120px]
                p-4
                rounded-xl
                transition-all duration-300
                transform hover:scale-105
                ${
                  activeFilter === option.key
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/30'
                    : 'bg-white text-gray-700 hover:text-gray-900 shadow-md hover:shadow-lg border border-gray-200'
                }
              `}
            >
              <div className="text-center space-y-2">
                {option.icon && (
                  <div className="flex justify-center">
                    <span className="w-6 h-6 flex items-center justify-center">
                      {option.icon}
                    </span>
                  </div>
                )}
                <div className="text-sm font-medium">{option.label}</div>
                {option.count !== undefined && (
                  <div 
                    className={`
                      text-xs font-semibold
                      ${
                        activeFilter === option.key 
                          ? 'text-white/80' 
                          : 'text-gray-500'
                      }
                    `}
                  >
                    {option.count}개
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // 기본 tabs 변형 (개선된 버전)
  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {options.map((option) => (
          <button
            key={option.key}
            data-filter={option.key}
            onClick={() => onFilterChange(option.key)}
            className={`
              flex-shrink-0
              px-6 py-4
              text-sm font-medium
              transition-all duration-300
              flex items-center gap-2
              border-b-2
              min-w-max
              relative
              ${
                activeFilter === option.key
                  ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300'
              }
            `}
          >
            {option.icon && (
              <span className="w-4 h-4 flex items-center justify-center">
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
                  ${
                    activeFilter === option.key 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600'
                  }
                `}
              >
                {option.count > 99 ? '99+' : option.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}