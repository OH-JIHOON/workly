# Supabase 설정 가이드

Vercel + Supabase 아키텍처 설정을 위한 단계별 가이드입니다.

## 🚀 1단계: Supabase 프로젝트 생성

### 1.1 Supabase 계정 및 프로젝트 생성
1. [Supabase](https://supabase.com) 접속 및 로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: `workly-production` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 생성 (저장 필수!)
   - **Region**: `Northeast Asia (ap-northeast-1)` (서울 리전)
4. "Create new project" 클릭 후 약 2분 대기

### 1.2 프로젝트 URL 및 API Key 확인
1. 프로젝트 대시보드 → "Settings" → "API"
2. 다음 정보 복사 및 저장:
   - **Project URL**: `https://[project-ref].supabase.co`
   - **anon/public key**: `eyJ...` (공개 키)
   - **service_role key**: `eyJ...` (관리자 키, 보안 주의!)

## 🗄️ 2단계: 데이터베이스 스키마 설정

### 2.1 SQL 스키마 실행
1. Supabase 대시보드 → "SQL Editor"
2. "New query" 클릭
3. `supabase-schema.sql` 파일의 전체 내용을 복사하여 붙여넣기
4. "Run" 버튼 클릭하여 실행
5. 오류 없이 완료되면 성공!

### 2.2 스키마 확인
1. "Table Editor"에서 생성된 테이블들 확인:
   - `profiles` (사용자 프로필)
   - `tasks` (업무 관리)
   - `projects` (프로젝트)
   - `goals` (목표)
   - `inbox_items` (수집함)
   - `project_messages` (실시간 채팅)
   - `project_members` (프로젝트 멤버)
   - `notifications` (알림)

## 🔐 3단계: Google OAuth 설정

### 3.1 Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 기존 프로젝트 선택 또는 새 프로젝트 생성
3. "APIs & Services" → "Credentials" 이동
4. OAuth 2.0 Client IDs에서 기존 클라이언트 ID 편집 또는 새로 생성

### 3.2 승인된 리다이렉트 URI 추가
기존 URI에 다음을 **추가**:
```
https://[your-project-ref].supabase.co/auth/v1/callback
```

### 3.3 Supabase Auth 설정
1. Supabase 대시보드 → "Authentication" → "Providers"
2. "Google" 토글 활성화
3. Google OAuth 정보 입력:
   - **Client ID**: Google Cloud Console에서 복사
   - **Client Secret**: Google Cloud Console에서 복사
4. "Save" 클릭

### 3.4 사이트 URL 설정
1. "Authentication" → "URL Configuration"
2. **Site URL**: `http://localhost:3000` (개발용)
3. **Redirect URLs**에 추가:
   - `http://localhost:3000`
   - `https://your-app.vercel.app` (배포 시)

## ⚙️ 4단계: 환경변수 설정

### 4.1 Frontend 환경변수 설정
`.env.local` 파일 생성 (프로젝트 루트의 `frontend/` 디렉토리):

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (anon key)

# 개발 모드 (필요시)
NEXT_PUBLIC_DEV_MODE=false

# 기존 설정 (마이그레이션 완료 후 제거)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXTAUTH_SECRET=your-secret
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 4.2 환경변수 확인
```bash
cd frontend
npm run dev
```

콘솔에서 Supabase 연결 오류가 없는지 확인합니다.

## 🚦 5단계: RLS (Row Level Security) 테스트

### 5.1 테스트 사용자 생성
1. Supabase 대시보드 → "Authentication" → "Users"
2. "Invite a user" 또는 직접 Google 로그인 테스트
3. 사용자 생성 후 `profiles` 테이블에 자동으로 프로필이 생성되는지 확인

### 5.2 RLS 정책 확인
1. "Table Editor" → "tasks" 테이블
2. "Policies" 탭에서 정책들이 올바르게 생성되었는지 확인
3. 다른 테이블들도 동일하게 확인

## 📱 6단계: 실시간 기능 설정

### 6.1 Realtime 활성화
1. Supabase 대시보드 → "Database" → "Replication"
2. 다음 테이블들의 "Realtime" 토글 활성화:
   - `project_messages` (채팅)
   - `tasks` (업무 변경 알림)
   - `notifications` (실시간 알림)

### 6.2 실시간 정책 확인
SQL Editor에서 실행:
```sql
-- 실시간 구독이 활성화되었는지 확인
SELECT schemaname, tablename, replication_active 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

## 🌐 7단계: Vercel 배포 설정

### 7.1 Vercel 환경변수 설정
Vercel 대시보드에서 환경변수 추가:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_DEV_MODE=false
```

### 7.2 도메인 설정
1. Vercel에서 배포 완료 후 도메인 확인
2. Supabase → "Authentication" → "URL Configuration"
3. **Site URL** 및 **Redirect URLs**에 프로덕션 도메인 추가

## ✅ 8단계: 테스트 체크리스트

### 8.1 기능 테스트
- [ ] Google OAuth 로그인/로그아웃
- [ ] 사용자 프로필 자동 생성
- [ ] 업무 생성/수정/삭제
- [ ] 프로젝트 생성 및 멤버 관리
- [ ] 실시간 채팅 (프로젝트 메시지)
- [ ] 수집함 기능
- [ ] 목표 설정 및 관리

### 8.2 보안 테스트
- [ ] 다른 사용자의 데이터 접근 불가
- [ ] 로그아웃 시 데이터 접근 차단
- [ ] RLS 정책 올바른 작동

### 8.3 성능 테스트
- [ ] 페이지 로딩 속도 (< 3초)
- [ ] 실시간 기능 지연 (< 1초)
- [ ] 대량 데이터 처리 (100+ 업무)

## 🚨 문제 해결

### 일반적인 오류들
1. **"Invalid API key"**
   - `.env.local` 파일의 API 키 확인
   - Supabase 대시보드에서 키 재확인

2. **"Row Level Security" 오류**
   - SQL 스키마가 올바르게 실행되었는지 확인
   - 정책이 올바르게 생성되었는지 확인

3. **Google OAuth 실패**
   - 리다이렉트 URI 설정 확인
   - Client ID/Secret 올바른지 확인

4. **실시간 기능 작동 안함**
   - Realtime이 활성화되었는지 확인
   - 브라우저 WebSocket 지원 확인

### 지원 및 문의
- [Supabase 공식 문서](https://supabase.com/docs)
- [Discord 커뮤니티](https://discord.supabase.com)
- 프로젝트 이슈: GitHub Issues 활용

---

**🎉 설정 완료 후 개발팀에게 알림:**
- [ ] Supabase 프로젝트 URL 공유
- [ ] 환경변수 문서 업데이트
- [ ] API 변경사항 팀원들에게 공지
- [ ] 기존 백엔드 종료 일정 협의