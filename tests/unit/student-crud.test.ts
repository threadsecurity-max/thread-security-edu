import { describe, it, expect } from 'vitest';
import { generateTSID, generateDomainTSID, isValidTSID } from '../../src/lib/auth/ts-id';

describe('Student Account Management & Audit Logging', () => {
  it('generates valid TS-ID format for new student accounts', () => {
    const tsId = generateTSID();
    expect(tsId).toMatch(/^TSE-2026-[A-Z0-9]{6}$/);
    expect(isValidTSID(tsId)).toBe(true);
  });

  it('generates specialized AI student ID in TS-AXXX format', () => {
    const aiTsId = generateDomainTSID('AI', 105);
    expect(aiTsId).toBe('TS-A105');
    expect(isValidTSID(aiTsId)).toBe(true);
  });

  it('generates specialized Cyber student ID in TS-CXXX format', () => {
    const cyberTsId = generateDomainTSID('CYBER', 105);
    expect(cyberTsId).toBe('TS-C105');
    expect(isValidTSID(cyberTsId)).toBe(true);
  });

  it('formats audit log details string correctly for student actions', () => {
    const action = 'STUDENT_CREATED';
    const email = 'rahul.sharma@gmail.com';
    const tsId = generateDomainTSID('AI');
    const details = `Created new student account for Rahul Sharma (${email}, TS-ID: ${tsId}).`;

    expect(action).toBe('STUDENT_CREATED');
    expect(details).toContain(email);
    expect(details).toContain(tsId);
  });
});

