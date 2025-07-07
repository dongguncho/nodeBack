# Node.js + TypeScript Backend API

Node.js와 TypeScript로 구축된 완전한 백엔드 API 서버입니다.

## 🚀 주요 기능

- **인증 시스템**: JWT 기반 로그인/회원가입
- **사용자 관리**: 사용자 CRUD 작업
- **공통 응답**: 표준화된 API 응답 형식
- **글로벌 에러 처리**: 통합된 에러 핸들링
- **API 문서화**: Swagger UI를 통한 자동 문서 생성
- **데이터베이스**: MySQL + mysql2
- **유효성 검증**: express-validator 기반 입력 검증

## 📋 기술 스택

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI
- **Password Hashing**: bcryptjs

## 🛠️ 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 추가하세요:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=nodeback_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3000
NODE_ENV=development
```

### 3. 데이터베이스 설정
MySQL 데이터베이스를 생성하고 연결 정보를 `.env` 파일에 설정하세요.

### 4. 애플리케이션 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm start
```

## 📚 API 문서

애플리케이션 실행 후 다음 URL에서 Swagger 문서를 확인할 수 있습니다:
- **Swagger UI**: http://localhost:3000/api

## 🔐 인증 API

### 회원가입
```http
POST /auth/register
Content-Type: application/json

{
  "name": "홍길동",
  "email": "user@example.com",
  "password": "password123"
}
```

### 로그인
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## 👥 사용자 API

모든 사용자 API는 JWT 토큰 인증이 필요합니다.

### 내 프로필 조회
```http
GET /users/profile
Authorization: Bearer <your-jwt-token>
```

### 모든 사용자 조회
```http
GET /users
Authorization: Bearer <your-jwt-token>
```

### 특정 사용자 조회
```http
GET /users/:id
Authorization: Bearer <your-jwt-token>
```

## 📁 프로젝트 구조

```
src/
├── config/              # 설정 파일
│   └── database.ts      # 데이터베이스 연결
├── middleware/          # 미들웨어
│   ├── auth.ts         # 인증 미들웨어
│   ├── errorHandler.ts # 에러 핸들러
│   └── validation.ts   # 유효성 검증
├── routes/             # 라우터
│   ├── auth.ts         # 인증 라우터
│   └── users.ts        # 사용자 라우터
├── services/           # 비즈니스 로직
│   ├── authService.ts  # 인증 서비스
│   └── userService.ts  # 사용자 서비스
├── types/              # 타입 정의
│   └── index.ts        # 공통 타입
├── utils/              # 유틸리티
│   ├── exceptions.ts   # 커스텀 예외
│   ├── jwt.ts          # JWT 유틸리티
│   └── response.ts     # 응답 유틸리티
└── index.ts            # 메인 애플리케이션
```

## 🔧 개발 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# TypeScript 컴파일
npm run build
```

## 🎯 NestJS vs Node.js + Express 비교

| 구분 | NestJS | Node.js + Express |
|------|--------|-------------------|
| **학습 곡선** | 높음 | 낮음 |
| **설정 복잡도** | 높음 | 낮음 |
| **코드 구조** | 데코레이터 기반 | 전통적인 구조 |
| **의존성 주입** | 내장 | 수동 구현 |
| **타입 안전성** | 높음 | 높음 (TypeScript) |
| **유연성** | 낮음 | 높음 |
| **성능** | 비슷함 | 비슷함 |

## 📝 라이센스

MIT License 