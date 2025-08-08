'use client'

import { 
  Users,
  MessageCircle, 
  Target,
  UserPlus,
  CheckCircle2,
  Calendar
} from 'lucide-react'
import CircularProgress from '@/components/ui/CircularProgress'
import { Project, ProjectStatus } from '@/types/project.types'

interface ProjectCardProps {
  project: Project
  onClick: () => void
  onApply?: (project: Project) => void
  currentUserId?: string
}

export default function ProjectCard({
  project,
  onClick,
  onApply,
  currentUserId
}: ProjectCardProps) {
  // 컴포넌트 간소화로 제거된 상태들
  
  // 진행률 계산 (업무 완료율 기준)
  const taskProgress = project.taskCount > 0 
    ? Math.round((project.completedTaskCount / project.taskCount) * 100)
    : project.progress || 0

  // 팀 모집 상태 계산
  const memberCount = project.memberCount || 2
  const maxMembers = 6
  const isRecruiting = memberCount < maxMembers && project.status !== ProjectStatus.COMPLETED
  const availableSlots = maxMembers - memberCount

  // 현재 사용자가 이미 프로젝트 멤버인지 확인
  const isCurrentUserMember = currentUserId && project.members?.some(member => member.userId === currentUserId)
  const isOwner = currentUserId && project.ownerId === currentUserId

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    if (onApply) {
      onApply(project);
    }
  };

  // 최근 채팅 활동 (목업 데이터)
  const mockActivities = [
    { user: '김개발자', content: '새로운 업무를 추가했습니다', timestamp: '2분 전' },
    { user: '박디자이너', content: '디자인 검토가 완료되었습니다', timestamp: '5분 전' },
    { user: '이매니저', content: '마일스톤을 업데이트했습니다', timestamp: '10분 전' },
    { user: '최기획자', content: '요구사항이 변경되었습니다', timestamp: '15분 전' }
  ]
  
  const recentActivity = mockActivities[Math.floor(Math.random() * mockActivities.length)]
  const unreadCount = Math.floor(Math.random() * 8) + 1

  // 상태별 색상
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return 'bg-green-100 text-green-700' // 디자인 시스템: Success 계열
      case ProjectStatus.PLANNING:
        return 'bg-blue-100 text-blue-700'   // 디자인 시스템: Primary Light
      case ProjectStatus.COMPLETED:
        return 'bg-green-100 text-green-700' // 완료는 Success 색상 사용
      case ProjectStatus.ON_HOLD:
        return 'bg-amber-100 text-amber-700'  // 디자인 시스템: Warning 계열
      default:
        return 'bg-gray-100 text-gray-500'    // 디자인 시스템: Text Secondary
    }
  }

  const getStatusText = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return '진행중'
      case ProjectStatus.PLANNING:
        return '계획중'
      case ProjectStatus.COMPLETED:
        return '완료'
      case ProjectStatus.ON_HOLD:
        return '일시중단'
      default:
        return '알 수 없음'
    }
  }

  const handleCardClick = () => {
    onClick()
  }

  // 액션 핸들러 제거됨 - 카드 간소화

  return (
    <div 
      className={`
        p-4 bg-white transition-all duration-300 cursor-pointer group
        border-b border-gray-100 last:border-b-0
        hover:bg-gray-50
      `}
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-4 min-h-[80px]">
        {/* 좌측: 프로젝트 아이콘 + 알림 */}
        <div className="flex-shrink-0 relative">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
            style={{ backgroundColor: '#2563eb' }}
          >
{typeof project.icon === 'string' && project.icon.length === 1 ? 
              project.icon : 
              project.title.charAt(0).toUpperCase()
            }
            
            {/* 채팅 알림 배지 */}
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
        </div>

        {/* 중앙: 프로젝트 정보 */}
        <div className="flex-1 min-w-0">
          {/* 제목 + 상태 + 모집 배지 */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{project.title}</h3>
            
            {/* 완료 아이콘 */}
            {project.status === ProjectStatus.COMPLETED && (
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            )}
            
            {/* 모집 배지 */}
            {isRecruiting && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex-shrink-0">
                <UserPlus className="w-3 h-3" />
                모집중
              </span>
            )}
          </div>

          {/* 설명 */}
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
            {project.description}
          </p>

          {/* 최근 활동 */}
          <div className="flex items-center gap-1 mb-2">
            <MessageCircle className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-500 truncate">
              <span className="font-medium">{recentActivity.user}:</span> {recentActivity.content}
            </span>
            <span className="text-xs text-gray-400 flex-shrink-0">• {recentActivity.timestamp}</span>
          </div>

          {/* 메타 정보 */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{memberCount}명</span>
              {isRecruiting && (
                <span className="text-green-700">({availableSlots}자리)</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>{project.taskCount}개 업무</span>
            </div>
            {project.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(project.dueDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
              </div>
            )}
          </div>
        </div>

        {/* 우측: 진행률 + 상태 */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {/* 원형 프로그레스 */}
          <div className="flex-shrink-0">
            <CircularProgress 
              percentage={taskProgress} 
              size="md"
              color="#2563eb"
              showPercentage={true}
            />
          </div>

          {/* 상태 배지 */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {getStatusText(project.status)}
          </div>

        </div>
      </div>

      {/* 지원하기 버튼 (모집 중이고 현재 사용자가 멤버가 아닌 경우만 표시) */}
      {isRecruiting && !isCurrentUserMember && !isOwner && onApply && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleApplyClick}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>프로젝트 지원하기</span>
          </button>
        </div>
      )}

      {/* 이미 멤버인 경우 */}
      {isCurrentUserMember && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            <span>참여 중인 프로젝트</span>
          </div>
        </div>
      )}
      
    </div>
  )
}