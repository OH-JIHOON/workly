#!/bin/bash

# Production 환경 배포 스크립트

set -e

echo "🌟 Production 환경에 배포를 시작합니다..."

# 1. AWS CLI 설정 확인
echo "☁️ AWS 설정 확인 중..."
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI가 설치되지 않았습니다."
    exit 1
fi

aws sts get-caller-identity > /dev/null
echo "✅ AWS 인증 확인 완료"

# 2. Docker 이미지 빌드 및 태깅
echo "🐳 Docker 이미지 빌드 중..."

# Frontend 이미지
docker build -t workly-frontend:latest ./frontend
docker tag workly-frontend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/workly-frontend:latest
docker tag workly-frontend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/workly-frontend:$(git rev-parse HEAD)

# Backend 이미지
docker build -t workly-backend:latest ./backend
docker tag workly-backend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/workly-backend:latest
docker tag workly-backend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/workly-backend:$(git rev-parse HEAD)

# 3. ECR 로그인
echo "🔑 ECR 로그인 중..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# 4. 이미지 푸시
echo "📤 Docker 이미지 푸시 중..."
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/workly-frontend:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/workly-frontend:$(git rev-parse HEAD)
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/workly-backend:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/workly-backend:$(git rev-parse HEAD)

# 5. 데이터베이스 마이그레이션
echo "💾 데이터베이스 마이그레이션 실행 중..."
./scripts/migrate.sh production

# 6. ECS 서비스 업데이트
echo "🚀 ECS 서비스 업데이트 중..."

# Backend 서비스 업데이트
aws ecs update-service \
    --cluster workly-cluster \
    --service workly-backend \
    --force-new-deployment \
    --region ${AWS_REGION}

# Frontend는 Vercel에서 자동 배포됨
echo "🌐 Frontend는 Vercel에서 자동 배포됩니다."

# 7. 배포 상태 확인
echo "⏳ 배포 상태 확인 중..."
aws ecs wait services-stable \
    --cluster workly-cluster \
    --services workly-backend \
    --region ${AWS_REGION}

# 8. CDN 캐시 무효화 (필요한 경우)
if [ -n "${CLOUDFRONT_DISTRIBUTION_ID}" ]; then
    echo "🌐 CloudFront 캐시 무효화 중..."
    aws cloudfront create-invalidation \
        --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} \
        --paths "/*"
fi

# 9. Slack 알림 (선택사항)
if [ -n "${SLACK_WEBHOOK_URL}" ]; then
    echo "📢 Slack 알림 전송 중..."
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ Workly Production 배포 완료\\n커밋: $(git rev-parse HEAD)\\n브랜치: $(git branch --show-current)\"}" \
        ${SLACK_WEBHOOK_URL}
fi

echo ""
echo "🎉 Production 배포가 성공적으로 완료되었습니다!"
echo ""
echo "배포 정보:"
echo "- 커밋 해시: $(git rev-parse HEAD)"
echo "- 브랜치: $(git branch --show-current)"
echo "- 배포 시간: $(date)"
echo ""
echo "서비스 URL:"
echo "- Frontend: https://workly.app"
echo "- Backend API: https://api.workly.app"