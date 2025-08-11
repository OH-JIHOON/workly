/**
 * Supabase 클라이언트 설정
 * Vercel + Supabase 아키텍처를 위한 설정
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

let supabaseClient: SupabaseClient<Database>;

function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 디버깅을 위한 로그 추가
  console.log('🔍 Supabase Client 초기화:', {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined',
    key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 30)}...` : 'undefined',
    NODE_ENV: process.env.NODE_ENV
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ CRITICAL: Supabase environment variables are not set!');
    console.error('Expected vars:', {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? 'SET' : 'MISSING'
    });
    
    // 개발 환경에서만 fallback 사용
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔶 개발 환경: localhost fallback 사용');
      return createClient('http://localhost:54321', 'dummy-key');
    } else {
      // 프로덕션에서도 임시 fallback (환경 변수 설정 후 제거 예정)
      console.warn('🚨 임시 fallback 사용 - 환경 변수를 설정해주세요');
      const fallbackUrl = 'https://wryixncvydcnalvepbox.supabase.co';
      const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyeWl4bmN2eWRjbmFsdmVwYm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTA5OTAsImV4cCI6MjA3MDM4Njk5MH0.O9JRA3iCeSxHKkXcN-p7ySY0rZS6W0aonG_a8CvNzC4';
      
      supabaseClient = createClient<Database>(fallbackUrl, fallbackKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
      
      return supabaseClient;
    }
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  return supabaseClient;
}

export const supabase: SupabaseClient<Database> = getSupabaseClient();
