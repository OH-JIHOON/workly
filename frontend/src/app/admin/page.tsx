'use client';

import { useEffect, useState } from 'react';
import { 
  UsersIcon, 
  FolderIcon, 
  ClipboardDocumentListIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  activeUsersCount: number;
  completedTasksCount: number;
  completionRate: number;
}

interface AdminInfo {
  id: string;
  name: string;
  role: string;
  permissions: string[];
  lastAdminLogin?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 실제로는 API 호출
        // const response = await fetch('/api/admin/dashboard');
        // const data = await response.json();
        
        // 임시 데이터
        setStats({
          totalUsers: 1250,
          totalProjects: 89,
          totalTasks: 456,
          activeUsersCount: 234,
          completedTasksCount: 312,
          completionRate: 68.4,
        });

        setAdminInfo({
          id: '1',
          name: '관리자',
          role: 'super_admin',
          permissions: ['admin:dashboard:read'],
          lastAdminLogin: new Date().toISOString(),
        });
      } catch (error) {
        console.error('대시보드 데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: '전체 사용자',
      value: stats?.totalUsers.toLocaleString() || '0',
      icon: UsersIcon,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive',
    },
    {
      name: '활성 사용자',
      value: stats?.activeUsersCount.toLocaleString() || '0',
      icon: UsersIcon,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive',
    },
    {
      name: '전체 프로젝트',
      value: stats?.totalProjects.toLocaleString() || '0',
      icon: FolderIcon,
      color: 'bg-purple-500',
      change: '+5%',
      changeType: 'positive',
    },
    {
      name: '전체 업무',
      value: stats?.totalTasks.toLocaleString() || '0',
      icon: ClipboardDocumentListIcon,
      color: 'bg-orange-500',
      change: '+15%',
      changeType: 'positive',
    },
    {
      name: '완료된 업무',
      value: stats?.completedTasksCount.toLocaleString() || '0',
      icon: CheckCircleIcon,
      color: 'bg-teal-500',
      change: '+22%',
      changeType: 'positive',
    },
    {
      name: '완료율',
      value: `${stats?.completionRate.toFixed(1)}%` || '0%',
      icon: CheckCircleIcon,
      color: 'bg-indigo-500',
      change: '+3%',
      changeType: 'positive',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">어드민 대시보드</h1>
        <p className="mt-1 text-sm text-gray-600">
          워클리 시스템 전반의 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* 관리자 정보 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">관리자 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">이름</p>
            <p className="font-medium text-gray-900">{adminInfo?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">역할</p>
            <p className="font-medium text-gray-900">
              {adminInfo?.role === 'super_admin' && '슈퍼 관리자'}
              {adminInfo?.role === 'admin' && '관리자'}
              {adminInfo?.role === 'moderator' && '모더레이터'}
              {adminInfo?.role === 'support' && '지원팀'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">권한 수</p>
            <p className="font-medium text-gray-900">{adminInfo?.permissions.length}개</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">마지막 관리자 로그인</p>
            <p className="font-medium text-gray-900">
              {adminInfo?.lastAdminLogin ? 
                new Date(adminInfo.lastAdminLogin).toLocaleString('ko-KR') : 
                '정보 없음'
              }
            </p>
          </div>
        </div>
      </div>

      {/* 주요 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-full`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">지난 주 대비</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 빠른 작업 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <UsersIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">사용자 관리</span>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <FolderIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">프로젝트 관리</span>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <ClipboardDocumentListIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">감사 로그</span>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <svg className="h-8 w-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">시스템 설정</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}