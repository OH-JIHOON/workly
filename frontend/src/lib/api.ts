/**
 * API 클라이언트 유틸리티
 * JWT 토큰을 자동으로 포함하여 백엔드와 통신
 */

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

interface ApiError extends Error {
  status?: number;
  statusText?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  }

  /**
   * API 요청을 보내는 기본 메서드
   */
  private async request<T>(
    endpoint: string, 
    options: ApiOptions = {}
  ): Promise<T> {
    const { requireAuth = true, ...requestOptions } = options;
    
    const url = `${this.baseUrl}${endpoint}`;
    
    // 기본 헤더 설정
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...requestOptions.headers,
    };

    // 인증이 필요한 경우 토큰 추가
    if (requireAuth) {
      const accessToken = this.getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...requestOptions,
        headers,
      });

      // 401 에러인 경우 토큰 갱신 시도
      if (response.status === 401 && requireAuth) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // 토큰 갱신 성공 시 재시도
          const accessToken = this.getAccessToken();
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          const retryResponse = await fetch(url, {
            ...requestOptions,
            headers,
          });
          
          return this.handleResponse<T>(retryResponse);
        } else {
          // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
          this.handleAuthFailure();
          throw new Error('Authentication failed');
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('API 요청 오류:', error);
      throw error;
    }
  }

  /**
   * 응답 처리
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.statusText = response.statusText;
      
      // 에러 메시지가 있는 경우 포함
      try {
        const errorData = await response.json();
        if (errorData.message) {
          error.message = errorData.message;
        }
      } catch {
        // JSON 파싱 실패 시 기본 에러 메시지 사용
      }
      
      throw error;
    }

    // 응답이 비어있는 경우 처리
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      return response.text() as unknown as T;
    }
  }

  /**
   * GET 요청
   */
  async get<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST 요청
   */
  async post<T>(endpoint: string, data?: any, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT 요청
   */
  async put<T>(endpoint: string, data?: any, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE 요청
   */
  async delete<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * 액세스 토큰 가져오기
   */
  private getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  /**
   * 리프레시 토큰 가져오기
   */
  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  /**
   * 토큰 갱신
   */
  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('토큰 갱신 오류:', error);
      return false;
    }
  }

  /**
   * 인증 실패 처리
   */
  private handleAuthFailure(): void {
    // 토큰 제거
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // 로그인 페이지로 리다이렉트
      window.location.href = '/auth/login?error=session_expired';
    }
  }

  /**
   * 수동 로그아웃
   */
  logout(): void {
    this.handleAuthFailure();
  }
}

// 싱글톤 인스턴스 생성
export const apiClient = new ApiClient();

// 편의를 위한 직접 내보내기
export const api = {
  get: <T>(endpoint: string, options?: ApiOptions) => apiClient.get<T>(endpoint, options),
  post: <T>(endpoint: string, data?: any, options?: ApiOptions) => apiClient.post<T>(endpoint, data, options),
  put: <T>(endpoint: string, data?: any, options?: ApiOptions) => apiClient.put<T>(endpoint, data, options),
  delete: <T>(endpoint: string, options?: ApiOptions) => apiClient.delete<T>(endpoint, options),
  logout: () => apiClient.logout(),
};

export default apiClient;