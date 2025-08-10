'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import PermissionGuard from './PermissionGuard';

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 필요한 권한 목록
   */
  permissions: string | string[];
  
  /**
   * 권한 확인 모드
   */
  mode?: 'all' | 'any';
  
  /**
   * 위험한 액션임을 나타내는 스타일 적용
   */
  variant?: 'primary' | 'secondary' | 'danger';
  
  /**
   * 버튼 크기
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * 로딩 상태
   */
  loading?: boolean;
  
  /**
   * 권한이 없을 때 보여줄 내용 (기본: 숨김)
   */
  fallback?: ReactNode;
  
  children: ReactNode;
}

/**
 * 권한 기반 어드민 버튼 컴포넌트
 * 사용자의 권한에 따라 버튼을 표시/숨김 처리
 * 
 * @example
 * <AdminButton 
 *   permissions="admin:users:delete"
 *   variant="danger"
 *   onClick={handleDeleteUser}
 * >
 *   사용자 삭제
 * </AdminButton>
 */
export default function AdminButton({
  permissions,
  mode = 'all',
  variant = 'primary',
  size = 'md',
  loading = false,
  fallback,
  className = '',
  children,
  disabled,
  ...props
}: AdminButtonProps) {
  // 기본 스타일 클래스
  const baseClasses = [
    'inline-flex items-center justify-center font-medium rounded-md',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'transition-colors duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ];

  // 크기별 클래스
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // 변형별 클래스
  const variantClasses = {
    primary: [
      'bg-indigo-600 text-white',
      'hover:bg-indigo-700',
      'focus:ring-indigo-500',
      'disabled:bg-indigo-300',
    ].join(' '),
    secondary: [
      'bg-white text-gray-700 border border-gray-300',
      'hover:bg-gray-50',
      'focus:ring-indigo-500',
      'disabled:bg-gray-100',
    ].join(' '),
    danger: [
      'bg-red-600 text-white',
      'hover:bg-red-700',
      'focus:ring-red-500',
      'disabled:bg-red-300',
    ].join(' '),
  };

  // 최종 클래스 조합
  const buttonClasses = [
    ...baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    className,
  ].join(' ');

  const buttonContent = (
    <button
      {...props}
      className={buttonClasses}
      disabled={disabled || loading}
    >
      {loading && (
        <svg
          className={`animate-spin -ml-1 mr-2 ${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} text-current`}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );

  return (
    <PermissionGuard 
      permissions={permissions} 
      mode={mode}
      fallback={fallback}
    >
      {buttonContent}
    </PermissionGuard>
  );
}

/**
 * 사용자 삭제 전용 버튼
 */
export function DeleteUserButton({
  onClick,
  loading,
  children = '삭제',
  ...props
}: Omit<AdminButtonProps, 'permissions' | 'variant'> & {
  onClick?: () => void;
}) {
  return (
    <AdminButton
      permissions="admin:users:delete"
      variant="danger"
      size="sm"
      onClick={onClick}
      loading={loading}
      {...props}
    >
      {children}
    </AdminButton>
  );
}

/**
 * 사용자 편집 전용 버튼
 */
export function EditUserButton({
  onClick,
  loading,
  children = '편집',
  ...props
}: Omit<AdminButtonProps, 'permissions' | 'variant'> & {
  onClick?: () => void;
}) {
  return (
    <AdminButton
      permissions="admin:users:update"
      variant="secondary"
      size="sm"
      onClick={onClick}
      loading={loading}
      {...props}
    >
      {children}
    </AdminButton>
  );
}

/**
 * 프로젝트 삭제 전용 버튼
 */
export function DeleteProjectButton({
  onClick,
  loading,
  children = '삭제',
  ...props
}: Omit<AdminButtonProps, 'permissions' | 'variant'> & {
  onClick?: () => void;
}) {
  return (
    <AdminButton
      permissions="admin:projects:delete"
      variant="danger"
      size="sm"
      onClick={onClick}
      loading={loading}
      {...props}
    >
      {children}
    </AdminButton>
  );
}