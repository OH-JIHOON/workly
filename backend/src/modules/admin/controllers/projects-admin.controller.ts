import { 
  Controller, 
  Get, 
  Delete,
  Param,
  Query,
  UseGuards, 
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { AuditLog } from '../decorators/audit-log.decorator';
import { AuditLogInterceptor } from '../interceptors/audit-log.interceptor';
import { AdminService } from '../services/admin.service';

@Controller('api/admin/projects')
@UseGuards(AdminGuard, PermissionsGuard)
@UseInterceptors(AuditLogInterceptor)
export class ProjectsAdminController {
  constructor(private adminService: AdminService) {}

  @Get()
  @RequirePermissions('admin:projects:read')
  @AuditLog('프로젝트 목록 조회')
  async getAllProjects(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.adminService.getAllProjects({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      status,
    });

    return {
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  @Get(':id')
  @RequirePermissions('admin:projects:read')
  @AuditLog('프로젝트 상세 조회')
  async getProjectById(@Param('id', ParseUUIDPipe) id: string) {
    const project = await this.adminService.getProjectById(id);

    return {
      success: true,
      data: project,
    };
  }

  @Delete(':id')
  @RequirePermissions('admin:projects:delete')
  @AuditLog('프로젝트 삭제')
  async deleteProject(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminService.deleteProject(id);

    return {
      success: true,
      message: '프로젝트가 성공적으로 삭제되었습니다',
    };
  }
}