-- Workly 데이터베이스 스키마 (Supabase)
-- Vercel + Supabase 아키텍처용 전체 스키마
-- 버전: 2.0 (2025-08-10)

-- 확장 프로그램 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums 생성
create type user_role as enum ('admin', 'manager', 'member');
create type user_status as enum ('active', 'inactive', 'pending_verification', 'suspended');
create type admin_role as enum ('super_admin', 'admin', 'moderator', 'support');

create type task_status as enum ('todo', 'in-progress', 'in-review', 'completed', 'cancelled', 'blocked', 'deferred');
create type task_priority as enum ('low', 'medium', 'high', 'urgent');
create type task_type as enum ('task', 'bug', 'feature', 'improvement', 'epic');

create type project_status as enum ('planning', 'in-progress', 'on-hold', 'completed', 'cancelled', 'archived');
create type project_priority as enum ('low', 'medium', 'high', 'urgent');
create type project_visibility as enum ('public', 'team', 'private');

create type inbox_status as enum ('captured', 'clarified', 'planned', 'processed');
create type message_type as enum ('text', 'file', 'system');

-- =============================================================================
-- 1. 사용자 프로필 테이블 (auth.users 확장)
-- =============================================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email varchar(255) unique not null,
  first_name varchar(100) not null,
  last_name varchar(100) not null,
  avatar_url text,
  role user_role default 'member'::user_role,
  status user_status default 'pending_verification'::user_status,
  admin_role admin_role,
  level integer default 1,
  xp integer default 0,
  
  -- JSONB 필드들
  profile jsonb default '{
    "displayName": "",
    "bio": "",
    "location": "",
    "website": "",
    "linkedinUrl": "",
    "githubUrl": ""
  }'::jsonb,
  
  preferences jsonb default '{
    "language": "ko",
    "timezone": "Asia/Seoul",
    "dateFormat": "YYYY-MM-DD",
    "timeFormat": "24h",
    "weekStartDay": 1,
    "notifications": {
      "email": true,
      "push": true,
      "desktop": true,
      "mentions": true,
      "updates": true,
      "marketing": false
    },
    "privacy": {
      "profileVisibility": "public",
      "activityVisibility": "team"
    }
  }'::jsonb,
  
  -- 메타데이터
  last_login_at timestamp with time zone,
  email_verified_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =============================================================================
-- 2. 프로젝트 테이블
-- =============================================================================
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  title varchar(255) not null,
  description text,
  status project_status default 'planning'::project_status,
  priority project_priority default 'medium'::project_priority,
  
  -- 날짜 관련
  start_date date,
  end_date date,
  
  -- 진행률 및 예산
  progress integer default 0,
  budget decimal(12,2),
  currency varchar(3),
  
  -- 분류 및 설정
  tags text[] default array[]::text[],
  is_archived boolean default false,
  is_template boolean default false,
  template_id uuid,
  color varchar(7),
  icon varchar(50),
  visibility project_visibility default 'private'::project_visibility,
  
  -- 프로젝트 설정 (JSONB)
  settings jsonb default '{
    "allowGuestAccess": false,
    "requireApprovalForTasks": false,
    "enableTimeTracking": true,
    "enableBudgetTracking": false,
    "enableNotifications": true,
    "enableComments": true,
    "enableFileAttachments": true,
    "defaultTaskPriority": "medium",
    "workflowStages": [
      {"id": "todo", "name": "To Do", "color": "#6B7280", "order": 1, "isDefault": true},
      {"id": "in-progress", "name": "In Progress", "color": "#3B82F6", "order": 2},
      {"id": "review", "name": "Review", "color": "#F59E0B", "order": 3},
      {"id": "completed", "name": "Completed", "color": "#10B981", "order": 4}
    ]
  }'::jsonb,
  
  -- 관계
  owner_id uuid references public.profiles(id) on delete cascade not null,
  
  -- 메타데이터
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =============================================================================
-- 3. 프로젝트 멤버 테이블
-- =============================================================================
create table public.project_members (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role varchar(50) default 'member',
  permissions text[] default array['view_project', 'create_tasks', 'edit_own_tasks']::text[],
  joined_at timestamp with time zone default now(),
  
  -- 유니크 제약
  unique(project_id, user_id)
);

