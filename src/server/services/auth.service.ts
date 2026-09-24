import { prisma } from '../database/prisma';
import { generateTSID } from '@/lib/auth/ts-id';
import { LoginInput, RegisterInput } from '@/features/auth/schemas/auth.schema';
import { logAuditEvent } from '../security/audit';
import { generate6DigitOtp, sendOtpEmail } from '../email/otp.service';
import {
  verifySecurityAdminSecretKey,
  verifySecurityAdminPasskey,
  verifyGeneralAdminSecretKey,
  verifyGeneralAdminPasskey,
  verifyMentorSecretKey,
  verifyMentorPasskey,
} from '@/lib/security/crypto-vault';
import { getClientIpAddress, analyzeIpIntelligence } from '@/lib/security/ip-guard';

/**
 * Security Lockout & Rate-Limiting Helpers
 */
export async function checkLockoutStatus(identifier: string) {
  const cleanId = identifier.trim().toLowerCase();
  try {
    const lockout = await (prisma as any).securityLockout.findUnique({
      where: { identifier: cleanId },
    });

    if (lockout && lockout.lockedUntil && new Date(lockout.lockedUntil) > new Date()) {
      const remainingMins = Math.ceil((new Date(lockout.lockedUntil).getTime() - Date.now()) / (60 * 1000));
      throw new Error(`Security Lockout Active: Too many failed access attempts. Access blocked for 15 minutes (${remainingMins} min remaining).`);
    }
    return lockout;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.startsWith('Security Lockout Active')) {
      throw err;
    }
    return null;
  }
}

export async function recordFailedAttempt(identifier: string) {
  const cleanId = identifier.trim().toLowerCase();
  let attempts = 1;
  try {
    const lockout = await (prisma as any).securityLockout.findUnique({
      where: { identifier: cleanId },
    });
    attempts = (lockout?.failedAttempts || 0) + 1;

    if (attempts >= 5) {
      const lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes ban
      await (prisma as any).securityLockout.upsert({
        where: { identifier: cleanId },
        update: { failedAttempts: attempts, lockedUntil },
        create: { identifier: cleanId, failedAttempts: attempts, lockedUntil },
      });

      await logAuditEvent({
        actorId: undefined,
        action: 'SECURITY_LOCKOUT_TRIGGERED',
        entity: 'USER',
        details: `15-minute security lockout activated for ${cleanId} after ${attempts} failed attempts.`,
      });

      throw new Error('Security Lockout Triggered: Excessive failed verification attempts. Access blocked for 15 minutes.');
    } else {
      await (prisma as any).securityLockout.upsert({
        where: { identifier: cleanId },
        update: { failedAttempts: attempts },
        create: { identifier: cleanId, failedAttempts: attempts },
      });
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.startsWith('Security Lockout')) {
      throw err;
    }
  }
}

export async function resetFailedAttempts(identifier: string) {
  const cleanId = identifier.trim().toLowerCase();
  try {
    await (prisma as any).securityLockout.updateMany({
      where: { identifier: cleanId },
      data: { failedAttempts: 0, lockedUntil: null },
    });
  } catch {
    // Ignore if record doesn't exist
  }
}

/**
 * Validates Security Admin 3-Step Challenge:
 * 1. Secret Key validation
 * 2. Passkey verification
 * 3. Dispatches 6-digit MFA OTP to Super Admin Email
 */
