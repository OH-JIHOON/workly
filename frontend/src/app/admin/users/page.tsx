'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  adminRole?: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
  emailVerifiedAt?: string;
}

interface UserFilters {
  search: string;
  role: string;
  adminRole: string;
  status: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    adminRole: '',
    status: '',
  });

  // 임시 데이터
  useEffect(() => {
    const fetchUsers = async () => {  
      try {
        // 실제로는 API 호출
        // const response = await fetch('/api/admin/users');
        // const data = await response.json();
        
        // 임시 데이터
        const mockUsers: User[] = [
          {
            id: '1',
            email: 'admin@workly.co',
            name: '시스템 관리자',
            role: 'ADMIN',
            adminRole: 'super_admin',
            status: 'ACTIVE',
            createdAt: '2024-01-01T00:00:00Z',
            lastLoginAt: '2024-01-15T10:30:00Z',
            emailVerifiedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: '2',
            email: 'user1@example.com',
            name: '김사용자',
            role: 'MEMBER',
            status: 'ACTIVE',
            createdAt: '2024-01-05T00:00:00Z',
            lastLoginAt: '2024-01-14T15:22:00Z',
            emailVerifiedAt: '2024-01-05T00:00:00Z',
          },
          {
            id: '3',
            email: 'user2@example.com',
            name: '이프로젝트',
            role: 'MANAGER',
            adminRole: 'moderator',
            status: 'ACTIVE',
            createdAt: '2024-01-08T00:00:00Z',
            lastLoginAt: '2024-01-13T09:15:00Z',
            emailVerifiedAt: '2024-01-08T00:00:00Z',
          },
          {
            id: '4',
            email: 'pending@example.com',
            name: '박대기자',
            role: 'MEMBER',
            status: 'PENDING_VERIFICATION',
            createdAt: '2024-01-12T00:00:00Z',
          },
        ];
        
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
      } catch (error) {
        console.error('사용자 데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // 필터링 효과
  useEffect(() => {
    let filtered = users;

    if (filters.search) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    if (filters.adminRole) {
      filtered = filtered.filter(user => user.adminRole === filters.adminRole);
    }

    if (filters.status) {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [filters, users]);

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      SUSPENDED: 'bg-red-100 text-red-800',
      PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-800',
    };
    
    const labels = {
      ACTIVE: '활성',
      INACTIVE: '비활성',
      SUSPENDED: '정지',
      PENDING_VERIFICATION: '이메일 인증 대기',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      ADMIN: 'bg-purple-100 text-purple-800',
      MANAGER: 'bg-blue-100 text-blue-800',
      MEMBER: 'bg-gray-100 text-gray-800',
    };
    
    const labels = {
      ADMIN: '관리자',
      MANAGER: '매니저',
      MEMBER: '일반 사용자',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[role as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
        {labels[role as keyof typeof labels] || role}
      </span>
    );
  };

  const getAdminRoleBadge = (adminRole?: string) => {
    if (!adminRole) return null;

    const badges = {
      super_admin: 'bg-red-100 text-red-800',
      admin: 'bg-orange-100 text-orange-800',
      moderator: 'bg-indigo-100 text-indigo-800',
      support: 'bg-teal-100 text-teal-800',
    };
    
    const labels = {
      super_admin: '슈퍼 관리자',
      admin: '어드민',
      moderator: '모더레이터',
      support: '지원팀',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[adminRole as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
        <ShieldCheckIcon className="w-3 h-3 mr-1" />
        {labels[adminRole as keyof typeof labels] || adminRole}
      </span>
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
        <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
        <p className="mt-1 text-sm text-gray-600">
          전체 사용자 목록을 확인하고 관리하세요
        </p>
      </div>

      {/* 필터 영역 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              검색
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="이름 또는 이메일 검색"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 역할 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사용자 역할
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">전체</option>
              <option value="ADMIN">관리자</option>
              <option value="MANAGER">매니저</option>
              <option value="MEMBER">일반 사용자</option>
            </select>
          </div>

          {/* 어드민 역할 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              어드민 권한
            </label>
            <select
              value={filters.adminRole}
              onChange={(e) => handleFilterChange('adminRole', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">전체</option>
              <option value="super_admin">슈퍼 관리자</option>
              <option value="admin">어드민</option>
              <option value="moderator">모더레이터</option>
              <option value="support">지원팀</option>
            </select>
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
              <option value="ACTIVE">활성</option>
              <option value="INACTIVE">비활성</option>
              <option value="SUSPENDED">정지</option>
              <option value="PENDING_VERIFICATION">이메일 인증 대기</option>
            </select>
          </div>
        </div>
      </div>

      {/* 사용자 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              사용자 목록 ({filteredUsers.length}명)
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사용자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  역할
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가입일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  마지막 로그인
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getRoleBadge(user.role)}
                      {user.adminRole && getAdminRoleBadge(user.adminRole)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.lastLoginAt 
                      ? new Date(user.lastLoginAt).toLocaleDateString('ko-KR')
                      : '없음'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {user.adminRole !== 'super_admin' && (
                        <button className="text-red-600 hover:text-red-900">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">사용자가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">필터 조건을 변경해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}