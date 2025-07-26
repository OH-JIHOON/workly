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
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-300',
    icon: ArrowDown,
    iconColor: 'text-gray-500',
  },
  medium: {
    label: '보통',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300',
    icon: Minus,
    iconColor: 'text-yellow-600',
  },
  high: {
    label: '높음',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300',
    icon: ArrowUp,
    iconColor: 'text-orange-600',
  },
  urgent: {
    label: '긴급',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
    icon: ArrowUp,
    iconColor: 'text-red-600',
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