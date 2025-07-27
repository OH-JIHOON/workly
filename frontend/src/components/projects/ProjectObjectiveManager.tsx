'use client'

import React, { useState } from 'react'
import { Target, Plus, CheckCircle, Edit2, Trash2, Calendar, BarChart3, TrendingUp } from 'lucide-react'
import { Project, ProjectObjective, ProjectKeyResult } from '@/types/project.types'

interface ProjectObjectiveManagerProps {
  project: Project
  onObjectiveUpdate?: (objectiveId: string, data: Partial<ProjectObjective>) => void
  onKeyResultUpdate?: (keyResultId: string, data: Partial<ProjectKeyResult>) => void
  onObjectiveCreate?: (data: Omit<ProjectObjective, 'id'>) => void
  onKeyResultCreate?: (objectiveId: string, data: Omit<ProjectKeyResult, 'id' | 'objectiveId'>) => void
}

export default function ProjectObjectiveManager({
  project,
  onObjectiveUpdate,
  onKeyResultUpdate,
  onObjectiveCreate,
  onKeyResultCreate
}: ProjectObjectiveManagerProps) {
  const [isAddingObjective, setIsAddingObjective] = useState(false)
  const [editingObjective, setEditingObjective] = useState<string | null>(null)
  const [addingKeyResultTo, setAddingKeyResultTo] = useState<string | null>(null)
  const [newObjective, setNewObjective] = useState({ title: '', description: '' })
  const [newKeyResult, setNewKeyResult] = useState({ 
    title: '', 
    description: '', 
    targetValue: 0, 
    currentValue: 0, 
    unit: '' 
  })

  // 목표 추가
  const handleAddObjective = () => {
    if (!newObjective.title.trim()) return

    onObjectiveCreate?.({
      title: newObjective.title,
      description: newObjective.description || undefined,
      completed: false
    })

    setNewObjective({ title: '', description: '' })
    setIsAddingObjective(false)
  }

  // 핵심 결과 추가
  const handleAddKeyResult = (objectiveId: string) => {
    if (!newKeyResult.title.trim()) return

    onKeyResultCreate?.(objectiveId, {
      title: newKeyResult.title,
      description: newKeyResult.description || undefined,
      targetValue: newKeyResult.targetValue,
      currentValue: newKeyResult.currentValue,
      unit: newKeyResult.unit,
      completed: false
    })

    setNewKeyResult({ title: '', description: '', targetValue: 0, currentValue: 0, unit: '' })
    setAddingKeyResultTo(null)
  }

  // 목표 완료 토글
  const handleToggleObjective = (objective: ProjectObjective) => {
    onObjectiveUpdate?.(objective.id, {
      completed: !objective.completed,
      completedAt: !objective.completed ? new Date().toISOString() : undefined
    })
  }

  // 핵심 결과 진행률 업데이트
  const handleUpdateKeyResultProgress = (keyResult: ProjectKeyResult, currentValue: number) => {
    const completed = currentValue >= keyResult.targetValue
    onKeyResultUpdate?.(keyResult.id, {
      currentValue,
      completed,
      completedAt: completed ? new Date().toISOString() : undefined
    })
  }

  // 진행률 계산
  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0
    return Math.min((current / target) * 100, 100)
  }

  // 전체 프로젝트 진행률 계산
  const calculateOverallProgress = () => {
    if (project.objectives.length === 0) return 0
    
    const totalKeyResults = project.keyResults.length
    if (totalKeyResults === 0) return 0
    
    const completedKeyResults = project.keyResults.filter(kr => kr.completed).length
    return Math.round((completedKeyResults / totalKeyResults) * 100)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Target className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">목표 및 핵심 결과 (OKR)</h3>
            <p className="text-sm text-gray-500">프로젝트의 목표와 측정 가능한 결과를 관리합니다</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{calculateOverallProgress()}%</div>
            <div className="text-xs text-gray-500">전체 진행률</div>
          </div>
          <button
            onClick={() => setIsAddingObjective(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>목표 추가</span>
          </button>
        </div>
      </div>

      {/* 전체 진행률 시각화 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">프로젝트 전체 진행률</span>
          <span className="font-medium">{calculateOverallProgress()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${calculateOverallProgress()}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
          <span>{project.keyResults.filter(kr => kr.completed).length} / {project.keyResults.length} 완료</span>
          <span>{project.objectives.filter(obj => obj.completed).length} / {project.objectives.length} 목표 달성</span>
        </div>
      </div>

      {/* 새 목표 추가 폼 */}
      {isAddingObjective && (
        <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h4 className="font-medium text-gray-900 mb-3">새 목표 추가</h4>
          <div className="space-y-3">
            <input
              type="text"
              value={newObjective.title}
              onChange={(e) => setNewObjective(prev => ({ ...prev, title: e.target.value }))}
              placeholder="목표 제목 (예: 새로운 마케팅 웹사이트 런칭)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              value={newObjective.description}
              onChange={(e) => setNewObjective(prev => ({ ...prev, description: e.target.value }))}
              placeholder="목표 설명 (선택사항)"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex space-x-3">
              <button
                onClick={handleAddObjective}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                목표 추가
              </button>
              <button
                onClick={() => setIsAddingObjective(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 목표 목록 */}
      <div className="space-y-6">
        {project.objectives.map((objective) => {
          const objectiveKeyResults = project.keyResults.filter(kr => kr.objectiveId === objective.id)
          const completedKRs = objectiveKeyResults.filter(kr => kr.completed).length
          const objectiveProgress = objectiveKeyResults.length > 0 
            ? Math.round((completedKRs / objectiveKeyResults.length) * 100) 
            : 0

          return (
            <div key={objective.id} className="border border-gray-200 rounded-lg p-4">
              {/* 목표 헤더 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 flex-1">
                  <button
                    onClick={() => handleToggleObjective(objective)}
                    className={`mt-1 ${objective.completed ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <h4 className={`font-medium ${objective.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {objective.title}
                    </h4>
                    {objective.description && (
                      <p className="text-sm text-gray-600 mt-1">{objective.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <BarChart3 className="w-4 h-4" />
                        <span>{objectiveProgress}% 완료</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <TrendingUp className="w-4 h-4" />
                        <span>{completedKRs}/{objectiveKeyResults.length} KR</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setAddingKeyResultTo(objective.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="핵심 결과 추가"
                  >
                    <Plus className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => setEditingObjective(objective.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="목표 편집"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* 목표 진행률 바 */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      objective.completed ? 'bg-green-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${objectiveProgress}%` }}
                  />
                </div>
              </div>

              {/* 핵심 결과 추가 폼 */}
              {addingKeyResultTo === objective.id && (
                <div className="mb-4 p-3 border border-green-200 rounded-lg bg-green-50">
                  <h5 className="font-medium text-gray-900 mb-3">새 핵심 결과 추가</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newKeyResult.title}
                      onChange={(e) => setNewKeyResult(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="핵심 결과 제목"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="text"
                      value={newKeyResult.unit}
                      onChange={(e) => setNewKeyResult(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="단위 (예: 명, %, 건)"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      value={newKeyResult.targetValue}
                      onChange={(e) => setNewKeyResult(prev => ({ ...prev, targetValue: Number(e.target.value) }))}
                      placeholder="목표값"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      value={newKeyResult.currentValue}
                      onChange={(e) => setNewKeyResult(prev => ({ ...prev, currentValue: Number(e.target.value) }))}
                      placeholder="현재값"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="flex space-x-3 mt-3">
                    <button
                      onClick={() => handleAddKeyResult(objective.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      핵심 결과 추가
                    </button>
                    <button
                      onClick={() => setAddingKeyResultTo(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}

              {/* 핵심 결과 목록 */}
              <div className="space-y-3">
                {objectiveKeyResults.map((keyResult) => {
                  const progress = calculateProgress(keyResult.currentValue, keyResult.targetValue)
                  
                  return (
                    <div key={keyResult.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className={`w-4 h-4 ${keyResult.completed ? 'text-green-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${keyResult.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {keyResult.title}
                          </span>
                          <span className="text-sm text-gray-600">
                            {keyResult.currentValue} / {keyResult.targetValue} {keyResult.unit}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                keyResult.completed ? 'bg-green-600' : 'bg-blue-600'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-12">{Math.round(progress)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={keyResult.currentValue}
                          onChange={(e) => handleUpdateKeyResultProgress(keyResult, Number(e.target.value))}
                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-500">/{keyResult.targetValue}</span>
                      </div>
                    </div>
                  )
                })}
                
                {objectiveKeyResults.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm">아직 핵심 결과가 없습니다</p>
                    <button
                      onClick={() => setAddingKeyResultTo(objective.id)}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                    >
                      첫 번째 핵심 결과 추가하기
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {project.objectives.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">아직 목표가 설정되지 않았습니다</h4>
            <p className="text-sm mb-4">프로젝트의 첫 번째 목표를 설정해보세요</p>
            <button
              onClick={() => setIsAddingObjective(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>목표 추가하기</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}