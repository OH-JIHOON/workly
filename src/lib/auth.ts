/**
 * Authentication utilities and helper functions
 * Re-exports from auth store for backward compatibility
 */

// Re-export everything from auth.store for backward compatibility
export { useAuthStore, type AuthState, type UserProfile, getCurrentUser, isAuthenticated } from './stores/auth.store'

// Additional helper functions for authentication
export const getUserRole = (user: any): string => {
  return user?.role || 'member'
}

export const isAdmin = (user: any): boolean => {
  return user?.role === 'admin' || user?.admin_role === 'super_admin'
}

// Legacy API client initialization (deprecated)
export const initializeApiClients = () => {
  console.warn('initializeApiClients is deprecated - API clients are auto-initialized')
  return Promise.resolve()
}

// Logout function
export const logout = async () => {
  const { useAuthStore } = await import('@/lib/stores/auth.store')
  const { signOut } = useAuthStore.getState()
  return await signOut()
}