import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { CustomUser } from '../types';

// JWT 인증 미들웨어
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: CustomUser, info: any) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '인증 처리 중 오류가 발생했습니다',
        errorCode: 'AUTH_ERROR',
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다',
        errorCode: 'UNAUTHORIZED',
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};

// Local 인증 미들웨어 (로그인용)
export const authenticateLocal = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', { session: false }, (err: any, user: CustomUser, info: any) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '인증 처리 중 오류가 발생했습니다',
        errorCode: 'AUTH_ERROR',
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || '로그인에 실패했습니다',
        errorCode: 'UNAUTHORIZED',
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};

// 기존 authMiddleware를 authenticateJWT로 대체
export const authMiddleware = authenticateJWT; 