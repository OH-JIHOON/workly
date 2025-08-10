'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

export default function LoginBanner() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
  }, [])

  const handleGoogleLogin = () => {
    router.push('/auth/login')
  }

  // 로그인된 상태면 표시하지 않음
  if (isLoggedIn) {
    return null
  }

  return (
    <div className="fixed top-20 z-30 hidden xl:block" style={{ left: 'calc(50% + 360px + 40px)' }}>
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 w-72">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">워클리와 함께 시작하세요</h3>
            <p className="text-sm text-gray-600 mb-4">업무를 정리하고, 목표를 달성하며, 역량을 성장시키세요</p>
          </div>
          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-4 py-3 font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors shadow-md"
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
          <div className="mt-4 text-xs text-gray-500">
            <p>• 무료로 시작</p>
            <p>• 즉시 사용 가능</p>
            <p>• 데이터 안전 보장</p>
          </div>
        </div>
      </div>
    </div>
  )
}