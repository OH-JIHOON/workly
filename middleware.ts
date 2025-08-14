import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)

  const isAuthenticated = !!user
  const pathname = request.nextUrl.pathname

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
    '/admin',
    '/works'
  ]

  // 관리자 전용 라우트
  const adminRoutes = ['/admin']

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  // 인증되지 않은 사용자가 보호된 라우트 접근 시도
  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('returnUrl', pathname)
    redirectUrl.searchParams.set('message', 'login_required')
    return NextResponse.redirect(redirectUrl)
  }

  // 관리자 권한 확인
  if (isAdminRoute && isAuthenticated) {
    const isAdmin =
      user?.role === 'admin' ||
      user?.user_metadata?.role === 'admin' ||
      user?.app_metadata?.admin_role === 'super_admin'

    if (!isAdmin) {
      const redirectUrl = new URL('/', request.url)
      redirectUrl.searchParams.set('message', 'insufficient_permissions')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // 인증된 사용자가 로그인 페이지 접근 시 홈으로 리다이렉트
  if (isAuthenticated && pathname.startsWith('/auth/login')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
