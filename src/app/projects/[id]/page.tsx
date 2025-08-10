'use client';

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import MainContainer from '@/components/layout/MainContainer';
import { Project, UpdateProjectDto, ProjectStatus, ProjectPriority, ProjectVisibility, ProjectMemberRole } from '@/types/project.types';
import ProjectDetailView from '@/components/projects/ProjectDetailView';
import ProjectEditForm from '@/components/projects/ProjectEditForm';

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
          completedTaskCount: 17,
          visibility: ProjectVisibility.TEAM,
          isArchived: false,
          isTemplate: false,
          settings: {
            allowGuestAccess: false,
            requireApprovalForTasks: false,
            enableTimeTracking: true,
            enableBudgetTracking: false,
            enableNotifications: true
          },
          ownerId: 'user1',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['React', 'TypeScript', 'NestJS', 'MVP'],
          color: '#3B82F6',
          icon: '🚀',
          owner: {
            id: 'user1',
            name: '김워클리',
            email: 'kim@workly.com'
          },
          objectives: [
            {
              id: 'obj1',
              title: '사용자 인증 시스템 구축',
              description: 'Google OAuth 기반 로그인 시스템',
              completed: false,
              keyResults: [
                {
                  id: 'kr1',
                  title: 'Google OAuth 설정 완료',
                  progress: 100,
                  targetValue: 1,
                  currentValue: 1,
                  unit: '설정'
                },
                {
                  id: 'kr2', 
                  title: '사용자 프로필 관리 기능',
                  progress: 80,
                  targetValue: 5,
                  currentValue: 4,
                  unit: '기능'
                }
              ]
            },
            {
              id: 'obj2',
              title: '업무 관리 시스템 개발',
              description: '직관적이고 효율적인 업무 관리',
              completed: false,
              keyResults: [
                {
                  id: 'kr3',
                  title: '업무 생성 및 편집',
                  progress: 100,
                  targetValue: 10,
                  currentValue: 10,
                  unit: '기능'
                },
                {
                  id: 'kr4',
                  title: '업무 필터링 시스템',
                  progress: 30,
                  targetValue: 8,
                  currentValue: 2,
                  unit: '필터'
                }
              ]
            }
          ],
          members: [
            {
              id: 'member1',
              userId: 'user1',
              role: ProjectMemberRole.OWNER,
              joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
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
              joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
              user: {
                id: 'user2',
                name: '박개발',
                email: 'park@workly.com'
              }
            },
            {
              id: 'member3',
              userId: 'user3', 
              role: ProjectMemberRole.MEMBER,
              joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              user: {
                id: 'user3',
                name: '이디자인',
                email: 'lee@workly.com'
              }
            }
          ]
        },
        '2': {
          id: '2',
          title: '마케팅 웹사이트 리뉴얼',
          description: '브랜드 아이덴티티를 강화하고 사용자 경험을 개선한 새로운 웹사이트',
          status: ProjectStatus.PLANNING,
          priority: ProjectPriority.MEDIUM,
          progress: 25,
          memberCount: 3,
          taskCount: 15,
          completedTaskCount: 4,
          visibility: ProjectVisibility.TEAM,
          isArchived: false,
          isTemplate: false,
          settings: {
            allowGuestAccess: true,
            requireApprovalForTasks: true,
            enableTimeTracking: false,
            enableBudgetTracking: true,
            enableNotifications: true
          },
          ownerId: 'user2',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['마케팅', 'React', 'UI/UX'],
          color: '#10B981',
          icon: '🌟',
          budget: 5000000,
          currency: 'KRW',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          owner: {
            id: 'user2',
            name: '박개발',
            email: 'park@workly.com'
          },
          objectives: [
            {
              id: 'obj3',
              title: '새로운 브랜딩 적용',
              description: '브랜드 가이드라인에 맞는 디자인 시스템',
              completed: false,
              keyResults: [
                {
                  id: 'kr5',
                  title: '컬러 시스템 정의',
                  progress: 100,
                  targetValue: 1,
                  currentValue: 1,
                  unit: '시스템'
                },
                {
                  id: 'kr6',
                  title: '타이포그래피 가이드',
                  progress: 0,
                  targetValue: 1,
                  currentValue: 0,
                  unit: '가이드'
                }
              ]
            }
          ],
          members: [
            {
              id: 'member4',
              userId: 'user2',
              role: ProjectMemberRole.OWNER,
              joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              user: {
                id: 'user2',
                name: '박개발',
                email: 'park@workly.com'
              }
            },
            {
              id: 'member5',
              userId: 'user3',
              role: ProjectMemberRole.MEMBER,
              joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              user: {
                id: 'user3',
                name: '이디자인',
                email: 'lee@workly.com'
              }
            }
          ]
        }
      };

      const projectId = Array.isArray(params.id) ? params.id[0] : params.id;
      const projectData = mockProjects[projectId];
      
      if (!projectData) {
        setError('프로젝트를 찾을 수 없습니다.');
        return;
      }

      // 실제 환경에서는 API 호출
      await new Promise(resolve => setTimeout(resolve, 500));
      setProject(projectData);

    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
      setError('프로젝트를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProject = async (data: UpdateProjectDto) => {
    try {
      console.log('프로젝트 수정 데이터:', data);
      
      // 목업 저장 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 로컬 상태 업데이트
      if (project) {
        setProject(prev => prev ? { ...prev, ...data } : null);
      }
      
      alert('프로젝트가 성공적으로 수정되었습니다! (목업 모드)');
      setIsEditing(false);
      
    } catch (error) {
      console.error('프로젝트 수정 실패:', error);
      alert('프로젝트 수정 중 오류가 발생했습니다.');
      throw error;
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <MainContainer>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">프로젝트를 불러오는 중...</p>
          </div>
        </div>
      </MainContainer>
    );
  }

  // 오류 상태
  if (error || !project) {
    return (
      <MainContainer>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">😥</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">프로젝트를 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/projects')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              프로젝트 목록으로
            </button>
          </div>
        </div>
      </MainContainer>
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