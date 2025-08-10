'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  FolderIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  ownerName: string;
}

interface ProjectFilters {
  search: string;
  status: string;
}

export default function ProjectsManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    status: '',
  });

  // 임시 데이터
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // 실제로는 API 호출
        
        // const data = await response.json();
        
        // 임시 데이터
        const mockProjects: Project[] = [
          {
            id: '1',
            name: '워클리 웹 플랫폼 개발',
            description: 'CPER 워크플로우 기반 업무 관리 플랫폼',
            status: 'IN_PROGRESS',
            progress: 75,
            memberCount: 5,
            taskCount: 32,
            completedTaskCount: 24,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
            ownerId: '1',
            ownerName: '김프로젝트',
          },
          {
            id: '2',
            name: '모바일 앱 리뉴얼',
            description: '사용자 경험 개선을 위한 UI/UX 리뉴얼',
            status: 'COMPLETED',
            progress: 100,
            memberCount: 3,
            taskCount: 18,
            completedTaskCount: 18,
            createdAt: '2023-12-01T00:00:00Z',
            updatedAt: '2024-01-10T15:22:00Z',
            ownerId: '2',
            ownerName: '이디자인',
          },
          {
            id: '3',
            name: '데이터 마이그레이션',
            description: '레거시 시스템에서 새 플랫폼으로 데이터 이전',
            status: 'PLANNING',
            progress: 25,
            memberCount: 2,
            taskCount: 8,
            completedTaskCount: 2,
            createdAt: '2024-01-10T00:00:00Z',
            updatedAt: '2024-01-14T09:15:00Z',
            ownerId: '3',
            ownerName: '박데이터',
          },
          {
            id: '4',
            name: '보안 강화 프로젝트',
            description: '시스템 보안 취약점 점검 및 개선',
            status: 'ON_HOLD',
            progress: 10,
            memberCount: 4,
            taskCount: 15,
            completedTaskCount: 1,
            createdAt: '2023-12-15T00:00:00Z',
            updatedAt: '2024-01-05T12:00:00Z',
            ownerId: '4',
            ownerName: '최보안',
          },
        ];
        
        setProjects(mockProjects);
        setFilteredProjects(mockProjects);
      } catch (error) {
        console.error('프로젝트 데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // 필터링 효과
  useEffect(() => {
    let filtered = projects;

    if (filters.search) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.ownerName.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    setFilteredProjects(filtered);
  }, [filters, projects]);

  const handleFilterChange = (key: keyof ProjectFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PLANNING: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      ON_HOLD: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    
    const labels = {
      PLANNING: '계획중',
      IN_PROGRESS: '진행중',
      COMPLETED: '완료',
      ON_HOLD: '보류',
      CANCELLED: '취소',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getProgressBar = (progress: number) => {
    const colorClass = progress === 100 ? 'bg-green-500' : progress >= 75 ? 'bg-blue-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-gray-500';
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClass}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">프로젝트 관리</h1>
        <p className="mt-1 text-sm text-gray-600">
          전체 프로젝트 목록을 확인하고 관리하세요
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FolderIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">전체 프로젝트</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {projects.filter(p => p.status === 'IN_PROGRESS').length}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">진행중</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.status === 'IN_PROGRESS').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {projects.filter(p => p.status === 'COMPLETED').length}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">완료</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">평균 팀원 수</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.memberCount, 0) / projects.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 영역 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              검색
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="프로젝트명, 설명, 소유자 검색"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 상태 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상태
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">전체</option>
              <option value="PLANNING">계획중</option>
              <option value="IN_PROGRESS">진행중</option>
              <option value="COMPLETED">완료</option>
              <option value="ON_HOLD">보류</option>
              <option value="CANCELLED">취소</option>
            </select>
          </div>
        </div>
      </div>

      {/* 프로젝트 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              프로젝트 목록 ({filteredProjects.length}개)
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  프로젝트
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  소유자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  진행률
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  팀/업무
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  생성일
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      {project.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {project.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{project.ownerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(project.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 mr-2">
                        {getProgressBar(project.progress)}
                      </div>
                      <span className="text-sm text-gray-900">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                        {project.memberCount}
                      </div>
                      <div className="flex items-center">
                        <ClipboardDocumentListIcon className="h-4 w-4 text-gray-400 mr-1" />
                        {project.completedTaskCount}/{project.taskCount}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(project.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">프로젝트가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">필터 조건을 변경해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}