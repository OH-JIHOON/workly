import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { 
  Injectable, 
  Logger,
  UseGuards 
} from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getAuthConfig } from '../../config/auth.config';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

interface RoomData {
  projectId?: string;
  taskId?: string;
  type: 'project' | 'task' | 'user';
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/',
})
export class WebSocketGateway 
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect 
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);
  private connectedUsers = new Map<string, Set<string>>(); // userId -> socketIds
  private socketRooms = new Map<string, Set<string>>(); // socketId -> rooms

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // JWT 토큰으로 사용자 인증
      const token = this.extractTokenFromSocket(client);
      if (!token) {
        this.logger.warn(`Connection rejected - No token provided: ${client.id}`);
        client.disconnect();
        return;
      }

      const authConfig = getAuthConfig(this.configService);
      const payload = this.jwtService.verify(token, {
        secret: authConfig.jwt.secret,
      });

      client.userId = payload.sub;
      client.user = payload;

      // 사용자별 연결 추적
      if (!this.connectedUsers.has(client.userId)) {
        this.connectedUsers.set(client.userId, new Set());
      }
      this.connectedUsers.get(client.userId)?.add(client.id);

      // 사용자 개인 룸에 자동 조인
      const userRoom = `user:${client.userId}`;
      client.join(userRoom);

      this.logger.log(`User ${client.userId} connected: ${client.id}`);

      // 연결된 다른 클라이언트들에게 사용자 온라인 상태 알림
      client.broadcast.emit('user:online', {
        userId: client.userId,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Authentication failed for socket ${client.id}:`, error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      // 사용자 연결 목록에서 제거
      const userSockets = this.connectedUsers.get(client.userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.connectedUsers.delete(client.userId);
          // 마지막 연결이 끊어졌을 때만 오프라인 상태 알림
          client.broadcast.emit('user:offline', {
            userId: client.userId,
            timestamp: new Date().toISOString(),
          });
        }
      }

      // 소켓 룸 정보 정리
      this.socketRooms.delete(client.id);

      this.logger.log(`User ${client.userId} disconnected: ${client.id}`);
    }
  }

  // 프로젝트 룸 조인
  @SubscribeMessage('join:project')
  handleJoinProject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { projectId: string },
  ) {
    const roomName = `project:${data.projectId}`;
    client.join(roomName);

    // 소켓 룸 추적
    if (!this.socketRooms.has(client.id)) {
      this.socketRooms.set(client.id, new Set());
    }
    this.socketRooms.get(client.id)?.add(roomName);

    this.logger.log(`User ${client.userId} joined project room: ${roomName}`);

    // 프로젝트 멤버들에게 참여 알림
    client.to(roomName).emit('project:user_joined', {
      userId: client.userId,
      projectId: data.projectId,
      timestamp: new Date().toISOString(),
    });

    return { success: true, room: roomName };
  }

  // 프로젝트 룸 나가기
  @SubscribeMessage('leave:project')
  handleLeaveProject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { projectId: string },
  ) {
    const roomName = `project:${data.projectId}`;
    client.leave(roomName);

    // 소켓 룸 추적에서 제거
    this.socketRooms.get(client.id)?.delete(roomName);

    this.logger.log(`User ${client.userId} left project room: ${roomName}`);

    // 프로젝트 멤버들에게 나감 알림
    client.to(roomName).emit('project:user_left', {
      userId: client.userId,
      projectId: data.projectId,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  // 태스크 룸 조인
  @SubscribeMessage('join:task')
  handleJoinTask(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { taskId: string },
  ) {
    const roomName = `task:${data.taskId}`;
    client.join(roomName);

    if (!this.socketRooms.has(client.id)) {
      this.socketRooms.set(client.id, new Set());
    }
    this.socketRooms.get(client.id)?.add(roomName);

    this.logger.log(`User ${client.userId} joined task room: ${roomName}`);

    // 태스크 관련자들에게 참여 알림
    client.to(roomName).emit('task:user_joined', {
      userId: client.userId,
      taskId: data.taskId,
      timestamp: new Date().toISOString(),
    });

    return { success: true, room: roomName };
  }

  // 태스크 룸 나가기
  @SubscribeMessage('leave:task')
  handleLeaveTask(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { taskId: string },
  ) {
    const roomName = `task:${data.taskId}`;
    client.leave(roomName);

    this.socketRooms.get(client.id)?.delete(roomName);

    client.to(roomName).emit('task:user_left', {
      userId: client.userId,
      taskId: data.taskId,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  // 태스크 실시간 편집 (타이핑 상태)
  @SubscribeMessage('task:typing')
  handleTaskTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { taskId: string; field: string; isTyping: boolean },
  ) {
    const roomName = `task:${data.taskId}`;
    
    client.to(roomName).emit('task:typing', {
      userId: client.userId,
      taskId: data.taskId,
      field: data.field,
      isTyping: data.isTyping,
      timestamp: new Date().toISOString(),
    });
  }

  // 실시간 업데이트 브로드캐스트 메서드들
  
  // 태스크 업데이트 알림
  async broadcastTaskUpdate(taskId: string, updateData: any, excludeUserId?: string) {
    const roomName = `task:${taskId}`;
    const payload = {
      type: 'task:updated',
      taskId,
      data: updateData,
      timestamp: new Date().toISOString(),
    };

    if (excludeUserId) {
      // 특정 사용자 제외하고 브로드캐스트
      const excludeSockets = this.connectedUsers.get(excludeUserId) || new Set();
      const room = this.server.to(roomName);
      for (const socketId of excludeSockets) {
        room.except(socketId);
      }
      room.emit('task:updated', payload);
    } else {
      this.server.to(roomName).emit('task:updated', payload);
    }
  }

  // 프로젝트 업데이트 알림
  async broadcastProjectUpdate(projectId: string, updateData: any, excludeUserId?: string) {
    const roomName = `project:${projectId}`;
    const payload = {
      type: 'project:updated',
      projectId,
      data: updateData,
      timestamp: new Date().toISOString(),
    };

    if (excludeUserId) {
      const excludeSockets = this.connectedUsers.get(excludeUserId) || new Set();
      const room = this.server.to(roomName);
      for (const socketId of excludeSockets) {
        room.except(socketId);
      }
      room.emit('project:updated', payload);
    } else {
      this.server.to(roomName).emit('project:updated', payload);
    }
  }

  // 사용자별 알림
  async sendUserNotification(userId: string, notification: any) {
    const userRoom = `user:${userId}`;
    this.server.to(userRoom).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }

  // 댓글 추가 알림
  async broadcastCommentAdded(taskId: string, comment: any, excludeUserId?: string) {
    const roomName = `task:${taskId}`;
    const payload = {
      type: 'comment:added',
      taskId,
      comment,
      timestamp: new Date().toISOString(),
    };

    if (excludeUserId) {
      const excludeSockets = this.connectedUsers.get(excludeUserId) || new Set();
      const room = this.server.to(roomName);
      for (const socketId of excludeSockets) {
        room.except(socketId);
      }
      room.emit('comment:added', payload);
    } else {
      this.server.to(roomName).emit('comment:added', payload);
    }
  }

  // 연결된 사용자 목록 조회
  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  // 특정 프로젝트/태스크의 활성 사용자 조회
  getRoomUsers(roomName: string): string[] {
    const room = this.server.sockets.adapter.rooms.get(roomName);
    if (!room) return [];

    const userIds = new Set<string>();
    for (const socketId of room) {
      const socket = this.server.sockets.sockets.get(socketId) as AuthenticatedSocket;
      if (socket?.userId) {
        userIds.add(socket.userId);
      }
    }

    return Array.from(userIds);
  }

  // JWT 토큰 추출
  private extractTokenFromSocket(socket: Socket): string | null {
    // Authorization 헤더에서 추출
    const authHeader = socket.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // 쿼리 파라미터에서 추출
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token && typeof token === 'string') {
      return token;
    }

    return null;
  }
}