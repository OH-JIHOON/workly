import { supabase } from '../supabase/client';

export const realtime = {
  // 프로젝트 채팅 구독
  subscribeToProjectChat: (projectId: string, onMessage: (message: any) => void) => {
    return supabase
      .channel(`project-chat:${projectId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'project_messages',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          onMessage(payload.new)
        }
      )
      .subscribe()
  },

  // 업무 변경 구독
  subscribeToTaskChanges: (userId: string, onTaskChange: (task: any) => void) => {
    return supabase
      .channel(`user-tasks:${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `assignee_id=eq.${userId}`
        },
        (payload) => {
          onTaskChange(payload)
        }
      )
      .subscribe()
  },

  // 구독 해제
  unsubscribe: (subscription: any) => {
    return supabase.removeChannel(subscription)
  }
};