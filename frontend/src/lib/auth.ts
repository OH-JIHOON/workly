/**
 * 인증 관련 유틸리티와 타입 정의
 */

import { api } from './api';
import { worklyApi } from './api/workly-api';

// 사용자 타입
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'admin' | 'user';
  adminRole?: 'super_admin' | 'admin' | 'moderator' | 'support'; // 추가된 부분
  status: 'active' | 'inactive' | 'pending_verification';
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  profile: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    linkedinUrl: string;
    githubUrl: string;
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    weekStartDay: number;
    notifications: {
      email: boolean;
      push: boolean;
      desktop: boolean;
      mentions: boolean;
      updates: boolean;
      marketing: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'team' | 'private';
      activityVisibility: 'public' | 'team' | 'private';
    };
  };
}

// 로그인 응답 타입
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// 인증 응답 타입
export interface AuthResponse {
  message: string;
  user?: User;
}

// 로그인 DTO
export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// 회원가입 DTO
export interface RegisterDto {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

/**
 * 현재 로그인된 사용자 정보 가져오기
 */
export const getCurrentUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        return null;
      }
    }
  }
  return null;
};

/**
 * 로그인 상태 확인 및 API 클라이언트 토큰 설정
 */
export const isAuthenticated = (): boolean => {
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('accessToken');
    const user = getCurrentUser();
    
    // 토큰이 있으면 API 클라이언트에 설정
    if (accessToken) {
      api.setAuthorizationHeader(accessToken);
      worklyApi.setAuthToken(accessToken);
    }
    
    return !!(accessToken && user);
  }
  return false;
};

/**
 * API 클라이언트 초기화 (페이지 로드 시 호출)
 */
export const initializeApiClients = (): void => {
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      api.setAuthorizationHeader(accessToken);
      worklyApi.setAuthToken(accessToken);
    }
  }
};

/**
 * 토큰 저장
 */
export const saveTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    api.setAuthorizationHeader(accessToken); // 기존 API 클라이언트
    worklyApi.setAuthToken(accessToken); // 워클리 API 클라이언트
  }
};

/**
 * 사용자 정보 저장
 */
export const saveUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

/**
 * 로그인
 */
export const login = async (loginData: LoginDto): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', loginData, { requireAuth: false });
  
  // 토큰과 사용자 정보 저장
  saveTokens(response.accessToken, response.refreshToken);
  saveUser(response.user);
  
  return response;
};

/**
 * 회원가입
 */
export const register = async (registerData: RegisterDto): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', registerData, { requireAuth: false });
  
  // 회원가입 시에는 사용자 정보만 저장 (이메일 인증 필요)
  if (response.user) {
    saveUser(response.user);
  }
  
  return response;
};

/**
 * 로그아웃
 */
export const logout = async (): Promise<void> => {
  try {
    // 백엔드에 로그아웃 요청
    await api.post('/auth/logout');
  } catch (error) {
    console.error('로그아웃 요청 오류:', error);
  } finally {
    // 로컬 데이터 정리
    api.logout();
    
    // 워클리 API 클라이언트 토큰 제거
    worklyApi.setAuthToken('');
    
    // 로컬스토리지에서 토큰 제거
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }
};

/**
 * 현재 사용자 프로필 새로고침
 */
export const refreshUserProfile = async (): Promise<User | null> => {
  try {
    const response = await api.get<{ user: User }>('/auth/profile');
    saveUser(response.user);
    return response.user;
  } catch (error) {
    console.error('사용자 프로필 새로고침 오류:', error);
    return null;
  }
};

/**
 * 비밀번호 변경
 */
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<AuthResponse> => {
  return api.post<AuthResponse>('/auth/change-password', data);
};

/**
 * 비밀번호 재설정 요청
 */
export const forgotPassword = async (email: string): Promise<AuthResponse> => {
  return api.post<AuthResponse>('/auth/forgot-password', { email }, { requireAuth: false });
};

/**
 * 비밀번호 재설정
 */
export const resetPassword = async (data: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<AuthResponse> => {
  return api.post<AuthResponse>('/auth/reset-password', data, { requireAuth: false });
};

/**
 * 이메일 인증
 */
export const verifyEmail = async (token: string): Promise<AuthResponse> => {
  return api.post<AuthResponse>('/auth/verify-email', { token }, { requireAuth: false });
};

/**
 * 인증 이메일 재발송
 */
export const resendVerification = async (email: string): Promise<AuthResponse> => {
  return api.post<AuthResponse>('/auth/resend-verification', { email }, { requireAuth: false });
};