'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import PermissionGuard from './PermissionGuard';

interface AdminNavItemProps {
  /**
   * 링크 경로
   */
  href: string;
  
  /**
   * 필요한 권한
   */
  permissions: string | string[];
  
  /**
   * 권한 확인 모드
   */
  mode?: 'all' | 'any';
  
  /**
   * 아이콘 컴포넌트
   */
  icon?: React.ComponentType<{ className?: string }>;
  
  /**
   * 뱃지 표시 (알림 개수 등)
   */
  badge?: number | string;
  
  /**
   * 외부 링크 여부
   */
  external?: boolean;
  
  /**
   * 정확한 경로 매칭 여부 (기본: false)
   */
  exact?: boolean;
  
  children: ReactNode;
}

/**
 * 권한 기반 어드민 네비게이션 아이템 컴포넌트
 * 사용자의 권한에 따라 네비게이션 아이템을 표시/숨김 처리
 * 
 * @example
 * <AdminNavItem 
 *   href="/admin/users"
 *   permissions="admin:users:read"
 *   icon={UsersIcon}
 * >
 *   사용자 관리
 * </AdminNavItem>
 */
export default function AdminNavItem({
  href,
  permissions,
  mode = 'all',
  icon: Icon,
  badge,
  external = false,
  exact = false,
  children,
}: AdminNavItemProps) {
  const pathname = usePathname();
  
  // 활성 상태 확인
  const isActive = exact 
    ? pathname === href
    : pathname.startsWith(href);

  // 기본 스타일 클래스
  const baseClasses = [
    'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
    'transition-colors duration-200',
  ];

  // 활성/비활성 상태 클래스
  const stateClasses = isActive
    ? 'bg-indigo-100 text-indigo-700'
    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';

  // 최종 클래스 조합
  const linkClasses = [...baseClasses, stateClasses].join(' ');

  // 아이콘 클래스
  const iconClasses = [
    'mr-3 h-5 w-5',
    isActive 
      ? 'text-indigo-500' 
      : 'text-gray-400 group-hover:text-gray-500'
  ].join(' ');

  const linkContent = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center">
        {Icon && <Icon className={iconClasses} />}
        <span>{children}</span>
      </div>
      {badge && (
        <span className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium ${
          isActive 
            ? 'bg-indigo-200 text-indigo-800' 
            : 'bg-gray-200 text-gray-800'
        }`}>
          {badge}
        </span>
      )}
    </div>
  );

  const LinkComponent = external ? 'a' : Link;
  const linkProps = external 
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : { href };

  return (
    <PermissionGuard permissions={permissions} mode={mode}>
      <LinkComponent {...linkProps} className={linkClasses}>
        {linkContent}
      </LinkComponent>
    </PermissionGuard>
  );
}

/**
 * 어드민 네비게이션 그룹 컴포넌트
 * 관련된 네비게이션 아이템들을 그룹화
 */
interface AdminNavGroupProps {
  /**
   * 그룹 제목
   */
  title: string;
  
  /**
   * 그룹 전체에 적용할 권한 (선택적)
   */
  permissions?: string | string[];
  
  /**
   * 권한 확인 모드
   */
  mode?: 'all' | 'any';
  
  /**
   * 접힐 수 있는 그룹 여부
   */
  collapsible?: boolean;
  
  /**
   * 초기 접힘 상태 (collapsible이 true일 때만 적용)
   */
  defaultCollapsed?: boolean;
  
  children: ReactNode;
}

export function AdminNavGroup({
  title,
  permissions,
  mode = 'all',
  collapsible = false,
  defaultCollapsed = false,
  children,
}: AdminNavGroupProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const groupContent = (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </h3>
        {collapsible && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <svg
              className={`h-4 w-4 transform transition-transform ${
                isCollapsed ? 'rotate-0' : 'rotate-180'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
      </div>
      {(!collapsible || !isCollapsed) && (
        <div className="space-y-1">
          {children}
        </div>
      )}
    </div>
  );

  return permissions ? (
    <PermissionGuard permissions={permissions} mode={mode}>
      {groupContent}
    </PermissionGuard>
  ) : (
    groupContent
  );
}

// React import for useState
import React from 'react';