export async function verifySecurityAdminCredentials(secretKey: string, passkey: string) {
  const query = 'security-admin-challenge';
  await checkLockoutStatus(query);

  // 1. Verify Secret Key with Salted Base64 Hash Vault
  if (!verifySecurityAdminSecretKey(secretKey)) {
    await recordFailedAttempt(query);
    throw new Error('Invalid Security Admin Secret Key. Access denied.');
  }

  // 2. Verify Passkey with Salted Base64 Hash Vault
  if (!verifySecurityAdminPasskey(passkey)) {
    await recordFailedAttempt(query);
    throw new Error('Invalid Security Admin Passkey. Verification failed.');
  }

  // Reset counters on correct credentials
  await resetFailedAttempts(query);

  const superAdminEmail = (process.env.FACULTY_NOTIFY_EMAIL || 'threadsecurity@gmail.com').trim().toLowerCase();
  const cleanSecKey = secretKey.trim().toLowerCase();

  // Clear any existing OTPs for security admin
  await (prisma as any).otpVerification.deleteMany({
    where: {
      OR: [
        { emailOrTsId: cleanSecKey },
        { emailOrTsId: superAdminEmail },
        { emailOrTsId: 'threadsecurity@gmail.com' },
        { emailOrTsId: 'tse-sec-admin' },
      ],
    },
  });

  // 3. Dispatch EXACTLY ONE OTP to Super Admin Email
  const code = generate6DigitOtp();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes validity

  // Save OTP in Database under clean secret key identifier and email
  await (prisma as any).otpVerification.create({
    data: {
      emailOrTsId: cleanSecKey,
      code,
      expiresAt,
    },
  });

  if (superAdminEmail !== cleanSecKey) {
    await (prisma as any).otpVerification.create({
      data: {
        emailOrTsId: superAdminEmail,
        code,
        expiresAt,
      },
    });
  }

  const emailResult = await sendOtpEmail({
    toEmail: superAdminEmail,
    studentName: 'Security Operations Admin',
    code,
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`[MFA_DEV_DEBUG] Security Admin OTP Code for ${superAdminEmail}: ${code}`);
  }

  await logAuditEvent({
    actorId: undefined,
    action: 'SECURITY_ADMIN_CHALLENGE_DISPATCHED',
    entity: 'SECURITY_SOC',
    details: `Security Admin MFA OTP dispatched to ${superAdminEmail}`,
  });

  const parts = superAdminEmail.split('@');
  const maskedEmail = `${parts[0][0]}***${parts[0].slice(-1)}@${parts[1]}`;

  return {
    success: true,
    maskedEmail,
    warning: emailResult.warning,
  };
}

/**
 * Standard Admin Credentials Verification
 */
export async function verifyAdminCredentials(emailOrTsId: string, secretKey: string, passkey: string) {
  const query = emailOrTsId.trim();
  await checkLockoutStatus(query);

  // Check if this is the Security Admin backdoor
  if (verifySecurityAdminSecretKey(secretKey) && verifySecurityAdminPasskey(passkey)) {
    return verifySecurityAdminCredentials(secretKey, passkey);
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: query.toLowerCase() },
        { tsIdentity: { tsId: query } },
        { tsIdentity: { tsId: query.toUpperCase() } },
        { tsIdentity: { tsId: query.toLowerCase() } },
      ],
    },
    include: { tsIdentity: true },
  });

  if (!user || !user.isActive) {
    await recordFailedAttempt(query);
    throw new Error('No active administrator account found matching that Email Address or TS-ID.');
  }

  const isAdminRole =
    user.role === 'SUPER_ADMIN' ||
    user.role === 'ACADEMIC_ADMIN' ||
    (user.role as string) === 'SECURITY_ADMIN' ||
    user.email.toLowerCase() === 'threadsecurity@gmail.com';

  if (!isAdminRole) {
    await recordFailedAttempt(query);
    throw new Error('Unauthorized: This account does not possess Administrative privileges.');
  }

  // Validate Admin Secret Key & Passkey using Salted Crypto Vault
  if (!verifyGeneralAdminSecretKey(secretKey)) {
    await recordFailedAttempt(query);
    throw new Error('Invalid Admin Secret Key. Access denied.');
  }

  if (!verifyGeneralAdminPasskey(passkey)) {
    await recordFailedAttempt(query);
    throw new Error('Invalid Admin Passkey. Verification failed.');
  }

  await resetFailedAttempts(query);

  // Delete previous pending OTPs
  await (prisma as any).otpVerification.deleteMany({
    where: {
      OR: [
        { emailOrTsId: query.toLowerCase() },
        { emailOrTsId: user.email.toLowerCase() },
        ...(user.tsIdentity ? [{ emailOrTsId: user.tsIdentity.tsId.toLowerCase() }] : []),
      ],
    },
  });

  // Generate and dispatch single OTP with 30-minute expiration
  const code = generate6DigitOtp();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  // Save OTP record for user email and query
  await (prisma as any).otpVerification.create({
    data: {
      emailOrTsId: user.email.toLowerCase(),
      code,
      expiresAt,
    },
  });

  if (query.toLowerCase() !== user.email.toLowerCase()) {
    await (prisma as any).otpVerification.create({
      data: {
        emailOrTsId: query.toLowerCase(),
        code,
        expiresAt,
      },
    });
  }

  const emailResult = await sendOtpEmail({
    toEmail: user.email,
    studentName: user.name,
    code,
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`[MFA_DEV_DEBUG] Admin OTP Code for ${user.email}: ${code}`);
  }

  const parts = user.email.split('@');
  const maskedEmail = `${parts[0][0]}***${parts[0].slice(-1)}@${parts[1]}`;

  return {
    success: true,
    email: user.email,
    maskedEmail,
    name: user.name,
    tsId: user.tsIdentity?.tsId || 'TS-ADMIN',
    warning: emailResult.warning,
  };
}

