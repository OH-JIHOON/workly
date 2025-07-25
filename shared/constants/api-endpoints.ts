// API 기본 설정
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
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

// 프로젝트 관련 엔드포인트
export const PROJECT_ENDPOINTS = {
  BASE: `${API_PREFIX}/projects`,
  BY_ID: (id: string) => `${API_PREFIX}/projects/${id}`,
  MEMBERS: (id: string) => `${API_PREFIX}/projects/${id}/members`,
  ADD_MEMBER: (id: string) => `${API_PREFIX}/projects/${id}/members`,
  REMOVE_MEMBER: (projectId: string, userId: string) => 
    `${API_PREFIX}/projects/${projectId}/members/${userId}`,
  TASKS: (id: string) => `${API_PREFIX}/projects/${id}/tasks`,
} as const

// 업무 관련 엔드포인트
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

// 검색 관련 엔드포인트
export const SEARCH_ENDPOINTS = {
  GLOBAL: `${API_PREFIX}/search`,
  USERS: `${API_PREFIX}/search/users`,
  PROJECTS: `${API_PREFIX}/search/projects`,
  TASKS: `${API_PREFIX}/search/tasks`,
  POSTS: `${API_PREFIX}/search/posts`,
} as const