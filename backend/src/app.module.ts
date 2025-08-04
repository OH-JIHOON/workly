import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { WebSocketModule } from './modules/websocket/websocket.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthGuard } from './modules/auth/guards/auth.guard';
import { CustomThrottlerGuard } from './modules/auth/guards/throttle.guard';
import { AuthMiddleware } from './modules/auth/middleware/auth.middleware';
import { AuditMiddleware } from './modules/auth/middleware/audit.middleware';

@Module({
  imports: [
    // 환경 설정 모듈
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),

    // Rate Limiting 모듈
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 1000, // 1초
          limit: 10, // 10개 요청
        },
        {
          name: 'medium',
          ttl: 60000, // 1분
          limit: 100, // 100개 요청
        },
        {
          name: 'long',
          ttl: 3600000, // 1시간
          limit: 1000, // 1000개 요청
        },
      ],
    }),

    // 데이터베이스 모듈
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // 기능 모듈들
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    WebSocketModule,
    AdminModule,
  ],
  controllers: [],
  providers: [
    // 글로벌 가드 설정
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, AuditMiddleware)
      .forRoutes('*'); // 모든 라우트에 적용
  }
}