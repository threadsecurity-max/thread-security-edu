import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '../src/lib/security/rate-limiter';
import { sanitizeHtmlContent, escapeHtml } from '../src/lib/security/html-sanitizer';
import { LeadCaptureSchema, MfaVerifySchema } from '../src/lib/security/validation.schemas';

describe('TSE LMS Production Security & Hardening Suite', () => {
  describe('Sliding Window Rate Limiter', () => {
    it('allows requests up to max limit and blocks 6th request', () => {
      const testIp = '192.168.1.100';
      const opts = { windowMs: 60000, max: 5 };

      // 5 requests allowed
      for (let i = 0; i < 5; i++) {
        const res = checkRateLimit(testIp, opts);
        expect(res.success).toBe(true);
      }

      // 6th request blocked
      const blockedRes = checkRateLimit(testIp, opts);
      expect(blockedRes.success).toBe(false);
      expect(blockedRes.remaining).toBe(0);
    });
  });

  describe('Server-Side HTML Sanitizer (Stored XSS Protection)', () => {
    it('strips dangerous script tags and event handlers', () => {
      const maliciousHtml = '<p>Hello <script>alert("xss")</script><img src="x" onerror="alert(1)"> world</p>';
      const sanitized = sanitizeHtmlContent(maliciousHtml);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('onerror=');
      expect(sanitized).toContain('<p>Hello <img src="x"> world</p>');
    });

    it('neutralizes dangerous javascript: protocol URLs', () => {
      const maliciousLink = '<a href="javascript:doMaliciousThing()">Click me</a>';
      const sanitized = sanitizeHtmlContent(maliciousLink);

      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).toContain('href="#"');
    });

    it('escapes plain text characters cleanly', () => {
      const plainText = '<script>alert(1)</script>';
      const escaped = escapeHtml(plainText);
      expect(escaped).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });
  });

  describe('Validation Schemas & Spam Honeypot Traps', () => {
    it('rejects bot submissions when honeypot field is populated', () => {
      const payload = {
        name: 'John Doe',
        email: 'john@example.com',
        websiteHpField: 'http://spam-bot-link.com',
      };

      const result = LeadCaptureSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.websiteHpField).toBeDefined();
      }
    });

    it('validates numerical 6-digit MFA OTP codes strictly', () => {
      const validPayload = { identifier: 'user@example.com', code: '123456' };
      const invalidLength = { identifier: 'user@example.com', code: '12345' };
      const alphaPayload = { identifier: 'user@example.com', code: '12345A' };

      expect(MfaVerifySchema.safeParse(validPayload).success).toBe(true);
      expect(MfaVerifySchema.safeParse(invalidLength).success).toBe(false);
      expect(MfaVerifySchema.safeParse(alphaPayload).success).toBe(false);
    });
  });
});
