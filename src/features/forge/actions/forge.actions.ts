'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import {
  getForgeModeStatusService,
  toggleForgeModeService,
  isForgeBypassedEmail,
  FORGE_MODE_BYPASS_EMAILS,
} from '@/server/services/forge.service';

export async function getForgeStatusAction() {
  const session = await getSession();
  const status = await getForgeModeStatusService();
  const isBypassed = isForgeBypassedEmail(session?.email);

  return {
    ...status,
    currentUserEmail: session?.email || null,
    isCurrentUserBypassed: isBypassed,
    bypassedEmails: FORGE_MODE_BYPASS_EMAILS,
  };
}

export async function toggleForgeModeAction(enabled: boolean, notes?: string) {
  const session = await getSession();

  // Only SUPER_ADMIN or bypassed developer emails can toggle Forge Mode
  const isDeveloperBypass = isForgeBypassedEmail(session?.email);
  const isSuperAdmin = session?.role === 'SUPER_ADMIN';

  if (!session || (!isDeveloperBypass && !isSuperAdmin)) {
    return { success: false, error: 'Unauthorized: Only Authorized Developers or Super Admins can toggle Forge Mode.' };
  }

  const result = await toggleForgeModeService({
    enabled,
    triggeredByEmail: session.email || 'developer',
    notes,
  });

  // Set/clear cookie
  const cookieStore = await cookies();
  if (enabled) {
    cookieStore.set('tse_forge_mode', 'true', {
      path: '/',
      httpOnly: false, // Accessible to client and edge
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });
  } else {
    cookieStore.delete('tse_forge_mode');
  }

  revalidatePath('/', 'layout');
  revalidatePath('/admin');
  revalidatePath('/admin/forge');
  revalidatePath('/forge-mode');

  return {
    success: true,
    isEnabled: result.isEnabled,
    updatedAt: result.updatedAt,
  };
}

