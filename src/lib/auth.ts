/**
 * 단순한 Supabase 인증 유틸리티
 * supabase.auth.getClaims() API 사용
 */

// Re-export everything from auth.store for backward compatibility
export { useSupabaseAuth as useAuthStore, type AuthState, type UserProfile, getCurrentUser, isAuthenticated } from './stores/auth.store'

// 단순한 권한 확인 헬퍼 함수들
export const getUserRole = (user?: any): string => {
  if (user) {
    return user?.role || user?.user_metadata?.role || 'member'
  }
  
  // 현재 인증된 사용자의 역할 확인
  const currentUser = getCurrentUser()
  return currentUser?.role || 'member'
}

export const isAdmin = (user?: any): boolean => {
  if (user) {
    return user?.role === 'admin' || 
           user?.user_metadata?.role === 'admin' ||
           user?.admin_role === 'super_admin' ||
           user?.app_metadata?.admin_role === 'super_admin'
  }
  
  // 현재 인증된 사용자의 관리자 권한 확인
  const currentUser = getCurrentUser()
  return currentUser?.role === 'admin' || currentUser?.admin_role === 'super_admin'
}

// 권한 확인 헬퍼 함수
export const hasPermission = (requiredRole: string, user?: any): boolean => {
  const targetUser = user || getCurrentUser()
  if (!targetUser) return false
  
  const userRole = targetUser?.role || 'member'
  
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

// Logout function
export const logout = async () => {
  console.log('🚪 로그아웃 실행')
  
  try {
    const { useSupabaseAuth } = await import('@/lib/stores/auth.store')
    const { signOut } = useSupabaseAuth.getState()
    return await signOut()
  } catch (error) {
    console.error('로그아웃 오류:', error)
    throw error
  }
}