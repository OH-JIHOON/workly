'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import useWebSocket from './useWebSocket';
import { Project, ProjectMember } from '@/types/project.types';

export interface ChatMessage {
  id: string;
  type: 'message' | 'system' | 'task_created' | 'milestone_update' | 'user_joined' | 'user_left';
  content: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  metadata?: any;
  isEdited?: boolean;
  editedAt?: string;
  mentions?: string[];
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  }[];
  slashCommandResult?: {
    type: 'task_created' | 'milestone_set' | 'user_delegated';
    data: any;
  };
}

interface UseProjectChatOptions {
  project: Project;
  members: ProjectMember[];
  onTaskCreate?: (taskData: any) => void;
  onMilestoneCreate?: (milestoneData: any) => void;
  onUserDelegate?: (delegationData: any) => void;
}

interface UseProjectChatReturn {
  messages: ChatMessage[];
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  sendSlashCommand: (command: string, params: any) => Promise<void>;
  typingUsers: string[];
  onlineUsers: string[];
}

export function useProjectChat({
  project,
  members,
  onTaskCreate,
  onMilestoneCreate,
  onUserDelegate
}: UseProjectChatOptions): UseProjectChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesInitialized = useRef(false);

  // WebSocket 연결 및 메시지 핸들링
  const { isConnected, joinProjectRoom, leaveProjectRoom, sendMessage: socketSend, error } = useWebSocket({
    onMessage: handleWebSocketMessage,
    onConnect: handleWebSocketConnect,
    onDisconnect: handleWebSocketDisconnect
  });

  // WebSocket 연결 시
  async function handleWebSocketConnect() {
    try {
      await joinProjectRoom(project.id);
      console.log(`Joined project chat room: ${project.id}`);
    } catch (err) {
      console.error('Failed to join project room:', err);
    }
  }

  // WebSocket 연결 해제 시
  async function handleWebSocketDisconnect() {
    try {
      await leaveProjectRoom(project.id);
    } catch (err) {
      console.error('Failed to leave project room:', err);
    }
  }

  // WebSocket 메시지 처리
  function handleWebSocketMessage(wsMessage: { type: string; data: any; timestamp: string }) {
    const { type, data, timestamp } = wsMessage;

    switch (type) {
      case 'project:user_joined':
        handleUserJoined(data);
        break;

      case 'project:user_left':
        handleUserLeft(data);
        break;

      case 'chat:message':
        handleChatMessage(data);
        break;

      case 'chat:slash_command_result':
        handleSlashCommandResult(data);
        break;

      case 'user:online':
        handleUserOnline(data);
        break;

      case 'user:offline':
        handleUserOffline(data);
        break;

      case 'task:updated':
        if (data.projectId === project.id) {
          // 업무 업데이트로 인한 알림 메시지 추가
          addSystemMessage(`업무가 업데이트되었습니다: ${data.title || data.taskId}`);
        }
        break;

      default:
        console.log('Unhandled WebSocket message:', type, data);
    }
  }

  // 사용자 참여 처리
  function handleUserJoined(data: { userId: string; projectId: string; timestamp: string }) {
    const member = members.find(m => m.userId === data.userId);
    if (member) {
      addSystemMessage(`${member.user.name}님이 프로젝트에 참여했습니다.`, 'user_joined');
      setOnlineUsers(prev => [...new Set([...prev, data.userId])]);
    }
  }

  // 사용자 나감 처리
  function handleUserLeft(data: { userId: string; projectId: string; timestamp: string }) {
    const member = members.find(m => m.userId === data.userId);
    if (member) {
      addSystemMessage(`${member.user.name}님이 프로젝트에서 나갔습니다.`, 'user_left');
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    }
  }

  // 채팅 메시지 처리
  function handleChatMessage(data: any) {
    const newMessage: ChatMessage = {
      id: data.id,
      type: 'message',
      content: data.content,
      userId: data.userId,
      user: data.user,
      timestamp: data.timestamp,
      metadata: data.metadata,
      mentions: data.mentions,
      attachments: data.attachments
    };

    setMessages(prev => [...prev, newMessage]);
  }

  // 슬래시 명령어 결과 처리
  function handleSlashCommandResult(data: any) {
    const { command, params, result, user, timestamp } = data;

    let content = '';
    let slashCommandResult;

    switch (command) {
      case 'add-task':
        content = `✅ 새 업무가 생성되었습니다: "${params.title}" → ${params.assignee}${params.dueDate ? ` (마감: ${params.dueDate})` : ''}`;
        slashCommandResult = { type: 'task_created', data: params };
        onTaskCreate?.(params);
        break;

      case 'set-milestone':
        content = `🎯 마일스톤이 설정되었습니다: "${params.name}" (마감: ${params.dueDate})`;
        slashCommandResult = { type: 'milestone_set', data: params };
        onMilestoneCreate?.(params);
        break;

      case 'delegate':
        content = `🔄 업무가 ${params.fromUser}에서 ${params.toUser}로 재할당되었습니다`;
        slashCommandResult = { type: 'user_delegated', data: params };
        onUserDelegate?.(params);
        break;

      default:
        content = `명령어 실행됨: /${command}`;
    }

    const newMessage: ChatMessage = {
      id: `slash_${Date.now()}`,
      type: command === 'add-task' ? 'task_created' : 'system',
      content,
      userId: user.id,
      user,
      timestamp,
      slashCommandResult
    };

    setMessages(prev => [...prev, newMessage]);
  }

  // 사용자 온라인 상태 처리
  function handleUserOnline(data: { userId: string; timestamp: string }) {
    setOnlineUsers(prev => [...new Set([...prev, data.userId])]);
  }

  // 사용자 오프라인 상태 처리
  function handleUserOffline(data: { userId: string; timestamp: string }) {
    setOnlineUsers(prev => prev.filter(id => id !== data.userId));
  }

  // 시스템 메시지 추가
  function addSystemMessage(content: string, type: ChatMessage['type'] = 'system') {
    const systemMessage: ChatMessage = {
      id: `system_${Date.now()}`,
      type,
      content,
      userId: 'system',
      user: { id: 'system', name: 'System' },
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, systemMessage]);
  }

  // 일반 메시지 전송
  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!content.trim() || !isConnected) {
      return;
    }

    setIsLoading(true);

    try {
      const messageData = {
        projectId: project.id,
        content: content.trim(),
        type: 'message',
        timestamp: new Date().toISOString()
      };

      // WebSocket으로 메시지 전송
      socketSend('chat:message', messageData);

      // 목업 모드에서는 로컬에 바로 추가
      const mockMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'message',
        content: content.trim(),
        userId: 'current_user',
        user: { id: 'current_user', name: '나', avatar: '👤' },
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, mockMessage]);

    } catch (err) {
      console.error('Failed to send message:', err);
      addSystemMessage('메시지 전송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [project.id, isConnected, socketSend]);

  // 슬래시 명령어 전송
  const sendSlashCommand = useCallback(async (command: string, params: any): Promise<void> => {
    if (!isConnected) {
      addSystemMessage('연결이 끊어져 명령어를 실행할 수 없습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const commandData = {
        projectId: project.id,
        command,
        params,
        timestamp: new Date().toISOString()
      };

      // WebSocket으로 슬래시 명령어 전송
      socketSend('chat:slash_command', commandData);

      // 목업 모드에서는 로컬에서 즉시 처리
      handleSlashCommandResult({
        command,
        params,
        result: { success: true },
        user: { id: 'current_user', name: '나', avatar: '👤' },
        timestamp: new Date().toISOString()
      });

    } catch (err) {
      console.error('Failed to execute slash command:', err);
      addSystemMessage(`명령어 실행에 실패했습니다: /${command}`);
    } finally {
      setIsLoading(false);
    }
  }, [project.id, isConnected, socketSend, onTaskCreate, onMilestoneCreate, onUserDelegate]);

  // 목업 메시지 초기화
  useEffect(() => {
    if (!messagesInitialized.current) {
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
          content: '✅ 새 업무가 생성되었습니다: "UI 목업 디자인 완료" → 김디자이너 (마감: 2024-01-30)',
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
      ];

      setMessages(mockMessages);
      messagesInitialized.current = true;
    }
  }, [project.title]);

  // 프로젝트 변경 시 메시지 초기화
  useEffect(() => {
    messagesInitialized.current = false;
    setMessages([]);
  }, [project.id]);

  return {
    messages,
    isConnected,
    isLoading,
    error,
    sendMessage,
    sendSlashCommand,
    typingUsers,
    onlineUsers
  };
}

export default useProjectChat;