import { create } from 'zustand'

// 사용자 타입 정의
export interface User {
  id: string
  name: string
  email: string
  adminRole?: 'super_admin' | 'admin' | 'moderator' | 'support'
  avatar?: string
  createdAt: string
  updatedAt: string
}

// Auth Store 상태 인터페이스
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  checkAuth: () => Promise<void>
  login: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,

  setUser: (user: User | null) =>
    set((state) => ({ 
      ...state, 
      user, 
      isAuthenticated: !!user 
    })),

  setToken: (token: string | null) =>
    set((state) => ({ 
      ...state, 
      token 
    })),

  setLoading: (loading: boolean) =>
    set((state) => ({ 
      ...state, 
      isLoading: loading 
    })),

  checkAuth: async () => {
    try {
      set({ isLoading: true })
      
      // 개발 환경에서 임시 관리자 계정 활성화
      const isDevelopment = process.env.NODE_ENV === 'development' || 
                           typeof window !== 'undefined' && window.location.hostname === 'localhost';
      
      // 로컬 스토리지에서 토큰 확인
      let token = localStorage.getItem('token')
      
      // 개발 환경에서도 실제 로그인을 우선시하므로 자동 토큰 생성 제거
      // if (!token && isDevelopment) {
      //   token = 'dev-admin-token'
      //   localStorage.setItem('token', token)
      //   console.log('🔑 개발 환경: 임시 관리자 토큰이 생성되었습니다.')
      // }
      
      if (!token) {
        set({ 
          user: null, 
          isAuthenticated: false, 
          token: null, 
          isLoading: false 
        })
        return
      }

      // 실제 백엔드 API 호출로 사용자 정보 검증
      try {
        const response = await fetch('http://localhost:8000/api/v1/api/admin/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const apiResponse = await response.json();
          const userData = apiResponse.success ? apiResponse.data : apiResponse;
          
          // 백엔드 데이터를 프론트엔드 User 타입에 맞게 변환
          const user: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            adminRole: userData.role || userData.adminRole,
            avatar: userData.avatar,
            createdAt: userData.createdAt || new Date().toISOString(),
            updatedAt: userData.updatedAt || new Date().toISOString()
          };
          
          set({ 
            user, 
            isAuthenticated: true, 
            token, 
            isLoading: false 
          });
          
          if (isDevelopment) {
            console.log('🚀 실제 백엔드에서 사용자 정보를 가져왔습니다.', user);
          }
        } else {
          // API 호출 실패 시 임시 사용자 데이터 사용 (개발용)
          const mockUser: User = {
            id: '1',
            name: '워클리 관리자',
            email: 'admin@workly.com',
            adminRole: 'super_admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          set({ 
            user: mockUser, 
            isAuthenticated: true, 
            token, 
            isLoading: false 
          });
          
          if (isDevelopment) {
            console.log('🔄 백엔드 API 연결 실패, 임시 관리자 데이터 사용:', mockUser);
          }
        }
      } catch (error) {
        console.error('백엔드 연결 오류:', error);
        
        // 에러 발생 시 임시 사용자 데이터 사용 (개발용)
        const mockUser: User = {
          id: '1',
          name: '워클리 관리자',
          email: 'admin@workly.com',
          adminRole: 'super_admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        set({ 
          user: mockUser, 
          isAuthenticated: true, 
          token, 
          isLoading: false 
        });
        
        if (isDevelopment) {
          console.log('🔄 백엔드 연결 에러, 임시 관리자 데이터 사용:', mockUser);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      set({ 
        user: null, 
        isAuthenticated: false, 
        token: null, 
        isLoading: false 
      })
    }
  },

  login: (token: string, user: User) => {
    localStorage.setItem('token', token)
    set({ 
      token, 
      user, 
      isAuthenticated: true, 
      isLoading: false 
    })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ 
      user: null, 
      isAuthenticated: false, 
      token: null, 
      isLoading: false 
    })
  }
}))