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

// CPER 단계별 상태
export enum CPERStage {
  CAPTURED = 'captured',     // 수집됨
  PLANNED = 'planned',       // 계획됨
  EXECUTING = 'executing',   // 실행 중
  COMPLETED = 'completed',   // 완료됨
  REVIEWED = 'reviewed'      // 검토됨
}

// CPER 워크플로우 데이터
export interface CPERWorkflowData {
  stage: CPERStage
  capturedAt: string
  plannedAt?: string
  executionStartedAt?: string
  completedAt?: string
  reviewedAt?: string
  
  // 계획 단계 데이터
  planningData?: {
    isActionable: boolean
    canComplete2Minutes: boolean
    timeEstimate: number        // 분 단위
    priorityReasoning: string
    hierarchyChoice: HierarchyChoice
    nextAction?: string
  }
  
  // 실행 단계 데이터
  executionData?: {
    isToday: boolean
    isFocused: boolean
    startedAt?: string
    pausedAt?: string
    actualTimeSpent: number     // 분 단위
    progressNotes: string[]
  }
  
  // 검토 단계 데이터
  reviewData?: {
    lessonsLearned: string[]
    improvements: string[]
    goalContribution: number    // 0-100 (목표 기여도)
    projectContribution: number // 0-100 (프로젝트 기여도)
    satisfaction: number        // 1-5 (만족도)
    wouldDoAgain: boolean
  }
}

// 확장된 업무 인터페이스 (기존 Task 확장)
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
  
  // CPER 워크플로우
  cperWorkflow: CPERWorkflowData
  
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
  getHierarchyPath(task: WorklyTask, project?: Project, goal?: Goal): string
  
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

// CPER 단계별 액션 정의
export interface CPERActions {
  // Capture 단계
  capture: {
    quickCapture(content: string): Promise<string> // InboxItem ID 반환
    structuredCapture(data: CreateInboxItemDto): Promise<string>
  }
  
  // Plan 단계
  plan: {
    clarifyItem(inboxItemId: string, clarification: CPERWorkflowData['planningData']): Promise<void>
    convertToTask(inboxItemId: string, hierarchyChoice: HierarchyChoice): Promise<string> // Task ID 반환
  }
  
  // Execute 단계
  execute: {
    setTodayTasks(taskIds: string[]): Promise<void>
    setFocusedTask(taskId: string): Promise<void>
    startExecution(taskId: string): Promise<void>
    updateProgress(taskId: string, progressNote: string): Promise<void>
    completeTask(taskId: string): Promise<void>
  }
  
  // Review 단계
  review: {
    addReview(taskId: string, reviewData: CPERWorkflowData['reviewData']): Promise<void>
    getInsights(taskId: string): Promise<HierarchyAnalytics>
  }
}

// 타입 가드 함수들
export const TypeGuards = {
  isWorklyTask: (obj: any): obj is WorklyTask => {
    return obj && typeof obj.hierarchyType === 'string' && obj.cperWorkflow
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
import { Goal } from './goal.types'
import { CreateInboxItemDto } from './inbox.types'