/**
 * 워클리 고유 방법론 - 핵심 계층구조 및 독립성 로직
 * 업무 중심의 유연한 계층구조 구현
 */

// 계층구조 타입
export enum HierarchyType {
  INDEPENDENT = 'independent',    // 독립적 업무
  PROJECT_ONLY = 'project_only',  // 프로젝트에만 속함 (목표 없음)
  GOAL_DIRECT = 'goal_direct',    // 목표에 직접 속함 (프로젝트 없음)
  FULL_HIERARCHY = 'full_hierarchy' // 완전한 계층 (업무 -> 프로젝트 -> 목표)
}

// 계층구조 선택 옵션
export interface HierarchyChoice {
  type: HierarchyType
  projectId?: string    // 기존 프로젝트 선택
  goalId?: string      // 기존 목표 선택
  createProject?: {    // 새 프로젝트 생성
    title: string
    description?: string
    goalId?: string    // 상위 목표 연결
  }
  createGoal?: {       // 새 목표 생성
    title: string
    description?: string
  }
}

// 간단한 업무 인터페이스 (CPER 제거)
export interface WorklyTask {
  // 기본 정보 (기존 Task 인터페이스와 호환)
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  type: TaskType
  
  // 날짜 관련
  dueDate?: string
  startDate?: string
  completedAt?: string
  
  // 계층구조 (핵심!)
  hierarchyType: HierarchyType
  projectId?: string      // 프로젝트 연결 (선택적)
  goalId?: string         // 목표 연결 (선택적, 직접 연결 또는 프로젝트 통해 간접 연결)
  
  // 실행 관련
  isToday: boolean
  isFocused: boolean
  nextAction?: string
  estimatedMinutes: number
  actualMinutes: number
  
  // 관계 및 소유자
  assigneeId: string
  assignee: {
    id: string
    name: string
    email: string
  }
  
  // 태그 및 분류
  tags: string[]
  
  // 메타데이터
  createdAt: string
  updatedAt: string
  
  // 계산된 속성
  isOverdue?: boolean
  isDueSoon?: boolean
  hierarchyPath?: string  // "목표명 > 프로젝트명" 또는 "독립적 업무"
}

// 계층구조 관계 인터페이스
export interface HierarchyRelation {
  taskId: string
  projectId?: string
  goalId?: string
  relationshipType: HierarchyType
  establishedAt: string
  establishedBy: string
}

// 계층구조 변경 요청
export interface HierarchyChangeRequest {
  taskId: string
  fromHierarchy: {
    type: HierarchyType
    projectId?: string
    goalId?: string
  }
  toHierarchy: HierarchyChoice
  reason?: string
}

// 계층구조 검증 규칙
export interface HierarchyValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

// 계층구조 분석 데이터
export interface HierarchyAnalytics {
  taskId: string
  hierarchyType: HierarchyType
  
  // 연결 관계 분석
  connections: {
    projectConnection?: {
      projectId: string
      projectTitle: string
      projectProgress: number
      contributionPercentage: number
    }
    goalConnection?: {
      goalId: string
      goalTitle: string
      goalProgress: number
      contributionPercentage: number
      isDirectConnection: boolean  // 직접 연결 vs 프로젝트 통한 간접 연결
    }
  }
  
  // 영향도 분석
  impact: {
    onProject?: number      // 0-100 (프로젝트에 미치는 영향)
    onGoal?: number        // 0-100 (목표에 미치는 영향)
    independence: number    // 0-100 (독립성 점수)
  }
  
  // 추천사항
  recommendations: {
    shouldMoveToProject?: string
    shouldConnectToGoal?: string
    shouldBecomeIndependent?: string
  }
}

// 유틸리티 함수들을 위한 인터페이스
export interface HierarchyUtils {
  // 계층구조 경로 생성
  getHierarchyPath(task: WorklyTask, project?: Project): string
  
  // 계층구조 변경 가능 여부 확인
  canChangeHierarchy(task: WorklyTask, newHierarchy: HierarchyChoice): HierarchyValidation
  
  // 계층구조 분석
  analyzeHierarchy(task: WorklyTask): HierarchyAnalytics
  
  // 독립적 업무 여부 확인
  isIndependentTask(task: WorklyTask): boolean
  
  // 프로젝트를 통한 목표 연결 확인
  isGoalConnectedThroughProject(task: WorklyTask): boolean
  
  // 직접 목표 연결 확인
  isDirectlyConnectedToGoal(task: WorklyTask): boolean
}

// 홈화면 "오늘 할 일" 최적화를 위한 인터페이스
export interface TodayTasksOptimized {
  // 집중 업무 (최우선)
  focusedTasks: WorklyTask[]
  
  // 긴급 업무
  urgentTasks: WorklyTask[]
  
  // 일반 오늘 업무
  todayTasks: WorklyTask[]
  
  // 다음 액션이 명확한 업무
  readyToStartTasks: WorklyTask[]
  
  // 계층구조별 그룹화
  groupedByHierarchy: {
    independent: WorklyTask[]
    byProject: {
      projectId: string
      projectTitle: string
      tasks: WorklyTask[]
    }[]
    byGoal: {
      goalId: string
      goalTitle: string
      directTasks: WorklyTask[]  // 목표에 직접 연결된 업무
      projectTasks: {
        projectId: string
        projectTitle: string
        tasks: WorklyTask[]
      }[]
    }[]
  }
  
  // 시간 관리 정보
  timeAnalysis: {
    totalEstimatedMinutes: number
    focusedTasksMinutes: number
    averageTaskMinutes: number
    recommendedDailyLimit: number
  }
}

// 간단한 업무 액션 인터페이스 (CPER 제거)
export interface TaskActions {
  // 기본 액션
  create: {
    quickCreate(title: string): Promise<string> // Task ID 반환
    createWithDetails(taskData: Partial<WorklyTask>): Promise<string>
  }
  
  // 실행 관련
  execute: {
    setTodayTasks(taskIds: string[]): Promise<void>
    setFocusedTask(taskId: string): Promise<void>
    updateProgress(taskId: string, progressNote: string): Promise<void>
    completeTask(taskId: string): Promise<void>
  }
  
  // 분석
  analytics: {
    getInsights(taskId: string): Promise<HierarchyAnalytics>
    generateReport(period: 'week' | 'month' | 'quarter'): Promise<any>
  }
}

// 타입 가드 함수들 (CPER 제거)
export const TypeGuards = {
  isWorklyTask: (obj: any): obj is WorklyTask => {
    return obj && typeof obj.hierarchyType === 'string' && typeof obj.id === 'string'
  },
  
  isIndependentTask: (task: WorklyTask): boolean => {
    return task.hierarchyType === HierarchyType.INDEPENDENT
  },
  
  hasProjectConnection: (task: WorklyTask): boolean => {
    return task.hierarchyType === HierarchyType.PROJECT_ONLY || 
           task.hierarchyType === HierarchyType.FULL_HIERARCHY
  },
  
  hasGoalConnection: (task: WorklyTask): boolean => {
    return task.hierarchyType === HierarchyType.GOAL_DIRECT || 
           task.hierarchyType === HierarchyType.FULL_HIERARCHY
  }
}

// 기존 타입들 import (순환 참조 방지)
import { TaskStatus, Priority as TaskPriority, TaskType, Project } from './api.types'

// 빠른 업무 생성을 위한 타입
interface QuickCreateTaskDto {
  title: string
  description?: string
  tags?: string[]
}