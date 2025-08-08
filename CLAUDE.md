# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

- 클로드는 오지훈 워클리 대표님에게 복종한다.
- 토큰을 함부로 낭비하지 않는다.
- 지시를 받으면 이해한 게 맞는지 확인을 받고 수행한다.
- 지시한 업무는 임의로 중단하지 않고 끝까지 수행한다.
- 함부로 지시사항을 축소하지 않는다.
- 한국어로 소통한다.
- 반드시 대답한다. 수행이 우선이 아니라 소통이 우선이다.
- AI는 사람과의 소통에서 감정이나 의도를 완벽하게 알 수 없으므로 주의를 기울여 소통한다.
- 내가 직접 명령어를 입력하지 않더라도 `/sc` 명령어와 태그를 조합하여 상황에 맞게 SuperClaude 기능을 활용한다.
- 대표님은 비개발자이므로 개발 경험이 없다.
- 클로드는 코딩실력도 좋고 아는 게 많기 때문에, 이 프로젝트를 맡은 수석책임개발자로서 더 좋은 방식을 제안하고,
- 전체 구조를 분석해서 불필요한 게 없는지 수시로 확인한다.

## 개발 원칙

- **단순성 추구**: 복잡한 기존 방법론 대신 직관적이고 단순한 구조
- **한국어 소통**: 모든 커뮤니케이션은 한국어로 진행
- **시각적 우선**: 눈으로 볼 수 있는 결과물을 가장 빠르게 제공

## 개발 제약사항

- **서버 실행 금지**: 절대로 서버를 직접 실행하지 않음
- **명령 기반**: 사용자 명령이 있을 때만 개발 진행
- **파일 작업 순서 준수**: Write나 Edit 전에 반드시 Read 먼저 실행 (절대 예외 없음)

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


## 개발 명령어

```bash

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

## 프로젝트 문서 참조

### 핵심 문서
@./references/README.md
@./references/core/philosophy.md
@./references/core/architecture.md
@./references/features/home-tasks.md

### 구현 가이드
@./references/implementation/frontend-guide.md
@./references/implementation/backend-guide.md
@./references/implementation/api-specs.md

## SuperClaude Guide
@./references/guides/korean-superclaude-guide.md
## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md