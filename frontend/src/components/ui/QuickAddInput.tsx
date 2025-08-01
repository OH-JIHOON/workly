'use client'

import { useState, KeyboardEvent } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'

interface QuickAddInputProps {
  placeholder?: string
  onTaskCreate: (title: string) => void
  className?: string
}

export default function QuickAddInput({ 
  placeholder = "무엇을 해야 하나요?", 
  onTaskCreate,
  className = ""
}: QuickAddInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleKeyPress = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      setIsLoading(true)
      
      try {
        // PRD 명세: Enter 입력 시 새 업무가 리스트 최상단에 생성
        await onTaskCreate(inputValue.trim())
        setInputValue('') // 입력창 초기화
      } catch (error) {
        console.error('업무 생성 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleButtonClick = async () => {
    if (!inputValue.trim()) return
    
    setIsLoading(true)
    try {
      await onTaskCreate(inputValue.trim())
      setInputValue('')
    } catch (error) {
      console.error('업무 생성 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`workly-card ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            className="w-full px-4 py-3 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        <button
          onClick={handleButtonClick}
          disabled={!inputValue.trim() || isLoading}
          className="workly-button flex items-center justify-center w-12 h-12 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
      
      {/* 힌트 텍스트 */}
      <p className="workly-caption mt-2 ml-1">
        Enter 키를 누르거나 + 버튼을 클릭하여 업무를 추가하세요
      </p>
    </div>
  )
}