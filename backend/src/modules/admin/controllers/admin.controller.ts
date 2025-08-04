import { 
  Controller, 
  Get, 
  UseGuards, 
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { AuditLog } from '../decorators/audit-log.decorator';
import { AuditLogInterceptor } from '../interceptors/audit-log.interceptor';
import { AdminService } from '../services/admin.service';

@Controller('api/admin')
@UseGuards(AdminGuard, PermissionsGuard)
@UseInterceptors(AuditLogInterceptor)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @RequirePermissions('admin:dashboard:read')
  @AuditLog('대시보드 조회')
  async getDashboard(@Req() req: any) {
    const stats = await this.adminService.getDashboardStats();
    
    return {
      success: true,
      data: {
        stats,
        adminInfo: {
          id: req.user.id,
          name: req.user.name,
          role: req.user.adminRole,
          permissions: req.user.adminPermissions,
          lastAdminLogin: req.user.lastAdminLogin,
        },
      },
    };
  }

  @Get('profile')
  @RequirePermissions('admin:profile:read')
  async getAdminProfile(@Req() req: any) {
    return {
      success: true,
      data: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.adminRole,
        permissions: req.user.adminPermissions,
        lastAdminLogin: req.user.lastAdminLogin,
        twoFactorEnabled: req.user.twoFactorEnabled,
        allowedIPs: req.user.allowedIPs,
      },
    };
  }
}