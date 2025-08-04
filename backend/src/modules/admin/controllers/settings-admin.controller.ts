import { 
  Controller, 
  Get, 
  Put,
  Body,
  UseGuards, 
  UseInterceptors,
} from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { AuditLog } from '../decorators/audit-log.decorator';
import { AuditLogInterceptor } from '../interceptors/audit-log.interceptor';
import { AdminService } from '../services/admin.service';

class UpdateSystemSettingsDto {
  maintenanceMode?: boolean;
  registrationEnabled?: boolean;
  maxUsersPerProject?: number;
  maxProjectsPerUser?: number;
  emailNotifications?: boolean;
}

@Controller('api/admin/settings')
@UseGuards(AdminGuard, PermissionsGuard)
@UseInterceptors(AuditLogInterceptor)
export class SettingsAdminController {
  constructor(private adminService: AdminService) {}

  @Get()
  @RequirePermissions('admin:settings:read')
  @AuditLog('시스템 설정 조회')
  async getSystemSettings() {
    const settings = await this.adminService.getSystemSettings();

    return {
      success: true,
      data: settings,
    };
  }

  @Put()
  @RequirePermissions('admin:settings:update')
  @AuditLog('시스템 설정 변경')
  async updateSystemSettings(@Body() updateSettingsDto: UpdateSystemSettingsDto) {
    const settings = await this.adminService.updateSystemSettings(updateSettingsDto);

    return {
      success: true,
      data: settings,
      message: '시스템 설정이 성공적으로 변경되었습니다',
    };
  }
}