/**
 * Mentor Faculty Credentials Verification
 */
export async function verifyMentorCredentials(
  emailOrTsId: string,
  secretKey: string,
  passkey: string
) {
  const query = emailOrTsId.trim();
  await checkLockoutStatus(query);

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: query.toLowerCase() },
        { tsIdentity: { tsId: query } },
        { tsIdentity: { tsId: query.toUpperCase() } },
        { tsIdentity: { tsId: query.toLowerCase() } },
      ],
    },
    include: { tsIdentity: true },
  });

  if (!user && verifyMentorSecretKey(query)) {
    user = await prisma.user.findFirst({
      where: { role: 'MENTOR' },
      include: { tsIdentity: true },
    });
  }

  if (!user || !user.isActive) {
    await recordFailedAttempt(query);
    throw new Error('No active Mentor account found matching that Email Address or TS-ID.');
  }

  const isMentorRole =
    user.role === 'MENTOR' ||
    user.role === 'SUPER_ADMIN' ||
    user.role === 'ACADEMIC_ADMIN';

  if (!isMentorRole) {
    await recordFailedAttempt(query);
    throw new Error('Unauthorized: This account does not possess Mentor Faculty privileges.');
  }

  // Validate Mentor Secret Key against environment
  if (!verifyMentorSecretKey(secretKey)) {
    await recordFailedAttempt(query);
    throw new Error('Invalid Mentor Faculty Secret Key.');
  }

  // Validate Mentor Passkey against environment
  if (!verifyMentorPasskey(passkey)) {
    await recordFailedAttempt(query);
    throw new Error('Invalid Mentor Faculty Passkey.');
  }

  await resetFailedAttempts(query);

  // Delete previous pending OTPs
  await (prisma as any).otpVerification.deleteMany({
    where: {
      OR: [
        { emailOrTsId: query.toLowerCase() },
        { emailOrTsId: user.email.toLowerCase() },
        ...(user.tsIdentity ? [{ emailOrTsId: user.tsIdentity.tsId.toLowerCase() }] : []),
      ],
    },
  });

  // Generate and dispatch single OTP with 30-minute expiration
  const code = generate6DigitOtp();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  await (prisma as any).otpVerification.create({
    data: {
      emailOrTsId: user.email.toLowerCase(),
      code,
      expiresAt,
    },
  });

  if (query.toLowerCase() !== user.email.toLowerCase()) {
    await (prisma as any).otpVerification.create({
      data: {
        emailOrTsId: query.toLowerCase(),
        code,
        expiresAt,
      },
    });
  }

  const emailResult = await sendOtpEmail({
    toEmail: user.email,
    studentName: user.name,
    code,
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`[MFA_DEV_DEBUG] Mentor OTP Code for ${user.email}: ${code}`);
  }

  const parts = user.email.split('@');
  const maskedEmail = `${parts[0][0]}***${parts[0].slice(-1)}@${parts[1]}`;

  await logAuditEvent({
    actorId: user.id,
    action: 'MENTOR_CREDENTIALS_VERIFIED',
    entity: 'USER',
    entityId: user.id,
    details: `Mentor Secret Key and Passkey successfully validated for ${user.email}`,
  });

  return {
    success: true,
    email: user.email,
    maskedEmail,
    name: user.name,
    tsId: user.tsIdentity?.tsId || 'TSE-MENTOR',
    warning: emailResult.warning,
  };
}

