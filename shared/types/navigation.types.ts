/**
 * 워클리 고유 방법론 - 네비게이션 관련 타입 정의
 * 5개 핵심 네비게이션 항목: 업무 → 프로젝트 → 수집함 → 목표 → 프로필
 */

// 메인 네비게이션 항목
export enum NavigationItem {
  TASKS = 'tasks',           // 업무
  PROJECTS = 'projects',     // 프로젝트  
  INBOX = 'inbox',          // 수집함 (중앙 위치, 강조)
  GOALS = 'goals',          // 목표
  PROFILE = 'profile',      // 프로필
}

// 네비게이션 아이템 정보
export interface NavigationItemInfo {
  id: NavigationItem;
  label: string;
  icon: string;
  path: string;
  isCenter?: boolean;       // 중앙 위치 (수집함용)
  isEmphasized?: boolean;   // 시각적 강조
  badgeCount?: number;      // 뱃지 카운트
  isActive?: boolean;       // 현재 활성화 상태
}

// 플로팅 액션 버튼 설정
export interface FloatingActionButtonConfig {
  showOnDesktop: boolean;   // 데스크톱에서만 표시
  showOnMobile: boolean;    // 모바일에서 표시 여부
  position: 'bottom-right' | 'bottom-left' | 'bottom-center';
  actions: FloatingAction[];
}

// 플로팅 액션 항목
export interface FloatingAction {
  id: string;
  label: string;
  icon: string;
  action: 'quick-capture' | 'add-task' | 'add-project' | 'add-goal';
  color?: string;
  shortcut?: string;        // 키보드 단축키
}

// 빠른 캡처 모달 설정
export interface QuickCaptureConfig {
  placeholder: string;
  showTypeSelector: boolean;
  showPrioritySelector: boolean;
  showTagInput: boolean;
  showScheduleOption: boolean;
  autoFocus: boolean;
}

// 네비게이션 상태
export interface NavigationState {
  currentItem: NavigationItem;
  previousItem?: NavigationItem;
  breadcrumbs: BreadcrumbItem[];
  isLoading: boolean;
  error?: string;
}

// 브레드크럼 아이템
export interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: string;
  isClickable: boolean;
}

// 네비게이션 설정
export interface NavigationSettings {
  layout: 'bottom' | 'sidebar' | 'top';
  showLabels: boolean;
  showBadges: boolean;
  enableSwipeGestures: boolean;
  floatingActionButton: FloatingActionButtonConfig;
  quickCapture: QuickCaptureConfig;
}

// 워클리 방법론 워크플로우 단계
export enum CPERStep {
  CAPTURE = 'capture',   // 수집
  PLAN = 'plan',        // 계획
  EXECUTE = 'execute',  // 실행
  REVIEW = 'review',    // 검토
}

// 워크플로우 상태
export interface WorkflowState {
  currentStep: CPERStep;
  completedSteps: CPERStep[];
  nextStep?: CPERStep;
  progress: number; // 0-100
}

// 사용자 컨텍스트 (네비게이션에서 사용)
export interface UserNavigationContext {
  userId: string;
  preferences: NavigationSettings;
  workflow: WorkflowState;
  quickStats: {
    inboxCount: number;
    todayTasksCount: number;
    activeProjectsCount: number;
    activeGoalsCount: number;
  };
}