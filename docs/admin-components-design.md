# 워클리 어드민 UI 컴포넌트 설계

## 개요

워클리 어드민 패널을 위한 UI 컴포넌트 라이브러리 설계입니다. 기존 워클리 디자인 시스템을 계승하되, 관리 도구의 특성에 맞게 확장된 컴포넌트들을 정의합니다.

## 컴포넌트 아키텍처

### 계층 구조
```
Admin Components
├── Layouts (페이지 레이아웃)
├── Navigation (네비게이션)
├── DataDisplay (데이터 표시)
├── Forms (양식 입력)
├── Feedback (피드백)
├── Charts (데이터 시각화)
└── Common (공통 컴포넌트)
```

### 네이밍 컨벤션
- 어드민 전용 컴포넌트: `Admin` 접두사 (`AdminTable`, `AdminCard`)
- 기존 컴포넌트 확장: `Enhanced` 접두사 (`EnhancedCard`, `EnhancedModal`)
- 데이터 시각화: `Chart` 접미사 (`UserGrowthChart`, `MetricsChart`)

## 1. 레이아웃 컴포넌트

### AdminLayout
```typescript
interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  sidebar?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  subtitle,
  breadcrumbs,
  actions,
  sidebar = true
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        {sidebar && <AdminSidebar />}
        <main className="flex-1 p-6">
          <AdminPageHeader 
            title={title}
            subtitle={subtitle}
            breadcrumbs={breadcrumbs}
            actions={actions}
          />
          <div className="mt-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
```

### AdminSidebar
```typescript
interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed = false,
  onToggle
}) => {
  const menuItems = [
    { icon: ChartBarIcon, label: '대시보드', href: '/admin' },
    { icon: UsersIcon, label: '사용자 관리', href: '/admin/users' },
    { icon: FolderIcon, label: '프로젝트 관리', href: '/admin/projects' },
    { icon: CheckSquareIcon, label: '업무 관리', href: '/admin/tasks' },
    { icon: ShieldCheckIcon, label: '콘텐츠 관리', href: '/admin/content' },
    { icon: CogIcon, label: '시스템 설정', href: '/admin/settings' },
    { icon: ServerIcon, label: '모니터링', href: '/admin/monitoring' },
  ];

  return (
    <aside className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* 사이드바 내용 */}
    </aside>
  );
};
```

## 2. 데이터 표시 컴포넌트

### AdminTable
```typescript
interface AdminTableColumn<T> {
  key: keyof T;
  title: string;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
}

interface AdminTableProps<T> {
  data: T[];
  columns: AdminTableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationProps;
  selection?: {
    selectedRows: string[];
    onSelect: (keys: string[]) => void;
    bulkActions?: BulkAction[];
  };
  filters?: FilterConfig[];
  sorting?: SortConfig;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
}

const AdminTable = <T extends { id: string }>({
  data,
  columns,
  loading,
  pagination,
  selection,
  filters,
  sorting,
  onSort
}: AdminTableProps<T>) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* 테이블 헤더 (필터, 검색, 액션) */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {filters && <AdminTableFilters filters={filters} />}
            <AdminTableSearch onSearch={onSearch} />
          </div>
          {selection?.bulkActions && (
            <AdminBulkActions 
              selectedCount={selection.selectedRows.length}
              actions={selection.bulkActions}
            />
          )}
        </div>
      </div>
      
      {/* 테이블 본체 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {selection && (
                <th className="px-4 py-3 text-left">
                  <Checkbox 
                    checked={selection.selectedRows.length === data.length}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th key={column.key as string} className="px-4 py-3 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {column.title}
                    </span>
                    {column.sortable && (
                      <SortButton 
                        field={column.key as string}
                        current={sorting}
                        onSort={onSort}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((record) => (
              <AdminTableRow 
                key={record.id}
                record={record}
                columns={columns}
                selected={selection?.selectedRows.includes(record.id)}
                onSelect={() => handleRowSelect(record.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 페이지네이션 */}
      {pagination && (
        <div className="px-4 py-3 border-t border-gray-200">
          <AdminPagination {...pagination} />
        </div>
      )}
    </div>
  );
};
```

