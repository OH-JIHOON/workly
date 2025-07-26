import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  IsNumber,
  IsObject,
  IsDateString,
  IsBoolean,
  Min,
  MaxLength,
  MinLength,
  IsInt,
  IsDecimal,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  ProjectStatus, 
  ProjectPriority, 
  ProjectVisibility,
  ProjectMemberRole 
} from '@workly/shared';

export class CreateProjectDto {
  @ApiProperty({
    description: '프로젝트 제목',
    example: '워클리 웹 애플리케이션 개발',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1, { message: '프로젝트 제목은 필수입니다.' })
  @MaxLength(100, { message: '프로젝트 제목은 100자를 초과할 수 없습니다.' })
  title: string;

  @ApiPropertyOptional({
    description: '프로젝트 설명',
    example: '사용자 친화적인 업무 관리 웹 애플리케이션을 개발합니다.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: '프로젝트 설명은 1000자를 초과할 수 없습니다.' })
  description?: string;

  @ApiPropertyOptional({
    description: '프로젝트 우선순위',
    enum: ProjectPriority,
    example: 'high',
  })
  @IsOptional()
  @IsEnum(ProjectPriority, { message: '유효한 우선순위를 선택해주세요.' })
  priority?: ProjectPriority;

  @ApiPropertyOptional({
    description: '프로젝트 시작일',
    example: '2024-01-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: '유효한 날짜 형식을 입력해주세요.' })
  startDate?: string;

  @ApiPropertyOptional({
    description: '프로젝트 종료일',
    example: '2024-06-30T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: '유효한 날짜 형식을 입력해주세요.' })
  endDate?: string;

  @ApiPropertyOptional({
    description: '프로젝트 예산',
    example: 50000.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: '유효한 금액을 입력해주세요.' })
  @Min(0, { message: '예산은 0 이상이어야 합니다.' })
  budget?: number;

  @ApiPropertyOptional({
    description: '통화 단위',
    example: 'KRW',
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @MaxLength(3, { message: '통화 코드는 3자여야 합니다.' })
  currency?: string;

  @ApiPropertyOptional({
    description: '프로젝트 태그',
    example: ['web', 'react', 'nestjs'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: '프로젝트 색상 (HEX)',
    example: '#3B82F6',
    maxLength: 7,
  })
  @IsOptional()
  @IsString()
  @MaxLength(7, { message: '색상은 7자를 초과할 수 없습니다.' })
  color?: string;

  @ApiPropertyOptional({
    description: '프로젝트 아이콘',
    example: 'folder',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '아이콘 이름은 50자를 초과할 수 없습니다.' })
  icon?: string;

  @ApiPropertyOptional({
    description: '프로젝트 가시성',
    enum: ProjectVisibility,
    example: 'team',
  })
  @IsOptional()
  @IsEnum(ProjectVisibility, { message: '유효한 가시성을 선택해주세요.' })
  visibility?: ProjectVisibility;

  @ApiPropertyOptional({
    description: '프로젝트 설정',
    example: { enableTimeTracking: true, enableComments: true },
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({
    description: '프로젝트 제목',
    example: '워클리 웹 애플리케이션 개발 v2',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '프로젝트 제목은 100자를 초과할 수 없습니다.' })
  title?: string;

  @ApiPropertyOptional({
    description: '프로젝트 설명',
    example: '향상된 기능을 포함한 업무 관리 웹 애플리케이션입니다.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: '프로젝트 설명은 1000자를 초과할 수 없습니다.' })
  description?: string;

  @ApiPropertyOptional({
    description: '프로젝트 상태',
    enum: ProjectStatus,
    example: 'in_progress',
  })
  @IsOptional()
  @IsEnum(ProjectStatus, { message: '유효한 프로젝트 상태를 선택해주세요.' })
  status?: ProjectStatus;

  @ApiPropertyOptional({
    description: '프로젝트 우선순위',
    enum: ProjectPriority,
    example: 'medium',
  })
  @IsOptional()
  @IsEnum(ProjectPriority, { message: '유효한 우선순위를 선택해주세요.' })
  priority?: ProjectPriority;

  @ApiPropertyOptional({
    description: '프로젝트 시작일',
    example: '2024-01-20T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: '유효한 날짜 형식을 입력해주세요.' })
  startDate?: string;

  @ApiPropertyOptional({
    description: '프로젝트 종료일',
    example: '2024-07-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: '유효한 날짜 형식을 입력해주세요.' })
  endDate?: string;

  @ApiPropertyOptional({
    description: '프로젝트 예산',
    example: 75000.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: '유효한 금액을 입력해주세요.' })
  @Min(0, { message: '예산은 0 이상이어야 합니다.' })
  budget?: number;

  @ApiPropertyOptional({
    description: '통화 단위',
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  @MaxLength(3, { message: '통화 코드는 3자여야 합니다.' })
  currency?: string;

  @ApiPropertyOptional({
    description: '프로젝트 태그',
    example: ['web', 'react', 'nestjs', 'typescript'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: '프로젝트 색상 (HEX)',
    example: '#10B981',
  })
  @IsOptional()
  @IsString()
  @MaxLength(7, { message: '색상은 7자를 초과할 수 없습니다.' })
  color?: string;

  @ApiPropertyOptional({
    description: '프로젝트 아이콘',
    example: 'rocket',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '아이콘 이름은 50자를 초과할 수 없습니다.' })
  icon?: string;

  @ApiPropertyOptional({
    description: '프로젝트 가시성',
    enum: ProjectVisibility,
    example: 'public',
  })
  @IsOptional()
  @IsEnum(ProjectVisibility, { message: '유효한 가시성을 선택해주세요.' })
  visibility?: ProjectVisibility;

  @ApiPropertyOptional({
    description: '프로젝트 설정',
    example: { enableTimeTracking: false, enableFileAttachments: true },
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class ProjectQueryDto {
  @ApiPropertyOptional({
    description: '페이지 번호',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '페이지 번호는 정수여야 합니다.' })
  @Min(1, { message: '페이지 번호는 1 이상이어야 합니다.' })
  page?: number;

  @ApiPropertyOptional({
    description: '페이지 크기',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '페이지 크기는 정수여야 합니다.' })
  @Min(1, { message: '페이지 크기는 1 이상이어야 합니다.' })
  limit?: number;

  @ApiPropertyOptional({
    description: '프로젝트 상태 필터',
    enum: ProjectStatus,
    example: 'in_progress',
  })
  @IsOptional()
  @IsEnum(ProjectStatus, { message: '유효한 프로젝트 상태를 선택해주세요.' })
  status?: ProjectStatus;

  @ApiPropertyOptional({
    description: '우선순위 필터',
    enum: ProjectPriority,
    example: 'high',
  })
  @IsOptional()
  @IsEnum(ProjectPriority, { message: '유효한 우선순위를 선택해주세요.' })
  priority?: ProjectPriority;

  @ApiPropertyOptional({
    description: '가시성 필터',
    enum: ProjectVisibility,
    example: 'team',
  })
  @IsOptional()
  @IsEnum(ProjectVisibility, { message: '유효한 가시성을 선택해주세요.' })
  visibility?: ProjectVisibility;

  @ApiPropertyOptional({
    description: '검색어 (제목, 설명, 태그)',
    example: '워클리',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '검색어는 100자를 초과할 수 없습니다.' })
  search?: string;

  @ApiPropertyOptional({
    description: '정렬 기준',
    example: 'updatedAt',
    enum: ['createdAt', 'updatedAt', 'title', 'priority', 'startDate', 'endDate'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: '정렬 순서',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'], { message: '정렬 순서는 ASC 또는 DESC여야 합니다.' })
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    description: '아카이브된 프로젝트 포함 여부',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeArchived?: boolean;

  @ApiPropertyOptional({
    description: '태그 필터 목록',
    example: ['web', 'react'],
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class AddProjectMemberDto {
  @ApiProperty({
    description: '추가할 사용자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: '유효한 사용자 ID를 입력해주세요.' })
  userId: string;

  @ApiPropertyOptional({
    description: '멤버 역할',
    enum: ProjectMemberRole,
    example: 'member',
  })
  @IsOptional()
  @IsEnum(ProjectMemberRole, { message: '유효한 멤버 역할을 선택해주세요.' })
  role?: ProjectMemberRole;

  @ApiPropertyOptional({
    description: '멤버 권한 목록',
    example: ['read', 'write', 'manage_tasks'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}