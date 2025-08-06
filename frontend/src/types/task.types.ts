/**
 * Task 관련 타입 정의
 */

// Task 상태 (백엔드 @workly/shared와 호환)
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress', // 백엔드 호환: in-progress (하이픈)
  IN_REVIEW = 'in-review',
  DONE = 'done',
  COMPLETED = 'completed', // 백엔드 호환성을 위해 추가
  BLOCKED = 'blocked', 
  DEFERRED = 'deferred',
  CANCELLED = 'cancelled',
}

// Task 우선순위
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Task 타입
export enum TaskType {
  TASK = 'task',
  BUG = 'bug',
  FEATURE = 'feature',
  IMPROVEMENT = 'improvement',
  EPIC = 'epic',
  STORY = 'story',
}

// 기본 사용자 정보
export interface TaskUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

// 프로젝트 정보
export interface TaskProject {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
}

// 태스크 레이블
export interface TaskLabel {
  id: string;
  name: string;
  color: string;
  description?: string;
}

// 시간 기록
export interface TimeEntry {
  id: string;
  duration: number; // 분 단위
  description?: string;
  startTime: string;
  endTime?: string;
  userId: string;
  user: TaskUser;
}

// 태스크 댓글
export interface TaskComment {
  id: string;
  content: string;
  authorId: string;
  author: TaskUser;
  createdAt: string;
  updatedAt: string;
}

// 태스크 의존성
export interface TaskDependency {
  id: string;
  dependentTaskId: string;
  dependsOnTaskId: string;
  dependentTask: Task;
  dependsOnTask: Task;
}

// 메인 태스크 인터페이스
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
  projectId?: string;
  goalId?: string;
  assigneeId?: string;
  reporterId: string;
  parentTaskId?: string;
  estimatedHours?: number;
  actualHours: number;
  progress: number;
  workflowStageId?: string;
  tags: string[];
  customFields: { [key: string]: any };
  createdAt: string;
  updatedAt: string;

  // Relations
  project?: TaskProject;
  assignee?: TaskUser;
  reporter: TaskUser;
  parentTask?: Task;
  subtasks: Task[];
  labels: TaskLabel[];
  comments: TaskComment[];
  dependencies: TaskDependency[];
  dependents: TaskDependency[];
  watchers: TaskUser[];
  timeEntries: TimeEntry[];

  // Computed properties
  isOverdue?: boolean;
  isDueSoon?: boolean;
  hasSubtasks?: boolean;
  hasDependencies?: boolean;
  hasBlockingDependencies?: boolean;
}

// 태스크 생성 DTO
export interface CreateTaskDto {
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

// 태스크 업데이트 DTO
export interface UpdateTaskDto {
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

// 태스크 쿼리 DTO
export interface TaskQueryDto {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  projectId?: string;
  assigneeId?: string;
  reporterId?: string;
  dueDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  includeSubtasks?: boolean;
  labelIds?: string[];
  tags?: string[];
}

// 페이지네이션 응답
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// GTD 컨텍스트
export type GTDContext = 'inbox' | 'next' | 'waiting' | 'someday';

// 스마트 필터
export type SmartFilter = 'today' | 'completed' | 'all';

// 태스크 통계
export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  blocked: number;
  overdue: number;
}

// 태스크 활동
export interface TaskActivity {
  id: string;
  type: 'created' | 'updated' | 'commented' | 'status_changed' | 'assigned';
  description: string;
  userId: string;
  user: TaskUser;
  taskId: string;
  createdAt: string;
  metadata?: { [key: string]: any };
}

// 태스크 배치 작업
export interface TaskBatchOperation {
  taskIds: string[];
  operation: 'update_status' | 'update_priority' | 'assign' | 'add_labels' | 'delete';
  data: any;
}

// 태스크 필터 설정
export interface TaskFilterSettings {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeIds?: string[];
  projectIds?: string[];
  labelIds?: string[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

// 태스크 보드 컬럼
export interface TaskBoardColumn {
  id: string;
  title: string;
  status: TaskStatus;
  limit?: number;
  tasks: Task[];
}

// 태스크 보드
export interface TaskBoard {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  columns: TaskBoardColumn[];
  settings?: {
    swimlanes?: 'none' | 'assignee' | 'priority' | 'type';
    grouping?: 'none' | 'project' | 'assignee';
  };
}

// 모멘텀 점수 (RICE 모델)
export interface MomentumScore {
  reach: number;      // 프로젝트 중요도 (0-10)
  impact: number;     // 긴급성/중요성 (0-10)
  confidence: number; // 명확성 (0-10)
  effort: number;     // 예상 소요 시간 역가중치 (0-10)
  total: number;      // 계산된 총점
}

// GTD 기반 업무 확장
export interface GTDTask extends Task {
  momentumScore: MomentumScore;
  gtdContext: GTDContext;
  isActionable: boolean;
  canComplete2Minutes: boolean;
  nextAction?: string;
  clarified: boolean;
}

// 업무 생성 위자드 단계
export type TaskWizardStep = 'collect' | 'clarify' | 'organize' | 'execute';

// 업무 생성 위자드 데이터
export interface TaskWizardData {
  step: TaskWizardStep;
  title: string;
  isActionable?: boolean;
  canComplete2Minutes?: boolean;
  belongsToProject?: boolean;
  projectId?: string;
  priority?: TaskPriority;
  dueDate?: string;
  estimatedHours?: number;
  assigneeId?: string;
}

// 홈 대시보드 필터 (GTD 방법론 기반)
export type HomeDashboardFilter = 'today' | 'inbox' | 'someday' | 'completed' | 'all';

// 체크리스트 아이템
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

// 업무 관계 타입
export type TaskRelationshipType = 'blocks' | 'blocked_by' | 'related' | 'parent' | 'child';

// 업무 관계
export interface TaskRelationship {
  id: string;
  targetTaskId: string;
  type: TaskRelationshipType;
  targetTask?: Task;
}

// 위키 레퍼런스
export interface WikiReference {
  id: string;
  title: string;
  url: string;
  description?: string;
}

// 확장된 업무 상세 정보
export interface TaskDetail extends Task {
  descriptionMarkdown?: string;
  checklist: ChecklistItem[];
  relationships: TaskRelationship[];
  wikiReferences: WikiReference[];
  estimatedTimeMinutes?: number;
  loggedTimeMinutes?: number;
}

// 업무 상세 업데이트 DTO
export interface UpdateTaskDetailDto extends UpdateTaskDto {
  descriptionMarkdown?: string;
  checklist?: ChecklistItem[];
  relationships?: TaskRelationship[];
  wikiReferences?: WikiReference[];
  estimatedTimeMinutes?: number;
  loggedTimeMinutes?: number;
}