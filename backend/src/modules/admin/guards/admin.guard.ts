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

    // 디버깅을 위한 로그 추가
    console.log('Admin Guard - User data:', {
      id: user.id,
      email: user.email,
      name: user.name,
      adminRole: user.adminRole,
      adminPermissions: user.adminPermissions,
      isAdminUser: typeof user.isAdminUser === 'function' ? user.isAdminUser() : 'not a function'
    });

    if (!user.isAdminUser()) {
      throw new ForbiddenException('관리자 권한이 필요합니다');
    }

    // 마지막 어드민 로그인 시간 업데이트
    user.updateLastAdminLogin();

    return true;
  }
}