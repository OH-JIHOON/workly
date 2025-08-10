import { supabase } from '../supabase/client';
import type { Database } from '../supabase/client';

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
  update: async (userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  },

  // 모든 프로필 조회 (필터링 및 페이징 지원)
  list: async (filters?: {
    search?: string;
    role?: string;
    admin_role?: string; // Use admin_role for consistency
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' }); // Add count for pagination

    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }
    if (filters?.role) {
      query = query.eq('role', filters.role);
    }
    if (filters?.admin_role) { // Use admin_role
      query = query.eq('admin_role', filters.admin_role);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    // Pagination
    if (filters?.page && filters?.limit) {
      const start = (filters.page - 1) * filters.limit;
      const end = start + filters.limit - 1;
      query = query.range(start, end);
    }

    const { data, error, count } = await query.order('created_at', { ascending: false });

    return { data, error, count };
  }
};