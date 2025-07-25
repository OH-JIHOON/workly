import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from './user.entity';

@Entity('time_entries')
@Index(['taskId'])
@Index(['userId'])
@Index(['startTime'])
@Index(['billable'])
@Index(['approved'])
@Index(['createdAt'])
export class TimeEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ type: 'int' })
  duration: number; // 분 단위

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime?: Date;

  @Column()
  taskId: string;

  @Column()
  userId: string;

  @Column({ default: false })
  billable: boolean;

  @Column({ default: false })
  approved: boolean;

  @Column({ nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 관계 설정
  @ManyToOne(() => Task, task => task.timeEntries, {
    onDelete: 'CASCADE'
  })
  task: Task;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @ManyToOne(() => User, { eager: false })
  approver?: User;

  // 시간 계산 및 검증
  @BeforeInsert()
  @BeforeUpdate()
  calculateDuration() {
    if (this.endTime && this.startTime) {
      const diffMs = this.endTime.getTime() - this.startTime.getTime();
      this.duration = Math.round(diffMs / (1000 * 60)); // 분 단위로 변환
    }
  }

  // 시간을 시간:분 형식으로 반환
  getDurationFormatted(): string {
    const hours = Math.floor(this.duration / 60);
    const minutes = this.duration % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }

  // 시간을 소수점 형태로 반환 (예: 1.5시간)
  getDurationInHours(): number {
    return this.duration / 60;
  }

  // 진행 중인 시간 추적인지 확인
  isRunning(): boolean {
    return this.startTime !== null && this.endTime === null;
  }

  // 완료된 시간 추적인지 확인
  isCompleted(): boolean {
    return this.startTime !== null && this.endTime !== null;
  }

  // 시간 추적 시작
  start(): void {
    this.startTime = new Date();
    this.endTime = null;
  }

  // 시간 추적 중지
  stop(): void {
    if (this.isRunning()) {
      this.endTime = new Date();
      this.calculateDuration();
    }
  }

  // 시간 추적 재시작
  restart(): void {
    this.start();
  }

  // 수동으로 시간 설정
  setDuration(minutes: number): void {
    this.duration = Math.max(0, minutes);
    
    // endTime을 duration에 맞춰 계산
    if (this.startTime) {
      this.endTime = new Date(this.startTime.getTime() + (minutes * 60 * 1000));
    }
  }

  // 청구 가능 상태 설정
  markAsBillable(): void {
    this.billable = true;
  }

  // 청구 불가능 상태 설정
  markAsNonBillable(): void {
    this.billable = false;
  }

  // 승인 처리
  approve(approverId: string): void {
    this.approved = true;
    this.approvedBy = approverId;
    this.approvedAt = new Date();
  }

  // 승인 취소
  reject(): void {
    this.approved = false;
    this.approvedBy = null;
    this.approvedAt = null;
  }

  // 소유자 확인
  belongsTo(userId: string): boolean {
    return this.userId === userId;
  }

  // 편집 가능한지 확인
  canEdit(userId: string): boolean {
    return this.belongsTo(userId) && !this.approved;
  }

  // 삭제 가능한지 확인
  canDelete(userId: string): boolean {
    return this.belongsTo(userId) && !this.approved;
  }

  // 승인 가능한지 확인 (태스크 담당자나 프로젝트 매니저)
  canApprove(userId: string): boolean {
    // 실제 구현에서는 프로젝트 권한을 확인해야 함
    return !this.belongsTo(userId) && !this.approved;
  }

  // 유효성 검증
  validate(): string[] {
    const errors: string[] = [];

    if (this.duration <= 0) {
      errors.push('Duration must be greater than 0');
    }

    if (this.duration > 24 * 60) { // 24시간 초과
      errors.push('Duration cannot exceed 24 hours');
    }

    if (this.endTime && this.startTime && this.endTime <= this.startTime) {
      errors.push('End time must be after start time');
    }

    const now = new Date();
    if (this.startTime > now) {
      errors.push('Start time cannot be in the future');
    }

    if (this.endTime && this.endTime > now) {
      errors.push('End time cannot be in the future');
    }

    return errors;
  }

  // 중복 시간 체크 (같은 사용자의 겹치는 시간대)
  static async checkOverlap(
    userId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ): Promise<boolean> {
    // 실제 구현에서는 데이터베이스 쿼리로 겹치는 시간대 확인
    // 여기서는 기본 구조만 제공
    return false;
  }
}