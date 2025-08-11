/**
 * 단순한 Supabase 인증 상태 관리
 * supabase.auth.getClaims() API만 사용
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../supabase/client'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { profiles } from '../api/profiles.api'

// 사용자 프로필 타입
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
  
  // getClaims API 사용
  getClaims: () => Promise<any>
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
          const baseUrl = typeof window !== 'undefined' && window.location 
            ? window.location.origin
            : (process.env.NODE_ENV === 'production' 
                ? 'https://workly-silk.vercel.app'
                : 'http://localhost:3000');
          
          const finalRedirectUrl = redirectUrl || `${baseUrl}/auth/callback`;
          
          console.log('🔑 Google OAuth 로그인:', finalRedirectUrl);

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
            return { error }
          }
          
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
          }
          
          // 상태 초기화
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false
          })
          
          // localStorage 정리
          if (typeof window !== 'undefined') {
            localStorage.removeItem('workly-auth-storage')
            localStorage.removeItem('supabase.auth.token')
            localStorage.removeItem('workly-supabase-auth-token')
          }
          
          // 페이지 새로고침
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
            console.error('사용자 정보 새로고침 오료:', error)
            return
          }
          
          set({
            user: data as UserProfile
          })
        } catch (error) {
          console.error('사용자 정보 새로고침 예외:', error)
        }
      },

      // getClaims API 사용
      getClaims: async () => {
        try {
          console.log('📋 getClaims API 호출')
          const claims = await supabase.auth.getClaims()
          console.log('✅ getClaims 성공:', claims)
          return claims
        } catch (error) {
          console.error('getClaims 오류:', error)
          return null
        }
      },

      // 초기화 - 단순하게!
      initialize: async () => {
        console.log('🔄 인증 시스템 초기화')
        set({ isLoading: true })
        
        try {
          // 현재 세션 확인
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError || !session) {
            console.log('세션 없음')
            set({ 
              user: null, 
              session: null, 
              isAuthenticated: false, 
              isLoading: false
            })
            return
          }

          // 프로필 정보 가져오기
          const { data: profileData, error: profileError } = await profiles.get(session.user.id)
          
          if (profileError) {
            // 프로필이 없으면 생성
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
          
          console.log('✅ 프로필 로드 성공')
          set({
            user: profileData as UserProfile,
            session,
            isAuthenticated: true,
            isLoading: false
          })
          
          // 인증 상태 변경 리스너 설정
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event)
            
            if (event === 'SIGNED_IN' && session?.user) {
              // 로그인
              const { data: profileData, error: profileError } = await profiles.get(session.user.id)
              
              if (profileError && profileError.code === 'PGRST116') {
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
              // 토큰 새로고침
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
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
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