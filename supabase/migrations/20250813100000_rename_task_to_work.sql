-- Workly: Task 명칭을 Work로 변경
-- 날짜: 2025-08-13
-- 목적: 모든 task 관련 명칭을 work로 통일

-- 1. 새로운 ENUM 타입들 생성 (work 기반)
CREATE TYPE work_status AS ENUM ('todo', 'in-progress', 'in-review', 'completed', 'cancelled', 'blocked', 'deferred');
CREATE TYPE work_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE work_type AS ENUM ('work', 'bug', 'feature', 'improvement', 'epic');

-- 2. tasks 테이블을 works로 변경
-- 먼저 새 테이블 생성
CREATE TABLE public.works (
  id uuid default uuid_generate_v4() primary key,
  title varchar(255) not null,
  description text,
  description_markdown text,
  
  -- 상태 및 우선순위 (새로운 work ENUM 사용)
  status work_status default 'todo'::work_status,
  priority work_priority default 'medium'::work_priority,
  type work_type default 'work'::work_type,
  
  -- 날짜 관련
  due_date timestamp with time zone,
  start_date timestamp with time zone,
  completed_at timestamp with time zone,
  
  -- 관계 (선택적)
  project_id uuid references public.projects(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,
  parent_work_id uuid references public.works(id) on delete cascade,
  
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

-- 3. 기존 데이터를 새 테이블로 복사 (데이터가 있는 경우에만)
INSERT INTO public.works (
  id, title, description, description_markdown,
  status, priority, type,
  due_date, start_date, completed_at,
  project_id, goal_id, parent_work_id,
  assignee_id, reporter_id,
  estimated_hours, actual_hours, estimated_time_minutes, logged_time_minutes,
  progress, workflow_stage_id,
  tags, custom_fields, checklist, relationships, wiki_references,
  created_at, updated_at
)
SELECT 
  id, title, description, description_markdown,
  status::text::work_status, priority::text::work_priority, 
  CASE 
    WHEN type::text = 'task' THEN 'work'::work_type
    ELSE type::text::work_type
  END,
  due_date, start_date, completed_at,
  project_id, goal_id, parent_task_id,
  assignee_id, reporter_id,
  estimated_hours, actual_hours, estimated_time_minutes, logged_time_minutes,
  progress, workflow_stage_id,
  tags, custom_fields, checklist, relationships, wiki_references,
  created_at, updated_at
FROM public.tasks
WHERE EXISTS (SELECT 1 FROM public.tasks LIMIT 1);

-- 4. inbox_items 테이블의 converted_to_task_id를 converted_to_work_id로 변경
ALTER TABLE public.inbox_items 
ADD COLUMN converted_to_work_id uuid references public.works(id) on delete set null;

-- 기존 데이터 복사
UPDATE public.inbox_items 
SET converted_to_work_id = converted_to_task_id 
WHERE converted_to_task_id IS NOT NULL;

-- 5. 인덱스 생성 (works 테이블)
CREATE INDEX works_assignee_id_idx ON public.works(assignee_id);
CREATE INDEX works_reporter_id_idx ON public.works(reporter_id);
CREATE INDEX works_project_id_idx ON public.works(project_id);
CREATE INDEX works_goal_id_idx ON public.works(goal_id);
CREATE INDEX works_status_idx ON public.works(status);
CREATE INDEX works_priority_idx ON public.works(priority);
CREATE INDEX works_due_date_idx ON public.works(due_date);
CREATE INDEX works_parent_work_id_idx ON public.works(parent_work_id);

-- 6. RLS 정책 설정 (works 테이블)
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;

-- Works 정책 (tasks와 동일한 로직)
CREATE POLICY "Users can view works assigned to them or created by them" ON public.works
  FOR SELECT USING (
    auth.uid() = assignee_id OR 
    auth.uid() = reporter_id OR
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    ) OR
    auth.uid() IN (
      SELECT user_id FROM public.project_members WHERE project_id = works.project_id
    )
  );

CREATE POLICY "Users can create works" ON public.works
  FOR INSERT WITH CHECK (
    auth.uid() = reporter_id AND
    (project_id IS NULL OR 
     auth.uid() IN (
       SELECT owner_id FROM public.projects WHERE id = project_id
     ) OR
     auth.uid() IN (
       SELECT user_id FROM public.project_members WHERE project_id = works.project_id
     ))
  );

CREATE POLICY "Users can update works they created or are assigned to" ON public.works
  FOR UPDATE USING (
    auth.uid() = assignee_id OR 
    auth.uid() = reporter_id OR
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    )
  );

