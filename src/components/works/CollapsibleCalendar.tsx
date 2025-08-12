'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface CollapsibleCalendarProps {
  isExpanded: boolean
  onDateSelect: (date: Date) => void
  onClose: () => void
  onToggle?: () => void // 수동 토글 기능
  tasksWithDates: { [dateKey: string]: number } // 날짜별 업무 개수
  selectedDate?: Date
  keepOpenOnDrop?: boolean // 드롭 시 달력 유지 여부
  isDragMode?: boolean // 드래그 중인지 여부
}

export default function CollapsibleCalendar({
  isExpanded,
  onDateSelect,
  onClose,
  onToggle,
  tasksWithDates,
  selectedDate,
  keepOpenOnDrop = false,
  isDragMode = false
}: CollapsibleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [animatingDate, setAnimatingDate] = useState<string | null>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  
  // 캘린더 필터 제거됨 - 간단한 인터페이스를 위해
  const [showNoDue, setShowNoDue] = useState(false)
  const [showOverdue, setShowOverdue] = useState(false)

  // 달력 바깥 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 드래그 중일 때는 외부 클릭으로 달력 닫지 않음
      if (isDragMode) return
      
      if (isExpanded && calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        // 클릭된 요소가 드래그 가능한 업무 카드인지 확인
        const clickedElement = event.target as HTMLElement
        const taskCard = clickedElement.closest('[draggable="true"]') || clickedElement.closest('.group')
        
        // 업무 카드를 클릭한 경우 달력을 닫지 않음
        if (taskCard) return
        
        onClose()
      }
    }

    if (isExpanded) {
      // 약간의 지연 후 이벤트 리스너 등록 (달력 열림 애니메이션과 충돌 방지)
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 300)
      
      return () => {
        clearTimeout(timer)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isExpanded, onClose, isDragMode])

  // 현재 월의 달력 데이터 생성
  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    
    // 월의 첫째 날과 마지막 날
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // 달력 시작일 (첫째 주 일요일)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    // 달력 종료일 (마지막 주 토요일)
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
    
    const days = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  // 날짜 키 생성 (YYYY-MM-DD 형식)
  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  // 날짜가 오늘인지 확인
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // 날짜가 현재 월에 속하는지 확인
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth() && 
           date.getFullYear() === currentMonth.getFullYear()
  }

  // 월 이동
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  // 날짜 선택 처리
  const handleDateClick = (date: Date) => {
    onDateSelect(date)
    if (!keepOpenOnDrop) {
      onClose()
    }
  }

  // 드래그 앤 드롭 처리
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    const dateKey = getDateKey(date)
    
    // 드롭 성공 애니메이션 시작
    setAnimatingDate(dateKey)
    
    // 날짜 선택 처리
    onDateSelect(date)
    
    // keepOpenOnDrop이 false일 때만 달력 닫기
    if (!keepOpenOnDrop) {
      onClose()
    }
    
    // 2초 후 애니메이션 종료
    setTimeout(() => {
      setAnimatingDate(null)
    }, 2000)
  }

  const calendarDays = generateCalendarDays(currentMonth)
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  // 접힌 상태에서의 주간 뷰 (현재 주)
  const getCurrentWeekDays = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      weekDays.push(day)
    }
    return weekDays
  }

  const currentWeek = getCurrentWeekDays()

  // 완전 숨기기/보이기만 - 접힌 상태 없음
  if (!isExpanded) {
    return null
  }

  return (
    <div className="relative">
      {/* 전체 월간 캘린더 */}
      <div 
        ref={calendarRef}
        className="bg-white border-t border-gray-200 shadow-lg animate-slide-up"
        style={{
          animation: 'slideUp 0.3s ease-out'
        }}
      >
          <div className="p-4">
            {/* 헤더 */}
            <div className="mb-4">
              {/* 3칸 구조: 스케일 왼쪽여백 | 중앙헤더 | 스케일 오른쪽여백 */}
              <div className="flex mb-3">
                {/* 왼쪽 여백 - 화면 크기에 비례해서 스케일 (일 텍스트 바깥쪽) */}
                <div style={{
                  width: '5vw',
                  minWidth: '16px',
                  maxWidth: '60px'
                }}></div>
                
                {/* 중앙 헤더: 날짜 + 버튼 + 필터 - 가득 채우기 */}
                <div className="flex-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {currentMonth.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
                    </h3>
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-1.5 hover:bg-gray-100 rounded-full"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-1.5 hover:bg-gray-100 rounded-full"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowNoDue(!showNoDue)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                        showNoDue 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      마감일 미지정
                    </button>
                    <button
                      onClick={() => setShowOverdue(!showOverdue)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                        showOverdue 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      마감일 지남
                    </button>
                  </div>
                </div>
                
                {/* 오른쪽 여백 - 화면 크기에 비례해서 스케일 (토 텍스트 바깐쪽) */}
                <div style={{
                  width: '5vw',
                  minWidth: '16px',
                  maxWidth: '60px'
                }}></div>
              </div>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="h-8 flex items-center justify-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 달력 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dateKey = getDateKey(day)
                const taskCount = tasksWithDates[dateKey] || 0
                const isCurrentDay = isToday(day)
                const isInCurrentMonth = isCurrentMonth(day)
                const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString()
                const isAnimating = animatingDate === dateKey
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(day)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day)}
                    className={`
                      h-12 flex flex-col items-center justify-center text-sm rounded-lg transition-all relative
                      ${isInCurrentMonth ? 'text-gray-900 hover:bg-gray-100' : 'text-gray-400'}
                      ${isCurrentDay ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                      ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                      ${taskCount > 0 && !isCurrentDay ? 'font-semibold' : ''}
                      ${isAnimating ? 'ring-4 ring-blue-400 bg-blue-100 animate-pulse' : ''}
                    `}
                  >
                    <span>{day.getDate()}</span>
                    {taskCount > 0 && !isCurrentDay && (
                      <div className="flex gap-0.5 mt-0.5">
                        {Array.from({ length: Math.min(taskCount, 3) }).map((_, i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                          />
                        ))}
                        {taskCount > 3 && (
                          <div className="text-xs text-blue-600 ml-1">+</div>
                        )}
                      </div>
                    )}
                    
                    {/* 드롭 성공 체크마크 */}
                    {isAnimating && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center animate-bounce">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>


            {/* 하단 안내 텍스트 */}
            <div className="mt-4 text-center text-sm text-gray-500">
              업무를 드래그해서 날짜를 지정해보세요.
            </div>
          </div>
        </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}