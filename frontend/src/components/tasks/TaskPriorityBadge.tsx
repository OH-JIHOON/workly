'use client';

import React from 'react';
import { TaskPriority } from '@/types/task.types';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
}

const priorityConfig = {
  low: {
    label: '낮음',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-500',
    borderColor: 'border-gray-200',
    icon: ArrowDown,
    iconColor: 'text-gray-400',
  },
  medium: {
    label: '보통',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    icon: Minus,
    iconColor: 'text-gray-500',
  },
  high: {
    label: '높음',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    icon: ArrowUp,
    iconColor: 'text-blue-600',
  },
  urgent: {
    label: '긴급',
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    borderColor: 'border-blue-600',
    icon: ArrowUp,
    iconColor: 'text-white',
  },
};

const sizeConfig = {
  sm: {
    container: 'px-2 py-1 text-xs',
    icon: 'w-3 h-3',
  },
  md: {
    container: 'px-3 py-1 text-sm',
    icon: 'w-4 h-4',
  },
  lg: {
    container: 'px-4 py-2 text-base',
    icon: 'w-5 h-5',
  },
};

export default function TaskPriorityBadge({ 
  priority, 
  size = 'md', 
  showIcon = true,
  showLabel = true
}: TaskPriorityBadgeProps) {
  const config = priorityConfig[priority];
  const sizeClass = sizeConfig[size];
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClass.container}`}
    >
      {showIcon && (
        <IconComponent 
          className={`${sizeClass.icon} ${config.iconColor} ${showLabel ? 'mr-1' : ''}`}
        />
      )}
      {showLabel && config.label}
    </span>
  );
}