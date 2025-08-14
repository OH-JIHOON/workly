'use client';

import React, { useState } from 'react';
import { useWorks } from '@/hooks/useWorks';
import { useAuth } from '@/lib/stores/auth.store';
import { WorkPriority, WorkType } from '@/types/work.types';

interface WorkComposerProps {
  worksState: ReturnType<typeof useWorks>;
}

export function WorkComposer({ worksState }: WorkComposerProps) {
  const { createWork, loading } = worksState;
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !isAuthenticated) {
      return;
    }

    try {
      await createWork({
        title: title.trim(),
        priority: WorkPriority.MEDIUM,
        type: WorkType.WORK,
      });
      
      setTitle('');
    } catch (err) {
      console.error('Work creation failed:', err);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="새 워크를 입력하세요..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!title.trim() || loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '생성 중...' : '생성'}
          </button>
        </form>
      </div>
    </div>
  );
}