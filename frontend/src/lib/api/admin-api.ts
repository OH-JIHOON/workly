/**
 * 어드민 패널 API 클라이언트
 * 관리자 전용 API 호출을 담당하는 모듈
 */

import { ApiResponse } from '@workly/shared';

// 기본 API 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const ADMIN_API_PREFIX = '/api/admin';

// 에러 타입 정의
export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

// API 응답 타입
interface AdminApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// HTTP 메서드 타입
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API 요청을 보내는 기본 함수
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: {
    method?: HttpMethod;
    data?: any;
    params?: Record<string, string | number>;
    headers?: Record<string, string>;
  } = {}
): Promise<AdminApiResponse<T>> {
  const {
    method = 'GET',
    data,
    params,
    headers: customHeaders = {},
  } = options;

  // URL 구성
  const url = new URL(`${API_BASE_URL}${ADMIN_API_PREFIX}${endpoint}`);
  
  // 쿼리 파라미터 추가
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  // 헤더 설정
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // 인증 토큰 추가 (localStorage에서 가져옴)
  const token = localStorage.getItem('access_token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // 요청 옵션 구성
  const requestOptions: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  // POST, PUT, PATCH 요청인 경우 body 추가
  if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
    requestOptions.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url.toString(), requestOptions);
    
    // 응답이 JSON이 아닐 수 있으므로 체크
    const contentType = response.headers.get('content-type');
    let responseData;

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = { success: false, error: await response.text() };
    }

    // HTTP 에러 상태 체크
    if (!response.ok) {
      throw new AdminApiError(
        responseData?.error || responseData?.message || `HTTP ${response.status}`,
        response.status,
        responseData?.code
      );
    }

    return responseData;
  } catch (error) {
    if (error instanceof AdminApiError) {
      throw error;
    }

    // 네트워크 에러 등 기타 에러
    throw new AdminApiError(
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
      0
    );
  }
}

// =============================================================================
// 대시보드 API
// =============================================================================

export const dashboardApi = {
  /**
   * 대시보드 통계 및 정보 조회
   */
  async getDashboard() {
    return apiRequest('/dashboard');
  },

  /**
   * 관리자 프로필 조회
   */
  async getProfile() {
    return apiRequest('/profile');
  },
};

// =============================================================================
// 사용자 관리 API
// =============================================================================

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export interface UpdateUserRoleRequest {
  role: string;
  permissions: string[];
}

export const usersApi = {
  /**
   * 사용자 목록 조회
   */
  async getUsers(filters: UserFilters = {}) {
    return apiRequest('/users', {
      params: filters as Record<string, string | number>,
    });
  },

  /**
   * 특정 사용자 조회
   */
  async getUser(userId: string) {
    return apiRequest(`/users/${userId}`);
  },

  /**
   * 사용자 역할 및 권한 변경
   */
  async updateUserRole(userId: string, data: UpdateUserRoleRequest) {
    return apiRequest(`/users/${userId}/role`, {
      method: 'PUT',
      data,
    });
  },

  /**
   * 사용자 삭제
   */
  async deleteUser(userId: string) {
    return apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  },
};

// =============================================================================
// 프로젝트 관리 API
// =============================================================================

export interface ProjectFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const projectsApi = {
  /**
   * 프로젝트 목록 조회
   */
  async getProjects(filters: ProjectFilters = {}) {
    return apiRequest('/projects', {
      params: filters as Record<string, string | number>,
    });
  },

  /**
   * 특정 프로젝트 조회
   */
  async getProject(projectId: string) {
    return apiRequest(`/projects/${projectId}`);
  },

  /**
   * 프로젝트 삭제
   */
  async deleteProject(projectId: string) {
    return apiRequest(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },
};

// =============================================================================
// 감사 로그 API
// =============================================================================

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  adminId?: string;
  action?: string;
  targetType?: string;
  startDate?: string;
  endDate?: string;
  success?: boolean;
}

export const auditLogsApi = {
  /**
   * 감사 로그 목록 조회
   */
  async getAuditLogs(filters: AuditLogFilters = {}) {
    const params: Record<string, string | number> = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params[key] = String(value);
      }
    });

    return apiRequest('/audit-logs', { params });
  },

  /**
   * 최근 감사 로그 조회
   */
  async getRecentAuditLogs(adminId?: string, hours: number = 24) {
    const params: Record<string, string | number> = { hours };
    if (adminId) {
      params.adminId = adminId;
    }

    return apiRequest('/audit-logs/recent', { params });
  },
};

// =============================================================================
// 시스템 설정 API
// =============================================================================

export interface SystemSettingsUpdateRequest {
  maintenanceMode?: boolean;
  registrationEnabled?: boolean;
  maxUsersPerProject?: number;
  maxProjectsPerUser?: number;
  emailNotifications?: boolean;
  [key: string]: any;
}

export const settingsApi = {
  /**
   * 시스템 설정 조회
   */
  async getSettings() {
    return apiRequest('/settings');
  },

  /**
   * 시스템 설정 업데이트
   */
  async updateSettings(data: SystemSettingsUpdateRequest) {
    return apiRequest('/settings', {
      method: 'PUT',
      data,
    });
  },
};

// =============================================================================
// 통합 어드민 API 객체
// =============================================================================

export const adminApi = {
  dashboard: dashboardApi,
  users: usersApi,
  projects: projectsApi,
  auditLogs: auditLogsApi,
  settings: settingsApi,
};

// 기본 내보내기
export default adminApi;