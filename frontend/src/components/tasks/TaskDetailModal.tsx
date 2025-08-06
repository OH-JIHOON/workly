'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { 
  XMarkIcon, 
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  CalendarDaysIcon,
  ClockIcon,
  LinkIcon,
  CheckCircleIcon,
  PlusIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowsRightLeftIcon,
  PlayIcon,
  StopIcon,
  ClockIcon as ClockSolidIcon,
  ArrowTopRightOnSquareIcon,
  BookOpenIcon,
  GlobeAltIcon,
  DocumentIcon,
  FilmIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { TaskDetail, ChecklistItem, TaskRelationship, WikiReference, TaskStatus, TaskPriority } from '@/types/task.types'
import { worklyApi } from '@/lib/api/workly-api'
import PrioritySelector from '../ui/PrioritySelector'
import ProjectSelector from '../ui/ProjectSelector'
import GoalSelector from '../ui/GoalSelector'

// WorklyMDXEditor를 동적으로 로드 (SSR 방지)
const WorklyMDXEditor = dynamic(
  () => import('../ui/WorklyMDXEditor'),
  { 
    ssr: false,
    loading: () => <div className="h-64 bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
      <p className="text-gray-500">에디터 로딩 중...</p>
    </div>
  }
)

interface TaskDetailModalProps {
  task: TaskDetail | null
  isOpen: boolean
  onClose: () => void
  onSave: (taskDetail: TaskDetail) => void
}

