'use client';

import React, { useState } from 'react';
import { X, ArrowLeft, ArrowRight, Check, Lightbulb, Target, FolderOpen, Clock, Zap } from 'lucide-react';
import { TaskPriority, TaskType, CreateTaskDto } from '@/types/task.types';
import TaskPriorityBadge from './TaskPriorityBadge';

interface TaskCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: CreateTaskDto) => Promise<void>;
  projects?: Array<{ id: string; name: string }>;
  assignees?: Array<{ id: string; firstName: string; lastName: string }>;
}

interface GTDStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const GTD_STEPS: GTDStep[] = [
  {
    id: 1,
    title: 'Capture (수집)',
    description: '머릿속의 생각을 명확하게 적어보세요',
    icon: Lightbulb,
    color: 'text-blue-600'
  },
  {
    id: 2,
    title: 'Clarify (명확화)',
    description: '이것이 실행 가능한 항목인지 판단하세요',
    icon: Target,
    color: 'text-green-600'
  },
  {
    id: 3,
    title: 'Organize (정리)',
    description: '적절한 프로젝트와 우선순위를 설정하세요',
    icon: FolderOpen,
    color: 'text-purple-600'
  },
  {
    id: 4,
    title: 'Reflect (검토)',
    description: '마감일과 예상 소요시간을 설정하세요',
    icon: Clock,
    color: 'text-orange-600'
  },
  {
    id: 5,
    title: 'Engage (실행)',
    description: '태스크 생성을 완료하고 실행에 옮기세요',
    icon: Zap,
    color: 'text-red-600'
  }
];

