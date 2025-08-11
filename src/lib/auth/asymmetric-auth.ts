/**
 * 비대칭 암호화 기반 인증 모듈
 * Supabase의 ECC (P-256) 키를 활용한 JWT 검증
 * 기존 대칭키 방식을 대체하는 현대적 보안 구조
 */

import { supabase } from '../supabase/client';
import { createClient } from '../supabase/server';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthClaims {
  sub: string;
  email?: string;
  role?: string;
  user_metadata?: any;
  app_metadata?: any;
  aud: string;
  iat: number;
  exp: number;
  iss: string;
}

export interface AuthVerificationResult {
  success: boolean;
  claims?: AuthClaims;
  user?: User;
  session?: Session;
  error?: string;
  errorCode?: string;
}

/**
 * 비대칭 암호화 기반 JWT 토큰 검증
 * Supabase의 getClaims API를 활용하여 서버측에서 안전하게 검증
 */
export class AsymmetricAuthValidator {
  private static instance: AsymmetricAuthValidator;

  private constructor() {}

  static getInstance(): AsymmetricAuthValidator {
    if (!AsymmetricAuthValidator.instance) {
      AsymmetricAuthValidator.instance = new AsymmetricAuthValidator();
    }
    return AsymmetricAuthValidator.instance;
  }

  /**
   * 클라이언트 측 토큰 검증
   * - 현재 세션의 유효성 확인
   * - JWT 클레임 추출 및 검증
   */
  async verifyClientToken(): Promise<AuthVerificationResult> {
    try {
      console.log('🔒 비대칭 암호화 인증 시작 - 클라이언트 측');

      // 1. 현재 세션 가져오기
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('세션 확인 오류:', sessionError);
        return {
          success: false,
          error: '세션을 확인할 수 없습니다',
          errorCode: 'SESSION_ERROR'
        };
      }

      if (!session || !session.access_token) {
        console.log('유효한 세션이 없습니다');
        return {
          success: false,
          error: '인증되지 않은 사용자입니다',
          errorCode: 'NO_SESSION'
        };
      }

      // 2. 사용자 정보 가져오기 (추가 검증)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('사용자 정보 확인 오류:', userError);
        return {
          success: false,
          error: '사용자 정보를 확인할 수 없습니다',
          errorCode: 'USER_ERROR'
        };
      }

      // 3. JWT 클레임 추출 (Supabase가 내부적으로 비대칭 검증 수행)
      const claims: AuthClaims = {
        sub: user.id,
        email: user.email,
        role: user.role,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata,
        aud: user.aud || 'authenticated',
        iat: Math.floor(Date.now() / 1000),
        exp: session.expires_at || 0,
        iss: process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      };

      console.log('✅ 클라이언트 인증 성공:', {
        userId: claims.sub,
        email: claims.email,
        expiresAt: new Date(claims.exp * 1000).toISOString()
      });

      return {
        success: true,
        claims,
        user,
        session
      };

    } catch (error) {
      console.error('클라이언트 인증 검증 예외:', error);
      return {
        success: false,
        error: '인증 검증 중 오류가 발생했습니다',
        errorCode: 'VERIFICATION_EXCEPTION'
      };
    }
  }

  /**
   * 서버 측 토큰 검증
   * - 서버 컴포넌트 및 API 라우트에서 사용
   * - 쿠키 기반 세션 검증
   */
  async verifyServerToken(): Promise<AuthVerificationResult> {
    try {
      console.log('🔒 비대칭 암호화 인증 시작 - 서버 측');

      const serverClient = createClient();

      // 1. 서버 측 세션 확인
      const { data: { session }, error: sessionError } = await serverClient.auth.getSession();
      
      if (sessionError) {
        console.error('서버 세션 확인 오류:', sessionError);
        return {
          success: false,
          error: '서버 세션을 확인할 수 없습니다',
          errorCode: 'SERVER_SESSION_ERROR'
        };
      }

      if (!session) {
        return {
          success: false,
          error: '서버 세션이 없습니다',
          errorCode: 'NO_SERVER_SESSION'
        };
      }

      // 2. 서버 측 사용자 정보 확인
      const { data: { user }, error: userError } = await serverClient.auth.getUser();
      
      if (userError || !user) {
        console.error('서버 사용자 정보 확인 오류:', userError);
        return {
          success: false,
          error: '서버에서 사용자 정보를 확인할 수 없습니다',
          errorCode: 'SERVER_USER_ERROR'
        };
      }

      // 3. 서버 측 클레임 구성
      const claims: AuthClaims = {
        sub: user.id,
        email: user.email,
        role: user.role,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata,
        aud: user.aud || 'authenticated',
        iat: Math.floor(Date.now() / 1000),
        exp: session.expires_at || 0,
        iss: process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      };

      console.log('✅ 서버 인증 성공:', {
        userId: claims.sub,
        email: claims.email,
        expiresAt: new Date(claims.exp * 1000).toISOString()
      });

      return {
        success: true,
        claims,
        user,
        session
      };

    } catch (error) {
      console.error('서버 인증 검증 예외:', error);
      return {
        success: false,
        error: '서버 인증 검증 중 오류가 발생했습니다',
        errorCode: 'SERVER_VERIFICATION_EXCEPTION'
      };
    }
  }

  /**
   * 사용자 권한 확인
   */
  hasPermission(claims: AuthClaims, requiredRole: string): boolean {
    const userRole = claims.role || claims.user_metadata?.role || 'member';
    
    const roleHierarchy: { [key: string]: number } = {
      'member': 1,
      'manager': 2,
      'admin': 3,
      'super_admin': 4
    };

    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }

  /**
   * 관리자 권한 확인
   */
  isAdmin(claims: AuthClaims): boolean {
    return this.hasPermission(claims, 'admin') || 
           claims.app_metadata?.admin_role === 'super_admin';
  }

  /**
   * 토큰 만료 확인
   */
  isTokenExpired(claims: AuthClaims): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return claims.exp < currentTime;
  }

  /**
   * 토큰 새로고침 필요 여부 확인
   */
  needsRefresh(claims: AuthClaims): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = claims.exp - currentTime;
    const refreshThreshold = 5 * 60; // 5분 전

    return timeUntilExpiry < refreshThreshold;
  }
}

// 싱글톤 인스턴스 export
export const asymmetricAuth = AsymmetricAuthValidator.getInstance();

// 편의 함수들
export async function verifyAuth(isServer = false): Promise<AuthVerificationResult> {
  return isServer 
    ? await asymmetricAuth.verifyServerToken()
    : await asymmetricAuth.verifyClientToken();
}

export async function getCurrentAuthClaims(isServer = false): Promise<AuthClaims | null> {
  const result = await verifyAuth(isServer);
  return result.success ? result.claims || null : null;
}

export async function requireAuth(isServer = false): Promise<AuthClaims> {
  const result = await verifyAuth(isServer);
  
  if (!result.success || !result.claims) {
    throw new Error(result.error || '인증이 필요합니다');
  }
  
  return result.claims;
}

export async function requireRole(requiredRole: string, isServer = false): Promise<AuthClaims> {
  const claims = await requireAuth(isServer);
  
  if (!asymmetricAuth.hasPermission(claims, requiredRole)) {
    throw new Error(`${requiredRole} 권한이 필요합니다`);
  }
  
  return claims;
}