CREATE POLICY "Users can delete works they created" ON public.works
  FOR DELETE USING (
    auth.uid() = reporter_id OR
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    )
  );

-- 7. 새로운 함수들 생성 (work 기반)
-- 워크 통계 함수
CREATE OR REPLACE FUNCTION get_work_stats(user_uuid uuid)
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'total', count(*),
      'completed', count(*) FILTER (WHERE status = 'completed'),
      'pending', count(*) FILTER (WHERE status = 'todo'),
      'in_progress', count(*) FILTER (WHERE status = 'in-progress'),
      'overdue', count(*) FILTER (WHERE due_date < now() AND status != 'completed')
    )
    FROM public.works 
    WHERE assignee_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 프로젝트 진행률 업데이트 함수 (works 기반)
CREATE OR REPLACE FUNCTION update_project_progress_from_works()
RETURNS TRIGGER AS $$
DECLARE
    project_uuid UUID;
    total_works INTEGER;
    completed_works INTEGER;
    new_progress INTEGER;
BEGIN
    -- 변경된 워크의 프로젝트 ID 가져오기
    project_uuid := COALESCE(NEW.project_id, OLD.project_id);
    
    IF project_uuid IS NOT NULL THEN
        -- 프로젝트의 총 워크 수와 완료된 워크 수 계산
        SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
        INTO total_works, completed_works
        FROM public.works
        WHERE project_id = project_uuid;
        
        -- 진행률 계산 (0~100)
        IF total_works > 0 THEN
            new_progress := ROUND((completed_works::DECIMAL / total_works) * 100);
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

-- 8. 트리거 생성 (works 테이블)
-- updated_at 자동 업데이트
CREATE TRIGGER update_works_updated_at 
  BEFORE UPDATE ON public.works
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 워크 변경 시 프로젝트 진행률 자동 업데이트
CREATE TRIGGER update_project_progress_from_works_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.works
  FOR EACH ROW EXECUTE PROCEDURE update_project_progress_from_works();

-- 9. 기존 테이블 및 함수 정리 (나중에 안전하게 제거)
-- 주의: 프로덕션에서는 백업 후 신중하게 진행
-- DROP TABLE public.tasks CASCADE;
-- DROP TYPE task_status CASCADE;
-- DROP TYPE task_priority CASCADE; 
-- DROP TYPE task_type CASCADE;
-- DROP FUNCTION get_task_stats(uuid);
-- DROP FUNCTION update_project_progress();

-- 10. 호환성을 위한 VIEW 생성 (기존 코드가 tasks를 참조하는 경우)
CREATE VIEW public.tasks AS 
SELECT 
  id, title, description, description_markdown,
  status::text::task_status AS status,
  priority::text::task_priority AS priority,
  CASE 
    WHEN type = 'work' THEN 'task'::task_type
    ELSE type::text::task_type
  END AS type,
  due_date, start_date, completed_at,
  project_id, goal_id, 
  parent_work_id AS parent_task_id,
  assignee_id, reporter_id,
  estimated_hours, actual_hours, estimated_time_minutes, logged_time_minutes,
  progress, workflow_stage_id,
  tags, custom_fields, checklist, relationships, wiki_references,
  created_at, updated_at
FROM public.works;

-- VIEW에 대한 RLS 정책
ALTER VIEW public.tasks SET (security_invoker = true);

COMMENT ON TABLE public.works IS 'Workly 워크 테이블 - task에서 work로 명칭 변경';
COMMENT ON VIEW public.tasks IS '호환성을 위한 tasks 뷰 - 실제 데이터는 works 테이블에 저장';