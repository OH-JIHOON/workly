/**
 * Legacy Workly API module for backward compatibility
 * Re-exports from current API structure
 */

// Re-export everything from the current API structure for backward compatibility
export * from './tasks.api'
export * from './projects.api' 
// goals.api 제거됨
export * from './profiles.api'
export * from './auth.api'
// inbox.api 제거됨
export * from './messages.api'
export * from './realtime.api'

// Legacy worklyAPI object for backward compatibility (deprecated)
export const worklyAPI = {
  // Placeholder - use specific API modules instead
  deprecated: true,
  message: 'Use specific API modules from current structure instead',
  // Mock methods for backward compatibility
  get: () => { throw new Error('worklyAPI.get is deprecated - use specific API modules') },
  post: () => { throw new Error('worklyAPI.post is deprecated - use specific API modules') },
  patch: () => { throw new Error('worklyAPI.patch is deprecated - use specific API modules') },
  delete: () => { throw new Error('worklyAPI.delete is deprecated - use specific API modules') }
}

// Also export as worklyApi (lowercase) for compatibility
export const worklyApi = worklyAPI