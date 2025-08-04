'use client'

import { useState, useEffect } from 'react'
import { 
  XMarkIcon,
  InboxIcon,
  ClipboardDocumentIcon,
  FolderPlusIcon,
  FlagIcon,
  PlusIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface InboxModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTask?: (title: string, content: string) => void
  onAddProject?: (title: string, content: string) => void  
  onAddGoal?: (title: string, content: string) => void
  onQuickCapture?: (content: string) => void
}

interface CaptureItem {
  id: string
  type: 'task' | 'project' | 'goal' | 'idea'
  title: string
  content: string
  icon: any
  color: string
}

export default function InboxModal({
  isOpen,
  onClose,
  onAddTask,
  onAddProject,
  onAddGoal,
  onQuickCapture
}: InboxModalProps) {
  const [captureText, setCaptureText] = useState('')
  const [selectedType, setSelectedType] = useState<'task' | 'project' | 'goal' | 'idea'>('idea')
  const [title, setTitle] = useState('')
  const [showTitleInput, setShowTitleInput] = useState(false)

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  // 모달이 열릴 때 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setCaptureText('')
      setTitle('')
      setShowTitleInput(false)
      setSelectedType('idea')
    }
  }, [isOpen])

  const captureTypes = [
    {
      id: 'idea' as const,
      label: '아이디어',
      description: '떠오른 생각이나 영감을 수집',
      icon: InboxIcon,
      color: 'text-amber-600 bg-amber-100',
      borderColor: 'border-amber-200'
    },
    {
      id: 'task' as const,
      label: '업무',
      description: '해야 할 작업이나 할 일',
      icon: ClipboardDocumentIcon,
      color: 'text-blue-600 bg-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      id: 'project' as const,
      label: '프로젝트',
      description: '큰 목표나 여러 업무의 묶음',
      icon: FolderPlusIcon,
      color: 'text-green-600 bg-green-100',
      borderColor: 'border-green-200'
    },
    {
      id: 'goal' as const,
      label: '목표',
      description: '장기적인 목표나 성과지표',
      icon: FlagIcon,
      color: 'text-purple-600 bg-purple-100',
      borderColor: 'border-purple-200'
    }
  ]

  const selectedTypeInfo = captureTypes.find(type => type.id === selectedType)

  const handleSubmit = () => {
    if (!captureText.trim()) return

    const finalTitle = title.trim() || captureText.trim().split('\n')[0].substring(0, 50)
    const content = captureText.trim()

    switch (selectedType) {
      case 'task':
        onAddTask?.(finalTitle, content)
        break
      case 'project':
        onAddProject?.(finalTitle, content)
        break
      case 'goal':
        onAddGoal?.(finalTitle, content)
        break
      case 'idea':
      default:
        onQuickCapture?.(content)
        break
    }

    onClose()
  }

  const handleTypeSelect = (type: typeof selectedType) => {
    setSelectedType(type)
    setShowTitleInput(type !== 'idea')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
              <InboxIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">수집함</h2>
              <p className="text-sm text-gray-500">CPER 워크플로우의 핵심 생성 기능</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 타입 선택 */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">무엇을 생성하시겠어요?</h3>
          <div className="grid grid-cols-2 gap-3">
            {captureTypes.map((type) => {
              const Icon = type.icon
              const isSelected = selectedType === type.id
              
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? `${type.borderColor} ${type.color.split(' ')[1]} ring-2 ring-opacity-20`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg ${type.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-900">{type.label}</span>
                  </div>
                  <p className="text-xs text-gray-500">{type.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* 내용 입력 */}
        <div className="p-6">
          {showTitleInput && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`${selectedTypeInfo?.label} 제목을 입력하세요`}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedType === 'idea' ? '내용' : '상세 내용'}
            </label>
            <textarea
              value={captureText}
              onChange={(e) => setCaptureText(e.target.value)}
              placeholder={`${selectedTypeInfo?.label}에 대해 자세히 설명해주세요...`}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              rows={6}
              autoFocus
            />
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={!captureText.trim()}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                captureText.trim()
                  ? `${selectedTypeInfo?.color.split(' ')[1].replace('bg-', 'bg-').replace('-100', '-500')} text-white hover:${selectedTypeInfo?.color.split(' ')[1].replace('bg-', 'bg-').replace('-100', '-600')}`
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <PlusIcon className="w-5 h-5" />
              <span>{selectedTypeInfo?.label} 생성</span>
            </button>
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircleIcon className="w-4 h-4" />
            <span>수집된 항목은 CPER 워크플로우에 따라 계획 단계로 이동됩니다</span>
          </div>
        </div>
      </div>
    </div>
  )
}