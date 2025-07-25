'use client'

export default function LoginPage() {
  const handleGoogleLogin = () => {
    // Google OAuth 로그인 로직 구현
    console.log('Google 로그인 실행')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* 로고 & 브랜딩 */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-foreground text-background rounded-2xl flex items-center justify-center text-2xl font-bold mb-6">
            W
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            워클리에 오신 것을 환영합니다
          </h1>
          <p className="text-muted-foreground">
            업무를 정리하고, 목표를 달성하며, 역량을 성장시키세요
          </p>
        </div>

        {/* 단일 Google 로그인 버튼 */}
        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google로 시작하기
        </button>

        {/* 추가 정보 */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            계속 진행하면 
            <a href="#" className="text-foreground hover:underline mx-1">서비스 약관</a>
            및
            <a href="#" className="text-foreground hover:underline mx-1">개인정보처리방침</a>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}