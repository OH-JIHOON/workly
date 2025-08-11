import { createServerClient } from '@supabase/ssr';

export async function createClient() {
  // 동적으로 cookies import
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  return createServerClient(
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
            // 서버 컴포넌트에서 쿠키 설정 불가능한 경우 무시
            console.warn('서버사이드 쿠키 설정 실패:', error);
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // 서버 컴포넌트에서 쿠키 제거 불가능한 경우 무시
            console.warn('서버사이드 쿠키 제거 실패:', error);
          }
        },
      },
    }
  );
}