import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('인증이 필요합니다');
    }

    if (!user.isAdminUser()) {
      throw new ForbiddenException('관리자 권한이 필요합니다');
    }

    // 마지막 어드민 로그인 시간 업데이트
    user.updateLastAdminLogin();

    return true;
  }
}