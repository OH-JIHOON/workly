'use client';

import React, { useState } from 'react';
import { useSupabaseAuth, isDevMode } from '../../lib/stores/supabaseAuthStore';

interface GoogleLoginButtonProps {
  onLogin?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  text?: string;
  redirectUrl?: string;
}

export default function GoogleLoginButton({ 
  onLogin, 
  isLoading: externalLoading = false, 
  disabled = false,
  text = 'Google로 로그인',
  redirectUrl
}: GoogleLoginButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const { signInWithGoogle } = useSupabaseAuth();
  
  const isLoadingState = externalLoading || internalLoading;

  const handleGoogleLogin = async () => {
    // 외부에서 onLogin을 제공한 경우 그것을 우선 사용
    if (onLogin) {
      onLogin();
      return;
    }

    // 개발 모드에서는 바로 메인 페이지로 이동
    if (isDevMode()) {
      window.location.href = '/';
      return;
    }
    
    // Supabase Google OAuth 로그인
    setInternalLoading(true);
    
    try {
      const { error } = await signInWithGoogle(redirectUrl);
      
      if (error) {
        console.error('Google 로그인 오류:', error);
        alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
      // 성공 시 Supabase가 자동으로 리다이렉트 처리
    } catch (error) {
      console.error('Google 로그인 예외:', error);
      alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={isLoadingState || disabled}
      className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoadingState ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          로그인 중...
        </>
      ) : (
        <>
          {/* Google 로고 SVG */}
          <svg
            className="w-5 h-5 mr-3"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {text}
        </>
      )}
    </button>
  );
}