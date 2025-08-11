/**
 * Authentication utilities and helper functions (비대칭 암호화 적용)
 * Re-exports from auth store for backward compatibility
 */

// Re-export everything from auth.store for backward compatibility
export { useAuthStore, type AuthState, type UserProfile, getCurrentUser, isAuthenticated } from './stores/auth.store'

// 비대칭 인증 모듈 re-export
export { 
  asymmetricAuth, 
  verifyAuth, 
  getCurrentAuthClaims, 
  requireAuth, 
  requireRole,
  type AuthClaims,
  type AuthVerificationResult
} from './auth/asymmetric-auth'

// 서버 인증 헬퍼 타입만 export (동적 import 사용)
export type { ServerAuthResult } from './auth/server-auth-helpers'

// 서버 전용 함수들은 동적 import로 사용
export const getServerAuthHelpers = async () => {
  // 서버 환경에서만 import
  if (typeof window === 'undefined') {
    return await import('./auth/server-auth-helpers');
  }
  throw new Error('서버 인증 헬퍼는 서버 환경에서만 사용 가능합니다');
}

// 업데이트된 인증 API re-export
export { auth } from './api/auth.api'

// Additional helper functions for authentication (비대칭 검증 적용)
export const getUserRole = async (user?: any): Promise<string> => {
  if (user) {
    return user?.role || user?.user_metadata?.role || 'member'
  }
  
  // 현재 인증된 사용자의 역할 확인 (비대칭 검증)
  const claims = await getCurrentAuthClaims()
  return claims?.role || claims?.user_metadata?.role || 'member'
}

export const isAdmin = async (user?: any): Promise<boolean> => {
  if (user) {
    return user?.role === 'admin' || 
           user?.user_metadata?.role === 'admin' ||
           user?.admin_role === 'super_admin' ||
           user?.app_metadata?.admin_role === 'super_admin'
  }
  
  // 현재 인증된 사용자의 관리자 권한 확인 (비대칭 검증)
  const claims = await getCurrentAuthClaims()
  if (!claims) return false
  
  return asymmetricAuth.isAdmin(claims)
}

// 권한 확인 헬퍼 함수
export const hasPermission = async (requiredRole: string, user?: any): Promise<boolean> => {
  if (user) {
    const userRole = user?.role || user?.user_metadata?.role || 'member'
    
    const roleHierarchy: { [key: string]: number } = {
      'member': 1,
      'manager': 2,
      'admin': 3,
      'super_admin': 4
    }

    const userLevel = roleHierarchy[userRole] || 0
    const requiredLevel = roleHierarchy[requiredRole] || 0

    return userLevel >= requiredLevel
  }
  
  // 현재 인증된 사용자의 권한 확인 (비대칭 검증)
  const claims = await getCurrentAuthClaims()
  if (!claims) return false
  
  return asymmetricAuth.hasPermission(claims, requiredRole)
}

// 토큰 상태 확인 헬퍼 함수들
export const isTokenExpired = async (): Promise<boolean> => {
  const claims = await getCurrentAuthClaims()
  if (!claims) return true
  
  return asymmetricAuth.isTokenExpired(claims)
}

export const needsTokenRefresh = async (): Promise<boolean> => {
  const claims = await getCurrentAuthClaims()
  if (!claims) return true
  
  return asymmetricAuth.needsRefresh(claims)
}

// Legacy API client initialization (deprecated)
export const initializeApiClients = () => {
  console.warn('initializeApiClients is deprecated - API clients are auto-initialized with asymmetric auth')
  return Promise.resolve()
}

// Logout function (비대칭 세션 정리 포함)
export const logout = async () => {
  console.log('🚪 로그아웃 실행 (비대칭 세션 정리)')
  
  try {
    const { useAuthStore } = await import('@/lib/stores/auth.store')
    const { signOut } = useAuthStore.getState()
    return await signOut()
  } catch (error) {
    console.error('로그아웃 오류:', error)
    throw error
  }
}

// 비대칭 인증 상태 확인
export const verifyCurrentAuth = async (): Promise<AuthVerificationResult> => {
  return await verifyAuth(false) // 클라이언트 측 검증
}

// 서버 사이드 인증 상태 확인 (서버 환경에서만 사용)
export const verifyServerAuth = async (): Promise<AuthVerificationResult> => {
  if (typeof window !== 'undefined') {
    throw new Error('verifyServerAuth는 서버 환경에서만 사용 가능합니다');
  }
  return await verifyAuth(true) // 서버 측 검증
}

// 편의 함수: 서버 인증이 필요한 경우
export const requireServerAuth = async () => {
  if (typeof window !== 'undefined') {
    throw new Error('requireServerAuth는 서버 환경에서만 사용 가능합니다');
  }
  
  const helpers = await getServerAuthHelpers();
  return await helpers.requireServerAuth();
}

export const getServerUser = async () => {
  if (typeof window !== 'undefined') {
    throw new Error('getServerUser는 서버 환경에서만 사용 가능합니다');
  }
  
  const helpers = await getServerAuthHelpers();
  return await helpers.getServerUser();
}