import { SetMetadata } from '@nestjs/common';

export const AuditLog = (action: string) =>
  SetMetadata('auditAction', action);

export const AUDIT_ACTION_KEY = 'auditAction';