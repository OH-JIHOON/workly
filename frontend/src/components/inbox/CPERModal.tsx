'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  XMarkIcon,
  InboxIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ClipboardDocumentIcon,
  FolderPlusIcon,
  FlagIcon,
  ClockIcon,
  PlayIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { HierarchyType, CPERStage, WorklyTask, HierarchyChoice } from '@/shared/types/workly-core.types'

// CPER 모달 Props
interface CPERModalProps {
  isOpen: boolean
  onClose: () => void
  initialContent?: string
  onTaskCreated?: (task: WorklyTask) => void
  onInboxItemCreated?: (inboxItem: any) => void
}

// CPER 단계 정의
enum CPERStep {
  CAPTURE = 0,
  PLAN = 1,
  EXECUTE = 2,
  REVIEW = 3
}

// 계획 단계의 하위 단계
enum PlanSubStep {
  CLARIFY = 0,
  ORGANIZE = 1,
  DETAIL = 2
}

// 수집 타입
const captureTypes = [
  {
    id: 'idea' as const,
    label: '아이디어',
    description: '떠오른 생각이나 영감을 수집',
    icon: LightBulbIcon,
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

// 단계별 테마 색상
const stageThemes = {
  [CPERStep.CAPTURE]: {
    primary: 'blue',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    button: 'bg-blue-500 hover:bg-blue-600'
  },
  [CPERStep.PLAN]: {
    primary: 'green',
    bg: 'bg-green-50',
    border: 'border-green-200', 
    text: 'text-green-900',
    button: 'bg-green-500 hover:bg-green-600'
  },
  [CPERStep.EXECUTE]: {
    primary: 'amber',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    button: 'bg-amber-500 hover:bg-amber-600'
  },
  [CPERStep.REVIEW]: {
    primary: 'purple',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-900',
    button: 'bg-purple-500 hover:bg-purple-600'
  }
}

export default function CPERModal({
  isOpen,
  onClose,
  initialContent = '',
  onTaskCreated,
  onInboxItemCreated
}: CPERModalProps) {
  // 단계 상태
  const [currentStep, setCurrentStep] = useState<CPERStep>(CPERStep.CAPTURE)
  const [planSubStep, setPlanSubStep] = useState<PlanSubStep>(PlanSubStep.CLARIFY)
  
  // 수집 단계 데이터
  const [captureData, setCaptureData] = useState({
    type: 'idea' as const,
    title: '',
    content: initialContent,
    tags: [] as string[]
  })

  // 계획 단계 데이터
  const [planData, setPlanData] = useState({
    // 명확화
    isActionable: false,
    canComplete2Minutes: false,
    nextAction: '',
    timeEstimate: 30, // 분 단위
    
    // 구조화
    hierarchyChoice: {
      type: HierarchyType.INDEPENDENT,
      projectId: undefined,
      goalId: undefined
    } as HierarchyChoice,
    
    // 상세 계획
    priority: 'medium' as const,
    dueDate: '',
    description: '',
    finalTitle: ''
  })

  // 실행 단계 데이터
  const [executeData, setExecuteData] = useState({
    isToday: false,
    isFocused: false,
    startImmediately: false
  })

  // UI 상태
  const [isTransitioning, setIsTransitioning] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // ESC 키 처리
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  // 모달 초기화
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(CPERStep.CAPTURE)
      setPlanSubStep(PlanSubStep.CLARIFY)
      setCaptureData({
        type: 'idea',
        title: '',
        content: initialContent,
        tags: []
      })
      setPlanData({
        isActionable: false,
        canComplete2Minutes: false,
        nextAction: '',
        timeEstimate: 30,
        hierarchyChoice: {
          type: HierarchyType.INDEPENDENT
        },
        priority: 'medium',
        dueDate: '',
        description: '',
        finalTitle: ''
      })
      setExecuteData({
        isToday: false,
        isFocused: false,
        startImmediately: false
      })
    }
  }, [isOpen, initialContent])

  // 단계 전환
  const handleStepTransition = async (newStep: CPERStep) => {
    setIsTransitioning(true)
    
    // 애니메이션 딜레이
    setTimeout(() => {
      setCurrentStep(newStep)
      setIsTransitioning(false)
    }, 150)
  }

  // 빠른 수집 (1단계만 수행)
  const handleQuickCapture = async () => {
    if (!captureData.content.trim()) return

    const inboxItem = {
      id: Date.now().toString(),
      title: captureData.title || captureData.content.substring(0, 50),
      content: captureData.content,
      type: captureData.type,
      status: 'captured',
      priority: 'medium',
      tags: captureData.tags,
      createdAt: new Date().toISOString()
    }

    onInboxItemCreated?.(inboxItem)
    onClose()
  }

  // 다음 단계로 진행
  const handleNextStep = () => {
    if (currentStep === CPERStep.CAPTURE) {
      handleStepTransition(CPERStep.PLAN)
    } else if (currentStep === CPERStep.PLAN) {
      if (planSubStep < PlanSubStep.DETAIL) {
        setPlanSubStep(planSubStep + 1)
      } else {
        handleStepTransition(CPERStep.EXECUTE)
      }
    } else if (currentStep === CPERStep.EXECUTE) {
      handleCreateTask()
    }
  }

  // 이전 단계로 이동
  const handlePreviousStep = () => {
    if (currentStep === CPERStep.EXECUTE) {
      handleStepTransition(CPERStep.PLAN)
      setPlanSubStep(PlanSubStep.DETAIL)
    } else if (currentStep === CPERStep.PLAN) {
      if (planSubStep > PlanSubStep.CLARIFY) {
        setPlanSubStep(planSubStep - 1)
      } else {
        handleStepTransition(CPERStep.CAPTURE)
      }
    }
  }

  // 최종 업무 생성
  const handleCreateTask = async () => {
    const task: WorklyTask = {
      id: Date.now().toString(),
      title: planData.finalTitle || captureData.title || captureData.content.substring(0, 50),
      description: planData.description || captureData.content,
      status: 'todo' as any,
      priority: planData.priority as any,
      type: 'task' as any,
      
      hierarchyType: planData.hierarchyChoice.type,
      projectId: planData.hierarchyChoice.projectId,
      goalId: planData.hierarchyChoice.goalId,
      
      cperWorkflow: {
        stage: CPERStage.PLANNED,
        capturedAt: new Date().toISOString(),
        plannedAt: new Date().toISOString(),
        planningData: {
          isActionable: planData.isActionable,
          canComplete2Minutes: planData.canComplete2Minutes,
          timeEstimate: planData.timeEstimate,
          priorityReasoning: `사용자가 ${planData.priority} 우선순위로 설정`,
          hierarchyChoice: planData.hierarchyChoice,
          nextAction: planData.nextAction
        }
      },
      
      isToday: executeData.isToday,
      isFocused: executeData.isFocused,
      nextAction: planData.nextAction,
      estimatedMinutes: planData.timeEstimate,
      actualMinutes: 0,
      
      assigneeId: 'user1', // TODO: 실제 사용자 ID
      assignee: {
        id: 'user1',
        name: '김워클리',
        email: 'workly@example.com'
      },
      
      tags: captureData.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onTaskCreated?.(task)
    
    if (executeData.startImmediately) {
      // TODO: 즉시 실행 모드로 전환
      console.log('즉시 실행 모드 시작:', task.title)
    }
    
    onClose()
  }

  // 현재 단계의 테마
  const currentTheme = stageThemes[currentStep]

  // 다음 단계 진행 가능 여부
  const canProceed = () => {
    if (currentStep === CPERStep.CAPTURE) {
      return captureData.content.trim().length > 0
    } else if (currentStep === CPERStep.PLAN) {
      if (planSubStep === PlanSubStep.CLARIFY) {
        return planData.nextAction.trim().length > 0
      } else if (planSubStep === PlanSubStep.ORGANIZE) {
        return true // 계층구조는 기본값 사용 가능
      } else {
        return (planData.finalTitle || captureData.title || captureData.content).trim().length > 0
      }
    } else if (currentStep === CPERStep.EXECUTE) {
      return true
    }
    return false
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25">
      <div 
        ref={modalRef}
        className={`bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden transition-all duration-300 ${
          isTransitioning ? 'scale-95 opacity-75' : 'scale-100 opacity-100'
        }`}
      >
        {/* 헤더 */}
        <div className={`flex items-center justify-between p-6 border-b-2 ${currentTheme.border} ${currentTheme.bg}`}>
          <div className="flex items-center space-x-4">
            {/* 단계 아이콘 */}
            <div className={`w-12 h-12 rounded-xl ${currentTheme.button} flex items-center justify-center text-white`}>
              {currentStep === CPERStep.CAPTURE && <InboxIcon className="w-6 h-6" />}
              {currentStep === CPERStep.PLAN && <LightBulbIcon className="w-6 h-6" />}
              {currentStep === CPERStep.EXECUTE && <PlayIcon className="w-6 h-6" />}
              {currentStep === CPERStep.REVIEW && <ChartBarIcon className="w-6 h-6" />}
            </div>
            
            {/* 단계 정보 */}
            <div>
              <h2 className={`text-xl font-bold ${currentTheme.text}`}>
                {currentStep === CPERStep.CAPTURE && 'Capture - 수집'}
                {currentStep === CPERStep.PLAN && 'Plan - 계획'}
                {currentStep === CPERStep.EXECUTE && 'Execute - 실행'}
                {currentStep === CPERStep.REVIEW && 'Review - 검토'}
              </h2>
              <p className="text-sm text-gray-600">
                {currentStep === CPERStep.CAPTURE && '아이디어나 할 일을 빠르게 수집하세요'}
                {currentStep === CPERStep.PLAN && '수집된 내용을 구체적으로 계획하세요'}
                {currentStep === CPERStep.EXECUTE && '실행 준비를 완료하세요'}
                {currentStep === CPERStep.REVIEW && '결과를 검토하고 개선점을 찾으세요'}
              </p>
            </div>
          </div>

          {/* 진행률 표시 */}
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              {[0, 1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    step <= currentStep 
                      ? currentTheme.button.replace('hover:', '').replace('bg-', 'bg-').split(' ')[0]
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">{currentStep + 1}/4</span>
          </div>

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* 1단계: Capture */}
          {currentStep === CPERStep.CAPTURE && (
            <CaptureStep
              data={captureData}
              onChange={setCaptureData}
              onQuickCapture={handleQuickCapture}
            />
          )}

          {/* 2단계: Plan */}
          {currentStep === CPERStep.PLAN && (
            <PlanStep
              captureData={captureData}
              planData={planData}
              subStep={planSubStep}
              onChange={setPlanData}
            />
          )}

          {/* 3단계: Execute */}
          {currentStep === CPERStep.EXECUTE && (
            <ExecuteStep
              captureData={captureData}
              planData={planData}
              executeData={executeData}
              onChange={setExecuteData}
            />
          )}
        </div>

        {/* 하단 액션 버튼 */}
        <div className={`px-6 py-4 border-t ${currentTheme.border} ${currentTheme.bg} flex justify-between`}>
          <div className="flex space-x-3">
            {currentStep > CPERStep.CAPTURE && (
              <button
                onClick={handlePreviousStep}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>이전</span>
              </button>
            )}

            {currentStep === CPERStep.CAPTURE && (
              <button
                onClick={handleQuickCapture}
                disabled={!captureData.content.trim()}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                빠른 수집만
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              취소
            </button>
            
            <button
              onClick={handleNextStep}
              disabled={!canProceed()}
              className={`px-6 py-2 rounded-lg font-medium text-white transition-all flex items-center space-x-2 ${
                canProceed() 
                  ? currentTheme.button
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <span>
                {currentStep === CPERStep.CAPTURE && '계획하기'}
                {currentStep === CPERStep.PLAN && planSubStep < PlanSubStep.DETAIL && '다음'}
                {currentStep === CPERStep.PLAN && planSubStep === PlanSubStep.DETAIL && '실행 준비'}
                {currentStep === CPERStep.EXECUTE && '업무 생성'}
              </span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 1단계: Capture 컴포넌트
interface CaptureStepProps {
  data: any
  onChange: (data: any) => void
  onQuickCapture: () => void
}

function CaptureStep({ data, onChange, onQuickCapture }: CaptureStepProps) {
  const handleTypeSelect = (type: string) => {
    onChange({ ...data, type })
  }

  return (
    <div className="space-y-6">
      {/* 타입 선택 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">무엇을 수집하시겠어요?</h3>
        <div className="grid grid-cols-2 gap-3">
          {captureTypes.map((type) => {
            const Icon = type.icon
            const isSelected = data.type === type.id
            
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          떠오른 생각을 자유롭게 적어보세요
        </label>
        <textarea
          value={data.content}
          onChange={(e) => onChange({ ...data, content: e.target.value })}
          placeholder="예: 사용자 피드백을 정리해서 개선사항을 도출해야겠다..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={6}
          autoFocus
        />
      </div>

      {/* 제목 (선택적) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          제목 (선택사항)
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="간단한 제목을 입력하세요"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 빠른 수집 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-blue-800">
          <CheckCircleIcon className="w-5 h-5" />
          <span className="font-medium">빠른 수집 팁</span>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          지금 바로 저장하고 싶다면 "빠른 수집만" 버튼을 누르세요. 
          나중에 수집함에서 다시 정리할 수 있습니다.
        </p>
      </div>
    </div>
  )
}

// 2단계: Plan 컴포넌트 (별도 파일로 분리 예정)
interface PlanStepProps {
  captureData: any
  planData: any
  subStep: PlanSubStep
  onChange: (data: any) => void
}

function PlanStep({ captureData, planData, subStep, onChange }: PlanStepProps) {
  // 명확화 단계
  if (subStep === PlanSubStep.CLARIFY) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">수집한 내용을 명확히 해보세요</h3>
        
        {/* 실행 가능성 확인 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-3">실행 가능성 확인</h4>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={planData.isActionable}
                onChange={(e) => onChange({ ...planData, isActionable: e.target.checked })}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm text-green-800">지금 바로 실행할 수 있는 구체적인 행동인가요?</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={planData.canComplete2Minutes}
                onChange={(e) => onChange({ ...planData, canComplete2Minutes: e.target.checked })}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm text-green-800">2분 안에 완료할 수 있나요?</span>
            </label>
          </div>
        </div>

        {/* 다음 액션 정의 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            첫 번째로 해야 할 구체적인 행동은 무엇인가요? *
          </label>
          <input
            type="text"
            value={planData.nextAction}
            onChange={(e) => onChange({ ...planData, nextAction: e.target.value })}
            placeholder="예: 구글 드라이브에서 피드백 파일 찾기"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* 시간 추정 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            예상 소요 시간 (분)
          </label>
          <input
            type="number"
            value={planData.timeEstimate}
            onChange={(e) => onChange({ ...planData, timeEstimate: parseInt(e.target.value) || 30 })}
            min="5"
            max="480"
            className="w-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>
    )
  }

  // 구조화 단계
  if (subStep === PlanSubStep.ORGANIZE) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">이 업무를 어떻게 관리하시겠어요?</h3>
        
        {/* 계층구조 선택 */}
        <div className="space-y-4">
          {Object.values(HierarchyType).map((type) => (
            <label
              key={type}
              className={`flex items-start space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                planData.hierarchyChoice.type === type
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="hierarchy"
                value={type}
                checked={planData.hierarchyChoice.type === type}
                onChange={(e) => onChange({
                  ...planData,
                  hierarchyChoice: { ...planData.hierarchyChoice, type: e.target.value as HierarchyType }
                })}
                className="w-5 h-5 text-green-600 mt-0.5"
              />
              <div>
                <div className="font-medium text-gray-900">
                  {type === HierarchyType.INDEPENDENT && '독립적 업무'}
                  {type === HierarchyType.PROJECT_ONLY && '프로젝트의 일부'}
                  {type === HierarchyType.GOAL_DIRECT && '목표의 일부'}
                  {type === HierarchyType.FULL_HIERARCHY && '프로젝트 → 목표'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {type === HierarchyType.INDEPENDENT && '간단하고 빠르게 처리할 수 있는 업무'}
                  {type === HierarchyType.PROJECT_ONLY && '특정 프로젝트에 속하지만 상위 목표는 없음'}
                  {type === HierarchyType.GOAL_DIRECT && '목표에 직접 연결되는 중요한 업무'}
                  {type === HierarchyType.FULL_HIERARCHY && '프로젝트를 통해 목표에 기여하는 업무'}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* 프로젝트/목표 선택 UI (필요시) */}
        {planData.hierarchyChoice.type !== HierarchyType.INDEPENDENT && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              💡 프로젝트나 목표 선택은 다음 단계에서 설정할 수 있습니다.
            </p>
          </div>
        )}
      </div>
    )
  }

  // 상세 계획 단계
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">마지막으로 세부사항을 정리해보세요</h3>
      
      {/* 최종 제목 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          업무 제목 *
        </label>
        <input
          type="text"
          value={planData.finalTitle}
          onChange={(e) => onChange({ ...planData, finalTitle: e.target.value })}
          placeholder={captureData.title || captureData.content.substring(0, 50)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* 우선순위 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          우선순위
        </label>
        <select
          value={planData.priority}
          onChange={(e) => onChange({ ...planData, priority: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="low">낮음</option>
          <option value="medium">보통</option>
          <option value="high">높음</option>
          <option value="urgent">긴급</option>
        </select>
      </div>

      {/* 마감일 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          마감일 (선택사항)
        </label>
        <input
          type="date"
          value={planData.dueDate}
          onChange={(e) => onChange({ ...planData, dueDate: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* 상세 설명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          상세 설명 (선택사항)
        </label>
        <textarea
          value={planData.description}
          onChange={(e) => onChange({ ...planData, description: e.target.value })}
          placeholder="추가적인 설명이나 참고사항을 입력하세요"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>
    </div>
  )
}

// 3단계: Execute 컴포넌트
interface ExecuteStepProps {
  captureData: any
  planData: any
  executeData: any
  onChange: (data: any) => void
}

function ExecuteStep({ captureData, planData, executeData, onChange }: ExecuteStepProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">실행 준비를 완료하세요</h3>
      
      {/* 업무 요약 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-medium text-amber-900 mb-2">생성될 업무</h4>
        <div className="space-y-1 text-sm text-amber-800">
          <div><span className="font-medium">제목:</span> {planData.finalTitle || captureData.title || captureData.content.substring(0, 50)}</div>
          <div><span className="font-medium">다음 액션:</span> {planData.nextAction}</div>
          <div><span className="font-medium">예상 시간:</span> {planData.timeEstimate}분</div>
          <div><span className="font-medium">우선순위:</span> {planData.priority}</div>
          <div><span className="font-medium">관리 방식:</span> {
            planData.hierarchyChoice.type === HierarchyType.INDEPENDENT ? '독립적 업무' :
            planData.hierarchyChoice.type === HierarchyType.PROJECT_ONLY ? '프로젝트의 일부' :
            planData.hierarchyChoice.type === HierarchyType.GOAL_DIRECT ? '목표의 일부' : '프로젝트 → 목표'
          }</div>
        </div>
      </div>

      {/* 실행 옵션 */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">실행 옵션</h4>
        
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={executeData.isToday}
            onChange={(e) => onChange({ ...executeData, isToday: e.target.checked })}
            className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
          />
          <div>
            <span className="font-medium text-gray-900">오늘 할 일로 설정</span>
            <p className="text-sm text-gray-600">홈화면의 "오늘 할 일" 목록에 표시됩니다</p>
          </div>
        </label>
        
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={executeData.isFocused}
            onChange={(e) => onChange({ ...executeData, isFocused: e.target.checked })}
            className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
          />
          <div>
            <span className="font-medium text-gray-900">집중 업무로 설정</span>
            <p className="text-sm text-gray-600">가장 중요한 업무로 하이라이트 표시됩니다</p>
          </div>
        </label>
        
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={executeData.startImmediately}
            onChange={(e) => onChange({ ...executeData, startImmediately: e.target.checked })}
            className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
          />
          <div>
            <span className="font-medium text-gray-900">지금 바로 시작</span>
            <p className="text-sm text-gray-600">업무 생성 후 즉시 실행 모드로 전환됩니다</p>
          </div>
        </label>
      </div>

      {/* 시간 관리 팁 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-blue-800 mb-2">
          <ClockIcon className="w-5 h-5" />
          <span className="font-medium">시간 관리 팁</span>
        </div>
        <p className="text-sm text-blue-700">
          {planData.canComplete2Minutes 
            ? '2분 안에 완료할 수 있는 업무라면 지금 바로 처리하는 것이 좋습니다.'
            : `${planData.timeEstimate}분 예상 소요 시간을 고려하여 적절한 시간대에 실행하세요.`
          }
        </p>
      </div>
    </div>
  )
}