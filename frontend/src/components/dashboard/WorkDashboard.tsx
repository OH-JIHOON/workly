'use client'

import { 
  ClockIcon, 
  CalendarDaysIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserGroupIcon,
  PlusIcon 
} from '@heroicons/react/24/outline'

const dashboardData = {
  stats: [
    {
      title: '오늘 할 일',
      value: '8',
      change: '+2',
      icon: ClockIcon,
      color: 'text-blue-600'
    },
    {
      title: '진행 중인 프로젝트',
      value: '3',
      change: '0',
      icon: ChartBarIcon,
      color: 'text-green-600'
    },
    {
      title: '완료된 업무',
      value: '24',
      change: '+5',
      icon: CheckCircleIcon,
      color: 'text-purple-600'
    },
    {
      title: '팀 멤버',
      value: '12',
      change: '+1',
      icon: UserGroupIcon,
      color: 'text-orange-600'
    }
  ],
  recentTasks: [
    {
      id: 1,
      title: '프론트엔드 컴포넌트 리팩토링',
      project: '워클리 프로젝트',
      priority: 'high',
      dueDate: '오늘',
      status: 'in-progress'
    },
    {
      id: 2,
      title: 'API 문서 업데이트',
      project: '백엔드 개발',
      priority: 'medium',
      dueDate: '내일',
      status: 'pending'
    },
    {
      id: 3,
      title: '사용자 피드백 분석',
      project: 'UX 개선',
      priority: 'low',
      dueDate: '이번 주',
      status: 'completed'
    }
  ],
  upcomingMeetings: [
    {
      id: 1,
      title: '주간 스프린트 리뷰',
      time: '14:00',
      participants: 5
    },
    {
      id: 2,
      title: '클라이언트 미팅',
      time: '16:30',
      participants: 3
    }
  ]
}

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
}

const statusColors = {
  'in-progress': 'bg-blue-100 text-blue-800',
  'pending': 'bg-gray-100 text-gray-800',
  'completed': 'bg-green-100 text-green-800'
}

export default function WorkDashboard() {
  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dashboardData.stats.map((stat, index) => (
          <div key={index} className="workly-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">
                  {stat.change !== '0' && (
                    <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span>
                  )}
                </p>
              </div>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 최근 업무 */}
        <div className="workly-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">최근 업무</h2>
            <button className="workly-button-outline text-xs px-3 py-1">
              전체 보기
            </button>
          </div>
          
          <div className="space-y-3">
            {dashboardData.recentTasks.map((task) => (
              <div key={task.id} className="p-3 bg-secondary rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm">{task.title}</h3>
                  <div className="flex gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                      {task.priority === 'high' ? '높음' : task.priority === 'medium' ? '보통' : '낮음'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{task.project}</span>
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="w-3 h-3" />
                    <span>{task.dueDate}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[task.status as keyof typeof statusColors]}`}>
                    {task.status === 'in-progress' ? '진행중' : task.status === 'pending' ? '대기' : '완료'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 오늘 일정 */}
        <div className="workly-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">오늘 일정</h2>
            <button className="workly-button-outline text-xs px-3 py-1">
              <PlusIcon className="w-3 h-3 mr-1" />
              추가
            </button>
          </div>
          
          <div className="space-y-3">
            {dashboardData.upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="p-3 bg-secondary rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{meeting.title}</h3>
                  <span className="text-sm font-mono text-muted-foreground">{meeting.time}</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <UserGroupIcon className="w-3 h-3 mr-1" />
                  <span>{meeting.participants}명 참여</span>
                </div>
              </div>
            ))}
            
            {/* 빈 슬롯 표시 */}
            <div className="p-3 border-2 border-dashed border-border rounded-lg">
              <div className="text-center text-muted-foreground">
                <CalendarDaysIcon className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">일정이 없습니다</p>
                <button className="text-xs text-primary hover:underline mt-1">
                  새 일정 추가
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="workly-card">
        <h2 className="text-lg font-semibold mb-4">빠른 작업</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="workly-button-outline flex items-center justify-center p-4 h-20 text-sm">
            <PlusIcon className="w-5 h-5 mr-2" />
            새 업무
          </button>
          <button className="workly-button-outline flex items-center justify-center p-4 h-20 text-sm">
            <ChartBarIcon className="w-5 h-5 mr-2" />
            프로젝트
          </button>
          <button className="workly-button-outline flex items-center justify-center p-4 h-20 text-sm">
            <CalendarDaysIcon className="w-5 h-5 mr-2" />
            일정 등록
          </button>
          <button className="workly-button-outline flex items-center justify-center p-4 h-20 text-sm">
            <UserGroupIcon className="w-5 h-5 mr-2" />
            팀 초대
          </button>
        </div>
      </div>
    </div>
  )
}