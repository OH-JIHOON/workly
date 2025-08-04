# 워클리 어드민 권한 관리 시스템 (RBAC) 설계

## 개요

워클리 어드민 패널의 Role-Based Access Control (RBAC) 시스템 설계입니다. 세분화된 권한 관리를 통해 보안성과 운영 효율성을 동시에 확보합니다.

## 권한 체계 구조

### 1. 역할 계층 구조
```
SUPER_ADMIN (최고 관리자)
├── 모든 권한 보유
├── 다른 관리자 계정 생성/삭제
└── 시스템 설정 변경

ADMIN (관리자)  
├── 사용자 관리 (생성/수정/삭제)
├── 콘텐츠 관리 (모든 프로젝트/업무)
├── 시스템 모니터링 (읽기)
└── 보고서 생성

MODERATOR (모더레이터)
├── 콘텐츠 검토 및 승인
├── 신고 처리
├── 사용자 경고/제재
└── 커뮤니티 가이드라인 관리

SUPPORT (고객 지원)
├── 사용자 문의 처리
├── 계정 문제 해결 (제한적)
├── 데이터 조회 (읽기 전용)
└── 기본 사용자 관리
```

### 2. 권한 매트릭스
```typescript
interface PermissionMatrix {
  [role: string]: {
    users: {
      read: boolean;
      create: boolean;
      update: boolean;
      delete: boolean;
      changeRole: boolean;
      viewSensitive: boolean;
    };
    content: {
      read: boolean;
      moderate: boolean;
      delete: boolean;
      featured: boolean;
    };
    projects: {
      read: boolean;
      moderate: boolean;
      close: boolean;
      featured: boolean;
      viewPrivate: boolean;
    };
    system: {
      read: boolean;
      configure: boolean;
      maintenance: boolean;
      monitoring: boolean;
      backup: boolean;
    };
    reports: {
      view: boolean;
      export: boolean;
      create: boolean;
    };
    audit: {
      view: boolean;
      export: boolean;
    };
  };
}

const PERMISSION_MATRIX: PermissionMatrix = {
  SUPER_ADMIN: {
    users: { read: true, create: true, update: true, delete: true, changeRole: true, viewSensitive: true },
    content: { read: true, moderate: true, delete: true, featured: true },
    projects: { read: true, moderate: true, close: true, featured: true, viewPrivate: true },
    system: { read: true, configure: true, maintenance: true, monitoring: true, backup: true },
    reports: { view: true, export: true, create: true },
    audit: { view: true, export: true }
  },
  ADMIN: {
    users: { read: true, create: true, update: true, delete: true, changeRole: false, viewSensitive: true },
    content: { read: true, moderate: true, delete: true, featured: true },
    projects: { read: true, moderate: true, close: true, featured: true, viewPrivate: true },
    system: { read: true, configure: false, maintenance: false, monitoring: true, backup: false },
    reports: { view: true, export: true, create: true },
    audit: { view: true, export: false }
  },
  MODERATOR: {
    users: { read: true, create: false, update: true, delete: false, changeRole: false, viewSensitive: false },
    content: { read: true, moderate: true, delete: true, featured: false },
    projects: { read: true, moderate: true, close: false, featured: false, viewPrivate: false },
    system: { read: false, configure: false, maintenance: false, monitoring: false, backup: false },
    reports: { view: true, export: false, create: false },
    audit: { view: false, export: false }
  },
  SUPPORT: {
    users: { read: true, create: false, update: true, delete: false, changeRole: false, viewSensitive: false },
    content: { read: true, moderate: false, delete: false, featured: false },
    projects: { read: true, moderate: false, close: false, featured: false, viewPrivate: false },
    system: { read: false, configure: false, maintenance: false, monitoring: false, backup: false },
    reports: { view: true, export: false, create: false },
    audit: { view: false, export: false }
  }
};
```

## 백엔드 구현

### 1. 권한 검증 데코레이터
```typescript
// permissions.decorator.ts
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

// permissions.guard.ts
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler()
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return this.hasPermissions(user, requiredPermissions);
  }

  private hasPermissions(user: any, permissions: string[]): boolean {
    const userPermissions = this.getUserPermissions(user.role);
    
    return permissions.every(permission => {
      const [resource, action] = permission.split(':');
      return userPermissions[resource]?.[action] === true;
    });
  }

  private getUserPermissions(role: string) {
    return PERMISSION_MATRIX[role] || {};
  }
}
```

### 2. 관리자 인증 가드
```typescript
// admin.guard.ts
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 기본 사용자는 어드민 패널 접근 불가
    const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'];
    return adminRoles.includes(user.role);
  }
}
```

