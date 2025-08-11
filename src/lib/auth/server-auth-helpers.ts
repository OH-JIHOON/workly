/**
 * 서버 사이드 인증 헬퍼 함수들
 * API 라우트와 서버 컴포넌트에서 비대칭 암호화 기반 JWT 검증
 * 
 * 주의: 이 파일은 서버 사이드에서만 사용되어야 합니다.
 */

import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import type { User, Session } from '@supabase/supabase-js';

export interface ServerAuthResult {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
  errorCode?: string;
}

export interface AuthenticatedApiHandler {
  (request: NextRequest, context: {
    params?: any;
    user: User;
    session: Session;
  }): Promise<NextResponse> | NextResponse;
}

/**
 * 서버 컴포넌트에서 사용하는 인증 검증
 */
export async function getServerAuth(): Promise<ServerAuthResult> {
  try {
    console.log('🔒 서버 인증 검증 시작');

    // 동적으로 cookies import (서버에서만 사용 가능)
    const { cookies } = await import('next/headers');
    const cookieStore = cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              console.warn('서버 쿠키 설정 실패:', error);
            }
          },
          remove(name: string, options) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              console.warn('서버 쿠키 제거 실패:', error);
            }
          },
        },
      }
    );

    // 비대칭 검증: 세션 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('서버 세션 검증 오류:', sessionError);
      return {
        success: false,
        error: '세션 검증에 실패했습니다',
        errorCode: 'SESSION_VERIFICATION_FAILED'
      };
    }

    if (!session) {
      return {
        success: false,
        error: '인증되지 않은 요청입니다',
        errorCode: 'UNAUTHENTICATED'
      };
    }

    // 비대칭 검증: 사용자 정보 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('서버 사용자 검증 오류:', userError);
      return {
        success: false,
        error: '사용자 정보 검증에 실패했습니다',
        errorCode: 'USER_VERIFICATION_FAILED'
      };
    }

    // JWT 토큰 만료 확인 (추가 보안 검증)
    const currentTime = Math.floor(Date.now() / 1000);
    const tokenExpiry = session.expires_at || 0;
    
    if (tokenExpiry < currentTime) {
      console.error('만료된 토큰 감지');
      return {
        success: false,
        error: '토큰이 만료되었습니다',
        errorCode: 'TOKEN_EXPIRED'
      };
    }

    console.log('✅ 서버 인증 검증 성공:', {
      userId: user.id,
      email: user.email,
      role: user.role || user.user_metadata?.role,
      expiresAt: new Date(tokenExpiry * 1000).toISOString()
    });

    return {
      success: true,
      user,
      session
    };

  } catch (error) {
    console.error('서버 인증 검증 예외:', error);
    return {
      success: false,
      error: '서버 인증 검증 중 오류가 발생했습니다',
      errorCode: 'SERVER_AUTH_EXCEPTION'
    };
  }
}

/**
 * API 라우트에서 사용하는 인증 검증 래퍼
 */
export function withAuth(handler: AuthenticatedApiHandler) {
  return async (request: NextRequest, context?: { params?: any }) => {
    console.log('🔒 API 인증 검증 시작:', request.method, request.url);

    const authResult = await getServerAuth();
    
    if (!authResult.success || !authResult.user || !authResult.session) {
      console.log('❌ API 인증 실패:', authResult.error);
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || '인증이 필요합니다',
          code: authResult.errorCode || 'AUTHENTICATION_REQUIRED'
        },
        { status: 401 }
      );
    }

    try {
      return await handler(request, {
        ...context,
        user: authResult.user,
        session: authResult.session
      });
    } catch (error) {
      console.error('API 핸들러 실행 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '서버 오류가 발생했습니다',
          code: 'SERVER_ERROR'
        },
        { status: 500 }
      );
    }
  };
}

/**
 * 관리자 권한이 필요한 API 라우트 래퍼
 */
