import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // CORS 설정
  app.enableCors({
    origin: [
      'http://localhost:3000', // 프론트엔드 개발 서버
      configService.get('FRONTEND_URL', 'http://localhost:3000'),
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // 글로벌 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성 제거
      forbidNonWhitelisted: true, // 정의되지 않은 속성이 있으면 오류 발생
      transform: true, // 요청 데이터를 DTO 타입으로 자동 변환
      disableErrorMessages: configService.get('NODE_ENV') === 'production',
    }),
  );

  // API 전역 프리픽스 설정 (auth는 제외)
  app.setGlobalPrefix('api/v1', {
    exclude: ['/auth(.*)']
  });

  // Swagger 설정
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Workly API')
      .setDescription('워클리 백엔드 API 문서')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'JWT 토큰을 입력하세요',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication', '인증 관련 API')
      .addTag('Users', '사용자 관리 API')
      .addTag('Projects', '프로젝트 관리 API')
      .addTag('Tasks', '태스크 관리 API')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    console.log(`📚 API 문서: http://localhost:${configService.get('PORT', 3001)}/api/docs`);
  }

  // 서버 시작
  const port = configService.get('PORT', 3001);
  await app.listen(port);

  console.log(`🚀 서버가 포트 ${port}에서 실행 중입니다.`);
  console.log(`🌍 환경: ${configService.get('NODE_ENV', 'development')}`);
}

bootstrap();