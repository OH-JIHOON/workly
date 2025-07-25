# 워클리 풀스택 프로젝트 구조

## 전체 프로젝트 구조

```
Workly/
├── 📁 frontend/                    # Next.js 프론트엔드
│   ├── 📁 src/
│   │   ├── 📁 app/                 # Next.js App Router
│   │   │   ├── 📁 (auth)/          # 인증 관련 페이지 그룹
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── 📁 (dashboard)/     # 대시보드 페이지 그룹
│   │   │   │   ├── page.tsx        # 홈(업무) 페이지
│   │   │   │   ├── projects/
│   │   │   │   ├── board/
│   │   │   │   ├── activity/
│   │   │   │   └── profile/
│   │   │   ├── 📁 api/             # API 라우트 (백엔드 프록시)
│   │   │   │   ├── auth/
│   │   │   │   └── proxy/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── loading.tsx
│   │   ├── 📁 components/          # 재사용 컴포넌트
│   │   │   ├── 📁 ui/              # 기본 UI 컴포넌트
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── modal.tsx
│   │   │   │   └── input.tsx
│   │   │   ├── 📁 navigation/      # 네비게이션 컴포넌트
│   │   │   │   ├── LeftNavigation.tsx
│   │   │   │   └── MobileNavigation.tsx
│   │   │   ├── 📁 layout/          # 레이아웃 컴포넌트
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── 📁 dashboard/       # 대시보드 컴포넌트
│   │   │   │   ├── WorkDashboard.tsx
│   │   │   │   ├── StatCard.tsx
│   │   │   │   └── TaskList.tsx
│   │   │   ├── 📁 project/         # 프로젝트 관련 컴포넌트
│   │   │   │   ├── ProjectCard.tsx
│   │   │   │   ├── ProjectForm.tsx
│   │   │   │   └── ProjectDetail.tsx
│   │   │   ├── 📁 board/           # 게시판 컴포넌트
│   │   │   │   ├── PostCard.tsx
│   │   │   │   ├── PostForm.tsx
│   │   │   │   └── CommentSection.tsx
│   │   │   └── 📁 auth/            # 인증 컴포넌트
│   │   │       ├── LoginForm.tsx
│   │   │       ├── GoogleAuth.tsx
│   │   │       └── ProtectedRoute.tsx
│   │   ├── 📁 hooks/               # 커스텀 훅
│   │   │   ├── useAuth.ts
│   │   │   ├── useSocket.ts
│   │   │   ├── useProjects.ts
│   │   │   └── useTasks.ts
│   │   ├── 📁 services/            # API 서비스
│   │   │   ├── api.ts              # 기본 API 클라이언트
│   │   │   ├── auth.service.ts
│   │   │   ├── project.service.ts
│   │   │   ├── task.service.ts
│   │   │   ├── board.service.ts
│   │   │   └── socket.service.ts
│   │   ├── 📁 stores/              # 상태 관리 (Zustand)
│   │   │   ├── authStore.ts
│   │   │   ├── projectStore.ts
│   │   │   ├── taskStore.ts
│   │   │   └── socketStore.ts
│   │   ├── 📁 types/               # TypeScript 타입 정의
│   │   │   ├── auth.types.ts
│   │   │   ├── project.types.ts
│   │   │   ├── task.types.ts
│   │   │   ├── board.types.ts
│   │   │   └── common.types.ts
│   │   └── 📁 utils/               # 유틸리티 함수
│   │       ├── constants.ts
│   │       ├── validation.ts
│   │       ├── helpers.ts
│   │       └── socket-client.ts
│   ├── 📁 public/                  # 정적 파일
│   │   ├── icons/
│   │   ├── images/
│   │   └── favicon.ico
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── 📁 backend/                     # NestJS 백엔드
│   ├── 📁 src/
│   │   ├── 📁 app/                 # 앱 진입점
│   │   │   ├── app.controller.ts
│   │   │   ├── app.module.ts
│   │   │   └── app.service.ts
│   │   ├── 📁 config/              # 설정 파일
│   │   │   ├── database.config.ts
│   │   │   ├── auth.config.ts
│   │   │   ├── storage.config.ts
│   │   │   └── socket.config.ts
│   │   ├── 📁 common/              # 공통 모듈
│   │   │   ├── 📁 decorators/      # 커스텀 데코레이터
│   │   │   ├── 📁 guards/          # 가드 (인증, 권한)
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   ├── google-auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   ├── 📁 interceptors/    # 인터셉터
│   │   │   ├── 📁 pipes/           # 파이프 (검증)
│   │   │   ├── 📁 filters/         # 예외 필터
│   │   │   └── 📁 middleware/      # 미들웨어
│   │   ├── 📁 database/            # 데이터베이스 관련
│   │   │   ├── 📁 entities/        # TypeORM 엔티티
│   │   │   │   ├── user.entity.ts
│   │   │   │   ├── project.entity.ts
│   │   │   │   ├── task.entity.ts
│   │   │   │   ├── board.entity.ts
│   │   │   │   ├── comment.entity.ts
│   │   │   │   └── file.entity.ts
│   │   │   ├── 📁 migrations/      # 데이터베이스 마이그레이션
│   │   │   ├── 📁 seeds/           # 초기 데이터
│   │   │   └── database.module.ts
│   │   ├── 📁 modules/             # 기능별 모듈
│   │   │   ├── 📁 auth/            # 인증 모듈
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── 📁 strategies/
│   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   └── google.strategy.ts
│   │   │   │   └── 📁 dto/
│   │   │   │       ├── login.dto.ts
│   │   │   │       └── register.dto.ts
│   │   │   ├── 📁 users/           # 사용자 모듈
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   ├── users.module.ts
│   │   │   │   └── 📁 dto/
│   │   │   │       └── create-user.dto.ts
│   │   │   ├── 📁 projects/        # 프로젝트 모듈
│   │   │   │   ├── projects.controller.ts
│   │   │   │   ├── projects.service.ts
│   │   │   │   ├── projects.module.ts
│   │   │   │   └── 📁 dto/
│   │   │   │       ├── create-project.dto.ts
│   │   │   │       └── update-project.dto.ts
│   │   │   ├── 📁 tasks/           # 업무 모듈
│   │   │   │   ├── tasks.controller.ts
│   │   │   │   ├── tasks.service.ts
│   │   │   │   ├── tasks.module.ts
│   │   │   │   └── 📁 dto/
│   │   │   │       ├── create-task.dto.ts
│   │   │   │       └── update-task.dto.ts
│   │   │   ├── 📁 board/           # 게시판 모듈
│   │   │   │   ├── board.controller.ts
│   │   │   │   ├── board.service.ts
│   │   │   │   ├── board.module.ts
│   │   │   │   └── 📁 dto/
│   │   │   │       ├── create-post.dto.ts
│   │   │   │       └── create-comment.dto.ts
│   │   │   ├── 📁 files/           # 파일 관리 모듈
│   │   │   │   ├── files.controller.ts
│   │   │   │   ├── files.service.ts
│   │   │   │   ├── files.module.ts
│   │   │   │   └── 📁 storage/
│   │   │   │       ├── local.storage.ts
│   │   │   │       └── s3.storage.ts
│   │   │   └── 📁 notifications/   # 알림 모듈
│   │   │       ├── notifications.controller.ts
│   │   │       ├── notifications.service.ts
│   │   │       ├── notifications.module.ts
│   │   │       └── notifications.gateway.ts
│   │   ├── 📁 websockets/          # Socket.io 관련
│   │   │   ├── websockets.gateway.ts
│   │   │   ├── websockets.module.ts
│   │   │   └── 📁 events/
│   │   │       ├── task.events.ts
│   │   │       ├── project.events.ts
│   │   │       └── notification.events.ts
│   │   └── main.ts                 # 앱 진입점
│   ├── 📁 uploads/                 # 로컬 파일 업로드 (개발용)
│   ├── 📁 test/                    # 테스트 파일
│   ├── package.json
│   ├── nest-cli.json
│   └── tsconfig.json
│
├── 📁 shared/                      # 공유 라이브러리
│   ├── 📁 types/                   # 공통 타입 정의
│   │   ├── api.types.ts
│   │   ├── socket.types.ts
│   │   └── common.types.ts
│   ├── 📁 constants/               # 공통 상수
│   │   ├── api-endpoints.ts
│   │   ├── socket-events.ts
│   │   └── app-constants.ts
│   └── 📁 utils/                   # 공통 유틸리티
│       ├── validation.ts
│       └── helpers.ts
│
├── 📁 docs/                        # 프로젝트 문서
│   ├── 📁 api/                     # API 문서
│   ├── 📁 database/                # 데이터베이스 스키마
│   └── 📁 deployment/              # 배포 가이드
│
├── 📁 scripts/                     # 유틸리티 스크립트
│   ├── setup.sh                    # 초기 설정 스크립트
│   ├── migrate.sh                  # 데이터베이스 마이그레이션
│   └── deploy.sh                   # 배포 스크립트
│
├── 📁 .github/                     # GitHub Actions
│   └── 📁 workflows/
│       ├── frontend-ci.yml
│       └── backend-ci.yml
│
├── docker-compose.yml              # 개발 환경 Docker
├── docker-compose.prod.yml         # 프로덕션 환경 Docker
├── .env.example                    # 환경 변수 예시
├── .gitignore
├── README.md
└── CLAUDE.md                       # Claude Code 설정
```

