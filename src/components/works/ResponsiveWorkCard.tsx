'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  CheckIcon,
  FlagIcon,
  TrashIcon,
  UserGroupIcon,
  PauseIcon,
  RectangleStackIcon,
  EllipsisHorizontalIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { WorkStatus as TaskStatus, WorkPriority as TaskPriority } from '@/types/work.types'
import { useIsTouch } from '@/hooks/useDeviceType'

// 워클리 업무 인터페이스
interface WorklyTask {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  goalId?: string
  projectId?: string
  assigneeId: string
  assignee: {
    id: string
    name: string
    email: string
  }
  dueDate?: string
  scheduledDate?: string
  tags: string[]
  createdAt: string
  updatedAt: string
  isToday?: boolean
  isFocused?: boolean
}

interface ResponsiveTaskCardProps {
  task: WorklyTask
  onClick: () => void
  onDelete: (taskId: string) => void
  onDelegate: (taskId: string) => void
  onDefer: (taskId: string) => void
  onConvertToProject: (taskId: string) => void
  onToggleComplete: (taskId: string, completed: boolean) => Promise<{ xpGained?: number }>
  onDragStart?: (taskId: string) => void
  onDragEnd?: () => void
  isDragMode?: boolean
  onSetDueDate?: (taskId: string, date: string) => void
  onDueDateUpdated?: (taskId: string, date: string) => void
  keepCalendarOpen?: boolean
}

