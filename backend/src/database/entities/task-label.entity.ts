import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  Index,
} from 'typeorm';
import { Task } from './task.entity';
import { Project } from './project.entity';

@Entity('task_labels')
@Index(['name'])
@Index(['projectId'])
export class TaskLabel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ length: 7 })
  color: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ nullable: true })
  projectId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 관계 설정
  @ManyToOne(() => Project, {
    onDelete: 'CASCADE'
  })
  project?: Project;

  @ManyToMany(() => Task, task => task.labels)
  tasks: Task[];

  // 전역 라벨인지 확인
  isGlobal(): boolean {
    return this.projectId === null;
  }

  // 프로젝트별 라벨인지 확인
  isProjectSpecific(): boolean {
    return this.projectId !== null;
  }
}