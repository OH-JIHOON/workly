'use client'

import { useState } from 'react'
import { 
  Users,
  MessageCircle, 
  Target,
  UserPlus,
  CheckCircle2,
  Calendar,
  MoreHorizontal
} from 'lucide-react'
import { useIsTouch } from '@/hooks/useDeviceType'
import CircularProgress from '@/components/ui/CircularProgress'
import { Project, ProjectStatus } from '@/types/project.types'

interface ProjectCardProps {
  project: Project
  onClick: () => void
  onJoinProject?: (projectId: string) => void
  onOpenChat?: (projectId: string) => void
  onManageGoals?: (projectId: string) => void
}

export default function ProjectCard({
  project,
  onClick,
  onJoinProject,
  onOpenChat,
  onManageGoals
}: ProjectCardProps) {
  const isTouch = useIsTouch()
  const [isHovered, setIsHovered] = useState(false)
  
  // 진행률 계산 (업무 완료율 기준)
  const taskProgress = project.taskCount > 0 
    ? Math.round((project.completedTaskCount / project.taskCount) * 100)
    : project.progress || 0

  // 팀 모집 상태 계산
  const memberCount = project.memberCount || 2
  const maxMembers = 6
  const isRecruiting = memberCount < maxMembers && project.status !== ProjectStatus.COMPLETED
  const availableSlots = maxMembers - memberCount

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
        return 'bg-green-100 text-green-800'
      case ProjectStatus.PLANNING:
        return 'bg-blue-100 text-blue-800'
      case ProjectStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800'
      case ProjectStatus.ON_HOLD:
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }

  return (
    <div 
      className={`
        p-4 bg-white transition-all duration-300 cursor-pointer group
        border-b border-gray-100 last:border-b-0
        hover:bg-gray-50
      `}
      onClick={handleCardClick}
      onMouseEnter={() => !isTouch && setIsHovered(true)}
      onMouseLeave={() => !isTouch && setIsHovered(false)}
    >
      <div className="flex items-center gap-4 min-h-[80px]">
        {/* 좌측: 프로젝트 아이콘 + 알림 */}
        <div className="flex-shrink-0 relative">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
            style={{ backgroundColor: project.color || '#3B82F6' }}
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
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
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
                <span className="text-green-600">({availableSlots}자리)</span>
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

        {/* 우측: 진행률 + 액션 */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {/* 원형 프로그레스 */}
          <div className="flex flex-col items-center">
            <CircularProgress 
              percentage={taskProgress} 
              size="md"
              color={project.color || '#2563eb'}
              showPercentage={true}
            />
            <div className="text-xs text-gray-500 mt-1">
              {project.completedTaskCount}/{project.taskCount}
            </div>
          </div>

          {/* 상태 배지 */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {getStatusText(project.status)}
          </div>

          {/* 더보기 버튼 (데스크톱만) */}
          {!isTouch && (
            <button
              onClick={(e) => handleActionClick(e, () => console.log('더보기 메뉴'))}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-md transition-colors"
              title="더 많은 액션"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 호버 시 액션 버튼 (데스크톱) */}
      {!isTouch && (isHovered || isTouch) && (
        <div className="mt-3 flex gap-2 animate-in fade-in-0 slide-in-from-top-1 duration-200">
          <button 
            onClick={(e) => handleActionClick(e, () => onOpenChat?.(project.id))}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>채팅</span>
          </button>
          <button 
            onClick={(e) => handleActionClick(e, () => onManageGoals?.(project.id))}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Target className="w-4 h-4" />
            <span>목표</span>
          </button>
          {isRecruiting && (
            <button 
              onClick={(e) => handleActionClick(e, () => onJoinProject?.(project.id))}
              className="flex items-center justify-center px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
      
      {/* 모바일 터치 액션 표시 */}
      {isTouch && (
        <div className="mt-3 flex gap-2">
          <button 
            onClick={(e) => handleActionClick(e, () => onOpenChat?.(project.id))}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg active:bg-blue-100"
          >
            <MessageCircle className="w-4 h-4" />
            <span>채팅</span>
          </button>
          <button 
            onClick={(e) => handleActionClick(e, () => onManageGoals?.(project.id))}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-purple-50 text-purple-600 rounded-lg active:bg-purple-100"
          >
            <Target className="w-4 h-4" />
            <span>목표</span>
          </button>
          {isRecruiting && (
            <button 
              onClick={(e) => handleActionClick(e, () => onJoinProject?.(project.id))}
              className="flex items-center justify-center px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg active:bg-green-100"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}