-- Fix infinite recursion in RLS policies

-- Drop ALL problematic policies that cause circular references
DROP POLICY IF EXISTS "Users can view projects they own or are members of" ON projects;
DROP POLICY IF EXISTS "Users can view project members for projects they have access to" ON project_members;
DROP POLICY IF EXISTS "Users can view tasks assigned to them or created by them" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks they created or are assigned to" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks they created" ON tasks;

-- Create helper functions to break circular dependencies
CREATE OR REPLACE FUNCTION public.is_project_member(project_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_id = project_uuid AND user_id = user_uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_owner(project_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects 
    WHERE id = project_uuid AND owner_id = user_uuid
  );
$$;

-- Create new simplified policies without circular references

-- Projects: Users can view projects they own, are members of, or are public
CREATE POLICY "Users can view accessible projects" ON projects
FOR SELECT USING (
  auth.uid() = owner_id 
  OR visibility = 'public'
  OR public.is_project_member(id, auth.uid())
);

-- Project Members: Users can view their own memberships and project owners can view all
CREATE POLICY "Users can view project memberships" ON project_members
FOR SELECT USING (
  user_id = auth.uid()
  OR public.is_project_owner(project_id, auth.uid())
);

-- Tasks: Simplified policies without project references to break circular dependency
CREATE POLICY "Users can view their tasks" ON tasks
FOR SELECT USING (
  auth.uid() = assignee_id 
  OR auth.uid() = reporter_id
);

CREATE POLICY "Users can create tasks they report" ON tasks
FOR INSERT WITH CHECK (
  auth.uid() = reporter_id
);

CREATE POLICY "Users can update their tasks" ON tasks
FOR UPDATE USING (
  auth.uid() = assignee_id 
  OR auth.uid() = reporter_id
);

CREATE POLICY "Users can delete tasks they created" ON tasks
FOR DELETE USING (
  auth.uid() = reporter_id
);