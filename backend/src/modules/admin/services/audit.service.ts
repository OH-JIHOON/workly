import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../../database/entities/audit-log.entity';

export interface AuditLogData {
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId?: string;
  targetName?: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(data: AuditLogData): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      ...data,
      timestamp: new Date(),
    });

    return this.auditLogRepository.save(auditLog);
  }

  async getRecentActions(adminId: string, hours: number): Promise<AuditLog[]> {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    return this.auditLogRepository.find({
      where: {
        adminId,
        timestamp: since as any, // TypeORM MoreThanOrEqual 사용 시
      },
      order: {
        timestamp: 'DESC',
      },
    });
  }

  async getAuditLogs(options: {
    page?: number;
    limit?: number;
    adminId?: string;
    action?: string;
    targetType?: string;
    dateRange?: { start: Date; end: Date };
    success?: boolean;
  }): Promise<{
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    if (options.adminId) {
      queryBuilder.andWhere('audit.adminId = :adminId', { adminId: options.adminId });
    }

    if (options.action) {
      queryBuilder.andWhere('audit.action LIKE :action', { action: `%${options.action}%` });
    }

    if (options.targetType) {
      queryBuilder.andWhere('audit.targetType = :targetType', { targetType: options.targetType });
    }

    if (options.dateRange) {
      queryBuilder.andWhere('audit.timestamp >= :start AND audit.timestamp <= :end', {
        start: options.dateRange.start,
        end: options.dateRange.end,
      });
    }

    if (options.success !== undefined) {
      queryBuilder.andWhere('audit.success = :success', { success: options.success });
    }

    queryBuilder
      .orderBy('audit.timestamp', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }
}