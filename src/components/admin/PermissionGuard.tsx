'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/lib/stores/auth.store'; // Corrected Import
import { ROLE_PERMISSION_GROUPS } from '@/components/admin'; // New Import
import { UserProfile } from '@/lib/stores/auth.store'; // New Import for UserProfile type
import { asymmetricAuth, type AuthClaims } from '@/lib/auth/asymmetric-auth';

// Helper function to get user's permissions based on their admin_role
const getUserPermissions = (user: UserProfile | null): string[] => {
  if (!user || !user.admin_role) {
    return [];
  }
  // Ensure the role exists in ROLE_PERMISSION_GROUPS
  const roleKey = user.admin_role.toUpperCase() as keyof typeof ROLE_PERMISSION_GROUPS;
  return [...(ROLE_PERMISSION_GROUPS[roleKey] || [])];
};

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
  const { user, authClaims } = useSupabaseAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const verifyPermissions = async () => {
      try {
        console.log('🔒 PermissionGuard 비대칭 권한 검증 시작');
        
        // 비대칭 인증 검증
        const verificationResult = await asymmetricAuth.verifyClientToken();
        
        if (!mounted) return;
        
        if (!verificationResult.success || !verificationResult.claims) {
          console.log('❌ 인증 검증 실패, 권한 없음 처리');
          setIsAuthorized(false);
          setIsVerifying(false);
          return;
        }

        const claims = verificationResult.claims;
        
        // 관리자 권한 확인 (store의 user 데이터와 claims 모두 확인)
        const isAdminFromClaims = asymmetricAuth.isAdmin(claims);
        const isAdminFromUser = user?.admin_role !== undefined;
        
        if (!isAdminFromClaims && !isAdminFromUser) {
          console.log('❌ 관리자 권한 없음');
          setIsAuthorized(false);
          setIsVerifying(false);
          return;
        }

        // 슈퍼 관리자 확인
        const isSuperAdminFromClaims = claims.app_metadata?.admin_role === 'super_admin';
        const isSuperAdminFromUser = user?.admin_role === 'super_admin';
        
        if (allowSuperAdmin && (isSuperAdminFromClaims || isSuperAdminFromUser)) {
          console.log('✅ 슈퍼 관리자 권한으로 모든 접근 허용');
          setIsAuthorized(true);
          setIsVerifying(false);
          return;
        }

        // 권한 목록을 배열로 정규화
        const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
        
        // 사용자의 권한 목록 (user 데이터 기준)
        const userPermissions = getUserPermissions(user);

        // 권한 확인 로직
        const hasRequiredPermission = mode === 'all'
          ? requiredPermissions.every(permission => userPermissions.includes(permission))
          : requiredPermissions.some(permission => userPermissions.includes(permission));

        console.log('🔍 권한 검증 결과:', {
          requiredPermissions,
          userPermissions,
          mode,
          hasRequiredPermission,
          userId: claims.sub,
          adminRole: user?.admin_role || claims.app_metadata?.admin_role
        });

        setIsAuthorized(hasRequiredPermission);
        setIsVerifying(false);

      } catch (error) {
        console.error('권한 검증 오류:', error);
        if (mounted) {
          setIsAuthorized(false);
          setIsVerifying(false);
        }
      }
    };

    verifyPermissions();

    return () => {
      mounted = false;
    };
  }, [user, authClaims, permissions, mode, allowSuperAdmin]);

  // 검증 중일 때는 로딩 상태 표시 (또는 fallback)
  if (isVerifying) {
    return <>{fallback}</>;
  }

  return isAuthorized ? <>{children}</> : <>{fallback}</>;
}

/**
 * 권한 확인을 위한 유틸리티 훅 (비대칭 인증 검증 적용)
 * 컴포넌트 내에서 권한을 확인해야 할 때 사용
 */
export function usePermissions() {
  const { user, authClaims } = useSupabaseAuth();
  const [verifiedClaims, setVerifiedClaims] = useState<AuthClaims | null>(null);

  useEffect(() => {
    let mounted = true;

    const verifyClaims = async () => {
      try {
        const verificationResult = await asymmetricAuth.verifyClientToken();
        if (mounted && verificationResult.success && verificationResult.claims) {
          setVerifiedClaims(verificationResult.claims);
        } else if (mounted) {
          setVerifiedClaims(null);
        }
      } catch (error) {
        console.error('권한 검증 오류:', error);
        if (mounted) {
          setVerifiedClaims(null);
        }
      }
    };

    verifyClaims();

    return () => {
      mounted = false;
    };
  }, [user, authClaims]);

  const hasPermission = (
    permissions: string | string[],
    mode: 'all' | 'any' = 'all'
  ): boolean => {
    // 비대칭 검증된 클레임이 없거나 사용자가 없는 경우
    if (!verifiedClaims || !user || !user.admin_role) {
      return false;
    }

    // 슈퍼 관리자는 모든 권한을 가진 것으로 처리
    const isSuperAdminFromClaims = verifiedClaims.app_metadata?.admin_role === 'super_admin';
    const isSuperAdminFromUser = user.admin_role === 'super_admin';
    
    if (isSuperAdminFromClaims || isSuperAdminFromUser) {
      return true;
    }

    // 권한 목록을 배열로 정규화
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    
    // 사용자의 권한 목록 (새로운 로직)
    const userPermissions = getUserPermissions(user);

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
    if (!verifiedClaims || !user) return false;
    
    const isAdminFromClaims = asymmetricAuth.isAdmin(verifiedClaims);
    const isAdminFromUser = user?.admin_role !== undefined;
    
    return isAdminFromClaims || isAdminFromUser;
  };

  const isSuperAdmin = (): boolean => {
    if (!verifiedClaims || !user) return false;
    
    const isSuperAdminFromClaims = verifiedClaims.app_metadata?.admin_role === 'super_admin';
    const isSuperAdminFromUser = user?.admin_role === 'super_admin';
    
    return isSuperAdminFromClaims || isSuperAdminFromUser;
  };

  const getAdminRoleLabel = (): string => {
    const adminRole = user?.admin_role || verifiedClaims?.app_metadata?.admin_role;
    
    switch (adminRole) {
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

  const isVerified = (): boolean => {
    return verifiedClaims !== null;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isSuperAdmin,
    getAdminRoleLabel,
    isVerified,
    adminRole: user?.admin_role || verifiedClaims?.app_metadata?.admin_role,
    adminPermissions: getUserPermissions(user),
    verificationStatus: verifiedClaims ? 'verified' : 'unverified'
  };
}