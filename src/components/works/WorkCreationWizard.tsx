'use client'

import React, { useState } from 'react'
import { 
  WorkWizardStep as TaskWizardStep, 
  WorkWizardData as TaskWizardData, 
  WorkPriority as TaskPriority, 
  CreateWorkDto as CreateTaskDto
} from '@/types/work.types'
import { X, ArrowLeft, ArrowRight, CheckCircle, Clock, Users } from 'lucide-react'

interface TaskCreationWizardProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (taskData: CreateTaskDto) => void
  projects?: Array<{ id: string; name: string }>
}

export default function TaskCreationWizard({
  isOpen,
  onClose,
  onSubmit,
  projects = []
}: TaskCreationWizardProps) {
  const [wizardData, setWizardData] = useState<TaskWizardData>({
    step: 'collect',
    title: '',
    isActionable: undefined,
    canComplete2Minutes: undefined,
    belongsToProject: undefined,
    projectId: undefined,
    priority: undefined,
    dueDate: undefined,
    estimatedHours: undefined,
    assigneeId: undefined
  })

  const steps: { key: TaskWizardStep; title: string; subtitle: string }[] = [
    { key: 'collect', title: '수집', subtitle: '무엇이 마음에 걸리나요?' },
    { key: 'clarify', title: '명료화', subtitle: '실행 가능한 일인가요?' },
    { key: 'organize', title: '정리', subtitle: '세부 정보를 정리해보세요' },
    { key: 'execute', title: '실행', subtitle: '실행 준비가 완료됩니다' }
  ]

  const currentStepIndex = steps.findIndex(s => s.key === wizardData.step)
  const currentStep = steps[currentStepIndex]

  const updateWizardData = (updates: Partial<TaskWizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }))
  }

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      updateWizardData({ step: steps[nextIndex].key })
    }
  }

  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      updateWizardData({ step: steps[prevIndex].key })
    }
  }

  const canProceedFromCurrentStep = () => {
    switch (wizardData.step) {
      case 'collect':
        return wizardData.title.trim().length > 0
      case 'clarify':
        return wizardData.isActionable !== undefined
      case 'organize':
        return true // 모든 필드 선택사항
      case 'execute':
        return true
      default:
        return false
    }
  }

  const handleSubmit = () => {
    if (wizardData.step === 'execute') {
      const taskData: CreateTaskDto = {
        title: wizardData.title,
        projectId: wizardData.projectId,
        priority: wizardData.priority || TaskPriority.MEDIUM,
        dueDate: wizardData.dueDate,
        estimatedHours: wizardData.estimatedHours,
        assigneeId: wizardData.assigneeId,
        tags: []
      }
      
      onSubmit(taskData)
      handleClose()
    }
  }

  const handleClose = () => {
    setWizardData({
      step: 'collect',
      title: '',
      isActionable: undefined,
      canComplete2Minutes: undefined,
      belongsToProject: undefined,
      projectId: undefined,
      priority: undefined,
      dueDate: undefined,
      estimatedHours: undefined,
      assigneeId: undefined
    })
    onClose()
  }

  // 2분 규칙 즉시 처리
  const handle2MinuteRule = () => {
    const quickTask: CreateTaskDto = {
      title: wizardData.title,
      priority: TaskPriority.LOW,
      estimatedHours: 0.1,
      tags: ['2분규칙']
    }
    onSubmit(quickTask)
    handleClose()
  }

  if (!isOpen) return null

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index <= currentStepIndex
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {index < currentStepIndex ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              index + 1
            )}
          </div>
          {index < steps.length - 1 && (
            <div 
              className={`w-16 h-1 mx-2 ${
                index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )

  const renderCollectStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          무엇이 마음에 걸리나요?
        </h3>
        <p className="text-gray-600 text-sm">
          머릿속에 있는 것을 자유롭게 적어보세요. 나중에 정리할 수 있습니다.
        </p>
      </div>
      
      <div>
        <textarea
          value={wizardData.title}
          onChange={(e) => updateWizardData({ title: e.target.value })}
          placeholder="예: 프로젝트 회의 준비하기, 엄마께 안부 전화드리기..."
          className="w-full h-32 p-4 border border-gray-200 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   resize-none text-gray-900 placeholder-gray-500"
          autoFocus
        />
        <div className="text-right text-sm text-gray-500 mt-2">
          {wizardData.title.length}/200
        </div>
      </div>
    </div>
  )

  const renderClarifyStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          "{wizardData.title}"
        </h3>
        <p className="text-gray-600 text-sm">
          이것이 실행 가능한 일인지 판단해보세요
        </p>
      </div>

      {/* 실행 가능성 판단 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            실행 가능한 일인가요?
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => updateWizardData({ isActionable: true })}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                wizardData.isActionable === true
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CheckCircle className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">예</div>
              <div className="text-xs text-gray-600">지금 행동할 수 있어요</div>
            </button>
            <button
              onClick={() => updateWizardData({ isActionable: false })}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                wizardData.isActionable === false
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Clock className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">아니오</div>
              <div className="text-xs text-gray-600">참고용이거나 언젠가 할 일</div>
            </button>
          </div>
        </div>

        {/* 2분 규칙 */}
        {wizardData.isActionable === true && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              2분 안에 끝낼 수 있나요?
            </label>
            <div className="flex gap-3">
              <button
                onClick={handle2MinuteRule}
                className="flex-1 p-4 rounded-lg border-2 border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
              >
                <div className="font-medium">예, 지금 바로!</div>
                <div className="text-xs">2분 규칙: 즉시 처리</div>
              </button>
              <button
                onClick={() => updateWizardData({ canComplete2Minutes: false })}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  wizardData.canComplete2Minutes === false
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">아니오</div>
                <div className="text-xs">더 시간이 필요해요</div>
              </button>
            </div>
          </div>
        )}

        {/* 프로젝트 연결 */}
        {wizardData.isActionable === true && wizardData.canComplete2Minutes === false && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              더 큰 목표의 일부인가요?
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateWizardData({ belongsToProject: true })}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  wizardData.belongsToProject === true
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">예</div>
                <div className="text-xs">프로젝트의 일부</div>
              </button>
              <button
                onClick={() => updateWizardData({ belongsToProject: false })}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  wizardData.belongsToProject === false
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">아니오</div>
                <div className="text-xs">개별 업무</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderOrganizeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          세부 정보 정리
        </h3>
        <p className="text-gray-600 text-sm">
          업무를 효과적으로 실행하기 위한 정보를 추가하세요
        </p>
      </div>

      <div className="space-y-4">
        {/* 프로젝트 선택 */}
        {wizardData.belongsToProject === true && projects.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트
            </label>
            <select
              value={wizardData.projectId || ''}
              onChange={(e) => updateWizardData({ projectId: e.target.value || undefined })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">프로젝트 선택</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 우선순위 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            우선순위
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries({
              [TaskPriority.LOW]: { label: '낮음', color: 'blue' },
              [TaskPriority.MEDIUM]: { label: '보통', color: 'yellow' },
              [TaskPriority.HIGH]: { label: '높음', color: 'orange' },
              [TaskPriority.URGENT]: { label: '긴급', color: 'red' }
            }).map(([priority, config]) => (
              <button
                key={priority}
                onClick={() => updateWizardData({ priority: priority as TaskPriority })}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  wizardData.priority === priority
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* 마감일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            마감일 (선택사항)
          </label>
          <input
            type="datetime-local"
            value={wizardData.dueDate || ''}
            onChange={(e) => updateWizardData({ dueDate: e.target.value || undefined })}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 예상 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            예상 소요 시간 (선택사항)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[0.5, 1, 2, 4, 8].map(hours => (
              <button
                key={hours}
                onClick={() => updateWizardData({ estimatedHours: hours })}
                className={`p-2 rounded-lg border transition-colors text-sm ${
                  wizardData.estimatedHours === hours
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {hours}시간
              </button>
            ))}
          </div>
          <input
            type="number"
            step="0.5"
            min="0"
            max="100"
            placeholder="직접 입력"
            value={wizardData.estimatedHours || ''}
            onChange={(e) => updateWizardData({ 
              estimatedHours: e.target.value ? parseFloat(e.target.value) : undefined 
            })}
            className="w-full mt-2 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>
    </div>
  )

  const renderExecuteStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          실행 준비 완료!
        </h3>
        <p className="text-gray-600 text-sm">
          이제 '오늘' 목록에 나타나 실행할 수 있습니다
        </p>
      </div>

      {/* 최종 검토 */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">업무</span>
          <span className="text-sm font-medium">{wizardData.title}</span>
        </div>
        {wizardData.projectId && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">프로젝트</span>
            <span className="text-sm font-medium">
              {projects.find(p => p.id === wizardData.projectId)?.name}
            </span>
          </div>
        )}
        {wizardData.priority && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">우선순위</span>
            <span className="text-sm font-medium">{wizardData.priority}</span>
          </div>
        )}
        {wizardData.dueDate && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">마감일</span>
            <span className="text-sm font-medium">
              {new Date(wizardData.dueDate).toLocaleDateString('ko-KR')}
            </span>
          </div>
        )}
        {wizardData.estimatedHours && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">예상 시간</span>
            <span className="text-sm font-medium">{wizardData.estimatedHours}시간</span>
          </div>
        )}
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (wizardData.step) {
      case 'collect': return renderCollectStep()
      case 'clarify': return renderClarifyStep()
      case 'organize': return renderOrganizeStep()
      case 'execute': return renderExecuteStep()
      default: return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-on-hover">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {currentStep.title}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {currentStep.subtitle}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 진행 표시 */}
        <div className="p-6 border-b border-gray-100">
          {renderStepIndicator()}
        </div>

        {/* 단계별 콘텐츠 */}
        <div className="p-6">
          {renderCurrentStep()}
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={currentStepIndex > 0 ? goToPrevStep : handleClose}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStepIndex > 0 ? '이전' : '취소'}
          </button>

          <div className="flex gap-3">
            {wizardData.step === 'execute' ? (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                업무 생성
              </button>
            ) : (
              <button
                onClick={goToNextStep}
                disabled={!canProceedFromCurrentStep()}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                  canProceedFromCurrentStep()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                다음
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}