# 워클리 어드민 패널 설계 문서

## 📋 개요

워클리 앱의 관리자를 위한 웹 기반 어드민 패널 설계 문서입니다. 기존 워클리 앱의 디자인 시스템과 아키텍처를 계승하여 일관성 있는 관리 도구를 제공합니다.

## 🎯 목적 및 목표

### 핵심 목적
- **효율적인 사용자 관리**: 회원 가입부터 계정 관리까지 원스톱 관리
- **콘텐츠 품질 관리**: 프로젝트, 업무, 목표 데이터의 품질 유지
- **시스템 운영 지원**: 성능 모니터링, 오류 추적, 시스템 설정
- **비즈니스 인사이트**: 사용자 행동 분석, 서비스 성장 지표 제공

### 주요 사용자
- **시스템 관리자**: 전체 시스템 관리 권한
- **서비스 매니저**: 콘텐츠 및 사용자 관리 권한
- **고객 지원팀**: 사용자 문의 처리 및 계정 관리

## 🏗️ 시스템 아키텍처

### 전체 구조
```
워클리 생태계
├── 메인 앱 (/)
│   ├── 사용자 인터페이스
│   ├── 프로젝트 협업 도구
│   └── 개인 생산성 도구
├── 어드민 패널 (/admin)
│   ├── 관리자 대시보드
│   ├── 사용자 관리 도구
│   ├── 콘텐츠 관리 시스템
│   └── 시스템 모니터링
└── API 백엔드
    ├── 공통 API (/api/v1/*)
    ├── 관리자 API (/api/admin/*)
    └── 권한 기반 접근 제어
```

### 기술 스택
- **프론트엔드**: Next.js 14 + TypeScript + Tailwind CSS
- **백엔드**: NestJS + TypeORM + PostgreSQL (기존 구조 확장)
- **인증**: JWT + Role-based Access Control
- **데이터 시각화**: Chart.js / Recharts
- **상태 관리**: Zustand (기존과 동일)

## 🎨 디자인 시스템

### 기본 원칙
워클리의 핵심 디자인 원칙을 계승하되, 관리 도구의 특성을 반영:

