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

    // JWT 페이로드 또는 Entity 객체 모두 지원
    let hasPermission = false;
    
    if (typeof user.hasAllAdminPermissions === 'function') {
      // Entity 객체인 경우
      hasPermission = user.hasAllAdminPermissions(requiredPermissions);
    } else {
      // JWT 페이로드인 경우 - adminPermissions 배열 직접 확인
      const userPermissions = user.adminPermissions || [];
      
      // super_admin은 모든 권한 허용
      if (user.adminRole === 'super_admin' || userPermissions.includes('*') || userPermissions.includes('{\"*\"}')) {
        hasPermission = true;
      } else {
        // 개별 권한 확인
        hasPermission = requiredPermissions.every(permission => 
          userPermissions.includes(permission)
        );
      }
    }

    if (!hasPermission) {
      throw new ForbiddenException(
        `다음 권한이 필요합니다: ${requiredPermissions.join(', ')}`
      );
    }

    return true;
  }
}