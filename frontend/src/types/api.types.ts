// 사용자 관련 타입
export type UserRole = 'admin' | 'member';
export type UserStatus = 'active' | 'inactive' | 'pending_verification' | 'suspended';

export interface UserProfile {
  displayName: string;
  bio: string;
  location: string;
  website: string;
  linkedinUrl: string;
  githubUrl: string;
}

export interface UserNotificationSettings {
  email: boolean;
  push: boolean;
  desktop: boolean;
  mentions: boolean;
  updates: boolean;
  marketing: boolean;
}

export interface UserPrivacySettings {
  profileVisibility: 'public' | 'team' | 'private';
  activityVisibility: 'public' | 'team' | 'private';
}

export interface UserPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  weekStartDay: number;
  notifications: UserNotificationSettings;
  privacy: UserPrivacySettings;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  profile: UserProfile;
  preferences: UserPreferences;
  lastLoginAt?: string;
  emailVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 프로젝트 관련 타입
export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectVisibility = 'private' | 'team' | 'public';
export type ProjectMemberRole = 'admin' | 'member' | 'viewer';

export interface ProjectSettings {
  enableTimeTracking: boolean;
  enableComments: boolean;
  enableFileAttachments: boolean;
  workflowStages: string[];
  [key: string]: any;
}

export interface ProjectMember {
  id: string;
  user: User;
  role: ProjectMemberRole;
  permissions: string[];
  joinedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate?: string;
  endDate?: string;
  progress: number;
  budget?: number;
  currency?: string;
  tags: string[];
  isArchived: boolean;
  isTemplate: boolean;
  templateId?: string;
  color?: string;
  icon?: string;
  visibility: ProjectVisibility;
  settings: ProjectSettings;
  ownerId: string;
  members: ProjectMember[];
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

// 태스크 관련 타입
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskType = 'task' | 'bug' | 'feature' | 'epic' | 'story';

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
  description?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  content: string;
  author: User;
  parentId?: string;
  isInternal: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDependency {
  id: string;
  dependentTask: Task;
  dependsOnTask: Task;
  type: 'blocks' | 'relates_to' | 'duplicates';
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  description?: string;
  duration: number;
  startTime: string;
  endTime?: string;
  user: User;
  billable: boolean;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  project?: Project;
  assignee?: User;
  reporter: User;
  parentTask?: Task;
  subtasks?: Task[];
  estimatedHours?: number;
  actualHours: number;
  progress: number;
  workflowStageId?: string;
  tags: string[];
  customFields: Record<string, any>;
  labels?: TaskLabel[];
  comments?: TaskComment[];
  dependencies?: TaskDependency[];
  dependents?: TaskDependency[];
  watchers?: User[];
  timeEntries?: TimeEntry[];
  createdAt: string;
  updatedAt: string;
}

// API 응답 타입
export interface AuthResponse {
  message: string;
  user?: User;
}

export interface LoginResponse extends AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API 요청 타입
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  projectId?: string;
  assigneeId?: string;
  parentTaskId?: string;
  priority?: TaskPriority;
  type?: TaskType;
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  tags?: string[];
  labelIds?: string[];
  customFields?: Record<string, any>;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  progress?: number;
  tags?: string[];
  labelIds?: string[];
  customFields?: Record<string, any>;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
  priority?: ProjectPriority;
  startDate?: string;
  endDate?: string;
  budget?: number;
  currency?: string;
  tags?: string[];
  color?: string;
  icon?: string;
  visibility?: ProjectVisibility;
  settings?: Record<string, any>;
}