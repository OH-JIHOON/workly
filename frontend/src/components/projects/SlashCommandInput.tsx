'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, User, Target, BookOpen, Command } from 'lucide-react'
import { ProjectMember } from '@/types/project.types'

interface SlashCommand {
  command: string
  description: string
  parameters: SlashCommandParameter[]
  example: string
  icon: React.ReactNode
}

interface SlashCommandParameter {
  name: string
  type: 'text' | 'user' | 'date' | 'select'
  required: boolean
  description: string
  options?: string[]
}

interface SlashCommandInputProps {
  input: string
  onCommandExecute: (command: string, params: any) => void
  onCancel: () => void
  members: ProjectMember[]
}

export default function SlashCommandInput({
  input,
  onCommandExecute,
  onCancel,
  members
}: SlashCommandInputProps) {
  const [selectedCommand, setSelectedCommand] = useState<SlashCommand | null>(null)
  const [parameters, setParameters] = useState<{ [key: string]: any }>({})
  const [currentParameterIndex, setCurrentParameterIndex] = useState(0)

  // 사용 가능한 슬래시 명령어 정의
  const availableCommands: SlashCommand[] = [
    {
      command: 'add-task',
      description: '새 업무를 생성하고 담당자를 지정합니다',
      icon: <Target className="w-4 h-4" />,
      parameters: [
        {
          name: 'title',
          type: 'text',
          required: true,
          description: '업무 제목'
        },
        {
          name: 'assignee',
          type: 'user',
          required: true,
          description: '담당자'
        },
        {
          name: 'dueDate',
          type: 'date',
          required: false,
          description: '마감일'
        },
        {
          name: 'priority',
          type: 'select',
          required: false,
          description: '우선순위',
          options: ['low', 'medium', 'high', 'urgent']
        }
      ],
      example: '/add-task UI 디자인 완료 @김디자이너 2024-01-30'
    },
    {
      command: 'delegate',
      description: '기존 업무를 다른 멤버에게 재할당합니다',
      icon: <User className="w-4 h-4" />,
      parameters: [
        {
          name: 'taskId',
          type: 'text',
          required: true,
          description: '업무 ID 또는 제목'
        },
        {
          name: 'toUser',
          type: 'user',
          required: true,
          description: '새 담당자'
        }
      ],
      example: '/delegate #123 @박개발자'
    },
    {
      command: 'set-milestone',
      description: '새로운 프로젝트 마일스톤을 설정합니다',
      icon: <Target className="w-4 h-4" />,
      parameters: [
        {
          name: 'name',
          type: 'text',
          required: true,
          description: '마일스톤 이름'
        },
        {
          name: 'dueDate',
          type: 'date',
          required: true,
          description: '마감일'
        },
        {
          name: 'description',
          type: 'text',
          required: false,
          description: '상세 설명'
        }
      ],
      example: '/set-milestone "Beta 버전 출시" 2024-02-15'
    },
    {
      command: 'link-wiki',
      description: '게시판의 위키 문서를 채팅에 연결합니다',
      icon: <BookOpen className="w-4 h-4" />,
      parameters: [
        {
          name: 'documentName',
          type: 'text',
          required: true,
          description: '위키 문서명'
        }
      ],
      example: '/link-wiki "React 컴포넌트 가이드"'
    }
  ]

  // 입력값에서 명령어 파싱
  useEffect(() => {
    if (!input.startsWith('/')) {
      setSelectedCommand(null)
      setParameters({})
      setCurrentParameterIndex(0)
      return
    }

    const commandText = input.slice(1).split(' ')[0]
    const command = availableCommands.find(cmd => cmd.command === commandText)
    
    if (command && command !== selectedCommand) {
      setSelectedCommand(command)
      setParameters({})
      setCurrentParameterIndex(0)
    }

    // 기본 파라미터 파싱 (간단한 구현)
    if (command) {
      const args = input.slice(1).split(' ').slice(1)
      const newParams: { [key: string]: any } = {}
      
      args.forEach((arg, index) => {
        if (command.parameters[index]) {
          const param = command.parameters[index]
          if (param.type === 'user' && arg.startsWith('@')) {
            newParams[param.name] = arg.slice(1)
          } else {
            newParams[param.name] = arg
          }
        }
      })
      
      setParameters(newParams)
    }
  }, [input, selectedCommand])

  // 명령어 실행
  const handleExecuteCommand = () => {
    if (!selectedCommand) return

    // 필수 파라미터 검증
    const missingRequired = selectedCommand.parameters
      .filter(param => param.required && !parameters[param.name])
      .map(param => param.name)

    if (missingRequired.length > 0) {
      console.warn('필수 파라미터 누락:', missingRequired)
      return
    }

    onCommandExecute(selectedCommand.command, parameters)
  }

  // 파라미터 값 업데이트
  const handleParameterChange = (paramName: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }))
  }

  // 명령어 목록 표시
  if (!selectedCommand) {
    const filteredCommands = availableCommands.filter(cmd =>
      cmd.command.toLowerCase().includes(input.slice(1).toLowerCase())
    )

    return (
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <Command className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">사용 가능한 명령어</span>
        </div>
        
        <div className="space-y-2">
          {filteredCommands.map((command) => (
            <div
              key={command.command}
              className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
              onClick={() => setSelectedCommand(command)}
            >
              <div className="text-blue-600 mt-0.5">
                {command.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-medium text-blue-600">
                    /{command.command}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{command.description}</p>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  예시: {command.example}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ESC를 눌러 취소
          </button>
        </div>
      </div>
    )
  }

  // 선택된 명령어의 파라미터 입력 폼
  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <div className="text-blue-600">
          {selectedCommand.icon}
        </div>
        <span className="font-mono text-sm font-medium text-blue-600">
          /{selectedCommand.command}
        </span>
        <span className="text-sm text-gray-600">- {selectedCommand.description}</span>
      </div>

      <div className="space-y-3">
        {selectedCommand.parameters.map((param, index) => (
          <div key={param.name} className="flex items-center space-x-3">
            <div className="w-20 text-sm text-gray-600 text-right">
              {param.name}
              {param.required && <span className="text-red-500 ml-1">*</span>}
            </div>
            
            <div className="flex-1">
              {param.type === 'text' && (
                <input
                  type="text"
                  value={parameters[param.name] || ''}
                  onChange={(e) => handleParameterChange(param.name, e.target.value)}
                  placeholder={param.description}
                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
              
              {param.type === 'user' && (
                <select
                  value={parameters[param.name] || ''}
                  onChange={(e) => handleParameterChange(param.name, e.target.value)}
                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">담당자 선택...</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.user.name}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              )}
              
              {param.type === 'date' && (
                <input
                  type="date"
                  value={parameters[param.name] || ''}
                  onChange={(e) => handleParameterChange(param.name, e.target.value)}
                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
              
              {param.type === 'select' && param.options && (
                <select
                  value={parameters[param.name] || ''}
                  onChange={(e) => handleParameterChange(param.name, e.target.value)}
                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{param.description} 선택...</option>
                  {param.options.map((option) => (
                    <option key={option} value={option}>
                      {option === 'low' ? '낮음' :
                       option === 'medium' ? '보통' :
                       option === 'high' ? '높음' :
                       option === 'urgent' ? '긴급' : option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          취소
        </button>
        
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-500">
            Enter 키로 실행
          </span>
          <button
            onClick={handleExecuteCommand}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={selectedCommand.parameters.some(param => 
              param.required && !parameters[param.name]
            )}
          >
            실행
          </button>
        </div>
      </div>
    </div>
  )
}