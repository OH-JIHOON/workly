import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { 
  ProjectStatus, 
  ProjectPriority, 
  ProjectVisibility,
  ProjectSettings,
  ProjectPermission,
  WorkflowStage
} from '@workly/shared';
import { User } from './user.entity';
import { Task } from './task.entity';
import { ProjectMember } from './project-member.entity';

@Entity('projects')
@Index(['title'])
@Index(['status'])
@Index(['priority'])
@Index(['ownerId'])
@Index(['createdAt'])
@Index(['startDate'])
@Index(['endDate'])
@Index(['isArchived'])
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
  })
  status: ProjectStatus;

  @Column({
    type: 'enum',
    enum: ProjectPriority,
    default: ProjectPriority.MEDIUM,
  })
  priority: ProjectPriority;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budget?: number;

  @Column({ length: 3, nullable: true })
  currency?: string;

  @Column('simple-array', { default: [] })
  tags: string[];

  @Column({ default: false })
  isArchived: boolean;

  @Column({ default: false })
  isTemplate: boolean;

  @Column({ nullable: true })
  templateId?: string;

  @Column({ length: 7, nullable: true })
  color?: string;

  @Column({ nullable: true })
  icon?: string;

  @Column({
    type: 'enum',
    enum: ProjectVisibility,
    default: ProjectVisibility.PRIVATE,
  })
  visibility: ProjectVisibility;

  @Column('jsonb')
  settings: ProjectSettings;

  @Column()
  ownerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 관계 설정
  @ManyToOne(() => User, { eager: true })
  owner: User;

  @OneToMany(() => ProjectMember, member => member.project, { 
    cascade: true, 
    eager: false 
  })
  members: ProjectMember[];

  @OneToMany(() => Task, task => task.project, { 
    cascade: true 
  })
  tasks: Task[];

  // 계산된 필드들
  tasksCount: number;
  completedTasksCount: number;

  // 기본값 설정
  @BeforeInsert()
  @BeforeUpdate()
  setDefaultValues() {
    if (!this.settings) {
      this.settings = {
        allowGuestAccess: false,
        requireApprovalForTasks: false,
        enableTimeTracking: true,
        enableBudgetTracking: false,
        enableNotifications: true,
        enableComments: true,
        enableFileAttachments: true,
        defaultTaskPriority: ProjectPriority.MEDIUM,
        workflowStages: [
          {
            id: 'todo',
            name: 'To Do',
            description: '작업 대기',
            color: '#6B7280',
            order: 1,
            isDefault: true,
            isCompleted: false,
          },
          {
            id: 'in-progress',
            name: 'In Progress',
            description: '진행 중',
            color: '#3B82F6',
            order: 2,
            isDefault: false,
            isCompleted: false,
          },
          {
            id: 'review',
            name: 'Review',
            description: '검토 중',
            color: '#F59E0B',
            order: 3,
            isDefault: false,
            isCompleted: false,
          },
          {
            id: 'completed',
            name: 'Completed',
            description: '완료',
            color: '#10B981',
            order: 4,
            isDefault: false,
            isCompleted: true,
          },
        ] as any[],
      } as ProjectSettings;
    }

    if (!this.tags) {
      this.tags = [];
    }
  }

  // 진행률 계산
  calculateProgress(): number {
    if (!this.tasks || this.tasks.length === 0) {
      return 0;
    }

    const completedTasks = this.tasks.filter(task => 
      task.status === 'completed'
    ).length;

    return Math.round((completedTasks / this.tasks.length) * 100);
  }

  // 프로젝트 완료 처리
  complete(): void {
    this.status = ProjectStatus.COMPLETED;
    this.progress = 100;
  }

  // 프로젝트 일시 중단
  hold(): void {
    this.status = ProjectStatus.ON_HOLD;
  }

  // 프로젝트 재개
  resume(): void {
    this.status = ProjectStatus.IN_PROGRESS;
  }

  // 프로젝트 취소
  cancel(): void {
    this.status = ProjectStatus.CANCELLED;
  }

  // 프로젝트 아카이브
  archive(): void {
    this.isArchived = true;
    this.status = ProjectStatus.ARCHIVED;
  }

  // 프로젝트 복원
  unarchive(): void {
    this.isArchived = false;
    if (this.status === ProjectStatus.ARCHIVED) {
      this.status = ProjectStatus.PLANNING;
    }
  }

  // 마감일 체크
  isOverdue(): boolean {
    if (!this.endDate) return false;
    return new Date() > this.endDate && this.status !== ProjectStatus.COMPLETED;
  }

  // 곧 마감되는지 체크 (7일 이내)
  isDueSoon(): boolean {
    if (!this.endDate) return false;
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    return this.endDate <= sevenDaysFromNow && !this.isOverdue();
  }

  // 프로젝트 기간 계산 (일 단위)
  getDuration(): number | null {
    if (!this.startDate || !this.endDate) return null;
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // 권한 확인 메서드들
  isOwner(userId: string): boolean {
    return this.ownerId === userId;
  }

  isMember(userId: string): boolean {
    return this.members?.some(member => member.userId === userId) || false;
  }

  canView(userId: string): boolean {
    if (this.visibility === ProjectVisibility.PUBLIC) return true;
    return this.isOwner(userId) || this.isMember(userId);
  }

  canEdit(userId: string): boolean {
    if (this.isOwner(userId)) return true;
    const member = this.members?.find(m => m.userId === userId);
    return member?.permissions?.includes(ProjectPermission.EDIT_PROJECT) || false;
  }

  canManageMembers(userId: string): boolean {
    if (this.isOwner(userId)) return true;
    const member = this.members?.find(m => m.userId === userId);
    return member?.permissions?.includes(ProjectPermission.MANAGE_MEMBERS) || false;
  }

  // JSON 직렬화시 계산된 필드 포함
  toJSON() {
    return {
      ...this,
      tasksCount: this.tasks?.length || 0,
      completedTasksCount: this.tasks?.filter(t => t.status === 'completed').length || 0,
    };
  }
}