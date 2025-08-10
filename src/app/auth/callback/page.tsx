'use client';

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useSupabaseAuth } from '@/lib/stores/auth.store';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, user, isLoading, initialize } = useSupabaseAuth();

  const [displayStatus, setDisplayStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [displayMessage, setDisplayMessage] = useState<string>('');

  useEffect(() => {
    // Supabase 인증 상태 초기화
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading) {
      if (session && user) {
        setDisplayStatus('success');
        setDisplayMessage('로그인이 완료되었습니다. 잠시 후 대시보드로 이동합니다.');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        // Supabase에서 세션을 찾지 못했거나 오류가 발생한 경우
        const errorParam = searchParams.get('error');
        const errorDescriptionParam = searchParams.get('error_description');

        setDisplayStatus('error');
        setDisplayMessage(
          errorDescriptionParam || errorParam || '로그인 처리 중 알 수 없는 오류가 발생했습니다.'
        );
        setTimeout(() => {
          router.push('/auth/login?error=oauth_callback_failed');
        }, 5000);
      }
    }
  }, [isLoading, session, user, router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* 상태별 아이콘 */}
          <div className="mb-6">
            {displayStatus === 'loading' && (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
            
            {displayStatus === 'success' && (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            )}
            
            {displayStatus === 'error' && (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>

          {/* 상태별 제목 */}
          <h1 className="text-2xl font-bold mb-4">
            {displayStatus === 'loading' && '로그인 처리 중...'}
            {displayStatus === 'success' && '로그인 성공!'}
            {displayStatus === 'error' && '로그인 실패'}
          </h1>

          {/* 메시지 */}
          <p className={`text-sm mb-6 ${
            displayStatus === 'success' ? 'text-green-600' : 
            displayStatus === 'error' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {displayMessage || (
              displayStatus === 'loading' ? '잠시만 기다려주세요...' :
              displayStatus === 'success' ? '로그인이 완료되었습니다.' :
              '로그인 중 오류가 발생했습니다.'
            )}
          </p>

          {/* 로딩 상태일 때만 프로그레스 바 표시 */}
          {displayStatus === 'loading' && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          )}

          {/* 에러 상태일 때 수동 이동 버튼 */}
          {displayStatus === 'error' && (
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