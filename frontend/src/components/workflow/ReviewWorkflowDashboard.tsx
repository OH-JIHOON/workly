'use client'

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'

// 목업 주간 리뷰 데이터
interface WeeklyReview {
  weekRange: string
  totalTasks: number
  completedTasks: number
  totalHours: number
  focusTime: number
  completionRate: number
  productivity: number
  goals: {
    id: string
    title: string
    progress: number
    target: number
    status: 'on_track' | 'behind' | 'ahead'
  }[]
  insights: {
    type: 'positive' | 'warning' | 'suggestion'
    title: string
    description: string
  }[]
  topCategories: {
    category: string
    hours: number
    tasks: number
  }[]
}

const mockWeeklyReview: WeeklyReview = {
  weekRange: '1월 22일 - 1월 28일',
  totalTasks: 18,
  completedTasks: 14,
  totalHours: 32.5,
  focusTime: 18.2,
  completionRate: 78,
  productivity: 85,
  goals: [
    {
      id: '1',
      title: '워클리 플랫폼 완성',
      progress: 75,
      target: 80,
      status: 'behind'
    },
    {
      id: '2',
      title: '개인 역량 강화',
      progress: 48,
      target: 45,
      status: 'ahead'
    }
  ],
  insights: [
    {
      type: 'positive',
      title: '집중 시간 증가',
      description: '이번 주 집중 모드 사용 시간이 지난 주 대비 25% 증가했습니다.'
    },
    {
      type: 'warning',
      title: '마감일 지연 업무',
      description: '3개의 업무가 예정된 마감일을 넘겼습니다. 우선순위를 재검토해보세요.'
    },
    {
      type: 'suggestion',
      title: '오후 생산성 향상 필요',
      description: '오후 시간대 업무 완료율이 60%로 낮습니다. 오후 루틴을 개선해보세요.'
    }
  ],
  topCategories: [
    { category: '개발', hours: 15.5, tasks: 8 },
    { category: '회의', hours: 6.2, tasks: 4 },
    { category: '분석', hours: 4.8, tasks: 3 },
    { category: '문서작업', hours: 3.5, tasks: 2 },
    { category: '학습', hours: 2.5, tasks: 1 }
  ]
}

interface ReviewWorkflowDashboardProps {
  className?: string
}

export default function ReviewWorkflowDashboard({ className = '' }: ReviewWorkflowDashboardProps) {
  const [reviewData, setReviewData] = useState<WeeklyReview>(mockWeeklyReview)
  const [selectedPeriod, setSelectedPeriod] = useState('this_week')
  const [isLoading, setIsLoading] = useState(false)

  const loadReviewData = async (period: string) => {
    setIsLoading(true)
    // 실제로는 API 호출
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  useEffect(() => {
    loadReviewData(selectedPeriod)
  }, [selectedPeriod])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'text-green-600 bg-green-100'
      case 'on_track': return 'text-blue-600 bg-blue-100'
      case 'behind': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ahead': return '앞서고 있음'
      case 'on_track': return '순조롭게 진행'
      case 'behind': return '지연됨'
      default: return '알 수 없음'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
      case 'suggestion': return <LightBulbIcon className="w-5 h-5 text-amber-600" />
      default: return <ChartBarIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-50 border-green-200'
      case 'warning': return 'bg-red-50 border-red-200'
      case 'suggestion': return 'bg-amber-50 border-amber-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">주간 리뷰</h1>
          <p className="text-gray-600 mt-1">{reviewData.weekRange}</p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="this_week">이번 주</option>
          <option value="last_week">지난 주</option>
          <option value="this_month">이번 달</option>
          <option value="last_month">지난 달</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* 주요 지표 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 border">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">완료율</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{reviewData.completionRate}%</div>
              <p className="text-sm text-gray-500 mt-1">
                {reviewData.completedTasks}/{reviewData.totalTasks} 업무
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border">
              <div className="flex items-center space-x-2 mb-2">
                <ClockIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">총 작업 시간</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{reviewData.totalHours}h</div>
              <p className="text-sm text-gray-500 mt-1">
                집중 시간: {reviewData.focusTime}h
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border">
              <div className="flex items-center space-x-2 mb-2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-600">생산성 지수</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{reviewData.productivity}</div>
              <p className="text-sm text-gray-500 mt-1">
                지난 주 대비 +5
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border">
              <div className="flex items-center space-x-2 mb-2">
                <CalendarIcon className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-gray-600">평균 일일 시간</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{(reviewData.totalHours / 7).toFixed(1)}h</div>
              <p className="text-sm text-gray-500 mt-1">
                목표: 6h/일
              </p>
            </div>
          </div>

          {/* 목표 진행 상황 */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">목표 진행 상황</h2>
            </div>
            <div className="p-6 space-y-4">
              {reviewData.goals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{goal.title}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                      {getStatusLabel(goal.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">진행률</span>
                    <span className="font-medium">{goal.progress}% / {goal.target}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        goal.status === 'ahead' ? 'bg-green-500' :
                        goal.status === 'on_track' ? 'bg-blue-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(goal.progress / goal.target) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 인사이트 */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">주간 인사이트</h2>
            </div>
            <div className="p-6 space-y-4">
              {reviewData.insights.map((insight, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getInsightBgColor(insight.type)}`}>
                  <div className="flex items-start space-x-3">
                    {getInsightIcon(insight.type)}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{insight.title}</h3>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 카테고리별 시간 분석 */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">카테고리별 시간 분석</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {reviewData.topCategories.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{category.category}</h3>
                        <p className="text-sm text-gray-500">{category.tasks}개 업무</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{category.hours}h</div>
                      <div className="text-sm text-gray-500">
                        {Math.round((category.hours / reviewData.totalHours) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 다음 주 계획 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">다음 주 개선 계획</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    1
                  </div>
                  <p className="text-sm text-gray-700">
                    오후 시간대 생산성 향상을 위해 15분 휴식 후 집중 모드 활용
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-medium">
                    2
                  </div>
                  <p className="text-sm text-gray-700">
                    마감일 지연 방지를 위해 업무 우선순위 매일 아침 재검토
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
                    3
                  </div>
                  <p className="text-sm text-gray-700">
                    목표 달성률 향상을 위해 주간 중간 점검 스케줄 추가
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}