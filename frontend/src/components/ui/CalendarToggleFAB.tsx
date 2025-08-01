'use client'

import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface CalendarToggleFABProps {
  isCalendarExpanded: boolean
  onToggle: () => void
}

export default function CalendarToggleFAB({ 
  isCalendarExpanded, 
  onToggle 
}: CalendarToggleFABProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        w-14 h-14 
        bg-gray-600 hover:bg-gray-700 
        text-white 
        rounded-full 
        shadow-lg hover:shadow-xl
        transition-all duration-200
        flex items-center justify-center
        ${isCalendarExpanded ? 'rotate-180' : ''}
      `}
      title={isCalendarExpanded ? "캘린더 닫기" : "캘린더 열기"}
    >
      {isCalendarExpanded ? (
        <XMarkIcon className="w-6 h-6" />
      ) : (
        <CalendarIcon className="w-6 h-6" />
      )}
    </button>
  )
}