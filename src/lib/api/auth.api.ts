import { supabase } from '../supabase/client';
import { asymmetricAuth, type AuthVerificationResult } from '../auth/asymmetric-auth';

// 비대칭 암호화 기반 인증 헬퍼 함수들
export const auth = {
  // Google OAuth 로그인 (기존 방식 유지, 비대칭 검증 추가)
  signInWithGoogle: async (redirectUrl?: string) => {
    console.log('🔑 Google OAuth 로그인 시작 (비대칭 암호화 적용)');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl || `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error('OAuth 로그인 오류:', error);
    } else {
      console.log('✅ OAuth 로그인 요청 성공');
    }
    
    return { data, error };
  },

  // 로그아웃 (세션 완전 제거)
  signOut: async () => {
    console.log('🚪 로그아웃 시작 (비대칭 세션 정리)');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('로그아웃 오류:', error);
    } else {
      console.log('✅ 로그아웃 성공');
    }
    
    return { error };
  },

  // 비대칭 검증을 통한 현재 세션 가져오기
  getSession: async () => {
    console.log('🔍 세션 조회 (비대칭 검증)');
    
    const verificationResult = await asymmetricAuth.verifyClientToken();
    
    if (verificationResult.success && verificationResult.session) {
      console.log('✅ 검증된 세션 조회 성공');
      return { 
        session: verificationResult.session, 
        error: null,
        verified: true
      };
    } else {
      console.log('❌ 세션 검증 실패:', verificationResult.error);
      return { 
        session: null, 
        error: verificationResult.error,
        verified: false
      };
    }
  },

  // 비대칭 검증을 통한 현재 사용자 가져오기
  getUser: async () => {
    console.log('👤 사용자 정보 조회 (비대칭 검증)');
    
    const verificationResult = await asymmetricAuth.verifyClientToken();
    
    if (verificationResult.success && verificationResult.user) {
      console.log('✅ 검증된 사용자 정보 조회 성공');
      return { 
        user: verificationResult.user, 
        error: null,
        claims: verificationResult.claims,
        verified: true
      };
    } else {
      console.log('❌ 사용자 검증 실패:', verificationResult.error);
      return { 
        user: null, 
        error: verificationResult.error,
        verified: false
      };
    }
  },

  // 비대칭 JWT 토큰 직접 검증
  verifyToken: async (): Promise<AuthVerificationResult> => {
    console.log('🔒 JWT 토큰 비대칭 검증');
    return await asymmetricAuth.verifyClientToken();
  },

  // 사용자 권한 확인
  hasPermission: async (requiredRole: string): Promise<boolean> => {
    const verificationResult = await asymmetricAuth.verifyClientToken();
    
    if (!verificationResult.success || !verificationResult.claims) {
      return false;
    }
    
    return asymmetricAuth.hasPermission(verificationResult.claims, requiredRole);
  },

  // 관리자 권한 확인
  isAdmin: async (): Promise<boolean> => {
    const verificationResult = await asymmetricAuth.verifyClientToken();
    
    if (!verificationResult.success || !verificationResult.claims) {
      return false;
    }
    
    return asymmetricAuth.isAdmin(verificationResult.claims);
  },

  // 토큰 만료 확인
  isTokenExpired: async (): Promise<boolean> => {
    const verificationResult = await asymmetricAuth.verifyClientToken();
    
    if (!verificationResult.success || !verificationResult.claims) {
      return true;
    }
    
    return asymmetricAuth.isTokenExpired(verificationResult.claims);
  },

  // 토큰 새로고침 필요 여부
  needsRefresh: async (): Promise<boolean> => {
    const verificationResult = await asymmetricAuth.verifyClientToken();
    
    if (!verificationResult.success || !verificationResult.claims) {
      return true;
    }
    
    return asymmetricAuth.needsRefresh(verificationResult.claims);
  },

  // 인증 상태 변경 리스너 (비대칭 검증 포함)
  onAuthStateChange: (callback: (event: string, session: any, verified?: boolean) => void) => {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 인증 상태 변경:', event);
      
      if (session) {
        // 상태 변경 시 비대칭 검증 수행
        const verificationResult = await asymmetricAuth.verifyClientToken();
        callback(event, session, verificationResult.success);
      } else {
        callback(event, session, false);
      }
    });
  },

  // 세션 새로고침 (비대칭 검증 포함)
  refreshSession: async () => {
    console.log('🔄 세션 새로고침 (비대칭 검증)');
    
    const { data, error } = await supabase.auth.refreshSession();
    
    if (!error && data.session) {
      // 새로고침된 세션에 대해 비대칭 검증 수행
      const verificationResult = await asymmetricAuth.verifyClientToken();
      
      return {
        data,
        error,
        verified: verificationResult.success
      };
    }
    
    return { data, error, verified: false };
  }
};