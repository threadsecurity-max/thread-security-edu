import { randomBytes, randomInt } from 'crypto';

export type StudentTrack = 'AI' | 'CYBER' | 'GENERAL';

/**
 * Generates an immutable, collision-resistant Thread Security ID (TS-ID).
 * Format: TSE-YYYY-XXXXXX (e.g. TSE-2026-8F4K29)
 */
export function generateTSID(year: number = new Date().getFullYear()): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Base32 excluding ambiguous chars (0, O, 1, I)
  const bytes = randomBytes(6);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `TSE-${year}-${code}`;
}

/**
 * Generates a domain-specific TS-ID for specialized learning tracks:
 * - AI Track: TS-AXXX (e.g. TS-A104)
 * - Cyber Track: TS-CXXX (e.g. TS-C104)
 */
export function generateDomainTSID(track: StudentTrack = 'CYBER', numberOverride?: number): string {
  const num = numberOverride !== undefined ? numberOverride : randomInt(101, 999);
  if (track === 'AI') {
    return `TS-A${num}`;
  } else if (track === 'CYBER') {
    return `TS-C${num}`;
  }
  return generateTSID();
}

export function isValidTSID(tsId: string): boolean {
  if (!tsId) return false;
  const regex = /^(TSE-\d{4}-[2-9A-HJ-NP-Z]{6}|TS-A\d{3,4}|TS-C\d{3,4}|TSE-AI-\d{3,4}|TSE-C-\d{3,4})$/;
  return regex.test(tsId);
}

