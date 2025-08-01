'use client'

import { ReactNode, useRef, useEffect, useState } from 'react'
import { ChevronDownIcon, XMarkIcon, AdjustmentsHorizontalIcon, PlusIcon } from '@heroicons/react/24/outline'

// 필터 조건 인터페이스
interface FilterCondition {
  key: string
  operator: 'equals' | 'contains' | 'range' | 'in' | 'boolean'
  value: any
  label: string
}

// 필터 칩 인터페이스
interface FilterChip {
  id: string
  label: string
  isDefault: boolean // 기본 칩 여부 (삭제 불가)
  conditions: FilterCondition[]
  count?: number
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray'
  icon?: ReactNode
  removable: boolean
}

// 필터 설정 옵션
interface FilterSetting {
  key: string
  label: string
  type: 'toggle' | 'select' | 'multi-select' | 'range' | 'tag-selector' | 'date-range' | 'text'
  value?: any
  options?: string[] | Array<{key: string, label: string}>
  placeholder?: string
  validation?: (value: any) => boolean
  onChange: (value: any) => void
}

// 칩 이름 생성 규칙
interface ChipNamingRule {
  conditions: Array<{key: string, operator?: string}>
  getName: (conditions: FilterCondition[]) => string
  getColor: () => FilterChip['color']
}

interface FilterManagerProps {
  // 기본 칩들 (필수)
  defaultChips: Omit<FilterChip, 'removable'>[]
  
  // 현재 활성 칩
  activeChipId: string
  onChipChange: (chipId: string) => void
  
  // 필터 설정들
  settings: FilterSetting[]
  settingsTitle?: string
  
  // 칩 생성 규칙들
  namingRules?: ChipNamingRule[]
  
  // 데이터 카운트 함수 (칩별 개수 계산)
  getChipCount?: (conditions: FilterCondition[]) => number
  
  // 스타일 옵션
  className?: string
  variant?: 'compact' | 'comfortable' | 'spacious'
  style?: 'modern' | 'minimal' | 'glassmorphism'
}

