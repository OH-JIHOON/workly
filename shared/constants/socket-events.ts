// Socket.io 이벤트 상수 정의

// 연결 관련 이벤트
export const CONNECTION_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  RECONNECT: 'reconnect',
  RECONNECT_ERROR: 'reconnect_error',
} as const

// 사용자 관련 이벤트
export const USER_EVENTS = {
  JOIN: 'user:join',
  LEAVE: 'user:leave',
  ONLINE: 'user:online',
  OFFLINE: 'user:offline',
  STATUS_CHANGE: 'user:status_change',
} as const

// 프로젝트 관련 이벤트
export const PROJECT_EVENTS = {
  JOIN: 'project:join',
  LEAVE: 'project:leave',
  CREATED: 'project:created',
  UPDATED: 'project:updated',
  DELETED: 'project:deleted',
  MEMBER_ADDED: 'project:member_added',
  MEMBER_REMOVED: 'project:member_removed',
  STATUS_CHANGED: 'project:status_changed',
} as const

// 업무 관련 이벤트
export const TASK_EVENTS = {
  CREATED: 'task:created',
  UPDATED: 'task:updated',
  DELETED: 'task:deleted',
  STATUS_CHANGED: 'task:status_changed',
  ASSIGNED: 'task:assigned',
  UNASSIGNED: 'task:unassigned',
  COMMENT_ADDED: 'task:comment_added',
  DUE_DATE_REMINDER: 'task:due_date_reminder',
} as const

// 게시판 관련 이벤트
export const BOARD_EVENTS = {
  POST_CREATED: 'board:post_created',
  POST_UPDATED: 'board:post_updated',
  POST_DELETED: 'board:post_deleted',
  POST_LIKED: 'board:post_liked',
  POST_UNLIKED: 'board:post_unliked',
  COMMENT_ADDED: 'board:comment_added',
  COMMENT_UPDATED: 'board:comment_updated',
  COMMENT_DELETED: 'board:comment_deleted',
} as const

// 알림 관련 이벤트
export const NOTIFICATION_EVENTS = {
  NEW: 'notification:new',
  READ: 'notification:read',
  READ_ALL: 'notification:read_all',
  DELETED: 'notification:deleted',
} as const

// 채팅 관련 이벤트 (향후 확장용)
export const CHAT_EVENTS = {
  MESSAGE_SENT: 'chat:message_sent',
  MESSAGE_RECEIVED: 'chat:message_received',
  TYPING_START: 'chat:typing_start',
  TYPING_STOP: 'chat:typing_stop',
  USER_JOINED: 'chat:user_joined',
  USER_LEFT: 'chat:user_left',
} as const

// 시스템 관련 이벤트
export const SYSTEM_EVENTS = {
  MAINTENANCE_START: 'system:maintenance_start',
  MAINTENANCE_END: 'system:maintenance_end',
  UPDATE_AVAILABLE: 'system:update_available',
  BROADCAST: 'system:broadcast',
} as const

// 모든 이벤트를 하나의 객체로 통합
export const SOCKET_EVENTS = {
  CONNECTION: CONNECTION_EVENTS,
  USER: USER_EVENTS,
  PROJECT: PROJECT_EVENTS,
  TASK: TASK_EVENTS,
  BOARD: BOARD_EVENTS,
  NOTIFICATION: NOTIFICATION_EVENTS,
  CHAT: CHAT_EVENTS,
  SYSTEM: SYSTEM_EVENTS,
} as const

// 이벤트 타입 유니온
export type SocketEventType = 
  | keyof typeof CONNECTION_EVENTS
  | keyof typeof USER_EVENTS
  | keyof typeof PROJECT_EVENTS
  | keyof typeof TASK_EVENTS
  | keyof typeof BOARD_EVENTS
  | keyof typeof NOTIFICATION_EVENTS
  | keyof typeof CHAT_EVENTS
  | keyof typeof SYSTEM_EVENTS

// 룸 관련 상수
export const SOCKET_ROOMS = {
  USER: (userId: string) => `user:${userId}`,
  PROJECT: (projectId: string) => `project:${projectId}`,
  BOARD: 'board:global',
  NOTIFICATIONS: (userId: string) => `notifications:${userId}`,
  CHAT: (roomId: string) => `chat:${roomId}`,
} as const