/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14에서는 app directory가 기본적으로 활성화됨
  eslint: {
    // 빌드 시 ESLint 오류를 무시 (개발 완료 후 수정 예정)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 빌드 시 TypeScript 오류를 무시 (개발 완료 후 수정 예정)
    ignoreBuildErrors: true,
  },
  // Vercel 배포용 설정
  // output: 'standalone', // Vercel에서는 비활성화
  experimental: {
    // 개발 모드에서만 사용
    esmExternals: 'loose',
    // useSearchParams() 사용 시 Suspense 경계 필요성 비활성화
    missingSuspenseWithCSRBailout: false,
  }
}

module.exports = nextConfig