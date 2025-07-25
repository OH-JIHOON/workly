// 공통 API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

// 페이지네이션 타입
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta
}

// 공통 엔티티 필드
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// 사용자 타입
export interface User extends BaseEntity {
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'manager' | 'member'
  isActive: boolean
}

// 프로젝트 타입
export interface Project extends BaseEntity {
  title: string
  description?: string
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold'
  priority: 'low' | 'medium' | 'high'
  startDate?: string
  endDate?: string
  ownerId: string
  owner: User
  members: User[]
  tasksCount?: number
}

// 업무 타입
export interface Task extends BaseEntity {
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  projectId?: string
  project?: Project
  assigneeId?: string
  assignee?: User
  reporterId: string
  reporter: User
  estimatedHours?: number
  actualHours?: number
}

// 게시글 타입
export interface Post extends BaseEntity {
  title: string
  content: string
  authorId: string
  author: User
  category: 'announcement' | 'discussion' | 'question' | 'general'
  tags: string[]
  viewCount: number
  likeCount: number
  commentCount: number
  isPinned: boolean
}

// 댓글 타입
export interface Comment extends BaseEntity {
  content: string
  postId: string
  authorId: string
  author: User
  parentId?: string
  replies?: Comment[]
}

// 파일 타입
export interface File extends BaseEntity {
  filename: string
  originalName: string
  mimetype: string
  size: number
  path: string
  url: string
  uploaderId: string
  uploader: User
}

// 알림 타입
export interface Notification extends BaseEntity {
  type: 'task_assigned' | 'task_completed' | 'project_updated' | 'comment_added' | 'mention'
  title: string
  message: string
  recipientId: string
  recipient: User
  senderId?: string
  sender?: User
  isRead: boolean
  entityType?: 'task' | 'project' | 'post' | 'comment'
  entityId?: string
}