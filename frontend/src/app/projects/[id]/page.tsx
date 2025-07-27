'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
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
  Trash2,
  Plus,
  Mail,
  Shield,
  Eye,
  X,
  UserMinus,
  MessageCircle,
  Hash
} from 'lucide-react';
// import { apiClient } from '@/lib/api'; // 목업 모드에서는 주석 처리
import MainContainer from '@/components/layout/MainContainer';
import { Project, UpdateProjectDto, ProjectStatus, ProjectPriority, ProjectMember, ProjectMemberRole, AddProjectMemberDto } from '@/types/project.types';
import ProjectChatChannel from '@/components/projects/ProjectChatChannel';
import ProjectObjectiveManager from '@/components/projects/ProjectObjectiveManager';

// 멤버 관리 모달 컴포넌트
function MemberManagementModal({ 
  isOpen, 
  onClose, 
  project,
  onMemberAdded,
  onMemberRemoved 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  project: Project;
  onMemberAdded: () => void;
  onMemberRemoved: () => void;
}) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<ProjectMemberRole>(ProjectMemberRole.MEMBER);

  // 멤버 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen]);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      // 목업 멤버 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 500));
      setMembers(project.members || []);
    } catch (error) {
      console.error('멤버 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setIsInviting(true);
      // 목업 멤버 초대 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('멤버 초대:', { email: inviteEmail, role: inviteRole });
      alert(`${inviteEmail}에게 초대장을 보냈습니다! (목업 모드)`);
      
      setInviteEmail('');
      setInviteRole(ProjectMemberRole.MEMBER);
    } catch (error) {
      console.error('멤버 초대 실패:', error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('정말로 이 멤버를 제거하시겠습니까?')) return;

    try {
      // 목업 멤버 제거 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('멤버 제거:', memberId);
      alert('멤버가 제거되었습니다! (목업 모드)');
      
      onMemberRemoved();
    } catch (error) {
      console.error('멤버 제거 실패:', error);
    }
  };

  const getRoleText = (role: ProjectMemberRole) => {
    switch (role) {
      case ProjectMemberRole.OWNER:
        return '소유자';
      case ProjectMemberRole.ADMIN:
        return '관리자';
      case ProjectMemberRole.MEMBER:
        return '멤버';
      case ProjectMemberRole.VIEWER:
        return '뷰어';
      default:
        return '멤버';
    }
  };

  const getRoleIcon = (role: ProjectMemberRole) => {
    switch (role) {
      case ProjectMemberRole.OWNER:
      case ProjectMemberRole.ADMIN:
        return <Shield className="w-4 h-4 text-yellow-500" />;
      case ProjectMemberRole.VIEWER:
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return <Users className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black opacity-25" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">팀 멤버 관리</h3>
              <p className="text-sm text-gray-500 mt-1">{project.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[60vh]">
            {/* 멤버 초대 섹션 */}
            <div className="p-6 border-b border-gray-200">
              <h4 className="text-md font-medium text-gray-900 mb-4">새 멤버 초대</h4>
              <form onSubmit={handleInviteMember} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이메일 주소
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="member@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      역할
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as ProjectMemberRole)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={ProjectMemberRole.MEMBER}>멤버</option>
                      <option value={ProjectMemberRole.ADMIN}>관리자</option>
                      <option value={ProjectMemberRole.VIEWER}>뷰어</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isInviting || !inviteEmail.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" />
                  <span>{isInviting ? '초대 중...' : '초대 보내기'}</span>
                </button>
              </form>
            </div>

            {/* 현재 멤버 목록 */}
            <div className="p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                현재 멤버 ({members.length}명)
              </h4>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">멤버 목록을 불러오는 중...</p>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">아직 멤버가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-800">
                            {member.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">{member.user.name}</p>
                            {member.userId === project.ownerId && (
                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                소유자
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-sm text-gray-600">{member.user.email}</p>
                            <div className="flex items-center space-x-1">
                              {getRoleIcon(member.role)}
                              <span className="text-xs text-gray-500">
                                {getRoleText(member.role)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {member.userId !== project.ownerId && (
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          title="멤버 제거"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 프로젝트 정보 사이드바 컴포넌트
function ProjectInfoSidebar({ 
  project, 
  onEdit,
  onProjectUpdate,
  onClose,
  isMobile = false
}: { 
  project: Project; 
  onEdit: () => void; 
  onProjectUpdate: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}) {
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
      {/* 사이드바 헤더 - 최신 트렌드 디자인 */}
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
                    console.log('목표 업데이트:', objectiveId, data)
                    // TODO: 실제 목표 업데이트 API 호출
                  }}
                  onKeyResultUpdate={(keyResultId, data) => {
                    console.log('핵심 결과 업데이트:', keyResultId, data)
                    // TODO: 실제 핵심 결과 업데이트 API 호출
                  }}
                  onObjectiveCreate={(data) => {
                    console.log('목표 생성:', data)
                    // TODO: 실제 목표 생성 API 호출
                  }}
                  onKeyResultCreate={(objectiveId, data) => {
                    console.log('핵심 결과 생성:', objectiveId, data)
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
      </div> {/* 사이드바 스크롤 영역 닫기 */}
    </div>
  );
}

// 프로젝트 상세 뷰 컴포넌트 (2단 레이아웃)
function ProjectDetailView({ 
  project, 
  onEdit,
  onProjectUpdate 
}: { 
  project: Project; 
  onEdit: () => void; 
  onProjectUpdate: () => void;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // 모바일에서는 기본적으로 사이드바 닫힘
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 터치 이벤트 핸들러 (메모화)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isMobile) {
      if (isLeftSwipe && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
      if (isRightSwipe && !isSidebarOpen) {
        setIsSidebarOpen(true);
      }
    }
  }, [touchStart, touchEnd, isMobile, isSidebarOpen]);

  // 사이드바 토글 핸들러 (메모화)
  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen]);

  // 키보드 네비게이션 핸들러
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [isSidebarOpen]);

  return (
    <div 
      className="h-screen h-screen-mobile bg-gray-50 relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="main"
      aria-label="프로젝트 상세 페이지"
    >
      {/* 좌측 메인 콘텐츠 (채팅) - 고정 위치 */}
      <div className="fixed inset-0 bg-white">
        <ProjectChatChannel
          project={project}
          members={project.members || []}
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
          onToggleSidebar={handleToggleSidebar}
          onTaskCreate={(taskData) => {
            console.log('새 업무 생성:', taskData)
            // TODO: 실제 업무 생성 API 호출
          }}
          onMilestoneCreate={(milestoneData) => {
            console.log('마일스톤 생성:', milestoneData)
            // TODO: 실제 마일스톤 생성 API 호출
          }}
          onUserDelegate={(delegationData) => {
            console.log('업무 재할당:', delegationData)
            // TODO: 실제 업무 재할당 API 호출
          }}
        />
      </div>

      {/* 모바일 오버레이 */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 우측 사이드바 - 완전 고정 위치 */}
      <aside 
        className={`
          fixed top-0 bottom-0 right-0 z-45
          transition-all duration-300 ease-out
          ${isSidebarOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
          ${isMobile ? 'w-full' : 'w-[640px]'}
          bg-white border-l border-gray-200 shadow-2xl
        `}
        style={{
          transform: isSidebarOpen ? 'translateX(0%)' : 'translateX(100%)',
          transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease-out'
        }}
        role="complementary"
        aria-label="프로젝트 정보 사이드바"
        aria-hidden={!isSidebarOpen}
      >
        <ProjectInfoSidebar
          project={project}
          onEdit={onEdit}
          onProjectUpdate={onProjectUpdate}
          onClose={() => setIsSidebarOpen(false)}
          isMobile={isMobile}
        />
      </aside>
    </div>
  );
}

// 프로젝트 편집 폼 컴포넌트
function ProjectEditForm({ 
  project, 
  onSave, 
  onCancel 
}: { 
  project: Project; 
  onSave: (data: UpdateProjectDto) => Promise<void>; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState<UpdateProjectDto>({
    title: project.title,
    description: project.description || '',
    status: project.status,
    priority: project.priority,
    startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
    dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
    budget: project.budget ? Number(project.budget) : undefined,
    currency: project.currency || 'KRW',
    color: project.color || '#3B82F6',
    tags: project.tags || [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('프로젝트 수정 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[720px] mx-auto px-0 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onCancel}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">프로젝트 편집</h1>
                <p className="text-sm text-gray-500 mt-1">{project.title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 편집 폼 */}
      <main className="max-w-[720px] mx-auto px-0 md:px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  프로젝트 이름 *
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상태
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={ProjectStatus.PLANNING}>계획중</option>
                    <option value={ProjectStatus.ACTIVE}>진행중</option>
                    <option value={ProjectStatus.ON_HOLD}>일시중단</option>
                    <option value={ProjectStatus.COMPLETED}>완료</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    우선순위
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as ProjectPriority }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={ProjectPriority.LOW}>낮음</option>
                    <option value={ProjectPriority.MEDIUM}>보통</option>
                    <option value={ProjectPriority.HIGH}>높음</option>
                    <option value={ProjectPriority.URGENT}>긴급</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 일정 및 예산 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">일정 및 예산</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    마감일
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    예산
                  </label>
                  <input
                    type="number"
                    value={formData.budget || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    통화
                  </label>
                  <select
                    value={formData.currency || 'KRW'}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="KRW">KRW</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 외관 설정 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">외관 설정</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                프로젝트 색상
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.color || '#3B82F6'}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-12 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={formData.color || '#3B82F6'}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#3B82F6"
                />
              </div>
            </div>
          </div>

          {/* 태그 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">태그</h3>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="태그 입력 후 Enter"
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
                      className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title?.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 프로젝트 데이터 로드
  useEffect(() => {
    loadProject();
  }, [params.id]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 목업 프로젝트 데이터 - 프로젝트 목록 페이지와 동일한 데이터 사용
      const mockProjects: { [key: string]: Project } = {
        '1': {
          id: '1',
          title: '워클리 MVP 개발',
          description: '비즈니스 성공을 위한 웹 애플리케이션 MVP 버전 개발',
          status: ProjectStatus.ACTIVE,
          priority: ProjectPriority.HIGH,
          progress: 75,
          memberCount: 4,
          taskCount: 23,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['React', 'TypeScript', 'NestJS', 'MVP'],
          color: '#3B82F6',
          icon: '🚀',
          objectives: [
            {
              id: 'obj1',
              title: '사용자 인증 시스템 구축',
              description: 'Google OAuth 기반 로그인 시스템',
              completed: true,
              completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'obj2', 
              title: '프로젝트 관리 기능 완성',
              description: '프로젝트 CRUD 및 협업 기능',
              completed: false
            }
          ],
          keyResults: [
            {
              id: 'kr1',
              objectiveId: 'obj1',
              title: '로그인 성공률',
              description: 'Google OAuth 로그인 성공률 95% 이상',
              targetValue: 95,
              currentValue: 98,
              unit: '%',
              completed: true,
              completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'kr2',
              objectiveId: 'obj2',
              title: '프로젝트 생성 기능',
              description: '사용자가 프로젝트를 생성할 수 있는 기능',
              targetValue: 100,
              currentValue: 80,
              unit: '%',
              completed: false
            },
            {
              id: 'kr3',
              objectiveId: 'obj2',
              title: '실시간 채팅 구현',
              description: 'Socket.io 기반 실시간 메시징',
              targetValue: 100,
              currentValue: 60,
              unit: '%',
              completed: false
            }
          ],
          completedObjectiveCount: 1,
          completedKeyResultCount: 1,
          members: [
            {
              id: 'member1',
              userId: 'user1',
              role: ProjectMemberRole.OWNER,
              joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              user: {
                id: 'user1',
                name: '김워클리',
                email: 'kim@workly.com'
              }
            },
            {
              id: 'member2',
              userId: 'user2',
              role: ProjectMemberRole.ADMIN,
              joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              user: {
                id: 'user2',
                name: '박개발자',
                email: 'park@workly.com'
              }
            },
            {
              id: 'member3',
              userId: 'user3',
              role: ProjectMemberRole.MEMBER,
              joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              user: {
                id: 'user3',
                name: '이디자이너',
                email: 'lee@workly.com'
              }
            },
            {
              id: 'member4',
              userId: 'user4',
              role: ProjectMemberRole.MEMBER,
              joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              user: {
                id: 'user4',
                name: '정기획자',
                email: 'jung@workly.com'
              }
            }
          ],
          ownerId: 'user1',
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          budget: 50000000,
          currency: 'KRW'
        },
        '2': {
          id: '2',
          title: 'AI 챗봇 개발',
          description: '고객 지원을 위한 AI 기반 챗봇 시스템 구축',
          status: ProjectStatus.ACTIVE,
          priority: ProjectPriority.MEDIUM,
          progress: 45,
          memberCount: 3,
          taskCount: 15,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['AI', 'Python', 'TensorFlow', '챗봇'],
          color: '#10B981',
          icon: '🤖',
          objectives: [
            {
              id: 'obj3',
              title: 'NLP 모델 학습',
              description: '한국어 자연어 처리 모델 개발',
              completed: false
            }
          ],
          keyResults: [
            {
              id: 'kr4',
              objectiveId: 'obj3',
              title: '모델 정확도',
              description: '질문 응답 정확도 90% 달성',
              targetValue: 90,
              currentValue: 72,
              unit: '%',
              completed: false
            }
          ],
          completedObjectiveCount: 0,
          completedKeyResultCount: 0,
          members: [
            {
              id: 'member5',
              userId: 'user5',
              role: ProjectMemberRole.OWNER,
              joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              user: {
                id: 'user5',
                name: '최AI연구자',
                email: 'choi@workly.com'
              }
            }
          ],
          ownerId: 'user5'
        }
      };

      // API 호출 시뮬레이션을 위한 지연
      await new Promise(resolve => setTimeout(resolve, 1000));

      const projectId = params.id as string;
      const foundProject = mockProjects[projectId];
      
      if (!foundProject) {
        throw new Error('프로젝트를 찾을 수 없습니다.');
      }

      setProject(foundProject);
    } catch (err) {
      console.error('프로젝트 로드 실패:', err);
      setError(err instanceof Error ? err.message : '프로젝트를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProject = async (updateData: UpdateProjectDto) => {
    try {
      // 목업 프로젝트 수정 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('프로젝트 수정 데이터:', updateData);
      
      // 목업에서는 실제로 업데이트하지 않고 성공 메시지만 표시
      alert('프로젝트가 성공적으로 수정되었습니다! (목업 모드)');
      
      setIsEditing(false);
    } catch (err) {
      console.error('프로젝트 수정 실패:', err);
      throw err;
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">프로젝트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 오류 상태
  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || '프로젝트를 찾을 수 없습니다.'}</p>
          <div className="space-x-4">
            <button
              onClick={loadProject}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              다시 시도
            </button>
            <button
              onClick={() => router.push('/projects')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              프로젝트 목록으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 편집 모드
  if (isEditing) {
    return (
      <ProjectEditForm
        project={project}
        onSave={handleSaveProject}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  // 상세 보기 모드
  return (
    <ProjectDetailView
      project={project}
      onEdit={() => setIsEditing(true)}
      onProjectUpdate={loadProject}
    />
  );
}