'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Eye,
  X,
  UserMinus,
  Mail
} from 'lucide-react';

import { Project, ProjectMember, ProjectMemberRole } from '@/types/project.types';

interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onMemberAdded: () => void;
  onMemberRemoved: () => void;
}

export default function MemberManagementModal({ 
  isOpen, 
  onClose, 
  project,
  onMemberAdded,
  onMemberRemoved 
}: MemberManagementModalProps) {
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
      onMemberAdded();
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