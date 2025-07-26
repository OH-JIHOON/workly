import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

// 환경변수를 읽는 헬퍼 함수
const getEnvVar = (key: string, defaultValue: string): string => {
  return process.env[key] || defaultValue;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

// 단일 데이터베이스 설정 - Single Source of Truth
const createDatabaseConfig = (): DataSourceOptions => ({
  type: 'postgres',
  host: getEnvVar('DATABASE_HOST', 'localhost'),
  port: getEnvNumber('DATABASE_PORT', 5432),
  username: getEnvVar('DATABASE_USERNAME', 'workly'),
  password: getEnvVar('DATABASE_PASSWORD', 'workly123'),
  database: getEnvVar('DATABASE_NAME', 'workly'),
  entities: [__dirname + '/../database/entities/*{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: isDevelopment(), // 개발환경에서만 true
  logging: isDevelopment(),
  ssl: isProduction() ? {
    rejectUnauthorized: false
  } : false,
  extra: {
    max: 20, // 최대 연결 수
    idleTimeoutMillis: 30000, // 유휴 연결 타임아웃
    connectionTimeoutMillis: 2000, // 연결 타임아웃
  },
});

// NestJS TypeORM 모듈용 설정
export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  // ConfigService를 통해 환경변수를 다시 검증
  const baseConfig = createDatabaseConfig();
  
  return {
    ...baseConfig,
    // ConfigService로 한번 더 검증하여 더 안전하게
    host: configService.get<string>('DATABASE_HOST', getEnvVar('DATABASE_HOST', 'localhost')),
    port: configService.get<number>('DATABASE_PORT', getEnvNumber('DATABASE_PORT', 5432)),
    username: configService.get<string>('DATABASE_USERNAME', getEnvVar('DATABASE_USERNAME', 'workly')),
    password: configService.get<string>('DATABASE_PASSWORD', getEnvVar('DATABASE_PASSWORD', 'workly123')),
    database: configService.get<string>('DATABASE_NAME', getEnvVar('DATABASE_NAME', 'workly')),
    synchronize: configService.get('NODE_ENV') === 'development',
    logging: configService.get('NODE_ENV') === 'development',
  } as TypeOrmModuleOptions;
};

// CLI용 데이터소스 설정 (마이그레이션 등) - 동일한 설정 재사용
export const dataSourceOptions: DataSourceOptions = createDatabaseConfig();

export default new DataSource(dataSourceOptions);