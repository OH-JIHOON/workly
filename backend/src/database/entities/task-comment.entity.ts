import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from './user.entity';

@Entity('task_comments')
@Index(['taskId'])
@Index(['authorId'])
@Index(['parentId'])
@Index(['createdAt'])
@Index(['isInternal'])
export class TaskComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column()
  taskId: string;

  @Column()
  authorId: string;

  @Column({ nullable: true })
  parentId?: string;

  @Column({ default: false })
  isInternal: boolean;

  @Column({ default: false })
  isEdited: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 관계 설정
  @ManyToOne(() => Task, task => task.comments, {
    onDelete: 'CASCADE'
  })
  task: Task;

  @ManyToOne(() => User, { eager: true })
  author: User;

  @ManyToOne(() => TaskComment, comment => comment.replies, {
    onDelete: 'CASCADE'
  })
  parent?: TaskComment;

  @OneToMany(() => TaskComment, comment => comment.parent)
  replies: TaskComment[];

  // 답글인지 확인
  isReply(): boolean {
    return this.parentId !== null;
  }

  // 답글이 있는지 확인
  hasReplies(): boolean {
    return this.replies && this.replies.length > 0;
  }

  // 내용 업데이트
  updateContent(content: string): void {
    this.content = content;
    this.isEdited = true;
  }

  // 내부 댓글로 설정
  markAsInternal(): void {
    this.isInternal = true;
  }

  // 공개 댓글로 설정
  markAsPublic(): void {
    this.isInternal = false;
  }

  // 작성자 확인
  isAuthoredBy(userId: string): boolean {
    return this.authorId === userId;
  }

  // 편집 가능한지 확인
  canEdit(userId: string): boolean {
    return this.isAuthoredBy(userId);
  }

  // 삭제 가능한지 확인
  canDelete(userId: string): boolean {
    return this.isAuthoredBy(userId);
  }
}