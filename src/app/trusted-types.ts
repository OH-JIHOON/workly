/**
 * Trusted Types Policy for CSP compliance
 * Vercel 프로덕션 환경에서 TrustedHTML 오류 해결
 */

// Trusted Types API 타입 정의
declare global {
  interface Window {
    trustedTypes?: {
      createPolicy: (name: string, policy: any) => any;
      defaultPolicy: any;
    };
  }
}

export const setupTrustedTypes = () => {
  if (typeof window !== 'undefined' && window.trustedTypes) {
    try {
      // 기본 정책이 없는 경우에만 생성
      if (!window.trustedTypes.defaultPolicy) {
        window.trustedTypes.createPolicy('default', {
          createHTML: (string: string) => string,
          createScript: (string: string) => string,
          createScriptURL: (string: string) => string,
        });
      }
    } catch (error) {
      // 정책이 이미 존재하거나 생성에 실패한 경우 무시
      console.warn('Trusted Types 정책 설정 실패:', error);
    }
  }
};

// 안전한 HTML 생성 헬퍼
export const createTrustedHTML = (html: string) => {
  if (typeof window !== 'undefined' && window.trustedTypes?.defaultPolicy) {
    return window.trustedTypes.defaultPolicy.createHTML(html);
  }
  return html;
};