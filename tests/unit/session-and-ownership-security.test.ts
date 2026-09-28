import { describe, it, expect } from 'vitest';
import { signSessionToken, verifySessionToken, type UserSession } from '../../src/lib/auth/session';
import { checkIpRateLimit } from '../../src/lib/security/ip-guard';
import { assertUserOwnership, sanitizeProfileUpdatePayload } from '../../src/lib/security/ownership-guard';

describe('HMAC-SHA256 Session Vault & Tamper Resistance', () => {
  const validStudent: UserSession = {
    userId: 'usr_student_123',
    email: 'student@example.com',
    name: 'Alice Student',
    role: 'STUDENT',
    tsId: 'TSE-2026-123456',
    isDashboardAccessGranted: true,
  };

  it('signs and verifies valid session tokens', () => {
    const token = signSessionToken(validStudent);
    expect(token).toContain('.');

    const verified = verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(validStudent.userId);
    expect(verified?.role).toBe('STUDENT');
  });

  it('rejects tampered session tokens (e.g., privilege escalation attempt)', () => {
    const token = signSessionToken(validStudent);
    const [payloadBase64, signature] = token.split('.');

    // Attacker modifies payload to become SUPER_ADMIN
    const decodedPayload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8'));
    decodedPayload.role = 'SUPER_ADMIN';
    const forgedPayloadBase64 = Buffer.from(JSON.stringify(decodedPayload), 'utf-8').toString('base64url');

    // Attacker sends forged payload with original signature
    const forgedToken = `${forgedPayloadBase64}.${signature}`;

    const result = verifySessionToken(forgedToken);
    expect(result).toBeNull();
  });

  it('rejects malformed and random strings', () => {
    expect(verifySessionToken('')).toBeNull();
    expect(verifySessionToken('invalid.token.structure')).toBeNull();
    expect(verifySessionToken('random-garbage')).toBeNull();
  });
});

describe('Sliding-Window IP Rate Limiter', () => {
  it('allows requests within threshold and blocks beyond threshold', () => {
    const testIp = '198.51.100.42';

    // Send 3 requests (max limit 3)
    const r1 = checkIpRateLimit(testIp, 3, 60);
    const r2 = checkIpRateLimit(testIp, 3, 60);
    const r3 = checkIpRateLimit(testIp, 3, 60);

    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(true);

    // 4th request must be blocked
    const r4 = checkIpRateLimit(testIp, 3, 60);
    expect(r4.allowed).toBe(false);
    expect(r4.retryAfterSeconds).toBeGreaterThan(0);
  });
});

describe('IDOR Ownership Guard & Payload Sanitization', () => {
  const studentSession: UserSession = {
    userId: 'usr_student_123',
    email: 'student@example.com',
    name: 'Alice',
    role: 'STUDENT',
    tsId: 'TSE-2026-123456',
  };

  const adminSession: UserSession = {
    userId: 'usr_admin_999',
    email: 'admin@example.com',
    name: 'Admin',
    role: 'SUPER_ADMIN',
    tsId: 'TSE-ADMIN-8080',
  };

  it('allows user accessing their own resource', () => {
    expect(() => assertUserOwnership(studentSession, 'usr_student_123')).not.toThrow();
  });

  it('blocks student attempting to access another student resource (IDOR)', () => {
    expect(() => assertUserOwnership(studentSession, 'usr_student_999')).toThrow('FORBIDDEN');
  });

  it('allows super admin to inspect any user resource', () => {
    expect(() => assertUserOwnership(adminSession, 'usr_student_123')).not.toThrow();
  });

  it('strips administrative fields from user profile update payloads', () => {
    const maliciousPayload = {
      name: 'Alice Updated',
      bio: 'Cybersecurity enthusiast',
      role: 'SUPER_ADMIN',
      isDashboardAccessGranted: true,
      tsId: 'TSE-ADMIN-8080',
    };

    const clean = sanitizeProfileUpdatePayload(maliciousPayload);
    expect(clean.name).toBe('Alice Updated');
    expect(clean.bio).toBe('Cybersecurity enthusiast');
    expect((clean as any).role).toBeUndefined();
    expect((clean as any).isDashboardAccessGranted).toBeUndefined();
    expect((clean as any).tsId).toBeUndefined();
  });
});
