#!/bin/bash

# 워클리 프로젝트 배포 스크립트

set -e

# 환경 변수 설정
ENVIRONMENT=${1:-production}
FRONTEND_BUILD_DIR="frontend/.next"
BACKEND_BUILD_DIR="backend/dist"

echo "🚀 워클리 배포를 시작합니다... (환경: $ENVIRONMENT)"

# 1. 환경 확인
echo "📋 배포 환경 확인 중..."
case $ENVIRONMENT in
    development|staging|production)
        echo "✅ 배포 환경: $ENVIRONMENT"
        ;;
    *)
        echo "❌ 잘못된 환경입니다. development, staging, production 중 하나를 선택하세요."
        exit 1
        ;;
esac

# 2. Git 상태 확인
echo "📝 Git 상태 확인 중..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️ 커밋되지 않은 변경사항이 있습니다. 배포 전 커밋하세요."
    git status
    exit 1
fi
echo "✅ Git 상태가 깨끗합니다."

# 3. 현재 브랜치 확인
CURRENT_BRANCH=$(git branch --show-current)
if [ "$ENVIRONMENT" = "production" ] && [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Production 배포는 main 브랜치에서만 가능합니다. 현재 브랜치: $CURRENT_BRANCH"
    exit 1
fi
echo "✅ 브랜치 확인: $CURRENT_BRANCH"

# 4. 테스트 실행
echo "🧪 테스트 실행 중..."
npm run test
echo "✅ 모든 테스트가 통과했습니다."

# 5. 린팅 검사
echo "🔍 코드 품질 검사 중..."
npm run lint
echo "✅ 린팅 검사를 통과했습니다."

# 6. 의존성 설치 및 빌드
echo "📦 의존성 설치 및 빌드 중..."
npm ci
npm run build

# 7. 빌드 결과 확인
echo "📊 빌드 결과 확인 중..."
if [ ! -d "$FRONTEND_BUILD_DIR" ]; then
    echo "❌ 프론트엔드 빌드 실패"
    exit 1
fi

if [ ! -d "$BACKEND_BUILD_DIR" ]; then
    echo "❌ 백엔드 빌드 실패"
    exit 1
fi
echo "✅ 빌드가 성공적으로 완료되었습니다."

# 8. 환경별 배포 실행
case $ENVIRONMENT in
    development)
        echo "🔧 Development 환경 배포..."
        # Docker Compose를 사용한 로컬 배포
        docker-compose -f docker-compose.yml up --build -d
        ;;
    staging)
        echo "🎭 Staging 환경 배포..."
        # Staging 서버 배포 로직
        ./scripts/deploy-staging.sh
        ;;
    production)
        echo "🌟 Production 환경 배포..."
        # Production 배포 로직
        ./scripts/deploy-production.sh
        ;;
esac

# 9. 배포 완료 확인
echo "🏁 배포 완료 확인 중..."
sleep 10

# Health check URLs
case $ENVIRONMENT in
    development)
        FRONTEND_URL="http://localhost:3000"
        BACKEND_URL="http://localhost:3001"
        ;;
    staging)
        FRONTEND_URL="${STAGING_FRONTEND_URL:-https://staging.workly.app}"
        BACKEND_URL="${STAGING_BACKEND_URL:-https://api-staging.workly.app}"
        ;;
    production)
        FRONTEND_URL="${PROD_FRONTEND_URL:-https://workly.app}"
        BACKEND_URL="${PROD_BACKEND_URL:-https://api.workly.app}"
        ;;
esac

# Health check
echo "🔍 서비스 상태 확인 중..."
if curl -f -s "$BACKEND_URL/health" > /dev/null; then
    echo "✅ 백엔드 서비스가 정상적으로 실행 중입니다."
else
    echo "⚠️ 백엔드 서비스 상태 확인 실패"
fi

echo ""
echo "🎉 배포가 완료되었습니다!"
echo ""
echo "서비스 URL:"
echo "- 프론트엔드: $FRONTEND_URL"
echo "- 백엔드 API: $BACKEND_URL"
echo ""
echo "모니터링:"
echo "- 로그 확인: npm run logs"
echo "- 상태 확인: npm run status"