'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Plus, Paperclip, Smile, MoreHorizontal, User, Calendar, Hash } from 'lucide-react'
import { Project, ProjectMember } from '@/types/project.types'
import SlashCommandInput from './SlashCommandInput'

// 채팅 메시지 타입
interface ChatMessage {
  id: string
  type: 'message' | 'system' | 'task_created' | 'milestone_update'
  content: string
  userId: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: string
  metadata?: any
  isEdited?: boolean
  editedAt?: string
  mentions?: string[]
  attachments?: {
    id: string
    name: string
    type: string
    url: string
    size: number
  }[]
  slashCommandResult?: {
    type: 'task_created' | 'milestone_set' | 'user_delegated'
    data: any
  }
}

interface ProjectChatChannelProps {
  project: Project
  members: ProjectMember[]
  onTaskCreate?: (taskData: any) => void
  onMilestoneCreate?: (milestoneData: any) => void
  onUserDelegate?: (delegationData: any) => void
}

export default function ProjectChatChannel({ 
  project, 
  members,
  onTaskCreate,
  onMilestoneCreate,
  onUserDelegate
}: ProjectChatChannelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSlashCommandMode, setIsSlashCommandMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 목업 메시지 데이터
  useEffect(() => {
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        type: 'system',
        content: `${project.title} 프로젝트 채널에 오신 것을 환영합니다!`,
        userId: 'system',
        user: { id: 'system', name: 'System' },
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1일 전
      },
      {
        id: '2',
        type: 'message',
        content: '안녕하세요! 프로젝트 킥오프 미팅 일정을 공유드립니다.',
        userId: 'user1',
        user: { id: 'user1', name: '김워클리', avatar: '👤' },
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1시간 전
      },
      {
        id: '3',
        type: 'task_created',
        content: '/add-task UI 목업 디자인 완료 @김디자이너 2024-01-30',
        userId: 'user2',
        user: { id: 'user2', name: '박매니저', avatar: '👨‍💼' },
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30분 전
        slashCommandResult: {
          type: 'task_created',
          data: {
            title: 'UI 목업 디자인 완료',
            assignee: '김디자이너',
            dueDate: '2024-01-30'
          }
        }
      },
      {
        id: '4',
        type: 'message',
        content: '네, 확인했습니다! 내일까지 완료하겠습니다.',
        userId: 'user3',
        user: { id: 'user3', name: '김디자이너', avatar: '🎨' },
        timestamp: new Date(Date.now() - 900000).toISOString(), // 15분 전
      }
    ]
    setMessages(mockMessages)
  }, [project.title])

  // 메시지 목록 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'message',
      content: newMessage,
      userId: 'current_user',
      user: { id: 'current_user', name: '나', avatar: '👤' },
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
    setIsSlashCommandMode(false)
  }

  // 슬래시 명령어 실행
  const handleSlashCommand = async (command: string, params: any) => {
    setIsLoading(true)
    
    try {
      let systemMessage: ChatMessage

      switch (command) {
        case 'add-task':
          systemMessage = {
            id: Date.now().toString(),
            type: 'task_created',
            content: `✅ 새 업무가 생성되었습니다: "${params.title}" → ${params.assignee} (마감: ${params.dueDate})`,
            userId: 'current_user',
            user: { id: 'current_user', name: '나', avatar: '👤' },
            timestamp: new Date().toISOString(),
            slashCommandResult: {
              type: 'task_created',
              data: params
            }
          }
          onTaskCreate?.(params)
          break

        case 'set-milestone':
          systemMessage = {
            id: Date.now().toString(),
            type: 'milestone_update',
            content: `🎯 마일스톤이 설정되었습니다: "${params.name}" (마감: ${params.dueDate})`,
            userId: 'current_user',
            user: { id: 'current_user', name: '나', avatar: '👤' },
            timestamp: new Date().toISOString(),
            slashCommandResult: {
              type: 'milestone_set',
              data: params
            }
          }
          onMilestoneCreate?.(params)
          break

        case 'delegate':
          systemMessage = {
            id: Date.now().toString(),
            type: 'system',
            content: `🔄 업무가 ${params.fromUser}에서 ${params.toUser}로 재할당되었습니다`,
            userId: 'current_user',
            user: { id: 'current_user', name: '나', avatar: '👤' },
            timestamp: new Date().toISOString(),
            slashCommandResult: {
              type: 'user_delegated',
              data: params
            }
          }
          onUserDelegate?.(params)
          break

        default:
          systemMessage = {
            id: Date.now().toString(),
            type: 'system',
            content: `❌ 알 수 없는 명령어: /${command}`,
            userId: 'system',
            user: { id: 'system', name: 'System' },
            timestamp: new Date().toISOString(),
          }
      }

      setMessages(prev => [...prev, systemMessage])
      setNewMessage('')
      setIsSlashCommandMode(false)

    } catch (error) {
      console.error('슬래시 명령어 실행 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 키보드 이벤트 핸들링
  const handleKeyPress = (e: React.KeyboardEvent) => {
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
    <div className="flex flex-col h-full bg-white">
      {/* 채널 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Hash className="w-5 h-5 text-gray-500" />
          <div>
            <h2 className="font-semibold text-gray-900">{project.title}</h2>
            <p className="text-sm text-gray-500">{members.length}명의 멤버</p>
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
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* 슬래시 명령어 입력 */}
      {isSlashCommandMode && (
        <div className="border-t border-gray-200 bg-gray-50">
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

      {/* 메시지 입력 */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={isSlashCommandMode ? "슬래시 명령어를 입력하세요..." : `${project.title}에 메시지 보내기...`}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isSlashCommandMode ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Paperclip className="w-5 h-5 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Smile className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading || isSlashCommandMode}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}