'use client';

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, Filter, Grid3X3, List, Calendar, Folder, Users, BarChart3, MessageCircle, Target, TrendingUp, UserPlus, Star, CheckCircle2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import MainContainer from '@/components/layout/MainContainer';
import SimpleFilterChips from '@/components/ui/SimpleFilterChips';
import WorklyFloatingActionButton from '@/components/ui/WorklyFloatingActionButton';
import LoginBanner from '@/components/ui/LoginBanner';
import ProjectCard from '@/components/projects/ProjectCard';
import { isAuthenticated } from '@/lib/auth';
// import { apiClient } from '@/lib/api'; // 목업 모드에서는 주석 처리
import { 
  Project, 
  CreateProjectDto, 
  ProjectQueryDto, 
  PaginatedResponse,
  ProjectStatus,
  ProjectPriority,
  ProjectVisibility
} from '@/types/project.types';


export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // 필터 설정 상태
  const [showOnlyMyProjects, setShowOnlyMyProjects] = useState(false)
  const [projectSortOrder, setProjectSortOrder] = useState('recent')
  const [showCompletedProjects, setShowCompletedProjects] = useState(true)

  // 로그인 상태 초기화
  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
  }, [])


  // 동적 헤더 타이틀
  const getHeaderTitle = () => {
    return currentFilter
  }

  // 사용자가 입력을 멈췄을 때만 API 요청을 보내도록 검색어를 디바운싱합니다.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms 지연

    return () => clearTimeout(timer);
  }, [searchQuery]);


  // 프로젝트 로드
  useEffect(() => {
    loadProjects();
  }, [currentFilter, debouncedSearchQuery]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 목업 프로젝트 데이터 생성
      const mockProjects: Project[] = [
        {
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
          members: [],
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
          isRecruiting: true
        },
        {
          id: '2',
          title: 'AI 챗봇 개발',
          description: '고객 지원을 위한 AI 기반 챗봇 시스템 구축',
          status: ProjectStatus.ACTIVE,
          priority: ProjectPriority.MEDIUM,
          progress: 45,
          memberCount: 3,
          taskCount: 15,
          completedTaskCount: 6,
          visibility: ProjectVisibility.TEAM,
          isArchived: false,
          isTemplate: false,
          settings: {
            allowGuestAccess: false,
            requireApprovalForTasks: true,
            enableTimeTracking: true,
            enableBudgetTracking: true,
            enableNotifications: true
          },
          ownerId: 'user2',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['AI', 'Python', 'TensorFlow', '챗봇'],
          color: '#10B981',
          icon: '🤖',
          owner: {
            id: 'user2',
            name: '이개발',
            email: 'lee@workly.com'
          },
          members: [],
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
          isRecruiting: true
        },
        {
          id: '3',
          title: '모바일 앱 리뉴얼',
          description: '기존 모바일 앱의 UI/UX 전면 개선',
          status: ProjectStatus.PLANNING,
          priority: ProjectPriority.MEDIUM,
          progress: 15,
          memberCount: 2,
          taskCount: 8,
          completedTaskCount: 1,
          visibility: ProjectVisibility.PRIVATE,
          isArchived: false,
          isTemplate: false,
          settings: {
            allowGuestAccess: false,
            requireApprovalForTasks: false,
            enableTimeTracking: false,
            enableBudgetTracking: false,
            enableNotifications: true
          },
          ownerId: 'user3',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['React Native', 'UI/UX', '모바일'],
          color: '#8B5CF6',
          icon: '📱',
          owner: {
            id: 'user3',
            name: '박디자인',
            email: 'park@workly.com'
          },
          members: [],
          objectives: [
            {
              id: 'obj4',
              title: '디자인 시스템 구축',
              description: '일관된 UI 컴포넌트 라이브러리',
              completed: false
            }
          ],
          keyResults: [
            {
              id: 'kr5',
              objectiveId: 'obj4',
              title: '컴포넌트 개수',
              description: '재사용 가능한 UI 컴포넌트 50개',
              targetValue: 50,
              currentValue: 12,
              unit: '개',
              completed: false
            }
          ],
          completedObjectiveCount: 0,
          completedKeyResultCount: 0,
          isRecruiting: false
        },
        {
          id: '4',
          title: 'E-커머스 플랫폼',
          description: '온라인 쇼핑몰 풀스택 개발',
          status: ProjectStatus.ACTIVE,
          priority: ProjectPriority.HIGH,
          progress: 88,
          memberCount: 6,
          taskCount: 42,
          completedTaskCount: 37,
          visibility: ProjectVisibility.TEAM,
          isArchived: false,
          isTemplate: false,
          settings: {
            allowGuestAccess: false,
            requireApprovalForTasks: true,
            enableTimeTracking: true,
            enableBudgetTracking: true,
            enableNotifications: true
          },
          ownerId: 'user4',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['Next.js', 'Stripe', '결제', '쇼핑몰'],
          color: '#F59E0B',
          owner: {
            id: 'user4',
            name: '최커머스',
            email: 'choi@workly.com'
          },
          members: [],
          icon: '🛒',
          objectives: [
            {
              id: 'obj5',
              title: '결제 시스템 통합',
              description: 'Stripe 기반 안전한 결제 처리',
              completed: true,
              completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'obj6',
              title: '상품 관리 시스템',
              description: '관리자용 상품 CRUD 시스템',
              completed: true,
              completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          keyResults: [
            {
              id: 'kr6',
              objectiveId: 'obj5',
              title: '결제 성공률',
              description: '결제 프로세스 성공률 99% 이상',
              targetValue: 99,
              currentValue: 99.2,
              unit: '%',
              completed: true,
              completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'kr7',
              objectiveId: 'obj6',
              title: '상품 등록 속도',
              description: '상품 등록 프로세스 30초 이내',
              targetValue: 30,
              currentValue: 25,
              unit: '초',
              completed: true,
              completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          completedObjectiveCount: 2,
          completedKeyResultCount: 2,
          isRecruiting: false
        }
      ];

      // 필터링 적용
      let filteredProjects = mockProjects;
      
      if (debouncedSearchQuery) {
        filteredProjects = filteredProjects.filter(project =>
          project.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          project.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          project.tags.some(tag => tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
        );
      }

      // SimpleFilterChips 필터링 로직
      switch (currentFilter) {
        case 'active':
          filteredProjects = filteredProjects.filter(project => project.status === ProjectStatus.ACTIVE);
          break;
        case 'recruiting':
          filteredProjects = filteredProjects.filter(project => project.isRecruiting);
          break;
        case 'completed':
          filteredProjects = filteredProjects.filter(project => project.status === ProjectStatus.COMPLETED);
          break;
        case 'all':
        default:
          // 전체 프로젝트는 추가 필터링 없음
          break;
      }

      // 실제 API 호출 시뮬레이션을 위한 지연
      await new Promise(resolve => setTimeout(resolve, 800));

      setProjects(filteredProjects);

    } catch (err) {
      console.error('프로젝트 로드 실패:', err);
      setError('프로젝트를 불러오는데 실패했습니다.');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
  };

  // const filteredProjects = projects.filter(project =>
  //  project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //  project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  //);

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <Header 
        title={getHeaderTitle()}
      />
      
      {/* 로그인 배너 (헤더 바깥) */}
      <LoginBanner />
      
      {/* 메인 콘텐츠 */}
      <MainContainer>
        {/* 동적 필터 칩 관리자 - 로그인된 사용자만 표시 */}
        {isLoggedIn && (
          <div className="mb-0">
            <SimpleFilterChips
              options={[
                { 
                  key: 'all',
                  label: '전체 프로젝트',
                  count: projects.length
                },
                { 
                  key: 'active',
                  label: '진행 중',
                  count: projects.filter(p => p.status === ProjectStatus.ACTIVE).length
                },
                { 
                  key: 'recruiting',
                  label: '모집 중',
                  count: projects.filter(p => p.isRecruiting).length
                },
                { 
                  key: 'completed',
                  label: '완료됨',
                  count: projects.filter(p => p.status === ProjectStatus.COMPLETED).length
                }
              ]}
              activeFilters={[currentFilter]}
              onFilterChange={(filters) => setCurrentFilter(filters[0] || 'all')}
              settings={{
                title: "프로젝트 필터 설정",
                settings: [
                  {
                    key: 'myOnly',
                    label: '내가 참여한 프로젝트만',
                    type: 'toggle',
                    value: showOnlyMyProjects,
                    onChange: setShowOnlyMyProjects
                  },
                  {
                    key: 'sort',
                    label: '정렬 기준',
                    type: 'select',
                    value: projectSortOrder,
                    options: ['recent', 'progress', 'deadline', 'members'],
                    onChange: setProjectSortOrder
                  }
                ]
              }}
            />
          </div>
        )}
          

        {/* 오류 표시 */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadProjects}
              className="mt-2 text-red-600 underline hover:no-underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 로딩 */}
        {isLoading ? (
          <div>
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white border border-gray-200 p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="flex space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center">
            <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? '검색 결과 없음' : '프로젝트 없음'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? '검색 조건에 맞는 프로젝트가 없습니다.' 
                : '우측 하단의 수집함 버튼(+)을 눌러 프로젝트를 추가해보세요!'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 overflow-hidden">
            {/* 모집 중 프로젝트 배너 (모집 중 필터일 때만 표시) */}
            {currentFilter === '멤버 모집 중' && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <UserPlus className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800">멤버를 모집 중인 프로젝트</h3>
                </div>
                <p className="text-green-700 mb-4">
                  새로운 팀원을 찾고 있는 프로젝트들입니다. 관심 있는 프로젝트에 참여해보세요!
                </p>
                <div className="flex items-center space-x-4 text-sm text-green-600">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>즉시 참여 가능</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>다양한 역할 모집</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>성장 기회 제공</span>
                  </div>
                </div>
              </div>
            )}

            <div className="divide-y divide-gray-100">
              {/* 프로젝트 목록 */}
              {projects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onClick={() => router.push(`/projects/${project.id}`)}
                  onJoinProject={(projectId) => {
                    console.log('프로젝트 참여 신청:', projectId)
                    // TODO: 프로젝트 참여 로직 구현
                  }}
                  onOpenChat={(projectId) => {
                    console.log('채팅방 열기:', projectId)
                    // TODO: 채팅방 이동 로직 구현
                  }}
                  onManageGoals={(projectId) => {
                    console.log('목표 관리:', projectId)
                    // TODO: 목표 관리 페이지 이동 로직 구현
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </MainContainer>
      
      {/* 플로팅 액션 버튼 */}
      <WorklyFloatingActionButton 
        onTaskCreated={(task) => {
          console.log('CPER 업무 생성:', task)
          // TODO: 프로젝트 관련 업무 생성 로직 구현
        }}
        onInboxItemCreated={(inboxItem) => {
          console.log('빠른 수집:', inboxItem)
          // TODO: 프로젝트 관련 아이디어 수집 로직 구현
        }}
      />
    </div>
  );
}