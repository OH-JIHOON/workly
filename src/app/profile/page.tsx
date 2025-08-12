'use client'

import { useState, useEffect } from 'react'
import { 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import ContentHeader from '@/components/layout/ContentHeader'
import MainContainer from '@/components/layout/MainContainer'
import LoginBanner from '@/components/ui/LoginBanner'
import { isAuthenticated } from '@/lib/auth'
import { useSupabaseAuth } from '@/lib/stores/auth.store'

// 단순한 사용자 정보 인터페이스
interface SimpleUser {
  name: string
  email: string
  avatar?: string
  joinedAt: string
  totalTasksCompleted: number
  currentStreak: number
}

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { user, signOut } = useSupabaseAuth()
  
  // 목업 사용자 데이터
  const mockUser: SimpleUser = {
    name: user?.first_name + ' ' + user?.last_name || '워클리 사용자',
    email: user?.email || 'workly@example.com',
    avatar: user?.avatar_url,
    joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    totalTasksCompleted: 156,
    currentStreak: 7,
  }

  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
  }, [])

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await signOut()
    }
  }

  const handleSettings = () => {
    // TODO: 설정 페이지로 이동
    alert('설정 기능은 준비 중입니다.')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ContentHeader title="Worker" />
      <LoginBanner />
      
      <MainContainer className="pb-20 md:pb-20">
        {isLoggedIn ? (
          <div className="space-y-6">
            {/* 프로필 정보 카드 */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  {mockUser.avatar ? (
                    <img 
                      src={mockUser.avatar} 
                      alt="프로필" 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{mockUser.name}</h2>
                  <p className="text-gray-600">{mockUser.email}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(mockUser.joinedAt).toLocaleDateString('ko-KR')} 가입
                  </p>
                </div>
              </div>
            </div>

            {/* 간단한 통계 */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">나의 활동</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{mockUser.totalTasksCompleted}</div>
                  <div className="text-sm text-gray-500">완료한 업무</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">{mockUser.currentStreak}</div>
                  <div className="text-sm text-gray-500">연속 실행 일</div>
                </div>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">설정</h3>
              <div className="space-y-3">
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Cog6ToothIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">설정</span>
                  </div>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
                >
                  <div className="flex items-center">
                    <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-500 mr-3" />
                    <span>로그아웃</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">로그인이 필요합니다</h3>
            <p className="text-gray-600">프로필을 보려면 로그인해주세요.</p>
          </div>
        )}
      </MainContainer>
    </div>
  )
}