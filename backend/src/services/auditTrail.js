import { AuditLog } from '../models/AuditLog.js';

export async function recordAuditLog(req, { action, resourceType, resourceId, metadata = {} }) {
  try {
    await AuditLog.create({
      actorId: req.user?.id,
      actorRole: req.user?.role || 'unknown',
      action,
      resourceType,
      resourceId,
      metadata,
      ipAddress: req.ip,
      userAgent: req.get?.('user-agent') || '',
    });
  } catch (error) {
    // Avoid breaking primary flow if audit logging fails
    if (process.env.NODE_ENV !== 'test') {
      console.warn('Failed to record audit log', error?.message);
    }
  }
}

