'use client';

import React from 'react';
import { TaskStatus } from '@/types/work.types';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const statusConfig = {
  todo: {
    label: '할 일',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    icon: '📋',
  },
  in_progress: {
    label: '진행 중',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    icon: '🔄',
  },
  in_review: {
    label: '검토',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    icon: '👀',
  },
  done: {
    label: '완료',
    bgColor: 'bg-green-100',
    textColor: 'text-green-600',
    icon: '✅',
  },
  blocked: {
    label: '차단됨',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-500',
    icon: '🚫',
  },
  cancelled: {
    label: '취소됨',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-500',
    icon: '❌',
  },
};

const sizeConfig = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

export default function TaskStatusBadge({ 
  status, 
  size = 'md', 
  showIcon = true 
}: TaskStatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass = sizeConfig[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClass}`}
    >
      {showIcon && (
        <span className="mr-1">{config.icon}</span>
      )}
      {config.label}
    </span>
  );
}