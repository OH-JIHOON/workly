import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

// Entity imports
import { User } from '../database/entities/user.entity';
import { Project } from '../database/entities/project.entity';
import { ProjectMember } from '../database/entities/project-member.entity';
import { Task } from '../database/entities/task.entity';
import { TaskLabel } from '../database/entities/task-label.entity';
import { TaskComment } from '../database/entities/task-comment.entity';
import { TaskDependency } from '../database/entities/task-dependency.entity';
import { TimeEntry } from '../database/entities/time-entry.entity';
import { File } from '../database/entities/file.entity';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: configService.get('DATABASE_HOST', 'localhost'),
    port: configService.get('DATABASE_PORT', 5432),
    username: configService.get('DATABASE_USERNAME', 'workly'),
    password: configService.get('DATABASE_PASSWORD', 'workly123'),
    database: configService.get('DATABASE_NAME', 'workly'),
    entities: [
      User,
      Project,
      ProjectMember,
      Task,
      TaskLabel,
      TaskComment,
      TaskDependency,
      TimeEntry,
      File,
    ],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    seeds: [__dirname + '/../database/seeds/*{.ts,.js}'],
    synchronize: configService.get('NODE_ENV') === 'development',
    logging: configService.get('NODE_ENV') === 'development',
    ssl: configService.get('NODE_ENV') === 'production' ? {
      rejectUnauthorized: false
    } : false,
    extra: {
      max: 20, // 최대 연결 수
      idleTimeoutMillis: 30000, // 유휴 연결 타임아웃
      connectionTimeoutMillis: 2000, // 연결 타임아웃
    },
  };
};

// CLI용 데이터소스 설정 (마이그레이션 등)
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || 'workly',
  password: process.env.DATABASE_PASSWORD || 'workly123',
  database: process.env.DATABASE_NAME || 'workly',
  entities: [
    __dirname + '/../database/entities/*{.ts,.js}'
  ],
  migrations: [
    __dirname + '/../database/migrations/*{.ts,.js}'
  ],
  synchronize: false, // 프로덕션에서는 항상 false
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
};

export default new DataSource(dataSourceOptions);