/**
 * 워클리 고유 방법론 - 통합 타입 익스포트
 * 모든 핵심 타입을 중앙에서 관리
 */

// 기존 타입들
export * from './api.types';
export * from './socket.types';

// 워클리 방법론 새로운 타입들
// goal.types 제거됨
// inbox.types 제거됨
export * from './navigation.types';

// 어드민 패널 타입들
export * from './admin.types';

// 워클리 방법론 핵심 상수
export const WORKLY_METHODOLOGY = {
  name: 'Workly Unique Methodology',
  version: '1.0.0',
  hierarchy: ['Goal', 'Project', 'Task'] as const,
  workflow: ['Capture', 'Plan', 'Execute', 'Review'] as const,
  navigation: ['Tasks', 'Projects', 'Profile'] as const,
} as const;

// 워크플로우 단계별 색상 테마
export const WORKFLOW_THEME = {
  capture: {
    primary: '#3B82F6',   // Blue
    secondary: '#DBEAFE',
    accent: '#1D4ED8',
  },
  plan: {
    primary: '#10B981',   // Green
    secondary: '#D1FAE5',
    accent: '#059669',
  },
  execute: {
    primary: '#F59E0B',   // Amber
    secondary: '#FEF3C7',
    accent: '#D97706',
  },
  review: {
    primary: '#8B5CF6',   // Purple
    secondary: '#EDE9FE',
    accent: '#7C3AED',
  },
} as const;

// 네비게이션 항목별 색상 및 아이콘
export const NAVIGATION_CONFIG = {
  tasks: {
    icon: 'CheckSquare',
    color: '#3B82F6',
    label: '업무',
  },
  projects: {
    icon: 'Folder',
    color: '#10B981',
    label: '프로젝트',
  },
  // inbox, goals 설정 제거됨
  profile: {
    icon: 'User',
    color: '#6B7280',
    label: '프로필',
  },
} as const;