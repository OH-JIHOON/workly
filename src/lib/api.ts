/**
 * Simplified API module
 * Re-exports from active API modules only
 */

// Re-export from active API modules
export * from './api/tasks.api'
export * from './api/profiles.api'
export * from './api/auth.api'

// Simplified API client
export const api = {
  message: 'Use specific API modules from ./api/ directory'
}