# 워클리 어드민 API 설계

## 개요

워클리 어드민 패널을 위한 RESTful API 설계 문서입니다. 기존 NestJS 백엔드 구조를 확장하여 관리자 전용 엔드포인트를 제공합니다.

## 기본 구조

### API 베이스 경로
```
/api/admin/*  - 모든 관리자 API
```

### 인증 및 권한
- **인증**: JWT 토큰 기반 (기존과 동일)
- **권한**: Role-based Access Control (RBAC)
- **미들웨어**: AdminGuard, PermissionGuard

## API 엔드포인트 설계

### 1. 대시보드 API

#### GET /api/admin/dashboard
**목적**: 대시보드 메인 데이터 조회

**권한**: `admin:read`

**응답**:
```typescript
{
  "success": true,
  "data": {
    "kpis": {
      "totalUsers": 1245,
      "activeUsers": 892,
      "newUsersThisWeek": 47,
      "totalProjects": 156,
      "activeProjects": 89,
      "completedProjects": 67,
      "totalTasks": 2341,
      "completedTasks": 1876,
      "systemHealth": "healthy",
      "lastUpdated": "2025-08-04T10:30:00Z"
    },
    "charts": {
      "userGrowth": [...],
      "taskCompletion": [...],
      "projectStatus": [...],
      "serverMetrics": {...}
    },
    "recentActivity": [...]
  }
}
```

#### GET /api/admin/dashboard/kpis
**목적**: KPI 데이터만 개별 조회 (실시간 업데이트용)

#### GET /api/admin/dashboard/activity
**목적**: 최근 활동 로그 조회

**쿼리 파라미터**:
- `limit`: 조회할 개수 (기본: 20)
- `type`: 활동 타입 필터
- `since`: 특정 시점 이후 활동

### 2. 사용자 관리 API

#### GET /api/admin/users
**목적**: 사용자 목록 조회 (페이지네이션, 필터링, 검색)

**권한**: `users:read`

**쿼리 파라미터**:
```typescript
{
  page?: number;
  limit?: number;
  search?: string;           // 이름, 이메일 검색
  role?: string[];          // 역할 필터
  status?: string[];        // 상태 필터
  registrationDate?: {      // 가입일 범위
    start: string;
    end: string;
  };
  lastActivity?: {          // 마지막 활동일 범위
    start: string;
    end: string;
  };
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
}
```

**응답**:
```typescript
{
  "success": true,
  "data": UserWithStats[],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1245,
    "totalPages": 63,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### GET /api/admin/users/:id
**목적**: 특정 사용자 상세 정보 조회

**권한**: `users:read`

#### PUT /api/admin/users/:id
**목적**: 사용자 정보 수정

**권한**: `users:update`

**요청 바디**:
```typescript
{
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  profile?: Partial<UserProfile>;
  preferences?: Partial<UserPreferences>;
}
```

#### DELETE /api/admin/users/:id
**목적**: 사용자 계정 삭제 (soft delete)

**권한**: `users:delete`

#### POST /api/admin/users/bulk-action
**목적**: 선택된 사용자들에 대한 일괄 작업

**권한**: `users:update`

**요청 바디**:
```typescript
{
  userIds: string[];
  action: 'activate' | 'deactivate' | 'suspend' | 'delete' | 'send_email';
  params?: {
    emailTemplate?: string;
    suspensionReason?: string;
    duration?: number;
  };
}
```

#### GET /api/admin/users/stats
**목적**: 사용자 관련 통계 데이터

**응답**:
```typescript
{
  "success": true,
  "data": {
    "totalUsers": 1245,
    "activeUsers": 892,
    "usersByRole": {
      "admin": 3,
      "manager": 12,
      "member": 1230
    },
    "usersByStatus": {
      "active": 892,
      "inactive": 245,
      "suspended": 8
    },
    "growthTrend": TimeSeriesData[],
    "registrationSources": {
      "email": 67,
      "google": 33
    }
  }
}
```

### 3. 프로젝트 관리 API

#### GET /api/admin/projects
**목적**: 프로젝트 목록 조회

**권한**: `projects:read`

**쿼리 파라미터**:
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  status?: string[];
  ownerId?: string;
  createdDate?: { start: string; end: string; };
  minMembers?: number;
  maxMembers?: number;
  hasRiskFlags?: boolean;
  sortBy?: 'name' | 'createdAt' | 'progress' | 'memberCount';
  sortOrder?: 'asc' | 'desc';
}
```

#### GET /api/admin/projects/:id
**목적**: 프로젝트 상세 정보 조회

#### PUT /api/admin/projects/:id
**목적**: 프로젝트 정보 수정 (관리자 개입)

**권한**: `projects:moderate`

#### POST /api/admin/projects/:id/close
**목적**: 프로젝트 강제 종료

**권한**: `projects:moderate`

#### GET /api/admin/projects/analytics
**목적**: 프로젝트 분석 데이터

**응답**:
```typescript
{
  "success": true,
  "data": {
    "successRate": 73.5,
    "averageCompletionTime": 45.2,
    "popularSkills": [...],
    "teamSizeDistribution": [...],
    "monthlyTrends": {...}
  }
}
```

### 4. 업무 관리 API

#### GET /api/admin/tasks
**목적**: 업무 목록 조회

**권한**: `tasks:read`

#### GET /api/admin/tasks/categories
**목적**: 업무 카테고리별 통계

#### GET /api/admin/tasks/automation
**목적**: 자동화 설정 조회

#### PUT /api/admin/tasks/automation
**목적**: 자동화 설정 변경

### 5. 콘텐츠 관리 API

#### GET /api/admin/content/reports
**목적**: 콘텐츠 신고 목록 조회

