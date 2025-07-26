'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Grid3X3, List, Calendar, Folder, Users, BarChart3 } from 'lucide-react';
import Header from '@/components/layout/Header';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { apiClient } from '@/lib/api';
import { 
  Project, 
  CreateProjectDto, 
  ProjectQueryDto, 
  PaginatedResponse,
  ProjectStatus,
  ProjectPriority
} from '@/types/project.types';

// 프로젝트 카드 컴포넌트
function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: project.color || '#3B82F6' }}
          >
            {project.icon || project.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{project.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
          </div>
        </div>
      </div>

      {/* 진행률 */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">진행률</span>
          <span className="font-medium">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* 메타데이터 */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4 text-gray-500">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{project.memberCount}</span>
          </div>
          <div className="flex items-center space-x-1">
            <BarChart3 className="w-4 h-4" />
            <span>{project.taskCount}</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          project.status === 'active' ? 'bg-green-100 text-green-800' :
          project.status === 'planning' ? 'bg-blue-100 text-blue-800' :
          project.status === 'completed' ? 'bg-gray-100 text-gray-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {project.status === 'active' ? '진행중' :
           project.status === 'planning' ? '계획중' :
           project.status === 'completed' ? '완료' : '일시중단'}
        </div>
      </div>

      {/* 태그 */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {project.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// 간단한 프로젝트 생성 모달
function ProjectCreationModal({ 
  isOpen, 
  onClose, 
  onSubmit 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: CreateProjectDto) => Promise<void>; 
}) {
  const [formData, setFormData] = useState<CreateProjectDto>({
    name: '',
    description: '',
    priority: ProjectPriority.MEDIUM,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ name: '', description: '', priority: ProjectPriority.MEDIUM });
      onClose();
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black opacity-25" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-semibold mb-4">새 프로젝트 만들기</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  프로젝트 이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="프로젝트 이름을 입력하세요"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="프로젝트에 대한 간단한 설명"
                  rows={3}
                />
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

            <div className="flex space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? '생성 중...' : '프로젝트 만들기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('전체 프로젝트');

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

      const queryParams: ProjectQueryDto = {
        page: 1,
        limit: 50,
        search: debouncedSearchQuery || undefined,
      };

      // 필터에 따른 쿼리 추가
      if (currentFilter === '내 프로젝트') {
        // API에서 내 프로젝트만 필터링하는 로직 필요
      } else if (currentFilter === '진행 중') {
        queryParams.status = ProjectStatus.ACTIVE;
      } else if (currentFilter === '완료됨') {
        queryParams.status = ProjectStatus.COMPLETED;
      }

      const response = await apiClient.get<PaginatedResponse<Project>>('/projects', queryParams);
      // API 응답에 items가 없는 경우를 대비해 항상 배열을 보장합니다.
      setProjects(response.items || []);

    } catch (err) {
      console.error('프로젝트 로드 실패:', err);
      setError('프로젝트를 불러오는데 실패했습니다.');
      setProjects([]); // 오류 발생 시 프로젝트 목록을 안전하게 비웁니다.
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (projectData: CreateProjectDto) => {
    try {
      await apiClient.post<Project>('/projects', projectData);
      await loadProjects(); // 프로젝트 목록 새로고침
    } catch (err) {
      console.error('프로젝트 생성 실패:', err);
      throw err;
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
        title="프로젝트" 
        showDropdown={true}
        dropdownItems={['전체 프로젝트', '내 프로젝트', '진행 중', '완료됨']}
        onDropdownChange={handleFilterChange}
      />
      
      {/* 메인 콘텐츠 */}
      <main className="max-w-[640px] mx-auto px-6 py-6 pb-20 md:pb-6">
        {/* 검색 */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="프로젝트 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 오류 표시 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
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
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? '검색 결과 없음' : '프로젝트 없음'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? '검색 조건에 맞는 프로젝트가 없습니다.' 
                : '첫 번째 프로젝트를 만들어보세요!'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsCreationModalOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>프로젝트 만들기</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onClick={() => router.push(`/projects/${project.id}`)}
              />
            ))}
          </div>
        )}
      </main>
      
      {/* 플로팅 액션 버튼 */}
      <FloatingActionButton 
        onClick={() => setIsCreationModalOpen(true)}
        icon={<Plus className="w-6 h-6" />}
        label="새 프로젝트"
      />

      {/* 프로젝트 생성 모달 */}
      <ProjectCreationModal
        isOpen={isCreationModalOpen}
        onClose={() => setIsCreationModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}