/**
 * Request MFA OTP for any User or Security Key
 */
export async function requestOtpService(emailOrTsId: string) {
  const query = emailOrTsId.trim();
  await checkLockoutStatus(query);

  // Check if identifier is the Security Admin Secret Key directly
  if (verifySecurityAdminSecretKey(query)) {
    return {
      success: true,
      isSecurityAdminSecretKey: true,
      isAdmin: true,
      isMentor: false,
      email: process.env.FACULTY_NOTIFY_EMAIL || 'threadsecurity@gmail.com',
      maskedEmail: 't***y@gmail.com',
      tsId: 'TSE-SEC-ADMIN',
    };
  }

  // Check if identifier is the Mentor Faculty Secret Key directly
  if (verifyMentorSecretKey(query)) {
    const mentorUser = await prisma.user.findFirst({
      where: { role: 'MENTOR' },
      include: { tsIdentity: true },
    });
    const mentorEmail = mentorUser?.email || 'threadsecuritymentor@gmail.com';
    const parts = mentorEmail.split('@');
    const maskedEmail = `${parts[0][0]}***${parts[0].slice(-1)}@${parts[1]}`;
    return {
      success: true,
      isMentorSecretKey: true,
      isMentor: true,
      isAdmin: false,
      email: mentorEmail,
      maskedEmail,
      tsId: 'TSE-MENTOR',
    };
  }

  // Find user by email OR TS-ID
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: query.toLowerCase() },
        { tsIdentity: { tsId: query } },
        { tsIdentity: { tsId: query.toUpperCase() } },
        { tsIdentity: { tsId: query.toLowerCase() } },
      ],
    },
    include: { tsIdentity: true },
  });

  if (!user || !user.isActive) {
    throw new Error('No active account found matching that Email Address or TS-ID.');
  }

  const isAdmin =
    user.role === 'SUPER_ADMIN' ||
    user.role === 'ACADEMIC_ADMIN' ||
    (user.role as string) === 'SECURITY_ADMIN' ||
    user.email.toLowerCase() === 'threadsecurity@gmail.com';

  const isMentor = user.role === 'MENTOR';

  const parts = user.email.split('@');
  const maskedEmail = `${parts[0][0]}***${parts[0].slice(-1)}@${parts[1]}`;

  // IF ADMIN OR MENTOR: Return role challenge requirement WITHOUT sending OTP yet.
  // The single OTP will be dispatched in Step 2 after passkey verification.
  if (isAdmin || isMentor) {
    return {
      success: true,
      isAdmin,
      isMentor,
      maskedEmail,
      email: user.email,
      tsId: user.tsIdentity?.tsId || (isAdmin ? 'TS-ADMIN' : 'TSE-MENTOR'),
    };
  }

  // STUDENT: Generate & send 1 OTP immediately for Student sign-in
  await (prisma as any).otpVerification.deleteMany({
    where: {
      OR: [
        { emailOrTsId: query.toLowerCase() },
        { emailOrTsId: user.email.toLowerCase() },
        ...(user.tsIdentity ? [{ emailOrTsId: user.tsIdentity.tsId.toLowerCase() }] : []),
      ],
    },
  });

  const code = generate6DigitOtp();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  await (prisma as any).otpVerification.create({
    data: {
      emailOrTsId: user.email.toLowerCase(),
      code,
      expiresAt,
    },
  });

  if (query.toLowerCase() !== user.email.toLowerCase()) {
    await (prisma as any).otpVerification.create({
      data: {
        emailOrTsId: query.toLowerCase(),
        code,
        expiresAt,
      },
    });
  }

  const emailResult = await sendOtpEmail({
    toEmail: user.email,
    studentName: user.name,
    code,
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`[MFA_DEV_DEBUG] Student OTP Code for ${user.email} (${user.tsIdentity?.tsId || 'N/A'}): ${code}`);
  }

  return {
    success: true,
    isAdmin: false,
    isMentor: false,
    maskedEmail,
    email: user.email,
    tsId: user.tsIdentity?.tsId || 'TS-STUDENT',
    warning: emailResult.warning,
  };
}

