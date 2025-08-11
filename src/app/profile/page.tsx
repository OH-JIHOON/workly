'use client'

import { useState } from 'react'
import { 
  UserIcon,
  ChartBarIcon,
  StarIcon,
  TrophyIcon,
  FireIcon,
  UsersIcon,
  ChevronRightIcon,
  ClockIcon,
  FolderIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import {
  TrophyIcon as TrophyIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid'
import Header from '@/components/layout/Header'
import MainContainer from '@/components/layout/MainContainer'
import WorklyFloatingActionButton from '@/components/ui/WorklyFloatingActionButton'
import LoginBanner from '@/components/ui/LoginBanner'
import ReviewWorkflowDashboard from '@/components/workflow/ReviewWorkflowDashboard'

// 목업 사용자 데이터
const mockUser = {
  id: 'user1',
  name: '김워클리',
  email: 'workly@example.com',
  avatar: null,
  joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  worklyMethodologyAdoption: '85%',
  cperCyclesCompleted: 24,
  totalTasksCompleted: 156,
  currentStreak: 7,
  // 게이미피케이션 데이터
  level: 12,
  currentXP: 2850,
  nextLevelXP: 3200,
  reputation: 1425,
  totalBadges: 8,
  currentSeason: 'Q4 - 비전가 시즌',
  seasonRank: 156,
  totalUsers: 2847,
  followers: 23,
  following: 18
}

// 목업 업적/배지 데이터
const mockBadges = [
  { id: 1, name: '첫 걸음', description: '첫 번째 업무 완료', icon: '🎯', rarity: 'common', earned: true },
  { id: 2, name: '연속 도전자', description: '7일 연속 업무 완료', icon: '🔥', rarity: 'rare', earned: true },
  { id: 3, name: '협업의 달인', description: '10개 프로젝트 완료', icon: '🤝', rarity: 'epic', earned: true },
  { id: 4, name: '지식 나눔이', description: '위키 문서 5개 작성', icon: '📚', rarity: 'rare', earned: false }
]

// 목업 스킬 데이터
const mockSkills = [
  { name: 'UX 디자인', level: 8, progress: 75, category: 'Design' },
  { name: '프로젝트 관리', level: 6, progress: 40, category: 'Management' },
  { name: 'React 개발', level: 9, progress: 20, category: 'Development' },
  { name: '데이터 분석', level: 4, progress: 85, category: 'Analysis' }
]

// 목업 최근 활동 데이터
const mockRecentActivities = [
  { id: 1, type: 'task', title: '사용자 인터페이스 리뷰 완료', time: '2시간 전', xp: 50 },
  { id: 2, type: 'project', title: '워클리 프론트엔드 프로젝트 참여', time: '1일 전', xp: 100 },
  { id: 3, type: 'badge', title: '협업의 달인 배지 획득', time: '3일 전', xp: 200 },
  { id: 4, type: 'wiki', title: 'React 최적화 가이드 작성', time: '1주 전', xp: 75 }
]

// 프로필 페이지는 활동 기능에 집중

export default function ProfilePage() {
  const [showReviewDashboard, setShowReviewDashboard] = useState(false)

  const handleLogout = () => {
    console.log('로그아웃')
    // TODO: 로그아웃 처리
  }

  if (showReviewDashboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="주간 리뷰" />
        <LoginBanner />
        <MainContainer>
          <div className="mb-4">
            <button
              onClick={() => setShowReviewDashboard(false)}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← 프로필로 돌아가기
            </button>
          </div>
          <ReviewWorkflowDashboard />
        </MainContainer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <Header title="Worker" />
      
      {/* 로그인 배너 (헤더 바깥) */}
      <LoginBanner />
      
      {/* 메인 콘텐츠 */}
      <MainContainer>
        {/* 사용자 정보 카드 */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              {mockUser.avatar ? (
                <img 
                  src={mockUser.avatar} 
                  alt={mockUser.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{mockUser.name}</h2>
              <p className="text-gray-600">{mockUser.email}</p>
              <p className="text-sm text-gray-500">
                {new Date(mockUser.joinedAt).toLocaleDateString('ko-KR')}부터 워클리 사용
              </p>
            </div>
          </div>
          
          {/* 워클리 방법론 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{mockUser.worklyMethodologyAdoption}</div>
              <div className="text-sm text-gray-500">방법론 활용도</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{mockUser.cperCyclesCompleted}</div>
              <div className="text-sm text-gray-500">CPER 사이클</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{mockUser.totalTasksCompleted}</div>
              <div className="text-sm text-gray-500">완료한 업무</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{mockUser.currentStreak}</div>
              <div className="text-sm text-gray-500">연속 실행 일</div>
            </div>
          </div>
        </div>

        {/* CPER 리뷰 섹션 */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">CPER 워크플로우 리뷰</h3>
              <p className="text-gray-600 text-sm">주간 성과를 분석하고 개선점을 찾아보세요</p>
            </div>
            <button
              onClick={() => setShowReviewDashboard(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
            >
              <ChartBarIcon className="w-4 h-4" />
              <span>리뷰 시작</span>
            </button>
          </div>
          
          {/* 간단한 미리보기 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-blue-600 font-semibold text-sm mb-1">이번 주 완료율</div>
              <div className="text-2xl font-bold text-blue-900">78%</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-green-600 font-semibold text-sm mb-1">집중 시간</div>
              <div className="text-2xl font-bold text-green-900">18.2h</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-purple-600 font-semibold text-sm mb-1">생산성 지수</div>
              <div className="text-2xl font-bold text-purple-900">85</div>
            </div>
          </div>
        </div>

        {/* 성장 시스템 대시보드 */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">성장 시스템</h3>
              <p className="text-gray-600 text-sm">레벨, 경험치, 업적을 확인하세요</p>
            </div>
            <div className="flex items-center space-x-2 text-amber-600">
              <TrophyIconSolid className="w-5 h-5" />
              <span className="font-bold">Level {mockUser.level}</span>
            </div>
          </div>
          
          {/* XP 진행률 바 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">경험치 (XP)</span>
              <span className="text-sm text-gray-500">{mockUser.currentXP} / {mockUser.nextLevelXP}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(mockUser.currentXP / mockUser.nextLevelXP) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">다음 레벨까지 {mockUser.nextLevelXP - mockUser.currentXP} XP</p>
          </div>

          {/* 핵심 지표 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <StarIconSolid className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-xl font-bold text-purple-700">{mockUser.reputation}</div>
              <div className="text-xs text-purple-600">평판 점수</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <TrophyIconSolid className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-xl font-bold text-amber-700">{mockUser.totalBadges}</div>
              <div className="text-xs text-amber-600">획득 배지</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <FireIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-xl font-bold text-blue-700">{mockUser.seasonRank}</div>
              <div className="text-xs text-blue-600">시즌 순위</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <UsersIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-xl font-bold text-green-700">{mockUser.followers}</div>
              <div className="text-xs text-green-600">팔로워</div>
            </div>
          </div>
        </div>

        {/* 업적 및 배지 */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">업적 및 배지</h3>
              <p className="text-gray-600 text-sm">달성한 업적과 획득한 배지를 확인하세요</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
              전체 보기
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockBadges.map((badge) => (
              <div 
                key={badge.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  badge.earned 
                    ? 'border-gray-200 bg-white shadow-sm' 
                    : 'border-dashed border-gray-300 bg-gray-50 opacity-60'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <div className={`font-semibold text-sm ${badge.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                    {badge.name}
                  </div>
                  <div className={`text-xs mt-1 ${badge.earned ? 'text-gray-600' : 'text-gray-400'}`}>
                    {badge.description}
                  </div>
                  <div className={`inline-block px-2 py-1 mt-2 rounded-full text-xs font-medium ${
                    badge.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                    badge.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {badge.rarity === 'epic' ? '전설' : badge.rarity === 'rare' ? '희귀' : '일반'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 스킬 트리 */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">스킬 트리</h3>
              <p className="text-gray-600 text-sm">전문 분야별 역량 개발 현황</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
              상세 보기
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="space-y-4">
            {mockSkills.map((skill, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-gray-900">{skill.name}</span>
                    <span className="ml-2 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                      {skill.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">Lv.{skill.level}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${skill.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-12">{skill.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 시즌 및 리더보드 */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">현재 시즌</h3>
              <p className="text-gray-600 text-sm">{mockUser.currentSeason}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">#{mockUser.seasonRank}</div>
              <div className="text-xs text-gray-500">/ {mockUser.totalUsers}명</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-indigo-900">비전가 시즌 도전과제</div>
                <div className="text-sm text-indigo-700 mt-1">회고와 장기 목표 설정에 집중하세요</div>
              </div>
              <div className="text-3xl">🌟</div>
            </div>
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">최근 활동</h3>
              <p className="text-gray-600 text-sm">최근 완료한 업무와 참여한 활동들</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
              전체 히스토리
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="space-y-3">
            {mockRecentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'task' ? 'bg-blue-100' :
                    activity.type === 'project' ? 'bg-green-100' :
                    activity.type === 'badge' ? 'bg-purple-100' :
                    'bg-amber-100'
                  }`}>
                    {activity.type === 'task' && <ClockIcon className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'project' && <FolderIcon className="w-4 h-4 text-green-600" />}
                    {activity.type === 'badge' && <TrophyIcon className="w-4 h-4 text-purple-600" />}
                    {activity.type === 'wiki' && <DocumentTextIcon className="w-4 h-4 text-amber-600" />}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{activity.title}</div>
                    <div className="text-sm text-gray-500">{activity.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-amber-600">+{activity.xp} XP</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 소셜 네트워크 */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">네트워크</h3>
              <p className="text-gray-600 text-sm">팔로워와 팔로잉 현황</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{mockUser.followers}</div>
              <div className="text-sm text-blue-700">팔로워</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{mockUser.following}</div>
              <div className="text-sm text-green-700">팔로잉</div>
            </div>
          </div>
        </div>
      </MainContainer>
      
      {/* 워클리 플로팅 액션 버튼 */}
      <WorklyFloatingActionButton 
        onAddTask={() => console.log('업무 추가')}
        onAddProject={() => console.log('프로젝트 추가')}
        // onAddGoal 제거됨
      />
    </div>
  )
}