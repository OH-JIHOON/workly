import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const authHeader = request.headers.authorization;

    if (!user) {
      throw new ForbiddenException('인증이 필요합니다');
    }

    // 개발 환경에서 dev-admin-token은 모든 권한 허용
    if (process.env.NODE_ENV === 'development' && authHeader === 'Bearer dev-admin-token') {
      return true;
    }

    const hasPermission = user.hasAllAdminPermissions && user.hasAllAdminPermissions(requiredPermissions);

    if (!hasPermission) {
      throw new ForbiddenException(
        `다음 권한이 필요합니다: ${requiredPermissions.join(', ')}`
      );
    }

    return true;
  }
}