import { Task, Project, Notification, User } from './api.types'

// Socket 이벤트 타입 정의
export interface SocketEvents {
  // 클라이언트 → 서버 이벤트
  'join:project': (projectId: string) => void
  'leave:project': (projectId: string) => void
  'join:user': (userId: string) => void
  'leave:user': (userId: string) => void

  // 서버 → 클라이언트 이벤트
  'task:created': (data: TaskCreatedPayload) => void
  'task:updated': (data: TaskUpdatedPayload) => void
  'task:deleted': (data: TaskDeletedPayload) => void
  'task:assigned': (data: TaskAssignedPayload) => void
  
  'project:updated': (data: ProjectUpdatedPayload) => void
  'project:member:added': (data: ProjectMemberAddedPayload) => void
  'project:member:removed': (data: ProjectMemberRemovedPayload) => void
  
  'notification:new': (data: NotificationPayload) => void
  'notification:read': (data: NotificationReadPayload) => void
  
  'user:online': (data: UserOnlinePayload) => void
  'user:offline': (data: UserOfflinePayload) => void
  
  // 시스템 이벤트
  'connection': () => void
  'disconnect': () => void
  'error': (error: SocketError) => void
}

// 이벤트 페이로드 타입들
export interface TaskCreatedPayload {
  task: Task
  projectId?: string
  createdBy: User
}

export interface TaskUpdatedPayload {
  task: Task
  changes: Partial<Task>
  updatedBy: User
  projectId?: string
}

export interface TaskDeletedPayload {
  taskId: string
  projectId?: string
  deletedBy: User
}

export interface TaskAssignedPayload {
  task: Task
  assignee: User
  assignedBy: User
  projectId?: string
}

export interface ProjectUpdatedPayload {
  project: Project
  changes: Partial<Project>
  updatedBy: User
}

export interface ProjectMemberAddedPayload {
  project: Project
  member: User
  addedBy: User
}

export interface ProjectMemberRemovedPayload {
  projectId: string
  member: User
  removedBy: User
}

export interface NotificationPayload {
  notification: Notification
}

export interface NotificationReadPayload {
  notificationId: string
  userId: string
  readAt: string
}

export interface UserOnlinePayload {
  userId: string
  user: User
  onlineAt: string
}

export interface UserOfflinePayload {
  userId: string
  user: User
  offlineAt: string
}

export interface SocketError {
  message: string
  code?: string
  details?: any
}

// Socket 연결 상태
export interface SocketState {
  isConnected: boolean
  isConnecting: boolean
  error?: string
  onlineUsers: User[]
  joinedProjects: string[]
}

// Socket 클라이언트 설정
export interface SocketConfig {
  url: string
  options?: {
    autoConnect?: boolean
    reconnection?: boolean
    reconnectionAttempts?: number
    reconnectionDelay?: number
    timeout?: number
  }
}