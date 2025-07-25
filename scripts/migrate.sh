#!/bin/bash

# 데이터베이스 마이그레이션 스크립트

set -e

ENVIRONMENT=${1:-development}

echo "💾 데이터베이스 마이그레이션을 시작합니다... (환경: $ENVIRONMENT)"

# 환경별 설정
case $ENVIRONMENT in
    development)
        echo "🔧 Development 환경 마이그레이션"
        cd backend
        ;;
    staging)
        echo "🎭 Staging 환경 마이그레이션"
        cd backend
        ;;
    production)
        echo "🌟 Production 환경 마이그레이션"
        echo "⚠️ Production 마이그레이션은 신중하게 진행해야 합니다."
        read -p "계속하시겠습니까? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "마이그레이션이 취소되었습니다."
            exit 1
        fi
        cd backend
        ;;
    *)
        echo "❌ 잘못된 환경입니다. development, staging, production 중 하나를 선택하세요."
        exit 1
        ;;
esac

# 1. 백업 생성 (Production인 경우)
if [ "$ENVIRONMENT" = "production" ]; then
    echo "💾 데이터베이스 백업 생성 중..."
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    # PostgreSQL 백업
    pg_dump \
        -h "${DATABASE_HOST}" \
        -p "${DATABASE_PORT}" \
        -U "${DATABASE_USERNAME}" \
        -d "${DATABASE_NAME}" \
        > "../backups/${BACKUP_FILE}"
    
    echo "✅ 백업 완료: ../backups/${BACKUP_FILE}"
fi

# 2. 마이그레이션 파일 확인
echo "📋 마이그레이션 파일 확인 중..."
MIGRATION_FILES=$(find src/database/migrations -name "*.ts" | wc -l)
echo "마이그레이션 파일 개수: $MIGRATION_FILES"

# 3. 마이그레이션 실행
echo "⚡ 마이그레이션 실행 중..."
npm run db:migrate

# 4. 마이그레이션 상태 확인
echo "📊 마이그레이션 상태 확인 중..."
# 마이그레이션 테이블 조회하여 상태 확인하는 로직 추가

# 5. 시드 데이터 적용 (Development인 경우)
if [ "$ENVIRONMENT" = "development" ]; then
    echo "🌱 시드 데이터 적용 중..."
    npm run db:seed
    echo "✅ 시드 데이터 적용 완료"
fi

echo ""
echo "🎉 데이터베이스 마이그레이션이 완료되었습니다!"
echo ""

# 6. 롤백 방법 안내
if [ "$ENVIRONMENT" = "production" ]; then
    echo "롤백이 필요한 경우:"
    echo "1. 마이그레이션 롤백: npm run db:migrate:revert"
    echo "2. 백업 복원: psql -h \$DATABASE_HOST -U \$DATABASE_USERNAME -d \$DATABASE_NAME < ../backups/${BACKUP_FILE}"
    echo ""
fi