/**
 * Legacy API module for backward compatibility
 * Re-exports from specific API modules
 */

// Re-export from specific API modules for backward compatibility
export * from './api/tasks.api'
export * from './api/projects.api'
export * from './api/goals.api'
export * from './api/profiles.api'
export * from './api/auth.api'
export * from './api/inbox.api'
export * from './api/messages.api'
export * from './api/realtime.api'

// Legacy API client for backward compatibility (deprecated)
export const api = {
  // Placeholder for legacy API calls - use specific API modules instead
  deprecated: true,
  message: 'Use specific API modules from ./api/ directory instead'
}