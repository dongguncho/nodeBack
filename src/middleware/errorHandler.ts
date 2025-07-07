import { Request, Response, NextFunction } from 'express';
import { CustomException } from '../utils/exceptions';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`${req.method} ${req.url} - Error:`, error);

  let statusCode = 500;
  let message = '서버 내부 오류가 발생했습니다';
  let errorCode = 'INTERNAL_SERVER_ERROR';

  if (error instanceof CustomException) {
    statusCode = error.statusCode;
    message = error.message;
    errorCode = error.errorCode;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = '유효성 검증에 실패했습니다';
    errorCode = 'VALIDATION_ERROR';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = '유효하지 않은 토큰입니다';
    errorCode = 'INVALID_TOKEN';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = '토큰이 만료되었습니다';
    errorCode = 'TOKEN_EXPIRED';
  }

  const errorResponse = {
    success: false,
    message,
    errorCode,
    timestamp: new Date().toISOString(),
    path: req.url,
  };

  res.status(statusCode).json(errorResponse);
}; 