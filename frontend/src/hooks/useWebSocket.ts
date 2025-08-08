'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/stores/authStore';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

interface UseWebSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Error) => void;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  joinProjectRoom: (projectId: string) => Promise<void>;
  leaveProjectRoom: (projectId: string) => Promise<void>;
  sendMessage: (event: string, data: any) => void;
  error: Error | null;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    autoConnect = true,
    onConnect,
    onDisconnect,
    onMessage,
    onError
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuthStore();

  // WebSocket 연결
  const connect = useCallback(() => {
    if (socketRef.current?.connected || !user) {
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      socketRef.current = io(backendUrl, {
        auth: {
          token: user.accessToken // authStore에서 토큰 가져오기
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // 연결 성공
      socketRef.current.on('connect', () => {
        console.log('WebSocket connected:', socketRef.current?.id);
        setIsConnected(true);
        setError(null);
        onConnect?.();
      });

      // 연결 해제
      socketRef.current.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        setIsConnected(false);
        onDisconnect?.();
      });

      // 연결 오류
      socketRef.current.on('connect_error', (err) => {
        console.error('WebSocket connection error:', err);
        setError(new Error(`연결 실패: ${err.message}`));
        onError?.(err);
      });

      // 일반적인 메시지 리스너들
      socketRef.current.on('user:online', (data) => {
        onMessage?.({ type: 'user:online', data, timestamp: new Date().toISOString() });
      });

      socketRef.current.on('user:offline', (data) => {
        onMessage?.({ type: 'user:offline', data, timestamp: new Date().toISOString() });
      });

      socketRef.current.on('project:updated', (data) => {
        onMessage?.({ type: 'project:updated', data, timestamp: new Date().toISOString() });
      });

      socketRef.current.on('task:updated', (data) => {
        onMessage?.({ type: 'task:updated', data, timestamp: new Date().toISOString() });
      });

      socketRef.current.on('notification', (data) => {
        onMessage?.({ type: 'notification', data, timestamp: new Date().toISOString() });
      });

      socketRef.current.on('comment:added', (data) => {
        onMessage?.({ type: 'comment:added', data, timestamp: new Date().toISOString() });
      });

    } catch (err) {
      const error = err instanceof Error ? err : new Error('WebSocket 연결 중 오류 발생');
      setError(error);
      onError?.(error);
    }
  }, [user, onConnect, onDisconnect, onMessage, onError]);

  // WebSocket 연결 해제
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // 프로젝트 룸 참여
  const joinProjectRoom = useCallback(async (projectId: string): Promise<void> => {
    if (!socketRef.current?.connected) {
      throw new Error('WebSocket이 연결되지 않았습니다');
    }

    return new Promise((resolve, reject) => {
      socketRef.current?.emit('join:project', { projectId }, (response: any) => {
        if (response?.success) {
          console.log(`Joined project room: ${projectId}`);
          resolve();
        } else {
          reject(new Error(`프로젝트 룸 참여 실패: ${projectId}`));
        }
      });

      // 타임아웃 처리
      setTimeout(() => {
        reject(new Error('프로젝트 룸 참여 타임아웃'));
      }, 5000);
    });
  }, []);

  // 프로젝트 룸 나가기
  const leaveProjectRoom = useCallback(async (projectId: string): Promise<void> => {
    if (!socketRef.current?.connected) {
      return;
    }

    return new Promise((resolve, reject) => {
      socketRef.current?.emit('leave:project', { projectId }, (response: any) => {
        if (response?.success) {
          console.log(`Left project room: ${projectId}`);
          resolve();
        } else {
          reject(new Error(`프로젝트 룸 나가기 실패: ${projectId}`));
        }
      });

      setTimeout(() => {
        reject(new Error('프로젝트 룸 나가기 타임아웃'));
      }, 5000);
    });
  }, []);

  // 메시지 전송
  const sendMessage = useCallback((event: string, data: any) => {
    if (!socketRef.current?.connected) {
      console.warn('WebSocket이 연결되지 않음:', event, data);
      return;
    }

    socketRef.current.emit(event, data);
  }, []);

  // 컴포넌트 마운트 시 자동 연결
  useEffect(() => {
    if (autoConnect && user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, user, connect, disconnect]);

  // 사용자 변경 시 재연결
  useEffect(() => {
    if (user && !socketRef.current?.connected) {
      connect();
    } else if (!user && socketRef.current?.connected) {
      disconnect();
    }
  }, [user, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    joinProjectRoom,
    leaveProjectRoom,
    sendMessage,
    error
  };
}

export default useWebSocket;