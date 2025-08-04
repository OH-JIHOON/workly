/**
 * 워클리 고유 방법론 - 목표(Goal) 관련 타입 정의
 * 기존 OKR의 Objective를 대체하는 단순하고 유연한 목표 시스템
 */

// 목표 상태
export enum GoalStatus {
  DRAFT = 'draft',           // 초안
  ACTIVE = 'active',         // 진행 중
  ON_HOLD = 'on_hold',       // 보류
  COMPLETED = 'completed',    // 완료
  CANCELLED = 'cancelled',    // 취소
  ARCHIVED = 'archived',      // 보관됨
}

// 목표 우선순위
export enum GoalPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// 목표 유형
export enum GoalType {
  PERSONAL = 'personal',     // 개인 목표
  TEAM = 'team',            // 팀 목표
  ORGANIZATIONAL = 'organizational', // 조직 목표
  PROJECT = 'project',       // 프로젝트 목표
}

// 목표 시간 범위
export enum GoalTimeframe {
  SHORT_TERM = 'short_term',   // 단기 (1-3개월)
  MEDIUM_TERM = 'medium_term', // 중기 (3-12개월)
  LONG_TERM = 'long_term',     // 장기 (1년 이상)
}

// 기본 사용자 정보
export interface GoalUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// 목표 메트릭 (간단한 진행 측정)
export interface GoalMetric {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  description?: string;
}

// 메인 목표 인터페이스
export interface Goal {
  id: string;
  title: string;
  description?: string;
  status: GoalStatus;
  priority: GoalPriority;
  type: GoalType;
  timeframe: GoalTimeframe;
  
  // 날짜 관련
  startDate?: string;
  targetDate?: string;
  completedAt?: string;
  
  // 진행률 및 메트릭
  progress: number; // 0-100
  metrics: GoalMetric[];
  
  // 분류 및 태그
  tags: string[];
  color?: string;
  icon?: string;
  
  // 소유자 및 관계
  ownerId: string;
  owner: GoalUser;
  
  // 연결된 프로젝트 수 (계산된 값)
  projectCount: number;
  completedProjectCount: number;
  
  // 메타데이터
  createdAt: string;
  updatedAt: string;
  
  // 계산된 속성
  isOverdue?: boolean;
  isDueSoon?: boolean;
}

// 목표 생성 DTO
export interface CreateGoalDto {
  title: string;
  description?: string;
  priority?: GoalPriority;
  type?: GoalType;
  timeframe?: GoalTimeframe;
  startDate?: string;
  targetDate?: string;
  tags?: string[];
  color?: string;
  icon?: string;
  metrics?: Omit<GoalMetric, 'id'>[];
}

// 목표 업데이트 DTO
export interface UpdateGoalDto {
  title?: string;
  description?: string;
  status?: GoalStatus;
  priority?: GoalPriority;
  type?: GoalType;
  timeframe?: GoalTimeframe;
  startDate?: string;
  targetDate?: string;
  progress?: number;
  tags?: string[];
  color?: string;
  icon?: string;
  metrics?: GoalMetric[];
}

// 목표 쿼리 DTO
export interface GoalQueryDto {
  page?: number;
  limit?: number;
  status?: GoalStatus;
  priority?: GoalPriority;
  type?: GoalType;
  timeframe?: GoalTimeframe;
  ownerId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  includeArchived?: boolean;
  tags?: string[];
}

// 목표 통계
export interface GoalStats {
  total: number;
  draft: number;
  active: number;
  onHold: number;
  completed: number;
  cancelled: number;
  overdue: number;
  dueSoon: number;
}

// 목표 활동
export interface GoalActivity {
  id: string;
  type: 'created' | 'updated' | 'status_changed' | 'progress_updated' | 'metric_updated';
  description: string;
  userId: string;
  user: GoalUser;
  goalId: string;
  createdAt: string;
  metadata?: { [key: string]: any };
}

// 목표 대시보드 데이터
export interface GoalDashboard {
  goal: Goal;
  stats: {
    totalProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    recentActivity: GoalActivity[];
  };
  recentProjects: SimpleProject[]; // SimpleProject 타입 (순환 참조 방지)
  upcomingMilestones: {
    id: string;
    title: string;
    dueDate: string;
    type: 'goal' | 'project' | 'task';
  }[];
}

// 목표 필터 설정
export interface GoalFilterSettings {
  status?: GoalStatus[];
  priority?: GoalPriority[];
  type?: GoalType[];
  timeframe?: GoalTimeframe[];
  ownerIds?: string[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

// SimpleProject 타입 (간단한 인터페이스 - 순환 참조 방지)
export interface SimpleProject {
  id: string;
  title: string;
  description?: string;
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}