import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuditMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || '';
    const user = req['user'];
    
    // 로그인/로그아웃/인증 관련 엔드포인트만 감사 로그 기록
    const auditPaths = ['/auth/login', '/auth/logout', '/auth/register', '/auth/refresh'];
    const shouldAudit = auditPaths.some(path => originalUrl.includes(path));

    if (shouldAudit) {
      const startTime = Date.now();

      // 응답 완료 시 로그 기록
      res.on('finish', () => {
        const { statusCode } = res;
        const contentLength = res.get('content-length');
        const responseTime = Date.now() - startTime;

        const logData = {
          method,
          url: originalUrl,
          statusCode,
          contentLength,
          responseTime: `${responseTime}ms`,
          ip,
          userAgent,
          userId: (user as any)?.id || 'anonymous',
          timestamp: new Date().toISOString(),
        };

        if (statusCode >= 400) {
          this.logger.warn(`인증 실패: ${JSON.stringify(logData)}`);
        } else {
          this.logger.log(`인증 성공: ${JSON.stringify(logData)}`);
        }
      });
    }

    next();
  }
}