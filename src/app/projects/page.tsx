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
import ProjectAdvancedFilterPanel, { ProjectAdvancedFilters } from '@/components/projects/ProjectAdvancedFilterPanel';
import ProjectApplicationModal, { ProjectApplicationData } from '@/components/projects/ProjectApplicationModal';
import { useSupabaseAuth } from '@/lib/stores/auth.store'; // New Import
import { projects } from '@/lib/api/projects.api'; // New Import
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
  const [projectsData, setProjectsData] = useState<Project[]>([]); // Renamed to avoid conflict
  const [allProjects, setAllProjects] = useState<Project[]>([]); // 전체 프로젝트 데이터 (필터 칩 개수 계산용)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [currentFilter, setCurrentFilter] = useState<string | null>('all');
  
  const { user, isAuthenticated: isAuthenticatedFromSupabase } = useSupabaseAuth(); // Get user and isAuthenticated from Supabase Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // 필터 설정 상태
  const [showOnlyMyProjects, setShowOnlyMyProjects] = useState(false)
  const [projectSortOrder, setProjectSortOrder] = useState('recent')
  const [showCompletedProjects, setShowCompletedProjects] = useState(true)
  
  // 상세 필터 상태
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<ProjectAdvancedFilters>({})

  // 지원 모달 상태
  const [selectedProjectForApplication, setSelectedProjectForApplication] = useState<Project | null>(null)
  const [currentUserId] = useState('current_user') // 실제로는 auth store에서 가져와야 함

  // 프로젝트 지원 핸들러
  const handleProjectApplication = (project: Project) => {
    setSelectedProjectForApplication(project)
  }

  // 지원서 제출 핸들러
  const handleApplicationSubmit = async (applicationData: ProjectApplicationData) => {
    try {
      // 목업 모드에서는 콘솔에만 로그
      console.log('프로젝트 지원:', applicationData)
      
      // 실제로는 API 호출
      // await apiClient.post('/project-applications', applicationData)
      
      alert(`${selectedProjectForApplication?.title} 프로젝트에 지원서가 제출되었습니다! 프로젝트 리더의 검토를 기다려주세요.`)
    } catch (error) {
      console.error('지원서 제출 실패:', error)
      alert('지원서 제출에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // 로그인 상태 초기화
  useEffect(() => {
    setIsLoggedIn(isAuthenticatedFromSupabase)
  }, [isAuthenticatedFromSupabase])


  // 동적 헤더 타이틀
  const getHeaderTitle = () => {
    if (!currentFilter) return 'Workspace'
    
    switch (currentFilter) {
      case 'all':
        return '전체 Workspace'
      case 'active':
        return '진행 중'
      case 'recruiting':
        return '모집 중'
      case 'completed':
        return '완료됨'
      default:
        return 'Workspace'
    }
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
    if (user?.id) { // Only load if user ID is available
      loadProjects();
    }
  }, [currentFilter, debouncedSearchQuery, advancedFilters, user?.id]); // Depend on user.id

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 모든 프로젝트 로드
      const { data: fetchedProjects, error: projectsError } = await projects.list(user!.id); // Use projects.list
      if (projectsError) throw projectsError;

      // 필터링 적용
      let filteredProjects = fetchedProjects || [];
      
      if (debouncedSearchQuery) {
        filteredProjects = filteredProjects.filter(project =>
          project.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          project.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          project.tags.some((tag: string) => tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
        );
      }

      // SimpleFilterChips 필터링 로직
      if (currentFilter) {
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
      }
      // currentFilter가 null이면 전체 프로젝트 표시

      // 상세 필터 적용
      if (advancedFilters.status && advancedFilters.status.length > 0) {
        filteredProjects = filteredProjects.filter(project => 
          advancedFilters.status!.includes(project.status)
        );
      }

      if (advancedFilters.priority && advancedFilters.priority.length > 0) {
        filteredProjects = filteredProjects.filter(project => 
          advancedFilters.priority!.includes(project.priority)
        );
      }

      if (advancedFilters.visibility && advancedFilters.visibility.length > 0) {
        filteredProjects = filteredProjects.filter(project => 
          advancedFilters.visibility!.includes(project.visibility)
        );
      }

      if (advancedFilters.tags && advancedFilters.tags.length > 0) {
        filteredProjects = filteredProjects.filter(project => 
          advancedFilters.tags!.some(tag => project.tags.includes(tag))
        );
      }

      // 특수 필터 적용
      if (advancedFilters.isRecruiting) {
        filteredProjects = filteredProjects.filter(project => project.isRecruiting);
      }

      if (advancedFilters.hasGoal) {
        filteredProjects = filteredProjects.filter(project => project.goalId);
      }

      // 마감일 필터 적용
      if (advancedFilters.dueDate) {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekEnd = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        const monthEnd = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 0);

        switch (advancedFilters.dueDate) {
          case 'overdue':
            filteredProjects = filteredProjects.filter(project => 
              project.dueDate && new Date(project.dueDate) < todayStart
            );
            break;
          case 'this-week':
            filteredProjects = filteredProjects.filter(project => 
              project.dueDate && 
              new Date(project.dueDate) >= todayStart && 
              new Date(project.dueDate) <= weekEnd
            );
            break;
          case 'this-month':
            filteredProjects = filteredProjects.filter(project => 
              project.dueDate && 
              new Date(project.dueDate) >= todayStart && 
              new Date(project.dueDate) <= monthEnd
            );
            break;
          case 'no-due':
            filteredProjects = filteredProjects.filter(project => !project.dueDate);
            break;
        }
      }

      // 전체 프로젝트 데이터 저장 (필터 칩 개수 계산용)
      setAllProjects(fetchedProjects || []);
      setProjectsData(filteredProjects);

    } catch (err: any) {
      console.error('프로젝트 로드 실패:', err);
      setError(`프로젝트를 불러오는데 실패했습니다: ${err.message || err}`);
      setProjectsData([]);
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
                  label: '전체 Workspace',
                  count: allProjects.length
                },
                { 
                  key: 'active',
                  label: '진행 중',
                  count: allProjects.filter(p => p.status === ProjectStatus.ACTIVE).length
                },
                { 
                  key: 'recruiting',
                  label: '모집 중',
                  count: allProjects.filter(p => p.isRecruiting).length
                },
                { 
                  key: 'completed',
                  label: '완료됨',
                  count: allProjects.filter(p => p.status === ProjectStatus.COMPLETED).length
                }
              ]}
              activeFilters={currentFilter ? [currentFilter] : []}
              onFilterChange={(filters) => setCurrentFilter(filters[0] || null)}
              onAdvancedFilterClick={() => setIsAdvancedFilterOpen(true)}
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
        ) : projectsData.length === 0 ? (
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
            {currentFilter === 'recruiting' && (
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
              {projectsData.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onClick={() => router.push(`/projects/${project.id}`)}
                  onApply={handleProjectApplication}
                  currentUserId={currentUserId}
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
      
      {/* 상세 필터 패널 */}
      <ProjectAdvancedFilterPanel
        isOpen={isAdvancedFilterOpen}
        onClose={() => setIsAdvancedFilterOpen(false)}
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        availableMembers={[
          { id: 'user1', name: '김워클리' },
          { id: 'user2', name: '이개발' },
          { id: 'user3', name: '박디자인' },
          { id: 'user4', name: '최커머스' }
        ]}
        availableTags={['React', 'TypeScript', 'NestJS', 'MVP', 'AI', 'Python', 'TensorFlow', '챗봇', 'React Native', 'UI/UX', '모바일', 'Next.js', 'Stripe', '결제', '쇼핑몰']}
      />

      {/* 프로젝트 지원 모달 */}
      {selectedProjectForApplication && (
        <ProjectApplicationModal
          isOpen={!!selectedProjectForApplication}
          onClose={() => setSelectedProjectForApplication(null)}
          project={selectedProjectForApplication}
          onApplicationSubmit={handleApplicationSubmit}
        />
      )}
    </div>
  );
}