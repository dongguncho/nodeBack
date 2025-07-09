import { Repository } from 'typeorm';
import { Room } from '../entities/room.entity';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { AppDataSource } from '../config/typeorm';

export class ChatService {
  public roomRepository: Repository<Room>;
  public messageRepository: Repository<Message>;
  private userRepository: Repository<User>;

  constructor() {
    this.roomRepository = AppDataSource.getRepository(Room);
    this.messageRepository = AppDataSource.getRepository(Message);
    this.userRepository = AppDataSource.getRepository(User);
  }

  // 방 생성
  async createRoom(roomData: {
    name: string;
    description?: string;
    isPrivate?: boolean;
    maxParticipants?: number;
    creatorId: string;
  }): Promise<Room> {
    const creator = await this.userRepository.findOne({ where: { id: roomData.creatorId } });
    if (!creator) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    const room = this.roomRepository.create({
      name: roomData.name,
      description: roomData.description,
      isPrivate: roomData.isPrivate || false,
      maxParticipants: roomData.maxParticipants || 50,
      participants: [creator],
      admins: [creator]
    });

    return await this.roomRepository.save(room);
  }

  // 방 목록 조회
  async getRooms(userId?: string): Promise<Room[]> {
    const query = this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.participants', 'participants')
      .leftJoinAndSelect('room.admins', 'admins')
      .leftJoinAndSelect('room.messages', 'messages', 'messages.id = (SELECT m.id FROM messages m WHERE m.room_id = room.id ORDER BY m.createdAt DESC LIMIT 1)')
      .leftJoinAndSelect('messages.user', 'messageUser');

    if (userId) {
      query.where('room.isPrivate = false OR participants.id = :userId', { userId });
    } else {
      query.where('room.isPrivate = false');
    }

    return await query.getMany();
  }

  // 방 참여
  async joinRoom(roomId: string, userId: string): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['participants']
    });

    if (!room) {
      throw new Error('방을 찾을 수 없습니다.');
    }

    if (room.participants.length >= room.maxParticipants) {
      throw new Error('방이 가득 찼습니다.');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    if (!room.participants.find(p => p.id === userId)) {
      room.participants.push(user);
      await this.roomRepository.save(room);
    }

    return room;
  }

  // 방 나가기
  async leaveRoom(roomId: string, userId: string): Promise<void> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['participants', 'admins']
    });

    if (!room) {
      throw new Error('방을 찾을 수 없습니다.');
    }

    room.participants = room.participants.filter(p => p.id !== userId);
    room.admins = room.admins.filter(a => a.id !== userId);

    await this.roomRepository.save(room);
  }

  // 메시지 전송
  async sendMessage(messageData: {
    content: string;
    type?: 'text' | 'image' | 'file' | 'system';
    roomId: string;
    userId: string;
  }): Promise<Message> {
    const room = await this.roomRepository.findOne({
      where: { id: messageData.roomId },
      relations: ['participants']
    });

    if (!room) {
      throw new Error('방을 찾을 수 없습니다.');
    }

    const user = room.participants.find(p => p.id === messageData.userId);
    if (!user) {
      throw new Error('방에 참여하지 않은 사용자입니다.');
    }

    const userEntity = await this.userRepository.findOne({ where: { id: messageData.userId } });
    const roomEntity = await this.roomRepository.findOne({ where: { id: messageData.roomId } });

    const message = this.messageRepository.create({
      content: messageData.content,
      type: messageData.type || 'text',
      user: userEntity,
      room: roomEntity
    });

    return await this.messageRepository.save(message);
  }

  // 방의 메시지 조회
  async getRoomMessages(roomId: string, limit: number = 50, offset: number = 0, currentUserId?: string): Promise<any[]> {
    const messages = await this.messageRepository.find({
      where: { room: { id: roomId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset
    });

    // 각 메시지에 현재 사용자가 보낸 메시지인지 여부 추가
    return messages.map(message => ({
      ...message,
      isMyMessage: currentUserId ? message.user.id === currentUserId : false
    }));
  }

  // 메시지 수정
  async editMessage(messageId: string, userId: string, newContent: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['user']
    });

    if (!message) {
      throw new Error('메시지를 찾을 수 없습니다.');
    }

    if (message.user.id !== userId) {
      throw new Error('메시지를 수정할 권한이 없습니다.');
    }

    message.content = newContent;
    message.isEdited = true;
    message.editedAt = new Date();

    return await this.messageRepository.save(message);
  }

  // 메시지 삭제
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['user', 'room', 'room.admins']
    });

    if (!message) {
      throw new Error('메시지를 찾을 수 없습니다.');
    }

    const isAdmin = message.room.admins.some(admin => admin.id === userId);
    if (message.user.id !== userId && !isAdmin) {
      throw new Error('메시지를 삭제할 권한이 없습니다.');
    }

    await this.messageRepository.remove(message);
  }
} 