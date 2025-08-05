'use client'

import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline'

interface FilterOption {
  key: string
  label: string
  count?: number
}


interface SimpleFilterChipsProps {
  options: FilterOption[]
  activeFilters: string[]
  onFilterChange: (filters: string[]) => void
  className?: string
  onAdvancedFilterClick?: () => void
  hasAdvancedFilters?: boolean
}

/**
 * 워클리 디자인 시스템을 준수하는 매우 간결한 필터 칩 컴포넌트
 * - 단일 색상 체계 (Blue Primary + Gray Secondary)
 * - 간결한 디자인
 * - 모바일/데스크톱 통합 대응
 */
export default function SimpleFilterChips({ 
  options, 
  activeFilters,
  onFilterChange,
  className = '',
  onAdvancedFilterClick,
  hasAdvancedFilters = false
}: SimpleFilterChipsProps) {
  
  
  const handleChipClick = (key: string) => {
    if (activeFilters.includes(key)) {
      onFilterChange(activeFilters.filter(f => f !== key))
    } else {
      onFilterChange([...activeFilters, key])
    }
  }

  const handleRemoveFilter = (key: string) => {
    onFilterChange(activeFilters.filter(f => f !== key))
  }

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {/* 활성 필터 칩들 */}
      <div className="flex items-center gap-2 flex-1">
        {activeFilters.length > 0 ? (
          <>
            {activeFilters.map(filterKey => {
              const option = options.find(opt => opt.key === filterKey)
              if (!option) return null
              
              return (
                <div
                  key={filterKey}
                  className="workly-filter-chip active inline-flex items-center gap-2 font-medium"
                >
                  <span>{option.label}</span>
                  {option.count && (
                    <span className="text-xs bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded-full">
                      {option.count}
                    </span>
                  )}
                  <button
                    onClick={() => handleRemoveFilter(filterKey)}
                    className="w-4 h-4 flex items-center justify-center hover:bg-blue-200 rounded-full transition-colors"
                    aria-label={`${option.label} 필터 제거`}
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              )
            })}
          </>
        ) : (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {options.map(option => (
              <button
                key={option.key}
                onClick={() => handleChipClick(option.key)}
                className="workly-filter-chip flex-shrink-0 inline-flex items-center gap-2 font-medium"
              >
                <span>{option.label}</span>
                {option.count && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                    {option.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* 상세 필터 버튼 */}
      {onAdvancedFilterClick && (
        <button
          onClick={onAdvancedFilterClick}
          className={`flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-50 transition-colors ${
            hasAdvancedFilters ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-gray-600'
          }`}
          aria-label="상세 필터"
        >
          <FunnelIcon className="w-5 h-5" />
        </button>
      )}
      
    </div>
  )
}