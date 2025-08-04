/**
 * 어드민 API를 위한 React 훅들
 * SWR을 활용한 데이터 페칭 및 상태 관리
 */

import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { 
  adminApi, 
  AdminApiError, 
  UserFilters, 
  ProjectFilters, 
  AuditLogFilters,
  UpdateUserRoleRequest,
  SystemSettingsUpdateRequest,
} from '../api/admin-api';

// =============================================================================
// 기본 훅
// =============================================================================

/**
 * API 요청 상태 타입
 */
interface ApiState {
  loading: boolean;
  error: string | null;
}

/**
 * API 요청 상태를 관리하는 기본 훅
 */
export function useApiState(): [ApiState, (loading: boolean, error?: string | null) => void] {
  const [state, setState] = useState<ApiState>({ loading: false, error: null });

  const setApiState = useCallback((loading: boolean, error: string | null = null) => {
    setState({ loading, error });
  }, []);

  return [state, setApiState];
}

/**
 * 에러 처리 유틸리티
 */
export function handleApiError(error: unknown): string {
  if (error instanceof AdminApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return '알 수 없는 오류가 발생했습니다';
}

// =============================================================================
// 대시보드 훅
// =============================================================================

/**
 * 어드민 대시보드 데이터 훅
 */
export function useAdminDashboard() {
  const { data, error, isLoading, mutate } = useSWR(
    '/admin/dashboard',
    () => adminApi.dashboard.getDashboard()
  );

  return {
    dashboard: data?.data,
    isLoading,
    error: error ? handleApiError(error) : null,
    refresh: mutate,
  };
}

/**
 * 관리자 프로필 훅
 */
export function useAdminProfile() {
  const { data, error, isLoading, mutate } = useSWR(
    '/admin/profile',
    () => adminApi.dashboard.getProfile()
  );

  return {
    profile: data?.data,
    isLoading,
    error: error ? handleApiError(error) : null,
    refresh: mutate,
  };
}

// =============================================================================
// 사용자 관리 훅
// =============================================================================

/**
 * 사용자 목록 훅
 */
export function useUsers(filters: UserFilters = {}) {
  const key = `/admin/users?${new URLSearchParams(
    Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  )}`;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => adminApi.users.getUsers(filters)
  );

  return {
    users: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error: error ? handleApiError(error) : null,
    refresh: mutate,
  };
}

/**
 * 특정 사용자 훅
 */
