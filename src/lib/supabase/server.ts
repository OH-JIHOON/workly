import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 서버 사이드 Supabase 클라이언트 생성
 * Server Components, Server Actions, Route Handlers에서 사용
 * 2025년 최신 @supabase/ssr 방식 적용 (안정성 우선)
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options)
          } catch {
            // Server Component에서 호출된 경우 무시
            // 미들웨어에서 세션 갱신을 처리함
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.delete(name)
          } catch {
            // Server Component에서 호출된 경우 무시
            // 미들웨어에서 세션 갱신을 처리함
          }
        },
      },
    }
  )
}