**권한**: `content:read`

**쿼리 파라미터**:
```typescript
{
  page?: number;
  limit?: number;
  status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  contentType?: 'project' | 'task' | 'comment' | 'message';
  reason?: ReportReason;
  reportedDate?: { start: string; end: string; };
  sortBy?: 'createdAt' | 'status' | 'reason';
  sortOrder?: 'asc' | 'desc';
}
```

#### GET /api/admin/content/reports/:id
**목적**: 특정 신고 상세 조회

#### POST /api/admin/content/reports/:id/action
**목적**: 신고에 대한 조치 실행

**권한**: `content:moderate`

**요청 바디**:
```typescript
{
  action: 'dismiss' | 'warn_user' | 'remove_content' | 'suspend_user';
  reason: string;
  duration?: number;        // 정지 기간 (일)
  notifyUser: boolean;
}
```

### 6. 시스템 설정 API

#### GET /api/admin/settings
**목적**: 시스템 설정 전체 조회

**권한**: `system:read`

#### PUT /api/admin/settings
**목적**: 시스템 설정 업데이트

**권한**: `system:configure`

#### GET /api/admin/settings/email-templates
**목적**: 이메일 템플릿 목록 조회

#### POST /api/admin/settings/email-templates
**목적**: 새 이메일 템플릿 생성

#### PUT /api/admin/settings/email-templates/:id
**목적**: 이메일 템플릿 수정

#### POST /api/admin/settings/test-email
**목적**: 테스트 이메일 발송

### 7. 시스템 모니터링 API

#### GET /api/admin/monitoring/metrics
**목적**: 실시간 시스템 메트릭 조회

**권한**: `system:monitoring`

**응답**:
```typescript
{
  "success": true,
  "data": {
    "server": ServerMetrics,
    "database": DatabaseMetrics,
    "api": APIMetrics,
    "timestamp": "2025-08-04T10:30:00Z"
  }
}
```

#### GET /api/admin/monitoring/errors
**목적**: 오류 로그 조회

**쿼리 파라미터**:
```typescript
{
  page?: number;
  limit?: number;
  level?: 'error' | 'warning' | 'info';
  since?: string;
  resolved?: boolean;
  search?: string;
}
```

#### POST /api/admin/monitoring/errors/:id/resolve
**목적**: 오류 해결 표시

#### GET /api/admin/monitoring/alerts
**목적**: 활성 알림 목록 조회

#### POST /api/admin/monitoring/alerts/:id/acknowledge
**목적**: 알림 확인 처리

### 8. 감사 로그 API

#### GET /api/admin/audit-logs
**목적**: 감사 로그 조회

**권한**: `system:read`

**쿼리 파라미터**:
```typescript
{
  page?: number;
  limit?: number;
  adminId?: string;
  action?: string;
  targetType?: 'user' | 'project' | 'task' | 'system' | 'settings';
  dateRange?: { start: string; end: string; };
  success?: boolean;
}
```

#### GET /api/admin/audit-logs/export
**목적**: 감사 로그 내보내기 (CSV/Excel)

## 보안 및 권한 관리

### 인증 미들웨어
```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  // 모든 엔드포인트에 JWT 인증 + 관리자 권한 필요
}
```

### 권한 데코레이터
```typescript
@Get('users')
@RequirePermissions('users:read')
async getUsers() {
  // users:read 권한이 있는 관리자만 접근 가능
}

@Put('users/:id')
@RequirePermissions('users:update')
async updateUser() {
  // users:update 권한이 있는 관리자만 접근 가능
}
```

### 감사 로그 데코레이터
```typescript
@Put('users/:id')
@AuditLog('user_updated')
async updateUser(@Param('id') id: string, @Body() updateData: any) {
  // 모든 변경 사항이 자동으로 감사 로그에 기록됨
}
```

## 에러 처리

### 표준 에러 응답
```typescript
{
  "success": false,
  "message": "사용자를 찾을 수 없습니다.",
  "code": "USER_NOT_FOUND",
  "errors": [
    {
      "field": "userId",
      "message": "유효하지 않은 사용자 ID입니다."
    }
  ]
}
```

### HTTP 상태 코드
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `409`: 충돌 (중복 등)
- `422`: 검증 실패
- `500`: 서버 오류

## 성능 최적화

### 캐싱 전략
- **Redis**: KPI 데이터, 통계 정보 (5분 캐시)
- **메모리**: 시스템 설정 (1분 캐시)
- **HTTP**: 정적 데이터 (24시간 캐시)

### 페이지네이션
```typescript
// 모든 목록 API에 기본 페이지네이션 적용
{
  page: 1,        // 기본값
  limit: 20,      // 기본값, 최대 100
}
```

### 데이터베이스 최적화
- 인덱스: 자주 필터링되는 컬럼에 복합 인덱스
- 조인: 필요한 경우만 관련 데이터 포함
- 집계: 복잡한 통계는 배경 작업으로 미리 계산

## API 문서화

### Swagger 설정
```typescript
@ApiTags('Admin - Users')
@ApiOperation({ summary: '사용자 목록 조회' })
@ApiQuery({ name: 'page', required: false, type: Number })
@ApiQuery({ name: 'limit', required: false, type: Number })
@ApiResponse({ status: 200, description: '성공', type: PaginatedUsersResponse })
@ApiResponse({ status: 403, description: '권한 없음' })
```

### API 버전 관리
- 현재: `/api/admin/v1/*`
- 향후 버전 추가 시: `/api/admin/v2/*`

---

*이 API 설계는 워클리 어드민 패널의 백엔드 구현을 위한 명세서입니다. 실제 구현 과정에서 성능과 보안 요구사항에 따라 조정될 수 있습니다.*