### KPICard
```typescript
interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period: string;
  };
  icon?: React.ComponentType<any>;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color = 'blue',
  loading
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100',
  };

  if (loading) {
    return <KPICardSkeleton />;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={cn("p-3 rounded-lg", colorClasses[color])}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center">
          <div className={cn(
            "flex items-center text-sm font-medium",
            trend.direction === 'up' ? 'text-green-600' : 
            trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
          )}>
            {trend.direction === 'up' && <ArrowUpIcon className="w-4 h-4 mr-1" />}
            {trend.direction === 'down' && <ArrowDownIcon className="w-4 h-4 mr-1" />}
            {Math.abs(trend.value)}%
          </div>
          <span className="text-sm text-gray-500 ml-2">
            vs {trend.period}
          </span>
        </div>
      )}
    </div>
  );
};
```

### StatusBadge
```typescript
interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'default',
  size = 'md'
}) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      active: { color: 'green', label: '활성' },
      inactive: { color: 'gray', label: '비활성' },
      pending: { color: 'yellow', label: '보류' },
      suspended: { color: 'red', label: '정지' },
      completed: { color: 'green', label: '완료' },
      in_progress: { color: 'blue', label: '진행중' },
      cancelled: { color: 'red', label: '취소' },
    };
    return configs[status] || { color: 'gray', label: status };
  };

  const config = getStatusConfig(status);
  
  return (
    <span className={cn(
      "inline-flex items-center font-medium rounded-full",
      {
        'px-2 py-1 text-xs': size === 'sm',
        'px-3 py-1 text-sm': size === 'md',
        'px-4 py-2 text-base': size === 'lg',
      },
      variant === 'default' ? [
        `bg-${config.color}-100 text-${config.color}-800`
      ] : [
        `border border-${config.color}-200 text-${config.color}-600`
      ]
    )}>
      {config.label}
    </span>
  );
};
```

## 3. 차트 컴포넌트

### BaseChart
```typescript
interface BaseChartProps {
  title?: string;
  subtitle?: string;
  data: any[];
  loading?: boolean;
  error?: string;
  height?: number;
  className?: string;
}

const BaseChart: React.FC<BaseChartProps & { children: React.ReactNode }> = ({
  title,
  subtitle,
  loading,
  error,
  height = 300,
  className,
  children
}) => {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 p-6", className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      
      <div style={{ height }}>
        {loading ? (
          <ChartSkeleton height={height} />
        ) : error ? (
          <ChartError message={error} />
        ) : (
          children
        )}
      </div>
    </div>
  );
};
```

### UserGrowthChart
```typescript
interface UserGrowthChartProps {
  data: TimeSeriesData[];
  period: 'daily' | 'weekly' | 'monthly';
  title?: string;
}

const UserGrowthChart: React.FC<UserGrowthChartProps> = ({
  data,
  period,
  title = "사용자 증가 추이"
}) => {
  return (
    <BaseChart title={title} data={data}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => formatDate(value, period)}
          />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#2563eb', strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#1d4ed8' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};
```

### MetricsChart
```typescript
interface MetricsChartProps {
  data: MetricsData;
  title?: string;
}

const MetricsChart: React.FC<MetricsChartProps> = ({
  data,
  title = "시스템 리소스"
}) => {
  const chartData = [
    { name: 'CPU', value: data.cpu, color: '#2563eb' },
    { name: 'Memory', value: data.memory, color: '#7c3aed' },
    { name: 'Disk', value: data.disk, color: '#059669' },
  ];

  return (
    <BaseChart title={title} data={chartData}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
          <Tooltip 
            content={<CustomTooltip formatter={(value) => `${value}%`} />}
          />
          <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};
```

## 4. 폼 컴포넌트

### AdminForm
```typescript
interface AdminFormProps {
  title?: string;
  onSubmit: (data: any) => void;
  loading?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const AdminForm: React.FC<AdminFormProps> = ({
  title,
  onSubmit,
  loading,
  children,
  actions
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      
      <form onSubmit={onSubmit} className="p-6 space-y-6">
        {children}
        
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          {actions || (
            <>
              <Button variant="outline" type="button">
                취소
              </Button>
              <Button type="submit" loading={loading}>
                저장
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};
```

