'use client'

import { useState } from 'react'
import { XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'

interface FilterOption {
  key: string
  label: string
  count?: number
}

interface FilterSetting {
  key: string
  label: string
  type: 'toggle' | 'select'
  value?: any
  options?: string[]
  onChange: (value: any) => void
}

interface SimpleFilterChipsProps {
  options: FilterOption[]
  activeFilters: string[]
  onFilterChange: (filters: string[]) => void
  className?: string
  settings?: {
    title: string
    settings: FilterSetting[]
  }
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
  settings
}: SimpleFilterChipsProps) {
  
  const [showSettings, setShowSettings] = useState(false)
  
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
      
      {/* 필터 설정 버튼 */}
      {settings && (
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white text-gray-600 border border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-50 transition-colors"
            aria-label="필터 설정"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </button>
          
          {/* 설정 드롭다운 */}
          {showSettings && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] p-4 z-50">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{settings.title}</h3>
              <div className="space-y-3">
                {settings.settings.map((setting) => (
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
                        className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {setting.options.map((option) => (
                          <option key={option} value={option}>
                            {option === 'priority' ? '우선순위순' :
                             option === 'dueDate' ? '마감일순' :
                             option === 'status' ? '상태순' :
                             option === 'created' ? '생성순' : option}
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
  )
}