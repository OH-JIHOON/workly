'use client';

import React, { useState } from 'react';
import { X, User, Star, Clock, Send } from 'lucide-react';
import { Project } from '@/types/project.types';

interface ProjectApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onApplicationSubmit: (applicationData: ProjectApplicationData) => void;
}

export interface ProjectApplicationData {
  projectId: string;
  coverLetter: string;
  skills: string[];
  experience: string;
  availableHours: number;
  expectedRole: string;
}

export default function ProjectApplicationModal({ 
  isOpen, 
  onClose, 
  project,
  onApplicationSubmit 
}: ProjectApplicationModalProps) {
  const [formData, setFormData] = useState<Omit<ProjectApplicationData, 'projectId'>>({
    coverLetter: '',
    skills: [],
    experience: '',
    availableHours: 20,
    expectedRole: 'member'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.coverLetter.trim()) return;

    setIsSubmitting(true);
    try {
      const applicationData: ProjectApplicationData = {
        projectId: project.id,
        ...formData
      };
      
      await onApplicationSubmit(applicationData);
      onClose();
    } catch (error) {
      console.error('지원서 제출 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black opacity-25" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">프로젝트 지원하기</h3>
              <p className="text-sm text-gray-500 mt-1">{project.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[70vh]">
            <div className="p-6 space-y-6">
              
              {/* 프로젝트 정보 요약 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">프로젝트 개요</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>설명:</strong> {project.description || '설명이 없습니다.'}</p>
                  <p><strong>필요 기술:</strong> {project.tags?.join(', ') || '명시되지 않음'}</p>
                  <p><strong>현재 멤버:</strong> {project.memberCount}명</p>
                </div>
              </div>

              {/* 자기소개서 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자기소개 및 지원동기 *
                </label>
                <textarea
                  value={formData.coverLetter}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={5}
                  placeholder="프로젝트에 기여할 수 있는 능력과 경험, 그리고 지원 동기를 자유롭게 작성해주세요..."
                  required
                />
              </div>

              {/* 보유 기술 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  보유 기술
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="기술명 입력 후 Enter"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    추가
                  </button>
                </div>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 경력 및 경험 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  관련 경력 및 경험
                </label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="관련 프로젝트 경험, 학력, 자격증 등을 작성해주세요..."
                />
              </div>

              {/* 투입 가능 시간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주당 투입 가능 시간
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="5"
                    value={formData.availableHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, availableHours: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900 min-w-[60px]">
                      {formData.availableHours}시간/주
                    </span>
                  </div>
                </div>
              </div>

              {/* 희망 역할 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  희망 역할
                </label>
                <select
                  value={formData.expectedRole}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedRole: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="member">팀 멤버</option>
                  <option value="tech_lead">기술 리드</option>
                  <option value="designer">디자이너</option>
                  <option value="developer">개발자</option>
                  <option value="pm">프로젝트 매니저</option>
                  <option value="qa">QA 엔지니어</option>
                </select>
              </div>

            </div>

            {/* 하단 버튼 */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-500">
                * 필수 항목을 모두 작성해주세요
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.coverLetter.trim()}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? '제출 중...' : '지원서 제출'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}