'use client';

import React from 'react';
import { Filter, Calendar, CheckCircle, List } from 'lucide-react';
import type { SmartFilter } from '@/types/task.types';

interface TaskFiltersProps {
  currentFilter: SmartFilter | 'all';
  onFilterChange: (filter: SmartFilter) => void;
  taskCounts?: {
    today: number;
    completed: number;
    all: number;
  };
}

const filterConfig = {
  today: {
    label: '오늘',
    icon: Calendar,
    description: '오늘 마감이거나 진행 중인 태스크',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    hoverBgColor: 'hover:bg-orange-50',
    activeBgColor: 'bg-orange-100',
  },
  completed: {
    label: '완료됨',
    icon: CheckCircle,
    description: '완료된 태스크',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    hoverBgColor: 'hover:bg-green-50',
    activeBgColor: 'bg-green-100',
  },
  all: {
    label: '전체',
    icon: List,
    description: '모든 태스크',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    hoverBgColor: 'hover:bg-gray-50',
    activeBgColor: 'bg-gray-100',
  },
};

export default function TaskFilters({
  currentFilter = 'all',
  onFilterChange,
  taskCounts
}: TaskFiltersProps) {
  const handleFilterClick = (filter: SmartFilter) => {
    onFilterChange(filter);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 sm:mb-0">
        <Filter className="w-4 h-4" />
        <span className="hidden sm:inline">필터:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {Object.entries(filterConfig).map(([filterKey, config]) => {
          const isActive = currentFilter === filterKey;
          const IconComponent = config.icon;
          const count = taskCounts?.[filterKey as keyof typeof taskCounts];
          
          return (
            <button
              key={filterKey}
              onClick={() => handleFilterClick(filterKey as SmartFilter)}
              className={`
                inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
                border transition-all duration-200
                ${isActive 
                  ? `${config.activeBgColor} ${config.color} border-current shadow-sm` 
                  : `bg-white text-gray-600 border-gray-200 ${config.hoverBgColor} hover:border-gray-300`
                }
              `}
              title={config.description}
            >
              <IconComponent className="w-4 h-4" />
              <span>{config.label}</span>
              {count !== undefined && (
                <span className={`
                  inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full
                  ${isActive 
                    ? 'bg-white text-current' 
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}