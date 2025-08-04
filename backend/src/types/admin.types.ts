/**
 * 워클리 어드민 패널 타입 정의 (백엔드 전용)
 */

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',    // 모든 권한
  ADMIN = 'admin',                // 사용자/콘텐츠 관리
  MODERATOR = 'moderator',        // 콘텐츠 모더레이션만
  SUPPORT = 'support',            // 사용자 지원 (읽기 전용 + 기본 사용자 관리)
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  IN_REVIEW = 'in-review',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}