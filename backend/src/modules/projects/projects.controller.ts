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

import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { 
  CreateProjectDto, 
  UpdateProjectDto, 
  ProjectQueryDto,
  AddProjectMemberDto 
} from './dto/project.dto';
import { ProjectStatus } from '../../shared/types/api.types';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // 프로젝트 생성
  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 1분에 10개 생성 제한
  @ApiOperation({ summary: '새 프로젝트 생성' })
  @ApiResponse({
    status: 201,
    description: '프로젝트가 성공적으로 생성되었습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.create(createProjectDto, userId);
  }

  // 프로젝트 목록 조회
  @Get()
  @ApiOperation({ summary: '프로젝트 목록 조회 (필터링, 정렬, 페이징 지원)' })
  @ApiResponse({
    status: 200,
    description: '프로젝트 목록이 성공적으로 조회되었습니다.',
  })
  async findAll(
    @Query() query: ProjectQueryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.findAll(query, userId);
  }

  // 내 프로젝트 조회
  @Get('my')
  @ApiOperation({ summary: '내 프로젝트 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '내 프로젝트 목록이 성공적으로 조회되었습니다.',
  })
  async getMyProjects(@CurrentUser('id') userId: string) {
    return this.projectsService.getMyProjects(userId);
  }

  // 특정 프로젝트 조회
  @Get(':id')
  @ApiOperation({ summary: '특정 프로젝트 상세 조회' })
  @ApiParam({
    name: 'id',
    description: '프로젝트 ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: '프로젝트 정보가 성공적으로 조회되었습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '프로젝트를 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 403,
    description: '프로젝트에 접근할 권한이 없습니다.',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.findOne(id, userId);
  }

  // 프로젝트 정보 수정
  @Patch(':id')
  @ApiOperation({ summary: '프로젝트 정보 수정' })
  @ApiParam({
    name: 'id',
    description: '프로젝트 ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: '프로젝트가 성공적으로 수정되었습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '프로젝트를 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 403,
    description: '프로젝트를 수정할 권한이 없습니다.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.update(id, updateProjectDto, userId);
  }

  // 프로젝트 상태 변경
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '프로젝트 상태 변경' })
  @ApiParam({
    name: 'id',
    description: '프로젝트 ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'status',
    description: '새로운 상태',
    enum: ProjectStatus,
  })
  @ApiResponse({
    status: 200,
    description: '프로젝트 상태가 성공적으로 변경되었습니다.',
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('status') status: ProjectStatus,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.updateStatus(id, status, userId);
  }

  // 프로젝트 멤버 추가
  @Post(':id/members')
  @ApiOperation({ summary: '프로젝트 멤버 추가' })
  @ApiParam({
    name: 'id',
    description: '프로젝트 ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: '멤버가 성공적으로 추가되었습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '이미 프로젝트 멤버입니다.',
  })
  @ApiResponse({
    status: 403,
    description: '멤버를 추가할 권한이 없습니다.',
  })
  async addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addMemberDto: AddProjectMemberDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.addMember(id, addMemberDto, userId);
  }

  // 프로젝트 멤버 목록 조회
  @Get(':id/members')
  @ApiOperation({ summary: '프로젝트 멤버 목록 조회' })
  @ApiParam({
    name: 'id',
    description: '프로젝트 ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: '프로젝트 멤버 목록이 성공적으로 조회되었습니다.',
  })
  async getMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.getMembers(id, userId);
  }

  // 프로젝트 멤버 제거
  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '프로젝트 멤버 제거' })
  @ApiParam({
    name: 'id',
    description: '프로젝트 ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'memberId',
    description: '제거할 멤버 ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: '멤버가 성공적으로 제거되었습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '프로젝트 소유자는 제거할 수 없습니다.',
  })
  @ApiResponse({
    status: 403,
    description: '멤버를 제거할 권한이 없습니다.',
  })
  async removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.removeMember(id, memberId, userId);
  }

  // 프로젝트 삭제 (아카이브)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '프로젝트 삭제 (아카이브)' })
  @ApiParam({
    name: 'id',
    description: '프로젝트 ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: '프로젝트가 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '프로젝트를 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 403,
    description: '프로젝트를 삭제할 권한이 없습니다.',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.remove(id, userId);
  }
}