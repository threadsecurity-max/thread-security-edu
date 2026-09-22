import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  hashWithSalt,
  verifySaltedHash,
  verifySecurityAdminSecretKey,
  verifySecurityAdminPasskey,
  verifyGeneralAdminSecretKey,
  verifyGeneralAdminPasskey,
} from '../../src/lib/security/crypto-vault';
import { generateTSID, isValidTSID, generateDomainTSID } from '../../src/lib/auth/ts-id';

describe('Cryptographic Security Vault & Salted Base64 Hashes', () => {
  const originalEnv = { ...process.env };

  beforeAll(() => {
    process.env.SECURITY_ADMIN_SECRET_KEY = 'MOCK-SEC-KEY-789';
    process.env.SECURITY_ADMIN_PASSKEY = 'MockSecPass@789';
    process.env.ADMIN_SECRET_KEY = 'MOCK-ADMIN-KEY-8080';
    process.env.ADMIN_PASSKEY = 'MockAdminPass@789';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('correctly hashes secret with salt and encodes in Base64', () => {
    const secret = 'MyTestSecretKey123';
    const result = hashWithSalt(secret);

    expect(result.salt).toBeDefined();
    expect(result.hash).toBeDefined();
    expect(result.formatted).toContain('$');

    // Verify constant-time comparison
    const isValid = verifySaltedHash(secret, result.formatted);
    expect(isValid).toBe(true);

    const isInvalid = verifySaltedHash('WrongSecret', result.formatted);
    expect(isInvalid).toBe(false);
  });

  it('validates Security Admin Secret Key dynamically from environment', () => {
    expect(verifySecurityAdminSecretKey('MOCK-SEC-KEY-789')).toBe(true);
    expect(verifySecurityAdminSecretKey('MOCK-SEC-KEY-789 ')).toBe(true);
    expect(verifySecurityAdminSecretKey('INVALID-KEY-123')).toBe(false);
  });

  it('validates Security Admin Passkey dynamically from environment', () => {
    expect(verifySecurityAdminPasskey('MockSecPass@789')).toBe(true);
    expect(verifySecurityAdminPasskey('MockSecPass@789 ')).toBe(true);
    expect(verifySecurityAdminPasskey('WrongPasskey')).toBe(false);
  });

  it('validates General Admin Credentials dynamically from environment', () => {
    expect(verifyGeneralAdminSecretKey('MOCK-ADMIN-KEY-8080')).toBe(true);
    expect(verifyGeneralAdminPasskey('MockAdminPass@789')).toBe(true);
  });

  it('fails closed when required environment variables are unset', () => {
    const saved = process.env.ADMIN_PASSKEY;
    try {
      delete process.env.ADMIN_PASSKEY;
      expect(verifyGeneralAdminPasskey('MockAdminPass@789')).toBe(false);
      expect(verifyGeneralAdminPasskey('RandomDummyPass@123')).toBe(false);
    } finally {
      process.env.ADMIN_PASSKEY = saved;
    }
  });
});

describe('Student TS-ID & Primary Key Attachment', () => {
  it('generates unique valid TS-ID with proper prefix format', () => {
    const tsId = generateTSID();
    expect(tsId).toMatch(/^TSE-2026-[A-Z0-9]{6}$/);
    expect(isValidTSID(tsId)).toBe(true);
  });

  it('generates specialized Cyber & AI Track TS-IDs', () => {
    const cyberId = generateDomainTSID('CYBER', 126);
    expect(cyberId).toBe('TS-C126');
    expect(isValidTSID(cyberId)).toBe(true);

    const aiId = generateDomainTSID('AI', 104);
    expect(aiId).toBe('TS-A104');
    expect(isValidTSID(aiId)).toBe(true);
  });
});
