import { z } from 'zod';

export const LeadCaptureSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(150),
  phone: z.string().max(20).optional().nullable(),
  courseInterest: z.string().max(100).optional().nullable(),
  careerGoal: z.string().max(200).optional().nullable(),
  utmSource: z.string().max(50).optional().nullable(),
  utmMedium: z.string().max(50).optional().nullable(),
  utmCampaign: z.string().max(50).optional().nullable(),
  websiteHpField: z.string().max(0, 'Bot submission rejected').optional(), // Honeypot trap field
});

export const AttendanceMarkSchema = z.object({
  batchId: z.string().min(1, 'Batch ID is required'),
  sessionId: z.string().min(1, 'Session ID is required'),
  records: z.array(
    z.object({
      studentId: z.string().min(1, 'Student ID is required'),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
      remarks: z.string().max(250).optional().nullable(),
    })
  ).min(1, 'At least one student record is required'),
});

export const MfaVerifySchema = z.object({
  identifier: z.string().min(3, 'Identifier is required').max(150),
  code: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
});

export const FeatureFlagSchema = z.object({
  key: z.string().min(3).max(50).regex(/^[a-z0-9_]+$/, 'Key must be lowercase alphanumeric with underscores'),
  description: z.string().max(250).optional(),
  isEnabled: z.boolean(),
  targetRoles: z.array(z.string()),
  percentage: z.number().min(0).max(100),
});
