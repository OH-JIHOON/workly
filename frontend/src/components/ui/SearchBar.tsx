'use client'

import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  showClearButton?: boolean
}

/**
 * 깔끔한 검색바 컴포넌트
 * - 아이콘이 포함된 입력 필드
 * - 클리어 버튼 옵션
 * - 깔끔한 디자인
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = "검색...",
  className = "",
  showClearButton = true
}: SearchBarProps) {
  const handleClear = () => {
    onChange('')
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full 
          pl-10 
          pr-10 
          py-3 
          border 
          border-gray-200 
          rounded-lg 
          focus:ring-2 
          focus:ring-blue-500 
          focus:border-transparent 
          bg-white 
          text-sm
          placeholder:text-gray-400
          transition-colors
        "
      />
      {showClearButton && value && (
        <button
          onClick={handleClear}
          className="
            absolute 
            right-3 
            top-1/2 
            transform 
            -translate-y-1/2 
            text-gray-400 
            hover:text-gray-600 
            transition-colors
            p-1
            rounded-full
            hover:bg-gray-100
          "
          aria-label="검색 지우기"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}