import { UserSession } from '@/lib/auth/session';

/**
 * Validates that the active session owns the requested resource or has administrative privileges.
 * Prevents Insecure Direct Object Reference (IDOR) attacks across student and faculty endpoints.
 */
export function assertUserOwnership(
  session: UserSession | null,
  resourceUserId: string,
  allowedAdminRoles: string[] = ['SUPER_ADMIN', 'ACADEMIC_ADMIN']
): void {
  if (!session) {
    throw new Error('UNAUTHORIZED: Authentication session is required.');
  }

  // Allow designated administrative roles global inspection access
  if (allowedAdminRoles.includes(session.role)) {
    return;
  }

  // Enforce strict tenant ownership matching
  if (session.userId !== resourceUserId) {
    throw new Error('FORBIDDEN: You do not have permission to access or modify this resource.');
  }
}

/**
 * Sanitizes input updates for user profiles, rejecting unauthorized privilege escalations.
 */
export function sanitizeProfileUpdatePayload<T extends Record<string, any>>(payload: T): Partial<T> {
  const sanitized = { ...payload };

  // Explicitly delete sensitive privilege attributes
  delete (sanitized as any).role;
  delete (sanitized as any).isDashboardAccessGranted;
  delete (sanitized as any).dashboardAccessGrantedAt;
  delete (sanitized as any).approvedBy;
  delete (sanitized as any).tsId;
  delete (sanitized as any).passwordHash;
  delete (sanitized as any).id;
  delete (sanitized as any).email;

  return sanitized;
}
