import { createBrowserClient } from '@supabase/ssr'

/**
 * 클라이언트 사이드 Supabase 클라이언트 생성
 * 브라우저에서 실행되는 Client Components에서 사용
 * 자동으로 세션 관리 및 쿠키 처리
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// 레거시 코드 호환성을 위한 export
export const supabase = createClient()

// Database 타입 정의 (기존 코드 호환성)
export type Database = any // 임시 타입 - 추후 Supabase 타입 생성 시 교체