## 주요 기술 스택별 폴더 설명

### 🎨 Frontend (Next.js + TypeScript + Tailwind)
- **App Router 구조**: 페이지 그룹핑으로 관련 기능 분리
- **컴포넌트 계층화**: ui → layout → feature 순서
- **상태 관리**: Zustand 기반 모듈별 스토어
- **API 통신**: 서비스 레이어 패턴

### 🔧 Backend (NestJS + TypeORM + PostgreSQL)
- **모듈 기반 구조**: 기능별 독립 모듈
- **계층화 아키텍처**: Controller → Service → Repository
- **공통 모듈**: 인증, 권한, 검증 등
- **데이터베이스**: 엔티티, 마이그레이션, 시드 분리

### 🔐 Authentication (JWT + Google OAuth)
- **전략 패턴**: JWT/Google 인증 전략 분리
- **가드 시스템**: 라우트 보호 및 권한 체크
- **토큰 관리**: 리프레시 토큰 포함 완전한 인증 플로우

### ⚡ Real-time (Socket.io)
- **Gateway 패턴**: 실시간 이벤트 처리
- **이벤트 분리**: 모듈별 이벤트 타입 정의
- **클라이언트 연동**: 프론트엔드 소켓 서비스

### 📁 File Storage (Local/AWS S3)
- **전략 패턴**: 로컬/클라우드 스토리지 추상화
- **파일 관리**: 업로드, 다운로드, 삭제 통합 API
- **보안**: 인증된 사용자만 파일 접근 가능

## 개발 환경 설정

### Frontend 설정
```bash
cd frontend
npm install
npm run dev
```

### Backend 설정
```bash
cd backend
npm install
npm run start:dev
```

### Database 설정
```bash
docker-compose up -d postgres
cd backend
npm run migration:run
npm run seed:run
```

## API 통신 구조

### REST API
- `/api/auth/*` - 인증 관련
- `/api/users/*` - 사용자 관리
- `/api/projects/*` - 프로젝트 관리
- `/api/tasks/*` - 업무 관리
- `/api/board/*` - 게시판
- `/api/files/*` - 파일 관리

### WebSocket Events
- `task:created` - 새 업무 생성
- `task:updated` - 업무 상태 변경
- `project:joined` - 프로젝트 참여
- `notification:new` - 새 알림

## 배포 전략

### 개발 환경
- Docker Compose로 로컬 개발 환경 구성
- 핫 리로드 지원

### 프로덕션 환경
- Frontend: Vercel 또는 Netlify
- Backend: AWS EC2 + RDS
- 파일 스토리지: AWS S3
- 실시간 통신: Redis Adapter