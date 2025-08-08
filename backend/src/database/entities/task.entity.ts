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
  TaskStatus, 
  Priority, 
  TaskType,
  WorkflowStage
} from '@workly/shared';
import { User } from './user.entity';
import { Project } from './project.entity';
import { TaskLabel } from './task-label.entity';
import { TaskComment } from './task-comment.entity';
import { TaskDependency } from './task-dependency.entity';
import { TimeEntry } from './time-entry.entity';

@Entity('tasks')
@Index(['title'])
@Index(['status'])
@Index(['priority'])
@Index(['type'])
@Index(['projectId'])
@Index(['goalId'])
@Index(['assigneeId'])
@Index(['reporterId'])
@Index(['parentTaskId'])
@Index(['dueDate'])
@Index(['createdAt'])
@Index(['workflowStageId'])
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('text', { nullable: true })
  descriptionMarkdown?: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM,
  })
  priority: Priority;

  @Column({
    type: 'enum',
    enum: TaskType,
    default: TaskType.TASK,
  })
  type: TaskType;

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ nullable: true })
  projectId?: string;

  @Column({ nullable: true })
  goalId?: string;

  @Column({ nullable: true })
  assigneeId?: string;

  @Column()
  reporterId: string;

  @Column({ nullable: true })
  parentTaskId?: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  estimatedHours?: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  actualHours: number;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ nullable: true })
  workflowStageId?: string;

  @Column('simple-array', { default: [] })
  tags: string[];

  @Column('jsonb', { default: {} })
  customFields: { [key: string]: any };

  @Column('jsonb', { default: [] })
  checklist: Array<{
    id: string;
    text: string;
    completed: boolean;
    order: number;
  }>;

  @Column('jsonb', { default: [] })
  relationships: Array<{
    id: string;
    targetTaskId: string;
    type: 'blocks' | 'blocked_by' | 'related' | 'parent' | 'child';
  }>;

  @Column('jsonb', { default: [] })
  wikiReferences: Array<{
    id: string;
    title: string;
    url: string;
    description?: string;
  }>;

  @Column({ type: 'int', nullable: true })
  estimatedTimeMinutes?: number;

  @Column({ type: 'int', default: 0 })
  loggedTimeMinutes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 관계 설정
  @ManyToOne(() => Project, project => project.tasks, {
    onDelete: 'CASCADE'
  })
  project?: Project;

  @ManyToOne(() => User, { eager: true })
  assignee?: User;

  @ManyToOne(() => User, { eager: true })
  reporter: User;

  @ManyToOne(() => Task, task => task.subtasks, {
    onDelete: 'CASCADE'
  })
  parentTask?: Task;

  @OneToMany(() => Task, task => task.parentTask)
  subtasks: Task[];

  @ManyToMany(() => TaskLabel)
  @JoinTable({
    name: 'task_labels_mapping',
    joinColumn: { name: 'taskId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'labelId', referencedColumnName: 'id' }
  })
  labels: TaskLabel[];

  @OneToMany(() => TaskComment, comment => comment.task)
  comments: TaskComment[];

  @OneToMany(() => TaskDependency, dependency => dependency.dependentTask)
  dependencies: TaskDependency[];

  @OneToMany(() => TaskDependency, dependency => dependency.dependsOnTask)
  dependents: TaskDependency[];

  @OneToMany(() => TimeEntry, timeEntry => timeEntry.task)
  timeEntries: TimeEntry[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'task_watchers',
    joinColumn: { name: 'taskId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' }
  })
  watchers: User[];

  // 기본값 설정
  @BeforeInsert()
  setDefaultValues() {
    if (!this.tags) {
      this.tags = [];
    }
    if (!this.customFields) {
      this.customFields = {};
    }
    if (!this.checklist) {
      this.checklist = [];
    }
    if (!this.relationships) {
      this.relationships = [];
    }
    if (!this.wikiReferences) {
      this.wikiReferences = [];
    }
    if (this.actualHours === undefined) {
      this.actualHours = 0;
    }
    if (this.loggedTimeMinutes === undefined) {
      this.loggedTimeMinutes = 0;
    }
  }

  // 상태 변경 시 처리
  @BeforeUpdate()
  handleStatusUpdate() {
    if (this.status === TaskStatus.COMPLETED && !this.completedAt) {
      this.completedAt = new Date();
      this.progress = 100;
    } else if (this.status !== TaskStatus.COMPLETED) {
      this.completedAt = undefined;
    }
  }

  // 태스크 완료 처리
  complete(): void {
    this.status = TaskStatus.COMPLETED;
    this.completedAt = new Date();
    this.progress = 100;
  }

  // 태스크 시작
  start(): void {
    if (this.status === TaskStatus.TODO) {
      this.status = TaskStatus.IN_PROGRESS;
      if (!this.startDate) {
        this.startDate = new Date();
      }
    }
  }

  // 태스크 차단
  block(): void {
    this.status = TaskStatus.BLOCKED;
  }

  // 태스크 검토 요청
  requestReview(): void {
    this.status = TaskStatus.IN_REVIEW;
  }

  // 태스크 취소
  cancel(): void {
    this.status = TaskStatus.CANCELLED;
    this.completedAt = new Date();
  }

  // 담당자 할당
  assignTo(userId: string): void {
    this.assigneeId = userId;
  }

  // 담당자 해제
  unassign(): void {
    this.assigneeId = undefined;
  }

  // 우선순위 설정
  setPriority(priority: Priority): void {
    this.priority = priority;
  }

  // 마감일 설정
  setDueDate(dueDate: Date): void {
    this.dueDate = dueDate;
  }

  // 진행률 업데이트
  updateProgress(progress: number): void {
    this.progress = Math.max(0, Math.min(100, progress));
    
    if (progress === 100 && this.status !== TaskStatus.COMPLETED) {
      this.complete();
    } else if (progress === 0 && this.status !== TaskStatus.TODO) {
      this.status = TaskStatus.TODO;
    } else if (progress > 0 && progress < 100 && this.status === TaskStatus.TODO) {
      this.start();
    }
  }

  // 예상 시간 업데이트
  updateEstimatedHours(hours: number): void {
    this.estimatedHours = Math.max(0, hours);
  }

  // 실제 시간 업데이트 (시간 추적에서 자동 계산)
  recalculateActualHours(): void {
    if (this.timeEntries && this.timeEntries.length > 0) {
      this.actualHours = this.timeEntries.reduce((total, entry) => {
        return total + (entry.duration / 60); // 분을 시간으로 변환
      }, 0);
    }
  }

  // 마감일 체크
  isOverdue(): boolean {
    if (!this.dueDate) return false;
    return new Date() > this.dueDate && this.status !== TaskStatus.COMPLETED;
  }

  // 곧 마감되는지 체크 (24시간 이내)
  isDueSoon(): boolean {
    if (!this.dueDate) return false;
    const twentyFourHoursFromNow = new Date();
    twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24);
    return this.dueDate <= twentyFourHoursFromNow && !this.isOverdue();
  }

  // 완료 여부 체크
  isCompleted(): boolean {
    return this.status === TaskStatus.COMPLETED;
  }

  // 진행 중 여부 체크
  isInProgress(): boolean {
    return this.status === TaskStatus.IN_PROGRESS;
  }

  // 차단됨 여부 체크
  isBlocked(): boolean {
    return this.status === TaskStatus.BLOCKED;
  }

  // 서브태스크 여부 체크
  isSubtask(): boolean {
    return this.parentTaskId !== null;
  }

  // 상위 태스크 여부 체크
  hasSubtasks(): boolean {
    return this.subtasks && this.subtasks.length > 0;
  }

  // 의존성 확인
  hasDependencies(): boolean {
    return this.dependencies && this.dependencies.length > 0;
  }

  // 차단된 의존성이 있는지 확인
  hasBlockingDependencies(): boolean {
    return this.dependencies?.some(dep => 
      dep.dependsOnTask.status !== TaskStatus.COMPLETED
    ) || false;
  }

  // 담당자 확인
  isAssignedTo(userId: string): boolean {
    return this.assigneeId === userId;
  }

  // 생성자 확인
  isReportedBy(userId: string): boolean {
    return this.reporterId === userId;
  }

  // 관찰자 확인
  isWatchedBy(userId: string): boolean {
    return this.watchers?.some(watcher => watcher.id === userId) || false;
  }

  // 권한 확인 - 편집 가능한지
  canEdit(userId: string): boolean {
    return this.isAssignedTo(userId) || this.isReportedBy(userId);
  }

  // 권한 확인 - 삭제 가능한지
  canDelete(userId: string): boolean {
    return this.isReportedBy(userId);
  }

  // 태그 추가
  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  // 태그 제거
  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
  }

  // 관찰자 추가
  addWatcher(user: User): void {
    if (!this.isWatchedBy(user.id)) {
      if (!this.watchers) this.watchers = [];
      this.watchers.push(user);
    }
  }

  // 관찰자 제거
  removeWatcher(userId: string): void {
    if (this.watchers) {
      this.watchers = this.watchers.filter(watcher => watcher.id !== userId);
    }
  }

  // 소요 시간 계산 (생성부터 완료까지)
  getTotalDuration(): number | null {
    if (!this.completedAt) return null;
    const startTime = this.startDate || this.createdAt;
    const diffTime = Math.abs(this.completedAt.getTime() - startTime.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // 일 단위
  }

  // 예상 대비 실제 시간 비율
  getTimeEfficiencyRatio(): number | null {
    if (!this.estimatedHours || this.actualHours === 0) return null;
    return this.actualHours / this.estimatedHours;
  }

  // 체크리스트 관련 메서드
  addChecklistItem(text: string): void {
    const newItem = {
      id: `checklist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      completed: false,
      order: this.checklist.length
    };
    this.checklist.push(newItem);
  }

  updateChecklistItem(itemId: string, updates: Partial<{ text: string; completed: boolean; order: number }>): void {
    const itemIndex = this.checklist.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
      this.checklist[itemIndex] = { ...this.checklist[itemIndex], ...updates };
    }
  }

  removeChecklistItem(itemId: string): void {
    this.checklist = this.checklist.filter(item => item.id !== itemId);
  }

  getChecklistProgress(): { completed: number; total: number; percentage: number } {
    const total = this.checklist.length;
    const completed = this.checklist.filter(item => item.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }

  // 관계 관련 메서드
  addRelationship(targetTaskId: string, type: 'blocks' | 'blocked_by' | 'related' | 'parent' | 'child'): void {
    const relationship = {
      id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      targetTaskId,
      type
    };
    this.relationships.push(relationship);
  }

  removeRelationship(relationshipId: string): void {
    this.relationships = this.relationships.filter(rel => rel.id !== relationshipId);
  }

  hasRelationshipWith(taskId: string): boolean {
    return this.relationships.some(rel => rel.targetTaskId === taskId);
  }

  // 위키 레퍼런스 관련 메서드
  addWikiReference(title: string, url: string, description?: string): void {
    const wikiRef = {
      id: `wiki-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      url: url.trim(),
      description: description?.trim()
    };
    this.wikiReferences.push(wikiRef);
  }

  updateWikiReference(wikiId: string, updates: Partial<{ title: string; url: string; description: string }>): void {
    const wikiIndex = this.wikiReferences.findIndex(wiki => wiki.id === wikiId);
    if (wikiIndex !== -1) {
      this.wikiReferences[wikiIndex] = { ...this.wikiReferences[wikiIndex], ...updates };
    }
  }

  removeWikiReference(wikiId: string): void {
    this.wikiReferences = this.wikiReferences.filter(wiki => wiki.id !== wikiId);
  }

  // 시간 관리 메서드
  updateEstimatedTimeMinutes(minutes: number): void {
    this.estimatedTimeMinutes = Math.max(0, minutes);
  }

  addLoggedTime(minutes: number): void {
    this.loggedTimeMinutes += Math.max(0, minutes);
  }

  getTimeEfficiency(): number | null {
    if (!this.estimatedTimeMinutes || this.loggedTimeMinutes === 0) return null;
    return this.loggedTimeMinutes / this.estimatedTimeMinutes;
  }

  // JSON 직렬화
  toJSON() {
    const checklistProgress = this.getChecklistProgress();
    return {
      ...this,
      isOverdue: this.isOverdue(),
      isDueSoon: this.isDueSoon(),
      hasSubtasks: this.hasSubtasks(),
      hasDependencies: this.hasDependencies(),
      hasBlockingDependencies: this.hasBlockingDependencies(),
      checklistProgress,
      timeEfficiency: this.getTimeEfficiency(),
    };
  }
}