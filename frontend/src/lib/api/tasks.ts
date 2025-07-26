/**
 * Task API 클라이언트
 */

import { api } from '../api';
import type {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryDto,
  PaginatedResponse,
  GTDContext,
  SmartFilter,
  TaskStatus,
  TaskPriority,
} from '../../types/task.types';

/**
 * 태스크 생성
 */
export const createTask = async (data: CreateTaskDto): Promise<Task> => {
  return api.post<Task>('/tasks', data);
};

/**
 * 태스크 목록 조회 (필터링, 정렬, 페이징 지원)
 */
export const getTasks = async (query?: TaskQueryDto): Promise<PaginatedResponse<Task>> => {
  const params = new URLSearchParams();
  
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
  }

  const queryString = params.toString();
  const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
  
  return api.get<PaginatedResponse<Task>>(endpoint);
};

/**
 * 특정 태스크 조회
 */
export const getTask = async (id: string): Promise<Task> => {
  return api.get<Task>(`/tasks/${id}`);
};

/**
 * 태스크 수정
 */
export const updateTask = async (id: string, data: UpdateTaskDto): Promise<Task> => {
  return api.put<Task>(`/tasks/${id}`, data);
};

/**
 * 태스크 삭제
 */
export const deleteTask = async (id: string): Promise<void> => {
  return api.delete<void>(`/tasks/${id}`);
};

/**
 * 태스크 상태 변경
 */
export const updateTaskStatus = async (id: string, status: TaskStatus): Promise<Task> => {
  return api.put<Task>(`/tasks/${id}/status?status=${status}`);
};

/**
 * 태스크 우선순위 변경
 */
export const updateTaskPriority = async (id: string, priority: TaskPriority): Promise<Task> => {
  return api.put<Task>(`/tasks/${id}/priority?priority=${priority}`);
};

/**
 * 태스크 진행률 업데이트
 */
export const updateTaskProgress = async (id: string, progress: number): Promise<Task> => {
  return api.put<Task>(`/tasks/${id}/progress?progress=${progress}`);
};

/**
 * 내 태스크 조회 (GTD 컨텍스트별)
 */
export const getMyTasks = async (context?: GTDContext): Promise<Task[]> => {
  const endpoint = context ? `/tasks/my/${context}` : '/tasks/my';
  return api.get<Task[]>(endpoint);
};

/**
 * GTD 스마트 필터 기반 태스크 조회
 */
export const getSmartFilteredTasks = async (filter: SmartFilter): Promise<Task[]> => {
  return api.get<Task[]>(`/tasks/filter/${filter}`);
};

/**
 * 오늘 할 일 조회
 */
export const getTodayTasks = async (): Promise<Task[]> => {
  return getSmartFilteredTasks('today');
};

/**
 * 완료된 태스크 조회
 */
export const getCompletedTasks = async (): Promise<Task[]> => {
  return getSmartFilteredTasks('completed');
};

/**
 * 모든 태스크 조회
 */
export const getAllTasks = async (): Promise<Task[]> => {
  return getSmartFilteredTasks('all');
};

/**
 * 태스크 완료 처리
 */
export const completeTask = async (id: string): Promise<Task> => {
  return updateTaskStatus(id, TaskStatus.DONE);
};

/**
 * 태스크 시작
 */
export const startTask = async (id: string): Promise<Task> => {
  return updateTaskStatus(id, TaskStatus.IN_PROGRESS);
};

/**
 * 태스크 차단
 */
export const blockTask = async (id: string): Promise<Task> => {
  return updateTaskStatus(id, TaskStatus.BLOCKED);
};

/**
 * 태스크 취소
 */
export const cancelTask = async (id: string): Promise<Task> => {
  return updateTaskStatus(id, TaskStatus.CANCELLED);
};

/**
 * 태스크 검토 요청
 */
export const requestTaskReview = async (id: string): Promise<Task> => {
  return updateTaskStatus(id, TaskStatus.IN_REVIEW);
};

/**
 * 태스크 할당
 */
export const assignTask = async (id: string, assigneeId: string): Promise<Task> => {
  return updateTask(id, { assigneeId } as UpdateTaskDto);
};