export function withAdminAuth(handler: AuthenticatedApiHandler) {
  return withAuth(async (request, context) => {
    const { user } = context;
    
    const isAdmin = user.role === 'admin' || 
                   user.user_metadata?.role === 'admin' ||
                   user.app_metadata?.admin_role === 'super_admin';

    if (!isAdmin) {
      console.log('❌ 관리자 권한 없음:', {
        userId: user.id,
        role: user.role || user.user_metadata?.role
      });
      
      return NextResponse.json(
        {
          success: false,
          error: '관리자 권한이 필요합니다',
          code: 'INSUFFICIENT_PERMISSIONS'
        },
        { status: 403 }
      );
    }

    console.log('✅ 관리자 권한 확인됨');
    return handler(request, context);
  });
}

/**
 * 특정 역할이 필요한 API 라우트 래퍼
 */
export function withRoleAuth(requiredRole: string) {
  return function(handler: AuthenticatedApiHandler) {
    return withAuth(async (request, context) => {
      const { user } = context;
      
      const userRole = user.role || user.user_metadata?.role || 'member';
      
      const roleHierarchy: { [key: string]: number } = {
        'member': 1,
        'manager': 2,
        'admin': 3,
        'super_admin': 4
      };

      const userLevel = roleHierarchy[userRole] || 0;
      const requiredLevel = roleHierarchy[requiredRole] || 0;

      if (userLevel < requiredLevel) {
        console.log('❌ 권한 부족:', {
          userId: user.id,
          userRole,
          requiredRole,
          userLevel,
          requiredLevel
        });
        
        return NextResponse.json(
          {
            success: false,
            error: `${requiredRole} 이상의 권한이 필요합니다`,
            code: 'INSUFFICIENT_ROLE'
          },
          { status: 403 }
        );
      }

      console.log('✅ 역할 권한 확인됨:', { userRole, requiredRole });
      return handler(request, context);
    });
  };
}

/**
 * 사용자 자신의 리소스만 접근 가능한 API 래퍼
 */
export function withOwnershipAuth(getResourceOwnerId: (request: NextRequest, context: any) => Promise<string | null>) {
  return function(handler: AuthenticatedApiHandler) {
    return withAuth(async (request, context) => {
      const { user } = context;
      
      try {
        const resourceOwnerId = await getResourceOwnerId(request, context);
        
        if (!resourceOwnerId) {
          return NextResponse.json(
            {
              success: false,
              error: '리소스를 찾을 수 없습니다',
              code: 'RESOURCE_NOT_FOUND'
            },
            { status: 404 }
          );
        }

        // 관리자이거나 리소스 소유자인 경우 접근 허용
        const isAdmin = user.role === 'admin' || 
                       user.user_metadata?.role === 'admin' ||
                       user.app_metadata?.admin_role === 'super_admin';
        
        const isOwner = user.id === resourceOwnerId;

        if (!isAdmin && !isOwner) {
          console.log('❌ 리소스 접근 권한 없음:', {
            userId: user.id,
            resourceOwnerId,
            isAdmin,
            isOwner
          });
          
          return NextResponse.json(
            {
              success: false,
              error: '해당 리소스에 접근할 권한이 없습니다',
              code: 'ACCESS_DENIED'
            },
            { status: 403 }
          );
        }

        console.log('✅ 리소스 접근 권한 확인됨');
        return handler(request, context);
        
      } catch (error) {
        console.error('리소스 소유자 확인 오류:', error);
        return NextResponse.json(
          {
            success: false,
            error: '권한 확인 중 오류가 발생했습니다',
            code: 'PERMISSION_CHECK_ERROR'
          },
          { status: 500 }
        );
      }
    });
  };
}

// 편의 함수들
export async function requireServerAuth(): Promise<{ user: User; session: Session }> {
  const authResult = await getServerAuth();
  
  if (!authResult.success || !authResult.user || !authResult.session) {
    throw new Error(authResult.error || '인증이 필요합니다');
  }
  
  return {
    user: authResult.user,
    session: authResult.session
  };
}

export async function getServerUser(): Promise<User | null> {
  const authResult = await getServerAuth();
  return authResult.user || null;
}