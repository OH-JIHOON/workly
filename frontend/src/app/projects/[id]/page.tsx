'use client';

import React, { useState, useEffect } from 'react';
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
  UserMinus
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Project, UpdateProjectDto, ProjectStatus, ProjectPriority, ProjectMember, ProjectMemberRole, AddProjectMemberDto } from '@/types/project.types';

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
      const response = await apiClient.get<ProjectMember[]>(`/projects/${project.id}/members`);
      setMembers(response);
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
      // TODO: 이메일로 사용자 검색 또는 초대 기능 구현
      // 현재는 userId가 필요하므로 실제 구현에서는 이메일 -> userId 변환 필요
      const addMemberDto: AddProjectMemberDto = {
        userId: inviteEmail, // 임시로 이메일을 userId로 사용
        role: inviteRole,
      };
      
      await apiClient.post(`/projects/${project.id}/members`, addMemberDto);
      await loadMembers();
      onMemberAdded();
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
      await apiClient.delete(`/projects/${project.id}/members/${memberId}`);
      await loadMembers();
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

// 프로젝트 상세 정보 표시 컴포넌트
function ProjectDetailView({ 
  project, 
  onEdit,
  onProjectUpdate 
}: { 
  project: Project; 
  onEdit: () => void; 
  onProjectUpdate: () => void;
}) {
  const router = useRouter();
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
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[640px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{project.title}</h1>
                <p className="text-sm text-gray-500 mt-1">프로젝트 상세</p>
              </div>
            </div>
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit3 className="w-4 h-4" />
              <span>편집</span>
            </button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="max-w-[640px] mx-auto px-6 py-6">
        {/* 프로젝트 헤더 카드 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div 
              className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: project.color || '#3B82F6' }}
            >
              {project.icon || project.title.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h2>
              {project.description && (
                <p className="text-gray-600 mb-4">{project.description}</p>
              )}
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                  {getStatusText(project.status)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority)}`}>
                  {getPriorityText(project.priority)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 진행률 카드 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">프로젝트 진행률</h3>
            <span className="text-2xl font-bold text-blue-600">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">총 작업: </span>
              <span className="font-medium">{project.taskCount || 0}개</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">완료: </span>
              <span className="font-medium">{project.completedTaskCount || 0}개</span>
            </div>
          </div>
        </div>

        {/* 프로젝트 정보 카드 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">프로젝트 정보</h3>
          <div className="space-y-4">
            {/* 날짜 정보 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">시작일</span>
                </div>
                <p className="font-medium">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString('ko-KR') : '미설정'}
                </p>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">마감일</span>
                </div>
                <p className="font-medium">
                  {project.dueDate ? new Date(project.dueDate).toLocaleDateString('ko-KR') : '미설정'}
                </p>
              </div>
            </div>

            {/* 예산 정보 */}
            {project.budget && (
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">예산</span>
                </div>
                <p className="font-medium">
                  {new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: project.currency || 'KRW'
                  }).format(Number(project.budget))}
                </p>
              </div>
            )}

            {/* 팀 멤버 */}
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">팀 멤버</span>
              </div>
              <p className="font-medium">{project.members?.length || 0}명</p>
            </div>
          </div>
        </div>

        {/* 태그 카드 */}
        {project.tags && project.tags.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Tag className="w-4 h-4 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">태그</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">액션</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setIsMemberModalOpen(true)}
              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg"
            >
              <Users className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">팀 멤버 관리</p>
                <p className="text-sm text-gray-500">멤버 추가/제거 및 권한 설정</p>
              </div>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg">
              <Settings className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">프로젝트 설정</p>
                <p className="text-sm text-gray-500">워크플로우 및 고급 설정</p>
              </div>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg">
              <Archive className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">프로젝트 보관</p>
                <p className="text-sm text-gray-500">프로젝트를 보관함으로 이동</p>
              </div>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-red-50 rounded-lg text-red-600">
              <Trash2 className="w-5 h-5" />
              <div>
                <p className="font-medium">프로젝트 삭제</p>
                <p className="text-sm text-red-400">프로젝트를 영구적으로 삭제</p>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* 멤버 관리 모달 */}
      <MemberManagementModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        project={project}
        onMemberAdded={onProjectUpdate}
        onMemberRemoved={onProjectUpdate}
      />
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
    if (!formData.name?.trim()) return;

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
        <div className="max-w-[640px] mx-auto px-6 py-4">
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
      <main className="max-w-[640px] mx-auto px-6 py-6">
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
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
              disabled={isSubmitting || !formData.name?.trim()}
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
      
      const response = await apiClient.get<Project>(`/projects/${params.id}`);
      setProject(response);
    } catch (err) {
      console.error('프로젝트 로드 실패:', err);
      setError('프로젝트를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProject = async (updateData: UpdateProjectDto) => {
    try {
      const response = await apiClient.put<Project>(`/projects/${params.id}`, updateData);
      setProject(response);
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