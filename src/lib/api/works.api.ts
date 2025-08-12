import { supabase } from '../supabase/client';
import type { Database } from '../supabase/client';

export const tasks = {
  list: async (userId: string, filters?: any) => {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(id, first_name, last_name, avatar_url),
        reporter:profiles!tasks_reporter_id_fkey(id, first_name, last_name, avatar_url),
        project:projects(id, title, color)
      `)
      .or(`assignee_id.eq.${userId},reporter_id.eq.${userId}`)

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters?.project_id) {
      query = query.eq('project_id', filters.project_id)
    }
    if (filters?.is_today) {
      query = query.contains('tags', ['today'])
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  get: async (id: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(id, first_name, last_name, avatar_url),
        reporter:profiles!tasks_reporter_id_fkey(id, first_name, last_name, avatar_url),
        project:projects(id, title, color)
      `)
      .eq('id', id)
      .single()

    return { data, error }
  },

  create: async (taskData: Database['public']['Tables']['tasks']['Insert']) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single()

    return { data, error }
  },

  update: async (id: string, updates: Database['public']['Tables']['tasks']['Update']) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({...updates, updated_at: new Date().toISOString()})
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    return { error }
  }
};