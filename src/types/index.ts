/**
 * 워클리 고유 방법론 - 통합 타입 익스포트
 * 모든 핵심 타입을 중앙에서 관리
 */

// 핵심 타입들 - 중복 방지를 위해 선택적 export
export * from './work.types';
export * from './workly-core.types';
export * from './unified-navigation.types';

// 기존 타입들 (중복 회피) - 실제 존재하는 타입만 export
export type { UserPreferences } from './api.types';
export type { NavigationItem } from './navigation.types';

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