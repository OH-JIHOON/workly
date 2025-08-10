'use client'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { SearchDropdownProps } from '@/types/unified-navigation.types'

/**
 * 검색 드롭다운 컴포넌트
 * 데스크톱에서 검색 아이콘 클릭 시 표시되는 드롭다운
 */
export default function SearchDropdown({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  onQuickActionClick
}: SearchDropdownProps) {
  
  if (!isOpen) return null
  
  return (
    <div 
      className="absolute top-full left-0 mt-2 bg-card border border-border rounded-xl shadow-lg w-80 py-3 px-4 z-50"
      role="menu"
      aria-label="검색"
    >
      {/* 검색 입력창 */}
      <div className="mb-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="업무, 프로젝트, 게시글 통합검색..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>
      </div>
      
      {/* 빠른 검색 옵션 */}
      <div className="text-xs text-gray-500 mb-2">빠른 검색</div>
      <div className="space-y-1">
        <button 
          onClick={() => onQuickActionClick('my-tasks')}
          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          role="menuitem"
        >
          📋 내 업무
        </button>
        <button 
          onClick={() => onQuickActionClick('active-projects')}
          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          role="menuitem"
        >
          🚀 진행 중 프로젝트
        </button>
        <button 
          onClick={() => onQuickActionClick('recent-posts')}
          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          role="menuitem"
        >
          📝 최근 게시글
        </button>
      </div>
    </div>
  )
}