1. **극도의 간결함**: 정보 밀도는 높이되 시각적 복잡성은 최소화
2. **단일 컬러 시스템**: Primary Blue (#2563eb) 기반 확장
3. **데이터 중심**: 차트, 테이블, 지표가 핵심인 인터페이스

### 확장된 컬러 팔레트
```css
/* 기존 워클리 컬러 */
--primary: #2563eb;        /* Primary Blue */
--primary-hover: #1d4ed8;  /* Primary Hover */
--primary-light: #dbeafe; /* Primary Light */

/* 어드민 전용 확장 컬러 */
--admin-primary: #1e40af;   /* 더 진한 블루 (권위감) */
--success: #059669;         /* 성공/승인 */
--warning: #d97706;         /* 경고/대기 */
--danger: #dc2626;          /* 오류/거부 */
--info: #0284c7;           /* 정보/알림 */

/* 데이터 시각화 */
--chart-1: #2563eb;
--chart-2: #7c3aed;
--chart-3: #dc2626;
--chart-4: #059669;
--chart-5: #d97706;
```

### 레이아웃 시스템
```
Desktop (>= 1024px)
┌─────────────────────────────────────────────────┐
│ Header (h-16): 로고 + 네비 + 사용자 메뉴           │
├─────────────┬───────────────────────────────────┤
│ Sidebar     │ Main Content                      │
│ (w-64)      │ (flex-1)                         │
│             │                                   │
│ - Dashboard │ ┌─────────────────────────────────┐ │
│ - Users     │ │ Page Header                     │ │
│ - Projects  │ ├─────────────────────────────────┤ │
│ - Tasks     │ │                                 │ │
│ - Content   │ │ Page Content                    │ │
│ - Settings  │ │ (cards, tables, charts)         │ │
│ - System    │ │                                 │ │
│             │ └─────────────────────────────────┘ │
└─────────────┴───────────────────────────────────┘

Tablet (768px - 1023px)
┌─────────────────────────────────────────────────┐
│ Header + Mobile Menu Toggle                      │
├─────────────────────────────────────────────────┤
│ Overlay Sidebar (collapsed by default)           │
│ Main Content (full width)                        │
└─────────────────────────────────────────────────┘
```

## 📱 화면별 상세 설계

### 1. 대시보드 (/)
**목적**: 시스템 전반의 상태를 한눈에 파악

```typescript
interface DashboardData {
  kpis: {
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
    completedTasks: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  };
  charts: {
    userGrowth: TimeSeriesData[];
    taskCompletion: TimeSeriesData[];
    projectStatus: PieChartData[];
    serverMetrics: MetricsData;
  };
  recentActivity: ActivityLog[];
}
```

**핵심 컴포넌트**:
- **KPI Cards**: 4x1 그리드로 주요 지표 요약
- **Growth Chart**: 사용자/프로젝트 증가 추이 (라인 차트)
- **Task Completion**: 업무 완료율 트렌드 (영역 차트)
- **System Status**: 서버 상태, API 응답시간 (실시간)
- **Recent Activity**: 최근 24시간 주요 활동 로그

### 2. 사용자 관리 (/users)
**목적**: 모든 사용자 계정의 생성, 수정, 삭제, 권한 관리

```typescript
interface UserManagement {
  users: PaginatedList<UserWithStats>;
  filters: {
    role: UserRole[];
    status: UserStatus[];
    registrationDate: DateRange;
    lastActivity: DateRange;
  };
  bulkActions: {
    changeStatus: (userIds: string[], status: UserStatus) => void;
    sendEmail: (userIds: string[], template: EmailTemplate) => void;
    exportData: (userIds: string[]) => void;
  };
}
```

**핵심 기능**:
- **사용자 목록**: 검색, 다중 필터, 정렬, 페이지네이션
- **사용자 상세**: 프로필 편집, 권한 변경, 활동 이력
- **일괄 작업**: 선택된 사용자들에 대한 상태 변경, 이메일 발송
- **통계**: 가입 추이, 활성도 분석, 권한별 분포
- **내보내기**: Excel/CSV 형태로 사용자 데이터 내보내기

### 3. 프로젝트 관리 (/projects)
**목적**: 모든 프로젝트의 현황 파악 및 품질 관리

```typescript
interface ProjectManagement {
  projects: PaginatedList<ProjectWithMetrics>;
  analytics: {
    successRate: number;
    averageCompletionTime: number;
    popularSkills: SkillStats[];
    teamSizeDistribution: number[];
  };
  moderation: {
    reportedProjects: ProjectReport[];
    pendingApproval: Project[];
  };
}
```

**핵심 기능**:
- **프로젝트 목록**: 상태별 필터링, 진행률 시각화
- **프로젝트 상세**: 멤버 관리, 업무 현황, 채팅 로그 검토
- **품질 관리**: 신고된 프로젝트 검토, 승인 대기 프로젝트
- **분석**: 성공률, 완료 시간, 인기 스킬 통계
- **개입 도구**: 프로젝트 중단, 멤버 제재, 공지사항 전송

### 4. 업무 관리 (/tasks)
**목적**: 플랫폼 내 모든 업무의 품질과 분류 관리

```typescript
interface TaskManagement {
  tasks: PaginatedList<TaskWithContext>;
  categories: {
    uncategorized: number;
    blocked: number;
    overdue: number;
    highPriority: number;
  };
  automation: {
    autoLabeling: boolean;
    duplicateDetection: boolean;
    spamFilter: boolean;
  };
}
```

**핵심 기능**:
- **업무 목록**: 프로젝트별, 사용자별, 상태별 필터링
- **업무 상세**: 내용 검토, 라벨링, 중복 체크
- **자동화 관리**: AI 기반 자동 분류, 스팸 필터링
- **품질 지표**: 완료율, 평균 처리 시간, 난이도 분포
- **이슈 관리**: 신고된 업무, 차단된 업무 처리

### 5. 콘텐츠 관리 (/content)
**목적**: 앱 내 모든 사용자 생성 콘텐츠의 모더레이션

```typescript
interface ContentManagement {
  content: {
    posts: PaginatedList<PostWithFlags>;
    comments: PaginatedList<CommentWithFlags>;
    files: PaginatedList<FileWithMetadata>;
  };
  moderation: {
    reported: ContentReport[];
    flagged: FlaggedContent[];
    pending: PendingContent[];
  };
  policies: ContentPolicy[];
}
```

**핵심 기능**:
- **콘텐츠 목록**: 타입별, 상태별 콘텐츠 브라우징
- **모더레이션 큐**: 신고된 콘텐츠 검토 및 처리
- **자동 필터링**: 부적절한 콘텐츠 자동 탐지
- **정책 관리**: 커뮤니티 가이드라인 및 정책 설정
- **통계**: 콘텐츠 생성 추이, 신고 패턴 분석

### 6. 시스템 설정 (/settings)
**목적**: 앱 전반의 설정과 기능 토글 관리

```typescript
interface SystemSettings {
  app: {
    maintenanceMode: boolean;
    newUserRegistration: boolean;
    projectCreation: boolean;
    fileUpload: boolean;
    maxFileSize: number;
  };
  notifications: {
    templates: EmailTemplate[];
    pushSettings: PushNotificationConfig;
    frequencies: NotificationFrequency[];
  };
  integrations: {
    googleOAuth: OAuthConfig;
    emailService: EmailServiceConfig;
    fileStorage: StorageConfig;
  };
}
```

**핵심 기능**:
- **앱 설정**: 기능 활성화/비활성화, 제한값 설정
- **알림 관리**: 이메일/푸시 템플릿 편집, 발송 스케줄
- **통합 서비스**: OAuth, 이메일, 파일 스토리지 설정
- **보안 설정**: 비밀번호 정책, 세션 만료, 2FA 설정
- **백업 & 복구**: 데이터 백업 스케줄, 복구 지점 관리

### 7. 시스템 모니터링 (/system)
**목적**: 서버 상태, 성능, 오류 모니터링

```typescript
interface SystemMonitoring {
  metrics: {
    server: ServerMetrics;
    database: DatabaseMetrics;
    api: APIMetrics;
    errors: ErrorLog[];
  };
  alerts: {
    active: Alert[];
    history: AlertHistory[];
    rules: AlertRule[];
  };
  logs: {
    application: ApplicationLog[];
    security: SecurityLog[];
    audit: AuditLog[];
  };
}
```

**핵심 기능**:
- **실시간 모니터링**: CPU, 메모리, 디스크, 네트워크 사용률
- **API 성능**: 응답 시간, 처리량, 오류율
- **데이터베이스**: 쿼리 성능, 연결 상태, 용량 사용률
- **오류 추적**: 오류 로그, 스택 트레이스, 발생 빈도
- **알림 설정**: 임계값 기반 자동 알림, 에스컬레이션 규칙

## 🔐 권한 및 보안

### 권한 체계
```typescript
enum AdminRole {
  SUPER_ADMIN = 'super_admin',    // 모든 권한
  ADMIN = 'admin',                // 사용자/콘텐츠 관리
  MODERATOR = 'moderator',        // 콘텐츠 모더레이션만
  SUPPORT = 'support',            // 사용자 지원 (읽기 전용 + 기본 사용자 관리)
}

interface AdminPermissions {
  users: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    changeRole: boolean;
  };
  content: {
    read: boolean;
    moderate: boolean;
    delete: boolean;
  };
  system: {
    read: boolean;
    configure: boolean;
    maintenance: boolean;
  };
}
```

### 보안 조치
- **2FA 필수**: 모든 관리자 계정은 2단계 인증 필수
- **IP 제한**: 허용된 IP 대역에서만 접근 가능
- **세션 관리**: 30분 무활동 시 자동 로그아웃
- **감사 로그**: 모든 관리 작업 로그 기록 및 추적
- **데이터 마스킹**: 민감한 개인정보 마스킹 처리

## 📊 데이터 모델

### 관리자 전용 엔티티
```typescript
// 관리자 계정 (기존 User 엔티티 확장)
interface AdminUser extends User {
  adminRole: AdminRole;
  permissions: AdminPermissions;
  lastAdminLogin: Date;
  failedLoginAttempts: number;
  twoFactorEnabled: boolean;
  ipWhitelist: string[];
}

// 감사 로그
interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: 'user' | 'project' | 'task' | 'system';
  targetId?: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// 시스템 설정
interface SystemConfig {
  id: string;
  key: string;
  value: any;
  type: 'boolean' | 'string' | 'number' | 'json';
  description: string;
  category: string;
  updatedBy: string;
  updatedAt: Date;
}

// 콘텐츠 신고
interface ContentReport {
  id: string;
  reporterId: string;
  contentType: 'project' | 'task' | 'comment';
  contentId: string;
  reason: ReportReason;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: Date;
  action?: 'no_action' | 'warning' | 'content_removed' | 'user_suspended';
  createdAt: Date;
}
```

## 🚀 구현 로드맵

### Phase 1: 기본 인프라 (2주)
- [x] 권한 기반 라우팅 시스템
- [x] 관리자 레이아웃 컴포넌트
- [x] 대시보드 기본 구조
- [x] 사용자 목록/상세 화면

### Phase 2: 핵심 관리 기능 (3주)
- [ ] 프로젝트 관리 화면
- [ ] 업무 관리 시스템
- [ ] 콘텐츠 모더레이션 도구
- [ ] 시스템 설정 인터페이스

### Phase 3: 고급 기능 (2주)
- [ ] 실시간 모니터링 대시보드
- [ ] 데이터 시각화 및 분석
- [ ] 알림 및 자동화 시스템
- [ ] 감사 로그 및 보안 강화

### Phase 4: 최적화 및 테스트 (1주)
- [ ] 성능 최적화
- [ ] 사용성 테스트
- [ ] 보안 검토
- [ ] 문서화 완료

## 📈 성공 지표

### 운영 효율성
- **관리 작업 처리 시간**: 50% 단축
- **오류 대응 시간**: 24시간 → 2시간
- **사용자 문의 해결률**: 95% 이상

### 시스템 안정성
- **서버 가동률**: 99.9% 이상
- **API 응답 시간**: 평균 200ms 이하
- **보안 인시던트**: 0건

### 데이터 품질
- **부적절한 콘텐츠 탐지율**: 95% 이상
- **스팸 필터링 정확도**: 98% 이상
- **사용자 만족도**: 4.5/5.0 이상

---

*이 문서는 워클리 어드민 패널의 설계 명세서입니다. 구현 과정에서 사용자 피드백과 기술적 제약사항에 따라 조정될 수 있습니다.*