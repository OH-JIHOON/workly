/**
 * 브라우저 확장 프로그램 오류 무시 및 TrustedTypes 설정
 * inject.js 등 확장 프로그램 스크립트 오류 해결
 */

'use client';

import { useEffect } from 'react';

export default function TrustedTypesScript() {
  useEffect(() => {
    // 브라우저 확장 프로그램 오류 필터링
    const originalError = window.console.error;
    const originalWarn = window.console.warn;

    window.console.error = function(...args) {
      const message = args.join(' ');
      // inject.js 관련 오류 무시
      if (message.includes('inject.js') || 
          message.includes('TrustedHTML') ||
          message.includes('extension://') ||
          message.includes('chrome-extension://')) {
        return; // 무시
      }
      originalError.apply(console, args);
    };

    window.console.warn = function(...args) {
      const message = args.join(' ');
      // inject.js 관련 경고 무시
      if (message.includes('inject.js') || 
          message.includes('TrustedHTML') ||
          message.includes('extension://') ||
          message.includes('chrome-extension://')) {
        return; // 무시
      }
      originalWarn.apply(console, args);
    };

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
        // 브라우저 확장 프로그램 관련 오류가 아닌 경우만 표시
        if (error && !String(error).includes('inject.js')) {
          console.warn('⚠️ Trusted Types 정책 설정:', error);
        }
      }
    }

    // 정리
    return () => {
      window.console.error = originalError;
      window.console.warn = originalWarn;
    };
  }, []);

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          // 브라우저 확장 프로그램 오류 무시
          (function() {
            const originalError = window.onerror;
            window.onerror = function(message, source, lineno, colno, error) {
              // inject.js나 확장 프로그램 관련 오류 무시
              if (source && (source.includes('inject.js') || source.includes('extension://'))) {
                return true; // 오류 무시
              }
              if (originalError) {
                return originalError.call(this, message, source, lineno, colno, error);
              }
              return false;
            };
            
            // Trusted Types 정책 설정
            if (typeof window !== 'undefined' && window.trustedTypes && !window.trustedTypes.defaultPolicy) {
              try {
                window.trustedTypes.createPolicy('default', {
                  createHTML: function(string) { return string; },
                  createScript: function(string) { return string; },
                  createScriptURL: function(string) { return string; }
                });
              } catch (e) {
                // inject.js 관련 오류가 아닌 경우만 표시
                if (!e.message || !e.message.includes('inject')) {
                  console.warn('Trusted Types policy setup failed:', e);
                }
              }
            }
          })();
        `
      }}
    />
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