export default function FilterManager({
  defaultChips,
  activeChipId,
  onChipChange,
  settings,
  settingsTitle = '필터 설정',
  namingRules = [],
  getChipCount,
  className = '',
  variant = 'comfortable',
  style = 'modern'
}: FilterManagerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [customChips, setCustomChips] = useState<FilterChip[]>([])
  
  // 모든 칩들 (기본 + 커스텀)
  const allChips = [
    ...defaultChips.map(chip => ({ ...chip, removable: false })),
    ...customChips
  ]

  // 활성 칩으로 자동 스크롤
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector(`[data-chip-id="${activeChipId}"]`)
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    }
  }, [activeChipId])

  // 칩 이름 자동 생성
  const generateChipName = (conditions: FilterCondition[]): string => {
    for (const rule of namingRules) {
      const matches = rule.conditions.every(ruleCondition => 
        conditions.some(condition => 
          condition.key === ruleCondition.key && 
          (!ruleCondition.operator || condition.operator === ruleCondition.operator)
        )
      )
      if (matches) {
        return rule.getName(conditions)
      }
    }
    
    // 기본 이름 생성
    if (conditions.length === 1) {
      return conditions[0].label
    } else if (conditions.length === 2) {
      return `${conditions[0].label} + ${conditions[1].label}`
    } else {
      return `복합 필터 (${conditions.length}개 조건)`
    }
  }

  // 칩 색상 자동 결정
  const generateChipColor = (conditions: FilterCondition[]): FilterChip['color'] => {
    for (const rule of namingRules) {
      const matches = rule.conditions.every(ruleCondition => 
        conditions.some(condition => condition.key === ruleCondition.key)
      )
      if (matches) {
        return rule.getColor()
      }
    }
    return 'blue' // 기본 색상
  }

  // 새 칩 생성 (필터 설정에서 조건이 변경될 때)
  const createChipFromConditions = () => {
    const conditions: FilterCondition[] = []
    
    // 설정들을 조건으로 변환
    settings.forEach(setting => {
      if (setting.value !== undefined && setting.value !== '' && setting.value !== false) {
        if (setting.type === 'toggle' && setting.value) {
          conditions.push({
            key: setting.key,
            operator: 'boolean',
            value: true,
            label: setting.label
          })
        } else if (setting.type === 'select' && setting.value !== 'all') {
          conditions.push({
            key: setting.key,
            operator: 'equals',
            value: setting.value,
            label: `${setting.label}: ${getOptionLabel(setting.value)}`
          })
        } else if (setting.type === 'multi-select' && Array.isArray(setting.value) && setting.value.length > 0) {
          conditions.push({
            key: setting.key,
            operator: 'in',
            value: setting.value,
            label: `${setting.label}: ${setting.value.map(v => getOptionLabel(v)).join(', ')}`
          })
        } else if (setting.type === 'tag-selector' && Array.isArray(setting.value) && setting.value.length > 0) {
          conditions.push({
            key: setting.key,
            operator: 'in',
            value: setting.value,
            label: `${setting.label}: ${setting.value.map(v => getOptionLabel(v)).join(', ')}`
          })
        } else if (setting.type === 'range' && Array.isArray(setting.value)) {
          const [min, max] = setting.value
          if (min > 0 || max < 100) {
            conditions.push({
              key: setting.key,
              operator: 'range',
              value: setting.value,
              label: `${setting.label}: ${min}-${max}`
            })
          }
        }
      }
    })

    if (conditions.length === 0) return

    // 이미 같은 조건의 칩이 있는지 확인
    const existingChip = customChips.find(chip => 
      chip.conditions.length === conditions.length &&
      chip.conditions.every(condition => 
        conditions.some(newCondition => 
          newCondition.key === condition.key && 
          newCondition.operator === condition.operator &&
          JSON.stringify(newCondition.value) === JSON.stringify(condition.value)
        )
      )
    )

    if (existingChip) {
      // 기존 칩 활성화
      onChipChange(existingChip.id)
      return
    }

    // 새 칩 생성
    const newChip: FilterChip = {
      id: `custom-${Date.now()}`,
      label: generateChipName(conditions),
      isDefault: false,
      conditions,
      count: getChipCount ? getChipCount(conditions) : undefined,
      color: generateChipColor(conditions),
      removable: true
    }

    setCustomChips(prev => [...prev, newChip])
    onChipChange(newChip.id)
  }

  // 칩 삭제
  const removeChip = (chipId: string) => {
    setCustomChips(prev => prev.filter(chip => chip.id !== chipId))
    
    // 삭제된 칩이 현재 활성 칩이면 기본 칩으로 변경
    if (activeChipId === chipId) {
      onChipChange(defaultChips[0]?.id || 'all')
    }
  }

  // 옵션 라벨 가져오기
  const getOptionLabel = (value: string) => {
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
    return labels[value] || value
  }

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

  const renderChip = (chip: FilterChip) => {
    const isActive = activeChipId === chip.id
    const colorClasses = chip.color ? getColorClasses(chip.color, isActive) : null
    
    return (
      <div key={chip.id} className="flex items-center gap-1">
        <button
          data-chip-id={chip.id}
          onClick={() => onChipChange(chip.id)}
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
          `}
          aria-pressed={isActive}
          role="button"
        >
          {chip.icon && (
            <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              {chip.icon}
            </span>
          )}
          <span className="whitespace-nowrap">{chip.label}</span>
          {chip.count !== undefined && chip.count > 0 && (
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
              {chip.count > 999 ? '999+' : chip.count}
            </span>
          )}
        </button>
        
        {/* 삭제 버튼 */}
        {chip.removable && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              removeChip(chip.id)
            }}
            className="w-5 h-5 rounded-full bg-gray-200 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors flex items-center justify-center ml-1"
            aria-label={`${chip.label} 필터 삭제`}
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        )}
      </div>
    )
  }

  const renderSettingControl = (setting: FilterSetting) => {
    switch (setting.type) {
      case 'toggle':
        return (
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
        )
      
      case 'select':
        return (
          <select 
            value={setting.value || ''}
            onChange={(e) => setting.onChange(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {(setting.options || []).map((option) => (
              <option key={option} value={option}>
                {getOptionLabel(option)}
              </option>
            ))}
          </select>
        )
      
      case 'multi-select':
        return (
          <select 
            multiple
            value={setting.value || []}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value)
              setting.onChange(values)
            }}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px]"
          >
            {(setting.options || []).map((option) => (
              <option key={option} value={option}>
                {getOptionLabel(option)}
              </option>
            ))}
          </select>
        )
      
      case 'range':
        return (
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
        )
      
      case 'tag-selector':
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {(setting.options || []).map((option) => {
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
        )
      
      case 'date-range':
        return (
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
        )
      
      case 'text':
        return (
          <input
            type="text"
            value={setting.value || ''}
            onChange={(e) => setting.onChange(e.target.value)}
            placeholder={setting.placeholder}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className={`relative bg-gradient-to-r from-gray-50/50 to-white/50 ${className}`}>
      {/* 데스크톱 */}
      <div className="hidden md:block">
        <div className="flex items-center gap-3 px-0 py-0">
          {/* 필터 칩들 */}
          <div 
            ref={scrollContainerRef}
            className="flex space-x-2 overflow-x-auto scrollbar-hide flex-1 px-0 py-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {allChips.map((chip) => renderChip(chip))}
          </div>

          {/* 설정 버튼 */}
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
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[320px] p-4 z-50">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">{settingsTitle}</h3>
                  <button
                    onClick={createChipFromConditions}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <PlusIcon className="w-3 h-3" />
                    칩 생성
                  </button>
                </div>
                <div className="space-y-3">
                  {settings.map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">{setting.label}</label>
                      {renderSettingControl(setting)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 모바일 */}
      <div className="md:hidden">
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10" />
        
        <div className="flex items-center">
          <div 
            ref={scrollContainerRef}
            className="flex space-x-3 overflow-x-auto scrollbar-hide px-4 py-2 flex-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {allChips.map((chip) => renderChip(chip))}
          </div>
          
          {/* 모바일 설정 버튼 */}
          <div className="pr-4 pl-3">
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
        </div>
      </div>
      
      {/* 모바일 바텀시트 설정 모달 */}
      {showSettings && (
        <div className="md:hidden fixed inset-0 z-[60] flex items-end">
          <div 
            className="absolute inset-0 bg-black bg-opacity-25" 
            onClick={() => setShowSettings(false)}
          />
          <div className="relative bg-white w-full max-h-[70vh] rounded-t-xl shadow-xl">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{settingsTitle}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={createChipFromConditions}
                  className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  칩 생성
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* 모달 콘텐츠 */}
            <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto">
              {settings.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between py-2">
                  <label className="text-sm font-medium text-gray-700">{setting.label}</label>
                  {renderSettingControl(setting)}
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