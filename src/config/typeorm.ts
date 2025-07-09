import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import dotenv from 'dotenv';

dotenv.config();

// 환경 변수 확인 및 출력
console.log('=== TypeORM 환경 변수 확인 ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'undefined');
console.log('DB_DATABASE:', process.env.DB_DATABASE);

if (!process.env.DB_HOST) {
  throw new Error('DB_HOST 환경 변수가 설정되지 않았습니다.');
}
if (!process.env.DB_USERNAME) {
  throw new Error('DB_USERNAME 환경 변수가 설정되지 않았습니다.');
}
if (!process.env.DB_PASSWORD) {
  throw new Error('DB_PASSWORD 환경 변수가 설정되지 않았습니다.');
}
if (!process.env.DB_DATABASE) {
  throw new Error('DB_DATABASE 환경 변수가 설정되지 않았습니다.');
}

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false, // 기존 테이블이 이미 완벽하게 맞춰져 있으므로 false로 설정
  logging: process.env.NODE_ENV === 'development',
  entities: [User],
  subscribers: [],
  migrations: [],
});

export const initializeTypeORM = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ TypeORM 데이터베이스 연결 성공');
  } catch (error) {
    console.error('❌ TypeORM 데이터베이스 연결 실패:', error);
    throw error;
  }
}; 