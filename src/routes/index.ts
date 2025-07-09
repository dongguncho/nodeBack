import { Express } from 'express';
import authRouter from './auth';
import usersRouter from './users';
import chatRouter from './chat';

// 모든 라우터를 한 번에 등록하는 함수
export function setupRoutes(app: Express) {
  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/chat', chatRouter);
}

// 개별 라우터도 export (기존 호환성을 위해)
export { authRouter, usersRouter, chatRouter }; 