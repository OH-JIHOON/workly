# 워클리 (Workly) - 업무 관리 플랫폼

효율적인 업무 관리와 팀 협업을 위한 현대적인 웹 애플리케이션

## 🚀 주요 기능

- **📊 업무 대시보드**: 개인 및 팀 업무 현황을 한눈에 파악
- **🗂️ 프로젝트 관리**: 프로젝트별 업무 조직화 및 진행 상황 추적
- **💬 게시판**: 팀 소통 및 정보 공유
- **🔔 실시간 알림**: Socket.io 기반 실시간 업데이트
- **👥 팀 협업**: 사용자 권한 관리 및 협업 도구
- **🔐 보안 인증**: JWT 및 Google OAuth 통합

## 🛠️ 기술 스택

### Frontend
- **Next.js 14**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안전성을 위한 정적 타입 언어
- **Tailwind CSS**: 유틸리티 우선 CSS 프레임워크
- **Zustand**: 가벼운 상태 관리 라이브러리
- **Socket.io Client**: 실시간 통신

### Backend
- **NestJS**: Node.js 기반 확장 가능한 서버 프레임워크
- **TypeORM**: TypeScript용 ORM
- **PostgreSQL**: 관계형 데이터베이스
- **Socket.io**: 실시간 양방향 통신
- **JWT**: 사용자 인증 및 권한 관리
- **Google OAuth**: 소셜 로그인

### DevOps & 인프라
- **Docker**: 컨테이너화
- **Redis**: 세션 관리 및 캐싱
- **AWS S3**: 파일 스토리지 (프로덕션)
- **GitHub Actions**: CI/CD 파이프라인

## 📁 프로젝트 구조

```
Workly/
├── 📁 frontend/           # Next.js 프론트엔드
├── 📁 backend/            # NestJS 백엔드
├── 📁 shared/             # 공유 타입 및 상수
├── 📁 docs/               # 프로젝트 문서
├── 📁 scripts/            # 유틸리티 스크립트
├── docker-compose.yml     # 개발 환경 Docker
└── README.md
```

자세한 구조는 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)를 참조하세요.

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/workly.git
cd workly
```

### 2. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 필요한 환경 변수를 설정하세요
```

### 3. Docker로 개발 환경 실행
```bash
# 모든 서비스 실행 (데이터베이스, 백엔드, 프론트엔드)
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 4. 로컬 개발 (선택사항)

#### 데이터베이스만 Docker로 실행
```bash
docker-compose up -d postgres redis
```

#### 백엔드 실행
```bash
cd backend
npm install
npm run start:dev
```

#### 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```

## 📱 애플리케이션 접속

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:3001
- **API 문서**: http://localhost:3001/api (Swagger)
- **데이터베이스**: localhost:5432
- **Redis**: localhost:6379
- **MinIO Console**: http://localhost:9001

## 🧪 테스트

### 백엔드 테스트
```bash
cd backend
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

### 프론트엔드 테스트
```bash
cd frontend
# Jest 테스트
npm run test

# Cypress E2E 테스트
npm run cypress:open
```

## 📦 배포

### 프로덕션 빌드
```bash
# 백엔드 빌드
cd backend
npm run build

# 프론트엔드 빌드
cd frontend
npm run build
```

### Docker 프로덕션 배포
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 개발 가이드

### 코드 스타일
- **ESLint**: 코드 품질 및 스타일 검사
- **Prettier**: 코드 포매팅
- **Husky**: Git 훅을 통한 자동 검사

### API 개발
1. 백엔드에서 NestJS 모듈 생성
2. DTO 및 엔티티 정의
3. 서비스 로직 구현
4. 컨트롤러 API 엔드포인트 생성
5. 프론트엔드 서비스 레이어에서 API 연동

### 실시간 기능 개발
1. 백엔드 WebSocket Gateway 이벤트 정의
2. Socket 이벤트 타입을 shared/types에 추가
3. 프론트엔드에서 Socket 연결 및 이벤트 리스너 구현

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/새기능`)
3. 변경사항을 커밋합니다 (`git commit -am '새기능 추가'`)
4. 브랜치에 푸시합니다 (`git push origin feature/새기능`)
5. Pull Request를 생성합니다

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🆘 지원

문제가 발생하거나 질문이 있으시면:

1. [GitHub Issues](https://github.com/your-username/workly/issues)에 이슈를 등록해주세요
2. [토론 게시판](https://github.com/your-username/workly/discussions)에서 커뮤니티와 소통하세요
3. 문서를 확인하세요: [docs/](./docs/)

---

**워클리**로 더 효율적인 업무 관리를 시작하세요! 🚀