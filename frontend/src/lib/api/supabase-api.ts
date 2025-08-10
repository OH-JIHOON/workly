/**
 * Supabase API 클라이언트
 * 기존 workly-api.ts를 대체하여 Supabase 직접 연동
 */

import { supabase, db, realtime } from '../supabase'
import { getCurrentUser, isDevMode } from '../stores/supabaseAuthStore'
import type { 
  WorklyTask, 
  InboxItem, 
  CreateInboxItemDto, 
  UpdateInboxItemDto,
  InboxQueryDto,
  HierarchyChoice,
  CPERWorkflowData,
  TodayTasksOptimized,
  HierarchyAnalytics
} from '@/types/workly-core.types'
import type { Goal, CreateGoalDto, UpdateGoalDto } from '@/types/goal.types'
import type { Project, CreateProjectDto, UpdateProjectDto } from '@/types/project.types'

// 가짜 데이터 (개발 모드용)
const mockTasks: WorklyTask[] = [
  {
    id: 'mock-task-1',
    title: '프로젝트 기획서 작성',
    description: '새로운 프로젝트를 위한 상세 기획서 작성',
    status: 'in-progress',
    priority: 'high',
    type: 'task',
    assigneeId: 'dev-user-001',
    assignee: {
      id: 'dev-user-001',
      name: '개발자 테스트',
      email: 'dev@workly.com'
    },
    projectId: 'mock-project-1',
    tags: ['기획', '문서화'],
    isToday: true,
    isFocused: false,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mock-task-2',
    title: 'UI 디자인 시안 검토',
    description: '디자이너가 작성한 UI 시안을 검토하고 피드백 제공',
    status: 'todo',
    priority: 'medium',
    type: 'task',
    assigneeId: 'dev-user-001',
    assignee: {
      id: 'dev-user-001',
      name: '개발자 테스트',
      email: 'dev@workly.com'
    },
    tags: ['디자인', '검토'],
    isToday: false,
    isFocused: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

class SupabaseApiClient {
  private getUserId(): string {
    const user = getCurrentUser()
    if (!user) throw new Error('사용자가 로그인되지 않았습니다.')
    return user.id
  }

  // =============================================================================
  // CPER 워크플로우 API
  // =============================================================================

  /**
   * 1단계: Capture - 수집함 관련 API
   */
  inbox = {
    // 빠른 수집
    quickCapture: async (content: string): Promise<InboxItem> => {
      if (isDevMode()) {
        return {
          id: `mock-inbox-${Date.now()}`,
          content,
          source: 'quick_capture',
          status: 'captured',
          tags: [],
          userId: 'dev-user-001',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      const userId = this.getUserId()
      const { data, error } = await db.inbox.create({
        content,
        source: 'quick_capture',
        user_id: userId
      })

      if (error) throw error
      return this.transformInboxItem(data)
    },

    // 구조화된 수집
    create: async (data: CreateInboxItemDto): Promise<InboxItem> => {
      if (isDevMode()) {
        return {
          id: `mock-inbox-${Date.now()}`,
          content: data.content,
          description: data.description,
          source: data.source || 'manual',
          status: 'captured',
          priority: data.priority,
          context: data.context,
          tags: data.tags || [],
          userId: 'dev-user-001',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      const userId = this.getUserId()
      const { data: result, error } = await db.inbox.create({
        ...data,
        user_id: userId
      })

      if (error) throw error
      return this.transformInboxItem(result)
    },

    // 수집함 목록 조회
    list: async (query?: InboxQueryDto): Promise<InboxItem[]> => {
      if (isDevMode()) {
        return []
      }

      const userId = this.getUserId()
      const { data, error } = await db.inbox.list(userId, query)

      if (error) throw error
      return data.map(item => this.transformInboxItem(item))
    },

    // 수집함 아이템 상세 조회
    getById: async (id: string): Promise<InboxItem> => {
      if (isDevMode()) {
        throw new Error('개발 모드에서는 상세 조회가 지원되지 않습니다.')
      }

      const { data, error } = await supabase
        .from('inbox_items')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return this.transformInboxItem(data)
    },

    // 수집함 아이템 업데이트
    update: async (id: string, data: UpdateInboxItemDto): Promise<InboxItem> => {
      if (isDevMode()) {
        throw new Error('개발 모드에서는 업데이트가 지원되지 않습니다.')
      }

      const { data: result, error } = await db.inbox.update(id, data)

      if (error) throw error
      return this.transformInboxItem(result)
    },

    // 수집함 아이템 삭제
    delete: async (id: string): Promise<void> => {
      if (isDevMode()) {
        return
      }

      const { error } = await db.inbox.delete(id)
      if (error) throw error
    },

    // 일괄 처리
    batchProcess: async (itemIds: string[], action: string, data?: any): Promise<void> => {
      if (isDevMode()) {
        return
      }

      // Supabase에서는 개별 처리로 구현
      for (const id of itemIds) {
        switch (action) {
          case 'delete':
            await this.inbox.delete(id)
            break
          case 'update':
            await this.inbox.update(id, data)
            break
          // 다른 액션들...
        }
      }
    }
  }

  /**
   * 2단계: Plan - 계획 및 변환 API
   */
  planning = {
    // 수집함 아이템을 업무로 변환
    convertToTask: async (inboxId: string, hierarchyChoice: HierarchyChoice): Promise<WorklyTask> => {
      if (isDevMode()) {
        return mockTasks[0]
      }

      // 1. 수집함 아이템 조회
      const inboxItem = await this.inbox.getById(inboxId)
      
      // 2. 업무 생성
      const userId = this.getUserId()
      const taskData = {
        title: inboxItem.content,
        description: inboxItem.description,
        priority: inboxItem.priority || 'medium',
        assignee_id: userId,
        reporter_id: userId,
        project_id: hierarchyChoice.projectId || null,
        goal_id: hierarchyChoice.goalId || null,
        tags: inboxItem.tags || []
      }

      const { data: task, error: taskError } = await db.tasks.create(taskData)
      if (taskError) throw taskError

      // 3. 수집함 아이템 처리 완료 표시
      await this.inbox.update(inboxId, {
        status: 'processed',
        processedAt: new Date().toISOString(),
        convertedToTaskId: task.id
      })

      return this.transformTask(task)
    },

    // 명확화 처리
    clarify: async (inboxId: string, clarificationData: CPERWorkflowData['planningData']): Promise<InboxItem> => {
      if (isDevMode()) {
        throw new Error('개발 모드에서는 명확화가 지원되지 않습니다.')
      }

      const { data, error } = await db.inbox.update(inboxId, {
        description: clarificationData.description,
        priority: clarificationData.priority,
        context: clarificationData.context,
        status: 'clarified'
      })

      if (error) throw error
      return this.transformInboxItem(data)
    },

    // 계층구조 변경
    changeHierarchy: async (taskId: string, newHierarchy: HierarchyChoice): Promise<WorklyTask> => {
      if (isDevMode()) {
        return mockTasks[0]
      }

      const { data, error } = await db.tasks.update(taskId, {
        project_id: newHierarchy.projectId || null,
        goal_id: newHierarchy.goalId || null
      })

      if (error) throw error
      return this.transformTask(data)
    },

    // 계층구조 분석
    analyzeHierarchy: async (taskId: string): Promise<HierarchyAnalytics> => {
      if (isDevMode()) {
        return {
          taskId,
          currentHierarchy: {
            type: 'standalone',
            projectId: undefined,
            goalId: undefined
          },
          recommendations: [],
          analytics: {
            complexityScore: 3,
            estimatedHours: 2,
            dependencies: []
          }
        }
      }

      // 업무 정보 조회
      const { data: task, error } = await db.tasks.get(taskId)
      if (error) throw error

      // 분석 로직 (간단한 구현)
      return {
        taskId,
        currentHierarchy: {
          type: task.project_id ? 'project' : (task.goal_id ? 'goal' : 'standalone'),
          projectId: task.project_id,
          goalId: task.goal_id
        },
        recommendations: [],
        analytics: {
          complexityScore: 3,
          estimatedHours: task.estimated_hours || 2,
          dependencies: []
        }
      }
    }
  }

  /**
   * 3단계: Execute - 실행 관리 API
   */
  execution = {
    // 오늘 할 일 설정
    setTodayTasks: async (taskIds: string[]): Promise<void> => {
      if (isDevMode()) {
        return
      }

      // 각 업무에 'today' 태그 추가
      for (const taskId of taskIds) {
        const { data: task } = await db.tasks.get(taskId)
        if (task) {
          const updatedTags = Array.from(new Set([...task.tags, 'today']))
          await db.tasks.update(taskId, { tags: updatedTags })
        }
      }
    },

    // 집중 업무 설정
    setFocusedTask: async (taskId: string): Promise<void> => {
      if (isDevMode()) {
        return
      }

      // 기존 집중 업무들의 focused 태그 제거
      const userId = this.getUserId()
      const { data: tasks } = await db.tasks.list(userId)
      
      for (const task of tasks || []) {
        if (task.tags.includes('focused')) {
          const updatedTags = task.tags.filter(tag => tag !== 'focused')
          await db.tasks.update(task.id, { tags: updatedTags })
        }
      }

      // 새로운 집중 업무 설정
      const { data: task } = await db.tasks.get(taskId)
      if (task) {
        const updatedTags = Array.from(new Set([...task.tags, 'focused']))
        await db.tasks.update(taskId, { tags: updatedTags })
      }
    },

    // 업무 시작
    startTask: async (taskId: string): Promise<WorklyTask> => {
      if (isDevMode()) {
        return mockTasks[0]
      }

      const { data, error } = await db.tasks.update(taskId, {
        status: 'in-progress',
        start_date: new Date().toISOString()
      })

      if (error) throw error
      return this.transformTask(data)
    },

    // 진행 상황 업데이트
    updateProgress: async (taskId: string, progressNote: string, progressPercentage?: number): Promise<WorklyTask> => {
      if (isDevMode()) {
        return mockTasks[0]
      }

      const updates: any = {}
      if (progressPercentage !== undefined) {
        updates.progress = progressPercentage
      }

      // 진행 노트는 custom_fields에 저장
      const { data: currentTask } = await db.tasks.get(taskId)
      if (currentTask) {
        const customFields = currentTask.custom_fields || {}
        customFields.progressNotes = customFields.progressNotes || []
        customFields.progressNotes.push({
          note: progressNote,
          timestamp: new Date().toISOString(),
          progress: progressPercentage
        })
        updates.custom_fields = customFields
      }

      const { data, error } = await db.tasks.update(taskId, updates)
      if (error) throw error
      return this.transformTask(data)
    },

    // 업무 완료
    completeTask: async (taskId: string): Promise<WorklyTask> => {
      if (isDevMode()) {
        return { ...mockTasks[0], status: 'completed' }
      }

      const { data, error } = await db.tasks.update(taskId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress: 100
      })

      if (error) throw error
      return this.transformTask(data)
    },

    // 오늘 할 일 최적화된 조회
    getTodayTasksOptimized: async (): Promise<TodayTasksOptimized> => {
      if (isDevMode()) {
        return {
          tasks: mockTasks.filter(task => task.isToday),
          focusedTask: mockTasks.find(task => task.isFocused) || null,
          stats: {
            total: 2,
            completed: 0,
            inProgress: 1,
            pending: 1
          }
        }
      }

      const userId = this.getUserId()
      const { data: allTasks, error } = await db.tasks.list(userId)

      if (error) throw error

      const tasks = (allTasks || []).map(task => this.transformTask(task))
      const todayTasks = tasks.filter(task => task.tags.includes('today'))
      const focusedTask = tasks.find(task => task.tags.includes('focused')) || null

      const stats = {
        total: todayTasks.length,
        completed: todayTasks.filter(task => task.status === 'completed').length,
        inProgress: todayTasks.filter(task => task.status === 'in-progress').length,
        pending: todayTasks.filter(task => task.status === 'todo').length
      }

      return {
        tasks: todayTasks,
        focusedTask,
        stats
      }
    }
  }

  /**
   * 4단계: Review - 검토 및 분석 API
   */
  review = {
    // 리뷰 데이터 추가
    addReview: async (taskId: string, reviewData: CPERWorkflowData['reviewData']): Promise<WorklyTask> => {
      if (isDevMode()) {
        return mockTasks[0]
      }

      const { data: currentTask } = await db.tasks.get(taskId)
      if (!currentTask) throw new Error('업무를 찾을 수 없습니다.')

      const customFields = currentTask.custom_fields || {}
      customFields.reviewData = reviewData

      const { data, error } = await db.tasks.update(taskId, {
        custom_fields: customFields
      })

      if (error) throw error
      return this.transformTask(data)
    },

    // 업무 인사이트 조회
    getTaskInsights: async (taskId: string): Promise<HierarchyAnalytics> => {
      return this.planning.analyzeHierarchy(taskId)
    },

    // 주간 리뷰 데이터
    getWeeklyReview: async (startDate: string, endDate: string): Promise<any> => {
      if (isDevMode()) {
        return {
          period: { startDate, endDate },
          completedTasks: mockTasks.filter(task => task.status === 'completed'),
          productivity: 85,
          insights: []
        }
      }

      const userId = this.getUserId()
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assignee_id', userId)
        .gte('completed_at', startDate)
        .lte('completed_at', endDate)

      if (error) throw error

      return {
        period: { startDate, endDate },
        completedTasks: (tasks || []).map(task => this.transformTask(task)),
        productivity: 85,
        insights: []
      }
    },

    // 월간 리뷰 데이터
    getMonthlyReview: async (year: number, month: number): Promise<any> => {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]
      
      return this.review.getWeeklyReview(startDate, endDate)
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
    list: async (query?: any): Promise<WorklyTask[]> => {
      if (isDevMode()) {
        return mockTasks
      }

      const userId = this.getUserId()
      const { data, error } = await db.tasks.list(userId, query)

      if (error) throw error
      return (data || []).map(task => this.transformTask(task))
    },

    // 업무 상세 조회
    getById: async (id: string): Promise<WorklyTask> => {
      if (isDevMode()) {
        return mockTasks.find(task => task.id === id) || mockTasks[0]
      }

      const { data, error } = await db.tasks.get(id)

      if (error) throw error
      return this.transformTask(data)
    },

    // 업무 생성
    create: async (data: any): Promise<WorklyTask> => {
      if (isDevMode()) {
        const newTask: WorklyTask = {
          id: `mock-task-${Date.now()}`,
          title: data.title,
          description: data.description,
          status: data.status || 'todo',
          priority: data.priority || 'medium',
          type: data.type || 'task',
          assigneeId: 'dev-user-001',
          assignee: {
            id: 'dev-user-001',
            name: '개발자 테스트',
            email: 'dev@workly.com'
          },
          projectId: data.projectId,
          goalId: data.goalId,
          tags: data.tags || [],
          isToday: data.isToday || false,
          isFocused: data.isFocused || false,
          dueDate: data.dueDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        mockTasks.push(newTask)
        return newTask
      }

      const userId = this.getUserId()
      const taskData = {
        ...data,
        assignee_id: data.assigneeId || userId,
        reporter_id: userId,
        project_id: data.projectId || null,
        goal_id: data.goalId || null
      }

      const { data: result, error } = await db.tasks.create(taskData)

      if (error) throw error
      return this.transformTask(result)
    },

    // 업무 업데이트
    update: async (id: string, data: any): Promise<WorklyTask> => {
      if (isDevMode()) {
        const taskIndex = mockTasks.findIndex(task => task.id === id)
        if (taskIndex >= 0) {
          mockTasks[taskIndex] = { ...mockTasks[taskIndex], ...data, updatedAt: new Date().toISOString() }
          return mockTasks[taskIndex]
        }
        return mockTasks[0]
      }

      const updateData = {
        ...data,
        assignee_id: data.assigneeId,
        project_id: data.projectId,
        goal_id: data.goalId,
        due_date: data.dueDate
      }

      // undefined 값들 제거
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key]
        }
      })

      const { data: result, error } = await db.tasks.update(id, updateData)

      if (error) throw error
      return this.transformTask(result)
    },

    // 업무 상세 정보 업데이트 (Notion 스타일 모달용)
    updateDetail: async (id: string, data: any): Promise<WorklyTask> => {
      return this.tasks.update(id, data)
    },

    // 업무 삭제
    delete: async (id: string): Promise<void> => {
      if (isDevMode()) {
        const taskIndex = mockTasks.findIndex(task => task.id === id)
        if (taskIndex >= 0) {
          mockTasks.splice(taskIndex, 1)
        }
        return
      }

      const { error } = await db.tasks.delete(id)
      if (error) throw error
    },

    // 업무 상태 변경
    updateStatus: async (id: string, status: string): Promise<WorklyTask> => {
      const updates: any = { status }
      
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString()
        updates.progress = 100
      } else if (status === 'in-progress') {
        updates.start_date = new Date().toISOString()
      }

      return this.tasks.update(id, updates)
    }
  }

  // 기타 API들...
  projects = {
    list: async () => [],
    getById: async (id: string) => null,
    create: async (data: any) => null,
    update: async (id: string, data: any) => null,
    delete: async (id: string) => {},
    addMember: async (id: string, userId: string, role: string) => {},
    removeMember: async (id: string, userId: string) => {}
  }

  goals = {
    list: async () => [],
    getById: async (id: string) => null,
    create: async (data: any) => null,
    update: async (id: string, data: any) => null,
    delete: async (id: string) => {},
    updateProgress: async (id: string, progress: number) => null
  }

  // =============================================================================
  // 변환 헬퍼 함수들
  // =============================================================================

  private transformTask(task: any): WorklyTask {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      descriptionMarkdown: task.description_markdown,
      status: task.status,
      priority: task.priority,
      type: task.type,
      dueDate: task.due_date,
      scheduledDate: task.start_date,
      assigneeId: task.assignee_id,
      assignee: task.assignee ? {
        id: task.assignee.id,
        name: `${task.assignee.first_name} ${task.assignee.last_name}`,
        email: task.assignee.email || ''
      } : undefined,
      projectId: task.project_id,
      goalId: task.goal_id,
      tags: task.tags || [],
      isToday: (task.tags || []).includes('today'),
      isFocused: (task.tags || []).includes('focused'),
      // 체크리스트, 관계, 위키 참조 등
      checklist: task.checklist || [],
      relationships: task.relationships || [],
      wikiReferences: task.wiki_references || [],
      estimatedTimeMinutes: task.estimated_time_minutes,
      loggedTimeMinutes: task.logged_time_minutes || 0,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }
  }

  private transformInboxItem(item: any): InboxItem {
    return {
      id: item.id,
      content: item.content,
      description: item.description,
      source: item.source,
      status: item.status,
      priority: item.priority,
      context: item.context,
      tags: item.tags || [],
      metadata: item.metadata || {},
      processedAt: item.processed_at,
      convertedToTaskId: item.converted_to_task_id,
      userId: item.user_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }
  }
}

// 싱글톤 인스턴스 생성
export const supabaseApi = new SupabaseApiClient()

// 기본 export
export default supabaseApi