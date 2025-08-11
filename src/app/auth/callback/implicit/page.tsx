/**
 * Implicit Flow OAuth 콜백 처리 페이지
 * URL fragment의 토큰 정보를 클라이언트에서 처리
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useSupabaseAuth } from '@/lib/stores/auth.store';

export default function ImplicitCallbackPage() {
  const router = useRouter();
  const { initialize } = useSupabaseAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleImplicitFlow = async () => {
      try {
        console.log('🔄 Implicit Flow 토큰 처리 시작');
        setStatus('processing');

        // URL fragment에서 토큰 정보 추출
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');
        const expires_at = hashParams.get('expires_at');
        const expires_in = hashParams.get('expires_in');
        const token_type = hashParams.get('token_type');
        const error_param = hashParams.get('error');
        const error_description = hashParams.get('error_description');

        console.log('Implicit Flow 파라미터:', {
          hasAccessToken: !!access_token,
          hasRefreshToken: !!refresh_token,
          tokenType: token_type,
          expiresAt: expires_at,
          expiresIn: expires_in,
          error: error_param,
          errorDescription: error_description
        });

        // 오류 확인
        if (error_param) {
          console.error('❌ Implicit Flow 오류:', error_param, error_description);
          setError(error_description || error_param);
          setStatus('error');
          
          setTimeout(() => {
            router.push(`/auth/login?error=${error_param}&message=${encodeURIComponent(error_description || error_param)}`);
          }, 3000);
          return;
        }

        // 토큰 정보 확인
        if (!access_token) {
          console.error('❌ 액세스 토큰이 없습니다');
          setError('액세스 토큰을 찾을 수 없습니다');
          setStatus('error');
          
          setTimeout(() => {
            router.push('/auth/login?error=no_token');
          }, 3000);
          return;
        }

        // Supabase 세션 설정
        console.log('🔄 Supabase 세션 설정 중...');
        
        const expiresAtTimestamp = expires_at ? 
          parseInt(expires_at) : 
          (expires_in ? Math.floor(Date.now() / 1000) + parseInt(expires_in) : undefined);

        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token: refresh_token || '',
          expires_at: expiresAtTimestamp
        });

        if (sessionError) {
          console.error('❌ 세션 설정 실패:', sessionError);
          setError('세션 설정에 실패했습니다: ' + sessionError.message);
          setStatus('error');
          
          setTimeout(() => {
            router.push(`/auth/login?error=session_failed&message=${encodeURIComponent(sessionError.message)}`);
          }, 3000);
          return;
        }

        if (data.session && data.user) {
          console.log('✅ Implicit Flow OAuth 인증 성공:', {
            userId: data.user.id,
            email: data.user.email,
            provider: data.user.app_metadata?.provider,
            authMethod: 'implicit_flow',
            expiresAt: new Date((expiresAtTimestamp || 0) * 1000).toISOString()
          });

          // 비대칭 인증 검증 수행
          console.log('🔒 비대칭 인증 검증 수행 중...');
          const { verifyAuthentication } = useSupabaseAuth.getState();
          const verificationResult = await verifyAuthentication();
          
          if (verificationResult.success) {
            console.log('✅ 비대칭 인증 검증 성공');
          } else {
            console.warn('⚠️ 비대칭 인증 검증 실패:', verificationResult.error);
          }

          // 인증 상태 초기화
          await initialize();
          
          setStatus('success');
          
          // 메인 페이지로 리다이렉트
          setTimeout(() => {
            router.push('/');
          }, 1500);
          
        } else {
          console.error('❌ 세션 또는 사용자 정보 누락');
          setError('사용자 정보를 가져올 수 없습니다');
          setStatus('error');
          
          setTimeout(() => {
            router.push('/auth/login?error=user_info_failed');
          }, 3000);
        }

      } catch (error) {
        console.error('❌ Implicit Flow 처리 예외:', error);
        setError('인증 처리 중 오류가 발생했습니다');
        setStatus('error');
        
        setTimeout(() => {
          router.push(`/auth/login?error=callback_exception&message=${encodeURIComponent(String(error))}`);
        }, 3000);
      }
    };

    // 페이지 로드 후 토큰 처리
    if (typeof window !== 'undefined') {
      handleImplicitFlow();
    }
  }, [router, initialize]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            {status === 'processing' && (
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'processing' && '🔒 인증 처리 중'}
            {status === 'success' && '✅ 인증 성공'}
            {status === 'error' && '❌ 인증 실패'}
          </h1>
          
          <p className="text-gray-600">
            {status === 'processing' && '비대칭 암호화 방식으로 인증을 처리하고 있습니다...'}
            {status === 'success' && '인증이 성공적으로 완료되었습니다. 잠시 후 메인 페이지로 이동합니다.'}
            {status === 'error' && error}
          </p>
        </div>

        {status === 'processing' && (
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Implicit Flow 토큰 확인 중</p>
            <p>• 비대칭 암호화 검증 수행 중</p>
            <p>• 사용자 세션 설정 중</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4">
            <button 
              onClick={() => router.push('/auth/login')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              로그인 페이지로 이동
            </button>
          </div>
        )}
      </div>
    </div>
  );
}