/**
 * Universal Role & Hierarchy Tier Engine
 * Pure TypeScript module with ZERO server dependencies (no next/headers).
 * Safe to import in both Client Components ('use client') and Server Components.
 */

export const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'SECURITY_ADMIN',
  'ACADEMIC_ADMIN',
  'ADMIN',
  'STAFF_EXECUTIVE',
  'STAFF_JUNIOR',
];

export enum StaffHierarchyTier {
  TIER_1_SUPER_ADMIN = 'TIER_1_SUPER_ADMIN',
  TIER_2_OFFICER = 'TIER_2_OFFICER',
  TIER_3_JUNIOR = 'TIER_3_JUNIOR',
}

export function getUserHierarchyTier(role?: string | null): StaffHierarchyTier {
  if (!role) return StaffHierarchyTier.TIER_3_JUNIOR;
  const upper = role.toUpperCase();
  if (upper === 'SUPER_ADMIN') {
    return StaffHierarchyTier.TIER_1_SUPER_ADMIN;
  }
  if (['SECURITY_ADMIN', 'MENTOR', 'STAFF_EXECUTIVE', 'ACADEMIC_ADMIN', 'ADMIN'].includes(upper)) {
    return StaffHierarchyTier.TIER_2_OFFICER;
  }
  if (upper === 'STAFF_JUNIOR') {
    return StaffHierarchyTier.TIER_3_JUNIOR;
  }
  return StaffHierarchyTier.TIER_3_JUNIOR;
}

export function canAssignTask(assignerRole: string, targetRole: string): boolean {
  const assignerTier = getUserHierarchyTier(assignerRole);
  const targetTier = getUserHierarchyTier(targetRole);

  // Super Admin (Tier 1) can assign to anyone (Tier 2 and Tier 3)
  if (assignerTier === StaffHierarchyTier.TIER_1_SUPER_ADMIN) {
    return true;
  }

  // Tier 2 (Mentor, Executive, Security Admin) can assign tasks to Tier 3 (Junior Staff)
  if (assignerTier === StaffHierarchyTier.TIER_2_OFFICER && targetTier === StaffHierarchyTier.TIER_3_JUNIOR) {
    return true;
  }

  return false;
}

export function getRoleDisplayName(role?: string | null): string {
  if (!role) return 'User';
  switch (role.toUpperCase()) {
    case 'SUPER_ADMIN':
      return 'Super Administrator (Tier 1)';
    case 'SECURITY_ADMIN':
      return 'Security Admin (Tier 2)';
    case 'MENTOR':
      return 'Faculty Mentor (Tier 2)';
    case 'STAFF_EXECUTIVE':
    case 'ACADEMIC_ADMIN':
      return 'Staff Executive (Tier 2)';
    case 'STAFF_JUNIOR':
      return 'Junior Staff (Tier 3)';
    case 'STUDENT':
      return 'Student';
    default:
      return role;
  }
}

export function isAdminRole(role?: string | null): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role.toUpperCase());
}

