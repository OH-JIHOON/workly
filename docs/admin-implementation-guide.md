# 워클리 어드민 패널 구현 가이드

## 개요

워클리 어드민 패널의 전체 구현 프로세스를 단계별로 안내하는 가이드입니다. 이 문서는 개발자가 실제로 어드민 패널을 구현할 때 필요한 모든 정보를 제공합니다.

## 📋 구현 준비사항

### 필수 도구 및 라이브러리
```json
{
  "frontend": {
    "framework": "Next.js 14+",
    "language": "TypeScript",
    "styling": "Tailwind CSS",
    "charts": "recharts",
    "forms": "react-hook-form",
    "state": "zustand",
    "http": "axios"
  },
  "backend": {
    "framework": "NestJS",
    "database": "PostgreSQL + TypeORM",
    "auth": "JWT + Passport",
    "cache": "Redis",
    "validation": "class-validator"
  },
  "devops": {
    "docker": "Docker & Docker Compose",
    "monitoring": "Prometheus + Grafana (선택사항)"
  }
}
```

### 프로젝트 구조
```
workly/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/           # 어드민 패널 페이지
│   │   │   │   ├── page.tsx     # 대시보드
│   │   │   │   ├── users/       # 사용자 관리
│   │   │   │   ├── projects/    # 프로젝트 관리
│   │   │   │   ├── content/     # 콘텐츠 관리
│   │   │   │   └── settings/    # 시스템 설정
│   │   │   └── (auth)/          # 기존 사용자 앱
│   │   ├── components/
│   │   │   ├── admin/           # 어드민 전용 컴포넌트
│   │   │   └── ui/              # 공통 UI 컴포넌트
│   │   └── lib/
│   │       ├── admin-api.ts     # 어드민 API 클라이언트
│   │       └── permissions.ts   # 권한 관리
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── admin/           # 어드민 모듈
│   │   │   │   ├── controllers/
│   │   │   │   ├── services/
│   │   │   │   └── guards/
│   │   │   └── auth/            # 기존 인증 모듈 확장
│   │   └── database/
│   │       └── entities/        # 관리자 관련 엔티티
└── shared/
    └── types/
        └── admin.types.ts       # 어드민 타입 정의
```

## 🚀 Phase 1: 기본 인프라 구축 (1주)

### 1.1 백엔드 권한 시스템 구현

#### User 엔티티 확장
```typescript
// backend/src/database/entities/user.entity.ts
export class User {
  // 기존 필드들...
  
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MEMBER,
  })
  role: UserRole;

  @Column('simple-array', { nullable: true })
  adminPermissions?: string[];

  @Column({ nullable: true })
  lastAdminLogin?: Date;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column('simple-array', { nullable: true })
  allowedIPs?: string[];

  // 권한 확인 메서드들 추가
  isAdmin(): boolean {
    return ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'].includes(this.role);
  }

  hasAdminPermission(permission: string): boolean {
    if (this.role === 'SUPER_ADMIN') return true;
    return this.adminPermissions?.includes(permission) || false;
  }
}
```

#### 관리자 가드 구현
```typescript
// backend/src/modules/admin/guards/admin.guard.ts
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user?.isAdmin()) {
      throw new ForbiddenException('관리자 권한이 필요합니다');
    }
    
    return true;
  }
}

// backend/src/modules/admin/guards/permissions.guard.ts
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler()
    );

    if (!requiredPermissions) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredPermissions.every(permission =>
      user.hasAdminPermission(permission)
    );
  }
}
```

### 1.2 프론트엔드 라우팅 및 레이아웃

#### 어드민 레이아웃 컴포넌트
```typescript
// frontend/src/components/admin/AdminLayout.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { redirect } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading } = useAuth();
  
  if (loading) return <AdminLoadingSpinner />;
  
  if (!user?.isAdmin()) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

#### 어드민 루트 페이지
```typescript
// frontend/src/app/admin/page.tsx
import { Metadata } from 'next';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';

export const metadata: Metadata = {
  title: '관리자 대시보드 - Workly',
  description: 'Workly 관리자 패널',
};

export default function AdminPage() {
  return (
    <ProtectedRoute permissions={[]}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
```

### 1.3 API 클라이언트 구현

```typescript
// frontend/src/lib/admin-api.ts
import axios from 'axios';
import { getAuthToken } from '@/lib/auth';

const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/admin',
  timeout: 10000,
});

