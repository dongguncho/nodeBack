import { AppDataSource } from '../config/typeorm';
import { User } from '../entities/user.entity';
import { NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '../utils/exceptions';
import bcrypt from 'bcryptjs';

const userRepository = AppDataSource.getRepository(User);

export class UserService {
  static async createUser(userData: { name: string; email: string; password: string }): Promise<User> {
    // 이메일 중복 확인
    const existingUser = await userRepository.findOne({ where: { email: userData.email } });
    
    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // 사용자 생성
    const user = userRepository.create({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
    });

    return await userRepository.save(user);
  }

  static async findByEmail(email: string): Promise<User | null> {
    return await userRepository.findOne({ where: { email } });
  }

  static async findById(id: string): Promise<User> {
    const user = await userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    return user;
  }

  static async findAll(): Promise<User[]> {
    return await userRepository.find({
      select: ['id', 'name', 'email', 'isActive', 'createdAt', 'updatedAt']
    });
  }

  static async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    // 사용자 존재 확인
    await this.findById(id);

    // 이메일 변경 시 중복 확인
    if (updateData.email) {
      const existingUser = await userRepository.findOne({ 
        where: { email: updateData.email, id: id as any } 
      });
      
      if (existingUser) {
        throw new ConflictException('이미 사용 중인 이메일입니다');
      }
    }

    await userRepository.update(id, updateData);
    return await this.findById(id);
  }

  static async deleteUser(id: string): Promise<void> {
    const user = await this.findById(id);
    
    // 관리자 계정 삭제 방지
    if (user.email === 'admin@example.com') {
      throw new ForbiddenException('관리자 계정은 삭제할 수 없습니다');
    }

    await userRepository.delete(id);
  }

  static async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  static async deactivateUser(id: string): Promise<User> {
    const user = await this.findById(id);
    
    if (!user.isActive) {
      throw new BadRequestException('이미 비활성화된 사용자입니다');
    }
    
    return await this.updateUser(id, { isActive: false });
  }

  static async activateUser(id: string): Promise<User> {
    const user = await this.findById(id);
    
    if (user.isActive) {
      throw new BadRequestException('이미 활성화된 사용자입니다');
    }
    
    return await this.updateUser(id, { isActive: true });
  }
} 