export default function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onSave
}: TaskDetailModalProps) {
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [localTask, setLocalTask] = useState<TaskDetail | null>(null)
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null)
  const [showTaskSearch, setShowTaskSearch] = useState(false)
  const [taskSearchQuery, setTaskSearchQuery] = useState('')
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null)
  const [currentSessionTime, setCurrentSessionTime] = useState(0)
  const [showWikiForm, setShowWikiForm] = useState(false)
  const [newWikiTitle, setNewWikiTitle] = useState('')
  const [newWikiUrl, setNewWikiUrl] = useState('')
  const [newWikiDescription, setNewWikiDescription] = useState('')
  const [urlValidation, setUrlValidation] = useState<{ isValid: boolean; message: string } | null>(null)
  const [editingWikiId, setEditingWikiId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 모달이 열릴 때 로컬 상태 초기화
  useEffect(() => {
    if (isOpen && task) {
      // 완전히 새로운 객체로 초기화하여 이전 데이터 남음 방지
      setLocalTask({
        ...task,
        // 체크리스트, 관계, 위키 레퍼런스 등이 undefined면 빈 배열로 초기화
        checklist: task.checklist || [],
        relationships: task.relationships || [],
        wikiReferences: task.wikiReferences || []
      })
      
      // 편집 상태들도 초기화
      setEditingChecklistId(null)
      setShowTaskSearch(false)
      setTaskSearchQuery('')
      setShowWikiForm(false)
      setNewWikiTitle('')
      setNewWikiUrl('')
      setNewWikiDescription('')
      setUrlValidation(null)
      setEditingWikiId(null)
      
      // 제목 입력 필드에 포커스 (약간의 지연 후)
      setTimeout(() => {
        titleRef.current?.focus()
      }, 100)
    } else if (!isOpen) {
      // 모달이 닫힐 때 모든 상태 초기화
      setLocalTask(null)
      setEditingChecklistId(null)
      setShowTaskSearch(false)
      setTaskSearchQuery('')
      setShowWikiForm(false)
      setNewWikiTitle('')
      setNewWikiUrl('')
      setNewWikiDescription('')
      setUrlValidation(null)
      setEditingWikiId(null)
      setIsTimerRunning(false)
      setTimerStartTime(null)
      setCurrentSessionTime(0)
      
      // 타이머 정리
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [isOpen, task])

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen, onClose])

  // 모달 외부 클릭으로 닫기 (전체화면이 아닐 때만)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isFullScreen && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen && !isFullScreen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, isFullScreen, onClose])

  // Debounced 저장 함수
  const debouncedSave = useCallback((taskData: TaskDetail) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true)
        
        // UpdateTaskDetailDto 구조에 맞게 페이로드 구성
        const updatePayload: any = {}
        
        // 기본 필드들
        if (taskData.title !== undefined && taskData.title !== null) {
          updatePayload.title = taskData.title
        }
        if (taskData.description !== undefined && taskData.description !== null) {
          updatePayload.description = taskData.description
        }
        if (taskData.status !== undefined) {
          updatePayload.status = taskData.status
        }
        if (taskData.priority !== undefined) {
          updatePayload.priority = taskData.priority
        }
        if (taskData.dueDate !== undefined) {
          updatePayload.dueDate = taskData.dueDate
        }
        // UUID 필드들 - 유효한 값일 때만 포함
        if (taskData.projectId !== undefined && taskData.projectId !== null && 
            typeof taskData.projectId === 'string' && taskData.projectId.trim() !== '' && 
            taskData.projectId !== 'undefined' && taskData.projectId !== 'null') {
          updatePayload.projectId = taskData.projectId
        }
        if (taskData.goalId !== undefined && taskData.goalId !== null && 
            typeof taskData.goalId === 'string' && taskData.goalId.trim() !== '' && 
            taskData.goalId !== 'undefined' && taskData.goalId !== 'null') {
          updatePayload.goalId = taskData.goalId
        }
        
        // 상세 필드들
        if (taskData.descriptionMarkdown !== undefined) {
          updatePayload.descriptionMarkdown = taskData.descriptionMarkdown
        }
        if (taskData.checklist !== undefined) {
          updatePayload.checklist = taskData.checklist
        }
        if (taskData.relationships !== undefined) {
          updatePayload.relationships = taskData.relationships
        }
        if (taskData.wikiReferences !== undefined) {
          updatePayload.wikiReferences = taskData.wikiReferences
        }
        if (taskData.estimatedTimeMinutes !== undefined) {
          updatePayload.estimatedTimeMinutes = taskData.estimatedTimeMinutes
        }
        if (taskData.loggedTimeMinutes !== undefined) {
          updatePayload.loggedTimeMinutes = taskData.loggedTimeMinutes
        }
        
        console.log('Sending updateDetail payload:', JSON.stringify(updatePayload, null, 2))
        
        // 상세 정보 업데이트 API 시도, 실패하면 기본 API로 폴백
        try {
          await worklyApi.tasks.updateDetail(taskData.id, updatePayload)
        } catch (detailError: any) {
          console.warn('UpdateTaskDetail API 실패, 기본 API로 폴백:', detailError)
          
          // UpdateTaskDetailDto에서 문제가 되는 필드들을 제거하고 기본 API로 재시도
          const basicPayload = { ...updatePayload }
          delete basicPayload.descriptionMarkdown
          delete basicPayload.checklist
          delete basicPayload.relationships
          delete basicPayload.wikiReferences
          delete basicPayload.estimatedTimeMinutes
          delete basicPayload.loggedTimeMinutes
          
          console.log('Sending basic update payload:', JSON.stringify(basicPayload, null, 2))
          await worklyApi.tasks.update(taskData.id, basicPayload)
        }
      } catch (error: any) {
        console.error('자동 저장 실패:', error)
        if (error.response) {
          console.error('Error response:', error.response.data)
          console.error('Error status:', error.response.status)
        }
      } finally {
        setIsSaving(false)
      }
    }, 1500) // 1.5초 후 저장
  }, [])

  // 로컬 업무 업데이트
  const updateLocalTask = (updates: Partial<TaskDetail>) => {
    if (!localTask) return
    const updatedTask = { ...localTask, ...updates }
    setLocalTask(updatedTask)
    
    // 자동 저장 (debounced)
    debouncedSave(updatedTask)
  }

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // 체크리스트 아이템 토글
  const toggleChecklistItem = (itemId: string) => {
    if (!localTask) return
    
    const updatedChecklist = localTask.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    )
    
    updateLocalTask({ checklist: updatedChecklist })
  }

  // 체크리스트 아이템 추가
  const addChecklistItem = (text: string) => {
    if (!localTask || !text.trim()) return
    
    const newItem: ChecklistItem = {
      id: `checklist-${Date.now()}`,
      text: text.trim(),
      completed: false,
      order: localTask.checklist.length
    }
    
    updateLocalTask({ 
      checklist: [...localTask.checklist, newItem] 
    })
  }

  // 체크리스트 아이템 편집
  const updateChecklistItem = (itemId: string, text: string) => {
    if (!localTask) return
    
    const updatedChecklist = localTask.checklist.map(item =>
      item.id === itemId ? { ...item, text: text.trim() } : item
    )
    
    updateLocalTask({ checklist: updatedChecklist })
  }

  // 체크리스트 아이템 삭제
  const deleteChecklistItem = (itemId: string) => {
    if (!localTask) return
    
    const updatedChecklist = localTask.checklist.filter(item => item.id !== itemId)
    
    updateLocalTask({ checklist: updatedChecklist })
  }

  // 업무 관계 추가
  const addTaskRelationship = async (targetTaskId: string, type: 'blocks' | 'blocked_by' | 'related') => {
    if (!localTask) return
    
    try {
      // 실제 대상 업무 정보를 API에서 가져오기 (옵션)
      // const targetTask = await worklyApi.tasks.getById(targetTaskId)
      
      const newRelationship: TaskRelationship = {
        id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        targetTaskId,
        type,
        // targetTask는 백엔드에서 자동으로 조인해서 가져오므로 생략 가능
        // 또는 간단한 정보만 저장하고 실제 데이터는 백엔드에서 처리
        targetTask: undefined // 백엔드에서 처리하도록 undefined로 설정
      }
      
      updateLocalTask({ 
        relationships: [...localTask.relationships, newRelationship] 
      })
      
      setShowTaskSearch(false)
      setTaskSearchQuery('')
    } catch (error) {
      console.error('업무 관계 추가 실패:', error)
      // 에러 처리
    }
  }

  // 업무 관계 삭제
  const removeTaskRelationship = (relationshipId: string) => {
    if (!localTask) return
    
    const updatedRelationships = localTask.relationships.filter(rel => rel.id !== relationshipId)
    
    updateLocalTask({ relationships: updatedRelationships })
  }

  // 사용 가능한 업무 목록 상태
  const [availableTasks, setAvailableTasks] = useState<{ id: string; title: string }[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)

  // 업무 검색
  useEffect(() => {
    const searchTasks = async () => {
      if (!taskSearchQuery.trim() || !showTaskSearch) {
        setAvailableTasks([])
        return
      }

      try {
        setIsLoadingTasks(true)
        // 실제 업무 검색 API 호출
        const tasks = await worklyApi.tasks.list({ 
          search: taskSearchQuery,
          limit: 10 
        })
        
        // 자기 자신 제외
        const filteredTasks = tasks
          .filter(task => task.id !== localTask?.id)
          .map(task => ({ id: task.id, title: task.title }))
        
        setAvailableTasks(filteredTasks)
      } catch (error) {
        console.error('업무 검색 실패:', error)
        setAvailableTasks([])
      } finally {
        setIsLoadingTasks(false)
      }
    }

    const timeoutId = setTimeout(searchTasks, 300) // 300ms 디바운스
    return () => clearTimeout(timeoutId)
  }, [taskSearchQuery, showTaskSearch, localTask?.id])

  // 검색된 업무 목록
  const filteredTasks = availableTasks

  // 시간 형식 변환 함수
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}시간 ${mins}분`
    }
    return `${mins}분`
  }

  // 타이머 시작
  const startTimer = () => {
    setIsTimerRunning(true)
    setTimerStartTime(new Date())
    setCurrentSessionTime(0)
    
    timerIntervalRef.current = setInterval(() => {
      setCurrentSessionTime(prev => prev + 1)
    }, 60000) // 1분마다 업데이트
  }

  // 타이머 정지
  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    
    if (timerStartTime && localTask) {
      const endTime = new Date()
      const sessionMinutes = Math.round((endTime.getTime() - timerStartTime.getTime()) / 60000)
      const newLoggedTime = (localTask.loggedTimeMinutes || 0) + sessionMinutes
      
      updateLocalTask({ loggedTimeMinutes: newLoggedTime })
    }
    
    setIsTimerRunning(false)
    setTimerStartTime(null)
    setCurrentSessionTime(0)
  }

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [])

  // 문서 타입에 따른 아이콘 반환
  const getDocumentIcon = (url: string) => {
    if (!url) return DocumentTextIcon
    
    try {
      const lowerUrl = url.toLowerCase()
      const pathname = new URL(url).pathname.toLowerCase()
      
      // 위키 사이트들
      if (lowerUrl.includes('wiki') || lowerUrl.includes('notion') || lowerUrl.includes('confluence')) {
        return BookOpenIcon
      }
      
      // 미디어 파일들
      if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
        return PhotoIcon
      }
      
      if (pathname.match(/\.(mp4|webm|mov|avi|mkv)$/)) {
        return FilmIcon
      }
      
      // 문서 파일들
      if (pathname.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx)$/)) {
        return DocumentIcon
      }
      
      // 웹 페이지
      if (lowerUrl.startsWith('http')) {
        return GlobeAltIcon
      }
    } catch {
      // URL 파싱 실패 시 기본 아이콘
    }
    
    return DocumentTextIcon
  }

  // 문서 타입에 따른 색상 반환
  const getDocumentColor = (url: string) => {
    if (!url) return 'text-blue-600'
    
    try {
      const lowerUrl = url.toLowerCase()
      const pathname = new URL(url).pathname.toLowerCase()
      
      // 위키 사이트들
      if (lowerUrl.includes('wiki') || lowerUrl.includes('notion') || lowerUrl.includes('confluence')) {
        return 'text-green-600'
      }
      
      // 미디어 파일들
      if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
        return 'text-purple-600'
      }
      
      if (pathname.match(/\.(mp4|webm|mov|avi|mkv)$/)) {
        return 'text-red-600'
      }
      
      // 문서 파일들
      if (pathname.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx)$/)) {
        return 'text-orange-600'
      }
    } catch {
      // URL 파싱 실패 시 기본 색상
    }
    
    // 웹 페이지
    return 'text-blue-600'
  }

  // URL 유효성 검증
  const validateUrl = (url: string): { isValid: boolean; message: string } => {
    if (!url.trim()) {
      return { isValid: false, message: 'URL을 입력해주세요.' }
    }
    
    try {
      const urlObj = new URL(url)
      
      // 프로토콜 검증
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { isValid: false, message: 'HTTP 또는 HTTPS URL만 허용됩니다.' }
      }
      
      // 기본적인 호스트명 검증
      if (!urlObj.hostname || urlObj.hostname.length < 1) {
        return { isValid: false, message: '올바른 도메인 이름을 입력해주세요.' }
      }
      
      return { isValid: true, message: '유효한 URL입니다.' }
    } catch {
      return { isValid: false, message: '올바른 URL 형식이 아닙니다.' }
    }
  }

  // URL 입력 시 유효성 검증
  const handleUrlChange = (url: string) => {
    setNewWikiUrl(url)
    
    if (url.trim()) {
      const validation = validateUrl(url)
      setUrlValidation(validation)
    } else {
      setUrlValidation(null)
    }
  }

  // 위키 편집 시작
  const startEditingWiki = (wiki: WikiReference) => {
    setEditingWikiId(wiki.id)
    setNewWikiTitle(wiki.title)
    setNewWikiUrl(wiki.url)
    setNewWikiDescription(wiki.description || '')
    setUrlValidation(validateUrl(wiki.url))
    setShowWikiForm(true)
  }

  // 위키 레퍼런스 추가/수정
  const addWikiReference = () => {
    if (!localTask || !newWikiTitle.trim() || !newWikiUrl.trim()) return
    
    // URL 유효성 최종 검증
    const validation = validateUrl(newWikiUrl)
    if (!validation.isValid) {
      setUrlValidation(validation)
      return
    }
    
    if (editingWikiId) {
      // 기존 위키 수정
      const updatedWikiReferences = localTask.wikiReferences.map(wiki =>
        wiki.id === editingWikiId
          ? {
              ...wiki,
              title: newWikiTitle.trim(),
              url: newWikiUrl.trim(),
              description: newWikiDescription.trim() || undefined
            }
          : wiki
      )
      
      updateLocalTask({ wikiReferences: updatedWikiReferences })
    } else {
      // 새 위키 추가
      const newWiki: WikiReference = {
        id: `wiki-${Date.now()}`,
        title: newWikiTitle.trim(),
        url: newWikiUrl.trim(),
        description: newWikiDescription.trim() || undefined
      }
      
      updateLocalTask({ 
        wikiReferences: [...localTask.wikiReferences, newWiki] 
      })
    }
    
    setNewWikiTitle('')
    setNewWikiUrl('')
    setNewWikiDescription('')
    setUrlValidation(null)
    setEditingWikiId(null)
    setShowWikiForm(false)
  }

  // 위키 레퍼런스 삭제
  const removeWikiReference = (wikiId: string) => {
    if (!localTask) return
    
    const updatedWikiReferences = localTask.wikiReferences.filter(wiki => wiki.id !== wikiId)
    
    updateLocalTask({ wikiReferences: updatedWikiReferences })
  }

  // 저장 핸들러
  const handleSave = async () => {
    if (!localTask) return

    try {
      // UpdateTaskDetailDto 구조에 맞게 페이로드 구성
      const updatePayload: any = {}
      
      // 기본 필드들
      if (localTask.title !== undefined && localTask.title !== null) {
        updatePayload.title = localTask.title
      }
      if (localTask.description !== undefined && localTask.description !== null) {
        updatePayload.description = localTask.description
      }
      if (localTask.status !== undefined) {
        updatePayload.status = localTask.status
      }
      if (localTask.priority !== undefined) {
        updatePayload.priority = localTask.priority
      }
      if (localTask.dueDate !== undefined) {
        updatePayload.dueDate = localTask.dueDate
      }
      // UUID 필드들은 null/빈문자열 검증 추가
      if (localTask.projectId !== undefined && localTask.projectId !== null && localTask.projectId.trim() !== '') {
        updatePayload.projectId = localTask.projectId
      }
      if (localTask.goalId !== undefined && localTask.goalId !== null && localTask.goalId.trim() !== '') {
        updatePayload.goalId = localTask.goalId
      }
      
      // 상세 필드들
      if (localTask.descriptionMarkdown !== undefined) {
        updatePayload.descriptionMarkdown = localTask.descriptionMarkdown
      }
      if (localTask.estimatedTimeMinutes !== undefined) {
        updatePayload.estimatedTimeMinutes = localTask.estimatedTimeMinutes
      }
      if (localTask.loggedTimeMinutes !== undefined) {
        updatePayload.loggedTimeMinutes = localTask.loggedTimeMinutes
      }
      
      // 중첩 배열 필드들은 class-transformer 검증 문제로 일시적으로 제외
      // TODO: 별도 엔드포인트 또는 DTO 수정 후 재활성화
      // if (localTask.checklist !== undefined) {
      //   updatePayload.checklist = localTask.checklist
      // }
      // if (localTask.relationships !== undefined) {
      //   updatePayload.relationships = localTask.relationships
      // }
      // if (localTask.wikiReferences !== undefined) {
      //   updatePayload.wikiReferences = localTask.wikiReferences
      // }
      
      console.log('수동 저장 payload:', updatePayload)
      
      // 상세 정보 업데이트 API 사용 (중첩 필드 문제 시 기본 API로 대안)
      let updatedTask
      try {
        updatedTask = await worklyApi.tasks.updateDetail(localTask.id, updatePayload)
      } catch (error) {
        console.warn('상세 API 실패, 기본 API로 대안 시도:', error)
        
        // 기본 API에는 없는 필드들 제거
        const basicPayload = { ...updatePayload }
        delete basicPayload.descriptionMarkdown
        delete basicPayload.estimatedTimeMinutes
        delete basicPayload.loggedTimeMinutes
        
        // 기본 업데이트 API 사용
        updatedTask = await worklyApi.tasks.update(localTask.id, basicPayload)
      }

      // 부모 컴포넌트에 업데이트된 태스크 전달
      onSave(updatedTask as TaskDetail)
      onClose()
    } catch (error) {
      console.error('태스크 저장 실패:', error)
      // 에러 처리 - 실제로는 토스트 알림 등을 표시할 수 있음
      alert('태스크 저장에 실패했습니다. 다시 시도해주세요.')
    }
  }

  if (!isOpen || !localTask) return null

  return (
    <div className={`fixed inset-0 z-50 ${isFullScreen ? 'bg-white' : 'bg-black bg-opacity-50 flex items-center justify-center p-4'}`}>
      <div 
        ref={modalRef}
        className={`
          bg-white rounded-lg shadow-xl
          ${isFullScreen 
            ? 'w-full h-full max-w-none max-h-none rounded-none' 
            : 'w-full max-w-4xl max-h-[90vh]'
          }
          flex flex-col overflow-hidden
        `}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900">업무 상세</h1>
            {isSaving && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full animate-pulse">
                저장 중...
              </span>
            )}
            <div className="flex items-center gap-1">
              {/* 상태 배지 */}
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                localTask.status === TaskStatus.DONE ? 'bg-green-100 text-green-700' :
                localTask.status === TaskStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' :
                localTask.status === TaskStatus.IN_REVIEW ? 'bg-purple-100 text-purple-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {localTask.status === TaskStatus.DONE ? '완료' :
                 localTask.status === TaskStatus.IN_PROGRESS ? '진행 중' :
                 localTask.status === TaskStatus.IN_REVIEW ? '검토 중' :
                 '할 일'}
              </span>
              
              {/* 우선순위 배지 */}
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                localTask.priority === TaskPriority.URGENT ? 'bg-red-100 text-red-700' :
                localTask.priority === TaskPriority.HIGH ? 'bg-blue-100 text-blue-700' :
                localTask.priority === TaskPriority.MEDIUM ? 'bg-blue-50 text-blue-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {localTask.priority === TaskPriority.URGENT ? '긴급' :
                 localTask.priority === TaskPriority.HIGH ? '높음' :
                 localTask.priority === TaskPriority.MEDIUM ? '보통' :
                 '낮음'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 전체화면 토글 */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label={isFullScreen ? '창 모드' : '전체화면'}
            >
              {isFullScreen ? (
                <ArrowsPointingInIcon className="w-5 h-5" />
              ) : (
                <ArrowsPointingOutIcon className="w-5 h-5" />
              )}
            </button>
            
            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="닫기"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* 제목 */}
            <div>
              <input
                ref={titleRef}
                type="text"
                value={localTask.title}
                onChange={(e) => updateLocalTask({ title: e.target.value })}
                className="w-full text-3xl font-bold text-gray-900 border-none outline-none bg-transparent placeholder-gray-400 resize-none"
                placeholder="업무 제목을 입력하세요"
              />
            </div>

            {/* 메타 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 중요도 설정 */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">중요도</label>
                <PrioritySelector
                  value={localTask.priority}
                  onChange={(priority) => updateLocalTask({ priority })}
                  size="sm"
                />
              </div>

              {/* 프로젝트 연동 */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">프로젝트</label>
                <ProjectSelector
                  value={localTask.projectId || null}
                  onChange={(projectId) => updateLocalTask({ projectId })}
                  size="sm"
                  placeholder="프로젝트 선택"
                />
              </div>

              {/* 목표 연동 */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">목표</label>
                <GoalSelector
                  value={localTask.goalId || null}
                  onChange={(goalId) => updateLocalTask({ goalId })}
                  size="sm"
                  placeholder="목표 선택"
                />
              </div>

              {/* 마감일 */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CalendarDaysIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-700">마감일</label>
                  <input
                    type="date"
                    value={localTask.dueDate ? localTask.dueDate.split('T')[0] : ''}
                    onChange={(e) => updateLocalTask({ dueDate: e.target.value ? e.target.value + 'T00:00:00.000Z' : undefined })}
                    className="block text-sm text-gray-900 bg-transparent border-none outline-none"
                  />
                </div>
              </div>

              {/* 시간 추적 */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <ClockSolidIcon className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">시간 추적</label>
                  <div className="flex items-center gap-2 mt-1">
                    {isTimerRunning ? (
                      <>
                        <button
                          onClick={stopTimer}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                        >
                          <StopIcon className="w-3 h-3" />
                          정지
                        </button>
                        <span className="text-xs text-red-600 font-medium">
                          진행 중 ({currentSessionTime}분)
                        </span>
                      </>
                    ) : (
                      <button
                        onClick={startTimer}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                      >
                        <PlayIcon className="w-3 h-3" />
                        시작
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 시간 관리 섹션 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                시간 관리
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 예상 시간 */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">예상 시간</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={localTask.estimatedTimeMinutes || ''}
                      onChange={(e) => updateLocalTask({ estimatedTimeMinutes: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="0"
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-500">분</span>
                    {localTask.estimatedTimeMinutes && (
                      <span className="text-xs text-gray-600">
                        ({formatTime(localTask.estimatedTimeMinutes)})
                      </span>
                    )}
                  </div>
                </div>

                {/* 실제 시간 */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">실제 시간</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={localTask.loggedTimeMinutes || ''}
                      onChange={(e) => updateLocalTask({ loggedTimeMinutes: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="0"
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-500">분</span>
                    {localTask.loggedTimeMinutes && (
                      <span className="text-xs text-gray-600">
                        ({formatTime(localTask.loggedTimeMinutes)})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 시간 비교 */}
              {localTask.estimatedTimeMinutes && localTask.loggedTimeMinutes && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">진행률:</span>
                    <span className={`font-medium ${
                      localTask.loggedTimeMinutes > localTask.estimatedTimeMinutes 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {Math.round((localTask.loggedTimeMinutes / localTask.estimatedTimeMinutes) * 100)}%
                      {localTask.loggedTimeMinutes > localTask.estimatedTimeMinutes && ' (초과)'}
                    </span>
                  </div>
                  
                  {/* 프로그레스 바 */}
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        localTask.loggedTimeMinutes > localTask.estimatedTimeMinutes 
                          ? 'bg-red-500' 
                          : 'bg-blue-500'
                      }`}
                      style={{
                        width: `${Math.min((localTask.loggedTimeMinutes / localTask.estimatedTimeMinutes) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 설명 (MDX 에디터) */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                설명
              </h3>
              <WorklyMDXEditor
                markdown={localTask.descriptionMarkdown || localTask.description || ''}
                onChange={(value) => updateLocalTask({ 
                  descriptionMarkdown: value,
                  description: value // 기본 description도 동기화
                })}
                placeholder="업무에 대한 자세한 설명을 입력하세요..."
              />
            </div>

            {/* 체크리스트 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5" />
                체크리스트
                {localTask.checklist.length > 0 && (
                  <span className="text-sm text-gray-500">
                    ({localTask.checklist.filter(item => item.completed).length}/{localTask.checklist.length})
                  </span>
                )}
              </h3>
              
              <div className="space-y-2">
                {localTask.checklist.map((item) => (
                  <div key={item.id} className="group flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <button
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        item.completed 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {item.completed && <CheckCircleIcon className="w-3 h-3" />}
                    </button>
                    
                    {editingChecklistId === item.id ? (
                      <input
                        type="text"
                        defaultValue={item.text}
                        className="flex-1 bg-white border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onBlur={(e) => {
                          updateChecklistItem(item.id, e.target.value)
                          setEditingChecklistId(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateChecklistItem(item.id, e.currentTarget.value)
                            setEditingChecklistId(null)
                          }
                          if (e.key === 'Escape') {
                            setEditingChecklistId(null)
                          }
                        }}
                      />
                    ) : (
                      <span 
                        className={`flex-1 cursor-pointer ${
                          item.completed ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}
                        onClick={() => setEditingChecklistId(item.id)}
                      >
                        {item.text}
                      </span>
                    )}
                    
                    {/* 편집/삭제 버튼 */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={() => setEditingChecklistId(item.id)}
                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="편집"
                      >
                        <PencilIcon className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteChecklistItem(item.id)}
                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="삭제"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* 새 체크리스트 아이템 추가 */}
                <div className="flex items-center gap-3 p-2">
                  <div className="w-5 h-5 rounded border-2 border-gray-300" />
                  <input
                    type="text"
                    placeholder="새 체크리스트 아이템 추가..."
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        addChecklistItem(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 관련 업무 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  관련 업무
                  {localTask.relationships.length > 0 && (
                    <span className="text-sm text-gray-500">({localTask.relationships.length})</span>
                  )}
                </h3>
                <button
                  onClick={() => setShowTaskSearch(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  관계 추가
                </button>
              </div>
              
              {localTask.relationships.length > 0 ? (
                <div className="space-y-2">
                  {localTask.relationships.map((relationship) => {
                    const getRelationIcon = (type: string) => {
                      switch (type) {
                        case 'blocks':
                          return <ArrowRightIcon className="w-4 h-4 text-red-500" />
                        case 'blocked_by':
                          return <ArrowLeftIcon className="w-4 h-4 text-red-500" />
                        case 'related':
                          return <ArrowsRightLeftIcon className="w-4 h-4 text-blue-500" />
                        default:
                          return <LinkIcon className="w-4 h-4 text-gray-500" />
                      }
                    }

                    const getRelationLabel = (type: string) => {
                      switch (type) {
                        case 'blocks':
                          return '차단함'
                        case 'blocked_by':
                          return '차단됨'
                        case 'related':
                          return '관련됨'
                        case 'parent':
                          return '상위 업무'
                        case 'child':
                          return '하위 업무'
                        default:
                          return '관련'
                      }
                    }

                    return (
                      <div key={relationship.id} className="group flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        {getRelationIcon(relationship.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-full">
                              {getRelationLabel(relationship.type)}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {relationship.targetTask?.title || `업무 #${relationship.targetTaskId}`}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeTaskRelationship(relationship.id)}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          title="관계 제거"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <LinkIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">관련 업무가 없습니다.</p>
                  <button
                    onClick={() => setShowTaskSearch(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1"
                  >
                    관계 추가하기
                  </button>
                </div>
              )}

              {/* 업무 검색 모달 */}
              {showTaskSearch && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-25 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[70vh] overflow-hidden">
                    {/* 검색 헤더 */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">업무 관계 추가</h4>
                        <button
                          onClick={() => {
                            setShowTaskSearch(false)
                            setTaskSearchQuery('')
                          }}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {/* 검색 입력 */}
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={taskSearchQuery}
                          onChange={(e) => setTaskSearchQuery(e.target.value)}
                          placeholder="업무 제목으로 검색..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* 업무 목록 */}
                    <div className="max-h-80 overflow-y-auto">
                      {isLoadingTasks ? (
                        <div className="p-8 text-center text-gray-500">
                          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                          <p className="text-sm">업무를 검색하고 있습니다...</p>
                        </div>
                      ) : filteredTasks.length > 0 ? (
                        <div className="p-2">
                          {filteredTasks.map((task) => (
                            <div
                              key={task.id}
                              className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                            >
                              <div className="font-medium text-gray-900 mb-2">{task.title}</div>
                              
                              {/* 관계 타입 선택 */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => addTaskRelationship(task.id, 'blocks')}
                                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                                >
                                  <ArrowRightIcon className="w-3 h-3" />
                                  차단함
                                </button>
                                <button
                                  onClick={() => addTaskRelationship(task.id, 'blocked_by')}
                                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                                >
                                  <ArrowLeftIcon className="w-3 h-3" />
                                  차단됨
                                </button>
                                <button
                                  onClick={() => addTaskRelationship(task.id, 'related')}
                                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                                >
                                  <ArrowsRightLeftIcon className="w-3 h-3" />
                                  관련됨
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <MagnifyingGlassIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">
                            {taskSearchQuery ? '검색 결과가 없습니다.' : '업무를 검색해보세요.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 위키 레퍼런스 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5" />
                  위키 레퍼런스
                  {localTask.wikiReferences.length > 0 && (
                    <span className="text-sm text-gray-500">({localTask.wikiReferences.length})</span>
                  )}
                </h3>
                <button
                  onClick={() => setShowWikiForm(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  위키 추가
                </button>
              </div>
              
              {localTask.wikiReferences.length > 0 ? (
                <div className="space-y-2">
                  {localTask.wikiReferences.map((wiki) => {
                    const DocumentIcon = getDocumentIcon(wiki.url)
                    const documentColor = getDocumentColor(wiki.url)
                    
                    return (
                      <div key={wiki.id} className="group flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                        <DocumentIcon className={`w-5 h-5 ${documentColor} flex-shrink-0`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-blue-900">{wiki.title}</h4>
                            <LinkIcon className="w-3 h-3 text-blue-600" />
                          </div>
                          {wiki.description && (
                            <p className="text-xs text-blue-700 mt-1">{wiki.description}</p>
                          )}
                          <p className="text-xs text-blue-600 mt-1 font-mono truncate">{wiki.url}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => window.open(wiki.url, '_blank')}
                          className="w-6 h-6 flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-200 rounded transition-all"
                          title="위키 열기"
                        >
                          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startEditingWiki(wiki)}
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                          title="위키 편집"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeWikiReference(wiki.id)}
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          title="위키 제거"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">연결된 위키 문서가 없습니다.</p>
                  <button
                    onClick={() => setShowWikiForm(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1"
                  >
                    위키 추가하기
                  </button>
                </div>
              )}

              {/* 위키 추가 폼 */}
              {showWikiForm && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-25 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                    {/* 폼 헤더 */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {editingWikiId ? '위키 레퍼런스 편집' : '위키 레퍼런스 추가'}
                        </h4>
                        <button
                          onClick={() => {
                            setShowWikiForm(false)
                            setNewWikiTitle('')
                            setNewWikiUrl('')
                            setNewWikiDescription('')
                            setUrlValidation(null)
                            setEditingWikiId(null)
                          }}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* 폼 내용 */}
                    <div className="p-4 space-y-4">
                      <div>
                        <label htmlFor="wiki-title" className="block text-sm font-medium text-gray-700 mb-1">
                          제목 *
                        </label>
                        <input
                          id="wiki-title"
                          type="text"
                          value={newWikiTitle}
                          onChange={(e) => setNewWikiTitle(e.target.value)}
                          placeholder="위키 문서 제목"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="wiki-url" className="block text-sm font-medium text-gray-700 mb-1">
                          URL *
                        </label>
                        <div className="relative">
                          <input
                            id="wiki-url"
                            type="url"
                            value={newWikiUrl}
                            onChange={(e) => handleUrlChange(e.target.value)}
                            placeholder="https://wiki.example.com/document"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              urlValidation 
                                ? urlValidation.isValid 
                                  ? 'border-green-300 bg-green-50' 
                                  : 'border-red-300 bg-red-50'
                                : 'border-gray-300'
                            }`}
                          />
                          {urlValidation && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              {urlValidation.isValid ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                              ) : (
                                <XMarkIcon className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                        {urlValidation && (
                          <p className={`text-xs mt-1 ${
                            urlValidation.isValid ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {urlValidation.message}
                          </p>
                        )}
                        
                        {/* URL 미리보기 */}
                        {newWikiUrl && urlValidation?.isValid && (
                          <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                            <div className="flex items-center gap-2 text-sm">
                              <LinkIcon className="w-4 h-4 text-blue-600" />
                              <span className="text-blue-900 font-medium">미리보기:</span>
                              <a 
                                href={newWikiUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 underline truncate flex-1"
                              >
                                {newWikiUrl}
                              </a>
                              <button
                                type="button"
                                onClick={() => window.open(newWikiUrl, '_blank')}
                                className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded"
                                title="새 탭에서 열기"
                              >
                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label htmlFor="wiki-description" className="block text-sm font-medium text-gray-700 mb-1">
                          설명 (선택)
                        </label>
                        <textarea
                          id="wiki-description"
                          value={newWikiDescription}
                          onChange={(e) => setNewWikiDescription(e.target.value)}
                          placeholder="위키 문서에 대한 간단한 설명"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                      </div>
                    </div>

                    {/* 폼 푸터 */}
                    <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setShowWikiForm(false)
                          setNewWikiTitle('')
                          setNewWikiUrl('')
                          setNewWikiDescription('')
                          setUrlValidation(null)
                          setEditingWikiId(null)
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        취소
                      </button>
                      <button
                        onClick={addWikiReference}
                        disabled={!newWikiTitle.trim() || !newWikiUrl.trim() || !urlValidation?.isValid}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {editingWikiId ? '수정' : '추가'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            생성일: {new Date(localTask.createdAt).toLocaleDateString('ko-KR')}
            {localTask.updatedAt && localTask.updatedAt !== localTask.createdAt && (
              <span className="ml-4">
                수정일: {new Date(localTask.updatedAt).toLocaleDateString('ko-KR')}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}