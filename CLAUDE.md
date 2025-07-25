# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

워클리(Workly)는 비즈니스 성공을 위한 웹 애플리케이션 프로젝트입니다.

## 개발 원칙

- **프론트엔드 최우선**: 시각적으로 확인 가능한 결과물을 가장 빠르게 제공
- **한국어 소통**: 모든 커뮤니케이션은 한국어로 진행
- **지속적 개발**: 눈으로 볼 수 있는 앱이 완성될 때까지 멈춤 없이 진행
- **파일 관리**: 깔끔하고 체계적인 파일 구조 유지
- **목업 우선**: 가장 빠른 시간 내에 시각적 목업 디자인 완성

## 개발 제약사항

- **서버 실행 금지**: 절대로 서버를 직접 실행하지 않음
- **명령 기반**: 사용자 명령이 있을 때만 개발 진행

## 기술 스택

### Frontend
- **Next.js 14+**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 유틸리티 우선 CSS
- **Zustand**: 상태 관리

### Backend
- **NestJS**: Node.js 확장 가능한 프레임워크
- **TypeORM**: TypeScript ORM
- **PostgreSQL**: 관계형 데이터베이스
- **Socket.io**: 실시간 통신
- **JWT + Google OAuth**: 인증 시스템

## 프로젝트 구조

```
/Workly
├── frontend/         # Next.js + TypeScript + Tailwind CSS
├── backend/          # NestJS + TypeORM + PostgreSQL
├── shared/           # 공유 타입 및 상수
├── docs/             # 프로젝트 문서
└── docker-compose.yml # 개발 환경
```

자세한 구조는 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) 참조

## 개발 명령어

```bash
# 전체 개발 환경 실행 (Docker)
docker-compose up -d

# 프론트엔드만 실행
cd frontend && npm run dev

# 백엔드만 실행
cd backend && npm run start:dev

# 빌드
cd frontend && npm run build
cd backend && npm run build
```

## 깃 자동화 방안

### 자동 커밋 전략
- **개발 완료 시점**: 시각적으로 확인 가능한 결과물 완성 후 자동 커밋
- **커밋 메시지**: 작업 내용을 명확히 표현하는 한국어 메시지
- **브랜치 전략**: main 브랜치에서 직접 작업 (단순한 구조 유지)

### 자동화 명령어
```bash
# 변경사항 확인
git status
git diff

# 모든 변경사항 스테이징
git add .

# 자동 커밋 (작업 내용에 맞는 메시지)
git commit -m "작업내용: 구체적인 설명

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# 원격 저장소 푸시 (필요시)
git push origin main
```

### 커밋 시점
- CLAUDE.md 파일 수정 완료
- 프로젝트 초기 설정 완료
- 각 기능 구현 완료
- 목업 디자인 완료
- 사용자가 요청한 작업 완료

## 워클리 비즈니스 이해

워클리의 비즈니스 성공을 위해 사용자 경험과 비즈니스 가치를 최우선으로 고려하여 개발합니다.

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md