### 3. 컨트롤러 적용 예시
```typescript
@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminGuard, PermissionsGuard)
export class AdminUsersController {
  @Get()
  @RequirePermissions('users:read')
  async getUsers(@Query() query: GetUsersDto) {
    return this.usersService.getUsers(query);
  }

  @Post()
  @RequirePermissions('users:create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Put(':id')
  @RequirePermissions('users:update')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @RequirePermissions('users:delete')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Put(':id/role')
  @RequirePermissions('users:changeRole')
  async changeUserRole(
    @Param('id') id: string,
    @Body() changeRoleDto: ChangeRoleDto
  ) {
    return this.usersService.changeUserRole(id, changeRoleDto.role);
  }
}
```

### 4. 감사 로그 데코레이터
```typescript
// audit-log.decorator.ts
export const AuditLog = (action: string) =>
  SetMetadata('auditAction', action);

// audit-log.interceptor.ts
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const action = this.reflector.get<string>('auditAction', context.getHandler());
    
    if (!action) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return next.handle().pipe(
      tap((result) => {
        this.auditService.log({
          adminId: user.id,
          adminName: user.name,
          action,
          targetType: this.extractTargetType(context),
          targetId: this.extractTargetId(request),
          changes: this.extractChanges(request, result),
          ipAddress: request.ip,
          userAgent: request.get('User-Agent'),
          timestamp: new Date(),
          success: true
        });
      }),
      catchError((error) => {
        this.auditService.log({
          adminId: user.id,
          adminName: user.name,
          action,
          targetType: this.extractTargetType(context),
          targetId: this.extractTargetId(request),
          ipAddress: request.ip,
          userAgent: request.get('User-Agent'),
          timestamp: new Date(),
          success: false,
          errorMessage: error.message
        });
        throw error;
      })
    );
  }
}
```

## 프론트엔드 구현

### 1. 권한 컨텍스트
```typescript
// hooks/usePermissions.ts
interface PermissionsContextType {
  permissions: AdminPermissions;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const { user } = useAuth();
  const permissions = getUserPermissions(user?.role);

  const hasPermission = useCallback((permission: string) => {
    const [resource, action] = permission.split(':');
    return permissions[resource]?.[action] === true;
  }, [permissions]);

  const hasAnyPermission = useCallback((perms: string[]) => {
    return perms.some(hasPermission);
  }, [hasPermission]);

  const hasAllPermissions = useCallback((perms: string[]) => {
    return perms.every(hasPermission);
  }, [hasPermission]);

  return (
    <PermissionsContext.Provider value={{
      permissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions
    }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionsProvider');
  }
  return context;
};
```

### 2. 권한 기반 컴포넌트
```typescript
// components/PermissionGate.tsx
interface PermissionGateProps {
  permissions: string | string[];
  require?: 'any' | 'all';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permissions,
  require = 'any',
  fallback = null,
  children
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
  
  let hasAccess = false;
  if (require === 'all') {
    hasAccess = hasAllPermissions(permissionArray);
  } else {
    hasAccess = hasAnyPermission(permissionArray);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// 사용 예시
<PermissionGate permissions="users:create">
  <Button onClick={handleCreateUser}>
    사용자 생성
  </Button>
</PermissionGate>

<PermissionGate 
  permissions={['users:update', 'users:delete']}
  require="any"
  fallback={<span>권한이 없습니다</span>}
>
  <UserActions user={user} />
</PermissionGate>
```

### 3. 보호된 라우트
```typescript
// components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  permissions: string | string[];
  require?: 'any' | 'all';
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  permissions,
  require = 'any',
  children
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  const router = useRouter();

  const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
  
  let hasAccess = false;
  if (require === 'all') {
    hasAccess = hasAllPermissions(permissionArray);
  } else {
    hasAccess = hasAnyPermission(permissionArray);
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            접근 권한이 없습니다
          </h2>
          <p className="text-gray-600 mb-4">
            이 페이지에 접근할 권한이 없습니다.
          </p>
          <Button onClick={() => router.back()}>
            이전 페이지로
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
```

### 4. 네비게이션 필터링
```typescript
// components/AdminSidebar.tsx
const AdminSidebar: React.FC = () => {
  const { hasPermission } = usePermissions();

  const menuItems = [
    { 
      icon: ChartBarIcon, 
      label: '대시보드', 
      href: '/admin',
      permissions: [] // 모든 관리자 접근 가능
    },
    { 
      icon: UsersIcon, 
      label: '사용자 관리', 
      href: '/admin/users',
      permissions: ['users:read']
    },
    { 
      icon: FolderIcon, 
      label: '프로젝트 관리', 
      href: '/admin/projects',
      permissions: ['projects:read']
    },
    { 
      icon: ShieldCheckIcon, 
      label: '콘텐츠 관리', 
      href: '/admin/content',
      permissions: ['content:read']
    },
    { 
      icon: CogIcon, 
      label: '시스템 설정', 
      href: '/admin/settings',
      permissions: ['system:configure']
    },
    { 
      icon: ServerIcon, 
      label: '모니터링', 
      href: '/admin/monitoring',
      permissions: ['system:monitoring']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.permissions.length === 0 || 
    item.permissions.some(permission => hasPermission(permission))
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <nav className="mt-8">
        {filteredMenuItems.map((item) => (
          <SidebarItem key={item.href} {...item} />
        ))}
      </nav>
    </aside>
  );
};
```

