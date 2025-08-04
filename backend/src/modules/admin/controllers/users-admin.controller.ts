import { 
  Controller, 
  Get, 
  Post,
  Put,
  Delete,
  Param,
  Body,
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
import { AdminRole } from '../../../../shared/types/admin.types';

class UpdateUserRoleDto {
  role: AdminRole;
  permissions: string[];
}

@Controller('api/admin/users')
@UseGuards(AdminGuard, PermissionsGuard)
@UseInterceptors(AuditLogInterceptor)
export class UsersAdminController {
  constructor(private adminService: AdminService) {}

  @Get()
  @RequirePermissions('admin:users:read')
  @AuditLog('사용자 목록 조회')
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: AdminRole,
  ) {
    const result = await this.adminService.getAllUsers({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      role,
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
  @RequirePermissions('admin:users:read')
  @AuditLog('사용자 상세 조회')
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.adminService.getUserById(id);

    return {
      success: true,
      data: user,
    };
  }

  @Put(':id/role')
  @RequirePermissions('admin:users:update', 'admin:roles:manage')
  @AuditLog('사용자 권한 변경')
  async updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
  ) {
    const user = await this.adminService.updateUserAdminRole(
      id,
      updateRoleDto.role,
      updateRoleDto.permissions,
    );

    return {
      success: true,
      data: user,
      message: '사용자 권한이 성공적으로 변경되었습니다',
    };
  }

  @Delete(':id')
  @RequirePermissions('admin:users:delete')
  @AuditLog('사용자 삭제')
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminService.deleteUser(id);

    return {
      success: true,
      message: '사용자가 성공적으로 삭제되었습니다',
    };
  }
}