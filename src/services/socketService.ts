import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { ChatService } from './chatService';
import { JwtUtil } from '../utils/jwt';

export class SocketService {
  private io: SocketIOServer;
  private chatService: ChatService;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    this.chatService = new ChatService();
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('인증 토큰이 필요합니다.'));
        }

        const decoded = JwtUtil.verifyToken(token);
        socket.data.userId = decoded.sub;
        socket.data.user = decoded;
        next();
      } catch (error) {
        next(new Error('인증에 실패했습니다.'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`사용자 연결: ${socket.data.userId}`);
      this.userSockets.set(socket.data.userId, socket.id);

      // 방 참여
      socket.on('join_room', async (data: { roomId: string }) => {
        try {
          await this.chatService.joinRoom(data.roomId, socket.data.userId);
          socket.join(data.roomId);
          
          // 방 참여 알림
          this.io.to(data.roomId).emit('user_joined', {
            userId: socket.data.userId,
            username: socket.data.user.username,
            timestamp: new Date()
          });

          socket.emit('room_joined', { roomId: data.roomId });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // 방 나가기
      socket.on('leave_room', async (data: { roomId: string }) => {
        try {
          await this.chatService.leaveRoom(data.roomId, socket.data.userId);
          socket.leave(data.roomId);
          
          // 방 나가기 알림
          this.io.to(data.roomId).emit('user_left', {
            userId: socket.data.userId,
            username: socket.data.user.username,
            timestamp: new Date()
          });

          socket.emit('room_left', { roomId: data.roomId });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // 메시지 전송
      socket.on('send_message', async (data: {
        roomId: string;
        content: string;
        type?: 'text' | 'image' | 'file' | 'system';
      }) => {
        try {
          const message = await this.chatService.sendMessage({
            content: data.content,
            type: data.type || 'text',
            roomId: data.roomId,
            userId: socket.data.userId
          });

          // 방의 모든 사용자에게 메시지 전송
          this.io.to(data.roomId).emit('new_message', {
            id: message.id,
            content: message.content,
            type: message.type,
            userId: message.user.id,
            username: socket.data.user.username,
            roomId: message.room.id,
            createdAt: message.createdAt,
            isEdited: message.isEdited
          });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // 메시지 수정
      socket.on('edit_message', async (data: {
        messageId: string;
        content: string;
      }) => {
        try {
          const message = await this.chatService.editMessage(
            data.messageId,
            socket.data.userId,
            data.content
          );

          // 방의 모든 사용자에게 수정된 메시지 전송
          this.io.to(message.room.id).emit('message_edited', {
            id: message.id,
            content: message.content,
            editedAt: message.editedAt,
            roomId: message.room.id
          });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // 메시지 삭제
      socket.on('delete_message', async (data: { messageId: string }) => {
        try {
          const message = await this.chatService.messageRepository.findOne({
            where: { id: data.messageId },
            relations: ['room']
          });

          if (!message) {
            throw new Error('메시지를 찾을 수 없습니다.');
          }

          await this.chatService.deleteMessage(data.messageId, socket.data.userId);

          // 방의 모든 사용자에게 삭제된 메시지 알림
          this.io.to(message.room.id).emit('message_deleted', {
            messageId: data.messageId,
            roomId: message.room.id
          });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // 타이핑 상태
      socket.on('typing_start', (data: { roomId: string }) => {
        socket.to(data.roomId).emit('user_typing', {
          userId: socket.data.userId,
          username: socket.data.user.username
        });
      });

      socket.on('typing_stop', (data: { roomId: string }) => {
        socket.to(data.roomId).emit('user_stopped_typing', {
          userId: socket.data.userId
        });
      });

      // 연결 해제
      socket.on('disconnect', () => {
        console.log(`사용자 연결 해제: ${socket.data.userId}`);
        this.userSockets.delete(socket.data.userId);
      });
    });
  }

  // 특정 방에 메시지 브로드캐스트
  public broadcastToRoom(roomId: string, event: string, data: any) {
    this.io.to(roomId).emit(event, data);
  }

  // 특정 사용자에게 메시지 전송
  public sendToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // 모든 사용자에게 브로드캐스트
  public broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }
} 