export default function TaskCreationWizard({
  isOpen,
  onClose,
  onSubmit,
  projects = [],
  assignees = []
}: TaskCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateTaskDto>({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    type: TaskType.TASK,
    projectId: '',
    assigneeId: '',
    dueDate: null,
    estimatedHours: null,
    tags: []
  });

  const [tempValues, setTempValues] = useState({
    tagInput: '',
    isActionable: null as boolean | null,
    dueDateString: '',
    estimatedHoursString: ''
  });

  const handleInputChange = (field: keyof CreateTaskDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTempValueChange = (field: string, value: any) => {
    setTempValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (tempValues.tagInput.trim() && !formData.tags?.includes(tempValues.tagInput.trim())) {
      const newTags = [...(formData.tags || []), tempValues.tagInput.trim()];
      handleInputChange('tags', newTags);
      setTempValues(prev => ({ ...prev, tagInput: '' }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = formData.tags?.filter(tag => tag !== tagToRemove) || [];
    handleInputChange('tags', newTags);
  };

  const handleNext = () => {
    if (currentStep < 5) {
      // Step 2에서 실행 불가능한 항목이면 바로 완료로 이동
      if (currentStep === 2 && tempValues.isActionable === false) {
        setCurrentStep(5);
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 임시 값들을 최종 formData에 적용
      const finalData: CreateTaskDto = {
        ...formData,
        dueDate: tempValues.dueDateString ? new Date(tempValues.dueDateString).toISOString() : null,
        estimatedHours: tempValues.estimatedHoursString ? parseFloat(tempValues.estimatedHoursString) : null
      };

      // 실행 불가능한 항목의 경우 참조자료로 설정
      if (tempValues.isActionable === false) {
        finalData.type = TaskType.REFERENCE;
        finalData.priority = TaskPriority.LOW;
      }

      await onSubmit(finalData);
      
      // 폼 초기화
      setFormData({
        title: '',
        description: '',
        priority: TaskPriority.MEDIUM,
        type: TaskType.TASK,
        projectId: '',
        assigneeId: '',
        dueDate: null,
        estimatedHours: null,
        tags: []
      });
      setTempValues({
        tagInput: '',
        isActionable: null,
        dueDateString: '',
        estimatedHoursString: ''
      });
      setCurrentStep(1);
      onClose();
    } catch (error) {
      console.error('태스크 생성 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim().length > 0;
      case 2:
        return tempValues.isActionable !== null;
      case 3:
        return true; // 선택사항들이므로 항상 진행 가능
      case 4:
        return true; // 선택사항들이므로 항상 진행 가능
      case 5:
        return true;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  const currentGTDStep = GTD_STEPS[currentStep - 1];
  const IconComponent = currentGTDStep.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* 오버레이 */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* 모달 컨테이너 */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-gray-100`}>
                <IconComponent className={`w-6 h-6 ${currentGTDStep.color}`} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  새 태스크 생성
                </h3>
                <p className="text-sm text-gray-500">
                  {currentGTDStep.title} - {currentGTDStep.description}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 진행 바 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                단계 {currentStep} / 5
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / 5) * 100)}% 완료
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* 단계별 컨텐츠 */}
          <div className="mb-8">
            {/* Step 1: Capture */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    무엇을 해야 하나요? *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="예: 프로젝트 보고서 작성하기"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    추가 설명 (선택사항)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="더 자세한 내용이나 배경 정보를 적어주세요..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Clarify */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    "{formData.title}"
                  </h4>
                  <p className="text-sm text-gray-600 mb-6">
                    이것은 실제로 실행할 수 있는 작업인가요?
                  </p>
                  
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="actionable"
                        value="true"
                        checked={tempValues.isActionable === true}
                        onChange={() => handleTempValueChange('isActionable', true)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">네, 실행 가능한 작업입니다</div>
                        <div className="text-sm text-gray-500">구체적인 행동으로 옮길 수 있는 작업입니다</div>
                      </div>
                    </label>
                    
                    <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="actionable"
                        value="false"
                        checked={tempValues.isActionable === false}
                        onChange={() => handleTempValueChange('isActionable', false)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">아니요, 참조 자료입니다</div>
                        <div className="text-sm text-gray-500">나중에 참고할 정보나 아이디어입니다</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Organize */}
            {currentStep === 3 && tempValues.isActionable === true && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    우선순위
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.values(TaskPriority).map((priority) => (
                      <button
                        key={priority}
                        onClick={() => handleInputChange('priority', priority)}
                        className={`p-3 rounded-lg border text-center transition-colors ${
                          formData.priority === priority
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <TaskPriorityBadge priority={priority} size="sm" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    프로젝트 (선택사항)
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => handleInputChange('projectId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">프로젝트 선택</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    담당자 (선택사항)
                  </label>
                  <select
                    value={formData.assigneeId}
                    onChange={(e) => handleInputChange('assigneeId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">담당자 선택</option>
                    {assignees.map((assignee) => (
                      <option key={assignee.id} value={assignee.id}>
                        {assignee.firstName} {assignee.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    태그
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={tempValues.tagInput}
                      onChange={(e) => handleTempValueChange('tagInput', e.target.value)}
                      placeholder="태그 입력"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      추가
                    </button>
                  </div>
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Reflect */}
            {currentStep === 4 && tempValues.isActionable === true && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    마감일 (선택사항)
                  </label>
                  <input
                    type="date"
                    value={tempValues.dueDateString}
                    onChange={(e) => handleTempValueChange('dueDateString', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    예상 소요시간 (시간)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={tempValues.estimatedHoursString}
                    onChange={(e) => handleTempValueChange('estimatedHoursString', e.target.value)}
                    placeholder="예: 2.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Engage */}
            {currentStep === 5 && (
              <div className="text-center space-y-6">
                <div className="p-6 bg-green-50 rounded-lg">
                  <Check className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    태스크 생성 준비 완료!
                  </h4>
                  <p className="text-sm text-gray-600">
                    {tempValues.isActionable === false 
                      ? '참조 자료로 저장됩니다.'
                      : 'GTD 과정을 거쳐 체계적으로 정리된 태스크가 생성됩니다.'
                    }
                  </p>
                </div>

                <div className="text-left bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">생성될 태스크:</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>제목:</strong> {formData.title}</div>
                    {formData.description && (
                      <div><strong>설명:</strong> {formData.description}</div>
                    )}
                    {tempValues.isActionable === false ? (
                      <div><strong>유형:</strong> 참조 자료</div>
                    ) : (
                      <>
                        <div><strong>우선순위:</strong> <TaskPriorityBadge priority={formData.priority} size="sm" /></div>
                        {tempValues.dueDateString && (
                          <div><strong>마감일:</strong> {new Date(tempValues.dueDateString).toLocaleDateString('ko-KR')}</div>
                        )}
                        {tempValues.estimatedHoursString && (
                          <div><strong>예상 시간:</strong> {tempValues.estimatedHoursString}시간</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 버튼 영역 */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>이전</span>
            </button>

            <div className="flex space-x-2">
              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>다음</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>생성 중...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>태스크 생성</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}