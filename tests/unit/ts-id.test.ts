import { describe, it, expect } from 'vitest';
import { generateTSID, isValidTSID } from '../../src/lib/auth/ts-id';

describe('TS-ID Generation & Validation', () => {
  it('should generate valid TS-ID with correct format TSE-YYYY-XXXXXX', () => {
    const tsId = generateTSID(2026);
    expect(tsId).toMatch(/^TSE-2026-[2-9A-HJ-NP-Z]{6}$/);
    expect(isValidTSID(tsId)).toBe(true);
  });

  it('should generate unique collision-resistant IDs', () => {
    const set = new Set<string>();
    for (let i = 0; i < 100; i++) {
      set.add(generateTSID(2026));
    }
    expect(set.size).toBe(100);
  });

  it('should reject invalid TS-ID formats', () => {
    expect(isValidTSID('INVALID-TS-ID')).toBe(false);
    expect(isValidTSID('TSE-2026-12')).toBe(false);
    expect(isValidTSID('TSE-2026-0O1I23')).toBe(false); // Excluded ambiguous chars 0, O, 1, I
  });
});