export default function ResponsiveTaskCard({
  task,
  onClick,
  onDelete,
  onDelegate,
  onDefer,
  onConvertToProject,
  onToggleComplete,
  onDragStart,
  onDragEnd,
  isDragMode = false,
  onSetDueDate,
  onDueDateUpdated,
  keepCalendarOpen = false
}: ResponsiveTaskCardProps) {
  const isTouch = useIsTouch()
  
  // 터치 디바이스용 상태
  const [swipeState, setSwipeState] = useState<'idle' | 'left' | 'right'>('idle')
  const [dragOffset, setDragOffset] = useState(0)
  const [isLongPressing, setIsLongPressing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  // 데스크톱용 상태
  const [isHovered, setIsHovered] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState<{top: number, right: number} | null>(null)
  const [isDesktopDragging, setIsDesktopDragging] = useState(false)
  
  const cardRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const startXRef = useRef<number>(0)
  const startYRef = useRef<number>(0)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isDragDetectedRef = useRef(false)
  const prevDueDateRef = useRef<string | undefined>(task.dueDate)
  const menuCloseTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (menuCloseTimerRef.current) {
        clearTimeout(menuCloseTimerRef.current)
      }
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  // 메뉴 외부 클릭 감지 - 단순화
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActionMenu) {
        const target = event.target as Node
        const menuButton = menuButtonRef.current
        const menuElement = document.querySelector('[data-menu-portal]')
        
        // 메뉴 버튼이나 메뉴 자체를 클릭한 경우가 아니면 닫기
        if (menuButton && !menuButton.contains(target) && 
            menuElement && !menuElement.contains(target)) {
          setShowActionMenu(false)
        }
      }
    }

    if (showActionMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showActionMenu])

  // 날짜 업데이트 감지
  useEffect(() => {
    if (prevDueDateRef.current !== task.dueDate && task.dueDate) {
      onDueDateUpdated?.(task.id, task.dueDate)
      
      // ref 업데이트
      prevDueDateRef.current = task.dueDate
    }
    
    prevDueDateRef.current = task.dueDate
  }, [task.dueDate, task.id, onDueDateUpdated])

  // PRD 준수: Primary Blue 중심의 마감일 시각화
  const getDueDateVisualization = (dueDate?: string) => {
    if (!dueDate) return null // 마감일이 없으면 null 반환
    
    const today = new Date()
    const due = new Date(dueDate)
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24))
    
    if (diffDays < 0) return { 
      color: 'bg-red-500', 
      topText: `${Math.abs(diffDays)}일`,
      bottomText: '지남',
      textColor: 'text-white'
    }
    if (diffDays === 0) return { 
      color: 'bg-blue-600',
      topText: '오늘',
      bottomText: '마감',
      textColor: 'text-white'
    }
    if (diffDays <= 3) return { 
      color: 'bg-blue-500', 
      topText: `${diffDays}일`,
      bottomText: '남음',
      textColor: 'text-white'
    }
    if (diffDays <= 7) return { 
      color: 'bg-blue-400', 
      topText: `${diffDays}일`,
      bottomText: '남음',
      textColor: 'text-white'
    }
    if (diffDays <= 30) return { 
      color: 'bg-blue-300', 
      topText: `${diffDays}일`,
      bottomText: '남음',
      textColor: 'text-blue-900'
    }
    
    return { 
      color: 'bg-gray-100', 
      topText: due.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      bottomText: '마감',
      textColor: 'text-gray-700'
    }
  }

  // 체크박스 상태 관리
  const [isUpdating, setIsUpdating] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [gainedXP, setGainedXP] = useState<number>(0)

  // 체크박스 클릭 처리
  const handleCheckboxClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (isUpdating) return // 중복 클릭 방지
    
    const willBeCompleted = !isCompleted
    
    try {
      setIsUpdating(true)
      
      // 업무 완료 API 호출 및 경험치 획득
      const result = await onToggleComplete(task.id, willBeCompleted)
      
      // 토스트 알림 표시 (완료 시에만)
      if (willBeCompleted && result.xpGained) {
        setGainedXP(result.xpGained)
        setShowToast(true)
        setTimeout(() => {
          setShowToast(false)
          setGainedXP(0)
        }, 3000)
      }
    } catch (error) {
      console.error('업무 상태 변경 실패:', error)
      // TODO: 에러 토스트 표시
    } finally {
      setIsUpdating(false)
    }
  }

  // === 터치 디바이스용 이벤트 핸들러 ===
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isTouch || isDragMode) return
    
    // 이벤트 전파 중단 - 달력 외부 클릭 감지 방지
    e.stopPropagation()
    
    startXRef.current = e.clientX
    startYRef.current = e.clientY
    isDragDetectedRef.current = false

    // 0.5초 후 드래그 모드 활성화
    longPressTimerRef.current = setTimeout(() => {
      if (!isDragDetectedRef.current) {
        setIsLongPressing(true)
        setIsDragging(true)
        
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }
        
        onDragStart?.(task.id)
      }
    }, 500)

    if (cardRef.current) {
      cardRef.current.setPointerCapture(e.pointerId)
    }
  }, [isTouch, isDragMode, onDragStart, task.id])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isTouch || isDragMode || isLongPressing) return

    const deltaX = e.clientX - startXRef.current
    const deltaY = e.clientY - startYRef.current
    
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
      return
    }

    if (Math.abs(deltaX) > 30) {
      isDragDetectedRef.current = true
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }

      setDragOffset(deltaX)
      
      if (deltaX < -80) {
        setSwipeState('left')
      } else if (deltaX > 80) {
        setSwipeState('right')
      } else {
        setSwipeState('idle')
      }
    }
  }, [isTouch, isDragMode, isLongPressing])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isTouch) return

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    if (isDragging) {
      setIsDragging(false)
      setIsLongPressing(false)
      onDragEnd?.()
      return
    }

    if (swipeState === 'left' && Math.abs(dragOffset) > 120) {
      onDelete(task.id)
    } else if (swipeState === 'right' && dragOffset > 120) {
      console.log('Show action menu for task:', task.id)
    } else if (!isDragDetectedRef.current && Math.abs(dragOffset) < 10) {
      onClick()
    }

    setSwipeState('idle')
    setDragOffset(0)
    setIsLongPressing(false)

    if (cardRef.current) {
      cardRef.current.releasePointerCapture(e.pointerId)
    }
  }, [isTouch, isDragging, swipeState, dragOffset, onDragEnd, onDelete, task.id, onClick])

  // === 데스크톱용 이벤트 핸들러 ===
  const handleMouseEnter = () => {
    if (!isTouch) {
      setIsHovered(true)
      // 메뉴 닫기 타이머가 있다면 취소
      if (menuCloseTimerRef.current) {
        clearTimeout(menuCloseTimerRef.current)
        menuCloseTimerRef.current = null
      }
    }
  }

  const handleMouseLeave = () => {
    if (!isTouch) {
      if (showActionMenu) {
        // 메뉴가 열려있으면 300ms 후에 닫기
        menuCloseTimerRef.current = setTimeout(() => {
          setIsHovered(false)
          setShowActionMenu(false)
        }, 300)
      } else {
        // 메뉴가 닫혀있으면 즉시 hover 해제
        setIsHovered(false)
      }
    }
  }

  const handleDesktopClick = () => {
    if (!isTouch) {
      onClick()
    }
  }

  const handleActionMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!showActionMenu && menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + 5,
        right: window.innerWidth - rect.right
      })
      setShowActionMenu(true)
    } else {
      setShowActionMenu(false)
    }
  }

  // === 데스크톱 드래그 앤 드롭 핸들러 ===
  const handleDragStart = (e: React.DragEvent) => {
    if (isTouch) return
    
    // 이벤트 전파 중단 - 달력 외부 클릭 감지 방지
    e.stopPropagation()
    
    e.dataTransfer.setData('text/plain', task.id)
    e.dataTransfer.effectAllowed = 'move'
    
    // 드래그 이미지를 작은 크기로 설정
    const dragImage = document.createElement('div')
    dragImage.className = 'w-12 h-12 bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-center text-xs font-medium text-blue-700 shadow-lg'
    dragImage.style.position = 'absolute'
    dragImage.style.top = '-1000px'
    dragImage.textContent = task.title.substring(0, 2).toUpperCase()
    document.body.appendChild(dragImage)
    
    e.dataTransfer.setDragImage(dragImage, 24, 24)
    
    // 정리
    setTimeout(() => {
      document.body.removeChild(dragImage)
    }, 0)
    
    setIsDesktopDragging(true)
    onDragStart?.(task.id)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    if (isTouch) return
    
    setIsDesktopDragging(false)
    
    // keepCalendarOpen이 true이면 달력을 열어둔 채로 onDragEnd 호출
    onDragEnd?.()
    
    // 드래그가 성공적으로 완료되었을 때의 추가 로직
    if (e.dataTransfer.dropEffect === 'move') {
      // 드롭이 성공했을 때 달력 유지 신호 전송
      console.log('드래그 앤 드롭 성공 - 달력 유지')
    }
  }

  const handleDateSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // HTML5 date input을 사용하여 더 나은 사용자 경험 제공
    const input = document.createElement('input')
    input.type = 'date'
    input.style.position = 'absolute'
    input.style.left = '-9999px'
    
    // 현재 마감일이 있으면 기본값으로 설정
    if (task.dueDate) {
      input.value = task.dueDate.split('T')[0] // YYYY-MM-DD 형식으로 변환
    }
    
    document.body.appendChild(input)
    input.showPicker?.() || input.focus()
    
    input.addEventListener('change', () => {
      if (input.value && onSetDueDate) {
        onSetDueDate(task.id, input.value)
      }
      document.body.removeChild(input)
    })
    
    input.addEventListener('blur', () => {
      setTimeout(() => {
        if (document.body.contains(input)) {
          document.body.removeChild(input)
        }
      }, 100)
    })
    
    setShowActionMenu(false)
  }

  const dueDateInfo = getDueDateVisualization(task.dueDate)
  const isCompleted = task.status === TaskStatus.COMPLETED

  return (
    <div className="relative overflow-hidden">
      {/* 터치 디바이스: 스와이프 백그라운드 액션들 */}
      {isTouch && swipeState !== 'idle' && (
        <>
          {swipeState === 'left' && (
            <div className="absolute inset-y-0 right-0 flex items-center justify-center w-20 bg-red-500">
              <TrashIcon className="w-6 h-6 text-white" />
            </div>
          )}
          
          {swipeState === 'right' && (
            <div className="absolute inset-y-0 left-0 flex items-center gap-2 px-4 bg-blue-100">
              <button
                onClick={() => onDelegate(task.id)}
                className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full"
              >
                <UserGroupIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDefer(task.id)}
                className="flex items-center justify-center w-12 h-12 bg-gray-500 text-white rounded-full"
              >
                <PauseIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => onConvertToProject(task.id)}
                className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full"
              >
                <RectangleStackIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* 메인 카드 */}
      <div 
        ref={cardRef}
        className={`
          p-4 bg-white transition-all duration-300 cursor-pointer group
          ${task.isToday ? 'bg-blue-50/30' : ''}
          ${task.isFocused ? 'ring-2 ring-blue-200' : ''}
          ${isCompleted ? 'opacity-60' : ''}
          ${isTouch && isLongPressing ? 'scale-105 shadow-lg ring-2 ring-blue-300' : 'hover:bg-gray-50'}
          ${isDragging ? 'z-50 shadow-xl' : ''}
          ${isDesktopDragging ? 'scale-110 rotate-2 shadow-2xl z-50 opacity-90' : ''}
        `}
        style={isTouch ? {
          transform: `translateX(${dragOffset}px)`,
          transition: isDragDetectedRef.current ? 'none' : 'transform 0.2s ease-out'
        } : isDesktopDragging ? {
          transform: 'scale(1.1) rotate(2deg)',
          transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        } : {
          transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
        draggable={!isTouch && !isCompleted}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleDesktopClick}
      >
        <div className="flex items-center gap-6 min-h-[60px]">
          {/* 좌측: 세련된 체크박스 */}
          <div className="flex-shrink-0 flex items-center justify-center relative">
            <button
              onClick={handleCheckboxClick}
              disabled={isUpdating}
              className={`
                w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300 ease-out
                shadow-sm active:scale-95
                ${isCompleted 
                  ? 'bg-gray-800 border-gray-800 text-white shadow-gray-300 shadow-md' 
                  : isUpdating
                  ? 'border-2 border-blue-300 bg-blue-50 animate-pulse cursor-not-allowed'
                  : 'border-2 border-gray-300 bg-white hover:border-gray-500 hover:bg-gray-50 hover:shadow-md hover:scale-105 focus:ring-2 focus:ring-gray-200 focus:ring-offset-1 focus:outline-none'
                }
              `}
              aria-label={isCompleted ? "업무 완료 취소" : "업무 완료"}
            >
              {isCompleted && !isUpdating && (
                <CheckIcon className="w-3.5 h-3.5 stroke-[3] animate-in fade-in-0 zoom-in-50 duration-300" />
              )}
              {isUpdating && (
                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              )}
            </button>
            
          </div>

          {/* 중앙: 콘텐츠 영역 */}
          <div className="flex-1 min-w-0 py-1">
            <h3 className={`workly-card-title mb-1 ${
              isCompleted ? 'line-through text-gray-500' : 'group-hover:text-gray-700'
            }`}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className={`workly-caption line-clamp-2 mb-2 ${
                isCompleted ? 'text-gray-400' : ''
              }`}>
                {task.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-1">
              {(task.goalId || task.projectId) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                  <FlagIcon className="w-3 h-3" />
                  {task.goalId ? '목표' : '프로젝트'}
                </span>
              )}
              
              {task.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full"
                >
                  {tag}
                </span>
              ))}
              
              {task.tags.length > 2 && (
                <span className="inline-block px-2 py-1 text-xs text-gray-500">
                  +{task.tags.length - 2}
                </span>
              )}
            </div>
          </div>

          {/* 우측: 마감일 + 데스크톱 더보기 버튼 */}
          <div className="flex-shrink-0 flex items-center gap-3">
            {/* 마감일 시각화 - 마감일이 있을 때만 표시 */}
            {dueDateInfo && (
              <div className={`w-12 h-12 rounded-full ${dueDateInfo.color} flex flex-col items-center justify-center transition-all duration-300`}>
                <span className={`font-bold text-xs leading-tight ${dueDateInfo.textColor}`}>
                  {dueDateInfo.topText}
                </span>
                {dueDateInfo.bottomText && (
                  <span className={`font-medium text-xs leading-tight ${dueDateInfo.textColor}`}>
                    {dueDateInfo.bottomText}
                  </span>
                )}
              </div>
            )}

            {/* 데스크톱: 더보기 버튼 (항상 보임) */}
            {!isTouch && (
              <button
                ref={menuButtonRef}
                onClick={handleActionMenuToggle}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-md transition-colors"
                title="더 많은 액션"
              >
                <EllipsisHorizontalIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 터치 디바이스: 드래그 모드 시 시각적 피드백 */}
      {isTouch && isLongPressing && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 animate-pulse"></div>
      )}

      {/* Portal로 렌더링되는 더보기 메뉴 */}
      {!isTouch && showActionMenu && menuPosition && typeof window !== 'undefined' && createPortal(
        <div 
          data-menu-portal
          className="fixed w-36 bg-white border border-gray-200 rounded-lg shadow-xl z-[999]"
          style={{
            top: menuPosition.top,
            right: menuPosition.right
          }}
          onMouseEnter={() => {
            // 메뉴에 마우스가 들어오면 닫기 타이머 취소
            if (menuCloseTimerRef.current) {
              clearTimeout(menuCloseTimerRef.current)
              menuCloseTimerRef.current = null
            }
            setIsHovered(true)
          }}
          onMouseLeave={() => {
            // 메뉴에서 마우스가 나가면 300ms 후에 닫기
            menuCloseTimerRef.current = setTimeout(() => {
              setIsHovered(false)
              setShowActionMenu(false)
            }, 300)
          }}
        >
            <button
              onClick={() => {
                handleDateSelect({ stopPropagation: () => {} } as any)
                setShowActionMenu(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg flex items-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              날짜 설정
            </button>
            <button
              onClick={() => {
                onDelegate(task.id)
                setShowActionMenu(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <UserGroupIcon className="w-4 h-4" />
              위임
            </button>
            <button
              onClick={() => {
                onDefer(task.id)
                setShowActionMenu(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <PauseIcon className="w-4 h-4" />
              보류
            </button>
            <button
              onClick={() => {
                onConvertToProject(task.id)
                setShowActionMenu(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <RectangleStackIcon className="w-4 h-4" />
              프로젝트로 전환
            </button>
            <button
              onClick={() => {
                if (window.confirm('정말로 이 업무를 삭제하시겠습니까?')) {
                  onDelete(task.id)
                }
                setShowActionMenu(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              삭제
            </button>
        </div>,
        document.body
      )}

      {/* 경험치 토스트 알림 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-[100] animate-slide-up">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckIcon className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <p className="font-medium text-sm">업무 완료!</p>
              <p className="text-xs text-gray-300">+{gainedXP} XP 획득</p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}