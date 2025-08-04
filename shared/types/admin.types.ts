/**
 * 워클리 어드민 패널 타입 정의
 * 관리자 전용 인터페이스 및 데이터 구조
 */

// ==================== 권한 및 역할 ====================

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',    // 모든 권한
  ADMIN = 'admin',                // 사용자/콘텐츠 관리
  MODERATOR = 'moderator',        // 콘텐츠 모더레이션만
  SUPPORT = 'support',            // 사용자 지원 (읽기 전용 + 기본 사용자 관리)
}

export interface AdminPermissions {
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
  projects: {
    read: boolean;
    moderate: boolean;
    close: boolean;
    featured: boolean;
  };
  system: {
    read: boolean;
    configure: boolean;
    maintenance: boolean;
    monitoring: boolean;
  };
}

// ==================== 대시보드 ====================

export interface DashboardKPIs {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface MetricsData {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    incoming: number;
    outgoing: number;
  };
  database: {
    connections: number;
    queryTime: number;
  };
}

export interface ActivityLog {
  id: string;
  type: 'user_registered' | 'project_created' | 'task_completed' | 'error_occurred';
  title: string;
  description: string;
  userId?: string;
  userEmail?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  severity: 'info' | 'warning' | 'error';
}

export interface DashboardData {
  kpis: DashboardKPIs;
  charts: {
    userGrowth: TimeSeriesData[];
    taskCompletion: TimeSeriesData[];
    projectStatus: PieChartData[];
    serverMetrics: MetricsData;
  };
  recentActivity: ActivityLog[];
}

// ==================== 사용자 관리 ====================

export interface UserWithStats {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
  emailVerifiedAt?: string;
  
  // 통계 정보
  stats: {
    totalProjects: number;
    completedTasks: number;
    activeProjects: number;
    collaborations: number;
  };
}

export interface UserManagementFilters {
  role?: string[];
  status?: string[];
  registrationDate?: {
    start: string;
    end: string;
  };
  lastActivity?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface BulkUserAction {
  userIds: string[];
  action: 'activate' | 'deactivate' | 'suspend' | 'delete' | 'send_email';
  params?: Record<string, any>;
}

// ==================== 프로젝트 관리 ====================

export interface ProjectWithMetrics {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  ownerName: string;
  
  // 메트릭스
  metrics: {
    averageTaskCompletionTime: number;
    memberEngagement: number;
    messagesCount: number;
    filesCount: number;
    lastActivity: string;
  };
  
  // 위험 지표
  riskFlags: {
    inactive: boolean;
    overdue: boolean;
    lowEngagement: boolean;
    reported: boolean;
  };
}

export interface ProjectAnalytics {
  successRate: number;
  averageCompletionTime: number;
  popularSkills: Array<{
    skill: string;
    count: number;
    successRate: number;
  }>;
  teamSizeDistribution: Array<{
    size: string;
    count: number;
    successRate: number;
  }>;
  monthlyTrends: {
    created: TimeSeriesData[];
    completed: TimeSeriesData[];
    cancelled: TimeSeriesData[];
  };
}

// ==================== 업무 관리 ====================

export interface TaskWithContext {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  createdAt: string;
  assigneeId?: string;
  assigneeName?: string;
  projectId?: string;
  projectName?: string;
  
  // 컨텍스트 정보
  labels: string[];
  commentsCount: number;
  attachmentsCount: number;
  dependenciesCount: number;
  
  // 품질 지표
  qualityFlags: {
    hasDescription: boolean;
    hasLabels: boolean;
    hasAssignee: boolean;
    hasDueDate: boolean;
    isOverdue: boolean;
  };
}

export interface TaskCategories {
  uncategorized: number;
  blocked: number;
  overdue: number;
  highPriority: number;
  noDueDate: number;
  noAssignee: number;
}

export interface TaskAutomationSettings {
  autoLabeling: boolean;
  duplicateDetection: boolean;
  spamFilter: boolean;
  overduNotifications: boolean;
  priorityAutoEscalation: boolean;
}

// ==================== 콘텐츠 관리 ====================

export interface ContentReport {
  id: string;
  reporterId: string;
  reporterName: string;
  contentType: 'project' | 'task' | 'comment' | 'message';
  contentId: string;
  contentTitle?: string;
  reason: ReportReason;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  action?: 'no_action' | 'warning' | 'content_removed' | 'user_suspended';
  createdAt: string;
  
