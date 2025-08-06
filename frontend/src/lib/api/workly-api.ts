/**
 * 워클리 CPER 워크플로우 API 클라이언트
 * 실제 백엔드와 연동을 위한 API 인터페이스
 */

import { 
  WorklyTask, 
  HierarchyChoice, 
  CPERWorkflowData,
  TodayTasksOptimized,
  HierarchyAnalytics 
} from '@/shared/types/workly-core.types'
import { 
  InboxItem, 
  CreateInboxItemDto, 
  UpdateInboxItemDto,
  InboxQueryDto 
} from '@/shared/types/inbox.types'
import { Goal, CreateGoalDto, UpdateGoalDto } from '@/shared/types/goal.types'
import { Project, CreateProjectDto, UpdateProjectDto } from '@/types/project.types'

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
const API_VERSION = 'v1'

class WorklyApiClient {
  private baseUrl: string
  private headers: HeadersInit

  constructor() {
    this.baseUrl = `${API_BASE_URL}/${API_VERSION}`
    this.headers = {
      'Content-Type': 'application/json',
    }
  }

  // 인증 토큰 설정
  setAuthToken(token: string) {
    this.headers = {
      ...this.headers,
      'Authorization': `Bearer ${token}`
    }
  }

  // HTTP 요청 헬퍼
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: this.headers,
      ...options
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API 요청 실패: ${endpoint}`, error)
      throw error
    }
  }

  // GET 요청
  private get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  // POST 요청
  private post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  // PUT 요청
  private put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  // DELETE 요청
  private delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // PATCH 요청
  private patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  // =============================================================================
  // CPER 워크플로우 API
  // =============================================================================

  /**
   * 1단계: Capture - 수집함 관련 API
   */
  inbox = {
    // 빠른 수집
    quickCapture: (content: string): Promise<InboxItem> => {
      return this.post('/inbox/quick-capture', { content })
    },

    // 구조화된 수집
    create: (data: CreateInboxItemDto): Promise<InboxItem> => {
      return this.post('/inbox', data)
    },

    // 수집함 목록 조회
    list: (query?: InboxQueryDto): Promise<InboxItem[]> => {
      const params = query ? `?${new URLSearchParams(query as any).toString()}` : ''
      return this.get(`/inbox${params}`)
    },

    // 수집함 아이템 상세 조회
    getById: (id: string): Promise<InboxItem> => {
      return this.get(`/inbox/${id}`)
    },

    // 수집함 아이템 업데이트
    update: (id: string, data: UpdateInboxItemDto): Promise<InboxItem> => {
      return this.put(`/inbox/${id}`, data)
    },

    // 수집함 아이템 삭제
    delete: (id: string): Promise<void> => {
      return this.delete(`/inbox/${id}`)
    },

    // 일괄 처리
    batchProcess: (itemIds: string[], action: string, data?: any): Promise<void> => {
      return this.post('/inbox/batch-process', { itemIds, action, data })
    }
  }

  /**
   * 2단계: Plan - 계획 및 변환 API
   */
  planning = {
    // 수집함 아이템을 업무로 변환
    convertToTask: (inboxId: string, hierarchyChoice: HierarchyChoice): Promise<WorklyTask> => {
      return this.post(`/inbox/${inboxId}/convert-to-task`, { hierarchyChoice })
    },

    // 명확화 처리
    clarify: (inboxId: string, clarificationData: CPERWorkflowData['planningData']): Promise<InboxItem> => {
      return this.patch(`/inbox/${inboxId}/clarify`, clarificationData)
    },

    // 계층구조 변경
    changeHierarchy: (taskId: string, newHierarchy: HierarchyChoice): Promise<WorklyTask> => {
      return this.patch(`/tasks/${taskId}/hierarchy`, { hierarchyChoice: newHierarchy })
    },

    // 계층구조 분석
    analyzeHierarchy: (taskId: string): Promise<HierarchyAnalytics> => {
      return this.get(`/tasks/${taskId}/hierarchy-analysis`)
    }
  }

  /**
   * 3단계: Execute - 실행 관리 API
   */
  execution = {
    // 오늘 할 일 설정
    setTodayTasks: (taskIds: string[]): Promise<void> => {
      return this.post('/tasks/set-today', { taskIds })
    },

    // 집중 업무 설정
    setFocusedTask: (taskId: string): Promise<void> => {
      return this.post(`/tasks/${taskId}/set-focused`)
    },

    // 업무 시작
    startTask: (taskId: string): Promise<WorklyTask> => {
      return this.post(`/tasks/${taskId}/start`)
    },

    // 진행 상황 업데이트
    updateProgress: (taskId: string, progressNote: string, progressPercentage?: number): Promise<WorklyTask> => {
      return this.patch(`/tasks/${taskId}/progress`, { progressNote, progressPercentage })
    },

    // 업무 완료
    completeTask: (taskId: string): Promise<WorklyTask> => {
      return this.post(`/tasks/${taskId}/complete`)
    },

    // 오늘 할 일 최적화된 조회
    getTodayTasksOptimized: (): Promise<TodayTasksOptimized> => {
      return this.get('/tasks/today-optimized')
    }
  }

  /**
   * 4단계: Review - 검토 및 분석 API
   */
  review = {
    // 리뷰 데이터 추가
    addReview: (taskId: string, reviewData: CPERWorkflowData['reviewData']): Promise<WorklyTask> => {
      return this.post(`/tasks/${taskId}/review`, reviewData)
    },

    // 업무 인사이트 조회
    getTaskInsights: (taskId: string): Promise<HierarchyAnalytics> => {
      return this.get(`/tasks/${taskId}/insights`)
    },

    // 주간 리뷰 데이터
    getWeeklyReview: (startDate: string, endDate: string): Promise<any> => {
      return this.get(`/review/weekly?start=${startDate}&end=${endDate}`)
    },

    // 월간 리뷰 데이터
    getMonthlyReview: (year: number, month: number): Promise<any> => {
      return this.get(`/review/monthly?year=${year}&month=${month}`)
    }
  }

  // =============================================================================
  // 기본 엔티티 관리 API
  // =============================================================================

  /**
   * 업무(Tasks) API
   */
  tasks = {
    // 업무 목록 조회
    list: (query?: any): Promise<WorklyTask[]> => {
      const params = query ? `?${new URLSearchParams(query).toString()}` : ''
      return this.get(`/tasks${params}`)
    },

    // 업무 상세 조회
    getById: (id: string): Promise<WorklyTask> => {
      return this.get(`/tasks/${id}`)
    },

    // 업무 생성
    create: (data: any): Promise<WorklyTask> => {
      return this.post('/tasks', data)
    },

    // 업무 업데이트
    update: (id: string, data: any): Promise<WorklyTask> => {
      return this.patch(`/tasks/${id}`, data)
    },

    // 업무 상세 정보 업데이트 (Notion 스타일 모달용)
    updateDetail: (id: string, data: any): Promise<WorklyTask> => {
      return this.patch(`/tasks/${id}/detail`, data)
    },

    // 업무 삭제
    delete: (id: string): Promise<void> => {
      return this.delete(`/tasks/${id}`)
    },

    // 업무 상태 변경
    updateStatus: (id: string, status: string): Promise<WorklyTask> => {
      return this.patch(`/tasks/${id}/status`, { status })
    }
  }

  /**
   * 프로젝트(Projects) API
   */
  projects = {
    // 프로젝트 목록 조회
    list: (query?: any): Promise<Project[]> => {
      const params = query ? `?${new URLSearchParams(query).toString()}` : ''
      return this.get(`/projects${params}`)
    },

    // 프로젝트 상세 조회
    getById: (id: string): Promise<Project> => {
      return this.get(`/projects/${id}`)
    },

    // 프로젝트 생성
    create: (data: CreateProjectDto): Promise<Project> => {
      return this.post('/projects', data)
    },

    // 프로젝트 업데이트
    update: (id: string, data: UpdateProjectDto): Promise<Project> => {
      return this.put(`/projects/${id}`, data)
    },

    // 프로젝트 삭제
    delete: (id: string): Promise<void> => {
      return this.delete(`/projects/${id}`)
    },

    // 프로젝트 멤버 관리
    addMember: (id: string, userId: string, role: string): Promise<void> => {
      return this.post(`/projects/${id}/members`, { userId, role })
    },

    removeMember: (id: string, userId: string): Promise<void> => {
      return this.delete(`/projects/${id}/members/${userId}`)
    }
  }

  /**
   * 목표(Goals) API
   */
  goals = {
    // 목표 목록 조회
    list: (query?: any): Promise<Goal[]> => {
      const params = query ? `?${new URLSearchParams(query).toString()}` : ''
      return this.get(`/goals${params}`)
    },

    // 목표 상세 조회
    getById: (id: string): Promise<Goal> => {
      return this.get(`/goals/${id}`)
    },

    // 목표 생성
    create: (data: CreateGoalDto): Promise<Goal> => {
      return this.post('/goals', data)
    },

    // 목표 업데이트
    update: (id: string, data: UpdateGoalDto): Promise<Goal> => {
      return this.put(`/goals/${id}`, data)
    },

    // 목표 삭제
    delete: (id: string): Promise<void> => {
      return this.delete(`/goals/${id}`)
    },

    // 목표 진행률 업데이트
    updateProgress: (id: string, progress: number): Promise<Goal> => {
      return this.patch(`/goals/${id}/progress`, { progress })
    }
  }

  // =============================================================================
  // 대시보드 및 분석 API
  // =============================================================================

  /**
   * 대시보드 API
   */
  dashboard = {
    // 홈 대시보드 데이터
    getHomeDashboard: (): Promise<any> => {
      return this.get('/dashboard/home')
    },

    // 프로젝트 대시보드 데이터
    getProjectDashboard: (projectId: string): Promise<any> => {
      return this.get(`/dashboard/project/${projectId}`)
    },

    // 목표 대시보드 데이터
    getGoalDashboard: (goalId: string): Promise<any> => {
      return this.get(`/dashboard/goal/${goalId}`)
    },

    // 개인 생산성 분석
    getProductivityAnalysis: (period: 'week' | 'month' | 'quarter'): Promise<any> => {
      return this.get(`/dashboard/productivity?period=${period}`)
    }
  }

  /**
   * 검색 API
   */
  search = {
    // 통합 검색
    global: (query: string, filters?: any): Promise<any> => {
      const params = new URLSearchParams({ q: query, ...filters })
      return this.get(`/search?${params.toString()}`)
    },

    // 업무 검색
    tasks: (query: string): Promise<WorklyTask[]> => {
      return this.get(`/search/tasks?q=${encodeURIComponent(query)}`)
    },

    // 프로젝트 검색
    projects: (query: string): Promise<Project[]> => {
      return this.get(`/search/projects?q=${encodeURIComponent(query)}`)
    },

    // 목표 검색
    goals: (query: string): Promise<Goal[]> => {
      return this.get(`/search/goals?q=${encodeURIComponent(query)}`)
    }
  }

  // =============================================================================
  // 사용자 및 설정 API
  // =============================================================================

  /**
   * 사용자 API
   */
  user = {
    // 현재 사용자 프로필
    getProfile: (): Promise<any> => {
      return this.get('/user/profile')
    },

    // 프로필 업데이트
    updateProfile: (data: any): Promise<any> => {
      return this.put('/user/profile', data)
    },

    // 사용자 설정
    getSettings: (): Promise<any> => {
      return this.get('/user/settings')
    },

    updateSettings: (data: any): Promise<any> => {
      return this.put('/user/settings', data)
    }
  }

  /**
   * 인증 API
   */
  auth = {
    // 로그인
    login: (email: string, password: string): Promise<{ token: string; user: any }> => {
      return this.post('/auth/login', { email, password })
    },

    // Google OAuth 로그인
    googleLogin: (idToken: string): Promise<{ token: string; user: any }> => {
      return this.post('/auth/google', { idToken })
    },

    // 로그아웃
    logout: (): Promise<void> => {
      return this.post('/auth/logout')
    },

    // 토큰 갱신
    refreshToken: (refreshToken: string): Promise<{ token: string }> => {
      return this.post('/auth/refresh', { refreshToken })
    },

    // 회원가입
    register: (data: any): Promise<{ token: string; user: any }> => {
      return this.post('/auth/register', data)
    }
  }
}

// 싱글톤 인스턴스 생성
export const worklyApi = new WorklyApiClient()

// 기본 export
export default worklyApi

// 타입 export
export type { 
  WorklyTask, 
  InboxItem, 
  Project, 
  Goal, 
  HierarchyChoice,
  CPERWorkflowData,
  TodayTasksOptimized,
  HierarchyAnalytics 
}