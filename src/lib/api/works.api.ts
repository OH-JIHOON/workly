import { supabase } from '../supabase/client';
import type { Database } from '../supabase/client';
import type { Work, CreateWorkDto, UpdateWorkDto, WorkQueryDto, WorkStatus } from '../../types/work.types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Work API - 워클리의 최소 작업 단위 (서버/클라이언트 공용)
export const works = {
  /**
   * 워크 목록 조회 - 사용자별 필터링 지원
   */
  list: async (userId: string, filters?: WorkQueryDto, client?: SupabaseClient) => {
    const supabaseClient = client || supabase;
    let query = supabaseClient
      .from('works')
      .select('*')
      .or(`assignee_id.eq.${userId},reporter_id.eq.${userId}`)

    // 필터 적용
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.projectId) {
      query = query.eq('project_id', filters.projectId)
    }
    if (filters?.assigneeId) {
      query = query.eq('assignee_id', filters.assigneeId)
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }
    if (filters?.dueDate) {
      query = query.lte('due_date', filters.dueDate)
    }

    // 정렬
    const sortBy = filters?.sortBy || 'created_at';
    const sortOrder = filters?.sortOrder === 'ASC' ? true : false;
    query = query.order(sortBy, { ascending: sortOrder })

    // 페이지네이션
    if (filters?.page && filters?.limit) {
      const from = (filters.page - 1) * filters.limit;
      const to = from + filters.limit - 1;
      query = query.range(from, to)
    }

    const { data, error } = await query;
    
    // 워크 타입으로 변환 (단순 버전 사용)
    const works = data?.map(transformWorkToWorkSimple) || [];
    
    return { data: works, error }
  },

  /**
   * 단일 워크 조회 - 상세 정보 포함
   */
  get: async (id: string, client?: SupabaseClient) => {
    const supabaseClient = client || supabase;
    const { data, error } = await supabaseClient
      .from('works')
      .select('*')
      .eq('id', id)
      .single()

    const work = data ? transformWorkToWorkSimple(data) : null;
    
    return { data: work, error }
  },

  /**
   * 워크 생성
   */
  create: async (workData: CreateWorkDto, reporterId: string, client?: SupabaseClient) => {
    const supabaseClient = client || supabase;
    const workInsertData = {
      title: workData.title,
      description: workData.description,
      assignee_id: workData.assigneeId || reporterId, // 기본값: 생성자가 담당자
      reporter_id: reporterId,
      priority: workData.priority || 'medium',
      type: workData.type || 'work',
      status: 'todo', // 기본 상태
    };

    const { data, error } = await supabaseClient
      .from('works')
      .insert(workInsertData)
      .select('*')
      .single()

    const work = data ? transformWorkToWorkSimple(data) : null;
    
    return { data: work, error }
  },

  /**
   * 워크 업데이트
   */
  update: async (id: string, updates: UpdateWorkDto, client?: SupabaseClient) => {
    const supabaseClient = client || supabase;
    const workUpdates = {
      title: updates.title,
      description: updates.description,
      status: updates.status,
      priority: updates.priority,
      type: updates.type,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseClient
      .from('works')
      .update(workUpdates)
      .eq('id', id)
      .select('*')
      .single()

    const work = data ? transformWorkToWorkSimple(data) : null;
    
    return { data: work, error }
  },

  /**
   * 워크 상태 변경 (빠른 업데이트)
   */
  updateStatus: async (id: string, status: WorkStatus, client?: SupabaseClient) => {
    const supabaseClient = client || supabase;
    const updates = {
      status: status,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseClient
      .from('works')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    const work = data ? transformWorkToWorkSimple(data) : null;
    
    return { data: work, error }
  },

  /**
   * 워크 삭제
   */
  delete: async (id: string, client?: SupabaseClient) => {
    const supabaseClient = client || supabase;
    const { error } = await supabaseClient
      .from('works')
      .delete()
      .eq('id', id)

    return { error }
  },

  /**
   * 사용자 워크 통계 조회 - 단순 버전
   */
  getStats: async (userId: string, client?: SupabaseClient) => {
    const supabaseClient = client || supabase;
    try {
      // 직접 카운트 쿼리로 통계 계산 (RPC 사용하지 않음)
      const { data: works, error: worksError } = await supabaseClient
        .from('works')
        .select('status')
        .or(`assignee_id.eq.${userId},reporter_id.eq.${userId}`)

      if (worksError || !works) {
        return { data: null, error: worksError }
      }

      // 통계 계산
      const stats = {
        total: works.length,
        pending: works.filter(w => w.status === 'todo').length,
        in_progress: works.filter(w => w.status === 'in-progress').length,
        completed: works.filter(w => w.status === 'completed').length,
        blocked: works.filter(w => w.status === 'blocked').length,
        deferred: works.filter(w => w.status === 'deferred').length
      }

      return { data: stats, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  },

  /**
   * 오늘 할 일 조회 - 극도로 단순화된 버전
   */
  getTodayWorks: async (userId: string, client?: SupabaseClient) => {
    const supabaseClient = client || supabase;
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('📅 getTodayWorks 호출 - 사용자:', userId, '날짜:', today);
      
      // 핵심 필드만으로 최소 쿼리
      const { data, error } = await supabaseClient
        .from('works')
        .select('id, title, description, status, priority, type, assignee_id, created_at')
        .eq('assignee_id', userId)
        .in('status', ['todo', 'in-progress'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ getTodayWorks 쿼리 오류:', error);
        return { data: [], error };
      }

      console.log('📊 쿼리 결과:', {
        totalTasks: data?.length || 0,
        firstTask: data?.[0] ? { id: data[0].id, title: data[0].title } : null
      });

      // 기본 변환만 수행
      const works = (data || []).map(work => {
        console.log('🔄 변환 중인 work:', { id: work.id, title: work.title, status: work.status });
        return {
          id: work.id,
        title: work.title || '',
        description: work.description || '',
        status: work.status,
        priority: work.priority || 'medium',
        type: work.type || 'work',
        dueDate: null, // works 테이블에는 due_date 필드가 없음
        assigneeId: work.assignee_id,
        tags: [], // works 테이블에는 tags 필드가 없음
        createdAt: work.created_at,
        // 나머지 필드들은 기본값
        projectId: null,
        goalId: null,
        reporterId: null,
        parentWorkId: null,
        estimatedHours: null,
        actualHours: null,
        progress: 0,
        workflowStageId: null,
        customFields: {},
        startDate: null,
        completedAt: null,
        updatedAt: work.created_at,
        project: undefined,
        assignee: undefined,
        reporter: undefined,
        parentWork: undefined,
        subworks: [],
        isOverdue: false,
        isDueSoon: false,
        hasSubworks: false,
        hasDependencies: false,
          hasBlockingDependencies: false
        };
      });
      
      console.log('✅ getTodayWorks 변환 완료:', works.length, '개 작업');
      return { data: works, error: null };
    } catch (err) {
      console.error('getTodayWorks 예외:', err);
      return { data: [], error: err };
    }
  },

  /**
   * 하위 워크 조회 (works 테이블에는 parent_work_id가 없으므로 빈 배열 반환)
   */
  getSubworks: async (parentId: string) => {
    // works 테이블에는 parent_work_id 필드가 없으므로 빈 배열 반환
    return { data: [], error: null }
  }
};

/**
 * Supabase Work 데이터를 Work 타입으로 변환 (단순 버전 - 관계 없이)
 */
function transformWorkToWorkSimple(workData: any): Work {
  return {
    id: workData.id,
    title: workData.title,
    description: workData.description,
    status: workData.status,
    priority: workData.priority,
    type: workData.type,
    assigneeId: workData.assignee_id,
    reporterId: workData.reporter_id,
    createdAt: workData.created_at,
    updatedAt: workData.updated_at,

    // works 테이블에 없는 필드들은 기본값으로 설정
    dueDate: null,
    startDate: null,
    completedAt: null,
    projectId: null,
    goalId: null,
    parentWorkId: null,
    estimatedHours: null,
    actualHours: null,
    progress: 0,
    workflowStageId: null,
    tags: [],
    customFields: {},

    // Relations - 기본값만 사용
    project: undefined,
    assignee: undefined,
    reporter: undefined,
    parentWork: undefined,
    subworks: [],

    // Computed properties
    isOverdue: false, // due_date가 없으므로 항상 false
    isDueSoon: false, // due_date가 없으므로 항상 false
    hasSubworks: false,
    hasDependencies: false,
    hasBlockingDependencies: false
  } as Work;
}

/**
 * Supabase Task 데이터를 Work 타입으로 변환
 */
function transformTaskToWork(taskData: any): Work {
  return {
    id: taskData.id,
    title: taskData.title,
    description: taskData.description,
    status: taskData.status,
    priority: taskData.priority,
    type: taskData.type,
    dueDate: taskData.due_date,
    startDate: taskData.start_date,
    completedAt: taskData.completed_at,
    projectId: taskData.project_id,
    goalId: taskData.goal_id,
    assigneeId: taskData.assignee_id,
    reporterId: taskData.reporter_id,
    parentWorkId: taskData.parent_task_id,
    estimatedHours: taskData.estimated_hours,
    actualHours: taskData.actual_hours,
    progress: taskData.progress,
    workflowStageId: taskData.workflow_stage_id,
    tags: taskData.tags || [],
    customFields: taskData.custom_fields || {},
    createdAt: taskData.created_at,
    updatedAt: taskData.updated_at,

    // Relations
    project: taskData.project_id ? {
      id: taskData.project_id,
      name: 'Unknown Project', // 프로젝트 정보를 별도로 조회하지 않아 기본값 사용
      description: undefined
    } : undefined,
    assignee: taskData.assignee ? {
      id: taskData.assignee.id,
      name: `${taskData.assignee.first_name} ${taskData.assignee.last_name}`.trim(),
      firstName: taskData.assignee.first_name,
      lastName: taskData.assignee.last_name,
      email: taskData.assignee.email,
      avatar: taskData.assignee.avatar_url
    } : undefined,
    reporter: taskData.reporter ? {
      id: taskData.reporter.id,
      name: `${taskData.reporter.first_name} ${taskData.reporter.last_name}`.trim(),
      firstName: taskData.reporter.first_name,
      lastName: taskData.reporter.last_name,
      email: taskData.reporter.email,
      avatar: taskData.reporter.avatar_url
    } : undefined,
    parentWork: taskData.parent_task_id ? {
      id: taskData.parent_task_id,
      title: 'Parent Task', // 간단한 기본값 사용
      status: 'unknown'
    } : undefined,
    subworks: [], // 하위 작업은 별도 API로 조회

    // Computed properties
    isOverdue: taskData.due_date ? new Date(taskData.due_date) < new Date() && taskData.status !== 'completed' : false,
    isDueSoon: taskData.due_date ? new Date(taskData.due_date) <= new Date(Date.now() + 24 * 60 * 60 * 1000) : false,
    hasSubworks: false, // 하위 작업은 별도로 조회하므로 기본값
    hasDependencies: false, // TODO: 의존성 관계 구현 후 업데이트
    hasBlockingDependencies: false // TODO: 의존성 관계 구현 후 업데이트
  } as Work;
}

// 기존 tasks export는 호환성을 위해 유지
export const tasks = works;