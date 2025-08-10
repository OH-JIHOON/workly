'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Plus, Paperclip, Smile, MoreHorizontal, User, Calendar, Hash, ArrowLeft, PanelRightOpen, PanelRightClose, Wifi, WifiOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Project, ProjectMember } from '@/types/project.types'
import SlashCommandInput from './SlashCommandInput'
import { useScrollVisibility } from '@/hooks/useScrollVisibility'
import useProjectChat, { ChatMessage } from '@/hooks/useProjectChat'

interface ProjectChatChannelProps {
  project: Project
  members: ProjectMember[]
  isSidebarOpen?: boolean
  isMobile?: boolean
  onToggleSidebar?: () => void
  onTaskCreate?: (taskData: any) => void
  onMilestoneCreate?: (milestoneData: any) => void
  onUserDelegate?: (delegationData: any) => void
}

export default function ProjectChatChannel({ 
  project, 
  members,
  isSidebarOpen = true,
  isMobile = false,
  onToggleSidebar,
  onTaskCreate,
  onMilestoneCreate,
  onUserDelegate
}: ProjectChatChannelProps) {
  const router = useRouter()
  const [newMessage, setNewMessage] = useState('')
  const [isSlashCommandMode, setIsSlashCommandMode] = useState(false)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // 스크롤 가시성 관리
  const { elementRef: messageScrollRef } = useScrollVisibility({
    hideDelay: 1500,
    showOnHover: true
  })

  // 프로젝트 채팅 훅 사용
  const {
    messages,
    isConnected,
    isLoading,
    error,
    sendMessage,
    sendSlashCommand,
    typingUsers,
    onlineUsers
  } = useProjectChat({
    project,
    members,
    onTaskCreate,
    onMilestoneCreate,
    onUserDelegate
  })

  // 메시지 목록 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])


  // 모바일 키보드 감지 및 viewport 처리
  useEffect(() => {
    if (!isMobile) return

    const handleResize = () => {
      const viewport = window.visualViewport
      if (viewport) {
        const keyboardHeight = window.innerHeight - viewport.height
        setIsKeyboardVisible(keyboardHeight > 100)
      }
    }

    const handleFocus = () => {
      if (isMobile) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 300)
      }
    }

    window.visualViewport?.addEventListener('resize', handleResize)
    inputRef.current?.addEventListener('focus', handleFocus)

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize)
      inputRef.current?.removeEventListener('focus', handleFocus)
    }
  }, [isMobile])

  // 입력 변화 감지 (슬래시 명령어 모드)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewMessage(value)
    
    // 슬래시 명령어 감지
    if (value.startsWith('/')) {
      setIsSlashCommandMode(true)
    } else {
      setIsSlashCommandMode(false)
    }
  }

  // 일반 메시지 전송
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    try {
      await sendMessage(newMessage.trim())
      setNewMessage('')
      setIsSlashCommandMode(false)
    } catch (error) {
      console.error('메시지 전송 실패:', error)
    }
  }

  // 슬래시 명령어 실행
  const handleSlashCommand = async (command: string, params: any) => {
    try {
      await sendSlashCommand(command, params)
      setNewMessage('')
      setIsSlashCommandMode(false)
    } catch (error) {
      console.error('슬래시 명령어 실행 실패:', error)
    }
  }

  // 키보드 이벤트 핸들링
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (isSlashCommandMode) {
        // 슬래시 명령어는 SlashCommandInput에서 처리
        return
      }
      handleSendMessage()
    }
  }

  // 메시지 렌더링
  const renderMessage = (message: ChatMessage) => {
    const isSystem = message.type === 'system'
    const isTaskCreated = message.type === 'task_created'
    const isMilestoneUpdate = message.type === 'milestone_update'

    return (
      <div
        key={message.id}
        className={`mb-4 ${isSystem ? 'text-center' : ''}`}
      >
        {isSystem ? (
          <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
            {message.content}
          </div>
        ) : (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                {message.user.avatar || message.user.name.charAt(0)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-gray-900">{message.user.name}</span>
                <span className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className={`${
                isTaskCreated || isMilestoneUpdate 
                  ? 'bg-green-50 border border-green-200 rounded-lg p-3' 
                  : ''
              }`}>
                <p className={`text-gray-800 ${
                  isTaskCreated || isMilestoneUpdate ? 'text-green-800' : ''
                }`}>
                  {message.content}
                </p>
                {message.slashCommandResult && (
                  <div className="mt-2 text-xs text-green-600">
                    {message.slashCommandResult.type === 'task_created' && '📝 업무 생성됨'}
                    {message.slashCommandResult.type === 'milestone_set' && '🎯 마일스톤 설정됨'}
                    {message.slashCommandResult.type === 'user_delegated' && '🔄 업무 재할당됨'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* 채널 헤더 - 상단 고정 */}
      <div className={`fixed top-0 flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white shadow-sm transition-all duration-300 ${
        isMobile || !isSidebarOpen ? 'left-0 right-0' : 'left-0 right-[640px]'
      } z-50`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <Hash className="w-5 h-5 text-gray-500" />
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center space-x-2">
              <span>{project.title}</span>
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-500" title="실시간 연결됨" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" title="연결 끊어짐" />
              )}
            </h2>
            <p className="text-sm text-gray-500">
              {members.length}명의 멤버 • {onlineUsers.length}명 온라인
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <User className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>
          {onToggleSidebar && (
            <button 
              onClick={onToggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isSidebarOpen ? "사이드바 닫기" : "사이드바 열기"}
            >
              {isSidebarOpen ? (
                <PanelRightClose className="w-5 h-5 text-gray-500" />
              ) : (
                <PanelRightOpen className="w-5 h-5 text-gray-500" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 메시지 목록 - 완전 독립적인 스크롤 영역 */}
      <div 
        ref={messageScrollRef}
        className={`fixed overflow-y-auto p-4 space-y-4 scroll-smooth scrollbar-on-hover bg-white transition-all duration-300 ${
          isMobile || !isSidebarOpen ? 'left-0 right-0' : 'left-0 right-[640px]'
        }`} 
        style={{
          top: '80px', // 헤더 바로 아래
          bottom: '80px' // 입력창 바로 위
        }}
      >
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* 슬래시 명령어 입력 - 고정 위치 */}
      {isSlashCommandMode && (
        <div className={`fixed z-60 border-t border-gray-200 bg-gray-50 transition-all duration-200 ${
          isMobile || !isSidebarOpen ? 'left-0 right-0' : 'left-0 right-[640px]'
        }`} style={{
          bottom: '80px' // 입력창 바로 위
        }}>
          <SlashCommandInput
            input={newMessage}
            onCommandExecute={handleSlashCommand}
            onCancel={() => {
              setIsSlashCommandMode(false)
              setNewMessage('')
            }}
            members={members}
          />
        </div>
      )}

      {/* 메시지 입력 - 하단 고정 */}
      <div className={`fixed z-55 p-4 border-t border-gray-200 bg-white shadow-lg transition-all duration-200 ${
        isMobile || !isSidebarOpen ? 'left-0 right-0' : 'left-0 right-[640px]'
      }`} style={{
        bottom: '0'
      }}>
        <div className={`flex items-end space-x-3 max-w-full ${
          isMobile ? 'pb-safe' : ''
        }`}>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isSlashCommandMode ? "슬래시 명령어를 입력하세요..." : `${project.title}에 메시지 보내기...`}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                isSlashCommandMode ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
              } text-base`}
              disabled={isLoading}
              enterKeyHint="send"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
            />
          </div>
          <div className="flex items-center space-x-1">
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
              type="button"
            >
              <Paperclip className="w-5 h-5 text-gray-500" />
            </button>
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
              type="button"
            >
              <Smile className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading || isSlashCommandMode}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              type="button"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}