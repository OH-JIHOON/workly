import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditService } from '../services/audit.service';
import { AUDIT_ACTION_KEY } from '../decorators/audit-log.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const action = this.reflector.get<string>(AUDIT_ACTION_KEY, context.getHandler());
    
    if (!action) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // JWT 페이로드와 Entity 객체 모두 지원
    const isAdmin = user && (
      typeof user.isAdminUser === 'function' 
        ? user.isAdminUser() 
        : (user.adminRole && ['super_admin', 'admin', 'moderator'].includes(user.adminRole))
    );

    if (!isAdmin) {
      return next.handle();
    }

    const targetType = this.extractTargetType(context);
    const targetId = this.extractTargetId(request);
    const beforeData = this.extractBeforeData(request);

    return next.handle().pipe(
      tap((result) => {
        this.auditService.log({
          adminId: user.id || user.sub,
          adminName: user.name || user.email,
          action,
          targetType,
          targetId,
          targetName: this.extractTargetName(result),
          changes: {
            before: beforeData,
            after: this.extractAfterData(result),
          },
          ipAddress: this.getClientIp(request),
          userAgent: request.get('User-Agent') || '',
          success: true,
        }).catch(error => {
          console.error('감사 로그 저장 실패:', error);
        });
      }),
      catchError((error) => {
        this.auditService.log({
          adminId: user.id || user.sub,
          adminName: user.name || user.email,
          action,
          targetType,
          targetId,
          ipAddress: this.getClientIp(request),
          userAgent: request.get('User-Agent') || '',
          success: false,
          errorMessage: error.message,
        }).catch(logError => {
          console.error('감사 로그 저장 실패:', logError);
        });
        throw error;
      })
    );
  }

  private extractTargetType(context: ExecutionContext): string {
    const controllerName = context.getClass().name;
    
    if (controllerName.includes('Users')) return 'user';
    if (controllerName.includes('Projects')) return 'project';
    if (controllerName.includes('Tasks')) return 'task';
    if (controllerName.includes('Settings')) return 'settings';
    
    return 'system';
  }

  private extractTargetId(request: any): string | undefined {
    return request.params?.id;
  }

  private extractTargetName(result: any): string | undefined {
    if (result?.data?.name) return result.data.name;
    if (result?.data?.title) return result.data.title;
    if (result?.data?.email) return result.data.email;
    return undefined;
  }

  private extractBeforeData(request: any): Record<string, any> | undefined {
    // 업데이트 요청인 경우, 기존 데이터를 가져와야 하지만 
    // 여기서는 간단히 요청 바디를 반환
    return request.body;
  }

  private extractAfterData(result: any): Record<string, any> | undefined {
    return result?.data;
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }
}