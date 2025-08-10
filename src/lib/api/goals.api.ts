import { supabase } from '../supabase/client';
import type { Database } from '../supabase/client';

export const goals = {
  list: async (userId: string) => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  get: async (id: string) => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  },

  create: async (goalData: Database['public']['Tables']['goals']['Insert']) => {
    const { data, error } = await supabase
      .from('goals')
      .insert(goalData)
      .select()
      .single()

    return { data, error }
  },

  update: async (id: string, updates: Database['public']['Tables']['goals']['Update']) => {
    const { data, error } = await supabase
      .from('goals')
      .update({...updates, updated_at: new Date().toISOString()})
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)

    return { error }
  }
};