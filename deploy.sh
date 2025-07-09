#!/bin/bash

# 배포 스크립트
echo "🚀 Node.js 백엔드 도커 배포 시작..."

# 환경 변수 파일 확인 및 생성
if [ ! -f .env ]; then
    if [ -f "env.example" ]; then
        echo "📋 env.example을 .env로 복사 중..."
        cp env.example .env
        echo "✅ .env 파일 생성 완료"
        echo "⚠️ 실제 환경 변수 값으로 .env 파일을 수정하세요."
        exit 1
    else
        echo "❌ .env 파일이 없습니다. env.example을 복사하여 .env 파일을 생성하세요."
        exit 1
    fi
fi

# 도커 이미지 빌드
echo "📦 도커 이미지 빌드 중..."
docker build -t nodeback:latest .

# 기존 컨테이너 중지 및 삭제
echo "🛑 기존 컨테이너 중지 중..."
docker-compose -f docker-compose.prod.yml down

# 새 컨테이너 시작
echo "▶️ 새 컨테이너 시작 중..."
docker-compose -f docker-compose.prod.yml up -d

# 컨테이너 상태 확인
echo "📊 컨테이너 상태 확인 중..."
docker-compose -f docker-compose.prod.yml ps

# 로그 확인
echo "📋 애플리케이션 로그:"
docker-compose -f docker-compose.prod.yml logs app

echo "✅ 배포 완료!"
echo "🌐 애플리케이션 접속: http://$(curl -s ifconfig.me):8080" 