import { prisma } from '../database/prisma';
import { logAuditEvent } from '../security/audit';

export const FORGE_MODE_BYPASS_EMAILS = [
  'threadsecuritydeveloper@gmail.com',
  'kunaldigitalconnect@gmail.com',
  'threadsecurity@gmail.com',
  'threadsecuritymentor@gmail.com',
].map((e) => e.toLowerCase());

export function isForgeBypassedEmail(email?: string | null): boolean {
  if (!email) return false;
  return FORGE_MODE_BYPASS_EMAILS.includes(email.trim().toLowerCase());
}

export const FORGE_FLAG_KEY = 'FORGE_MAINTENANCE_MODE';

// Resilient memory cache for instant sub-millisecond middleware checks
let inMemoryForgeState: {
  isEnabled: boolean;
  updatedAt: string;
  updatedBy: string;
} = {
  isEnabled: false,
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

/**
 * Checks whether developer Forge Mode is currently active
 */
export async function getForgeModeStatusService(): Promise<{
  isEnabled: boolean;
  updatedAt: string;
  updatedBy: string;
}> {
  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { key: FORGE_FLAG_KEY },
    });

    if (flag) {
      inMemoryForgeState = {
        isEnabled: flag.isEnabled,
        updatedAt: flag.updatedAt.toISOString(),
        updatedBy: flag.description || 'developer',
      };
      return inMemoryForgeState;
    }
  } catch (err) {
    console.warn('[ForgeService] DB read notice, using memory cache:', err);
  }

  return inMemoryForgeState;
}

/**
 * Toggles Forge Mode ON or OFF persistently
 */
export async function toggleForgeModeService(params: {
  enabled: boolean;
  triggeredByEmail: string;
  notes?: string;
}): Promise<{
  success: boolean;
  isEnabled: boolean;
  updatedAt: string;
}> {
  const now = new Date();
  const description = `Triggered by ${params.triggeredByEmail}: ${params.notes || (params.enabled ? 'Deep Dev Lockdown' : 'Doors Reopened')}`;

  try {
    const flag = await prisma.featureFlag.upsert({
      where: { key: FORGE_FLAG_KEY },
      create: {
        key: FORGE_FLAG_KEY,
        description,
        isEnabled: params.enabled,
        targetRoles: ['SUPER_ADMIN'],
        percentage: 100,
      },
      update: {
        isEnabled: params.enabled,
        description,
        updatedAt: now,
      },
    });

    inMemoryForgeState = {
      isEnabled: flag.isEnabled,
      updatedAt: flag.updatedAt.toISOString(),
      updatedBy: params.triggeredByEmail,
    };

    // Audit log
    await logAuditEvent({
      actorId: params.triggeredByEmail,
      action: params.enabled ? 'SYSTEM_LOCKED' : 'SYSTEM_UNLOCKED',
      entity: 'FORGE_MODE',
      entityId: FORGE_FLAG_KEY,
      details: JSON.stringify({
        enabled: params.enabled,
        triggeredBy: params.triggeredByEmail,
        bypassedEmails: FORGE_MODE_BYPASS_EMAILS,
      }),
    });

    return {
      success: true,
      isEnabled: flag.isEnabled,
      updatedAt: flag.updatedAt.toISOString(),
    };
  } catch (err) {
    console.warn('[ForgeService] DB write fallback, updating in-memory state:', err);
    inMemoryForgeState = {
      isEnabled: params.enabled,
      updatedAt: now.toISOString(),
      updatedBy: params.triggeredByEmail,
    };
    return {
      success: true,
      isEnabled: inMemoryForgeState.isEnabled,
      updatedAt: inMemoryForgeState.updatedAt,
    };
  }
}