## 보안 강화 조치

### 1. 세션 관리
```typescript
// 관리자 세션은 더 짧은 만료 시간
const ADMIN_SESSION_TIMEOUT = 30 * 60 * 1000; // 30분

// 민감한 작업 시 재인증 요구
interface SensitiveActionProps {
  onConfirm: () => void;
  action: string;
}

const SensitiveActionConfirm: React.FC<SensitiveActionProps> = ({
  onConfirm,
  action
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await verifyAdminPassword(password);
      onConfirm();
    } catch (error) {
      // 오류 처리
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="작업 확인">
      <p className="mb-4">
        <strong>{action}</strong> 작업을 수행하시겠습니까?
      </p>
      <Input
        type="password"
        placeholder="현재 비밀번호를 입력하세요"
        value={password}
        onChange={setPassword}
      />
      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="outline">취소</Button>
        <Button onClick={handleConfirm} loading={loading}>
          확인
        </Button>
      </div>
    </Modal>
  );
};
```

### 2. IP 제한
```typescript
// ip-restriction.guard.ts
@Injectable()
export class IpRestrictionGuard implements CanActivate {
  private readonly allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',') || [];

  canActivate(context: ExecutionContext): boolean {
    if (this.allowedIPs.length === 0) {
      return true; // IP 제한 비활성화
    }

    const request = context.switchToHttp().getRequest();
    const clientIp = this.getClientIp(request);

    return this.allowedIPs.some(allowedIp => 
      this.isIpInRange(clientIp, allowedIp)
    );
  }

  private getClientIp(request: any): string {
    return request.headers['x-forwarded-for'] || 
           request.connection.remoteAddress || 
           request.socket.remoteAddress;
  }

  private isIpInRange(ip: string, range: string): boolean {
    // IP 범위 검증 로직
    if (range.includes('/')) {
      // CIDR 표기법 처리
      return this.isIpInCidr(ip, range);
    }
    return ip === range;
  }
}
```

### 3. 2FA (Two-Factor Authentication)
```typescript
// 2FA 필수 체크
@Injectable()
export class TwoFactorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // SUPER_ADMIN과 ADMIN은 2FA 필수
    const requiresTwoFactor = ['SUPER_ADMIN', 'ADMIN'].includes(user.role);
    
    if (requiresTwoFactor && !user.twoFactorEnabled) {
      throw new UnauthorizedException('2단계 인증이 필요합니다');
    }

    return true;
  }
}
```

## 모니터링 및 알림

### 1. 권한 변경 알림
```typescript
// 권한 변경 시 자동 알림
@EventPattern('admin.role.changed')
async handleRoleChanged(data: { userId: string; oldRole: string; newRole: string; changedBy: string }) {
  // 슬랙, 이메일 등으로 알림
  await this.notificationService.sendAdminAlert({
    type: 'role_changed',
    message: `사용자 ${data.userId}의 권한이 ${data.oldRole}에서 ${data.newRole}로 변경되었습니다.`,
    changedBy: data.changedBy,
    severity: 'high'
  });
}
```

### 2. 비정상 접근 탐지
```typescript
// 비정상 접근 패턴 감지
@Injectable()
export class AnomalyDetectionService {
  async detectSuspiciousActivity(adminId: string, action: string, context: any) {
    const recentActions = await this.auditService.getRecentActions(adminId, 24); // 24시간
    
    // 단시간 내 대량 작업
    if (recentActions.length > 100) {
      await this.alertService.sendAlert({
        type: 'bulk_actions',
        adminId,
        message: '24시간 내 100회 이상의 관리 작업이 감지되었습니다.'
      });
    }
    
    // 비정상 시간대 접근
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      await this.alertService.sendAlert({
        type: 'off_hours_access',
        adminId,
        message: '업무 시간 외 관리자 접근이 감지되었습니다.'
      });
    }
  }
}
```

---

*이 RBAC 시스템은 워클리 어드민 패널의 보안과 운영 효율성을 보장하는 핵심 시스템입니다. 모든 관리 작업은 적절한 권한 검증과 감사 로그를 통해 추적 가능합니다.*