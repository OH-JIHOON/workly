/**
 * Project 관련 타입 정의
 */

// 프로젝트 상태
export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived',
}

// 프로젝트 우선순위
export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// 프로젝트 가시성
export enum ProjectVisibility {
  PRIVATE = 'private',
  TEAM = 'team',
  PUBLIC = 'public',
}

// 프로젝트 멤버 역할
export enum ProjectMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

// 기본 사용자 정보
export interface ProjectUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  profile?: {
    firstName: string;
    lastName: string;
  };
}

// 프로젝트 목표
export interface ProjectObjective {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
}

// 프로젝트 핵심 결과
export interface ProjectKeyResult {
  id: string;
  objectiveId: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  completed: boolean;
  completedAt?: string;
}

// 프로젝트 멤버
export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  permissions: string[];
  joinedAt: string;
  user: ProjectUser;
}

// 워크플로우 단계
export interface WorkflowStage {
  id: string;
  name: string;
  description?: string;
  color: string;
  order: number;
  isDefault: boolean;
  isCompleted: boolean;
}

// 프로젝트 설정
export interface ProjectSettings {
  allowGuestAccess?: boolean;
  requireApprovalForTasks?: boolean;
  enableTimeTracking?: boolean;
  enableBudgetTracking?: boolean;
  enableNotifications?: boolean;
  defaultTaskPriority?: string;
  workflowStages?: WorkflowStage[];
}

// 메인 프로젝트 인터페이스
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  objectives: ProjectObjective[];
  keyResults: ProjectKeyResult[];
  startDate?: string;
  dueDate?: string;
  progress: number;
  budget?: number;
  currency?: string;
  tags: string[];
  color?: string;
  icon?: string;
  visibility: ProjectVisibility;
  isArchived: boolean;
  isTemplate: boolean;
  templateId?: string;
  settings: ProjectSettings;
  ownerId: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  owner: ProjectUser;
  members: ProjectMember[];
  tasks?: any[]; // Task 타입 순환 참조 방지

  // Computed properties
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
  completedObjectiveCount: number;
  completedKeyResultCount: number;
  isOverdue?: boolean;
  isDueSoon?: boolean;
}

// 프로젝트 생성 DTO
export interface CreateProjectDto {
  name: string;
  description?: string;
  priority?: ProjectPriority;
  startDate?: string;
  dueDate?: string;
  budget?: number;
  currency?: string;
  tags?: string[];
  color?: string;
  icon?: string;
  visibility?: ProjectVisibility;
  settings?: Partial<ProjectSettings>;
}

// 프로젝트 업데이트 DTO
export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string;
  dueDate?: string;
  budget?: number;
  currency?: string;
  tags?: string[];
  color?: string;
  icon?: string;
  visibility?: ProjectVisibility;
  settings?: Partial<ProjectSettings>;
}

// 프로젝트 쿼리 DTO
export interface ProjectQueryDto {
  page?: number;
  limit?: number;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  visibility?: ProjectVisibility;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  includeArchived?: boolean;
  tags?: string[];
}

// 프로젝트 멤버 추가 DTO
export interface AddProjectMemberDto {
  userId: string;
  role?: ProjectMemberRole;
  permissions?: string[];
}

// 페이지네이션 응답
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 프로젝트 통계
export interface ProjectStats {
  total: number;
  planning: number;
  active: number;
  onHold: number;
  completed: number;
  cancelled: number;
  overdue: number;
  dueSoon: number;
}

// 프로젝트 활동
export interface ProjectActivity {
  id: string;
  type: 'created' | 'updated' | 'member_added' | 'member_removed' | 'status_changed' | 'objective_completed';
  description: string;
  userId: string;
  user: ProjectUser;
  projectId: string;
  createdAt: string;
  metadata?: { [key: string]: any };
}

// 프로젝트 대시보드 데이터
export interface ProjectDashboard {
  project: Project;
  stats: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    activeMembersCount: number;
    recentActivity: ProjectActivity[];
  };
  recentTasks: any[]; // Task 타입
  upcomingMilestones: {
    id: string;
    title: string;
    dueDate: string;
    progress: number;
  }[];
}

// 프로젝트 템플릿
export interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  settings: ProjectSettings;
  defaultTasks?: {
    title: string;
    description?: string;
    priority: string;
    estimatedHours?: number;
  }[];
  defaultObjectives?: Omit<ProjectObjective, 'id' | 'completed' | 'completedAt'>[];
  isPublic: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
}

// 프로젝트 배치 작업
export interface ProjectBatchOperation {
  projectIds: string[];
  operation: 'update_status' | 'update_priority' | 'archive' | 'delete' | 'add_members';
  data: any;
}

// 프로젝트 필터 설정
export interface ProjectFilterSettings {
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  visibility?: ProjectVisibility[];
  memberIds?: string[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

// 프로젝트 정렬 옵션
export interface ProjectSortOption {
  value: string;
  label: string;
  field: keyof Project;
  direction: 'asc' | 'desc';
}

// 프로젝트 뷰 타입
export type ProjectViewType = 'grid' | 'list' | 'kanban' | 'timeline';

// 프로젝트 뷰 설정
export interface ProjectViewSettings {
  type: ProjectViewType;
  groupBy?: 'status' | 'priority' | 'owner' | 'none';
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  filters: ProjectFilterSettings;
  showArchived: boolean;
}