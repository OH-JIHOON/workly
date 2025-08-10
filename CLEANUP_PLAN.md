# 🧹 Workly 프로젝트 정리 계획

## 🎯 목표
- Supabase + Vercel 아키텍처에 맞게 불필요한 파일 제거
- 개발 환경 단순화
- 혼란 제거

## ❌ 제거 대상 (확인 후 삭제)

### 1. 백엔드 관련 (NestJS 더이상 사용 안함)
- `/backend/` 폴더 전체
- `docker-compose.yml`
- `/shared/` 폴더 (모노레포 불필요)

### 2. 설정 파일 정리
- 루트 `package.json` (모노레포 설정 불필요)
- 복잡한 워크스페이스 설정들
- `tsconfig.json` (루트 레벨)

### 3. 문서 정리
- `/instructions/` 폴더 (이전 개발 과정 기록들)
- 중복된 설정 파일들

## ✅ 유지 대상

### 핵심 파일들
- `/frontend/` - Next.js 앱 전체
- `supabase-schema.sql` - 데이터베이스 스키마
- `vercel.json` - 배포 설정
- `DEVELOPMENT_GUIDE.md` - 개발 가이드
- `/references/` - 프로젝트 문서
- `CLAUDE.md`, `README.md` - 프로젝트 정보

### 새로운 구조
```
/Users/ohjiihoon/Documents/Workly/
├── frontend/                    # Next.js 앱
├── references/                  # 프로젝트 문서
├── supabase-schema.sql         # DB 스키마
├── vercel.json                 # Vercel 설정  
├── DEVELOPMENT_GUIDE.md        # 개발 가이드
├── CLAUDE.md                   # AI 컨텍스트
└── README.md                   # 프로젝트 소개
```

## 🚀 정리 후 간단한 워크플로우
```bash
# 로컬 개발
cd frontend && npm run dev

# 배포
git push origin main  # 자동 배포
```

---
**⚠️ 주의**: 정리 전 현재 작업 중인 내용을 git commit으로 백업 권장