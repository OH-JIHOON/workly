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
  Max,
  MaxLength,
  MinLength,
  IsInt,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  TaskStatus, 
  TaskPriority, 
  TaskType 
} from '../../../shared/types/api.types';

export class CreateTaskDto {
  @ApiProperty({
    description: '태스크 제목',
    example: '로그인 기능 구현',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @MinLength(1, { message: '태스크 제목은 필수입니다.' })
  @MaxLength(200, { message: '태스크 제목은 200자를 초과할 수 없습니다.' })
  title: string;

  @ApiPropertyOptional({
    description: '태스크 설명',
    example: 'JWT를 사용한 로그인 기능을 구현합니다.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: '태스크 설명은 2000자를 초과할 수 없습니다.' })
  description?: string;

  @ApiPropertyOptional({
    description: '프로젝트 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4, { message: '유효한 프로젝트 ID를 입력해주세요.' })
  projectId?: string;

  @ApiPropertyOptional({
    description: '담당자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4, { message: '유효한 담당자 ID를 입력해주세요.' })
  assigneeId?: string;

  @ApiPropertyOptional({
    description: '부모 태스크 ID (서브태스크인 경우)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4, { message: '유효한 부모 태스크 ID를 입력해주세요.' })
  parentTaskId?: string;

  @ApiPropertyOptional({
    description: '태스크 우선순위',
    enum: TaskPriority,
    example: 'medium',
  })
  @IsOptional()
  @IsEnum(TaskPriority, { message: '유효한 우선순위를 선택해주세요.' })
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: '태스크 타입',
    enum: TaskType,
    example: 'task',
  })
  @IsOptional()
  @IsEnum(TaskType, { message: '유효한 태스크 타입을 선택해주세요.' })
  type?: TaskType;

  @ApiPropertyOptional({
    description: '마감일',
    example: '2024-02-01T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: '유효한 날짜 형식을 입력해주세요.' })
  dueDate?: string;

  @ApiPropertyOptional({
    description: '시작일',
    example: '2024-01-15T09:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: '유효한 날짜 형식을 입력해주세요.' })
  startDate?: string;

  @ApiPropertyOptional({
    description: '예상 소요 시간 (시간 단위)',
    example: 8.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: '유효한 숫자를 입력해주세요.' })
  @Min(0, { message: '예상 소요 시간은 0 이상이어야 합니다.' })
  estimatedHours?: number;

  @ApiPropertyOptional({
    description: '태그 목록',
    example: ['frontend', 'authentication'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: '레이블 ID 목록',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true, message: '유효한 레이블 ID를 입력해주세요.' })
  labelIds?: string[];

  @ApiPropertyOptional({
    description: '커스텀 필드',
    example: { category: 'development', client: 'internal' },
  })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: '태스크 제목',
    example: '로그인 기능 구현 완료',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '태스크 제목은 200자를 초과할 수 없습니다.' })
  title?: string;

  @ApiPropertyOptional({
    description: '태스크 설명',
    example: 'JWT를 사용한 로그인 기능 구현이 완료되었습니다.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: '태스크 설명은 2000자를 초과할 수 없습니다.' })
  description?: string;

  @ApiPropertyOptional({
    description: '태스크 상태',
    enum: TaskStatus,
    example: 'in_progress',
  })
  @IsOptional()
  @IsEnum(TaskStatus, { message: '유효한 태스크 상태를 선택해주세요.' })
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: '태스크 우선순위',
    enum: TaskPriority,
    example: 'high',
  })
  @IsOptional()
  @IsEnum(TaskPriority, { message: '유효한 우선순위를 선택해주세요.' })
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: '태스크 타입',
    enum: TaskType,
    example: 'feature',
  })
  @IsOptional()
  @IsEnum(TaskType, { message: '유효한 태스크 타입을 선택해주세요.' })
  type?: TaskType;

  @ApiPropertyOptional({
    description: '마감일',
    example: '2024-02-01T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: '유효한 날짜 형식을 입력해주세요.' })
  dueDate?: string;

  @ApiPropertyOptional({
    description: '시작일',
    example: '2024-01-15T09:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: '유효한 날짜 형식을 입력해주세요.' })
  startDate?: string;

  @ApiPropertyOptional({
    description: '예상 소요 시간 (시간 단위)',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: '유효한 숫자를 입력해주세요.' })
  @Min(0, { message: '예상 소요 시간은 0 이상이어야 합니다.' })
  estimatedHours?: number;

  @ApiPropertyOptional({
    description: '진행률 (0-100)',
    example: 75,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsInt({ message: '진행률은 정수여야 합니다.' })
  @Min(0, { message: '진행률은 0 이상이어야 합니다.' })
  @Max(100, { message: '진행률은 100 이하여야 합니다.' })
  progress?: number;

  @ApiPropertyOptional({
    description: '태그 목록',
    example: ['frontend', 'authentication', 'completed'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: '레이블 ID 목록',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true, message: '유효한 레이블 ID를 입력해주세요.' })
  labelIds?: string[];

  @ApiPropertyOptional({
    description: '커스텀 필드',
    example: { category: 'development', reviewStatus: 'approved' },
  })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

export class TaskQueryDto {
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
  @Max(100, { message: '페이지 크기는 100 이하여야 합니다.' })
  limit?: number;

  @ApiPropertyOptional({
    description: '태스크 상태 필터',
    enum: TaskStatus,
    example: 'in_progress',
  })
  @IsOptional()
  @IsEnum(TaskStatus, { message: '유효한 태스크 상태를 선택해주세요.' })
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: '우선순위 필터',
    enum: TaskPriority,
    example: 'high',
  })
  @IsOptional()
  @IsEnum(TaskPriority, { message: '유효한 우선순위를 선택해주세요.' })
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: '태스크 타입 필터',
    enum: TaskType,
    example: 'feature',
  })
  @IsOptional()
  @IsEnum(TaskType, { message: '유효한 태스크 타입을 선택해주세요.' })
  type?: TaskType;

  @ApiPropertyOptional({
    description: '프로젝트 ID 필터',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4, { message: '유효한 프로젝트 ID를 입력해주세요.' })
  projectId?: string;

  @ApiPropertyOptional({
    description: '담당자 ID 필터',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4, { message: '유효한 담당자 ID를 입력해주세요.' })
  assigneeId?: string;

  @ApiPropertyOptional({
    description: '생성자 ID 필터',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4, { message: '유효한 생성자 ID를 입력해주세요.' })
  reporterId?: string;

  @ApiPropertyOptional({
    description: '마감일 필터 (YYYY-MM-DD)',
    example: '2024-02-01',
  })
  @IsOptional()
  @IsDateString({}, { message: '유효한 날짜 형식을 입력해주세요.' })
  dueDate?: string;

  @ApiPropertyOptional({
    description: '검색어 (제목, 설명, 태그)',
    example: '로그인',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '검색어는 100자를 초과할 수 없습니다.' })
  search?: string;

  @ApiPropertyOptional({
    description: '정렬 기준',
    example: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'title', 'priority', 'dueDate', 'status'],
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
    description: '서브태스크 포함 여부',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeSubtasks?: boolean;

  @ApiPropertyOptional({
    description: '레이블 ID 필터 목록',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsArray()
  @IsUUID(4, { each: true, message: '유효한 레이블 ID를 입력해주세요.' })
  labelIds?: string[];

  @ApiPropertyOptional({
    description: '태그 필터 목록',
    example: ['frontend', 'authentication'],
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CreateTaskLabelDto {
  @ApiProperty({
    description: '레이블 이름',
    example: 'Bug',
    maxLength: 50,
  })
  @IsString()
  @MinLength(1, { message: '레이블 이름은 필수입니다.' })
  @MaxLength(50, { message: '레이블 이름은 50자를 초과할 수 없습니다.' })
  name: string;

  @ApiProperty({
    description: '레이블 색상 (HEX)',
    example: '#FF0000',
  })
  @IsString()
  @MaxLength(7, { message: '색상은 7자를 초과할 수 없습니다.' })
  color: string;

  @ApiPropertyOptional({
    description: '레이블 설명',
    example: '버그 및 오류 관련 태스크',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '레이블 설명은 200자를 초과할 수 없습니다.' })
  description?: string;

  @ApiPropertyOptional({
    description: '프로젝트 ID (프로젝트 전용 레이블인 경우)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4, { message: '유효한 프로젝트 ID를 입력해주세요.' })
  projectId?: string;
}

export class UpdateTaskLabelDto {
  @ApiPropertyOptional({
    description: '레이블 이름',
    example: 'Critical Bug',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '레이블 이름은 50자를 초과할 수 없습니다.' })
  name?: string;

  @ApiPropertyOptional({
    description: '레이블 색상 (HEX)',
    example: '#CC0000',
  })
  @IsOptional()
  @IsString()
  @MaxLength(7, { message: '색상은 7자를 초과할 수 없습니다.' })
  color?: string;

  @ApiPropertyOptional({
    description: '레이블 설명',
    example: '긴급하게 처리해야 할 버그',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '레이블 설명은 200자를 초과할 수 없습니다.' })
  description?: string;
}