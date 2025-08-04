# SuperClaude 명령어 가이드 (Workly 프로젝트용)

이 문서는 Workly 프로젝트에서 SuperClaude AI 에이전트의 명령어를 효과적으로 사용하기 위해 공식 가이드를 요약하고 프로젝트에 맞게 조정한 버전입니다.

---

## 핵심 명령어 (Quick Start)

우선 이것부터 사용해보세요. 대부분의 작업은 아래 명령어로 시작할 수 있습니다.

```bash
# 코드베이스 분석 (보안, 성능, 아키텍처 등)
/sc:analyze frontend/src/app

# 기능 구현 (컴포넌트, API, 서비스 등)
/sc:implement UserProfile component --framework react --with-tests

# 프로젝트 빌드 (frontend/backend)
/sc:build

# 코드 개선 (리팩토링, 최적화)
/sc:improve frontend/src/lib/api.ts --safe

# 문제 해결 및 디버깅
/sc:troubleshoot "API returning 500" --logs server.log

# 테스트 실행 및 커버리지 분석
/sc:test --type unit --coverage
```

---

## 전체 명령어 요약표

| 명령어 | 주요 기능 | 자동 활성화 전문가 | 추천 사용 사례 |
|---|---|---|---|
| `/sc:analyze` | 코드 분석 (품질, 보안, 성능) | 보안/성능 전문가 | 코드베이스 이해, 문제점 탐색 |
| `/sc:build` | 프로젝트 빌드 및 컴파일 | 프론트엔드/백엔드 전문가 | 컴파일, 번들링, 배포 준비 |
| `/sc:implement` | 기능 구현 (컴포넌트, API 등) | 도메인별 전문가 | 신규 기능, 컴포넌트, API, 서비스 개발 |
| `/sc:improve` | 코드 자동 개선 | 품질 전문가 | 리팩토링, 최적화, 품질 향상 |
| `/sc:troubleshoot` | 문제 해결 및 디버깅 | 디버깅 전문가 | 디버깅, 이슈 원인 분석 |
| `/sc:test` | 테스트 실행 및 분석 | QA 전문가 | 테스트 실행, 커버리지 분석 |
| `/sc:document` | 문서 자동 생성 | 문서화 전문가 | README, 코드 주석, 가이드 작성 |
| `/sc:git` | Git 워크플로우 향상 | DevOps 전문가 | 스마트 커밋, 브랜치 관리 |
| `/sc:design` | 시스템 설계 지원 | 아키텍처 전문가 | 아키텍처 설계, API 디자인 |
| `/sc:explain` | 코드 및 개념 설명 | 교육 전문가 | 코드 및 기술 개념 학습 |
| `/sc:cleanup` | 기술 부채 감소 | 리팩토링 전문가 | 미사용 코드 제거, 파일 구조 정리 |
| `/sc:load` | 프로젝트 컨텍스트 로딩 | 분석 전문가 | 프로젝트 구조 및 코드베이스 이해 |
| `/sc:estimate` | 작업량 예측 | 기획 전문가 | 시간/리소스 계획, 복잡도 분석 |
| `/sc:workflow` | PRD 기반 구현 계획 수립 | 워크플로우 시스템 | PRD를 단계별 실행 계획으로 변환 |
| `/sc:index` | 명령어 검색 및 탐색 | 도움말 시스템 | 특정 작업에 적합한 명령어 검색 |

---

## 주요 명령어 상세 가이드

### `/implement`: 기능 구현
**기능**: 새로운 기능, 컴포넌트, API, 서비스 등을 지능적으로 구현합니다.
**사용 시점**:
- 새로운 React 컴포넌트나 Next.js 페이지를 만들 때
- 새로운 NestJS 모듈이나 서비스를 구현할 때
- 테스트 코드를 포함한 기능 개발이 필요할 때

**기본 구문**:
```bash
/sc:implement [구현할 내용]
/sc:implement --type [타입] [이름]
```

**유용한 플래그**:
- `--type component|api|service|feature|module`: 구현할 코드의 종류 지정
- `--framework react|nextjs|nestjs`: 특정 프레임워크 지정
- `--with-tests`: 테스트 코드 함께 생성
- `--safe`: 보수적인(안전한) 방식으로 코드 생성

