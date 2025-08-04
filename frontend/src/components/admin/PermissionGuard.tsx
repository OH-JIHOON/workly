'use client';

import { ReactNode } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';

interface PermissionGuardProps {
  /**
   * 필요한 권한 목록
   * 배열로 전달하면 AND 조건 (모든 권한 필요)
   * 문자열로 전달하면 해당 권한만 확인
   */
  permissions: string | string[];
  
  /**
   * 권한 확인 모드
   * 'all': 모든 권한이 있어야 함 (기본값)
   * 'any': 하나 이상의 권한이 있으면 됨
   */
  mode?: 'all' | 'any';
  
  /**
   * 권한이 없을 때 보여줄 컴포넌트
   * 기본적으로 아무것도 렌더링하지 않음
   */
  fallback?: ReactNode;
  
  /**
   * 슈퍼 관리자는 모든 권한을 가진 것으로 처리할지 여부
   */
  allowSuperAdmin?: boolean;
  
  children: ReactNode;
}

/**
 * 사용자의 권한에 따라 컴포넌트를 조건부로 렌더링하는 가드 컴포넌트
 * 
 * @example
 * // 단일 권한 확인
 * <PermissionGuard permissions="admin:users:read">
 *   <UserList />
 * </PermissionGuard>
 * 
 * @example
 * // 여러 권한 확인 (모든 권한 필요)
 * <PermissionGuard permissions={["admin:users:read", "admin:users:update"]}>
 *   <UserEditForm />
 * </PermissionGuard>
 * 
 * @example
 * // 여러 권한 중 하나만 있으면 됨
 * <PermissionGuard 
 *   permissions={["admin:users:read", "admin:projects:read"]} 
 *   mode="any"
 * >
 *   <Dashboard />
 * </PermissionGuard>
 * 
 * @example
 * // 권한이 없을 때 대체 컴포넌트 표시
 * <PermissionGuard 
 *   permissions="admin:users:delete"
 *   fallback={<span className="text-gray-400">권한 없음</span>}
 * >
 *   <DeleteButton />
 * </PermissionGuard>
 */
export default function PermissionGuard({
  permissions,
  mode = 'all',
  fallback = null,
  allowSuperAdmin = true,
  children,
}: PermissionGuardProps) {
  const { user } = useAuthStore();

  // 로그인하지 않았거나 어드민 권한이 없는 경우
  if (!user || !user.adminRole) {
    return <>{fallback}</>;
  }

  // 슈퍼 관리자는 모든 권한을 가진 것으로 처리
  if (allowSuperAdmin && user.adminRole === 'super_admin') {
    return <>{children}</>;
  }

  // 권한 목록을 배열로 정규화
  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
  
  // 사용자의 권한 목록
  const userPermissions = user.adminPermissions || [];

  // 권한 확인 로직
  const hasPermission = mode === 'all'
    ? requiredPermissions.every(permission => userPermissions.includes(permission))
    : requiredPermissions.some(permission => userPermissions.includes(permission));

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

/**
 * 권한 확인을 위한 유틸리티 훅
 * 컴포넌트 내에서 권한을 확인해야 할 때 사용
 */
export function usePermissions() {
  const { user } = useAuthStore();

  const hasPermission = (
    permissions: string | string[],
    mode: 'all' | 'any' = 'all'
  ): boolean => {
    // 로그인하지 않았거나 어드민 권한이 없는 경우
    if (!user || !user.adminRole) {
      return false;
    }

    // 슈퍼 관리자는 모든 권한을 가진 것으로 처리
    if (user.adminRole === 'super_admin') {
      return true;
    }

    // 권한 목록을 배열로 정규화
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    
    // 사용자의 권한 목록
    const userPermissions = user.adminPermissions || [];

    // 권한 확인 로직
    return mode === 'all'
      ? requiredPermissions.every(permission => userPermissions.includes(permission))
      : requiredPermissions.some(permission => userPermissions.includes(permission));
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return hasPermission(permissions, 'any');
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return hasPermission(permissions, 'all');
  };

  const isAdmin = (): boolean => {
    return user?.adminRole !== undefined;
  };

  const isSuperAdmin = (): boolean => {
    return user?.adminRole === 'super_admin';
  };

  const getAdminRoleLabel = (): string => {
    switch (user?.adminRole) {
      case 'super_admin':
        return '슈퍼 관리자';
      case 'admin':
        return '관리자';
      case 'moderator':
        return '모더레이터';
      case 'support':
        return '지원팀';
      default:
        return '권한 없음';
    }
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isSuperAdmin,
    getAdminRoleLabel,
    adminRole: user?.adminRole,
    adminPermissions: user?.adminPermissions || [],
  };
}