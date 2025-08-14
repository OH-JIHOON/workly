'use client';

import React, { useEffect } from 'react';
import type { Work, WorkStatus } from '@/types/work.types';
import { Card } from '@/components/ui/Card';
import { useWorks } from '@/hooks/useWorks';
import { useAuth } from '@/lib/stores/auth.store';

interface WorkListProps {
  worksState: ReturnType<typeof useWorks>;
}

export function WorkList({ worksState }: WorkListProps) {
  const { works, loading, error, fetchWorks, updateWorkStatus } = worksState;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchWorks({});
    }
  }, [isAuthenticated, authLoading, fetchWorks]);

  const handleStatusChange = (id: string, status: WorkStatus) => {
    updateWorkStatus(id, status);
  };

  // 인증 로딩 중
  if (authLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">인증 확인 중...</div>
      </div>
    );
  }

  // 인증되지 않음
  if (!isAuthenticated) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-semibold mb-2">로그인이 필요합니다</h3>
        <p className="text-gray-600 mb-4">워크를 관리하려면 먼저 로그인해주세요.</p>
      </div>
    );
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  // 에러
  if (error) {
    return (
      <div className="text-center p-8">
        <h3 className="text-red-800 font-medium mb-2">오류가 발생했습니다</h3>
        <p className="text-red-600 text-sm mb-3">{error}</p>
        <button
          onClick={() => fetchWorks({})}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 워크가 없음
  if (works.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-semibold mb-2">워크가 없습니다</h3>
        <p className="text-gray-600">아래 입력창에서 첫 번째 워크를 생성해보세요!</p>
      </div>
    );
  }

  // 워크 목록
  return (
    <div className="space-y-3">
      {works.map((work) => (
        <WorkCard
          key={work.id}
          work={work}
          onStatusChange={handleStatusChange}
          onClick={(work) => console.log('Work clicked:', work)}
        />
      ))}
    </div>
  );
}

// 간단한 워크 카드
function WorkCard({ work, onStatusChange, onClick }: {
  work: Work;
  onStatusChange?: (id: string, status: WorkStatus) => void;
  onClick?: (work: Work) => void;
}) {
  const getStatusColor = (status: WorkStatus) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: WorkStatus) => {
    switch (status) {
      case 'todo': return '할 일';
      case 'in-progress': return '진행중';
      case 'completed': return '완료';
      default: return status;
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as WorkStatus;
    onStatusChange?.(work.id, newStatus);
  };

  return (
    <Card
      className={`
        p-4 transition-all duration-200 hover:shadow-md
        ${onClick ? 'cursor-pointer' : ''}
        ${work.status === 'completed' ? 'opacity-60' : ''}
      `}
      onClick={() => onClick?.(work)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-gray-900 truncate ${work.status === 'completed' ? 'line-through' : ''}`}>
            {work.title}
          </h3>
          {work.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-1">
              {work.description}
            </p>
          )}
        </div>
        
        {/* Status */}
        {onStatusChange ? (
          <select
            value={work.status}
            onChange={handleStatusChange}
            onClick={(e) => e.stopPropagation()}
            className={`text-xs px-3 py-1 rounded-full border-none outline-none ${getStatusColor(work.status)}`}
          >
            <option value="todo">할 일</option>
            <option value="in-progress">진행중</option>
            <option value="completed">완료</option>
          </select>
        ) : (
          <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(work.status)}`}>
            {getStatusLabel(work.status)}
          </span>
        )}
      </div>
    </Card>
  );
}