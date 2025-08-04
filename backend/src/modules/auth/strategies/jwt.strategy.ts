import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { getAuthConfig } from '../../../config/auth.config';
import { JwtPayload } from '@workly/shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const authConfig = getAuthConfig(configService);
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwt.secret,
      passReqToCallback: true, // request 객체를 validate 메서드에 전달
    });
  }

  async validate(request: any, payload?: JwtPayload) {
    // 개발 환경에서 dev-admin-token 처리
    if (process.env.NODE_ENV === 'development') {
      const authHeader = request.headers.authorization;
      if (authHeader === 'Bearer dev-admin-token') {
        // 개발용 관리자 사용자 객체 반환
        return {
          id: 'dev-admin-1',
          name: '워클리 개발 관리자',
          email: 'dev-admin@workly.com',
          adminRole: 'super_admin',
          adminPermissions: ['*'],
          status: 'active',
          isAdminUser: () => true,
          isSuperAdmin: () => true,
          hasAllAdminPermissions: () => true,
          updateLastAdminLogin: () => {},
          lastAdminLogin: new Date(),
          twoFactorEnabled: false,
          allowedIPs: ['*']
        };
      }
    }

    // 일반 JWT 토큰 처리
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.authService.validateUserById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    // 사용자 상태 확인
    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    return user;
  }
}