// 인터셉터 설정
adminApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 또는 권한 없음
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// API 메서드들
export const adminApiService = {
  // 대시보드
  getDashboard: () => adminApi.get('/dashboard'),
  
  // 사용자 관리
  getUsers: (params: any) => adminApi.get('/users', { params }),
  getUser: (id: string) => adminApi.get(`/users/${id}`),
  updateUser: (id: string, data: any) => adminApi.put(`/users/${id}`, data),
  deleteUser: (id: string) => adminApi.delete(`/users/${id}`),
  bulkUserAction: (data: any) => adminApi.post('/users/bulk-action', data),
  
  // 프로젝트 관리
  getProjects: (params: any) => adminApi.get('/projects', { params }),
  getProject: (id: string) => adminApi.get(`/projects/${id}`),
  
  // 시스템 설정
  getSettings: () => adminApi.get('/settings'),
  updateSettings: (data: any) => adminApi.put('/settings', data),
};
```

## 🔧 Phase 2: 핵심 관리 기능 (3주)

### 2.1 사용자 관리 구현

#### 백엔드 컨트롤러
```typescript
// backend/src/modules/admin/controllers/users.controller.ts
@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminGuard, PermissionsGuard)
export class AdminUsersController {
  constructor(private usersService: AdminUsersService) {}

  @Get()
  @RequirePermissions('users:read')
  async getUsers(@Query() query: GetUsersQueryDto) {
    return this.usersService.getUsers(query);
  }

  @Get(':id')
  @RequirePermissions('users:read')
  async getUser(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Put(':id')
  @RequirePermissions('users:update')
  @AuditLog('user_updated')
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: UpdateUserDto
  ) {
    return this.usersService.updateUser(id, updateData);
  }