### BulkActionBar
```typescript
interface BulkActionBarProps {
  selectedCount: number;
  actions: Array<{
    key: string;
    label: string;
    icon?: React.ComponentType<any>;
    variant?: 'default' | 'danger';
    onClick: () => void;
  }>;
  onClearSelection: () => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  actions,
  onClearSelection
}) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-2" />
          <span className="text-sm text-blue-800">
            {selectedCount}개 항목이 선택됨
          </span>
          <button
            onClick={onClearSelection}
            className="ml-2 text-sm text-blue-600 hover:text-blue-700"
          >
            선택 해제
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          {actions.map((action) => (
            <Button
              key={action.key}
              variant={action.variant || 'default'}
              size="sm"
              onClick={action.onClick}
              icon={action.icon}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
```

## 5. 피드백 컴포넌트

### AdminAlert
```typescript
interface AdminAlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  actions?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const AdminAlert: React.FC<AdminAlertProps> = ({
  type,
  title,
  message,
  actions,
  onClose,
  className
}) => {
  const configs = {
    info: { 
      icon: InformationCircleIcon, 
      bgColor: 'bg-blue-50', 
      textColor: 'text-blue-800',
      iconColor: 'text-blue-400'
    },
    success: { 
      icon: CheckCircleIcon, 
      bgColor: 'bg-green-50', 
      textColor: 'text-green-800',
      iconColor: 'text-green-400'
    },
    warning: { 
      icon: ExclamationTriangleIcon, 
      bgColor: 'bg-yellow-50', 
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-400'
    },
    error: { 
      icon: XCircleIcon, 
      bgColor: 'bg-red-50', 
      textColor: 'text-red-800',
      iconColor: 'text-red-400'
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "rounded-lg p-4",
      config.bgColor,
      className
    )}>
      <div className="flex">
        <Icon className={cn("w-5 h-5 mt-0.5 mr-3", config.iconColor)} />
        <div className="flex-1">
          {title && (
            <h3 className={cn("text-sm font-medium", config.textColor)}>
              {title}
            </h3>
          )}
          <p className={cn("text-sm", config.textColor, title ? "mt-1" : "")}>
            {message}
          </p>
          {actions && (
            <div className="mt-3">
              {actions}
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn("ml-3", config.iconColor, "hover:opacity-75")}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
```

### LoadingSpinner
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center">
        <div className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
          sizeClasses[size]
        )} />
        {text && (
          <p className="text-sm text-gray-600 mt-2">{text}</p>
        )}
      </div>
    </div>
  );
};
```

## 6. 네비게이션 컴포넌트

### Breadcrumbs
```typescript
interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<any>;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                {item.icon && <item.icon className="w-4 h-4 mr-1" />}
                {item.label}
              </Link>
            ) : (
              <span className="flex items-center text-sm text-gray-600">
                {item.icon && <item.icon className="w-4 h-4 mr-1" />}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
```

## 스타일링 가이드

### CSS 클래스 패턴
```css
/* 어드민 전용 색상 확장 */
.admin-primary { @apply bg-admin-primary text-white; }
.admin-danger { @apply bg-red-600 text-white; }
.admin-warning { @apply bg-yellow-500 text-white; }
.admin-success { @apply bg-green-600 text-white; }

/* 정보 밀도 높은 테이블 */
.admin-table-dense td { @apply py-2 px-3; }
.admin-table-dense th { @apply py-3 px-3; }

/* 대시보드 그리드 */
.admin-grid { @apply grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4; }
.admin-grid-2 { @apply grid gap-6 grid-cols-1 lg:grid-cols-2; }

/* 상태 표시 */
.status-active { @apply bg-green-100 text-green-800; }
.status-inactive { @apply bg-gray-100 text-gray-800; }
.status-warning { @apply bg-yellow-100 text-yellow-800; }
.status-error { @apply bg-red-100 text-red-800; }
```

### 반응형 디자인
```typescript
const responsiveClasses = {
  mobile: 'block md:hidden',
  desktop: 'hidden md:block',
  sidebar: 'w-full md:w-64 lg:w-72',
  content: 'w-full md:pl-64 lg:pl-72',
  grid: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
};
```

---

*이 컴포넌트 설계는 워클리 어드민 패널의 UI 일관성과 사용성을 보장하기 위한 가이드라인입니다. 실제 구현 시 접근성(a11y)과 성능을 고려하여 최적화됩니다.*