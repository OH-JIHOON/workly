# 🚀 Workly 개발 가이드

## 📍 현재 아키텍처

```
🌐 Next.js Frontend (로컬: localhost:3000)
         ↓
🚀 Vercel 배포 (https://workly-silk.vercel.app)
         ↓
🗄️ Supabase 클라우드 (wryixncvydcnalvepbox.supabase.co)
```

## 🛠️ 로컬 개발 환경 설정

### 1단계: 환경변수 설정

**`/frontend/.env.local`** (로컬 개발용)
```env
# Supabase 설정 (프로덕션과 동일)
NEXT_PUBLIC_SUPABASE_URL=https://wryixncvydcnalvepbox.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google OAuth 설정 (실제 값은 .env.local에서 확인)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 개발 모드 설정
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_ENABLE_DEBUG=true
```

### 2단계: 로컬 개발 서버 시작

```bash
# 프론트엔드 개발 서버 시작
cd frontend
npm install
npm run dev

# 접속: http://localhost:3000
```

## 🚀 배포 워크플로우

### 자동 배포 (권장)
1. **코드 푸시**: `git push origin main`
2. **자동 배포**: Vercel이 자동으로 감지하여 배포
3. **확인**: https://workly-silk.vercel.app

### 수동 배포 (필요시)
```bash
# Vercel CLI로 수동 배포
cd /Users/ohjiihoon/Documents/Workly
vercel --prod
```

## 📂 핵심 파일 구조

```
/Users/ohjiihoon/Documents/Workly/
├── frontend/                    # ✅ Next.js 앱 (핵심)
│   ├── src/                    # 소스 코드
│   ├── .env.local              # 환경변수 (로컬 개발)
│   └── package.json            # 의존성 관리
├── supabase-schema.sql         # ✅ 데이터베이스 스키마
├── vercel.json                 # ✅ Vercel 설정
└── DEVELOPMENT_GUIDE.md        # ✅ 이 파일
```

## 🔄 일반적인 개발 사이클

### 1. 로컬 개발
```bash
cd frontend
npm run dev
# http://localhost:3000 에서 개발
```

### 2. 코드 변경
- `/frontend/src/` 내의 파일들 수정
- 실시간 핫리로드로 즉시 확인

### 3. 테스트 및 커밋
```bash
# 로컬에서 테스트 후
git add .
git commit -m "feat: 새 기능 추가"
git push origin main
```

### 4. 자동 배포 확인
- Vercel이 자동으로 배포
- https://workly-silk.vercel.app 에서 확인

## 🗄️ 데이터베이스 작업

### 스키마 변경 시
1. **Supabase 대시보드**: https://supabase.com/dashboard
2. **SQL Editor**에서 직접 수정
3. **변경사항을 `supabase-schema.sql`에 백업**

### 데이터 확인
- **Supabase Dashboard → Table Editor**
- **또는 앱에서 직접 테스트**

## 🔧 환경 관리

### 로컬 개발
- **Frontend**: `npm run dev` (port 3000)
- **Database**: Supabase 클라우드 직접 연결
- **인증**: Google OAuth (실제 계정)

### 프로덕션
- **Frontend**: https://workly-silk.vercel.app
- **Database**: 동일한 Supabase 인스턴스
- **인증**: 동일한 Google OAuth

## 🚨 주의사항

### ❌ 사용하지 말 것
- `/backend/` 폴더 (NestJS 코드, 더이상 사용 안함)
- `docker-compose.yml` (로컬 DB 설정)
- 복잡한 모노레포 명령어들

### ✅ 사용할 것
- `cd frontend && npm run dev` (로컬 개발)
- `git push` (자동 배포)
- Supabase Dashboard (DB 관리)

## 🆘 문제 해결

### 로컬 서버 안 될 때
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### 배포 안 될 때
```bash
# 수동 배포 시도
vercel --prod

# 또는 Vercel Dashboard에서 수동 트리거
```

### 환경변수 문제
1. `.env.local` 파일 확인
2. Vercel Dashboard → Settings → Environment Variables 확인

## 📱 개발 팁

### 빠른 시작
```bash
# 새로운 터미널에서
cd /Users/ohjiihoon/Documents/Workly/frontend
npm run dev
```

### 효율적인 개발
1. **IDE**: VS Code에서 `/frontend` 폴더 오픈
2. **브라우저**: Chrome DevTools 적극 활용
3. **디버깅**: `console.log` + React DevTools

---

**🎯 핵심**: 이제 백엔드 걱정 없이 프론트엔드 개발에만 집중하면 됩니다!