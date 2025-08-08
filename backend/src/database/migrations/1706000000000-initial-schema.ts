import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1706000000000 implements MigrationInterface {
  name = 'InitialSchema1706000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ENUM 타입들 생성
    await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('member', 'admin', 'super_admin')`);
    await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('pending_verification', 'active', 'inactive', 'suspended')`);
    await queryRunner.query(`CREATE TYPE "public"."projects_status_enum" AS ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled')`);
    await queryRunner.query(`CREATE TYPE "public"."projects_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent')`);
    await queryRunner.query(`CREATE TYPE "public"."projects_visibility_enum" AS ENUM('private', 'internal', 'public')`);
    await queryRunner.query(`CREATE TYPE "public"."project_members_role_enum" AS ENUM('owner', 'admin', 'member', 'viewer')`);
    await queryRunner.query(`CREATE TYPE "public"."project_applications_status_enum" AS ENUM('pending', 'approved', 'rejected', 'withdrawn')`);
    await queryRunner.query(`CREATE TYPE "public"."tasks_status_enum" AS ENUM('todo', 'in_progress', 'in_review', 'done', 'blocked', 'cancelled')`);
    await queryRunner.query(`CREATE TYPE "public"."tasks_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent')`);
    await queryRunner.query(`CREATE TYPE "public"."tasks_type_enum" AS ENUM('task', 'feature', 'bug', 'improvement', 'epic')`);
    await queryRunner.query(`CREATE TYPE "public"."task_dependencies_type_enum" AS ENUM('blocks', 'blocked_by', 'related')`);

    // Users 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "name" character varying NOT NULL,
        "avatar" character varying,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'member',
        "status" "public"."users_status_enum" NOT NULL DEFAULT 'pending_verification',
        "profile" jsonb NOT NULL,
        "preferences" jsonb NOT NULL,
        "lastLoginAt" TIMESTAMP,
        "emailVerifiedAt" TIMESTAMP,
        "googleId" character varying,
        "resetPasswordToken" character varying,
        "resetPasswordExpiresAt" TIMESTAMP,
        "emailVerificationToken" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    // Users 인덱스 생성
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_googleId" ON "users" ("googleId")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_status" ON "users" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "users" ("role")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_createdAt" ON "users" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_lastLoginAt" ON "users" ("lastLoginAt")`);

    // Projects 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text,
        "status" "public"."projects_status_enum" NOT NULL DEFAULT 'planning',
        "priority" "public"."projects_priority_enum" NOT NULL DEFAULT 'medium',
        "startDate" date,
        "endDate" date,
        "progress" integer NOT NULL DEFAULT 0,
        "budget" numeric(12,2),
        "currency" character varying(3),
        "tags" text array NOT NULL DEFAULT '{}',
        "isArchived" boolean NOT NULL DEFAULT false,
        "isTemplate" boolean NOT NULL DEFAULT false,
        "templateId" character varying,
        "color" character varying(7),
        "icon" character varying,
        "visibility" "public"."projects_visibility_enum" NOT NULL DEFAULT 'private',
        "settings" jsonb NOT NULL,
        "ownerId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_projects_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_projects_ownerId" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Projects 인덱스 생성
    await queryRunner.query(`CREATE INDEX "IDX_projects_title" ON "projects" ("title")`);
    await queryRunner.query(`CREATE INDEX "IDX_projects_status" ON "projects" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_projects_priority" ON "projects" ("priority")`);
    await queryRunner.query(`CREATE INDEX "IDX_projects_ownerId" ON "projects" ("ownerId")`);
    await queryRunner.query(`CREATE INDEX "IDX_projects_createdAt" ON "projects" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_projects_startDate" ON "projects" ("startDate")`);
    await queryRunner.query(`CREATE INDEX "IDX_projects_endDate" ON "projects" ("endDate")`);
    await queryRunner.query(`CREATE INDEX "IDX_projects_isArchived" ON "projects" ("isArchived")`);

    // Project Members 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "project_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "projectId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "role" "public"."project_members_role_enum" NOT NULL DEFAULT 'member',
        "permissions" text array NOT NULL,
        "joinedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_project_members_projectId_userId" UNIQUE ("projectId", "userId"),
        CONSTRAINT "PK_project_members_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_project_members_projectId" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_project_members_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Project Members 인덱스 생성
    await queryRunner.query(`CREATE INDEX "IDX_project_members_projectId" ON "project_members" ("projectId")`);
    await queryRunner.query(`CREATE INDEX "IDX_project_members_userId" ON "project_members" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_project_members_role" ON "project_members" ("role")`);

    // Project Applications 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "project_applications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "project_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "coverLetter" text NOT NULL,
        "skills" text array,
        "experience" text,
        "available_hours" integer NOT NULL DEFAULT 20,
        "expected_role" character varying NOT NULL DEFAULT 'member',
        "status" "public"."project_applications_status_enum" NOT NULL DEFAULT 'pending',
        "reviewNote" text,
        "reviewed_by" uuid,
        "reviewed_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_project_applications_project_user" UNIQUE ("project_id", "user_id"),
        CONSTRAINT "PK_project_applications_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_project_applications_project_id" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_project_applications_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_project_applications_reviewed_by" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Project Applications 인덱스 생성
    await queryRunner.query(`CREATE INDEX "IDX_project_applications_project_id" ON "project_applications" ("project_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_project_applications_user_id" ON "project_applications" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_project_applications_status" ON "project_applications" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_project_applications_created_at" ON "project_applications" ("created_at")`);

    // Task Labels 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "task_labels" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "color" character varying(7) NOT NULL,
        "description" text,
        "projectId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_task_labels_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_task_labels_projectId" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE
      )
    `);

    // Task Labels 인덱스 생성
    await queryRunner.query(`CREATE INDEX "IDX_task_labels_name" ON "task_labels" ("name")`);
    await queryRunner.query(`CREATE INDEX "IDX_task_labels_projectId" ON "task_labels" ("projectId")`);

    // Tasks 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text,
        "descriptionMarkdown" text,
        "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'todo',
        "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'medium',
        "type" "public"."tasks_type_enum" NOT NULL DEFAULT 'task',
        "dueDate" TIMESTAMP,
        "startDate" TIMESTAMP,
        "completedAt" TIMESTAMP,
        "projectId" uuid,
        "assigneeId" uuid,
        "reporterId" uuid NOT NULL,
        "parentTaskId" uuid,
        "estimatedHours" numeric(8,2),
        "actualHours" numeric(8,2) NOT NULL DEFAULT 0,
        "progress" integer NOT NULL DEFAULT 0,
        "workflowStageId" character varying,
        "tags" text array NOT NULL DEFAULT '{}',
        "customFields" jsonb NOT NULL DEFAULT '{}',
        "checklist" jsonb NOT NULL DEFAULT '[]',
        "relationships" jsonb NOT NULL DEFAULT '[]',
        "wikiReferences" jsonb NOT NULL DEFAULT '[]',
        "estimatedTimeMinutes" integer,
        "loggedTimeMinutes" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tasks_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tasks_projectId" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tasks_assigneeId" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tasks_reporterId" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tasks_parentTaskId" FOREIGN KEY ("parentTaskId") REFERENCES "tasks"("id") ON DELETE CASCADE
      )
    `);

    // Tasks 인덱스 생성
    await queryRunner.query(`CREATE INDEX "IDX_tasks_title" ON "tasks" ("title")`);
    await queryRunner.query(`CREATE INDEX "IDX_tasks_status" ON "tasks" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_tasks_priority" ON "tasks" ("priority")`);
    await queryRunner.query(`CREATE INDEX "IDX_tasks_type" ON "tasks" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_tasks_projectId" ON "tasks" ("projectId")`);
    await queryRunner.query(`CREATE INDEX "IDX_tasks_assigneeId" ON "tasks" ("assigneeId")`);
    await queryRunner.query(`CREATE INDEX "IDX_tasks_reporterId" ON "tasks" ("reporterId")`);
    await queryRunner.query(`CREATE INDEX "IDX_tasks_parentTaskId" ON "tasks" ("parentTaskId")`);
    await queryRunner.query(`CREATE INDEX "IDX_tasks_dueDate" ON "tasks" ("dueDate")`);
    await queryRunner.query(`CREATE INDEX "IDX_tasks_createdAt" ON "tasks" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_tasks_workflowStageId" ON "tasks" ("workflowStageId")`);

    // Task Labels Mapping 테이블 생성 (다대다 관계)
    await queryRunner.query(`
      CREATE TABLE "task_labels_mapping" (
        "taskId" uuid NOT NULL,
        "labelId" uuid NOT NULL,
        CONSTRAINT "PK_task_labels_mapping" PRIMARY KEY ("taskId", "labelId"),
        CONSTRAINT "FK_task_labels_mapping_taskId" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_task_labels_mapping_labelId" FOREIGN KEY ("labelId") REFERENCES "task_labels"("id") ON DELETE CASCADE
      )
    `);

    // Task Watchers 테이블 생성 (다대다 관계)
    await queryRunner.query(`
      CREATE TABLE "task_watchers" (
        "taskId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        CONSTRAINT "PK_task_watchers" PRIMARY KEY ("taskId", "userId"),
        CONSTRAINT "FK_task_watchers_taskId" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_task_watchers_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Task Comments 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "task_comments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "content" text NOT NULL,
        "taskId" uuid NOT NULL,
        "authorId" uuid NOT NULL,
        "parentId" uuid,
        "isInternal" boolean NOT NULL DEFAULT false,
        "isEdited" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_task_comments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_task_comments_taskId" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_task_comments_authorId" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_task_comments_parentId" FOREIGN KEY ("parentId") REFERENCES "task_comments"("id") ON DELETE CASCADE
      )
    `);

    // Task Comments 인덱스 생성
    await queryRunner.query(`CREATE INDEX "IDX_task_comments_taskId" ON "task_comments" ("taskId")`);
    await queryRunner.query(`CREATE INDEX "IDX_task_comments_authorId" ON "task_comments" ("authorId")`);
    await queryRunner.query(`CREATE INDEX "IDX_task_comments_parentId" ON "task_comments" ("parentId")`);
    await queryRunner.query(`CREATE INDEX "IDX_task_comments_createdAt" ON "task_comments" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_task_comments_isInternal" ON "task_comments" ("isInternal")`);

    // Task Dependencies 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "task_dependencies" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "dependentTaskId" uuid NOT NULL,
        "dependsOnTaskId" uuid NOT NULL,
        "type" "public"."task_dependencies_type_enum" NOT NULL DEFAULT 'blocks',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_task_dependencies_dependentTaskId_dependsOnTaskId" UNIQUE ("dependentTaskId", "dependsOnTaskId"),
        CONSTRAINT "PK_task_dependencies_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_task_dependencies_dependentTaskId" FOREIGN KEY ("dependentTaskId") REFERENCES "tasks"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_task_dependencies_dependsOnTaskId" FOREIGN KEY ("dependsOnTaskId") REFERENCES "tasks"("id") ON DELETE CASCADE
      )
    `);

    // Task Dependencies 인덱스 생성
    await queryRunner.query(`CREATE INDEX "IDX_task_dependencies_dependentTaskId" ON "task_dependencies" ("dependentTaskId")`);
    await queryRunner.query(`CREATE INDEX "IDX_task_dependencies_dependsOnTaskId" ON "task_dependencies" ("dependsOnTaskId")`);
    await queryRunner.query(`CREATE INDEX "IDX_task_dependencies_type" ON "task_dependencies" ("type")`);

    // Time Entries 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "time_entries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "description" text,
        "duration" integer NOT NULL,
        "startTime" TIMESTAMP NOT NULL,
        "endTime" TIMESTAMP,
        "taskId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "billable" boolean NOT NULL DEFAULT false,
        "approved" boolean NOT NULL DEFAULT false,
        "approvedBy" uuid,
        "approvedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_time_entries_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_time_entries_taskId" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_time_entries_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_time_entries_approvedBy" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Time Entries 인덱스 생성
    await queryRunner.query(`CREATE INDEX "IDX_time_entries_taskId" ON "time_entries" ("taskId")`);
    await queryRunner.query(`CREATE INDEX "IDX_time_entries_userId" ON "time_entries" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_time_entries_startTime" ON "time_entries" ("startTime")`);
    await queryRunner.query(`CREATE INDEX "IDX_time_entries_billable" ON "time_entries" ("billable")`);
    await queryRunner.query(`CREATE INDEX "IDX_time_entries_approved" ON "time_entries" ("approved")`);
    await queryRunner.query(`CREATE INDEX "IDX_time_entries_createdAt" ON "time_entries" ("createdAt")`);

    // Files 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "files" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "filename" character varying NOT NULL,
        "originalName" character varying NOT NULL,
        "mimetype" character varying NOT NULL,
        "size" bigint NOT NULL,
        "path" character varying NOT NULL,
        "url" character varying NOT NULL,
        "thumbnailUrl" character varying,
        "uploaderId" uuid NOT NULL,
        "entityType" character varying,
        "entityId" character varying,
        "isPublic" boolean NOT NULL DEFAULT false,
        "isProcessed" boolean NOT NULL DEFAULT false,
        "tags" text array NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_files_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_files_uploaderId" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Files 인덱스 생성
    await queryRunner.query(`CREATE INDEX "IDX_files_filename" ON "files" ("filename")`);
    await queryRunner.query(`CREATE INDEX "IDX_files_mimetype" ON "files" ("mimetype")`);
    await queryRunner.query(`CREATE INDEX "IDX_files_uploaderId" ON "files" ("uploaderId")`);
    await queryRunner.query(`CREATE INDEX "IDX_files_createdAt" ON "files" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_files_entityType_entityId" ON "files" ("entityType", "entityId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 테이블 삭제 (외래키 종속성 순서대로)
    await queryRunner.query(`DROP TABLE IF EXISTS "files"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "time_entries"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_dependencies"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_comments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_watchers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_labels_mapping"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tasks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_labels"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "project_applications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "project_members"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "projects"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    
    // ENUM 타입들 삭제
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."task_dependencies_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."tasks_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."tasks_priority_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."tasks_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."project_applications_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."project_members_role_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."projects_visibility_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."projects_priority_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."projects_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
  }
}