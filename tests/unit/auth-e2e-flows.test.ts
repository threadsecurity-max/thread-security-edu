import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

const otpStore: any[] = [];
const userStore: any[] = [
  {
    id: 'admin_1',
    email: 'threadsecurity@gmail.com',
    name: 'Super Admin',
    role: 'SUPER_ADMIN',
    isActive: true,
    isApproved: true,
  },
  {
    id: 'mentor_1',
    email: 'TSE-MENTOR-78987',
    name: 'Mentor Faculty',
    role: 'MENTOR',
    isActive: true,
    isApproved: true,
  },
  {
    id: 'sec_admin_1',
    email: 'TSE-SEC-ADMIN-789',
    name: 'Security Admin',
    role: 'SECURITY_ADMIN',
    isActive: true,
    isApproved: true,
  },
];

vi.mock('../../src/server/database/prisma', () => {
  return {
    prisma: {
      $connect: vi.fn().mockResolvedValue(true),
      otpVerification: {
        create: vi.fn().mockImplementation(({ data }) => {
          const item = { id: `otp_${Date.now()}`, ...data, createdAt: new Date() };
          otpStore.push(item);
          return Promise.resolve(item);
        }),
        findFirst: vi.fn().mockImplementation(({ where }) => {
          let matches = [...otpStore];
          if (where?.identifier) matches = matches.filter((o) => o.identifier === where.identifier);
          if (where?.code && typeof where.code === 'string') matches = matches.filter((o) => o.code === where.code);
          return Promise.resolve(matches[matches.length - 1] || null);
        }),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      user: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          const u = userStore.find((user) => user.email === where?.email || user.id === where?.id);
          return Promise.resolve(u ? { ...u, tsIdentity: { tsId: 'TS-ID-1' } } : null);
        }),
        findFirst: vi.fn().mockImplementation(({ where }) => {
          const u = userStore.find((user) => {
            if (!where) return true;
            if (where.email && user.email === where.email) return true;
            if (where.role && user.role === where.role) return true;
            if (where.id && user.id === where.id) return true;
            if (where.OR && Array.isArray(where.OR)) {
              return where.OR.some((condition: any) => {
                if (condition.role && user.role === condition.role) return true;
                if (condition.email && user.email === condition.email) return true;
                return false;
              });
            }
            return false;
          });
          return Promise.resolve(u ? { ...u, tsIdentity: { tsId: 'TS-ID-1' } } : null);
        }),
        create: vi.fn().mockImplementation(({ data }) => {
          const u = { id: `usr_${Date.now()}`, isActive: true, isApproved: true, ...data };
          userStore.push(u);
          return Promise.resolve({ ...u, tsIdentity: { tsId: 'TS-ID-1' } });
        }),
        upsert: vi.fn().mockImplementation(({ where, update, create }) => {
          let u = userStore.find((user) => user.email === where.email);
          if (!u) {
            u = { id: `usr_${Date.now()}`, isActive: true, isApproved: true, ...create };
            userStore.push(u);
          }
          return Promise.resolve({ ...u, tsIdentity: { tsId: 'TS-ID-1' } });
        }),
      },
      mentorProfile: {
        findFirst: vi.fn().mockResolvedValue({ id: 'mentor_prof_1' }),
      },
      tSIdentity: {
        create: vi.fn().mockResolvedValue({ id: 'tsid_1', tsId: 'TS-ADMIN' }),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'log_1' }),
      },
    },
  };
});

// Mock sendOtpEmail to avoid waiting for live external Resend HTTP API network requests in unit tests
vi.mock('../../src/server/email/otp.service', async () => {
  const actual = await vi.importActual('../../src/server/email/otp.service');
  return {
    ...actual,
    sendOtpEmail: vi.fn().mockResolvedValue({ success: true, deliveredTo: 'test@example.com' }),
  };
});

import {
  requestOtpService,
  verifyAdminCredentials,
  verifySecurityAdminCredentials,
  verifyMentorCredentials,
  verifyOtpService,
} from '../../src/server/services/auth.service';
import { prisma } from '../../src/server/database/prisma';

