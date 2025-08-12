'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  User, 
  Folder,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import WorkStatusBadge from './WorkStatusBadge';
import WorkPriorityBadge from './WorkPriorityBadge';
import WorkStatusSelector from './WorkStatusSelector';
import { Task, TaskStatus } from '@/types/work.types';

interface TaskListProps {
  tasks: Task[];
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (task: Task) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  showProject?: boolean;
  showAssignee?: boolean;
}

export default function TaskList({
  tasks,
  onStatusChange,
  onTaskEdit,
  onTaskDelete,
  isLoading = false,
  emptyMessage = '태스크가 없습니다.',
  showProject = true,
  showAssignee = true
}: TaskListProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="flex space-x-4">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">태스크 없음</h3>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <div className="p-4">
            {/* 태스크 헤더 */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/tasks/${task.id}`}
                  className="block group"
                >
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </Link>
              </div>

              {/* 액션 메뉴 */}
              <div className="flex items-center space-x-2 ml-4">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setExpandedTask(expandedTask === task.id ? null : task.id);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {expandedTask === task.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setExpandedTask(null)}
                      />
                      <div className="absolute right-0 z-20 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          상세 보기
                        </Link>
                        {onTaskEdit && (
                          <button
                            onClick={(e) => handleActionClick(e, () => onTaskEdit(task))}
                            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            수정
                          </button>
                        )}
                        {onTaskDelete && (
                          <button
                            onClick={(e) => handleActionClick(e, () => onTaskDelete(task))}
                            className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 태스크 메타데이터 */}
            <div className="flex items-center flex-wrap gap-3">
              {/* 상태 */}
              {onStatusChange ? (
                <TaskStatusSelector
                  currentStatus={task.status}
                  onStatusChange={(status) => onStatusChange(task.id, status)}
                  size="sm"
                />
              ) : (
                <TaskStatusBadge status={task.status} size="sm" />
              )}

              {/* 우선순위 */}
              <TaskPriorityBadge priority={task.priority} size="sm" />

              {/* 프로젝트 */}
              {showProject && task.project && (
                <div className="flex items-center text-sm text-gray-500">
                  <Folder className="w-4 h-4 mr-1" />
                  <span className="truncate max-w-32">{task.project.name}</span>
                </div>
              )}

              {/* 담당자 */}
              {showAssignee && task.assignee && (
                <div className="flex items-center text-sm text-gray-500">
                  <User className="w-4 h-4 mr-1" />
                  <span className="truncate max-w-24">
                    {task.assignee.firstName} {task.assignee.lastName}
                  </span>
                </div>
              )}

              {/* 마감일 */}
              {task.dueDate && (
                <div className={`flex items-center text-sm ${
                  isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-500'
                }`}>
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{formatDate(task.dueDate)}</span>
                  {isOverdue(task.dueDate) && (
                    <span className="ml-1 text-xs">(지연)</span>
                  )}
                </div>
              )}

              {/* 예상 시간 */}
              {task.estimatedHours && task.estimatedHours > 0 && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{task.estimatedHours}h</span>
                </div>
              )}

              {/* 진행률 */}
              {task.progress > 0 && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                  <span>{task.progress}%</span>
                </div>
              )}
            </div>

            {/* 태그 */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {task.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {task.tags.length > 3 && (
                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    +{task.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}