import { supabase } from '../supabase/client';
import type { Database } from '../supabase/client';

export const projects = {
  list: async (userId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        owner:profiles!projects_owner_id_fkey(id, first_name, last_name, avatar_url),
        members:project_members(
          id,
          role,
          permissions,
          user:profiles(id, first_name, last_name, avatar_url)
        )
      `)
      .or(`owner_id.eq.${userId},id.in.(select project_id from project_members where user_id = ${userId})`)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  get: async (id: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        owner:profiles!projects_owner_id_fkey(id, first_name, last_name, avatar_url),
        members:project_members(
          id,
          role,
          permissions,
          user:profiles(id, first_name, last_name, avatar_url)
        ),
        tasks(id, title, status, priority)
      `)
      .eq('id', id)
      .single()

    return { data, error }
  },

  create: async (projectData: Database['public']['Tables']['projects']['Insert']) => {
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    return { data, error }
  },

  update: async (id: string, updates: Database['public']['Tables']['projects']['Update']) => {
    const { data, error } = await supabase
      .from('projects')
      .update({...updates, updated_at: new Date().toISOString()})
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    return { error }
  }
};