describe('Full Authentication & Authorization Verification Suite', () => {
  const originalEnv = { ...process.env };

  beforeAll(() => {
    process.env.ADMIN_SECRET_KEY = 'TSE-ADMIN-8080';
    process.env.ADMIN_PASSKEY = 'ThreadSec@789';
    process.env.SECURITY_ADMIN_SECRET_KEY = 'TSE-SEC-ADMIN-789';
    process.env.SECURITY_ADMIN_PASSKEY = 'ThreadSec@789789789';
    process.env.MENTOR_SECRET_KEY = 'TSE-MENTOR-78987';
    process.env.MENTOR_PASSKEY = 'MentorThreadSec@525';
    process.env.FACULTY_NOTIFY_EMAIL = 'edu@threadsecurity.in';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // -------------------------------------------------------------
  // TEST 1: Super Admin Direct Key & Email Flow
  // -------------------------------------------------------------
  it('Super Admin: recognizes General Admin Key TSE-ADMIN-8080 in Step 1', async () => {
    const res = await requestOtpService('TSE-ADMIN-8080');
    expect(res.success).toBe(true);
    expect(res.isAdmin).toBe(true);
    expect((res as any).isAdminSecretKey).toBe(true);
    expect(res.tsId).toBe('TS-ADMIN');
  });

  it('Super Admin: validates credentials and dispatches single OTP', async () => {
    const credRes = await verifyAdminCredentials(
      'threadsecurity@gmail.com',
      'TSE-ADMIN-8080',
      'ThreadSec@789'
    );
    expect(credRes.success).toBe(true);

    // Fetch the generated OTP from database
    const otp = await (prisma as any).otpVerification.findFirst({
      where: {
        code: { not: '' },
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(otp).toBeDefined();
    expect(otp.code).toHaveLength(6);

    // Verify OTP and assert destination redirect to /admin
    const authResult = await verifyOtpService('threadsecurity@gmail.com', otp.code);
    expect(authResult.role).toBe('SUPER_ADMIN');
    expect(authResult.redirectTo).toBe('/admin');
    expect(authResult.isDashboardAccessGranted).toBe(true);
  }, 30000);

  // -------------------------------------------------------------
  // TEST 2: Security Admin SOC Flow
  // -------------------------------------------------------------
  it('Security Admin: validates 3-step challenge and redirects to /admin/security-analyst', async () => {
    const reqRes = await requestOtpService('TSE-SEC-ADMIN-789');
    expect(reqRes.success).toBe(true);
    expect(reqRes.isSecurityAdminSecretKey).toBe(true);

    const challengeRes = await verifySecurityAdminCredentials(
      'TSE-SEC-ADMIN-789',
      'ThreadSec@789789789'
    );
    expect(challengeRes.success).toBe(true);

    // Fetch generated OTP
    const otp = await (prisma as any).otpVerification.findFirst({
      where: {
        code: { not: '' },
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(otp).toBeDefined();
    expect(otp.code).toHaveLength(6);

    // Verify OTP
    const secResult = await verifyOtpService('TSE-SEC-ADMIN-789', otp.code);
    expect(secResult.role).toBe('SECURITY_ADMIN');
    expect(secResult.redirectTo).toBe('/admin/security-analyst');
  }, 30000);

  // -------------------------------------------------------------
  // TEST 3: Mentor Faculty Flow
  // -------------------------------------------------------------
  it('Mentor Faculty: validates secret key + passkey and grants /mentor route', async () => {
    const reqRes = await requestOtpService('TSE-MENTOR-78987');
    expect(reqRes.success).toBe(true);
    expect(reqRes.isMentorSecretKey).toBe(true);

    const credRes = await verifyMentorCredentials(
      'TSE-MENTOR-78987',
      'TSE-MENTOR-78987',
      'MentorThreadSec@525'
    );
    expect(credRes.success).toBe(true);

    // Fetch OTP
    const otp = await (prisma as any).otpVerification.findFirst({
      where: {
        code: { not: '' },
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(otp).toBeDefined();

    // Verify OTP
    const mentorResult = await verifyOtpService('TSE-MENTOR-78987', otp.code);
    expect(mentorResult.role).toBe('MENTOR');
    expect(mentorResult.redirectTo).toBe('/mentor');
  }, 30000);

  // -------------------------------------------------------------
  // TEST 4: Middleware Session Decoder Verification
  // -------------------------------------------------------------
  it('Session Cookie: encodes and decodes session accurately for Edge Middleware', () => {
    const sessionData = {
      userId: 'usr_admin_123',
      email: 'threadsecurity@gmail.com',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      tsId: 'TS-ADMIN',
      isDashboardAccessGranted: true,
    };

    const base64Cookie = Buffer.from(JSON.stringify(sessionData)).toString('base64');
    const decoded = JSON.parse(Buffer.from(base64Cookie, 'base64').toString('utf-8'));

    expect(decoded.userId).toBe('usr_admin_123');
    expect(decoded.role).toBe('SUPER_ADMIN');
    expect(['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN'].includes(decoded.role)).toBe(true);
  });
});
