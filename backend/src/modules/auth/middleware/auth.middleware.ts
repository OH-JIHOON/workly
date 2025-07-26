import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getAuthConfig } from '../../../config/auth.config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = this.extractTokenFromHeader(req);
      
      if (token) {
        const authConfig = getAuthConfig(this.configService);
        const payload = await this.jwtService.verifyAsync(token, {
          secret: authConfig.jwt.secret,
        });
        
        // 요청에 사용자 정보 첨부
        req['user'] = payload;
      }
    } catch (error) {
      // 토큰이 유효하지 않은 경우, 사용자 정보를 첨부하지 않고 계속 진행
      // 실제 인증이 필요한 경우는 가드에서 처리
    }

    next();
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}