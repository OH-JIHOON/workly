'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { saveTokens, refreshUserProfile } from '@/lib/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL에서 토큰 또는 상태 정보 확인
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error');
        const callbackStatus = searchParams.get('status');

        if (error) {
          throw new Error(getErrorMessage(error));
        }

        if (accessToken && refreshToken) {
          // 토큰이 URL에 직접 포함된 경우
          saveTokens(
            decodeURIComponent(accessToken),
            decodeURIComponent(refreshToken)
          );
          
          // 사용자 정보 가져오기
          await refreshUserProfile();
          
          setStatus('success');
          setMessage('로그인이 완료되었습니다. 잠시 후 대시보드로 이동합니다.');
          
          // 3초 후 홈페이지로 이동
          setTimeout(() => {
            router.push('/');
          }, 3000);
          
        } else if (callbackStatus === 'success') {
          // OAuth 인증은 성공했지만 토큰이 URL에 없는 경우
          // 백엔드에서 추가 처리 필요
          setStatus('success');
          setMessage('인증이 완료되었습니다. 잠시 후 대시보드로 이동합니다.');
          
          setTimeout(() => {
            router.push('/');
          }, 3000);
          
        } else {
          throw new Error('인증 정보를 찾을 수 없습니다.');
        }
        
      } catch (error) {
        console.error('OAuth 콜백 처리 오류:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : '로그인 처리 중 오류가 발생했습니다.');
        
        // 5초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/auth/login?error=oauth_callback_failed');
        }, 5000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  const fetchUserInfo = async (accessToken: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      const response = await fetch(`${backendUrl}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('user', JSON.stringify(userData.user));
      }
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
      // 사용자 정보 조회 실패해도 로그인은 진행
    }
  };

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'access_denied':
        return '로그인이 취소되었습니다.';
      case 'invalid_request':
        return '잘못된 요청입니다.';
      case 'server_error':
        return '서버 오류가 발생했습니다.';
      case 'temporarily_unavailable':
        return '일시적으로 사용할 수 없는 서비스입니다.';
      default:
        return '로그인 중 오류가 발생했습니다.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* 상태별 아이콘 */}
          <div className="mb-6">
            {status === 'loading' && (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
            
            {status === 'success' && (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            )}
            
            {status === 'error' && (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>

          {/* 상태별 제목 */}
          <h1 className="text-2xl font-bold mb-4">
            {status === 'loading' && '로그인 처리 중...'}
            {status === 'success' && '로그인 성공!'}
            {status === 'error' && '로그인 실패'}
          </h1>

          {/* 메시지 */}
          <p className={`text-sm mb-6 ${
            status === 'success' ? 'text-green-600' : 
            status === 'error' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {message || (
              status === 'loading' ? '잠시만 기다려주세요...' :
              status === 'success' ? '로그인이 완료되었습니다.' :
              '로그인 중 오류가 발생했습니다.'
            )}
          </p>

          {/* 로딩 상태일 때만 프로그레스 바 표시 */}
          {status === 'loading' && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          )}

          {/* 에러 상태일 때 수동 이동 버튼 */}
          {status === 'error' && (
            <button
              onClick={() => router.push('/auth/login')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              로그인 페이지로 돌아가기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}