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
  items?: T[] // 백엔드 호환성을 위해 추가
  total?: number // 백엔드 호환성을 위해 추가
  page?: number // 백엔드 호환성을 위해 추가
  limit?: number // 백엔드 호환성을 위해 추가
  totalPages?: number // 백엔드 호환성을 위해 추가
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
  role: UserRole
  status: UserStatus
  profile: UserProfile
  preferences: UserPreferences
  lastLoginAt?: string
  emailVerifiedAt?: string
  googleId?: string
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
  GUEST = 'guest'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification'
}

export interface UserProfile {
  firstName: string
  lastName: string
  bio?: string
  location?: string
  timezone: string
  language: string
  phoneNumber?: string
  department?: string
  position?: string
  dateOfBirth?: string
  profilePicture?: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: NotificationPreferences
  workingHours: WorkingHours
  dashboard: DashboardPreferences
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  desktop: boolean
  taskAssigned: boolean
  taskCompleted: boolean
  taskDue: boolean
  projectUpdates: boolean
  mentions: boolean
  weeklyDigest: boolean
  dailyReminder: boolean
}

export interface WorkingHours {
  enabled: boolean
  startTime: string // "09:00"
  endTime: string   // "18:00"
  timezone: string
  workingDays: number[] // [1,2,3,4,5] (월-금)
  breakTime: {
    enabled: boolean
    startTime: string
    endTime: string
  }
}

export interface DashboardPreferences {
  layout: 'grid' | 'list'
  widgets: {
    myTasks: boolean
    recentProjects: boolean
    teamActivity: boolean
    notifications: boolean
    calendar: boolean
    quickStats: boolean
  }
  defaultView: 'dashboard' | 'projects' | 'tasks' | 'board'
}

// 프로젝트 타입
export interface Project extends BaseEntity {
  title: string
  description?: string
  status: ProjectStatus
  priority: Priority
  startDate?: string
  endDate?: string
  progress: number // 0-100
  budget?: number
  currency?: string
  tags: string[]
  isArchived: boolean
  isTemplate: boolean
  templateId?: string
  color?: string
  icon?: string
  ownerId: string
  owner: User
  members: ProjectMember[]
  tasks: Task[]
  tasksCount: number
  completedTasksCount: number
  settings: ProjectSettings
  visibility: ProjectVisibility
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active', // 백엔드 호환성을 위해 추가
  IN_PROGRESS = 'in-progress',
  ON_HOLD = 'on-hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived'
}

export enum ProjectVisibility {
  PRIVATE = 'private',
  TEAM = 'team',
  PUBLIC = 'public'
}

export interface ProjectMember {
  userId: string
  user: User
  role: ProjectRole
  joinedAt: string
  permissions: ProjectPermission[]
}

export enum ProjectRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

// 프로젝트 멤버 역할 (ProjectRole과 동일)
export type ProjectMemberRole = ProjectRole;
export const ProjectMemberRole = ProjectRole;

export enum ProjectPermission {
  VIEW_PROJECT = 'view_project',
  EDIT_PROJECT = 'edit_project',
  DELETE_PROJECT = 'delete_project',
  MANAGE_MEMBERS = 'manage_members',
  CREATE_TASKS = 'create_tasks',
  EDIT_TASKS = 'edit_tasks',
  DELETE_TASKS = 'delete_tasks',
  ASSIGN_TASKS = 'assign_tasks',
  MANAGE_SETTINGS = 'manage_settings'
}

export interface ProjectSettings {
  allowGuestAccess: boolean
  requireApprovalForTasks: boolean
  enableTimeTracking: boolean
  enableBudgetTracking: boolean
  enableNotifications: boolean
  defaultTaskPriority: Priority
  workflowStages: WorkflowStage[]
}

export interface WorkflowStage {
  id: string
  name: string
  description?: string
  color: string
  order: number
  isDefault: boolean
  isCompleted: boolean
}

// 공통 Priority enum
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 프로젝트 우선순위 (Priority와 동일)
export type ProjectPriority = Priority;
export const ProjectPriority = Priority;

