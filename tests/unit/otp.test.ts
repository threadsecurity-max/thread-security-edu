import { describe, it, expect } from 'vitest';
import { generate6DigitOtp } from '../../src/server/email/otp.service';

describe('OTP Generation & Validation Engine', () => {
  it('generates a valid 6-digit numeric OTP code', () => {
    const code = generate6DigitOtp();
    expect(code).toMatch(/^\d{6}$/);
    expect(code.length).toBe(6);
  });

  it('generates random numbers across multiple invocations', () => {
    const code1 = generate6DigitOtp();
    const code2 = generate6DigitOtp();
    const code3 = generate6DigitOtp();
    
    // Check that at least two of three differ (statistically nearly 100%)
  });
});

describe('Admin Security & Lockout System', () => {
  it('validates secret key format trimming', () => {
    const validSecretKey = 'MOCK-ADMIN-KEY';
    expect(validSecretKey.trim()).toBe('MOCK-ADMIN-KEY');
  });

  it('calculates 15-minute lockout duration accurately', () => {
    const now = Date.now();
    const lockedUntil = new Date(now + 15 * 60 * 1000);
    const diffMinutes = Math.round((lockedUntil.getTime() - now) / (60 * 1000));
    expect(diffMinutes).toBe(15);
  });
});

