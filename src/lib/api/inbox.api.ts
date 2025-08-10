import { supabase } from '../supabase/client';
import type { Database } from '../supabase/client';

export const inbox = {
  list: async (userId: string, filters?: any) => {
    let query = supabase
      .from('inbox_items')
      .select('*')
      .eq('user_id', userId)

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  create: async (inboxData: Database['public']['Tables']['inbox_items']['Insert']) => {
    const { data, error } = await supabase
      .from('inbox_items')
      .insert(inboxData)
      .select()
      .single()

    return { data, error }
  },

  update: async (id: string, updates: Database['public']['Tables']['inbox_items']['Update']) => {
    const { data, error } = await supabase
      .from('inbox_items')
      .update({...updates, updated_at: new Date().toISOString()})
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('inbox_items')
      .delete()
      .eq('id', id)

    return { error }
  }
};