  @Delete(':id')
  @RequirePermissions('users:delete')
  @AuditLog('user_deleted')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.softDeleteUser(id);
  }

  @Post('bulk-action')
  @RequirePermissions('users:update')
  @AuditLog('users_bulk_action')
  async bulkAction(@Body() actionData: BulkUserActionDto) {
    return this.usersService.performBulkAction(actionData);
  }
}
```

#### 프론트엔드 사용자 목록 페이지
```typescript
// frontend/src/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { AdminTable } from '@/components/admin/AdminTable';
import { UserFilters } from '@/components/admin/UserFilters';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { adminApiService } from '@/lib/admin-api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadUsers();
  }, [pagination.page, pagination.limit, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      
      setUsers(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total
      }));
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      await adminApiService.bulkUserAction({
        userIds: selectedUsers,
        action
      });
      
      setSelectedUsers([]);
      loadUsers();
    } catch (error) {
      console.error('일괄 작업 실패:', error);
    }
  };

  const columns = [
    {
      key: 'name',
      title: '이름',
      sortable: true,
      render: (value: string, record: any) => (
        <div className="flex items-center">
          <img
            src={record.avatar || '/default-avatar.png'}
            alt={value}
            className="w-8 h-8 rounded-full mr-3"
          />
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: '역할',
      render: (value: string) => (
        <StatusBadge status={value} />
      )
    },
    {
      key: 'status',
      title: '상태',
      render: (value: string) => (
        <StatusBadge status={value} />
      )
    },
    {
      key: 'lastLoginAt',
      title: '마지막 로그인',
      render: (value: string) => (
        value ? new Date(value).toLocaleDateString() : '없음'
      )
    },
    {
      key: 'actions',
      title: '작업',
      render: (value: any, record: any) => (
        <UserActions user={record} onUpdate={loadUsers} />
      )
    }
  ];

  const bulkActions = [
    {
      key: 'activate',
      label: '활성화',
      icon: CheckIcon,
      onClick: () => handleBulkAction('activate')
    },
    {
      key: 'deactivate',
      label: '비활성화',
      icon: XMarkIcon,
      onClick: () => handleBulkAction('deactivate')
    },
    {
      key: 'send_email',
      label: '이메일 발송',
      icon: EnvelopeIcon,
      onClick: () => handleBulkAction('send_email')
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
        <PermissionGate permissions="users:create">
          <Button onClick={() => setShowCreateModal(true)}>
            사용자 생성
          </Button>
        </PermissionGate>
      </div>

      <UserFilters 
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters({})}
      />

      {selectedUsers.length > 0 && (
        <BulkActionBar
          selectedCount={selectedUsers.length}
          actions={bulkActions}
          onClearSelection={() => setSelectedUsers([])}
        />
      )}

      <AdminTable
        data={users}
        columns={columns}
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, limit) => setPagination(prev => ({ ...prev, page, limit }))
        }}
        selection={{
          selectedRows: selectedUsers,
          onSelect: setSelectedUsers,
          bulkActions
        }}
      />
    </div>
  );
}
```

### 2.2 대시보드 구현

#### 대시보드 컴포넌트
```typescript
// frontend/src/components/admin/AdminDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { KPICard } from '@/components/admin/KPICard';
import { UserGrowthChart } from '@/components/admin/charts/UserGrowthChart';
import { MetricsChart } from '@/components/admin/charts/MetricsChart';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { adminApiService } from '@/lib/admin-api';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // 5분마다 KPI 데이터 자동 새로고침
    const interval = setInterval(loadKPIs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await adminApiService.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadKPIs = async () => {
    try {
      const response = await adminApiService.getDashboardKPIs();
      setDashboardData(prev => ({ ...prev, kpis: response.data }));
    } catch (error) {
      console.error('KPI 데이터 로드 실패:', error);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <div className="text-sm text-gray-500">
          마지막 업데이트: {new Date(dashboardData.kpis.lastUpdated).toLocaleTimeString()}
        </div>
      </div>

      {/* KPI 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="총 사용자"
          value={dashboardData.kpis.totalUsers.toLocaleString()}
          trend={{
            value: 12,
            direction: 'up',
            period: '지난 주'
          }}
          icon={UsersIcon}
          color="blue"
        />
        <KPICard
          title="활성 사용자"
          value={dashboardData.kpis.activeUsers.toLocaleString()}
          trend={{
            value: 8,
            direction: 'up',
            period: '지난 주'
          }}
          icon={UserCheckIcon}
          color="green"
        />
        <KPICard
          title="진행 중인 프로젝트"
          value={dashboardData.kpis.activeProjects.toLocaleString()}
          trend={{
            value: 3,
            direction: 'down',
            period: '지난 주'
          }}
          icon={FolderIcon}
          color="purple"
        />
        <KPICard
          title="시스템 상태"
          value={dashboardData.kpis.systemHealth === 'healthy' ? '정상' : '경고'}
          icon={ServerIcon}
          color={dashboardData.kpis.systemHealth === 'healthy' ? 'green' : 'yellow'}
        />
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart
          data={dashboardData.charts.userGrowth}
          period="daily"
        />
        <MetricsChart
          data={dashboardData.charts.serverMetrics}
        />
      </div>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">프로젝트 현황</h3>
            </div>
            <div className="p-6">
              <ProjectStatusChart data={dashboardData.charts.projectStatus} />
            </div>
          </div>
        </div>
        
        <RecentActivity activities={dashboardData.recentActivity} />
      </div>
    </div>
  );
}
```

## 🎨 Phase 3: 고급 기능 (2주)

### 3.1 실시간 모니터링

#### WebSocket 연결
```typescript
// frontend/src/hooks/useRealTimeMonitoring.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useRealTimeMonitoring = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL + '/admin', {
      auth: {
        token: getAuthToken()
      }
    });

    newSocket.on('metrics-update', (data) => {
      setMetrics(data);
    });

    newSocket.on('new-alert', (alert) => {
      setAlerts(prev => [alert, ...prev]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { metrics, alerts };
};
```

### 3.2 데이터 시각화 고도화

#### 고급 차트 컴포넌트
```typescript
// frontend/src/components/admin/charts/AdvancedMetricsChart.tsx
interface AdvancedMetricsChartProps {
  data: any[];
  metrics: string[];
  timeRange: 'hour' | 'day' | 'week' | 'month';
}

export const AdvancedMetricsChart: React.FC<AdvancedMetricsChartProps> = ({
  data,
  metrics,
  timeRange
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState(metrics);

  return (
    <BaseChart title="시스템 메트릭스" data={data}>
      <div className="mb-4 flex flex-wrap gap-2">
        {metrics.map(metric => (
          <Button
            key={metric}
            size="sm"
            variant={selectedMetrics.includes(metric) ? 'default' : 'outline'}
            onClick={() => toggleMetric(metric)}
          >
            {metric}
          </Button>
        ))}
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp"
            tickFormatter={(value) => formatTime(value, timeRange)}
          />
          <YAxis />
          <Tooltip content={<MultiMetricTooltip />} />
          <Legend />
          
          {selectedMetrics.map((metric, index) => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={CHART_COLORS[index]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};
```

## ⚡ Phase 4: 최적화 및 테스트 (1주)

### 4.1 성능 최적화

#### 데이터 로딩 최적화
```typescript
// frontend/src/hooks/useAdminData.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApiService } from '@/lib/admin-api';

export const useAdminUsers = (params: any) => {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => adminApiService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
  });
};

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApiService.getDashboard(),
    refetchInterval: 5 * 60 * 1000, // 5분마다 자동 새로고침
  });
};
```

#### 무한 스크롤 구현
```typescript
// frontend/src/hooks/useInfiniteAdminData.ts
import { useInfiniteQuery } from '@tanstack/react-query';

export const useInfiniteAdminUsers = (filters: any) => {
  return useInfiniteQuery({
    queryKey: ['admin-users-infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      adminApiService.getUsers({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
  });
};
```

### 4.2 보안 강화

#### CSP 헤더 설정
```typescript
// frontend/next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline';
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https:;
              connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL};
            `.replace(/\s+/g, ' ').trim()
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ];
  }
};
```

## 🧪 테스트 전략

### 단위 테스트
```typescript
// frontend/src/components/admin/__tests__/AdminTable.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminTable } from '../AdminTable';

describe('AdminTable', () => {
  const mockData = [
    { id: '1', name: 'Test User', email: 'test@test.com', role: 'MEMBER' }
  ];

  const mockColumns = [
    { key: 'name', title: '이름' },
    { key: 'email', title: '이메일' },
    { key: 'role', title: '역할' }
  ];

  it('데이터를 올바르게 렌더링한다', () => {
    render(<AdminTable data={mockData} columns={mockColumns} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
  });

  it('정렬 기능이 동작한다', () => {
    const onSort = jest.fn();
    render(
      <AdminTable 
        data={mockData} 
        columns={mockColumns} 
        onSort={onSort}
      />
    );
    
    fireEvent.click(screen.getByText('이름'));
    expect(onSort).toHaveBeenCalledWith('name', 'asc');
  });
});
```

### E2E 테스트
```typescript
// e2e/admin.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    // 관리자로 로그인
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@workly.com');
    await page.fill('input[type="password"]', 'adminpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('대시보드가 올바르게 로드된다', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('대시보드');
    await expect(page.locator('[data-testid="kpi-cards"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-growth-chart"]')).toBeVisible();
  });

  test('사용자 목록을 조회할 수 있다', async ({ page }) => {
    await page.click('a[href="/admin/users"]');
    await page.waitForURL('/admin/users');
    
    await expect(page.locator('h1')).toContainText('사용자 관리');
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
  });

  test('사용자 정보를 수정할 수 있다', async ({ page }) => {
    await page.goto('/admin/users');
    await page.click('[data-testid="user-edit-button"]:first-child');
    
    await page.fill('input[name="name"]', 'Updated Name');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

## 📊 모니터링 및 알림

### 로깅 설정
```typescript
// backend/src/modules/admin/admin.module.ts
import { Logger } from '@nestjs/common';

@Module({
  // ...
  providers: [
    {
      provide: 'ADMIN_LOGGER',
      useValue: new Logger('AdminModule')
    },
    // ...
  ]
})
export class AdminModule {}
```

### 슬랙 알림 연동
```typescript
// backend/src/modules/admin/services/notification.service.ts
@Injectable()
export class AdminNotificationService {
  private readonly slackWebhook = process.env.SLACK_WEBHOOK_URL;

  async sendAdminAlert(alert: {
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    adminId?: string;
  }) {
    if (!this.slackWebhook) return;

    const color = {
      low: '#36a64f',
      medium: '#ff9800',
      high: '#f44336',
      critical: '#9c27b0'
    }[alert.severity];

    const payload = {
      attachments: [{
        color,
        title: `🚨 Admin Alert: ${alert.type}`,
        text: alert.message,
        fields: [
          {
            title: 'Severity',
            value: alert.severity.toUpperCase(),
            short: true
          },
          {
            title: 'Time',
            value: new Date().toISOString(),
            short: true
          }
        ]
      }]
    };

    try {
      await axios.post(this.slackWebhook, payload);
    } catch (error) {
      console.error('Slack 알림 전송 실패:', error);
    }
  }
}
```

## 🚀 배포 가이드

### Docker 컨테이너화
```dockerfile
# 어드민 패널용 Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --only=production

COPY frontend/ .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

### 환경변수 설정
```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.workly.com
NEXT_PUBLIC_WEBSOCKET_URL=wss://api.workly.com

# 백엔드 환경변수
ADMIN_JWT_SECRET=super-secure-admin-secret
ADMIN_SESSION_TIMEOUT=1800000
ADMIN_ALLOWED_IPS=192.168.1.0/24,10.0.0.0/8
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

## 📈 성공 지표 및 모니터링

### 핵심 지표
- **응답 시간**: API 응답 < 200ms, 페이지 로드 < 2초
- **가용성**: 99.9% 업타임
- **보안**: 무단 접근 시도 0건, 모든 관리 작업 감사 로그 100%
- **사용성**: 관리 작업 완료 시간 50% 단축

### 모니터링 대시보드
- **Grafana**: 시스템 메트릭스, API 성능, 사용자 활동
- **Sentry**: 오류 추적 및 성능 모니터링
- **CloudWatch**: AWS 인프라 모니터링 (배포 시)

---

*이 구현 가이드는 워클리 어드민 패널의 전체 개발 프로세스를 안내합니다. 각 단계를 순서대로 따라하면 완전한 기능의 어드민 패널을 구축할 수 있습니다.*