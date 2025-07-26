import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { 
  CreateTaskDto, 
  UpdateTaskDto, 
  TaskQueryDto 
} from './dto/task.dto';
import { 
  TaskStatus, 
  TaskPriority 
} from '../../shared/types/api.types';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // 태스크 생성
  @Post()
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 1분에 20개 생성 제한
  @ApiOperation({ summary: '새 태스크 생성' })
  @ApiResponse({
    status: 201,
    description: '태스크가 성공적으로 생성되었습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 403,
    description: '태스크 생성 권한이 없습니다.',
  })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.tasksService.create(createTaskDto, userId);
  }

  // 태스크 목록 조회
  @Get()
  @ApiOperation({ summary: '태스크 목록 조회 (필터링, 정렬, 페이징 지원)' })
  @ApiResponse({
    status: 200,
    description: '태스크 목록이 성공적으로 조회되었습니다.',
  })
  async findAll(
    @Query() query: TaskQueryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.tasksService.findAll(query, userId);
  }

  // 내 태스크 조회 (GTD 컨텍스트별)
  @Get('my/:context?')
  @ApiOperation({ summary: '내 태스크 조회 (GTD 컨텍스트별)' })
  @ApiParam({
    name: 'context',
    description: 'GTD 컨텍스트',
    enum: ['inbox', 'next', 'waiting', 'someday'],
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: '내 태스크 목록이 성공적으로 조회되었습니다.',
  })
  async getMyTasks(
    @Param('context') context: 'inbox' | 'next' | 'waiting' | 'someday' | undefined,
    @CurrentUser('id') userId: string,
  ) {
    return this.tasksService.getMyTasks(userId, context);
  }

  // GTD 스마트 필터 기반 태스크 조회
  @Get('filter/:filter')
  @ApiOperation({ summary: 'GTD 스마트 필터 기반 태스크 조회' })
  @ApiParam({
    name: 'filter',
    description: 'GTD 스마트 필터',
    enum: ['today', 'completed', 'all'],
  })
  @ApiResponse({
    status: 200,
    description: '필터링된 태스크 목록이 성공적으로 조회되었습니다.',
  })
  async getSmartFilteredTasks(
    @Param('filter') filter: 'today' | 'completed' | 'all',
    @CurrentUser('id') userId: string,
  ) {
    return this.tasksService.getSmartFilteredTasks(userId, filter);
  }

  // 특정 태스크 조회
  @Get(':id')
  @ApiOperation({ summary: '특정 태스크 상세 조회' })
  @ApiParam({
    name: 'id',
    description: '태스크 ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: '태스크 정보가 성공적으로 조회되었습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '태스크를 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 403,
    description: '태스크에 접근할 권한이 없습니다.',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.tasksService.findOne(id, userId);
  }

  // 태스크 정보 수정
  @Patch(':id')
  @ApiOperation({ summary: '태스크 정보 수정' })
  @ApiParam({
    name: 'id',
    description: '태스크 ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: '태스크가 성공적으로 수정되었습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '태스크를 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 403,
    description: '태스크를 수정할 권한이 없습니다.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.tasksService.update(id, updateTaskDto, userId);
  }

  // 태스크 상태 변경
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '태스크 상태 변경' })
  @ApiParam({
    name: 'id',
    description: '태스크 ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'status',
    description: '새로운 상태',
    enum: TaskStatus,
  })
  @ApiResponse({
    status: 200,
    description: '태스크 상태가 성공적으로 변경되었습니다.',
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('status') status: TaskStatus,
    @CurrentUser('id') userId: string,
  ) {
    return this.tasksService.updateStatus(id, status, userId);
  }

  // 태스크 우선순위 변경
  @Patch(':id/priority')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '태스크 우선순위 변경' })
  @ApiParam({
    name: 'id',
    description: '태스크 ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'priority',
    description: '새로운 우선순위',
    enum: TaskPriority,
  })
  @ApiResponse({
    status: 200,
    description: '태스크 우선순위가 성공적으로 변경되었습니다.',
  })
  async updatePriority(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('priority') priority: TaskPriority,
    @CurrentUser('id') userId: string,
  ) {
    return this.tasksService.updatePriority(id, priority, userId);
  }

  // 태스크 진행률 업데이트
  @Patch(':id/progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '태스크 진행률 업데이트' })
  @ApiParam({
    name: 'id',
    description: '태스크 ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'progress',
    description: '진행률 (0-100)',
    type: 'number',
    minimum: 0,
    maximum: 100,
  })
  @ApiResponse({
    status: 200,
    description: '태스크 진행률이 성공적으로 업데이트되었습니다.',
  })
  async updateProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('progress') progress: number,
    @CurrentUser('id') userId: string,
  ) {
    return this.tasksService.updateProgress(id, progress, userId);
  }

  // 태스크 삭제
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '태스크 삭제' })
  @ApiParam({
    name: 'id',
    description: '태스크 ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: '태스크가 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '태스크를 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 403,
    description: '태스크를 삭제할 권한이 없습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '의존성이 있는 태스크는 삭제할 수 없습니다.',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.tasksService.remove(id, userId);
  }
}