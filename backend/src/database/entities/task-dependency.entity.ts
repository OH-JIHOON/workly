import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  Unique,
} from 'typeorm';
import { DependencyType } from '@workly/shared';
import { Task } from './task.entity';

@Entity('task_dependencies')
@Unique(['dependentTaskId', 'dependsOnTaskId'])
@Index(['dependentTaskId'])
@Index(['dependsOnTaskId'])
@Index(['type'])
export class TaskDependency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  dependentTaskId: string;

  @Column()
  dependsOnTaskId: string;

  @Column({
    type: 'enum',
    enum: DependencyType,
    default: DependencyType.BLOCKS,
  })
  type: DependencyType;

  @CreateDateColumn()
  createdAt: Date;

  // 관계 설정
  @ManyToOne(() => Task, task => task.dependencies, {
    onDelete: 'CASCADE'
  })
  dependentTask: Task;

  @ManyToOne(() => Task, task => task.dependents, {
    onDelete: 'CASCADE'
  })
  dependsOnTask: Task;

  // 차단 관계인지 확인
  isBlocking(): boolean {
    return this.type === DependencyType.BLOCKS;
  }

  // 차단됨 관계인지 확인
  isBlockedBy(): boolean {
    return this.type === DependencyType.BLOCKED_BY;
  }

  // 관련됨 관계인지 확인
  isRelated(): boolean {
    return this.type === DependencyType.RELATES_TO;
  }

  // 중복 관계인지 확인
  isDuplicate(): boolean {
    return this.type === DependencyType.DUPLICATES || 
           this.type === DependencyType.DUPLICATED_BY;
  }

  // 순환 의존성 체크를 위한 메서드
  static async checkCircularDependency(
    dependentTaskId: string,
    dependsOnTaskId: string
  ): Promise<boolean> {
    // 실제 구현에서는 재귀적으로 의존성 체인을 확인하여 순환 참조 검사
    // 여기서는 간단히 직접적인 순환만 체크
    return dependentTaskId === dependsOnTaskId;
  }

  // 의존성 유효성 검사
  async isValid(): Promise<boolean> {
    // 자기 자신에 대한 의존성 체크
    if (this.dependentTaskId === this.dependsOnTaskId) {
      return false;
    }

    // 순환 의존성 체크
    const hasCircularDependency = await TaskDependency.checkCircularDependency(
      this.dependentTaskId,
      this.dependsOnTaskId
    );

    return !hasCircularDependency;
  }
}