/**
 * Verify MFA OTP and Grant Session Cookie Data
 */
export async function verifyOtpService(emailOrTsId: string, code: string) {
  const query = emailOrTsId.trim();
  const cleanCode = code.trim();
  await checkLockoutStatus(query);

  const superAdminEmail = (process.env.FACULTY_NOTIFY_EMAIL || 'threadsecurity@gmail.com').trim().toLowerCase();
  const isSecAdmin =
    verifySecurityAdminSecretKey(query) ||
    query.toLowerCase() === 'tse-sec-admin' ||
    query.toLowerCase() === 'tse-sec-admin-789';

  // Find matching user (if exists) so we can check across user.email, user.tsId, or query
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: query.toLowerCase() },
        { tsIdentity: { tsId: query } },
        { tsIdentity: { tsId: query.toUpperCase() } },
        { tsIdentity: { tsId: query.toLowerCase() } },
      ],
    },
    include: { tsIdentity: true },
  });

  const identifiersToCheck = [
    query.toLowerCase(),
    query.toUpperCase(),
    query,
  ];

  if (user?.email) identifiersToCheck.push(user.email.toLowerCase());
  if (user?.tsIdentity?.tsId) {
    identifiersToCheck.push(user.tsIdentity.tsId.toLowerCase());
    identifiersToCheck.push(user.tsIdentity.tsId);
  }
  if (isSecAdmin || query.toLowerCase() === superAdminEmail || query.toLowerCase() === 'threadsecurity@gmail.com') {
    identifiersToCheck.push(superAdminEmail);
    identifiersToCheck.push('threadsecurity@gmail.com');
    identifiersToCheck.push('tse-sec-admin');
    identifiersToCheck.push('tse-sec-admin-789');
  }

  const uniqueIdentifiers = Array.from(new Set(identifiersToCheck));

  const otpRecord = await (prisma as any).otpVerification.findFirst({
    where: {
      emailOrTsId: { in: uniqueIdentifiers },
      code: cleanCode,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRecord) {
    await recordFailedAttempt(query);
    throw new Error('Invalid or expired 6-digit MFA verification code.');
  }

  // Clear failed attempt counters
  await resetFailedAttempts(query);

  // Delete matching OTP and stale OTPs for this user / session
  await (prisma as any).otpVerification.deleteMany({
    where: {
      OR: [
        { id: otpRecord.id },
        { emailOrTsId: { in: uniqueIdentifiers } },
      ],
    },
  });

  // Handle Security Admin user provisioning/redirection
  if (isSecAdmin || (user && user.role === 'SECURITY_ADMIN')) {
    let adminUser: any = user || await prisma.user.findFirst({
      where: { email: superAdminEmail },
      include: { tsIdentity: true },
    });

    if (!adminUser) {
      adminUser = await (prisma.user as any).create({
        data: {
          email: superAdminEmail,
          name: 'Security Analyst Admin',
          passwordHash: 'MFA_OTP_ONLY',
          role: 'SECURITY_ADMIN',
          isDashboardAccessGranted: true,
        },
        include: { tsIdentity: true },
      });
      await prisma.tSIdentity.create({
        data: {
          tsId: 'TSE-SEC-ADMIN',
          userId: adminUser.id,
        },
      });
    }

    const clientIp = await getClientIpAddress();
    const ipIntel = analyzeIpIntelligence(clientIp);

    await logAuditEvent({
      actorId: adminUser?.id,
      action: 'SECURITY_ADMIN_SOC_LOGIN_SUCCESS',
      entity: 'SECURITY_SOC',
      entityId: adminUser?.id,
      ipAddress: clientIp,
      details: JSON.stringify({
        msg: 'Security Analyst authenticated via 3-step verification.',
        ip: clientIp,
        origin: `${ipIntel.city}, ${ipIntel.country}`,
        isp: ipIntel.isp,
        isVpn: ipIntel.isVpnOrProxy,
        riskScore: ipIntel.riskScore,
      }),
    });

    return {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: 'SECURITY_ADMIN',
      tsId: 'TSE-SEC-ADMIN',
      isDashboardAccessGranted: true,
      redirectTo: '/admin/security-analyst',
    };
  }

  if (!user || !user.isActive) {
    throw new Error('Account authentication failed.');
  }

  // Admins and Mentors are always granted dashboard access
  const isGranted =
    user.role === 'SUPER_ADMIN' ||
    user.role === 'ACADEMIC_ADMIN' ||
    user.role === 'SECURITY_ADMIN' ||
    user.role === 'MENTOR' ||
    Boolean((user as any).isDashboardAccessGranted);

  const userIp = await getClientIpAddress();
  const userIpIntel = analyzeIpIntelligence(userIp);

  // Audit log MFA login with Geolocation & Anti-VPN analysis
  await logAuditEvent({
    actorId: user.id,
    action: 'MFA_OTP_LOGIN_SUCCESS',
    entity: 'USER',
    entityId: user.id,
    ipAddress: userIp,
    details: JSON.stringify({
      email: user.email,
      tsId: user.tsIdentity?.tsId,
      role: user.role,
      isApproved: isGranted,
      origin: `${userIpIntel.city}, ${userIpIntel.country}`,
      isVpn: userIpIntel.isVpnOrProxy,
      riskScore: userIpIntel.riskScore,
    }),
  });

  // Determine redirection path based on role and dashboard access grant
  let redirectTo = '/student';
  if (user.role === 'SECURITY_ADMIN') {
    redirectTo = '/admin/security-analyst';
  } else if (user.role === 'SUPER_ADMIN' || user.role === 'ACADEMIC_ADMIN') {
    redirectTo = '/admin';
  } else if (user.role === 'MENTOR') {
    redirectTo = '/mentor';
  } else if (user.role === 'STUDENT' || (user.role as string) === 'GUEST') {
    if (!isGranted) {
      redirectTo = '/?notice=clearance-pending';
    } else {
      redirectTo = '/student';
    }
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tsId: user.tsIdentity?.tsId || 'TS-STUDENT',
    isDashboardAccessGranted: isGranted,
    isMentorVerified: user.role === 'MENTOR',
    redirectTo,
  };
}

/**
 * Register a new Student or Guest account
 * Starts with isDashboardAccessGranted: false until Admin approves.
 */
export async function registerStudent(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existingUser) {
    throw new Error('An account with this email address already exists.');
  }

  const tsId = generateTSID();

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await (tx.user as any).create({
      data: {
        email: input.email.toLowerCase(),
        name: input.name,
        passwordHash: 'MFA_OTP_ONLY',
        role: 'STUDENT',
        isDashboardAccessGranted: false, // Requires Admin Grant
      },
    });

    await tx.tSIdentity.create({
      data: {
        tsId: tsId,
        userId: newUser.id,
      },
    });

    await tx.studentProfile.create({
      data: {
        userId: newUser.id,
        careerGoal: input.careerGoal || 'Cybersecurity Professional',
      },
    });

    return newUser;
  });

  await logAuditEvent({
    actorId: user.id,
    action: 'STUDENT_REGISTERED',
    entity: 'USER',
    entityId: user.id,
    details: { email: user.email, tsId, status: 'PENDING_ADMIN_APPROVAL' },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tsId,
    isDashboardAccessGranted: false,
  };
}
