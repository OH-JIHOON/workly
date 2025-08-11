import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  console.log('🔄 2025 최신 패턴: 서버사이드 OAuth 콜백 처리');
  
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const next = requestUrl.searchParams.get('next') ?? '/';

  console.log('OAuth 콜백 상태:', { 
    hasCode: !!code,
    hasError: !!error,
    error,
    next,
    origin: requestUrl.origin
  });

  // OAuth 오류가 있는 경우
  if (error) {
    console.error('❌ OAuth 제공자 오류:', error);
    return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=${error}`);
  }

  // 코드가 있는 경우 세션으로 교환
  if (code) {
    try {
      const supabase = createClient();
      console.log('🔄 OAuth 코드를 세션으로 교환 중...');
      
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('❌ 코드 교환 실패:', exchangeError.message);
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/login?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`
        );
      }

      if (data.session && data.user) {
        console.log('✅ OAuth 인증 성공:', { 
          userId: data.user.id,
          email: data.user.email,
          provider: data.user.app_metadata?.provider
        });

        // 성공적으로 인증 완료 - 메인 페이지로 리다이렉트
        return NextResponse.redirect(`${requestUrl.origin}${next}`);
      } else {
        console.error('❌ 세션 또는 사용자 정보 누락');
        return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=invalid_session`);
      }
      
    } catch (error) {
      console.error('❌ OAuth 콜백 처리 예외:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=callback_exception&message=${encodeURIComponent(String(error))}`
      );
    }
  }

  // 코드도 오류도 없는 경우
  console.log('❌ OAuth 콜백 파라미터 누락');
  return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=missing_parameters`);
}