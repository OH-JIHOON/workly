'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import MainContainer from '@/components/layout/MainContainer';
import TaskList from '@/components/tasks/TaskList';
import TaskFilters from '@/components/tasks/TaskFilters';
import TaskCreationWizard from '@/components/tasks/TaskCreationWizard';
import { apiClient } from '@/lib/api';
import { Task, CreateTaskDto, TaskStatus, SmartFilter } from '@/types/task.types';

interface TaskCounts {
  today: number;
  completed: number;
  all: number;
}

interface SortOption {
  value: string;
  label: string;
  field: keyof Task;
  direction: 'asc' | 'desc';
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'dueDate-asc', label: '마감일 빠른 순', field: 'dueDate', direction: 'asc' },
  { value: 'dueDate-desc', label: '마감일 늦은 순', field: 'dueDate', direction: 'desc' },
  { value: 'priority-desc', label: '우선순위 높은 순', field: 'priority', direction: 'desc' },
  { value: 'priority-asc', label: '우선순위 낮은 순', field: 'priority', direction: 'asc' },
  { value: 'createdAt-desc', label: '최근 생성 순', field: 'createdAt', direction: 'desc' },
  { value: 'createdAt-asc', label: '오래된 순', field: 'createdAt', direction: 'asc' },
  { value: 'title-asc', label: '제목 A-Z', field: 'title', direction: 'asc' },
  { value: 'title-desc', label: '제목 Z-A', field: 'title', direction: 'desc' }
];

const PRIORITY_ORDER = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [taskCounts, setTaskCounts] = useState<TaskCounts>({ today: 0, completed: 0, all: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 필터 및 검색 상태
  const [currentFilter, setCurrentFilter] = useState<SmartFilter>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<string>('dueDate-asc');

  // UI 상태
  const [isCreationWizardOpen, setIsCreationWizardOpen] = useState(false);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [assignees, setAssignees] = useState<Array<{ id: string; firstName: string; lastName: string }>>([]);

  // 데이터 로드
  useEffect(() => {
    loadTasks();
    loadProjects();
    loadAssignees();
  }, []);

  // 필터 및 정렬 적용
  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, currentFilter, searchQuery, sortOption]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 모든 태스크 로드
      const allTasks = await apiClient.get<Task[]>('/tasks');
      setTasks(allTasks);

      // 스마트 필터별 카운트 계산
      const today = new Date();
      today.setHours(23, 59, 59, 999); // 오늘 끝까지

      const todayTasks = allTasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate <= today && task.status !== TaskStatus.DONE;
      });

      const completedTasks = allTasks.filter(task => task.status === TaskStatus.DONE);

      setTaskCounts({
        today: todayTasks.length,
        completed: completedTasks.length,
        all: allTasks.length
      });

    } catch (err) {
      console.error('태스크 로드 실패:', err);
      setError('태스크를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const projectsData = await apiClient.get<Array<{ id: string; name: string }>>('/projects');
      setProjects(projectsData);
    } catch (err) {
      console.error('프로젝트 로드 실패:', err);
    }
  };

  const loadAssignees = async () => {
    try {
      const assigneesData = await apiClient.get<Array<{ id: string; firstName: string; lastName: string }>>('/users');
      setAssignees(assigneesData);
    } catch (err) {
      console.error('사용자 로드 실패:', err);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...tasks];

    // 스마트 필터 적용
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    switch (currentFilter) {
      case 'today':
        filtered = filtered.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate <= today && task.status !== TaskStatus.DONE;
        });
        break;
      case 'completed':
        filtered = filtered.filter(task => task.status === TaskStatus.DONE);
        break;
      case 'all':
      default:
        // 모든 태스크 표시
        break;
    }

    // 검색 쿼리 적용
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 정렬 적용
    const sortConfig = SORT_OPTIONS.find(opt => opt.value === sortOption);
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.field];
        let bValue = b[sortConfig.field];

        // 특별한 정렬 로직
        if (sortConfig.field === 'priority') {
          aValue = PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] || 0;
          bValue = PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] || 0;
        } else if (sortConfig.field === 'dueDate') {
          // null 값 처리
          if (!aValue && !bValue) return 0;
          if (!aValue) return sortConfig.direction === 'asc' ? 1 : -1;
          if (!bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        } else if (sortConfig.field === 'createdAt') {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        }

        if (aValue === bValue) return 0;
        
        const result = aValue < bValue ? -1 : 1;
        return sortConfig.direction === 'asc' ? result : -result;
      });
    }

    setFilteredTasks(filtered);
  };

  const handleCreateTask = async (taskData: CreateTaskDto) => {
    try {
      await apiClient.post<Task>('/tasks', taskData);
      await loadTasks(); // 태스크 목록 새로고침
    } catch (err) {
      console.error('태스크 생성 실패:', err);
      throw err;
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await apiClient.put(`/tasks/${taskId}`, { status });
      await loadTasks(); // 태스크 목록 새로고침
    } catch (err) {
      console.error('태스크 상태 변경 실패:', err);
    }
  };

  const handleTaskEdit = (task: Task) => {
    // TODO: 태스크 편집 모달 또는 페이지로 이동
    console.log('Edit task:', task);
  };

  const handleTaskDelete = async (task: Task) => {
    if (confirm(`"${task.title}" 태스크를 삭제하시겠습니까?`)) {
      try {
        await apiClient.delete(`/tasks/${task.id}`);
        await loadTasks(); // 태스크 목록 새로고침
      } catch (err) {
        console.error('태스크 삭제 실패:', err);
      }
    }
  };

  if (error) {
    return (
      <MainContainer className="px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadTasks}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer className="px-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">태스크 관리</h1>
          <p className="text-gray-600 mt-1">GTD 방법론을 활용한 체계적인 태스크 관리</p>
        </div>
        <button
          onClick={() => setIsCreationWizardOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>새 태스크</span>
        </button>
      </div>

      {/* 필터 및 검색 */}
      <div className="space-y-4 mb-6">
        {/* 스마트 필터 */}
        <TaskFilters
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          taskCounts={taskCounts}
        />

        {/* 검색 및 정렬 */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 검색 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="태스크 제목, 설명, 태그로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 정렬 */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 결과 표시 */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          총 {filteredTasks.length}개의 태스크
          {searchQuery && ` (검색: "${searchQuery}")`}
        </p>
      </div>

      {/* 태스크 목록 */}
      <TaskList
        tasks={filteredTasks}
        onStatusChange={handleStatusChange}
        onTaskEdit={handleTaskEdit}
        onTaskDelete={handleTaskDelete}
        isLoading={isLoading}
        emptyMessage={
          currentFilter === 'today' 
            ? '오늘 해야 할 태스크가 없습니다.'
            : currentFilter === 'completed'
            ? '완료된 태스크가 없습니다.'
            : searchQuery
            ? '검색 조건에 맞는 태스크가 없습니다.'
            : '등록된 태스크가 없습니다.'
        }
      />

      {/* 태스크 생성 마법사 */}
      <TaskCreationWizard
        isOpen={isCreationWizardOpen}
        onClose={() => setIsCreationWizardOpen(false)}
        onSubmit={handleCreateTask}
        projects={projects}
        assignees={assignees}
      />
    </MainContainer>
  );
}