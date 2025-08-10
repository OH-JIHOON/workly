import { supabase } from '../supabase/client';
import type { Database } from '../supabase/client';

export const messages = {
  list: async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_messages')
      .select(`
        *,
        user:profiles(id, first_name, last_name, avatar_url)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    return { data, error }
  },

  create: async (messageData: Database['public']['Tables']['project_messages']['Insert']) => {
    const { data, error } = await supabase
      .from('project_messages')
      .insert(messageData)
      .select(`
        *,
        user:profiles(id, first_name, last_name, avatar_url)
      `)
      .single()

    return { data, error }
  },

  // 실시간 메시지 구독
  subscribe: (projectId: string, callback: (message: any) => void) => {
    return supabase
      .channel(`project:${projectId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'project_messages',
          filter: `project_id=eq.${projectId}`
        },
        callback
      )
      .subscribe()
  }
};