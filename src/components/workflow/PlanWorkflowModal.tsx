'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowRightIcon,
  CheckCircleIcon,
  FolderPlusIcon,
  FlagIcon,
  ClipboardDocumentIcon,
  XMarkIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { InboxItem, InboxItemStatus } from '@/types/inbox.types'

interface PlanWorkflowModalProps {
  isOpen: boolean
  onClose: () => void
  inboxItem: InboxItem
  onProcessComplete: (processedItem: InboxItem) => void
}

// 처리 유형 옵션
const processOptions = [
  {
    type: 'task',
    label: '업무로 전환',
    icon: ClipboardDocumentIcon,
    color: 'blue',
    description: '즉시 실행 가능한 단일 업무'
  },
  {
    type: 'project',
    label: '프로젝트로 전환',
    icon: FolderPlusIcon,
    color: 'green',
    description: '여러 업무로 구성된 프로젝트'
  },
  {
    type: 'goal',
    label: '목표로 전환',
    icon: FlagIcon,
    color: 'purple',
    description: '장기적인 목표나 비전'
  },
  {
    type: 'defer',
    label: '미루기',
    icon: CalendarIcon,
    color: 'yellow',
    description: '나중에 다시 검토'
  }
]

export default function PlanWorkflowModal({
  isOpen,
  onClose,
  inboxItem,
  onProcessComplete
}: PlanWorkflowModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [scheduledDate, setScheduledDate] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (isOpen && inboxItem) {
      setTitle(inboxItem.title)
      setDescription(inboxItem.content || '')
      setSelectedOption('')
      setPriority('medium')
      setScheduledDate('')
    }
  }, [isOpen, inboxItem])

  const handleProcess = async () => {
    if (!selectedOption || !title.trim()) return

    setIsProcessing(true)

    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000))

      const processedItem: InboxItem = {
        ...inboxItem,
        status: selectedOption === 'defer' ? InboxItemStatus.DEFERRED : InboxItemStatus.ORGANIZED,
        processedInto: selectedOption === 'defer' ? undefined : {
          type: selectedOption as 'task' | 'project' | 'goal',
          id: `new-${selectedOption}-${Date.now()}`,
          title: title
        },
        processedAt: new Date().toISOString(),
        scheduledFor: scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
        updatedAt: new Date().toISOString()
      }

      onProcessComplete(processedItem)
      onClose()
    } catch (error) {
      console.error('처리 중 오류:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <ArrowRightIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">항목 계획하기</h2>
              <p className="text-sm text-gray-500">수집된 항목을 적절한 형태로 변환합니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 원본 항목 정보 */}
        <div className="p-6 bg-gray-50 border-b">
          <h3 className="font-medium text-gray-900 mb-2">원본 항목</h3>
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="font-medium text-gray-900 mb-1">{inboxItem.title}</h4>
            {inboxItem.content && (
              <p className="text-sm text-gray-600">{inboxItem.content}</p>
            )}
            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
              <span>{new Date(inboxItem.createdAt).toLocaleDateString('ko-KR')}</span>
              <span className="capitalize">{inboxItem.source.replace('_', ' ')}</span>
              {inboxItem.tags.length > 0 && (
                <span>{inboxItem.tags.join(', ')}</span>
              )}
            </div>
          </div>
        </div>

        {/* 처리 옵션 선택 */}
        <div className="p-6 border-b">
          <h3 className="font-medium text-gray-900 mb-4">처리 방법 선택</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {processOptions.map((option) => {
              const Icon = option.icon
              const isSelected = selectedOption === option.type
              
              return (
                <button
                  key={option.type}
                  onClick={() => setSelectedOption(option.type)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      option.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      option.color === 'green' ? 'bg-green-100 text-green-600' :
                      option.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{option.label}</h4>
                      <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 세부 정보 입력 */}
        {selectedOption && selectedOption !== 'defer' && (
          <div className="p-6 border-b space-y-4">
            <h3 className="font-medium text-gray-900">세부 정보</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="명확한 제목을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="자세한 설명을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                우선순위
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">낮음</option>
                <option value="medium">보통</option>
                <option value="high">높음</option>
                <option value="urgent">긴급</option>
              </select>
            </div>
          </div>
        )}

        {/* 미루기 옵션 */}
        {selectedOption === 'defer' && (
          <div className="p-6 border-b">
            <h3 className="font-medium text-gray-900 mb-4">언제 다시 검토할까요?</h3>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex justify-end space-x-3 p-6">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleProcess}
            disabled={!selectedOption || isProcessing || (selectedOption !== 'defer' && !title.trim())}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>처리 중...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                <span>처리 완료</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}