import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * 미들웨어에서 세션 갱신 처리
 * 안정적이고 검증된 Supabase SSR 방식 사용
 * 토큰 자동 갱신 및 세션 관리
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // Request 쿠키 업데이트
          request.cookies.set({
            name,
            value,
            ...options,
          })
          
          // Response 쿠키 업데이트
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          // Request 쿠키 삭제
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          
          // Response 쿠키 삭제
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // getUser()는 매번 Supabase 서버에 인증 토큰 재검증 요청
  // getSession()과 달리 안전하고 신뢰할 수 있음
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('미들웨어 인증 확인 중 오류:', error)
  }

  return { response, user }
}
