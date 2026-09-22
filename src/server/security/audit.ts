import { prisma } from '../database/prisma';

export interface AuditParams {
  actorId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown> | string;
  ipAddress?: string;
}

export async function logAuditEvent({
  actorId,
  action,
  entity,
  entityId,
  details,
  ipAddress,
}: AuditParams): Promise<void> {
  try {
    const detailsString =
      typeof details === 'object' ? JSON.stringify(details) : details;

    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        entity,
        entityId,
        details: detailsString,
        ipAddress: ipAddress || '127.0.0.1',
      },
    });
  } catch (error) {
    // Audit logging failure should not crash user operation, but log to server console
    console.error('[AUDIT_LOG_ERROR]', error);
  }
}
