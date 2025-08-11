/**
 * TrustedTypes 정책 설정 컴포넌트
 * Vercel CSP TrustedHTML 오류 해결
 */

'use client';

import { useEffect } from 'react';

export default function TrustedTypesScript() {
  useEffect(() => {
    // Trusted Types 정책 설정 (브라우저에서만 실행)
    if (typeof window !== 'undefined' && window.trustedTypes) {
      try {
        // 기본 정책이 없는 경우에만 생성
        if (!window.trustedTypes.defaultPolicy) {
          window.trustedTypes.createPolicy('default', {
            createHTML: (string: string) => string,
            createScript: (string: string) => string,
            createScriptURL: (string: string) => string,
          });
          console.log('✅ Trusted Types 정책 설정 완료');
        }
      } catch (error) {
        // 정책이 이미 존재하거나 생성에 실패한 경우 무시
        console.warn('⚠️ Trusted Types 정책 설정:', error);
      }
    }
  }, []);

  // 스크립트 태그로도 초기 설정 시도
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined' && window.trustedTypes && !window.trustedTypes.defaultPolicy) {
              try {
                window.trustedTypes.createPolicy('default', {
                  createHTML: function(string) { return string; },
                  createScript: function(string) { return string; },
                  createScriptURL: function(string) { return string; }
                });
              } catch (e) {
                console.warn('Trusted Types policy setup failed:', e);
              }
            }
          `
        }}
      />
      <meta httpEquiv="Content-Security-Policy" content="trusted-types default 'unsafe-inline'" />
    </>
  );
}

// 타입 선언 확장
declare global {
  interface Window {
    trustedTypes?: {
      createPolicy: (name: string, policy: any) => any;
      defaultPolicy: any;
    };
  }
}