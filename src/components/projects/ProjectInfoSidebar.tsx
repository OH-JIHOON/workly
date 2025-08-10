'use client';

import React, { useState } from 'react';
import {
  Edit3,
  Settings,
  Users,
  Calendar,
  BarChart3,
  Target,
  Clock,
  DollarSign,
  Tag,
  Archive,
  Trash2
} from 'lucide-react';

import { Project, ProjectStatus, ProjectPriority, ProjectMemberRole } from '@/types/project.types';
import MemberManagementModal from './MemberManagementModal';
import ProjectObjectiveManager from './ProjectObjectiveManager';

interface ProjectInfoSidebarProps {
  project: Project;
  onEdit: () => void;
  onProjectUpdate: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export default function ProjectInfoSidebar({ 
  project, 
  onEdit,
  onProjectUpdate,
  onClose,
  isMobile = false
}: ProjectInfoSidebarProps) {
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case ProjectStatus.PLANNING:
        return 'bg-blue-100 text-blue-800';
      case ProjectStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800';
      case ProjectStatus.ON_HOLD:
        return 'bg-yellow-100 text-yellow-800';
      case ProjectStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return '진행중';
      case ProjectStatus.PLANNING:
        return '계획중';
      case ProjectStatus.COMPLETED:
        return '완료';
      case ProjectStatus.ON_HOLD:
        return '일시중단';
      case ProjectStatus.CANCELLED:
        return '취소됨';
      default:
        return '알 수 없음';
    }
  };

  const getPriorityColor = (priority: ProjectPriority) => {
    switch (priority) {
      case ProjectPriority.URGENT:
        return 'bg-red-100 text-red-800';
      case ProjectPriority.HIGH:
        return 'bg-orange-100 text-orange-800';
      case ProjectPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case ProjectPriority.LOW:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: ProjectPriority) => {
    switch (priority) {
      case ProjectPriority.URGENT:
        return '긴급';
      case ProjectPriority.HIGH:
        return '높음';
      case ProjectPriority.MEDIUM:
        return '보통';
      case ProjectPriority.LOW:
        return '낮음';
      default:
        return '보통';
    }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* 사이드바 콘텐츠 - 독립적인 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto scrollbar-on-hover">
        {/* 사이드바 헤더 */}
        <div className="flex-shrink-0 bg-white">
          {/* 모바일 헤더 */}
          {isMobile && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">프로젝트 정보</h2>
                  <p className="text-sm text-gray-500">상세 설정 및 관리</p>
                </div>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="사이드바 닫기"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* 데스크톱 헤더 */}
          {!isMobile && (
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">프로젝트 정보</h2>
                  <p className="text-sm text-gray-600 mt-1">프로젝트 상세 설정 및 관리</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onEdit}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="font-medium">편집</span>
                  </button>
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                      title="사이드바 닫기"
                    >
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* 모바일 편집 버튼 */}
          {isMobile && (
            <div className="p-4 border-b border-gray-100">
              <button
                onClick={onEdit}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200"
              >
                <Edit3 className="w-4 h-4" />
                <span className="font-medium">프로젝트 편집</span>
              </button>
            </div>
          )}
        </div>

        {/* 사이드바 콘텐츠 */}
        <div className={`${isMobile ? 'p-4 space-y-6' : 'p-6 space-y-8'}`}>
          {/* 목표 달성도 섹션 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                목표 달성도
              </h3>
              <span className="text-xs text-gray-500 font-medium">실시간</span>
            </div>
            <div className="grid gap-3">
              <div className="group relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 transition-all duration-200 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-emerald-900">일정 준수</div>
                    <div className="mt-1 text-xs text-emerald-700">목표 대비 진행률</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-emerald-800">85%</div>
                    <div className="text-xs text-emerald-600">+5% ↗</div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-200">
                  <div className="h-full w-[85%] rounded-full bg-emerald-500 transition-all duration-500"></div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 transition-all duration-200 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-blue-900">품질 유지</div>
                    <div className="mt-1 text-xs text-blue-700">코드 리뷰 통과율</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-800">92%</div>
                    <div className="text-xs text-blue-600">+2% ↗</div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-blue-200">
                  <div className="h-full w-[92%] rounded-full bg-blue-500 transition-all duration-500"></div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 transition-all duration-200 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-amber-900">예산 관리</div>
                    <div className="mt-1 text-xs text-amber-700">목표 예산 대비</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-amber-800">78%</div>
                    <div className="text-xs text-amber-600">-3% ↘</div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-amber-200">
                  <div className="h-full w-[78%] rounded-full bg-amber-500 transition-all duration-500"></div>
                </div>
              </div>
            </div>
          </div>

          {/* 목표 관리 섹션 */}
          <div className="space-y-4">
            <h3 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              OKR 관리
            </h3>
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className={`${isMobile ? 'h-[200px]' : 'h-[250px]'} overflow-y-auto scrollbar-on-hover`}>
                <ProjectObjectiveManager
                  project={project}
                  onObjectiveUpdate={(objectiveId, data) => {
                    console.log('목표 업데이트:', objectiveId, data);
                    // TODO: 실제 목표 업데이트 API 호출
                  }}
                  onKeyResultUpdate={(keyResultId, data) => {
                    console.log('핵심 결과 업데이트:', keyResultId, data);
                    // TODO: 실제 핵심 결과 업데이트 API 호출
                  }}
                  onObjectiveCreate={(data) => {
                    console.log('목표 생성:', data);
                    // TODO: 실제 목표 생성 API 호출
                  }}
                  onKeyResultCreate={(objectiveId, data) => {
                    console.log('핵심 결과 생성:', objectiveId, data);
                    // TODO: 실제 핵심 결과 생성 API 호출
                  }}
                />
              </div>
            </div>
          </div>

          {/* 프로젝트 상세 정보 */}
          <div className="space-y-4">
            <h3 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              프로젝트 세부사항
            </h3>
            <div className="space-y-4">
              {/* 프로젝트 헤더 카드 */}
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div 
                    className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-white font-bold text-lg shadow-md"
                    style={{ backgroundColor: project.color || '#3B82F6' }}
                  >
                    {project.icon || project.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 truncate">{project.title}</h2>
                    {project.description && (
                      <p className="text-sm leading-relaxed text-gray-700 mb-3 line-clamp-2">{project.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getPriorityColor(project.priority)}`}>
                        {getPriorityText(project.priority)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 진행률 카드 */}
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">전체 진행률</h4>
                  <span className="text-2xl font-bold text-blue-600">{project.progress}%</span>
                </div>
                <div className="space-y-3">
                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700 ease-out" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <BarChart3 className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">총 작업</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900">{project.taskCount || 0}</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Target className="w-4 h-4 text-emerald-500" />
                        <span className="text-gray-600">완료</span>
                      </div>
                      <span className="text-xl font-bold text-emerald-600">{project.completedTaskCount || Math.floor((project.taskCount || 0) * (project.progress / 100))}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 프로젝트 일정 및 예산 카드 */}
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3">일정 및 예산 정보</h4>
                <div className="space-y-4">
                  {/* 날짜 정보 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">시작일</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {project.startDate ? new Date(project.startDate).toLocaleDateString('ko-KR') : '미설정'}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-gray-700">마감일</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {project.dueDate ? new Date(project.dueDate).toLocaleDateString('ko-KR') : '미설정'}
                      </p>
                      {project.dueDate && (
                        <div className="mt-1">
                          <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium">
                            D-{Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 예산 정보 */}
                  {project.budget && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">프로젝트 예산</span>
                      </div>
                      <p className="text-lg font-bold text-green-600">
                        {new Intl.NumberFormat('ko-KR', {
                          style: 'currency',
                          currency: project.currency || 'KRW'
                        }).format(Number(project.budget))}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 팀 멤버 카드 */}
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">팀 멤버</h4>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                    {project.members?.length || 0}명
                  </span>
                </div>
                <div className="space-y-3">
                  {(project.members || []).slice(0, 3).map((member, index) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm shadow-sm">
                          {member.user.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-400"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 truncate">{member.user.name}</p>
                          <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                            {member.role === ProjectMemberRole.OWNER ? '소유자' : 
                             member.role === ProjectMemberRole.ADMIN ? '관리자' : '멤버'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{member.user.email}</p>
                      </div>
                    </div>
                  ))}
                  {(project.members?.length || 0) > 3 && (
                    <div className="text-center">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        +{(project.members?.length || 0) - 3}명 더 보기
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 태그 카드 */}
              {project.tags && project.tags.length > 0 && (
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <Tag className="w-4 h-4 text-purple-500" />
                    <h4 className="font-semibold text-gray-900">프로젝트 태그</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="space-y-4">
            <h3 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              프로젝트 관리
            </h3>
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <button 
                onClick={() => setIsMemberModalOpen(true)}
                className="w-full flex items-center space-x-3 p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">팀 멤버 관리</p>
                  <p className="text-sm text-gray-500">멤버 추가, 제거 및 권한 설정</p>
                </div>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                  <Settings className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">프로젝트 설정</p>
                  <p className="text-sm text-gray-500">워크플로우 및 고급 설정</p>
                </div>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                  <Archive className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">프로젝트 보관</p>
                  <p className="text-sm text-gray-500">프로젝트를 보관함으로 이동</p>
                </div>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 text-left hover:bg-red-50 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-red-700">프로젝트 삭제</p>
                  <p className="text-sm text-red-500">프로젝트를 영구적으로 삭제</p>
                </div>
              </button>
            </div>
          </div>

          {/* 하단 여백 */}
          <div className="h-4"></div>
        </div>

        {/* 멤버 관리 모달 */}
        <MemberManagementModal
          isOpen={isMemberModalOpen}
          onClose={() => setIsMemberModalOpen(false)}
          project={project}
          onMemberAdded={onProjectUpdate}
          onMemberRemoved={onProjectUpdate}
        />
      </div>
    </div>
  );
}