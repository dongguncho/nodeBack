import { UserService } from './userService';
import { JwtUtil } from '../utils/jwt';
import { User } from '../entities/user.entity';
import { UnauthorizedException } from '../utils/exceptions';

export class AuthService {
  static async register(userData: { name: string; email: string; password: string }) {
    const user = await UserService.createUser(userData);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  static async login(email: string, password: string) {
    const user = await UserService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('비활성화된 계정입니다');
    }

    const isPasswordValid = await UserService.validatePassword(user, password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다');
    }

    const token = JwtUtil.generateToken(user);

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  static generateToken(user: User) {
    const token = JwtUtil.generateToken(user);
    
    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  static async validateToken(token: string): Promise<User> {
    try {
      const payload = JwtUtil.verifyToken(token);
      const user = await UserService.findById(payload.sub);
      
      if (!user.isActive) {
        throw new UnauthorizedException('비활성화된 계정입니다');
      }
      
      return user;
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }
  }
} 