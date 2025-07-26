import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { 
  UserRole, 
  UserStatus, 
  UserProfile, 
  UserPreferences,
  NotificationPreferences,
  WorkingHours,
  DashboardPreferences 
} from '@workly/shared';
import { Exclude } from 'class-transformer';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['googleId'])
@Index(['status'])
@Index(['role'])
@Index(['createdAt'])
@Index(['lastLoginAt'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MEMBER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status: UserStatus;

  @Column('jsonb')
  profile: UserProfile;

  @Column('jsonb')
  preferences: UserPreferences;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ nullable: true })
  emailVerifiedAt?: Date;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  @Exclude()
  resetPasswordToken?: string;

  @Column({ nullable: true })
  @Exclude()
  resetPasswordExpiresAt?: Date;

  @Column({ nullable: true })
  @Exclude()
  emailVerificationToken?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 관계 설정 (나중에 추가될 엔티티들과의 관계)
  // @OneToMany(() => Project, project => project.owner)
  // ownedProjects: Project[];

  // @OneToMany(() => Task, task => task.assignee)
  // assignedTasks: Task[];

  // @OneToMany(() => Task, task => task.reporter)
  // reportedTasks: Task[];

  // @OneToMany(() => Post, post => post.author)
  // posts: Post[];

  // @OneToMany(() => Comment, comment => comment.author)
  // comments: Comment[];

  // @OneToMany(() => File, file => file.uploader)
  // uploadedFiles: File[];

  // @OneToMany(() => Notification, notification => notification.recipient)
  // receivedNotifications: Notification[];

  // 비밀번호 해싱
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  // 비밀번호 확인 메서드
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // 기본값 설정
  @BeforeInsert()
  setDefaultValues() {
    if (!this.profile) {
      this.profile = {
        firstName: '',
        lastName: '',
        timezone: 'Asia/Seoul',
        language: 'ko',
      } as UserProfile;
    }

    if (!this.preferences) {
      this.preferences = {
        theme: 'system',
        language: 'ko',
        timezone: 'Asia/Seoul',
        notifications: {
          email: true,
          push: true,
          desktop: true,
          taskAssigned: true,
          taskCompleted: true,
          taskDue: true,
          projectUpdates: true,
          mentions: true,
          weeklyDigest: true,
          dailyReminder: false,
        } as NotificationPreferences,
        workingHours: {
          enabled: true,
          startTime: '09:00',
          endTime: '18:00',
          timezone: 'Asia/Seoul',
          workingDays: [1, 2, 3, 4, 5],
          breakTime: {
            enabled: true,
            startTime: '12:00',
            endTime: '13:00',
          },
        } as WorkingHours,
        dashboard: {
          layout: 'grid',
          widgets: {
            myTasks: true,
            recentProjects: true,
            teamActivity: true,
            notifications: true,
            calendar: true,
            quickStats: true,
          },
          defaultView: 'dashboard',
        } as DashboardPreferences,
      } as UserPreferences;
    }
  }

  // 이메일 인증 관련
  generateEmailVerificationToken(): string {
    this.emailVerificationToken = Math.random().toString(36).substring(2, 15) + 
                                 Math.random().toString(36).substring(2, 15);
    return this.emailVerificationToken;
  }

  verifyEmail(): void {
    this.emailVerifiedAt = new Date();
    this.emailVerificationToken = undefined;
    this.status = UserStatus.ACTIVE;
  }

  // 비밀번호 재설정 관련
  generateResetPasswordToken(): string {
    this.resetPasswordToken = Math.random().toString(36).substring(2, 15) + 
                             Math.random().toString(36).substring(2, 15);
    this.resetPasswordExpiresAt = new Date(Date.now() + 3600000); // 1시간 후 만료
    return this.resetPasswordToken;
  }

  resetPassword(newPassword: string): void {
    this.password = newPassword;
    this.resetPasswordToken = undefined;
    this.resetPasswordExpiresAt = undefined;
  }

  // 로그인 시간 업데이트
  updateLastLoginAt(): void {
    this.lastLoginAt = new Date();
  }

  // 사용자 활성화/비활성화
  activate(): void {
    this.status = UserStatus.ACTIVE;
  }

  deactivate(): void {
    this.status = UserStatus.INACTIVE;
  }

  suspend(): void {
    this.status = UserStatus.SUSPENDED;
  }

  // 권한 확인 메서드
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  isManager(): boolean {
    return this.role === UserRole.MANAGER || this.isAdmin();
  }

  isMember(): boolean {
    return this.role === UserRole.MEMBER || this.isManager();
  }

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  canLogin(): boolean {
    return this.isActive() && this.emailVerifiedAt !== null;
  }

  // 전체 이름 가져오기
  getFullName(): string {
    if (this.profile?.firstName && this.profile?.lastName) {
      return `${this.profile.firstName} ${this.profile.lastName}`;
    }
    return this.name;
  }

  // 사용자 정보를 안전하게 반환 (비밀번호 등 민감 정보 제외)
  toJSON() {
    const { password, resetPasswordToken, resetPasswordExpiresAt, emailVerificationToken, ...user } = this;
    return user;
  }
}