-- =============================================================================
-- 4. 목표 테이블
-- =============================================================================
create table public.goals (
  id uuid default uuid_generate_v4() primary key,
  title varchar(255) not null,
  vision text,
  description text,
  target_date date,
  progress integer default 0,
  is_achieved boolean default false,
  activity_level integer default 0,
  
  -- KPI 데이터 (JSONB)
  kpis jsonb default '[]'::jsonb,
  
  -- 관계
  user_id uuid references public.profiles(id) on delete cascade not null,
  
  -- 메타데이터
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =============================================================================
-- 5. 업무 테이블
-- =============================================================================
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  title varchar(255) not null,
  description text,
  description_markdown text,
  
  -- 상태 및 우선순위
  status task_status default 'todo'::task_status,
  priority task_priority default 'medium'::task_priority,
  type task_type default 'task'::task_type,
  
  -- 날짜 관련
  due_date timestamp with time zone,
  start_date timestamp with time zone,
  completed_at timestamp with time zone,
  
  -- 관계 (선택적)
  project_id uuid references public.projects(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,
  parent_task_id uuid references public.tasks(id) on delete cascade,
  
  -- 담당자 관련 (필수)
  assignee_id uuid references public.profiles(id) on delete set null,
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  
  -- 시간 추정/기록
  estimated_hours decimal(8,2),
  actual_hours decimal(8,2) default 0,
  estimated_time_minutes integer,
  logged_time_minutes integer default 0,
  
  -- 진행률
  progress integer default 0,
  workflow_stage_id varchar(50),
  
  -- 분류
  tags text[] default array[]::text[],
  
  -- JSON 필드들
  custom_fields jsonb default '{}'::jsonb,
  checklist jsonb default '[]'::jsonb,
  relationships jsonb default '[]'::jsonb,
  wiki_references jsonb default '[]'::jsonb,
  
  -- 메타데이터
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =============================================================================
-- 6. 수집함 테이블
-- =============================================================================
create table public.inbox_items (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  description text,
  source varchar(100) default 'manual',
  status inbox_status default 'captured'::inbox_status,
  priority task_priority,
  context text,
  tags text[] default array[]::text[],
  
  -- 메타데이터 (JSONB)
  metadata jsonb default '{}'::jsonb,
  
  -- 처리 관련
  processed_at timestamp with time zone,
  converted_to_task_id uuid references public.tasks(id) on delete set null,
  
  -- 관계
  user_id uuid references public.profiles(id) on delete cascade not null,
  
  -- 메타데이터
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =============================================================================
-- 7. 프로젝트 메시지 테이블 (실시간 채팅)
-- =============================================================================
create table public.project_messages (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  type message_type default 'text'::message_type,
  reply_to uuid references public.project_messages(id) on delete set null,
  
  -- 메타데이터 (JSONB)
  metadata jsonb default '{}'::jsonb,
  
  -- 메타데이터
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =============================================================================
-- 인덱스 생성
-- =============================================================================

-- profiles 인덱스
create index profiles_email_idx on public.profiles(email);
create index profiles_role_idx on public.profiles(role);
create index profiles_status_idx on public.profiles(status);

-- projects 인덱스
create index projects_owner_id_idx on public.projects(owner_id);
create index projects_status_idx on public.projects(status);
create index projects_visibility_idx on public.projects(visibility);

-- tasks 인덱스
create index tasks_assignee_id_idx on public.tasks(assignee_id);
create index tasks_reporter_id_idx on public.tasks(reporter_id);
create index tasks_project_id_idx on public.tasks(project_id);
create index tasks_goal_id_idx on public.tasks(goal_id);
create index tasks_status_idx on public.tasks(status);
create index tasks_priority_idx on public.tasks(priority);
create index tasks_due_date_idx on public.tasks(due_date);
create index tasks_parent_task_id_idx on public.tasks(parent_task_id);

-- inbox_items 인덱스
create index inbox_items_user_id_idx on public.inbox_items(user_id);
create index inbox_items_status_idx on public.inbox_items(status);

-- project_messages 인덱스
create index project_messages_project_id_idx on public.project_messages(project_id);
create index project_messages_created_at_idx on public.project_messages(created_at);

-- project_members 인덱스
create index project_members_project_id_idx on public.project_members(project_id);
create index project_members_user_id_idx on public.project_members(user_id);

-- goals 인덱스
create index goals_user_id_idx on public.goals(user_id);

-- =============================================================================
-- Row Level Security (RLS) 정책
-- =============================================================================

-- RLS 활성화
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.goals enable row level security;
alter table public.inbox_items enable row level security;
alter table public.project_messages enable row level security;

-- Profiles 정책
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Projects 정책
create policy "Users can view projects they own or are members of" on public.projects
  for select using (
    auth.uid() = owner_id or 
    auth.uid() in (
      select user_id from public.project_members 
      where project_id = projects.id
    ) or
    visibility = 'public'
  );

create policy "Users can create projects" on public.projects
  for insert with check (auth.uid() = owner_id);

create policy "Project owners can update their projects" on public.projects
  for update using (auth.uid() = owner_id);

create policy "Project owners can delete their projects" on public.projects
  for delete using (auth.uid() = owner_id);

-- Project Members 정책
create policy "Users can view project members for projects they have access to" on public.project_members
  for select using (
    auth.uid() in (
      select owner_id from public.projects where id = project_id
    ) or
    auth.uid() in (
      select user_id from public.project_members where project_id = project_members.project_id
    )
  );

create policy "Project owners can manage members" on public.project_members
  for all using (
    auth.uid() in (
      select owner_id from public.projects where id = project_id
    )
  );

-- Tasks 정책
create policy "Users can view tasks assigned to them or created by them" on public.tasks
  for select using (
    auth.uid() = assignee_id or 
    auth.uid() = reporter_id or
    auth.uid() in (
      select owner_id from public.projects where id = project_id
    ) or
    auth.uid() in (
      select user_id from public.project_members where project_id = tasks.project_id
    )
  );

create policy "Users can create tasks" on public.tasks
  for insert with check (
    auth.uid() = reporter_id and
    (project_id is null or 
     auth.uid() in (
       select owner_id from public.projects where id = project_id
     ) or
     auth.uid() in (
       select user_id from public.project_members where project_id = tasks.project_id
     ))
  );

create policy "Users can update tasks they created or are assigned to" on public.tasks
  for update using (
    auth.uid() = assignee_id or 
    auth.uid() = reporter_id or
    auth.uid() in (
      select owner_id from public.projects where id = project_id
    )
  );

create policy "Users can delete tasks they created" on public.tasks
  for delete using (
    auth.uid() = reporter_id or
    auth.uid() in (
      select owner_id from public.projects where id = project_id
    )
  );

-- Goals 정책
create policy "Users can only access their own goals" on public.goals
  for all using (auth.uid() = user_id);

-- Inbox Items 정책
create policy "Users can only access their own inbox items" on public.inbox_items
  for all using (auth.uid() = user_id);

-- Project Messages 정책
create policy "Users can view messages for projects they are members of" on public.project_messages
  for select using (
    auth.uid() in (
      select owner_id from public.projects where id = project_id
    ) or
    auth.uid() in (
      select user_id from public.project_members where project_id = project_messages.project_id
    )
  );

create policy "Users can send messages to projects they are members of" on public.project_messages
  for insert with check (
    auth.uid() = user_id and
    (auth.uid() in (
      select owner_id from public.projects where id = project_id
    ) or
    auth.uid() in (
      select user_id from public.project_members where project_id = project_messages.project_id
    ))
  );

-- =============================================================================
-- 함수 생성
-- =============================================================================

-- 프로필 자동 생성 함수 (OAuth 로그인 후 트리거)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 업무 통계 함수
create or replace function get_task_stats(user_uuid uuid)
returns json as $$
begin
  return (
    select json_build_object(
      'total', count(*),
      'completed', count(*) filter (where status = 'completed'),
      'pending', count(*) filter (where status = 'todo'),
      'in_progress', count(*) filter (where status = 'in-progress'),
      'overdue', count(*) filter (where due_date < now() and status != 'completed')
    )
    from public.tasks 
    where assignee_id = user_uuid
  );
end;
$$ language plpgsql security definer;

-- updated_at 자동 업데이트 함수
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =============================================================================
-- 트리거 생성
-- =============================================================================

-- 새 사용자 생성 시 프로필 자동 생성
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at 자동 업데이트 트리거들
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure update_updated_at_column();

create trigger update_projects_updated_at before update on public.projects
  for each row execute procedure update_updated_at_column();

create trigger update_tasks_updated_at before update on public.tasks
  for each row execute procedure update_updated_at_column();

create trigger update_goals_updated_at before update on public.goals
  for each row execute procedure update_updated_at_column();

create trigger update_inbox_items_updated_at before update on public.inbox_items
  for each row execute procedure update_updated_at_column();

create trigger update_project_messages_updated_at before update on public.project_messages
  for each row execute procedure update_updated_at_column();

-- =============================================================================
-- 초기 데이터 삽입 (선택적)
-- =============================================================================

-- 개발용 테스트 데이터는 별도 스크립트로 관리

-- 프로젝트 진행률 업데이트 함수
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
DECLARE
    project_uuid UUID;
    total_tasks INTEGER;
    completed_tasks INTEGER;
    new_progress INTEGER;
BEGIN
    -- 변경된 업무의 프로젝트 ID 가져오기
    project_uuid := COALESCE(NEW.project_id, OLD.project_id);
    
    IF project_uuid IS NOT NULL THEN
        -- 프로젝트의 총 업무 수와 완료된 업무 수 계산
        SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
        INTO total_tasks, completed_tasks
        FROM public.tasks
        WHERE project_id = project_uuid;
        
        -- 진행률 계산 (0~100)
        IF total_tasks > 0 THEN
            new_progress := ROUND((completed_tasks::DECIMAL / total_tasks) * 100);
        ELSE
            new_progress := 0;
        END IF;
        
        -- 프로젝트 진행률 업데이트
        UPDATE public.projects
        SET progress = new_progress,
            updated_at = NOW()
        WHERE id = project_uuid;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 업무 변경 시 프로젝트 진행률 자동 업데이트 트리거
CREATE TRIGGER update_project_progress_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.tasks
    FOR EACH ROW EXECUTE PROCEDURE update_project_progress();

-- 실시간 알림 테이블 (선택사항)
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

-- 스키마 설정 완료
COMMENT ON SCHEMA public IS 'Workly application database schema for Supabase v2.0';

-- 샘플 데이터나 초기 설정은 별도 스크립트에서 관리
-- 실제 사용자 데이터는 Supabase Auth를 통해서만 생성