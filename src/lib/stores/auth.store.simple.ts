/**
 * 단순화된 Supabase 인증 상태 관리
 * 복잡한 비대칭 암호화 없이 기본 Supabase 인증만 사용
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
          // 환경에 따른 baseUrl 결정
          let baseUrl: string;
          if (typeof window !== 'undefined') {
            baseUrl = window.location.origin;
          } else {
            baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                     (process.env.NODE_ENV === 'production' 
                       ? 'https://workly-silk.vercel.app'
                       : 'http://localhost:3000');
          }
          
          const finalRedirectUrl = redirectUrl || `${baseUrl}/auth/callback`;
          
          console.log('🔑 Google OAuth 로그인 시작:', {
            baseUrl,
            redirectUrl: finalRedirectUrl,
            environment: process.env.NODE_ENV
          });

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: finalRedirectUrl,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              },
            }
          })
          
          if (error) {
            console.error('Google 로그인 오류:', error)
            set({ isLoading: false })
            return { error: error instanceof Error ? error : new Error(String(error)) }
          }
          
          // 로그인 성공 시 사용자 정보는 onAuthStateChange에서 처리
          console.log('✅ Google OAuth 요청 성공')
          return { error: null }
        } catch (error) {
          console.error('Google 로그인 예외:', error)
          set({ isLoading: false })
          return { error: error instanceof Error ? error : new Error(String(error)) }
        }
      },

      // 로그아웃
      signOut: async () => {
        console.log('🚪 로그아웃 시작')
        set({ isLoading: true })
        
        try {
          const { error } = await supabase.auth.signOut({ scope: 'global' })
          
          if (error) {
            console.error('로그아웃 오류:', error)
          } else {
            console.log('✅ Supabase 로그아웃 완료')
          }
          
          // 상태 초기화
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false
          })
          
          // localStorage 완전 정리
          if (typeof window !== 'undefined') {
            localStorage.removeItem('workly-auth-storage')
            localStorage.removeItem('supabase.auth.token')
            localStorage.removeItem('workly-supabase-auth-token')
          }
          
          console.log('✅ 로그아웃 상태 초기화 완료')
          
          // 페이지 새로고침으로 완전 초기화
          setTimeout(() => {
            window.location.href = '/'
          }, 100)
          
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
            return
          }
          
          set({
            user: { ...user, ...data }
          })
        } catch (error) {
          console.error('프로필 업데이트 예외:', error)
        }
      },

      // 사용자 정보 새로고침
      refreshUser: async () => {
        const { session } = get()
        if (!session?.user) return

        try {
          const { data, error } = await profiles.get(session.user.id)
          
          if (error) {
            console.error('사용자 정보 새로고침 오류:', error)
            return
          }
          
          set({
            user: data as UserProfile
          })
        } catch (error) {
          console.error('사용자 정보 새로고침 예외:', error)
        }
      },

      // 초기화
      initialize: async () => {
        console.log('🔄 인증 시스템 초기화 시작')
        set({ isLoading: true })
        
        try {
          // 현재 세션 확인
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          console.log('세션 확인 결과:', {
            hasSession: !!session,
            hasUser: !!session?.user,
            error: sessionError?.message,
            userId: session?.user?.id
          });
          
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
                console.log('프로필 없음 - 자동 생성 시도')
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
            
            console.log('✅ 프로필 로드 성공')
            set({
              user: profileData as UserProfile,
              session,
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            console.log('세션 없음 - 로그아웃 상태')
            set({ 
              user: null, 
              session: null, 
              isAuthenticated: false, 
              isLoading: false
            })
          }
          
          // 인증 상태 변경 리스너 설정
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔄 Auth state changed:', event, session?.user?.email)
            
            if (event === 'SIGNED_IN' && session?.user) {
              console.log('✅ 로그인 이벤트')
              // 로그인: 프로필 정보 로드
              const { data: profileData, error: profileError } = await profiles.get(session.user.id)
              
              if (profileError && profileError.code === 'PGRST116') {
                // 프로필이 없는 경우 생성
                console.log('프로필 생성 중...')
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
              console.log('✅ 로그아웃 이벤트')
              // 로그아웃
              set({
                user: null,
                session: null,
                isAuthenticated: false,
                isLoading: false
              })
            } else if (event === 'TOKEN_REFRESHED' && session) {
              console.log('✅ 토큰 새로고침 이벤트')
              // 토큰 새로고침: 세션만 업데이트
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
      name: 'workly-auth-storage',
      partialize: (state) => ({
        // 기본 상태만 저장
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      skipHydration: false,
    }
  )
)

// OAuth 사용자 정보에서 프로필 생성
async function createProfileFromAuthUser(user: SupabaseUser) {
  console.log('👤 프로필 생성:', user.email)
  
  const userData = {
    id: user.id,
    email: user.email!,
    first_name: user.user_metadata?.first_name || user.user_metadata?.name?.split(' ')[0] || user.email!.split('@')[0],
    last_name: user.user_metadata?.last_name || user.user_metadata?.name?.split(' ')[1] || '',
    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture
  }
  
  return await profiles.upsert(userData)
}

// 편의 함수들
export const getCurrentUser = () => {
  return useSupabaseAuth.getState().user
}

export const isAuthenticated = () => {
  return useSupabaseAuth.getState().isAuthenticated
}

export type { UserProfile as AuthUserProfile }