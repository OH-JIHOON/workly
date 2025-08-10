/**
 * Supabase 기반 인증 상태 관리
 * Zustand를 사용한 전역 인증 상태
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../supabase/client'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { profiles } from '../api/profiles.api'

// 사용자 프로필 타입 (확장된 정보)
export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url?: string
  role: 'admin' | 'manager' | 'member'
  status: 'active' | 'inactive' | 'pending_verification' | 'suspended'
  admin_role?: 'super_admin' | 'admin' | 'moderator' | 'support'
  level: number
  xp: number
  profile: {
    displayName: string
    bio: string
    location: string
    website: string
    linkedinUrl: string
    githubUrl: string
  }
  preferences: {
    language: string
    timezone: string
    dateFormat: string
    timeFormat: string
    weekStartDay: number
    notifications: {
      email: boolean
      push: boolean
      desktop: boolean
      mentions: boolean
      updates: boolean
      marketing: boolean
    }
    privacy: {
      profileVisibility: 'public' | 'team' | 'private'
      activityVisibility: 'public' | 'team' | 'private'
    }
  }
  created_at: string
  updated_at: string
}

export interface AuthState {
  // 상태
  user: UserProfile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // 액션
  signInWithGoogle: (redirectUrl?: string) => Promise<{ error?: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  refreshUser: () => Promise<void>
  initialize: () => Promise<void>
}

export const useSupabaseAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      // Google OAuth 로그인
      signInWithGoogle: async (redirectUrl) => {
        set({ isLoading: true })
        
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectUrl || `${window.location.origin}/`
            }
          })
          
          if (error) {
            console.error('Google 로그인 오류:', error)
            set({ isLoading: false })
            return { error: error instanceof Error ? error : new Error(String(error)) }
          }
          
          // 로그인 성공 시 사용자 정보는 onAuthStateChange에서 처리
          return { error: null }
        } catch (error) {
          console.error('Google 로그인 예외:', error)
          set({ isLoading: false })
          return { error: error instanceof Error ? error : new Error(String(error)) }
        }
      },

      // 로그아웃
      signOut: async () => {
        set({ isLoading: true })
        
        try {
          const { error } = await supabase.auth.signOut()
          
          if (error) {
            console.error('로그아웃 오류:', error)
          }
          
          // 상태 초기화
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false
          })
          
          // 페이지 새로고침으로 완전 초기화
          window.location.href = '/'
        } catch (error) {
          console.error('로그아웃 예외:', error)
          set({ isLoading: false })
        }
      },

      // 프로필 업데이트
      updateProfile: async (updates) => {
        const { user } = get()
        if (!user) return

        try {
          const { data, error } = await profiles.update(user.id, updates)
          
          if (error) {
            console.error('프로필 업데이트 오류:', error)
            throw error
          }
          
          if (data) {
            set({ user: data as UserProfile })
          }
        } catch (error) {
          console.error('프로필 업데이트 예외:', error)
          throw error
        }
      },

      // 사용자 정보 새로고침
      refreshUser: async () => {
        const { session } = get()
        if (!session?.user?.id) return

        try {
          const { data, error } = await profiles.get(session.user.id)
          
          if (error) {
            console.error('사용자 정보 새로고침 오류:', error)
            return
          }
          
          if (data) {
            set({ user: data as UserProfile })
          }
        } catch (error) {
          console.error('사용자 정보 새로고침 예외:', error)
        }
      },

      // 인증 상태 초기화
      initialize: async () => {
        set({ isLoading: true })
        
        try {
          // 현재 세션 확인
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) {
            console.error('세션 확인 오류:', sessionError)
            set({ 
              user: null, 
              session: null, 
              isAuthenticated: false, 
              isLoading: false 
            })
            return
          }
          
          if (session?.user) {
            // 프로필 정보 가져오기
            const { data: profileData, error: profileError } = await profiles.get(session.user.id)
            
            if (profileError) {
              console.error('프로필 로드 오류:', profileError)
              
              // 프로필이 없는 경우 자동 생성 (OAuth 로그인 후 첫 접속)
              if (profileError.code === 'PGRST116') {
                await createProfileFromAuthUser(session.user)
                const { data: newProfileData } = await profiles.get(session.user.id)
                
                set({
                  user: newProfileData as UserProfile,
                  session,
                  isAuthenticated: true,
                  isLoading: false
                })
              } else {
                set({ 
                  user: null, 
                  session: null, 
                  isAuthenticated: false, 
                  isLoading: false 
                })
              }
              return
            }
            
            set({
              user: profileData as UserProfile,
              session,
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            set({ 
              user: null, 
              session: null, 
              isAuthenticated: false, 
              isLoading: false 
            })
          }
          
          // 인증 상태 변경 리스너 설정
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email)
            
            if (event === 'SIGNED_IN' && session?.user) {
              // 로그인: 프로필 정보 로드
              const { data: profileData, error: profileError } = await profiles.get(session.user.id)
              
              if (profileError && profileError.code === 'PGRST116') {
                // 프로필이 없는 경우 생성
                await createProfileFromAuthUser(session.user)
                const { data: newProfileData } = await profiles.get(session.user.id)
                
                set({
                  user: newProfileData as UserProfile,
                  session,
                  isAuthenticated: true,
                  isLoading: false
                })
              } else if (!profileError && profileData) {
                set({
                  user: profileData as UserProfile,
                  session,
                  isAuthenticated: true,
                  isLoading: false
                })
              }
            } else if (event === 'SIGNED_OUT') {
              // 로그아웃
              set({
                user: null,
                session: null,
                isAuthenticated: false,
                isLoading: false
              })
            } else if (event === 'TOKEN_REFRESHED' && session) {
              // 토큰 갱신
              set({ session, isLoading: false })
            }
          })
          
        } catch (error) {
          console.error('인증 초기화 예외:', error)
          set({ 
            user: null, 
            session: null, 
            isAuthenticated: false, 
            isLoading: false 
          })
        }
      }
    }),
    {
      name: 'supabase-auth-storage',
      partialize: (state) => ({
        // session과 user 정보는 Supabase가 자동 관리하므로 저장하지 않음
        // 필요한 경우에만 특정 설정값들만 persist
      }),
    }
  )
)

// OAuth 사용자 정보에서 프로필 생성
async function createProfileFromAuthUser(user: SupabaseUser) {
  const userData = {
    id: user.id,
    email: user.email!,
    first_name: user.user_metadata?.first_name || user.user_metadata?.name?.split(' ')[0] || user.email!.split('@')[0],
    last_name: user.user_metadata?.last_name || user.user_metadata?.name?.split(' ')[1] || '',
    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture
  }
  
  return await profiles.upsert(userData)
}

// 개발 모드 체크 함수
export const isDevMode = () => {
  return process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_MODE === 'true'
}

// 개발 모드용 가짜 사용자 데이터
export const getDevUser = (): UserProfile => ({
  id: 'dev-user-001',
  email: 'dev@workly.com',
  first_name: '개발자',
  last_name: '테스트',
  avatar_url: 'https://via.placeholder.com/100x100.png?text=DEV',
  role: 'admin',
  status: 'active',
  admin_role: 'super_admin',
  level: 1,
  xp: 0,
  profile: {
    displayName: '개발자 테스트',
    bio: '개발 및 테스트용 계정입니다.',
    location: '서울, 대한민국',
    website: 'https://workly.com',
    linkedinUrl: '',
    githubUrl: ''
  },
  preferences: {
    language: 'ko',
    timezone: 'Asia/Seoul',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    weekStartDay: 1,
    notifications: {
      email: true,
      push: true,
      desktop: true,
      mentions: true,
      updates: true,
      marketing: false
    },
    privacy: {
      profileVisibility: 'public',
      activityVisibility: 'team'
    }
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
})

// 편의 함수들 (기존 auth.ts와 호환성 유지)
export const getCurrentUser = (): UserProfile | null => {
  if (isDevMode()) {
    return getDevUser()
  }
  
  return useSupabaseAuth.getState().user
}

export const isAuthenticated = (): boolean => {
  if (isDevMode()) {
    return true
  }
  
  return useSupabaseAuth.getState().isAuthenticated
}

// 기본 export
export default useSupabaseAuth

// 다른 파일들과의 호환성을 위한 alias
export const useAuthStore = useSupabaseAuth