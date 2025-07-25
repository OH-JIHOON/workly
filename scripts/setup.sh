#!/bin/bash

# 워클리 프로젝트 초기 설정 스크립트

set -e

echo "🚀 워클리 프로젝트 초기 설정을 시작합니다..."

# 1. Node.js 버전 확인
echo "📋 Node.js 버전 확인 중..."
node_version=$(node -v | sed 's/v//' | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo "❌ Node.js 18 이상이 필요합니다. 현재 버전: $(node -v)"
    exit 1
fi
echo "✅ Node.js 버전: $(node -v)"

# 2. npm 버전 확인
npm_version=$(npm -v | cut -d'.' -f1)
if [ "$npm_version" -lt 9 ]; then
    echo "❌ npm 9 이상이 필요합니다. 현재 버전: $(npm -v)"
    exit 1
fi
echo "✅ npm 버전: $(npm -v)"

# 3. 환경 변수 파일 설정
echo "🔧 환경 변수 파일 설정 중..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ .env 파일이 생성되었습니다. 필요한 값들을 설정해주세요."
else
    echo "ℹ️ .env 파일이 이미 존재합니다."
fi

# 4. 의존성 설치
echo "📦 의존성 설치 중..."
npm install

# 5. Shared 모듈 빌드
echo "🔨 Shared 모듈 빌드 중..."
npm run build:shared

# 6. Git hooks 설정
echo "🪝 Git hooks 설정 중..."
npx husky install

# 7. Docker 환경 확인
echo "🐳 Docker 환경 확인 중..."
if command -v docker &> /dev/null; then
    echo "✅ Docker가 설치되어 있습니다."
    if docker info &> /dev/null; then
        echo "✅ Docker가 실행 중입니다."
    else
        echo "⚠️ Docker가 실행되지 않고 있습니다. Docker를 시작해주세요."
    fi
else
    echo "⚠️ Docker가 설치되지 않았습니다. 선택사항이지만 개발 환경 구성에 유용합니다."
fi

# 8. 데이터베이스 설정 안내
echo "💾 데이터베이스 설정 안내:"
echo "   개발용 PostgreSQL 실행: npm run docker:dev"
echo "   또는 로컬 PostgreSQL 설정 후 .env 파일 수정"

# 9. 개발 서버 실행 안내
echo ""
echo "🎉 초기 설정이 완료되었습니다!"
echo ""
echo "다음 단계:"
echo "1. .env 파일의 환경 변수를 설정하세요"
echo "2. 데이터베이스를 설정하세요: npm run docker:dev"
echo "3. 개발 서버를 실행하세요: npm run dev"
echo ""
echo "유용한 명령어:"
echo "- npm run dev          : 프론트엔드 + 백엔드 동시 실행"
echo "- npm run dev:frontend : 프론트엔드만 실행"
echo "- npm run dev:backend  : 백엔드만 실행"
echo "- npm run lint         : 전체 린팅"
echo "- npm run test         : 전체 테스트"
echo "- npm run build        : 전체 빌드"