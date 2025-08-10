/**
 * 워클리 고유 방법론 - 수집함(Inbox) 관련 타입 정의
 * CPER 워크플로우의 '수집(Capture)' 단계를 담당하는 중앙 집중식 입력 시스템
 */

// 수집함 항목 유형
export enum InboxItemType {
  QUICK_NOTE = 'quick_note',     // 빠른 메모
  TASK_IDEA = 'task_idea',       // 업무 아이디어
  PROJECT_IDEA = 'project_idea', // 프로젝트 아이디어
  GOAL_IDEA = 'goal_idea',       // 목표 아이디어
  MEETING_NOTE = 'meeting_note', // 회의 메모
  FEEDBACK = 'feedback',         // 피드백
  INSPIRATION = 'inspiration',   // 영감/아이디어
  REMINDER = 'reminder',         // 리마인더
  LINK = 'link',                // 링크/참조
  FILE = 'file',                // 파일 첨부
}

// 수집함 항목 상태
export enum InboxItemStatus {
  CAPTURED = 'captured',     // 수집됨 (초기 상태)
  CLARIFIED = 'clarified',   // 명확화됨
  ORGANIZED = 'organized',   // 정리됨 (프로젝트/업무로 전환)
  DEFERRED = 'deferred',     // 미루어짐
  DELETED = 'deleted',       // 삭제됨
}

// 수집함 항목 우선순위
export enum InboxItemPriority {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  URGENT = 'urgent',
}

// 기본 사용자 정보
export interface InboxUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// 첨부 파일 정보
export interface InboxAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  thumbnailUrl?: string;
  uploadedAt: string;
}

// 메인 수집함 항목 인터페이스
export interface InboxItem {
  id: string;
  title: string;
  content?: string;
  type: InboxItemType;
  status: InboxItemStatus;
  priority: InboxItemPriority;
  
  // 수집 방식 메타데이터
  source: 'manual' | 'email' | 'web_clipper' | 'mobile_app' | 'api' | 'voice_note';
  captureContext?: {
    url?: string;           // 웹에서 수집한 경우 원본 URL
    deviceType?: string;    // 수집 시 사용한 디바이스
    location?: string;      // GPS 위치 (선택적)
    timestamp: string;      // 수집 시점
  };
  
  // 첨부 파일 및 링크
  attachments: InboxAttachment[];
  relatedUrls: string[];
  
  // 태그 및 분류
  tags: string[];
  
  // 처리 결과 (정리 단계에서 설정)
  processedInto?: {
    type: 'goal' | 'project' | 'task' | 'note';
    id: string;
    title: string;
  };
  
  // 스케줄링
  scheduledFor?: string; // 나중에 처리할 날짜
  reminderAt?: string;   // 리마인더 시간
  
  // 소유자 및 관계
  userId: string;
  user: InboxUser;
  
  // 메타데이터
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  
  // 계산된 속성
  isOverdue?: boolean;
  daysSinceCapture?: number;
}

// 수집함 항목 생성 DTO (빠른 수집용)
export interface CreateInboxItemDto {
  title: string;
  content?: string;
  type?: InboxItemType;
  priority?: InboxItemPriority;
  source?: string;
  tags?: string[];
  relatedUrls?: string[];
  scheduledFor?: string;
  reminderAt?: string;
  attachments?: File[];
}

// 수집함 항목 업데이트 DTO (명확화 단계용)
export interface UpdateInboxItemDto {
  title?: string;
  content?: string;
  type?: InboxItemType;
  status?: InboxItemStatus;
  priority?: InboxItemPriority;
  tags?: string[];
  scheduledFor?: string;
  reminderAt?: string;
  processedInto?: {
    type: 'goal' | 'project' | 'task' | 'note';
    id: string;
    title: string;
  };
}

// 수집함 항목 쿼리 DTO
export interface InboxQueryDto {
  page?: number;
  limit?: number;
  status?: InboxItemStatus;
  type?: InboxItemType;
  priority?: InboxItemPriority;
  source?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

// 수집함 빠른 입력 DTO (글로벌 캡처 UI용)
export interface QuickCaptureDto {
  content: string;
  type?: InboxItemType;
  priority?: InboxItemPriority;
  tags?: string[];
  scheduledFor?: string;
}

// 수집함 일괄 처리 DTO
export interface InboxBatchProcessDto {
  itemIds: string[];
  action: 'clarify' | 'organize' | 'defer' | 'delete';
  data?: {
    scheduledFor?: string;
    processedInto?: {
      type: 'goal' | 'project' | 'task';
      title: string;
      description?: string;
    };
  };
}

// 수집함 통계
export interface InboxStats {
  total: number;
  captured: number;
  clarified: number;
  organized: number;
  deferred: number;
  overdueItems: number;
  todaysCaptureCount: number;
  averageProcessingTime: number; // 시간 단위
}

// 수집함 활동
export interface InboxActivity {
  id: string;
  type: 'captured' | 'clarified' | 'organized' | 'deferred' | 'processed';
  description: string;
  userId: string;
  user: InboxUser;
  itemId: string;
  createdAt: string;
  metadata?: { [key: string]: any };
}

// 수집함 대시보드 데이터
export interface InboxDashboard {
  stats: InboxStats;
  recentItems: InboxItem[];
  overdueItems: InboxItem[];
  scheduledItems: InboxItem[];
  recentActivity: InboxActivity[];
  processingInsights: {
    mostCapturedType: InboxItemType;
    averageItemsPerDay: number;
    processingEfficiency: number; // 0-100 (처리된 비율)
  };
}

// 수집함 필터 설정
export interface InboxFilterSettings {
  status?: InboxItemStatus[];
  type?: InboxItemType[];
  priority?: InboxItemPriority[];
  source?: string[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

// 수집함 뷰 설정
export interface InboxViewSettings {
  groupBy?: 'none' | 'type' | 'priority' | 'status' | 'date';
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  filters: InboxFilterSettings;
  showProcessed: boolean;
}

