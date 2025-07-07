import { Request } from 'express';

// 공통 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
}

// 사용자 타입 (Express User와 충돌 방지)
export interface CustomUser {
  id: string;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// JWT 페이로드 타입
export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Express Request에 user 속성 추가
declare global {
  namespace Express {
    interface User extends CustomUser {}
  }
}

// 데이터베이스 연결 타입
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
} 