/**
 * 태스크 할당 해제
 */
export const unassignTask = async (id: string): Promise<Task> => {
  return updateTask(id, { assigneeId: undefined } as UpdateTaskDto);
};

/**
 * 태스크 마감일 설정
 */
export const setTaskDueDate = async (id: string, dueDate: string): Promise<Task> => {
  return updateTask(id, { dueDate });
};

/**
 * 태스크 마감일 제거
 */
export const clearTaskDueDate = async (id: string): Promise<Task> => {
  return updateTask(id, { dueDate: undefined });
};

/**
 * 태스크 태그 추가
 */
export const addTaskTag = async (id: string, tag: string): Promise<Task> => {
  const task = await getTask(id);
  const newTags = [...(task.tags || []), tag];
  return updateTask(id, { tags: newTags });
};

/**
 * 태스크 태그 제거
 */
export const removeTaskTag = async (id: string, tag: string): Promise<Task> => {
  const task = await getTask(id);
  const newTags = (task.tags || []).filter(t => t !== tag);
  return updateTask(id, { tags: newTags });
};

/**
 * 서브태스크 생성
 */
export const createSubtask = async (parentTaskId: string, data: Omit<CreateTaskDto, 'parentTaskId'>): Promise<Task> => {
  return createTask({ ...data, parentTaskId });
};

/**
 * 부모 태스크의 서브태스크 조회
 */
export const getSubtasks = async (parentTaskId: string): Promise<Task[]> => {
  return api.get<Task[]>(`/tasks?parentTaskId=${parentTaskId}&includeSubtasks=true`);
};

/**
 * 프로젝트의 태스크 조회
 */
export const getProjectTasks = async (projectId: string, query?: Omit<TaskQueryDto, 'projectId'>): Promise<PaginatedResponse<Task>> => {
  return getTasks({ ...query, projectId });
};

/**
 * 담당자의 태스크 조회
 */
export const getAssigneeTasks = async (assigneeId: string, query?: Omit<TaskQueryDto, 'assigneeId'>): Promise<PaginatedResponse<Task>> => {
  return getTasks({ ...query, assigneeId });
};

/**
 * 태스크 검색
 */
export const searchTasks = async (searchTerm: string, filters?: Partial<TaskQueryDto>): Promise<PaginatedResponse<Task>> => {
  return getTasks({ ...filters, search: searchTerm });
};

/**
 * 연체된 태스크 조회
 */
export const getOverdueTasks = async (): Promise<Task[]> => {
  const today = new Date();
  const response = await getTasks({
    sortBy: 'dueDate',
    sortOrder: 'ASC',
    limit: 100 // 충분히 큰 수로 설정
  });
  
  return response.items.filter(task => {
    if (!task.dueDate || task.status === TaskStatus.DONE) return false;
    return new Date(task.dueDate) < today;
  });
};

/**
 * 곧 마감되는 태스크 조회 (24시간 이내)
 */
export const getUpcomingTasks = async (): Promise<Task[]> => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  const response = await getTasks({
    sortBy: 'dueDate',
    sortOrder: 'ASC',
    limit: 100
  });
  
  return response.items.filter(task => {
    if (!task.dueDate || task.status === TaskStatus.DONE) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= now && dueDate <= tomorrow;
  });
};

/**
 * 태스크 통계 조회
 */
export const getTaskStats = async (filters?: Partial<TaskQueryDto>) => {
  const response = await getTasks({ ...filters, limit: 1000 }); // 통계를 위해 큰 수로 설정
  const tasks = response.items;
  
  const today = new Date();
  
  return {
    total: tasks.length,
    todo: tasks.filter(t => t.status === TaskStatus.TODO).length,
    inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    done: tasks.filter(t => t.status === TaskStatus.DONE).length,
    blocked: tasks.filter(t => t.status === TaskStatus.BLOCKED).length,
    overdue: tasks.filter(t => {
      if (!t.dueDate || t.status === TaskStatus.DONE) return false;
      return new Date(t.dueDate) < today;
    }).length,
  };
};