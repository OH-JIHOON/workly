'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSupabaseAuth } from '@/lib/stores/auth.store';
import { 
  HomeIcon, 
  UsersIcon, 
  FolderIcon, 
  Cog6ToothIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { AdminNavItem, ADMIN_PERMISSIONS } from '@/components/admin';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, isLoading, initialize } = useSupabaseAuth();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // 로딩 중이거나 인증 상태를 확인하는 중
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // 어드민 권한이 없는 경우
  if (!user?.admin_role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-4">어드민 패널에 접근하려면 관리자 권한이 필요합니다.</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const navigationItems = [
    {
      name: '대시보드',
      href: '/admin',
      icon: HomeIcon,
      permissions: ADMIN_PERMISSIONS.DASHBOARD_READ,
      exact: true,
    },
    {
      name: '사용자 관리',
      href: '/admin/users',
      icon: UsersIcon,
      permissions: ADMIN_PERMISSIONS.USERS_READ,
    },
    {
      name: '프로젝트 관리',
      href: '/admin/projects',
      icon: FolderIcon,
      permissions: ADMIN_PERMISSIONS.PROJECTS_READ,
    },
    {
      name: '통계 분석',
      href: '/admin/analytics',
      icon: ChartBarIcon,
      permissions: ADMIN_PERMISSIONS.DASHBOARD_READ,
    },
    {
      name: '감사 로그',
      href: '/admin/audit-logs',
      icon: DocumentTextIcon,
      permissions: ADMIN_PERMISSIONS.AUDIT_READ,
    },
    {
      name: '시스템 설정',
      href: '/admin/settings',
      icon: Cog6ToothIcon,
      permissions: ADMIN_PERMISSIONS.SETTINGS_READ,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        {/* 로고 영역 */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">워클리 어드민</span>
          </div>
        </div>

        {/* 관리자 정보 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.first_name?.charAt(0) || 'A'}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{`${user?.first_name} ${user?.last_name}`}</p>
              <p className="text-xs text-gray-500">
                {user?.admin_role === 'super_admin' && '슈퍼 관리자'}
                {user?.admin_role === 'admin' && '관리자'}
                {user?.admin_role === 'moderator' && '모더레이터'}
                {user?.admin_role === 'support' && '지원팀'}
              </p>
            </div>
          </div>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="mt-4 px-4 space-y-2">
          {navigationItems.map((item, index) => (
            <AdminNavItem
              key={index}
              href={item.href}
              permissions={item.permissions}
              icon={item.icon}
              exact={item.exact}
            >
              {item.name}
            </AdminNavItem>
          ))}
        </nav>

        {/* 하단 로그아웃 */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button
            onClick={() => {
              // 로그아웃 로직
              router.push('/');
            }}
            className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <span>메인으로 돌아가기</span>
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="pl-64">
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}