import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'nurigun23!@',
  database: process.env.DB_NAME || 'dbStudy',
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