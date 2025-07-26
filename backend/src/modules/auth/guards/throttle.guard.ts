import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(context: ExecutionContext): Promise<void> {
    throw new ThrottlerException('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
  }

  protected getTracker(req: Record<string, any>): string {
    // IP 주소와 사용자 ID를 조합하여 더 정확한 추적
    const userId = req.user?.sub || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `${ip}-${userId}`;
  }
}