// 업무 타입
export interface Task extends BaseEntity {
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  type: TaskType
  dueDate?: string
  startDate?: string
  completedAt?: string
  projectId?: string
  project?: Project
  assigneeId?: string
  assignee?: User
  reporterId: string
  reporter: User
  parentTaskId?: string
  parentTask?: Task
  subtasks: Task[]
  estimatedHours?: number
  actualHours?: number
  progress: number // 0-100
  workflowStageId?: string
  workflowStage?: WorkflowStage
  tags: string[]
  labels: TaskLabel[]
  attachments: TaskAttachment[]
  timeEntries: TimeEntry[]
  comments: TaskComment[]
  dependencies: TaskDependency[]
  watchers: User[]
  customFields: { [key: string]: string | number | boolean }
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  IN_REVIEW = 'in-review',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskType {
  TASK = 'task',
  STORY = 'story',
  BUG = 'bug',
  FEATURE = 'feature',
  IMPROVEMENT = 'improvement',
  EPIC = 'epic',
  SUBTASK = 'subtask'
}

export interface TaskLabel {
  id: string
  name: string
  color: string
  description?: string
}

export interface TaskAttachment {
  id: string
  filename: string
  originalName: string
  mimetype: string
  size: number
  url: string
  uploadedBy: User
  uploadedAt: string
}

export interface TimeEntry {
  id: string
  description?: string
  duration: number // 분 단위
  startTime: string
  endTime?: string
  userId: string
  user: User
  taskId: string
  billable: boolean
  approved: boolean
  createdAt: string
}

export interface TaskComment {
  id: string
  content: string
  authorId: string
  author: User
  taskId: string
  parentId?: string
  replies?: TaskComment[]
  isInternal: boolean
  createdAt: string
  updatedAt: string
}

export interface TaskDependency {
  id: string
  dependentTaskId: string
  dependsOnTaskId: string
  type: DependencyType
  createdAt: string
}

export enum DependencyType {
  BLOCKS = 'blocks',
  BLOCKED_BY = 'blocked_by',
  RELATES_TO = 'relates_to',
  DUPLICATES = 'duplicates',
  DUPLICATED_BY = 'duplicated_by', // 백엔드 호환성을 위해 추가
  IS_DUPLICATED_BY = 'is_duplicated_by'
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

// 인증 관련 요청/응답 타입
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  agreeToTerms: boolean
  agreeToPrivacy: boolean
}

export interface AuthResponse {
  user?: User
  tokens?: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
  message: string // 백엔드 호환성을 위해 추가
}

export interface LoginResponse {
  user: {
    id: string
    email: string
    name: string
    firstName?: string
    lastName?: string
    role: UserRole
    status: UserStatus
    avatar?: string
    profile: UserProfile
    preferences: UserPreferences
    emailVerifiedAt?: string
    lastLoginAt?: string
    createdAt: string
    updatedAt: string
  }
  accessToken: string
  refreshToken: string
}

export interface GoogleAuthRequest {
  code: string
  redirectUri: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface ResendVerificationRequest {
  email: string
}

// 사용자 업데이트 관련 타입
export interface UpdateUserRequest {
  name?: string
  profile?: Partial<UserProfile>
  preferences?: Partial<UserPreferences>
}

export interface UpdateUserProfileRequest {
  firstName?: string
  lastName?: string
  bio?: string
  location?: string
  timezone?: string
  language?: string
  phoneNumber?: string
  department?: string
  position?: string
  dateOfBirth?: string
}

export interface UpdateUserPreferencesRequest {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  timezone?: string
  notifications?: Partial<NotificationPreferences>
  workingHours?: Partial<WorkingHours>
  dashboard?: Partial<DashboardPreferences>
}

export interface UploadAvatarResponse {
  avatarUrl: string
}

// 사용자 검색/필터 타입
export interface UserSearchQuery {
  query?: string
  role?: UserRole
  status?: UserStatus
  department?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt'
  sortOrder?: 'asc' | 'desc'
}

export interface UserListResponse extends PaginatedResponse<User> {}

// 팀/멤버 관련 타입
export interface TeamMember {
  user: User
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
  permissions: string[]
}

export interface InviteUserRequest {
  email: string
  role: UserRole
  message?: string
}

export interface InviteResponse {
  inviteId: string
  inviteUrl: string
  expiresAt: string
}

export interface AcceptInviteRequest {
  inviteToken: string
  firstName: string
  lastName: string
  password: string
}

// 프로젝트 관련 요청/응답 타입
export interface CreateProjectRequest {
  title: string
  description?: string
  status?: ProjectStatus
  priority?: Priority
  startDate?: string
  endDate?: string
  budget?: number
  currency?: string
  tags?: string[]
  color?: string
  icon?: string
  visibility?: ProjectVisibility
  settings?: Partial<ProjectSettings>
  memberIds?: string[]
}

export interface UpdateProjectRequest {
  title?: string
  description?: string
  status?: ProjectStatus
  priority?: Priority
  startDate?: string
  endDate?: string
  budget?: number
  currency?: string
  tags?: string[]
  color?: string
  icon?: string
  visibility?: ProjectVisibility
  settings?: Partial<ProjectSettings>
}

export interface ProjectSearchQuery {
  query?: string
  status?: ProjectStatus
  priority?: Priority
  ownerId?: string
  memberId?: string
  tags?: string[]
  visibility?: ProjectVisibility
  isArchived?: boolean
  page?: number
  limit?: number
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'dueDate' | 'priority'
  sortOrder?: 'asc' | 'desc'
}

export interface AddProjectMemberRequest {
  userId: string
  role: ProjectRole
  permissions?: ProjectPermission[]
}

export interface UpdateProjectMemberRequest {
  role?: ProjectRole
  permissions?: ProjectPermission[]
}

export interface ProjectListResponse extends PaginatedResponse<Project> {}

// 태스크 관련 요청/응답 타입
export interface CreateTaskRequest {
  title: string
  description?: string
  type?: TaskType
  priority?: Priority
  dueDate?: string
  startDate?: string
  projectId?: string
  assigneeId?: string
  parentTaskId?: string
  estimatedHours?: number
  workflowStageId?: string
  tags?: string[]
  labelIds?: string[]
  watcherIds?: string[]
  customFields?: { [key: string]: string | number | boolean }
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: Priority
  type?: TaskType
  dueDate?: string
  startDate?: string
  assigneeId?: string
  estimatedHours?: number
  actualHours?: number
  progress?: number
  workflowStageId?: string
  tags?: string[]
  labelIds?: string[]
  watcherIds?: string[]
  customFields?: { [key: string]: string | number | boolean }
}

export interface TaskSearchQuery {
  query?: string
  status?: TaskStatus
  priority?: Priority
  type?: TaskType
  projectId?: string
  assigneeId?: string
  reporterId?: string
  parentTaskId?: string
  labelIds?: string[]
  tags?: string[]
  dueAfter?: string
  dueBefore?: string
  hasAssignee?: boolean
  isOverdue?: boolean
  page?: number
  limit?: number
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export interface TaskListResponse extends PaginatedResponse<Task> {}

export interface BulkUpdateTasksRequest {
  taskIds: string[]
  updates: Partial<UpdateTaskRequest>
}

export interface MoveTaskRequest {
  targetProjectId?: string
  targetParentTaskId?: string
  position?: number
}

// 시간 추적 관련 타입
export interface CreateTimeEntryRequest {
  description?: string
  duration?: number
  startTime: string
  endTime?: string
  taskId: string
  billable?: boolean
}

export interface UpdateTimeEntryRequest {
  description?: string
  duration?: number
  startTime?: string
  endTime?: string
  billable?: boolean
}

export interface TimeEntrySearchQuery {
  userId?: string
  taskId?: string
  projectId?: string
  startDate?: string
  endDate?: string
  billable?: boolean
  approved?: boolean
  page?: number
  limit?: number
}

// 댓글 관련 타입
export interface CreateTaskCommentRequest {
  content: string
  taskId: string
  parentId?: string
  isInternal?: boolean
}

export interface UpdateTaskCommentRequest {
  content: string
}

// 태스크 의존성 관련 타입
export interface CreateTaskDependencyRequest {
  dependentTaskId: string
  dependsOnTaskId: string
  type: DependencyType
}

// 라벨 관련 타입
export interface CreateTaskLabelRequest {
  name: string
  color: string
  description?: string
  projectId?: string
}

export interface UpdateTaskLabelRequest {
  name?: string
  color?: string
  description?: string
}

// JWT 페이로드 인터페이스 (인증 관련)
export interface JwtPayload {
  sub: string // 사용자 ID
  email: string
  role: string
  adminRole?: string; // 관리자 역할
  iat?: number // 발급 시간
  exp?: number // 만료 시간
}

export interface RefreshTokenPayload {
  sub: string // 사용자 ID
  tokenId: string // 토큰 고유 ID
  iat?: number
  exp?: number
}