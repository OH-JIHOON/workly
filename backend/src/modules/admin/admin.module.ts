import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { AuditService } from './services/audit.service';
import { UsersAdminController } from './controllers/users-admin.controller';
import { ProjectsAdminController } from './controllers/projects-admin.controller';
import { SettingsAdminController } from './controllers/settings-admin.controller';
import { AuditLogsController } from './controllers/audit-logs.controller';
import { User } from '../../database/entities/user.entity';
import { Project } from '../../database/entities/project.entity';
import { Task } from '../../database/entities/task.entity';
import { AuditLog } from '../../database/entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Project, 
      Task,
      AuditLog,
    ]),
  ],
  controllers: [
    AdminController,
    UsersAdminController,
    ProjectsAdminController,
    SettingsAdminController,
    AuditLogsController,
  ],
  providers: [
    AdminService,
    AuditService,
  ],
  exports: [AdminService, AuditService],
})
export class AdminModule {}