/**
 * Supabase 클라이언트 설정
 * Vercel + Supabase 아키텍처를 위한 설정
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 타입 정의 (데이터베이스 스키마에 맞춤)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          avatar_url?: string
          role: 'admin' | 'manager' | 'member'
          status: 'active' | 'inactive' | 'pending_verification' | 'suspended'
          admin_role?: 'super_admin' | 'admin' | 'moderator' | 'support'
          level: number
          xp: number
          profile: any
          preferences: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          avatar_url?: string
          role?: 'admin' | 'manager' | 'member'
          status?: 'active' | 'inactive' | 'pending_verification' | 'suspended'
          admin_role?: 'super_admin' | 'admin' | 'moderator' | 'support'
          level?: number
          xp?: number
          profile?: any
          preferences?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          avatar_url?: string
          role?: 'admin' | 'manager' | 'member'
          status?: 'active' | 'inactive' | 'pending_verification' | 'suspended'
          admin_role?: 'super_admin' | 'admin' | 'moderator' | 'support'
          level?: number
          xp?: number
          profile?: any
          preferences?: any
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description?: string
          description_markdown?: string
          status: 'todo' | 'in-progress' | 'in-review' | 'completed' | 'cancelled' | 'blocked' | 'deferred'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          type: 'task' | 'bug' | 'feature' | 'improvement' | 'epic'
          due_date?: string
          start_date?: string
          completed_at?: string
          project_id?: string
          goal_id?: string
          assignee_id?: string
          reporter_id: string
          parent_task_id?: string
          estimated_hours?: number
          actual_hours: number
          progress: number
          workflow_stage_id?: string
          tags: string[]
          custom_fields: any
          checklist: any
          relationships: any
          wiki_references: any
          estimated_time_minutes?: number
          logged_time_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          description_markdown?: string
          status?: 'todo' | 'in-progress' | 'in-review' | 'completed' | 'cancelled' | 'blocked' | 'deferred'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          type?: 'task' | 'bug' | 'feature' | 'improvement' | 'epic'
          due_date?: string
          start_date?: string
          completed_at?: string
          project_id?: string
          goal_id?: string
          assignee_id?: string
          reporter_id?: string
          parent_task_id?: string
          estimated_hours?: number
          actual_hours?: number
          progress?: number
          workflow_stage_id?: string
          tags?: string[]
          custom_fields?: any
          checklist?: any
          relationships?: any
          wiki_references?: any
          estimated_time_minutes?: number
          logged_time_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          description_markdown?: string
          status?: 'todo' | 'in-progress' | 'in-review' | 'completed' | 'cancelled' | 'blocked' | 'deferred'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          type?: 'task' | 'bug' | 'feature' | 'improvement' | 'epic'
          due_date?: string
          start_date?: string
          completed_at?: string
          project_id?: string
          goal_id?: string
          assignee_id?: string
          reporter_id?: string
          parent_task_id?: string
          estimated_hours?: number
          actual_hours?: number
          progress?: number
          workflow_stage_id?: string
          tags?: string[]
          custom_fields?: any
          checklist?: any
          relationships?: any
          wiki_references?: any
          estimated_time_minutes?: number
          logged_time_minutes?: number
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description?: string
          status: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled' | 'archived'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          start_date?: string
          end_date?: string
          progress: number
          budget?: number
          currency?: string
          tags: string[]
          is_archived: boolean
          is_template: boolean
          template_id?: string
          color?: string
          icon?: string
          visibility: 'public' | 'team' | 'private'
          settings: any
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          status?: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled' | 'archived'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          start_date?: string
          end_date?: string
          progress?: number
          budget?: number
          currency?: string
          tags?: string[]
          is_archived?: boolean
          is_template?: boolean
          template_id?: string
          color?: string
          icon?: string
          visibility?: 'public' | 'team' | 'private'
          settings?: any
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled' | 'archived'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          start_date?: string
          end_date?: string
          progress?: number
          budget?: number
          currency?: string
          tags?: string[]
          is_archived?: boolean
          is_template?: boolean
          template_id?: string
          color?: string
          icon?: string
          visibility?: 'public' | 'team' | 'private'
          settings?: any
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          title: string
          vision?: string
          description?: string
          target_date?: string
          progress: number
          is_achieved: boolean
          user_id: string
          activity_level: number
          kpis: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          vision?: string
          description?: string
          target_date?: string
          progress?: number
          is_achieved?: boolean
          user_id?: string
          activity_level?: number
          kpis?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          vision?: string
          description?: string
          target_date?: string
          progress?: number
          is_achieved?: boolean
          user_id?: string
          activity_level?: number
          kpis?: any
          created_at?: string
          updated_at?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: string
          permissions: string[]
          joined_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role: string
          permissions?: string[]
          joined_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: string
          permissions?: string[]
          joined_at?: string
        }
      }
      inbox_items: {
        Row: {
          id: string
          content: string
          description?: string
          source: string
          status: 'captured' | 'clarified' | 'planned' | 'processed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          context?: string
          tags: string[]
          metadata: any
          processed_at?: string
          converted_to_task_id?: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          description?: string
          source?: string
          status?: 'captured' | 'clarified' | 'planned' | 'processed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          context?: string
          tags?: string[]
          metadata?: any
          processed_at?: string
          converted_to_task_id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          description?: string
          source?: string
          status?: 'captured' | 'clarified' | 'planned' | 'processed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          context?: string
          tags?: string[]
          metadata?: any
          processed_at?: string
          converted_to_task_id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      project_messages: {
        Row: {
          id: string
          project_id: string
          user_id: string
          content: string
          type: 'text' | 'file' | 'system'
          reply_to?: string
          metadata?: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          content: string
          type?: 'text' | 'file' | 'system'
          reply_to?: string
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          content?: string
          type?: 'text' | 'file' | 'system'
          reply_to?: string
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Supabase 클라이언트 생성
export const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// 인증 헬퍼 함수들
export const auth = {
  // Google OAuth 로그인
  signInWithGoogle: async (redirectUrl?: string) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl || `${window.location.origin}/`
      }
    })
    return { data, error }
  },

  // 로그아웃
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // 현재 세션 가져오기
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // 현재 사용자 가져오기
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // 인증 상태 변경 리스너
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// 프로필 헬퍼 함수들
export const profiles = {
  // 프로필 생성 또는 업데이트 (OAuth 로그인 후 자동 실행)
  upsert: async (userData: {
    id: string
    email: string
    first_name: string
    last_name: string
    avatar_url?: string
  }) => {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        avatar_url: userData.avatar_url,
        level: 1,
        xp: 0,
        profile: {
          displayName: `${userData.first_name} ${userData.last_name}`,
          bio: '',
          location: '',
          website: '',
          linkedinUrl: '',
          githubUrl: ''
        },
        preferences: {
          language: 'ko',
          timezone: 'Asia/Seoul',
          dateFormat: 'YYYY-MM-DD',
          timeFormat: '24h',
          weekStartDay: 1,
          notifications: {
            email: true,
            push: true,
            desktop: true,
            mentions: true,
            updates: true,
            marketing: false
          },
          privacy: {
            profileVisibility: 'public',
            activityVisibility: 'team'
          }
        }
      })
      .select()
      .single()

    return { data, error }
  },

  // 프로필 조회
  get: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    return { data, error }
  },

  // 프로필 업데이트
  update: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  }
}

// 데이터베이스 헬퍼 함수들 (기존 API 호출을 대체)
export const db = {
  // 업무(Tasks) 관련
  tasks: {
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
  },

  // 프로젝트(Projects) 관련
  projects: {
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
  },

  // 목표(Goals) 관련
  goals: {
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
  },

  // 수집함(Inbox) 관련
  inbox: {
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
  },

  // 실시간 채팅(Messages) 관련
  messages: {
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
  }
}

// 실시간 기능 헬퍼
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
}

// 기본 export
export default supabase