  // 콘텐츠 스니펫
  contentPreview: string;
  contentAuthorId: string;
  contentAuthorName: string;
}

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  COPYRIGHT_VIOLATION = 'copyright_violation',
  FAKE_INFORMATION = 'fake_information',
  VIOLENCE = 'violence',
  HATE_SPEECH = 'hate_speech',
  OTHER = 'other'
}

export interface ContentModerationAction {
  reportId: string;
  action: 'dismiss' | 'warn_user' | 'remove_content' | 'suspend_user';
  reason: string;
  duration?: number; // 정지 기간 (일)
  notifyUser: boolean;
}

// ==================== 시스템 설정 ====================

export interface SystemSettings {
  app: {
    maintenanceMode: boolean;
    newUserRegistration: boolean;
    projectCreation: boolean;
    fileUpload: boolean;
    maxFileSize: number; // MB
    maxProjectMembers: number;
    taskDeadlineWarningDays: number;
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    dailyDigestEnabled: boolean;
    weeklyReportEnabled: boolean;
  };
  security: {
    passwordMinLength: number;
    passwordRequireSpecialChar: boolean;
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    twoFactorRequired: boolean;
  };
  features: {
    realTimeChat: boolean;
    fileSharing: boolean;
    integrations: boolean;
    analytics: boolean;
    apiAccess: boolean;
  };
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'welcome' | 'password_reset' | 'project_invitation' | 'task_reminder' | 'weekly_digest';
  variables: string[]; // 사용 가능한 변수들
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== 시스템 모니터링 ====================

export interface ServerMetrics {
  cpu: {
    usage: number;
    cores: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
}

export interface DatabaseMetrics {
  connections: {
    active: number;
    idle: number;
    total: number;
    max: number;
  };
  queries: {
    total: number;
    slow: number;
    failed: number;
    averageTime: number;
  };
  size: {
    total: number;
    tables: Array<{
      name: string;
      size: number;
      rows: number;
    }>;
  };
}

export interface APIMetrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
  };
  endpoints: Array<{
    path: string;
    method: string;
    calls: number;
    averageTime: number;
    errorRate: number;
  }>;
  statusCodes: Record<string, number>;
}

export interface ErrorLog {
  id: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context: Record<string, any>;
  userId?: string;
  endpoint?: string;
  timestamp: string;
  resolved: boolean;
}

export interface Alert {
  id: string;
  type: 'cpu_high' | 'memory_high' | 'disk_full' | 'api_slow' | 'error_rate_high';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  resolvedAt?: string;
}

// ==================== 감사 로그 ====================

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'user' | 'project' | 'task' | 'system' | 'settings';
  targetId?: string;
  targetName?: string;
  changes: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}

// ==================== API 응답 타입 ====================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

// ==================== 통계 및 분석 ====================

export interface UserGrowthStats {
  period: 'daily' | 'weekly' | 'monthly';
  data: Array<{
    date: string;
    newUsers: number;
    activeUsers: number;
    retentionRate: number;
  }>;
}

export interface ProjectSuccessStats {
  totalProjects: number;
  completedProjects: number;
  cancelledProjects: number;
  successRate: number;
  averageCompletionDays: number;
  topReasons: Array<{
    reason: string;
    count: number;
  }>;
}

export interface PlatformHealthScore {
  overall: number; // 0-100
  components: {
    userEngagement: number;
    systemPerformance: number;
    contentQuality: number;
    errorRate: number;
  };
  trends: {
    lastWeek: number;
    lastMonth: number;
  };
}