'use client';

import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { TaskStatus } from '@/types/work.types';
import WorkStatusBadge from './WorkStatusBadge';

interface TaskStatusSelectorProps {
  currentStatus: TaskStatus;
  onStatusChange: (status: TaskStatus) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusOptions: TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS, 
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
  TaskStatus.BLOCKED,
  TaskStatus.CANCELLED
];

const statusLabels = {
  [TaskStatus.TODO]: '할 일',
  [TaskStatus.IN_PROGRESS]: '진행 중',
  [TaskStatus.IN_REVIEW]: '검토',
  [TaskStatus.DONE]: '완료',
  [TaskStatus.BLOCKED]: '차단됨',
  [TaskStatus.CANCELLED]: '취소됨',
};

export default function TaskStatusSelector({
  currentStatus,
  onStatusChange,
  disabled = false,
  size = 'md'
}: TaskStatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusSelect = (status: TaskStatus) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`inline-flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <TaskStatusBadge status={currentStatus} size={size} />
        {!disabled && (
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        )}
      </button>

      {isOpen && !disabled && (
        <>
          {/* 오버레이 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 드롭다운 메뉴 */}
          <div className="absolute right-0 z-20 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
            <div className="max-h-60 overflow-auto scrollbar-on-hover">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusSelect(status)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center justify-between ${
                    status === currentStatus ? 'bg-blue-50' : ''
                  }`}
                  role="option"
                  aria-selected={status === currentStatus}
                >
                  <span className="flex items-center space-x-2">
                    <TaskStatusBadge status={status} size="sm" showIcon={false} />
                  </span>
                  {status === currentStatus && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}