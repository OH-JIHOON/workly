'use client'

import { useState } from 'react'
import { 
  XMarkIcon, 
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { TaskDetail, TaskStatus, TaskPriority } from '@/types/work.types'

interface TaskDetailModalProps {
  task: TaskDetail | null
  isOpen: boolean
  onClose: () => void
  onSave: (taskDetail: TaskDetail) => void
}

export default function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onSave
}: TaskDetailModalProps) {
  const [localTask, setLocalTask] = useState<TaskDetail | null>(task)
  const [isEditing, setIsEditing] = useState(false)

  if (!isOpen || !task) return null

  const handleSave = () => {
    if (localTask) {
      onSave(localTask)
      setIsEditing(false)
    }
  }

  const handleStatusChange = (status: TaskStatus) => {
    if (localTask) {
      const updated = { ...localTask, status }
      setLocalTask(updated)
      onSave(updated)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* 배경 오버레이 */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={onClose}
        />

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? '업무 편집' : '업무 상세'}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 내용 */}
          <div className="space-y-6">
            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제목
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={localTask?.title || ''}
                  onChange={(e) => setLocalTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              ) : (
                <p className="text-gray-900">{task.title}</p>
              )}
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              {isEditing ? (
                <textarea
                  value={localTask?.description || ''}
                  onChange={(e) => setLocalTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              ) : (
                <p className="text-gray-600">{task.description || '설명이 없습니다.'}</p>
              )}
            </div>

            {/* 상태 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상태
              </label>
              <div className="flex space-x-2">
                {(['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      task.status === status
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'TODO' && '대기'}
                    {status === 'IN_PROGRESS' && '진행중'}
                    {status === 'DONE' && '완료'}
                  </button>
                ))}
              </div>
            </div>

            {/* 메타데이터 */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <CalendarDaysIcon className="w-4 h-4 mr-2" />
                생성일: {new Date(task.createdAt).toLocaleDateString('ko-KR')}
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-2" />
                수정일: {new Date(task.updatedAt).toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          {isEditing && (
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                저장
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}