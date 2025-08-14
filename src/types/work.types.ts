/**
 * Work 관련 타입 정의 - 워클리의 최소 작업 단위
 */

// Work 상태 (백엔드와 호환)
export enum WorkStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress', // 백엔드 호환: in-progress (하이픈)
  IN_REVIEW = 'in-review',
  COMPLETED = 'completed', // 기본 완료 상태
  DONE = 'done', // 호환성
  BLOCKED = 'blocked', 
  DEFERRED = 'deferred',
  CANCELLED = 'cancelled',
}

// Work 우선순위
export enum WorkPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Work 타입
export enum WorkType {
  TASK = 'task', // 기본 작업 단위 (Supabase와 호환)
  WORK = 'work', // 워클리 작업 단위 (호환성)
  BUG = 'bug',
  FEATURE = 'feature',
  IMPROVEMENT = 'improvement',
  EPIC = 'epic',
  STORY = 'story',
}

// 기본 사용자 정보
export interface WorkUser {
  id: string;
  name: string; // 백엔드 호환성을 위해 추가
  firstName?: string; // 선택적으로 변경
  lastName?: string; // 선택적으로 변경
  email: string;
  avatar?: string;
}

// 프로젝트 정보
export interface WorkProject {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
}

// 워크 레이블
export interface WorkLabel {
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
  user: WorkUser;
}

// 워크 댓글
export interface WorkComment {
  id: string;
  content: string;
  authorId: string;
  author: WorkUser;
  createdAt: string;
  updatedAt: string;
}

// 워크 의존성
export interface WorkDependency {
  id: string;
  dependentWorkId: string;
  dependsOnWorkId: string;
  dependentWork: Work;
  dependsOnWork: Work;
}

// 메인 워크 인터페이스 - 워클리의 최소 작업 단위
export interface Work {
  id: string;
  title: string;
  description?: string;
  status: WorkStatus;
  priority: WorkPriority;
  type: WorkType;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  projectId?: string;
  goalId?: string;
  assigneeId?: string;
  reporterId?: string; // 선택적으로 변경
  parentWorkId?: string;
  estimatedHours?: number;
  actualHours?: number; // 선택적으로 변경
  progress?: number; // 선택적으로 변경
  workflowStageId?: string;
  tags: string[];
  customFields: { [key: string]: string | number | boolean };
  createdAt: string;
  updatedAt: string;

  // Relations
  project?: WorkProject;
  assignee?: WorkUser;
  reporter?: WorkUser; // 선택적으로 변경
  parentWork?: Work;
  subworks?: Work[]; // 선택적으로 변경
  labels?: WorkLabel[]; // 선택적으로 변경
  comments?: WorkComment[]; // 선택적으로 변경
  dependencies?: WorkDependency[]; // 선택적으로 변경
  dependents?: WorkDependency[]; // 선택적으로 변경
  watchers?: WorkUser[]; // 선택적으로 변경
  timeEntries?: TimeEntry[]; // 선택적으로 변경

  // Computed properties
  isOverdue?: boolean;
  isDueSoon?: boolean;
  hasSubworks?: boolean;
  hasDependencies?: boolean;
  hasBlockingDependencies?: boolean;
}

// 워크 생성 DTO
export interface CreateWorkDto {
  title: string;
  description?: string;
  projectId?: string;
  assigneeId?: string;
  parentWorkId?: string;
  priority?: WorkPriority;
  type?: WorkType;
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  tags?: string[];
  labelIds?: string[];
  customFields?: Record<string, any>;
}

// 워크 업데이트 DTO
export interface UpdateWorkDto {
  title?: string;
  description?: string;
  status?: WorkStatus;
  priority?: WorkPriority;
  type?: WorkType;
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  progress?: number;
  tags?: string[];
  labelIds?: string[];
  customFields?: Record<string, any>;
}

// 워크 쿼리 DTO
export interface WorkQueryDto {
  page?: number;
  limit?: number;
  status?: WorkStatus;
  priority?: WorkPriority;
  type?: WorkType;
  projectId?: string;
  assigneeId?: string;
  reporterId?: string;
  dueDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  includeSubworks?: boolean;
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

// 워크 통계
export interface WorkStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  blocked: number;
  overdue: number;
}

// 워크 활동
export interface WorkActivity {
  id: string;
  type: 'created' | 'updated' | 'commented' | 'status_changed' | 'assigned';
  description: string;
  userId: string;
  user: WorkUser;
  workId: string;
  createdAt: string;
  metadata?: { [key: string]: any };
}

// 워크 배치 작업
export interface WorkBatchOperation {
  workIds: string[];
  operation: 'update_status' | 'update_priority' | 'assign' | 'add_labels' | 'delete';
  data: any;
}

// TaskFilterSettings 제거됨 - 더 간단한 필터링 시스템으로 통합

// 워크 보드 컬럼
export interface WorkBoardColumn {
  id: string;
  title: string;
  status: WorkStatus;
  limit?: number;
  works: Work[];
}

// 워크 보드
export interface WorkBoard {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  columns: WorkBoardColumn[];
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
export interface GTDWork extends Work {
  momentumScore: MomentumScore;
  gtdContext: GTDContext;
  isActionable: boolean;
  canComplete2Minutes: boolean;
  nextAction?: string;
  clarified: boolean;
}

// 업무 생성 위자드 관련 타입 제거됨

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
export type WorkRelationshipType = 'blocks' | 'blocked_by' | 'related' | 'parent' | 'child';

// 업무 관계
export interface WorkRelationship {
  id: string;
  targetWorkId: string;
  type: WorkRelationshipType;
  targetWork?: Work;
}

// 위키 레퍼런스
export interface WikiReference {
  id: string;
  title: string;
  url: string;
  description?: string;
}

// 확장된 업무 상세 정보
export interface WorkDetail extends Work {
  descriptionMarkdown?: string;
  checklist: ChecklistItem[];
  relationships: WorkRelationship[];
  wikiReferences: WikiReference[];
  estimatedTimeMinutes?: number;
  loggedTimeMinutes?: number;
}

// 업무 상세 업데이트 DTO
export interface UpdateWorkDetailDto extends UpdateWorkDto {
  descriptionMarkdown?: string;
  checklist?: ChecklistItem[];
  relationships?: WorkRelationship[];
  wikiReferences?: WikiReference[];
  estimatedTimeMinutes?: number;
  loggedTimeMinutes?: number;
}

// ========================
// 호환성을 위한 기존 타입 alias
// ========================
export type TaskStatus = WorkStatus;
export type TaskPriority = WorkPriority;
export type TaskType = WorkType;
export type Task = Work;
export type TaskUser = WorkUser;
export type TaskProject = WorkProject;
export type TaskLabel = WorkLabel;
export type TaskComment = WorkComment;
export type TaskDependency = WorkDependency;
export type CreateTaskDto = CreateWorkDto;
export type UpdateTaskDto = UpdateWorkDto;
export type TaskQueryDto = WorkQueryDto;
export type TaskStats = WorkStats;
export type TaskActivity = WorkActivity;
export type TaskBatchOperation = WorkBatchOperation;
export type TaskBoardColumn = WorkBoardColumn;
export type TaskBoard = WorkBoard;
export type GTDTask = GTDWork;
// TaskWizard 타입 alias 제거됨
export type TaskRelationshipType = WorkRelationshipType;
export type TaskRelationship = WorkRelationship;
export type TaskDetail = WorkDetail;
export type UpdateTaskDetailDto = UpdateWorkDetailDto;