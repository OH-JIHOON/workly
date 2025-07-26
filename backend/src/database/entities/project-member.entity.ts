import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  Unique,
} from 'typeorm';
import { 
  ProjectRole,
  ProjectPermission
} from '@workly/shared';
import { User } from './user.entity';
import { Project } from './project.entity';

@Entity('project_members')
@Unique(['projectId', 'userId'])
@Index(['projectId'])
@Index(['userId'])
@Index(['role'])
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: ProjectRole,
    default: ProjectRole.MEMBER,
  })
  role: ProjectRole;

  @Column('simple-array')
  permissions: ProjectPermission[];

  @CreateDateColumn()
  joinedAt: Date;

  // 관계 설정
  @ManyToOne(() => Project, project => project.members, {
    onDelete: 'CASCADE'
  })
  project: Project;

  @ManyToOne(() => User, { eager: true })
  user: User;

  // 권한 확인 메서드들
  hasPermission(permission: ProjectPermission): boolean {
    return this.permissions.includes(permission);
  }

  isOwner(): boolean {
    return this.role === ProjectRole.OWNER;
  }

  isAdmin(): boolean {
    return this.role === ProjectRole.ADMIN || this.isOwner();
  }

  canManageProject(): boolean {
    return this.isAdmin() || this.hasPermission(ProjectPermission.EDIT_PROJECT);
  }

  canManageMembers(): boolean {
    return this.isAdmin() || this.hasPermission(ProjectPermission.MANAGE_MEMBERS);
  }

  canCreateTasks(): boolean {
    return this.hasPermission(ProjectPermission.CREATE_TASKS);
  }

  canEditTasks(): boolean {
    return this.hasPermission(ProjectPermission.EDIT_TASKS);
  }

  canDeleteTasks(): boolean {
    return this.hasPermission(ProjectPermission.DELETE_TASKS);
  }

  canAssignTasks(): boolean {
    return this.hasPermission(ProjectPermission.ASSIGN_TASKS);
  }

  // 권한 설정 메서드들
  grantPermission(permission: ProjectPermission): void {
    if (!this.hasPermission(permission)) {
      this.permissions.push(permission);
    }
  }

  revokePermission(permission: ProjectPermission): void {
    this.permissions = this.permissions.filter(p => p !== permission);
  }

  setRole(role: ProjectRole): void {
    this.role = role;
    this.setDefaultPermissions();
  }

  // 역할별 기본 권한 설정
  private setDefaultPermissions(): void {
    switch (this.role) {
      case ProjectRole.OWNER:
        this.permissions = Object.values(ProjectPermission);
        break;
      case ProjectRole.ADMIN:
        this.permissions = [
          ProjectPermission.VIEW_PROJECT,
          ProjectPermission.EDIT_PROJECT,
          ProjectPermission.MANAGE_MEMBERS,
          ProjectPermission.CREATE_TASKS,
          ProjectPermission.EDIT_TASKS,
          ProjectPermission.DELETE_TASKS,
          ProjectPermission.ASSIGN_TASKS,
          ProjectPermission.MANAGE_SETTINGS,
        ];
        break;
      case ProjectRole.MEMBER:
        this.permissions = [
          ProjectPermission.VIEW_PROJECT,
          ProjectPermission.CREATE_TASKS,
          ProjectPermission.EDIT_TASKS,
          ProjectPermission.ASSIGN_TASKS,
        ];
        break;
      case ProjectRole.VIEWER:
        this.permissions = [ProjectPermission.VIEW_PROJECT];
        break;
      default:
        this.permissions = [];
    }
  }
}