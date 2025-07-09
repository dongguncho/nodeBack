# Node.js + TypeScript Backend API

Node.js와 TypeScript로 구축된 완전한 백엔드 API 서버입니다.

## 🚀 주요 기능

- **인증 시스템**: JWT 기반 로그인/회원가입
- **사용자 관리**: 사용자 CRUD 작업
- **실시간 채팅**: Socket.IO 기반 채팅 서비스
- **채팅방 관리**: 방 생성, 참여, 메시지 전송
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
- **Real-time Communication**: Socket.IO
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

## 💬 채팅 API

### 방 생성
```http
POST /chat/rooms
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "일반 채팅방",
  "description": "일반적인 대화를 위한 방입니다",
  "isPrivate": false,
  "maxParticipants": 50
}
```

### 방 목록 조회
```http
GET /chat/rooms
Authorization: Bearer <your-jwt-token>
```

### 방 참여
```http
POST /chat/rooms/:roomId/join
Authorization: Bearer <your-jwt-token>
```

### 방 나가기
```http
POST /chat/rooms/:roomId/leave
Authorization: Bearer <your-jwt-token>
```

### 메시지 조회
```http
GET /chat/rooms/:roomId/messages?limit=50&offset=0
Authorization: Bearer <your-jwt-token>
```

### 메시지 수정
```http
PUT /chat/messages/:messageId
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "content": "수정된 메시지 내용"
}
```

### 메시지 삭제
```http
DELETE /chat/messages/:messageId
Authorization: Bearer <your-jwt-token>
```

## 🔌 Socket.IO 이벤트

### 클라이언트 → 서버

#### `join_room` - 방 참여
```javascript
{
  roomId: "room-id"
}
```

#### `leave_room` - 방 나가기
```javascript
{
  roomId: "room-id"
}
```

#### `send_message` - 메시지 전송
```javascript
{
  roomId: "room-id",
  content: "메시지 내용",
  type: "text" // text, image, file, system
}
```

#### `edit_message` - 메시지 수정
```javascript
{
  messageId: "message-id",
  content: "수정된 메시지 내용"
}
```

#### `delete_message` - 메시지 삭제
```javascript
{
  messageId: "message-id"
}
```

#### `typing_start` - 타이핑 시작
```javascript
{
  roomId: "room-id"
}
```

#### `typing_stop` - 타이핑 중지
```javascript
{
  roomId: "room-id"
}
```

### 서버 → 클라이언트

#### `room_joined` - 방 참여 성공
```javascript
{
  roomId: "room-id"
}
```

#### `room_left` - 방 나가기 성공
```javascript
{
  roomId: "room-id"
}
```

#### `new_message` - 새 메시지 수신
```javascript
{
  id: "message-id",
  content: "메시지 내용",
  type: "text",
  userId: "user-id",
  username: "사용자명",
  roomId: "room-id",
  createdAt: "2025-07-07T08:30:00.000Z",
  isEdited: false
}
```

#### `message_edited` - 메시지 수정 알림
```javascript
{
  id: "message-id",
  content: "수정된 메시지 내용",
  editedAt: "2025-07-07T08:35:00.000Z",
  roomId: "room-id"
}
```

#### `message_deleted` - 메시지 삭제 알림
```javascript
{
  messageId: "message-id",
  roomId: "room-id"
}
```

#### `user_joined` - 사용자 입장 알림
```javascript
{
  userId: "user-id",
  username: "사용자명",
  timestamp: "2025-07-07T08:30:00.000Z"
}
```

#### `user_left` - 사용자 퇴장 알림
```javascript
{
  userId: "user-id",
  username: "사용자명",
  timestamp: "2025-07-07T08:30:00.000Z"
}
```

#### `user_typing` - 사용자 타이핑 알림
```javascript
{
  userId: "user-id",
  username: "사용자명"
}
```

#### `user_stopped_typing` - 사용자 타이핑 중지 알림
```javascript
{
  userId: "user-id"
}
```

