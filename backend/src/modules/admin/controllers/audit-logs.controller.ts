import { 
  Controller, 
  Get,
  Query,
  UseGuards, 
  UseInterceptors,
} from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { AuditLog } from '../decorators/audit-log.decorator';
import { AuditLogInterceptor } from '../interceptors/audit-log.interceptor';
import { AuditService } from '../services/audit.service';

@Controller('api/admin/audit-logs')
@UseGuards(AdminGuard, PermissionsGuard)
@UseInterceptors(AuditLogInterceptor)
export class AuditLogsController {
  constructor(private auditService: AuditService) {}

  @Get()
  @RequirePermissions('admin:audit:read')
  @AuditLog('감사 로그 조회')
  async getAuditLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('adminId') adminId?: string,
    @Query('action') action?: string,
    @Query('targetType') targetType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('success') success?: string,
  ) {
    const dateRange = startDate && endDate ? {
      start: new Date(startDate),
      end: new Date(endDate),
    } : undefined;

    const result = await this.auditService.getAuditLogs({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
      adminId,
      action,
      targetType,
      dateRange,
      success: success ? success === 'true' : undefined,
    });

    return {
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  @Get('recent')
  @RequirePermissions('admin:audit:read')
  async getRecentAuditLogs(
    @Query('adminId') adminId?: string,
    @Query('hours') hours?: number,
  ) {
    const logs = await this.auditService.getRecentActions(
      adminId || '',
      hours ? Number(hours) : 24,
    );

    return {
      success: true,
      data: logs,
    };
  }
}