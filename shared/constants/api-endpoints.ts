// API 기본 설정
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
export const API_VERSION = 'v1'
export const API_PREFIX = `/api/${API_VERSION}`

// 인증 관련 엔드포인트
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_PREFIX}/auth/login`,
  REGISTER: `${API_PREFIX}/auth/register`,
  LOGOUT: `${API_PREFIX}/auth/logout`,
  REFRESH: `${API_PREFIX}/auth/refresh`,
  PROFILE: `${API_PREFIX}/auth/profile`,
  GOOGLE: `${API_PREFIX}/auth/google`,
  GOOGLE_CALLBACK: `${API_PREFIX}/auth/google/callback`,
} as const

// 사용자 관련 엔드포인트
export const USER_ENDPOINTS = {
  BASE: `${API_PREFIX}/users`,
  BY_ID: (id: string) => `${API_PREFIX}/users/${id}`,
  UPDATE_PROFILE: (id: string) => `${API_PREFIX}/users/${id}/profile`,
  CHANGE_PASSWORD: (id: string) => `${API_PREFIX}/users/${id}/password`,
  UPLOAD_AVATAR: (id: string) => `${API_PREFIX}/users/${id}/avatar`,
} as const

// Workspace 관련 엔드포인트
export const PROJECT_ENDPOINTS = {
  BASE: `${API_PREFIX}/projects`,
  BY_ID: (id: string) => `${API_PREFIX}/projects/${id}`,
  MEMBERS: (id: string) => `${API_PREFIX}/projects/${id}/members`,
  ADD_MEMBER: (id: string) => `${API_PREFIX}/projects/${id}/members`,
  REMOVE_MEMBER: (projectId: string, userId: string) => 
    `${API_PREFIX}/projects/${projectId}/members/${userId}`,
  TASKS: (id: string) => `${API_PREFIX}/projects/${id}/tasks`,
} as const

// Work 관련 엔드포인트
export const TASK_ENDPOINTS = {
  BASE: `${API_PREFIX}/tasks`,
  BY_ID: (id: string) => `${API_PREFIX}/tasks/${id}`,
  BY_PROJECT: (projectId: string) => `${API_PREFIX}/projects/${projectId}/tasks`,
  BY_USER: (userId: string) => `${API_PREFIX}/users/${userId}/tasks`,
  ASSIGN: (id: string) => `${API_PREFIX}/tasks/${id}/assign`,
  STATUS: (id: string) => `${API_PREFIX}/tasks/${id}/status`,
  COMMENTS: (id: string) => `${API_PREFIX}/tasks/${id}/comments`,
} as const

// 게시판 관련 엔드포인트
export const BOARD_ENDPOINTS = {
  POSTS: `${API_PREFIX}/board/posts`,
  POST_BY_ID: (id: string) => `${API_PREFIX}/board/posts/${id}`,
  POST_COMMENTS: (id: string) => `${API_PREFIX}/board/posts/${id}/comments`,
  POST_LIKE: (id: string) => `${API_PREFIX}/board/posts/${id}/like`,
  POST_UNLIKE: (id: string) => `${API_PREFIX}/board/posts/${id}/unlike`,
  COMMENTS: `${API_PREFIX}/board/comments`,
  COMMENT_BY_ID: (id: string) => `${API_PREFIX}/board/comments/${id}`,
} as const

// 파일 관련 엔드포인트
export const FILE_ENDPOINTS = {
  UPLOAD: `${API_PREFIX}/files/upload`,
  UPLOAD_MULTIPLE: `${API_PREFIX}/files/upload/multiple`,
  BY_ID: (id: string) => `${API_PREFIX}/files/${id}`,
  DOWNLOAD: (id: string) => `${API_PREFIX}/files/${id}/download`,
  DELETE: (id: string) => `${API_PREFIX}/files/${id}`,
  BY_USER: (userId: string) => `${API_PREFIX}/users/${userId}/files`,
  BY_PROJECT: (projectId: string) => `${API_PREFIX}/projects/${projectId}/files`,
} as const

// 알림 관련 엔드포인트
export const NOTIFICATION_ENDPOINTS = {
  BASE: `${API_PREFIX}/notifications`,
  BY_ID: (id: string) => `${API_PREFIX}/notifications/${id}`,
  MARK_READ: (id: string) => `${API_PREFIX}/notifications/${id}/read`,
  MARK_ALL_READ: `${API_PREFIX}/notifications/read-all`,
  UNREAD_COUNT: `${API_PREFIX}/notifications/unread-count`,
} as const

// 대시보드 관련 엔드포인트
export const DASHBOARD_ENDPOINTS = {
  STATS: `${API_PREFIX}/dashboard/stats`,
  RECENT_TASKS: `${API_PREFIX}/dashboard/recent-tasks`,
  RECENT_PROJECTS: `${API_PREFIX}/dashboard/recent-projects`,
  ACTIVITIES: `${API_PREFIX}/dashboard/activities`,
} as const

// 목표 관련 엔드포인트 (워클리 방법론)
export const GOAL_ENDPOINTS = {
  BASE: `${API_PREFIX}/goals`,
  BY_ID: (id: string) => `${API_PREFIX}/goals/${id}`,
  PROJECTS: (id: string) => `${API_PREFIX}/goals/${id}/projects`,
  METRICS: (id: string) => `${API_PREFIX}/goals/${id}/metrics`,
  UPDATE_PROGRESS: (id: string) => `${API_PREFIX}/goals/${id}/progress`,
  ACTIVITIES: (id: string) => `${API_PREFIX}/goals/${id}/activities`,
  DASHBOARD: (id: string) => `${API_PREFIX}/goals/${id}/dashboard`,
} as const

// 수집함 관련 엔드포인트 (워클리 방법론)
export const INBOX_ENDPOINTS = {
  BASE: `${API_PREFIX}/inbox`,
  BY_ID: (id: string) => `${API_PREFIX}/inbox/${id}`,
  QUICK_CAPTURE: `${API_PREFIX}/inbox/quick-capture`,
  BATCH_PROCESS: `${API_PREFIX}/inbox/batch-process`,
  STATS: `${API_PREFIX}/inbox/stats`,
  DASHBOARD: `${API_PREFIX}/inbox/dashboard`,
  ACTIVITIES: `${API_PREFIX}/inbox/activities`,
  ORGANIZE: (id: string) => `${API_PREFIX}/inbox/${id}/organize`,
  CLARIFY: (id: string) => `${API_PREFIX}/inbox/${id}/clarify`,
} as const

// CPER 워크플로우 관련 엔드포인트
export const WORKFLOW_ENDPOINTS = {
  CAPTURE: `${API_PREFIX}/workflow/capture`,
  PLAN: `${API_PREFIX}/workflow/plan`,
  EXECUTE: `${API_PREFIX}/workflow/execute`,
  REVIEW: `${API_PREFIX}/workflow/review`,
  STATUS: `${API_PREFIX}/workflow/status`,
  INSIGHTS: `${API_PREFIX}/workflow/insights`,
} as const

// 네비게이션 관련 엔드포인트
export const NAVIGATION_ENDPOINTS = {
  STATS: `${API_PREFIX}/navigation/stats`,
  QUICK_STATS: `${API_PREFIX}/navigation/quick-stats`,
  PREFERENCES: `${API_PREFIX}/navigation/preferences`,
} as const

// 검색 관련 엔드포인트
export const SEARCH_ENDPOINTS = {
  GLOBAL: `${API_PREFIX}/search`,
  USERS: `${API_PREFIX}/search/users`,
  PROJECTS: `${API_PREFIX}/search/projects`,
  TASKS: `${API_PREFIX}/search/tasks`,
  GOALS: `${API_PREFIX}/search/goals`,
  INBOX: `${API_PREFIX}/search/inbox`,
  POSTS: `${API_PREFIX}/search/posts`,
} as const