'use client';

import { useState, useEffect } from 'react';
import type { Work, WorkQueryDto, CreateWorkDto, UpdateWorkDto, WorkStatus } from '@/types/work.types';
import { useAuth } from '@/lib/stores/auth.store';

// Work API 클라이언트 훅
export function useWorks() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  
  // API 요청용 헤더 생성 (쿠키 기반 인증)
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
    };
  };

  // 워크 목록 조회
  const fetchWorks = async (filters?: WorkQueryDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.set('status', filters.status);
      if (filters?.priority) queryParams.set('priority', filters.priority);
      if (filters?.type) queryParams.set('type', filters.type);
      if (filters?.projectId) queryParams.set('projectId', filters.projectId);
      if (filters?.search) queryParams.set('search', filters.search);
      if (filters?.sortBy) queryParams.set('sortBy', filters.sortBy);
      if (filters?.sortOrder) queryParams.set('sortOrder', filters.sortOrder);
      if (filters?.page) queryParams.set('page', filters.page.toString());
      if (filters?.limit) queryParams.set('limit', filters.limit.toString());
      if (filters?.tags) queryParams.set('tags', filters.tags.join(','));
      if (filters?.dueDate) queryParams.set('dueDate', filters.dueDate);

      const response = await fetch(`/api/works?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '워크 목록을 불러오는데 실패했습니다.');
      }

      setWorks(result.data);
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 단일 워크 조회
  const fetchWork = async (id: string): Promise<Work> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/works/${id}`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '워크를 불러오는데 실패했습니다.');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 워크 생성
  const createWork = async (workData: CreateWorkDto): Promise<Work> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/works', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(workData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '워크 생성에 실패했습니다.');
      }

      // 로컬 상태 업데이트
      setWorks(prev => [result.data, ...prev]);
      
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 워크 업데이트
  const updateWork = async (id: string, updates: UpdateWorkDto): Promise<Work> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/works/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '워크 업데이트에 실패했습니다.');
      }

      // 로컬 상태 업데이트
      setWorks(prev => 
        prev.map(work => work.id === id ? result.data : work)
      );
      
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 워크 상태 변경
  const updateWorkStatus = async (id: string, status: WorkStatus): Promise<Work> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/works/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '워크 상태 변경에 실패했습니다.');
      }

      // 로컬 상태 업데이트
      setWorks(prev => 
        prev.map(work => work.id === id ? result.data : work)
      );
      
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 워크 삭제
  const deleteWork = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/works/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '워크 삭제에 실패했습니다.');
      }

      // 로컬 상태 업데이트
      setWorks(prev => prev.filter(work => work.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 오늘 할 일 조회
  const fetchTodayWorks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 fetchTodayWorks 시작 - 헤더:', getAuthHeaders());
      
      const response = await fetch('/api/works/today', {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      
      console.log('📡 API 응답 상태:', response.status, response.statusText);
      
      const result = await response.json();
      console.log('📋 API 응답 내용:', result);

      if (!response.ok) {
        console.error('❌ API 호출 실패:', {
          status: response.status,
          statusText: response.statusText,
          error: result.error,
          result: result
        });
        throw new Error(result.error || `API 오류 (${response.status}): 오늘 할 일을 불러오는데 실패했습니다.`);
      }

      setWorks(result.data);
      console.log('✅ fetchTodayWorks 성공:', result.data?.length, '개 작업');
      return result.data;
    } catch (err) {
      console.error('💥 fetchTodayWorks 예외:', err);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };


  return {
    works,
    loading,
    error,
    fetchWorks,
    fetchWork,
    createWork,
    updateWork,
    updateWorkStatus,
    deleteWork,
    fetchTodayWorks,
  };
}

// 단일 워크 관리 훅
export function useWork(id?: string) {
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  // 워크 조회
  const fetchWork = async (workId: string = id!) => {
    if (!workId) {
      setError('워크 ID가 필요합니다.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/works/${workId}`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '워크를 불러오는데 실패했습니다.');
      }

      setWork(result.data);
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // API 요청용 헤더 생성 (useWork용 - 쿠키 기반 인증)
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
    };
  };

  // 하위 워크 조회
  const fetchSubworks = async (workId: string = id!) => {
    if (!workId) {
      setError('워크 ID가 필요합니다.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/works/${workId}/subworks`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '하위 워크를 불러오는데 실패했습니다.');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    if (id) {
      fetchWork(id);
    }
  }, [id]);

  return {
    work,
    loading,
    error,
    fetchWork,
    fetchSubworks,
    refetch: () => fetchWork(),
  };
}