export function useUser(userId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/admin/users/${userId}` : null,
    () => adminApi.users.getUser(userId)
  );

  return {
    user: data?.data,
    isLoading,
    error: error ? handleApiError(error) : null,
    refresh: mutate,
  };
}

/**
 * 사용자 관리 액션 훅
 */
export function useUserActions() {
  const [state, setApiState] = useApiState();

  const updateUserRole = useCallback(async (userId: string, data: UpdateUserRoleRequest) => {
    setApiState(true);
    try {
      const result = await adminApi.users.updateUserRole(userId, data);
      
      // 관련 캐시 무효화
      await mutate(`/admin/users/${userId}`);
      await mutate((key) => typeof key === 'string' && key.startsWith('/admin/users?'));
      
      setApiState(false);
      return result;
    } catch (error) {
      setApiState(false, handleApiError(error));
      throw error;
    }
  }, [setApiState]);

  const deleteUser = useCallback(async (userId: string) => {
    setApiState(true);
    try {
      const result = await adminApi.users.deleteUser(userId);
      
      // 관련 캐시 무효화
      await mutate((key) => typeof key === 'string' && key.startsWith('/admin/users'));
      
      setApiState(false);
      return result;
    } catch (error) {
      setApiState(false, handleApiError(error));
      throw error;
    }
  }, [setApiState]);

  return {
    updateUserRole,
    deleteUser,
    loading: state.loading,
    error: state.error,
  };
}

// =============================================================================
// 프로젝트 관리 훅
// =============================================================================

/**
 * 프로젝트 목록 훅
 */
export function useProjects(filters: ProjectFilters = {}) {
  const key = `/admin/projects?${new URLSearchParams(
    Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  )}`;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => adminApi.projects.getProjects(filters)
  );

  return {
    projects: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error: error ? handleApiError(error) : null,
    refresh: mutate,
  };
}

/**
 * 특정 프로젝트 훅
 */
export function useProject(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    projectId ? `/admin/projects/${projectId}` : null,
    () => adminApi.projects.getProject(projectId)
  );

  return {
    project: data?.data,
    isLoading,
    error: error ? handleApiError(error) : null,
    refresh: mutate,
  };
}

/**
 * 프로젝트 관리 액션 훅
 */
export function useProjectActions() {
  const [state, setApiState] = useApiState();

  const deleteProject = useCallback(async (projectId: string) => {
    setApiState(true);
    try {
      const result = await adminApi.projects.deleteProject(projectId);
      
      // 관련 캐시 무효화
      await mutate((key) => typeof key === 'string' && key.startsWith('/admin/projects'));
      
      setApiState(false);
      return result;
    } catch (error) {
      setApiState(false, handleApiError(error));
      throw error;
    }
  }, [setApiState]);

  return {
    deleteProject,
    loading: state.loading,
    error: state.error,
  };
}

// =============================================================================
// 감사 로그 훅
// =============================================================================

/**
 * 감사 로그 목록 훅
 */
export function useAuditLogs(filters: AuditLogFilters = {}) {
  const key = `/admin/audit-logs?${new URLSearchParams(
    Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  )}`;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => adminApi.auditLogs.getAuditLogs(filters)
  );

  return {
    auditLogs: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error: error ? handleApiError(error) : null,
    refresh: mutate,
  };
}

/**
 * 최근 감사 로그 훅
 */
export function useRecentAuditLogs(adminId?: string, hours: number = 24) {
  const key = `/admin/audit-logs/recent?${new URLSearchParams({
    ...(adminId && { adminId }),
    hours: String(hours),
  })}`;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => adminApi.auditLogs.getRecentAuditLogs(adminId, hours)
  );

  return {
    recentLogs: data?.data || [],
    isLoading,
    error: error ? handleApiError(error) : null,
    refresh: mutate,
  };
}

// =============================================================================
// 시스템 설정 훅
// =============================================================================

/**
 * 시스템 설정 훅
 */
export function useSystemSettings() {
  const { data, error, isLoading, mutate } = useSWR(
    '/admin/settings',
    () => adminApi.settings.getSettings()
  );

  return {
    settings: data?.data,
    isLoading,
    error: error ? handleApiError(error) : null,
    refresh: mutate,
  };
}

/**
 * 시스템 설정 업데이트 훅
 */
export function useSystemSettingsActions() {
  const [state, setApiState] = useApiState();

  const updateSettings = useCallback(async (data: SystemSettingsUpdateRequest) => {
    setApiState(true);
    try {
      const result = await adminApi.settings.updateSettings(data);
      
      // 설정 캐시 무효화
      await mutate('/admin/settings');
      
      setApiState(false);
      return result;
    } catch (error) {
      setApiState(false, handleApiError(error));
      throw error;
    }
  }, [setApiState]);

  return {
    updateSettings,
    loading: state.loading,
    error: state.error,
  };
}

// =============================================================================
// 통합 훅 (선택적 사용)
// =============================================================================

/**
 * 모든 어드민 데이터를 한 번에 관리하는 통합 훅
 * 초기 로딩이나 전체 데이터 갱신이 필요할 때 사용
 */
export function useAdminData() {
  const dashboard = useAdminDashboard();
  const users = useUsers();
  const projects = useProjects();
  const auditLogs = useAuditLogs();
  const settings = useSystemSettings();

  const refreshAll = useCallback(async () => {
    await Promise.all([
      dashboard.refresh(),
      users.refresh(),
      projects.refresh(),
      auditLogs.refresh(),
      settings.refresh(),
    ]);
  }, [dashboard, users, projects, auditLogs, settings]);

  const isLoading = dashboard.isLoading || users.isLoading || projects.isLoading || 
                   auditLogs.isLoading || settings.isLoading;

  const hasError = !!(dashboard.error || users.error || projects.error || 
                     auditLogs.error || settings.error);

  return {
    dashboard: dashboard.dashboard,
    users: users.users,
    projects: projects.projects,
    auditLogs: auditLogs.auditLogs,
    settings: settings.settings,
    isLoading,
    hasError,
    refreshAll,
  };
}