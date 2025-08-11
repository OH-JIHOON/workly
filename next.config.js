/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15 설정
  eslint: {
    // 빌드 시 ESLint 오류를 무시 (개발 완료 후 수정 예정)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 빌드 시 TypeScript 오류를 무시 (개발 완료 후 수정 예정)
    ignoreBuildErrors: true,
  },

  // Content Security Policy 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://*.googleapis.com https://*.supabase.co https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.supabase.co https://accounts.google.com https://*.googleapis.com wss://*.supabase.co https://vercel.live",
              "frame-src 'self' https://accounts.google.com https://vercel.live",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'"
            ].join('; ')
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ],
      },
    ]
  },
  
  // 이미지 최적화 설정
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // 압축 최적화
  compress: true,
  
  // 성능 최적화
  poweredByHeader: false,
  
  // Webpack 번들 최적화 (단순화)
  webpack: (config, { dev, isServer }) => {
    // 프로덕션 빌드에서만 최적화 적용
    if (!dev && !isServer) {
      // Tree shaking 최적화
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    return config
  },
  
  experimental: {
    // 성능 최적화 기능들
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
    webVitalsAttribution: ['CLS', 'LCP']
  }
}

module.exports = nextConfig