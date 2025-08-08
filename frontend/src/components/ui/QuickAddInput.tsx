'use client'

import { useState, KeyboardEvent, useRef } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'

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
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyPress = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      setIsLoading(true)
      
      try {
        await onTaskCreate(inputValue.trim())
        setInputValue('')
        // 생성 완료 후 입력창에 다시 포커스
        setTimeout(() => {
          inputRef.current?.focus()
        }, 100)
      } catch (error) {
        console.error('업무 생성 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSubmit = async () => {
    if (!inputValue.trim()) return
    
    setIsLoading(true)
    try {
      await onTaskCreate(inputValue.trim())
      setInputValue('')
      // 생성 완료 후 입력창에 다시 포커스
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } catch (error) {
      console.error('업무 생성 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const hasContent = inputValue.trim().length > 0

  return (
    <div className={`
      bg-white rounded-full shadow-lg border border-gray-200
      transition-all duration-200 ease-in-out hover:shadow-lg
      ${hasContent ? 'pr-2' : 'px-4'}
      ${className}
    `}>
      <div className="flex items-center">
        {/* 입력 필드 */}
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            className="w-full py-4 px-4 text-base bg-transparent border-none outline-none placeholder-gray-500 disabled:cursor-not-allowed"
            style={{ fontSize: '16px' }} // iOS 줌 방지
          />
        </div>

        {/* 전송 버튼 - 텍스트가 있을 때만 표시 */}
        {hasContent && (
          <div className="flex items-center">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`
                flex items-center justify-center w-10 h-10 rounded-full
                transition-all duration-200 ease-in-out
                ${isLoading 
                  ? 'bg-gray-200 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 hover:scale-105 active:scale-95'
                }
                shadow-md hover:shadow-lg
              `}
              aria-label="업무 추가"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <PaperAirplaneIcon className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}