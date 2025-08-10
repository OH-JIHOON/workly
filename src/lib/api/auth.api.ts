import { supabase } from '../supabase/client';

// 인증 헬퍼 함수들
export const auth = {
  // Google OAuth 로그인
  signInWithGoogle: async (redirectUrl?: string) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl || `${window.location.origin}/`
      }
    })
    return { data, error }
  },

  // 로그아웃
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // 현재 세션 가져오기
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // 현재 사용자 가져오기
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // 인증 상태 변경 리스너
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
};