**Workly 프로젝트 예시**:
```bash
# frontend: 새로운 인증 관련 UI 컴포넌트 생성
/sc:implement --type component AuthForm --framework react --with-tests

# backend: 사용자 프로필 관리를 위한 API 및 서비스 구현
/sc:implement user profile management --type feature --framework nestjs

# shared: 새로운 타입 정의 추가
/sc:implement --type module shared/types/new-feature.types.ts
```

### `/analyze`: 코드 분석
**기능**: 코드 품질, 보안, 성능, 아키텍처를 종합적으로 분석합니다.
**사용 시점**:
- 코드 리뷰 전 잠재적인 문제점을 찾고 싶을 때
- 특정 부분의 성능 병목 현상을 분석할 때
- 보안 취약점을 점검할 때

**기본 구문**:
```bash
/sc:analyze [분석할 경로]
```

**유용한 플래그**:
- `--focus quality|security|performance|architecture`: 분석 초점 지정
- `--depth quick|deep`: 분석 깊이 조절
- `--format report|json`: 결과 포맷 지정

**Workly 프로젝트 예시**:
```bash
# backend: 보안 취약점 심층 분석
/sc:analyze backend/src --focus security --depth deep

# frontend: 성능 관련 분석
/sc:analyze frontend/src/app --focus performance

# 전체 프로젝트: 품질 분석 보고서 생성
/sc:analyze . --focus quality --format report
```

### `/improve`: 코드 개선
**기능**: 코드 품질, 성능, 유지보수성을 체계적으로 개선합니다. (리팩토링)
**사용 시점**:
- 오래되거나 복잡한 코드를 정리할 때
- 성능 최적화가 필요할 때
- 코드 스타일을 일관성 있게 맞추고 싶을 때

**기본 구문**:
```bash
/sc:improve [개선할 파일 또는 경로]
```

**유용한 플래그**:
- `--type quality|performance|style`: 개선 초점 지정
- `--safe`: 위험도가 낮은 변경사항만 적용
- `--preview`: 변경될 내용을 미리보기만 실행 (실제 적용 X)

**Workly 프로젝트 예시**:
```bash
# 특정 파일 개선 전 미리보기
/sc:improve --preview frontend/src/lib/utils.ts

# backend API 코드 성능 위주로 안전하게 개선
/sc:improve --type performance --safe backend/src/modules/tasks/

# 전체 프로젝트 코드 스타일 정리
/sc:improve --type style . --safe
```
**팁**: 적용하기 전에 항상 `--preview` 플래그로 변경 사항을 먼저 확인하는 것이 안전합니다.

### `/test`: 테스트
**기능**: 테스트를 실행하고, 커버리지 리포트를 생성하며, 테스트 품질을 유지합니다.
**사용 시점**:
- 단위/통합/E2E 테스트를 실행할 때
- 코드 변경 후 테스트 커버리지를 확인할 때

**기본 구문**:
```bash
/sc:test
```

**유용한 플래그**:
- `--type unit|integration|e2e|all`: 실행할 테스트 타입 지정
- `--coverage`: 커버리지 리포트 생성
- `--watch`: 파일 변경을 감지하여 자동으로 테스트 실행

**Workly 프로젝트 예시**:
```bash
# frontend 단위 테스트 실행 및 커버리지 확인
/sc:test frontend --type unit --coverage

# backend 통합 테스트 실행
/sc:test backend --type integration

# 특정 컴포넌트 변경사항 감지하며 테스트
/sc:test --watch frontend/src/components/ui/
```

### `/git`: Git 연동
**기능**: 지능적인 커밋 메시지 생성 등 Git 작업을 보조합니다.
**사용 시점**:
- 의미 있는 커밋 메시지를 작성하기 어려울 때
- 브랜치 관리 전략을 적용하고 싶을 때

**기본 구문**:
```bash
/sc:git commit
/sc:git --smart-commit add .
```

**Workly 프로젝트 예시**:
```bash
# 변경사항 스테이징 후 지능적으로 커밋 메시지 생성 및 커밋
git add .
/sc:git --smart-commit

# 커밋 메시지만 생성 (실제 커밋은 직접 실행)
/sc:git --smart-commit "fix: user login bug"
```
**팁**: 생성된 커밋 메시지는 최종 제출 전에 항상 직접 검토하는 것이 좋습니다.
