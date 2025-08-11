import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  // Vercel 환경에서 강력한 디버깅
  console.log('🔄 [VERCEL] OAuth 콜백 시작:', {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    searchParams: Object.fromEntries(requestUrl.searchParams.entries()),
    origin: requestUrl.origin,
    pathname: requestUrl.pathname,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV || 'unknown'
  });
  
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') ?? '/';

  // URL fragment에서 토큰 정보 추출 (implicit flow 지원)
  const access_token = requestUrl.searchParams.get('access_token');
  const refresh_token = requestUrl.searchParams.get('refresh_token');
  const expires_at = requestUrl.searchParams.get('expires_at');
  const token_type = requestUrl.searchParams.get('token_type');

  console.log('📊 [VERCEL] OAuth 파라미터:', { 
    hasCode: !!code,
    codeLength: code?.length || 0,
    hasAccessToken: !!access_token,
    hasError: !!error,
    error,
    error_description,
    next,
    origin: requestUrl.origin,
    tokenType: token_type,
    expiresAt: expires_at,
    allSearchParams: Object.fromEntries(requestUrl.searchParams.entries())
  });

  // OAuth 오류가 있는 경우
  if (error) {
    console.error('❌ OAuth 제공자 오류:', error, error_description);
    const errorMessage = error_description || error;
    return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=${error}&message=${encodeURIComponent(errorMessage)}`);
  }

  // Authorization Code Flow (권장 방식)
  if (code) {
    try {
      console.log('🔍 [VERCEL] 환경변수 확인:', {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseUrlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) + '...',
        keyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30) + '...'
      });
      
      const supabase = await createClient();
      console.log('✅ [VERCEL] Supabase 클라이언트 생성 완료');
      console.log('🔄 [VERCEL] Authorization Code Flow: 코드를 세션으로 교환 중...');
      
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('❌ 코드 교환 실패:', exchangeError.message);
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/login?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`
        );
      }

      if (data.session && data.user) {
        console.log('✅ [VERCEL] Authorization Code Flow OAuth 인증 성공:', { 
          userId: data.user.id,
          email: data.user.email,
          provider: data.user.app_metadata?.provider,
          authMethod: 'authorization_code',
          sessionExpiry: data.session.expires_at,
          tokenType: data.session.token_type,
          hasRefreshToken: !!data.session.refresh_token
        });
        
        const redirectUrl = `${requestUrl.origin}${next}`;
        console.log('🔄 [VERCEL] 메인 페이지로 리다이렉트:', redirectUrl);
        
        // 성공적으로 인증 완료 - 메인 페이지로 리다이렉트
        return NextResponse.redirect(redirectUrl);
      } else {
        console.error('❌ [VERCEL] 세션 또는 사용자 정보 누락:', {
          hasSession: !!data.session,
          hasUser: !!data.user,
          sessionData: data.session ? 'exists' : 'null',
          userData: data.user ? 'exists' : 'null'
        });
        return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=invalid_session`);
      }
      
    } catch (error) {
      console.error('❌ Authorization Code Flow 처리 예외:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=callback_exception&message=${encodeURIComponent(String(error))}`
      );
    }
  }

  // Implicit Flow 지원 - URL fragment는 서버에서 접근 불가하므로 클라이언트에서 처리
  // error가 'missing_parameters'이고 다른 토큰 파라미터가 있다면 implicit flow일 가능성이 높음
  if (error === 'missing_parameters') {
    console.log('🔄 Implicit Flow로 추정됨: 클라이언트 사이드 처리를 위해 리다이렉트');
    return NextResponse.redirect(`${requestUrl.origin}/auth/callback/implicit`);
  }

  // 파라미터가 부족한 경우
  console.log('❌ OAuth 콜백 파라미터 부족:', {
    hasCode: !!code,
    hasAccessToken: !!access_token,
    url: request.url,
    searchParams: Object.fromEntries(requestUrl.searchParams.entries())
  });

  // URL에 여전히 토큰 정보가 있을 수 있으므로 클라이언트 처리 시도
  return NextResponse.redirect(`${requestUrl.origin}/auth/callback/implicit`);
}