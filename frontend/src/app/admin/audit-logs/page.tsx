'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId?: string;
  targetName?: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}

interface AuditFilters {
  search: string;
  adminId: string;
  action: string;
  targetType: string;
  success: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export default function AuditLogsManagement() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters>({
    search: '',
    adminId: '',
    action: '',
    targetType: '',
    success: '',
    dateRange: {
      start: '',
      end: '',
    },
  });

  // 임시 데이터
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        // 실제로는 API 호출
        // const response = await fetch('/api/admin/audit-logs');
        // const data = await response.json();
        
        // 임시 데이터
        const mockLogs: AuditLog[] = [
          {
            id: '1',
            adminId: '1',
            adminName: '시스템 관리자',
            action: '사용자 역할 변경',
            targetType: 'user',
            targetId: '2',
            targetName: '김사용자',
            changes: {
              before: { role: 'MEMBER' },
              after: { role: 'MANAGER' },
            },
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            timestamp: '2024-01-15T10:30:00Z',
            success: true,
          },
          {
            id: '2',
            adminId: '2',
            adminName: '이관리자',
            action: '프로젝트 삭제',
            targetType: 'project',
            targetId: '5',
            targetName: '테스트 프로젝트',
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            timestamp: '2024-01-15T09:15:00Z',
            success: true,
          },
          {
            id: '3',
            adminId: '1',
            adminName: '시스템 관리자',
            action: '시스템 설정 변경',
            targetType: 'settings',
            changes: {
              before: { maintenanceMode: false },
              after: { maintenanceMode: true },
            },
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            timestamp: '2024-01-15T08:45:00Z',
            success: false,
            errorMessage: '권한이 부족합니다',
          },
          {
            id: '4',
            adminId: '3',
            adminName: '박모더레이터',
            action: '대시보드 조회',
            targetType: 'system',
            ipAddress: '192.168.1.102',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
            timestamp: '2024-01-15T07:20:00Z',
            success: true,
          },
          {
            id: '5',
            adminId: '1',
            adminName: '시스템 관리자',
            action: '사용자 계정 정지',
            targetType: 'user',
            targetId: '10',
            targetName: '스팸사용자',
            changes: {
              before: { status: 'ACTIVE' },
              after: { status: 'SUSPENDED' },
            },
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            timestamp: '2024-01-14T16:30:00Z',
            success: true,
          },
        ];
        
        setAuditLogs(mockLogs);
        setFilteredLogs(mockLogs);
      } catch (error) {
        console.error('감사 로그 데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  // 필터링 효과
  useEffect(() => {
    let filtered = auditLogs;

    if (filters.search) {
      filtered = filtered.filter(log =>
        log.adminName.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.action.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.targetName?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.adminId) {
      filtered = filtered.filter(log => log.adminId === filters.adminId);
    }

    if (filters.action) {
      filtered = filtered.filter(log => log.action.includes(filters.action));
    }

    if (filters.targetType) {
      filtered = filtered.filter(log => log.targetType === filters.targetType);
    }

    if (filters.success !== '') {
      filtered = filtered.filter(log => log.success.toString() === filters.success);
    }

    if (filters.dateRange.start) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) >= new Date(filters.dateRange.start)
      );
    }

    if (filters.dateRange.end) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) <= new Date(filters.dateRange.end)
      );
    }

    setFilteredLogs(filtered);
  }, [filters, auditLogs]);

  const handleFilterChange = (key: string, value: string) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setFilters(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof AuditFilters] as any),
          [child]: value,
        },
      }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const getSuccessBadge = (success: boolean) => {
    return success ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircleIcon className="w-3 h-3 mr-1" />
        성공
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircleIcon className="w-3 h-3 mr-1" />
        실패
      </span>
    );
  };

  const getTargetTypeBadge = (targetType: string) => {
    const badges = {
      user: 'bg-blue-100 text-blue-800',
      project: 'bg-purple-100 text-purple-800',
      task: 'bg-orange-100 text-orange-800',
      settings: 'bg-gray-100 text-gray-800',
      system: 'bg-indigo-100 text-indigo-800',
    };
    
    const labels = {
      user: '사용자',
      project: '프로젝트',
      task: '업무',
      settings: '설정',
      system: '시스템',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[targetType as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
        {labels[targetType as keyof typeof labels] || targetType}
      </span>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',  
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <h1 className="text-2xl font-bold text-gray-900">감사 로그</h1>
        <p className="mt-1 text-sm text-gray-600">
          관리자 활동 기록을 확인하고 감사하세요
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">총 로그</p>
              <p className="text-2xl font-bold text-gray-900">{auditLogs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">성공</p>
              <p className="text-2xl font-bold text-gray-900">
                {auditLogs.filter(log => log.success).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">실패</p>
              <p className="text-2xl font-bold text-gray-900">
                {auditLogs.filter(log => !log.success).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {new Set(auditLogs.map(log => log.adminId)).size}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">활성 관리자</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(auditLogs.map(log => log.adminId)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 영역 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 검색 */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              검색
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="관리자명, 액션, 대상 검색"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 대상 유형 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              대상 유형
            </label>
            <select
              value={filters.targetType}
              onChange={(e) => handleFilterChange('targetType', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">전체</option>
              <option value="user">사용자</option>
              <option value="project">프로젝트</option>
              <option value="task">업무</option>
              <option value="settings">설정</option>
              <option value="system">시스템</option>
            </select>
          </div>

          {/* 성공/실패 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              결과
            </label>
            <select
              value={filters.success}
              onChange={(e) => handleFilterChange('success', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">전체</option>
              <option value="true">성공</option>
              <option value="false">실패</option>
            </select>
          </div>

          {/* 시작 날짜 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시작 날짜
            </label>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleFilterChange('dateRange.start', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* 종료 날짜 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              종료 날짜
            </label>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleFilterChange('dateRange.end', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* 감사 로그 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              감사 로그 ({filteredLogs.length}개)
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  대상
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  결과
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP 주소
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.adminName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{log.action}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getTargetTypeBadge(log.targetType)}
                      {log.targetName && (
                        <div className="text-xs text-gray-500">{log.targetName}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getSuccessBadge(log.success)}
                      {log.errorMessage && (
                        <div className="text-xs text-red-600">{log.errorMessage}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">로그가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">필터 조건을 변경해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}