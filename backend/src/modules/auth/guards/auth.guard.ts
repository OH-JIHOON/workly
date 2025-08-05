import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getAuthConfig } from '../../../config/auth.config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('인증 토큰이 제공되지 않았습니다.');
    }

    const token = authHeader.split(' ')[1];
    
    // 개발 환경에서 dev-admin-token 처리
    if (process.env.NODE_ENV === 'development' && token === 'dev-admin-token') {
      // 개발용 사용자 객체를 request에 할당 (AdminGuard에서 재사용됨)
      request['user'] = {
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

    const authConfig = getAuthConfig(this.configService);

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: authConfig.jwt.secret,
      });

      // JWT 페이로드를 req.user에 할당
      request['user'] = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('유효하지 않거나 만료된 토큰입니다.');
    }
  }
}