#### `error` - 오류 메시지
```javascript
{
  message: "오류 내용"
}
```

### Socket.IO 연결 예시

```javascript
// 클라이언트 연결
const socket = io('http://localhost:8080', {
  auth: {
    token: 'your-jwt-token'
  }
});

// 메시지 전송
socket.emit('send_message', {
  roomId: 'room-id',
  content: '안녕하세요!',
  type: 'text'
});

// 새 메시지 수신
socket.on('new_message', (data) => {
  console.log('새 메시지:', data);
  // UI에 메시지 추가
});

// 타이핑 상태 수신
socket.on('user_typing', (data) => {
  console.log(`${data.username}이 타이핑 중...`);
  // 타이핑 표시
});
```

## 📁 프로젝트 구조

```
src/
├── config/              # 설정 파일
│   ├── database.ts      # 데이터베이스 연결
│   ├── passport.ts      # Passport 설정
│   ├── swagger.ts       # Swagger 설정
│   └── typeorm.ts       # TypeORM 설정
├── entities/            # 데이터베이스 엔티티
│   ├── user.entity.ts   # 사용자 엔티티
│   ├── room.entity.ts   # 채팅방 엔티티
│   └── message.entity.ts # 메시지 엔티티
├── middleware/          # 미들웨어
│   ├── auth.ts         # 인증 미들웨어
│   ├── errorHandler.ts # 에러 핸들러
│   └── validation.ts   # 유효성 검증
├── routes/             # 라우터
│   ├── auth.ts         # 인증 라우터
│   ├── users.ts        # 사용자 라우터
│   └── chat.ts         # 채팅 라우터
├── services/           # 비즈니스 로직
│   ├── authService.ts  # 인증 서비스
│   ├── userService.ts  # 사용자 서비스
│   ├── chatService.ts  # 채팅 서비스
│   └── socketService.ts # Socket.IO 서비스
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

## 🧪 채팅 테스트

서버 실행 후 다음 URL에서 채팅 기능을 테스트할 수 있습니다:
- **채팅 테스트 페이지**: http://localhost:3000/chat-test.html

### 테스트 방법
1. 서버를 실행합니다: `npm run dev`
2. 브라우저에서 `http://localhost:3000/chat-test.html` 접속
3. 기본 계정으로 로그인 (test@example.com / password123)
4. 새 방을 만들거나 기존 방에 참여
5. 실시간 채팅 테스트

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

## 📡 WebSocket 데이터 형식

### 클라이언트 → 서버

#### `send_message`
```javascript
{
  roomId: "room-id",
  content: "메시지 내용", 
  type: "text" // text, image, file, system
}
```

#### `edit_message`
```javascript
{
  messageId: "message-id",
  content: "수정된 메시지 내용"
}
```

#### `delete_message`
```javascript
{
  messageId: "message-id"
}
```

#### `join_room` / `leave_room`
```javascript
{
  roomId: "room-id"
}
```

#### `typing_start` / `typing_stop`
```javascript
{
  roomId: "room-id"
}
```

### 서버 → 클라이언트

#### `new_message`
```javascript
{
  id: "message-id",
  content: "메시지 내용",
  type: "text",
  userId: "user-id",        // 직접 비교용
  username: "사용자명",
  roomId: "room-id",        // 직접 비교용
  createdAt: "2025-07-07T08:30:00.000Z",
  isEdited: false
}
```

#### `message_edited`
```javascript
{
  id: "message-id",
  content: "수정된 메시지 내용",
  editedAt: "2025-07-07T08:35:00.000Z",
  roomId: "room-id"
}
```

#### `message_deleted`
```javascript
{
  messageId: "message-id",
  roomId: "room-id"
}
```

#### `user_joined` / `user_left`
```javascript
{
  userId: "user-id",
  username: "사용자명",
  timestamp: "2025-07-07T08:30:00.000Z"
}
```

#### `user_typing`
```javascript
{
  userId: "user-id",
  username: "사용자명"
}
```

