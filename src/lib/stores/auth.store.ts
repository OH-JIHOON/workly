import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

// 클라이언트 컴포넌트에서 사용할 클라이언트 인스턴스 생성
const supabase = createClient();

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: any;
  isInitialized: boolean;
  isAuthenticated: boolean;
  init: () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const getOAuthRedirectUrl = () => {
  let url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000/';
  // 마지막에 '/'가 없는지 확인하고 추가
  url = url.endsWith('/') ? url : `${url}/`;
  return `${url}auth/callback`;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  error: null,
  isInitialized: false,
  isAuthenticated: false,

  init: () => {
    if (get().isInitialized) return;

    supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      console.log('onAuthStateChange', event, session);
      set({ 
        user: session?.user ?? null, 
        session, 
        isAuthenticated: !!session?.user,
        isInitialized: true, 
        loading: false 
      });
    });

    // 초기 세션 정보를 가져옵니다.
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ 
        user: session?.user ?? null, 
        session, 
        isAuthenticated: !!session?.user,
        isInitialized: true, 
        loading: false 
      });
    }).catch(error => {
      console.error('Error getting initial session:', error);
      set({ isInitialized: true, loading: false, error });
    });

    set({ loading: false, isInitialized: true });
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getOAuthRedirectUrl(),
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      set({ error, loading: false });
    }
  },

  signOut: async () => {
    // 1. 클라이언트 상태를 먼저 로그아웃으로 변경 (낙관적 업데이트)
    set({ user: null, session: null, isAuthenticated: false, loading: true, error: null });
    
    try {
      // 2. 서버에 로그아웃 요청
      const { error } = await supabase.auth.signOut();
      if (error) {
        // 서버 로그아웃 실패 시 에러 처리
        console.error('로그아웃 서버 오류:', error);
        set({ error });
      }
    } catch (error) {
      console.error('로그아웃 예외:', error);
      set({ error });
    } finally {
      set({ loading: false });
    }
  },
}));


