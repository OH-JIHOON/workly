import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  console.log('🔄 서버사이드 OAuth 콜백 처리 시작');
  
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  console.log('콜백 파라미터:', { 
    code: code ? `${code.substring(0, 10)}...` : null, 
    next,
    origin
  });

  if (code) {
    try {
      const supabase = createClient();
      console.log('🔄 코드를 세션으로 교환 중...');
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('❌ 코드 교환 오류:', error);
        return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`);
      }

      console.log('✅ 세션 교환 성공:', { 
        hasSession: !!data.session, 
        hasUser: !!data.user,
        userId: data.user?.id
      });

      // 성공적으로 인증 완료 후 리다이렉트
      return NextResponse.redirect(`${origin}${next}`);
      
    } catch (error) {
      console.error('❌ OAuth 콜백 예외:', error);
      return NextResponse.redirect(`${origin}/auth/login?error=callback_exception`);
    }
  }

  console.log('❌ 코드 파라미터 누락');
  return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
}