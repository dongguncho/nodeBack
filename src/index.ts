import 'reflect-metadata';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import passport from './config/passport';

import { initializeTypeORM } from './config/typeorm';
import { errorHandler } from './middleware/errorHandler';
import { setupRoutes } from './routes';
import { createSwaggerSpec } from './config/swagger';
import { SocketService } from './services/socketService';

// 환경 변수 로드
dotenv.config();

const app = express();
const server = createServer(app);
const port = Number(process.env.PORT) || 8080;

// Swagger 설정
const swaggerSpec = createSwaggerSpec(port);

// 미들웨어 설정
app.use(helmet()); // 보안 헤더
app.use(cors()); // CORS 설정
app.use(morgan('combined')); // 로깅
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩
app.use(express.static('public')); // 정적 파일 서빙

// Passport.js 초기화
app.use(passport.initialize());

// Swagger UI
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Node.js Backend API 서버가 실행 중입니다',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API 라우트 등록
setupRoutes(app);

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '요청한 리소스를 찾을 수 없습니다',
    errorCode: 'NOT_FOUND',
    path: req.originalUrl,
  });
});

// 글로벌 에러 핸들러 (마지막에 위치)
app.use(errorHandler);

// 서버 시작
async function startServer() {
  try {
    // TypeORM 데이터베이스 초기화
    await initializeTypeORM();
    
    // Socket.IO 서비스 초기화
    new SocketService(server);
    
    // 서버 시작
    server.listen(port, () => {
      console.log(`🚀 서버가 http://localhost:${port}에서 실행 중입니다`);
      console.log(`📚 Swagger 문서: http://localhost:${port}/api`);
      console.log(`💬 Socket.IO 채팅 서비스가 활성화되었습니다`);
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
}

startServer(); 