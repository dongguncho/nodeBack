import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'nodeback_db',
  charset: 'utf8mb4',
  timezone: '+09:00',
};

// 연결 풀 생성
export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// TypeORM을 사용하므로 별도의 테이블 생성 로직은 불필요
// TypeORM의 synchronize 옵션이 엔티티를 기반으로 자동으로 테이블을 생성합니다
export async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL 데이터베이스 연결 성공');
    connection.release();
    console.log('✅ 데이터베이스 연결 확인 완료');
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error);
    throw error;
  }
} 