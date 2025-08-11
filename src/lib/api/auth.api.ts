import { supabase } from '../supabase/client';

// 단순한 Supabase 인증 헬퍼 함수들
export const auth = {
  // Google OAuth 로그인
  signInWithGoogle: async (redirectUrl?: string) => {
    console.log('🔑 Google OAuth 로그인 시작');
    
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

  // 로그아웃
  signOut: async () => {
    console.log('🚪 로그아웃 시작');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('로그아웃 오류:', error);
    } else {
      console.log('✅ 로그아웃 성공');
    }
    
    return { error };
  },

  // 현재 세션 가져오기
  getSession: async () => {
    console.log('🔍 세션 조회');
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ 세션 조회 실패:', error);
    } else {
      console.log('✅ 세션 조회 성공');
    }
    
    return { session: data.session, error };
  },

  // 현재 사용자 가져오기
  getUser: async () => {
    console.log('👤 사용자 정보 조회');
    
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('❌ 사용자 조회 실패:', error);
    } else {
      console.log('✅ 사용자 조회 성공');
    }
    
    return { user: data.user, error };
  },

  // getClaims API 호출
  getClaims: async () => {
    console.log('📋 getClaims API 호출');
    
    try {
      const claims = await supabase.auth.getClaims();
      console.log('✅ getClaims 성공:', claims);
      return { claims, error: null };
    } catch (error) {
      console.error('getClaims 오류:', error);
      return { claims: null, error };
    }
  },

  // 인증 상태 변경 리스너
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 인증 상태 변경:', event);
      callback(event, session);
    });
  },

  // 세션 새로고침
  refreshSession: async () => {
    console.log('🔄 세션 새로고침');
    
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.log('❌ 세션 새로고침 실패:', error);
    } else {
      console.log('✅ 세션 새로고침 성공');
    }
    
    return { data, error };
  }
};