#### `user_stopped_typing`
```javascript
<code_block_to_apply_changes_from>
```

#### `room_joined` / `room_left`
```javascript
{
  roomId: "room-id"
}
```

#### `error`
```javascript
{
  message: "오류 내용"
}
```

---

## 📡 REST API 데이터 형식

### 응답 공통 형식
```javascript
{
  success: true,
  message: "성공 메시지",
  data: { /* 실제 데이터 */ }
}
```

### `GET /chat/rooms` - 방 목록
```javascript
{
  success: true,
  message: "방 목록을 조회했습니다.",
  data: [
    {
      id: "room-id",
      name: "방이름",
      description: "방설명",
      isPrivate: false,
      maxParticipants: 50,
      createdAt: "2025-07-07T08:30:00.000Z",
      updatedAt: "2025-07-07T08:30:00.000Z",
      participants: [
        { id: "user-id", name: "사용자명", email: "user@example.com" }
      ],
      admins: [
        { id: "user-id", name: "사용자명", email: "user@example.com" }
      ],
      messages: [
        {
          id: "message-id",
          content: "마지막 메시지",
          type: "text",
          createdAt: "2025-07-07T08:30:00.000Z",
          user: { id: "user-id", name: "사용자명" }
        }
      ]
    }
  ]
}
```

### `GET /chat/rooms/{roomId}/messages` - 메시지 조회
```javascript
{
  success: true,
  message: "메시지를 조회했습니다.",
  data: [
    {
      id: "message-id",
      content: "메시지 내용",
      type: "text",
      isEdited: false,
      editedAt: null,
      createdAt: "2025-07-07T08:30:00.000Z",
      user: { 
        id: "user-id", 
        name: "사용자명",
        email: "user@example.com"
      },
      room: { 
        id: "room-id", 
        name: "방이름"
      },
      isMyMessage: true  // 내가 보낸 메시지 여부
    }
  ]
}
```

### `POST /chat/rooms` - 방 생성
```javascript
// 요청
{
  name: "방이름",
  description: "방설명",
  isPrivate: false,
  maxParticipants: 50
}

// 응답
{
  success: true,
  message: "방이 생성되었습니다.",
  data: {
    id: "room-id",
    name: "방이름",
    description: "방설명",
    isPrivate: false,
    maxParticipants: 50,
    createdAt: "2025-07-07T08:30:00.000Z",
    updatedAt: "2025-07-07T08:30:00.000Z"
  }
}
```

### `POST /chat/rooms/{roomId}/messages` - 메시지 전송
```javascript
// 요청
{
  content: "메시지 내용",
  type: "text"
}

// 응답
{
  success: true,
  message: "메시지를 전송했습니다.",
  data: {
    id: "message-id",
    content: "메시지 내용",
    type: "text",
    isEdited: false,
    editedAt: null,
    createdAt: "2025-07-07T08:30:00.000Z",
    user: { id: "user-id", name: "사용자명" },
    room: { id: "room-id", name: "방이름" },
    isMyMessage: true
  }
}
```

---

## 🔑 주요 차이점

### WebSocket vs REST API

| 구분 | WebSocket | REST API |
|------|-----------|----------|
| **메시지 구분** | `message.userId === currentUserId` | `message.isMyMessage` |
| **실시간성** | 실시간 양방향 | 요청-응답 |
| **사용 목적** | 실시간 채팅 | 초기 데이터 로드 |

### 프론트엔드 사용 예시

```javascript
// WebSocket 메시지 구분
socket.on('new_message', (message) => {
  const isMyMessage = message.userId === currentUserId;
  if (isMyMessage) {
    // 내 메시지 스타일
  } else {
    // 상대방 메시지 스타일
  }
});

// REST API 메시지 구분
fetch('/chat/rooms/roomId/messages')
  .then(res => res.json())
  .then(result => {
    result.data.forEach(message => {
      if (message.isMyMessage) {
        // 내 메시지 스타일
      } else {
        // 상대방 메시지 스타일
      }
    });
  });
``` 