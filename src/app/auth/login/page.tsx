'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth.store'
import GoogleLoginButton from '@/components/auth/GoogleLoginButton'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { session } = useAuthStore()
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    // If the user is already logged in, redirect to the main page.
    if (session) {
      router.push('/')
    }

    // OAuth 콜백 오류 처리
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    
    if (error) {
      let displayMessage = '로그인 중 오류가 발생했습니다.'
      
      switch (error) {
        case 'exchange_failed':
          displayMessage = '인증 코드 처리 중 오류가 발생했습니다.'
          break
        case 'invalid_session':
          displayMessage = '세션 생성에 실패했습니다.'
          break
        case 'callback_exception':
          displayMessage = '콜백 처리 중 예외가 발생했습니다.'
          break
        case 'missing_parameters':
          displayMessage = '필수 인증 정보가 누락되었습니다.'
          break
        default:
          if (message) {
            displayMessage = decodeURIComponent(message)
          }
      }
      
      setErrorMessage(displayMessage)
      console.error('OAuth 오류:', { error, message })
    }
  }, [session, router, searchParams])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-foreground text-background rounded-2xl flex items-center justify-center text-2xl font-bold mb-6">
            W
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            워클리에 오신 것을 환영합니다
          </h1>
          <p className="text-muted-foreground mb-4">
            업무를 정리하고, 목표를 달성하며, 역량을 성장시키세요
          </p>
        </div>

        <div className="space-y-4 mt-2">
          {/* 오류 메시지 표시 */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {errorMessage}
            </div>
          )}
          
          <GoogleLoginButton text="Google로 시작하기" />
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              계속 진행하면{' '}
              <a href="/terms" className="text-foreground hover:underline mx-1">
                서비스 약관
              </a>
              및
              <a href="/privacy" className="text-foreground hover:underline mx-1">
                개인정보처리방침
              </a>
              에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">로딩 중...</div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
