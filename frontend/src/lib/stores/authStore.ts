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
      
      // 로컬 스토리지에서 토큰 및 사용자 정보 확인
      const token = localStorage.getItem('accessToken')
      const savedUserStr = localStorage.getItem('user');
      
      // 토큰과 사용자 정보가 모두 있으면 즉시 로드
      if (token && savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          set({ 
            user: savedUser, 
            isAuthenticated: true, 
            token, 
            isLoading: false 
          });
          return; // API 호출 없이 즉시 반환
        } catch (error) {
          console.error('AuthStore - 저장된 사용자 정보 파싱 오류:', error);
        }
      }

      if (!token) {
        set({ 
          user: null, 
          isAuthenticated: false, 
          token: null, 
          isLoading: false 
        })
        return
      }

      // 백엔드 API 호출로 사용자 정보 검증
      try {
        const response = await fetch('http://localhost:8000/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const apiResponse = await response.json();
          const userData = apiResponse.user;
          
          // 백엔드 데이터를 프론트엔드 User 타입에 맞게 변환
          const user: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            adminRole: userData.adminRole, // 직접 adminRole 사용
            avatar: userData.avatar,
            createdAt: userData.createdAt || new Date().toISOString(),
            updatedAt: userData.updatedAt || new Date().toISOString()
          };
          
          // localStorage에도 사용자 정보 저장
          localStorage.setItem('user', JSON.stringify(user));
          
          set({ 
            user, 
            isAuthenticated: true, 
            token, 
            isLoading: false 
          });
        } else {
          // API 호출 실패 시 토큰 제거
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            token: null, 
            isLoading: false 
          });
        }
      } catch (error) {
        console.error('AuthStore - 백엔드 연결 오류:', error);
        
        // 네트워크 오류 시 토큰 제거
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        set({ 
          user: null, 
          isAuthenticated: false, 
          token: null, 
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('AuthStore - checkAuth 전체 실패:', error)
      set({ 
        user: null, 
        isAuthenticated: false, 
        token: null, 
        isLoading: false 
      })
    }
  },

  login: (token: string, user: User) => {
    localStorage.setItem('accessToken', token)
    set({ 
      token, 
      user, 
      isAuthenticated: true, 
      isLoading: false 
    })
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    set({ 
      user: null, 
      isAuthenticated: false, 
      token: null, 
      isLoading: false 
    })
  }
}))