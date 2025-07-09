# Docker 배포 가이드

## 📋 사전 준비사항

### 1. 환경 변수 설정
`.env` 파일을 생성하고 다음 정보를 입력하세요:

```bash
# Database Configuration
DB_HOST=your-database-host
DB_PORT=3306
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password
DB_DATABASE=your-database-name

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3000
NODE_ENV=production
```

### 2. 데이터베이스 선택
- **옵션 1**: EC2에 MySQL 직접 설치
- **옵션 2**: AWS RDS 사용 (권장)
- **옵션 3**: Docker Compose로 MySQL 함께 실행

## 🚀 배포 방법

### 방법 1: Docker Compose 사용 (개발/테스트용)

```bash
# 전체 서비스 시작 (앱 + MySQL)
docker-compose up -d

# 로그 확인
docker-compose logs -f app

# 서비스 중지
docker-compose down
```

### 방법 2: 프로덕션 배포

```bash
# 배포 스크립트 실행
chmod +x deploy.sh
./deploy.sh
```

### 방법 3: 수동 배포

```bash
# 1. 도커 이미지 빌드
docker build -t nodeback:latest .

# 2. 컨테이너 실행
docker run -d \
  --name nodeback-app \
  -p 80:3000 \
  --env-file .env \
  --restart unless-stopped \
  nodeback:latest
```

## 🔧 EC2 설정

### 1. 보안 그룹 설정
- **인바운드 규칙**:
  - SSH (22): 개발용
  - HTTP (80): 웹 접속용
  - HTTPS (443): SSL 사용시
  - MySQL (3306): 외부 DB 접속시

### 2. 환경 변수 파일 생성
```bash
# env.example을 복사
cp env.example .env

# 환경 변수 편집
nano .env
```

### 3. 도커 설치 확인
```bash
# 도커 버전 확인
docker --version
docker-compose --version
```

## 📊 모니터링

### 컨테이너 상태 확인
```bash
# 실행 중인 컨테이너 확인
docker ps

# 컨테이너 로그 확인
docker logs nodeback-app

# 리소스 사용량 확인
docker stats
```

### 애플리케이션 헬스 체크
```bash
# 헬스 체크 엔드포인트 호출
curl http://localhost/health
```

## 🔄 업데이트

### 코드 업데이트 후 재배포
```bash
# 1. 코드 변경사항 적용
git pull origin main

# 2. 배포 스크립트 실행
./deploy.sh
```

### 수동 업데이트
```bash
# 1. 기존 컨테이너 중지
docker stop nodeback-app
docker rm nodeback-app

# 2. 새 이미지 빌드
docker build -t nodeback:latest .

# 3. 새 컨테이너 실행
docker run -d \
  --name nodeback-app \
  -p 80:3000 \
  --env-file .env \
  --restart unless-stopped \
  nodeback:latest
```

## 🐛 문제 해결

### 일반적인 문제들

1. **포트 충돌**
   ```bash
   # 사용 중인 포트 확인
   sudo netstat -tulpn | grep :80
   
   # 다른 포트 사용
   docker run -p 8080:3000 ...
   ```

2. **데이터베이스 연결 실패**
   ```bash
   # DB 연결 테스트
   docker exec -it nodeback-app npm run test:db
   
   # 환경 변수 확인
   docker exec -it nodeback-app env | grep DB
   ```

3. **권한 문제**
   ```bash
   # 도커 그룹에 사용자 추가
   sudo usermod -aG docker $USER
   
   # 재로그인 후 확인
   docker ps
   ```

### 로그 확인
```bash
# 실시간 로그 확인
docker logs -f nodeback-app

# 특정 시간 이후 로그
docker logs --since="2024-01-01T00:00:00" nodeback-app

# 에러 로그만 확인
docker logs nodeback-app 2>&1 | grep ERROR
```

## 📝 추가 설정

### Nginx 리버스 프록시 (선택사항)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL 인증서 설정 (Let's Encrypt)
```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com
```

## 🔒 보안 고려사항

1. **환경 변수 보안**
   - `.env` 파일을 `.gitignore`에 추가
   - 프로덕션에서는 AWS Secrets Manager 사용 권장

2. **네트워크 보안**
   - 필요한 포트만 열기
   - VPC 설정으로 네트워크 격리

3. **컨테이너 보안**
   - 최신 베이스 이미지 사용
   - 정기적인 보안 업데이트

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 도커 로그: `docker logs nodeback-app`
2. 애플리케이션 로그: 애플리케이션 내부 로그
3. 시스템 리소스: `docker stats`
4. 네트워크 연결: `docker network ls` 