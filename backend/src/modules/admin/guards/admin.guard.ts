import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const authHeader = request.headers.authorization;

    // 개발 환경에서 dev-admin-token 처리
    if (process.env.NODE_ENV === 'development' && authHeader === 'Bearer dev-admin-token') {
      // 개발용 관리자 사용자 객체 생성
      request.user = {
        id: 'dev-admin-1',
        name: '워클리 개발 관리자',
        email: 'dev-admin@workly.com',
        adminRole: 'super_admin',
        adminPermissions: ['*'],
        isAdminUser: () => true,
        updateLastAdminLogin: () => {},
        lastAdminLogin: new Date(),
        twoFactorEnabled: false,
        allowedIPs: ['*']
      };
      return true;
    }

    if (!user) {
      throw new ForbiddenException('인증이 필요합니다');
    }


    // JWT 페이로드에서 adminRole 확인 (Entity 메서드가 없는 경우)
    const isAdmin = typeof user.isAdminUser === 'function' 
      ? user.isAdminUser() 
      : (user.adminRole && ['super_admin', 'admin', 'moderator'].includes(user.adminRole));

    if (!isAdmin) {
      throw new ForbiddenException('관리자 권한이 필요합니다');
    }

    // Entity 메서드가 있는 경우에만 호출
    if (typeof user.updateLastAdminLogin === 'function') {
      user.updateLastAdminLogin();
    }

    return true;
  }
}