'use client';

import React from 'react';
import GoogleLoginButton from './GoogleLoginButton';

interface SocialLoginProps {
  isLoading?: boolean;
  showDivider?: boolean;
  dividerText?: string;
}

export default function SocialLogin({ 
  isLoading = false, 
  showDivider = true, 
  dividerText = '또는' 
}: SocialLoginProps) {
  const handleGoogleLogin = () => {
    console.log('Google 로그인 시작');
    // Google OAuth 로그인 로직 구현
  };

  return (
    <div className="w-full">
      {/* 구분선 */}
      {showDivider && (
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">{dividerText}</span>
          </div>
        </div>
      )}

      {/* 소셜 로그인 버튼들 */}
      <div className="space-y-3">
        {/* Google 로그인 */}
        <GoogleLoginButton
          onLogin={handleGoogleLogin}
          isLoading={isLoading}
          text="Google로 계속하기"
        />

        {/* 추후 다른 소셜 로그인 추가 예정 */}
        {/* 
        <button
          type="button"
          className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading}
        >
          <span className="mr-3">🍎</span>
          Apple로 계속하기
        </button>

        <button
          type="button"
          className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading}
        >
          <span className="mr-3">💼</span>
          Microsoft로 계속하기
        </button>
        */}
      </div>

      {/* 보안 안내 */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          소셜 로그인을 사용하면{' '}
          <a href="/terms" className="text-blue-600 hover:text-blue-500 underline">
            서비스 이용약관
          </a>
          {' '}및{' '}
          <a href="/privacy" className="text-blue-600 hover:text-blue-500 underline">
            개인정보 처리방침
          </a>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}