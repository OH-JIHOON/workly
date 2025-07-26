import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { getAuthConfig } from '../../../config/auth.config';
import { JwtPayload } from '../../../shared/interfaces/jwt-payload.interface';

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
    });
  }

  async validate(payload: JwtPayload) {
    // JWT 페이로드에서 사용자 ID 추출
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