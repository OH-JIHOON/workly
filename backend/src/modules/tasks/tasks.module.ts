import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from '../../database/entities/task.entity';
import { TaskLabel } from '../../database/entities/task-label.entity';
import { TaskComment } from '../../database/entities/task-comment.entity';
import { TaskDependency } from '../../database/entities/task-dependency.entity';
import { TimeEntry } from '../../database/entities/time-entry.entity';
import { Project } from '../../database/entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      TaskLabel,
      TaskComment,
      TaskDependency,
      TimeEntry,
      Project,
    ])
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}