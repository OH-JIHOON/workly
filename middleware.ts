/**
 * Next.js 미들웨어 - 비대칭 암호화 기반 인증
 * 모든 보호된 라우트에서 ECC (P-256) JWT 검증 수행
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  console.log('🔒 미들웨어 - 비대칭 인증 검증 시작:', request.nextUrl.pathname);

  // 비대칭 암호화 기반 사용자 인증 검증
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error('미들웨어 사용자 검증 오류:', userError);
  }

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('미들웨어 세션 검증 오류:', sessionError);
  }

  const isAuthenticated = !!(user && session);
  const pathname = request.nextUrl.pathname;

  console.log('🔍 미들웨어 인증 상태:', {
    pathname,
    isAuthenticated,
    userId: user?.id,
    hasSession: !!session,
    userRole: user?.role || user?.user_metadata?.role
  });

  // 보호된 라우트 정의
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
    '/tasks',
    '/projects',
    '/inbox',
    '/goals',
    '/board',
    '/admin'
  ];

  // 관리자 전용 라우트
  const adminRoutes = ['/admin'];

  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );

  // 인증되지 않은 사용자가 보호된 라우트 접근 시도
  if (isProtectedRoute && !isAuthenticated) {
    console.log('❌ 미들웨어: 미인증 사용자의 보호된 라우트 접근 차단');
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('returnUrl', pathname);
    redirectUrl.searchParams.set('message', 'login_required');
    return NextResponse.redirect(redirectUrl);
  }

  // 관리자 권한 확인
  if (isAdminRoute && isAuthenticated) {
    const isAdmin = user?.role === 'admin' || 
                   user?.user_metadata?.role === 'admin' ||
                   user?.app_metadata?.admin_role === 'super_admin';

    if (!isAdmin) {
      console.log('❌ 미들웨어: 관리자 권한 없는 사용자의 관리자 라우트 접근 차단');
      const redirectUrl = new URL('/', request.url);
      redirectUrl.searchParams.set('message', 'insufficient_permissions');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 인증된 사용자가 로그인 페이지 접근 시 홈으로 리다이렉트
  if (isAuthenticated && pathname.startsWith('/auth/login')) {
    console.log('✅ 미들웨어: 인증된 사용자 홈으로 리다이렉트');
    return NextResponse.redirect(new URL('/', request.url));
  }

  console.log('✅ 미들웨어: 라우트 접근 허용');
  return response;
}

export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청에 대해 미들웨어 실행:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};