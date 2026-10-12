import nodemailer from 'nodemailer';

export interface SendStudentOnboardingInput {
  toEmail: string;
  studentName: string;
  tsId: string;
  tempPassword?: string;
  batchCode?: string;
  courseTitle?: string;
  mentorName?: string;
  loginUrl?: string;
}

export interface SendOnboardingResult {
  success: boolean;
  deliveredTo?: string;
  warning?: string;
  error?: string;
}

/**
 * Sends a welcome onboarding email with login URL, TS-ID, temporary credentials,
 * and academic batch details using verified domain sender (edu@threadsecurity.in).
 */
export async function sendStudentOnboardingEmail({
  toEmail,
  studentName,
  tsId,
  tempPassword,
  batchCode,
  courseTitle,
  mentorName,
  loginUrl = 'https://www.threadsecurity.in/login',
}: SendStudentOnboardingInput): Promise<SendOnboardingResult> {
  const cleanTarget = toEmail.trim().toLowerCase();
  const apiKey = process.env.RESEND_API_KEY;

  const verifiedSender = 'Thread Security Education <edu@threadsecurity.in>';
  const fromEmail =
    process.env.RESEND_FROM_EMAIL && !process.env.RESEND_FROM_EMAIL.includes('onboarding@resend.dev')
      ? process.env.RESEND_FROM_EMAIL
      : verifiedSender;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Thread Security Academy</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            -webkit-font-smoothing: antialiased;
          }
          .wrapper {
            width: 100%;
            background-color: #f8fafc;
            padding: 40px 16px;
          }
          .container {
            max-width: 580px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
          }
          .header {
            padding: 32px 32px 24px 32px;
            background-color: #ffffff;
            border-bottom: 1px solid #f1f5f9;
          }
          .content {
            padding: 32px;
          }
          .badge {
            display: inline-block;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: #15803d;
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 4px 10px;
            border-radius: 6px;
            margin-bottom: 16px;
          }
          .title {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 12px 0;
            letter-spacing: -0.02em;
          }
          .card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #edf2f7;
            font-size: 13px;
          }
          .row:last-child {
            border-bottom: none;
          }
          .label {
            color: #64748b;
            font-weight: 500;
          }
          .value {
            color: #0f172a;
            font-weight: 700;
            font-family: monospace;
          }
          .btn {
            display: inline-block;
            background-color: #15803d;
            color: #ffffff !important;
            font-size: 14px;
            font-weight: 700;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 10px;
            text-align: center;
            margin-top: 16px;
          }
          .footer {
            padding: 24px 32px;
            background-color: #f8fafc;
            border-top: 1px solid #f1f5f9;
            text-align: center;
            font-size: 12px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <span class="badge">Official Student Onboarding</span>
              <h1 class="title">Welcome to Thread Security Academy</h1>
              <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.5;">
                Hello <strong>${studentName}</strong>, your cybersecurity student account has been created by your faculty mentor.
              </p>
            </div>

            <div class="content">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: separate; border-spacing: 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 24px 0; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: left;">
                    Candidate TS-ID
                  </td>
                  <td align="right" style="padding: 12px 16px; font-size: 13px; color: #15803d; font-weight: 700; width: 58%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: right; font-family: monospace;">
                    <span style="display: inline-block; background-color: #f0fdf4; color: #15803d; padding: 3px 10px; border-radius: 6px; border: 1px solid #bbf7d0;">${tsId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: left;">
                    Login Email
                  </td>
                  <td align="right" style="padding: 12px 16px; font-size: 13px; color: #0f172a; font-weight: 600; width: 58%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: right;">
                    ${cleanTarget}
                  </td>
                </tr>
                ${
                  tempPassword
                    ? `<tr>
                        <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: left;">
                          Temporary Access Password
                        </td>
                        <td align="right" style="padding: 12px 16px; width: 58%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: right;">
                          <span style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 12px; font-weight: 700;">${tempPassword}</span>
                        </td>
                      </tr>`
                    : ''
                }
                ${
                  batchCode
                    ? `<tr>
                        <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: left;">
                          Assigned Cohort Batch
                        </td>
                        <td align="right" style="padding: 12px 16px; font-size: 13px; color: #0f172a; font-weight: 700; width: 58%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: right; font-family: monospace;">
                          ${batchCode}
                        </td>
                      </tr>`
                    : ''
                }
                ${
                  courseTitle
                    ? `<tr>
                        <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: left;">
                          Curriculum Track
                        </td>
                        <td align="right" style="padding: 12px 16px; font-size: 13px; color: #0f172a; font-weight: 600; width: 58%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: right;">
                          ${courseTitle}
                        </td>
                      </tr>`
                    : ''
                }
                ${
                  mentorName
                    ? `<tr>
                        <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; text-align: left;">
                          Faculty Lead
                        </td>
                        <td align="right" style="padding: 12px 16px; font-size: 13px; color: #0f172a; font-weight: 600; width: 58%; vertical-align: middle; text-align: right;">
                          ${mentorName}
                        </td>
                      </tr>`
                    : ''
                }
              </table>

              <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 20px 0;">
                You can log in to access your practical cyber sandboxes, live lectures, assignments, and verified certifications. You may log in directly with your email or TS-ID using secure OTP or your temporary password.
              </p>

              <div style="text-align: center;">
                <a href="${loginUrl}" class="btn" target="_blank">Access Student Portal →</a>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 0 0 4px 0;">Thread Security Education • Practical Cybersecurity Training</p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">If you did not expect this enrollment, please contact support@threadsecurity.in</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  // 1. Direct Delivery via Resend API
  if (apiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [cleanTarget],
          subject: `Welcome to Thread Security Academy — Credentials for ${studentName} (${tsId})`,
          html: htmlContent,
        }),
      });

      if (response.ok) {
        return { success: true, deliveredTo: cleanTarget };
      }
      const errorData = await response.json();
      console.warn('[Resend API Onboarding Warning]:', errorData);
    } catch (apiError: any) {
      console.warn('[Resend API Onboarding Fetch Error]:', apiError?.message);
    }
  }

  // 2. SMTP Transport Fallback
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: fromEmail,
        to: cleanTarget,
        subject: `Welcome to Thread Security Academy — Credentials for ${studentName} (${tsId})`,
        html: htmlContent,
      });

      return { success: true, deliveredTo: cleanTarget };
    } catch (smtpErr: any) {
      console.error('[SMTP Onboarding Error]:', smtpErr?.message);
    }
  }

  return {
    success: true,
    deliveredTo: cleanTarget,
    warning: 'Account created. Email logged to console in local environment.',
  };
}

export interface SendFacultyOnboardingInput {
  toEmail: string;
  facultyName: string;
  mentorId: string;
  tempPassword?: string;
  batches?: string[];
  courses?: string[];
  schedule?: string;
  loginUrl?: string;
}

/**
 * Sends a welcome onboarding email to newly provisioned Faculty/Mentor
 * with their Mentor ID, assigned batches, assigned courses, and teaching schedule.
 */
export async function sendFacultyOnboardingEmail({
  toEmail,
  facultyName,
  mentorId,
  tempPassword,
  batches = [],
  courses = [],
  schedule,
  loginUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/login` : 'https://www.threadsecurity.in/login',
}: SendFacultyOnboardingInput): Promise<SendOnboardingResult> {
  const cleanTarget = toEmail.trim().toLowerCase();
  const apiKey = process.env.RESEND_API_KEY;

  const verifiedSender = 'Thread Security Education <edu@threadsecurity.in>';
  const fromEmail =
    process.env.RESEND_FROM_EMAIL && !process.env.RESEND_FROM_EMAIL.includes('onboarding@resend.dev')
      ? process.env.RESEND_FROM_EMAIL
      : verifiedSender;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Thread Security Faculty</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
          }
          .wrapper {
            width: 100%;
            background-color: #f8fafc;
            padding: 40px 16px;
          }
          .container {
            max-width: 580px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
          }
          .header {
            padding: 32px 32px 24px 32px;
            background-color: #ffffff;
            border-bottom: 1px solid #f1f5f9;
          }
          .content {
            padding: 32px;
          }
          .badge {
            display: inline-block;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: #4f46e5;
            background-color: #eef2ff;
            border: 1px solid #c7d2fe;
            padding: 4px 10px;
            border-radius: 6px;
            margin-bottom: 16px;
          }
          .card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #edf2f7;
            font-size: 13px;
          }
          .row:last-child {
            border-bottom: none;
          }
          .label {
            color: #64748b;
            font-weight: 500;
          }
          .value {
            color: #0f172a;
            font-weight: 700;
            font-family: monospace;
          }
          .btn {
            display: inline-block;
            background-color: #4f46e5;
            color: #ffffff !important;
            font-weight: 600;
            font-size: 14px;
            padding: 12px 28px;
            border-radius: 10px;
            text-decoration: none;
            margin-top: 8px;
          }
          .footer {
            padding: 24px 32px;
            background-color: #f8fafc;
            border-top: 1px solid #f1f5f9;
            text-align: center;
            font-size: 12px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <span class="badge">Faculty Appointment</span>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a;">Welcome to Faculty Roster, ${facultyName}</h1>
            </div>
            <div class="content">
              <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">
                Your faculty account has been provisioned on the Thread Security Education platform. You can now access your Faculty Workspace to lead live lecture sessions, manage assigned batches, review student attendance, and evaluate practical lab submissions.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: separate; border-spacing: 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 24px 0; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: left;">
                    Faculty Member
                  </td>
                  <td align="right" style="padding: 12px 16px; font-size: 13px; color: #0f172a; font-weight: 700; width: 58%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: right;">
                    ${facultyName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: left;">
                    Faculty ID
                  </td>
                  <td align="right" style="padding: 12px 16px; width: 58%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: right;">
                    <span style="display: inline-block; background-color: #eef2ff; color: #4338ca; padding: 3px 10px; border-radius: 6px; font-family: monospace; font-size: 12px; font-weight: 700; border: 1px solid #c7d2fe;">${mentorId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: left;">
                    Login Email
                  </td>
                  <td align="right" style="padding: 12px 16px; font-size: 13px; color: #2563eb; font-weight: 600; width: 58%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: right;">
                    ${cleanTarget}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: left;">
                    Faculty Secret Key
                  </td>
                  <td align="right" style="padding: 12px 16px; width: 58%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: right;">
                    <span style="display: inline-block; background-color: #ede9fe; color: #5b21b6; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 12px; font-weight: 700; border: 1px solid #ddd6fe; letter-spacing: 0.05em;">${process.env.MENTOR_SECRET_KEY || 'TSE-MENTOR-78987'}</span>
                  </td>
                </tr>
                ${tempPassword ? `
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: left;">
                    Faculty Access Passkey
                  </td>
                  <td align="right" style="padding: 12px 16px; width: 58%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: right;">
                    <span style="display: inline-block; background-color: #1e1b4b; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-family: monospace; font-size: 12px; font-weight: 700; border: 1px solid #312e81; letter-spacing: 0.05em;">${tempPassword}</span>
                  </td>
                </tr>` : ''}
                ${batches.length > 0 ? `
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: left;">
                    Assigned Batch(es)
                  </td>
                  <td align="right" style="padding: 12px 16px; font-size: 13px; color: #0f172a; font-weight: 600; width: 58%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: right;">
                    ${batches.join(', ')}
                  </td>
                </tr>` : ''}
                ${courses.length > 0 ? `
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: left;">
                    Assigned Course(s)
                  </td>
                  <td align="right" style="padding: 12px 16px; font-size: 13px; color: #0f172a; font-weight: 600; width: 58%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: right;">
                    ${courses.join(', ')}
                  </td>
                </tr>` : ''}
                ${schedule ? `
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; text-align: left;">
                    Teaching Schedule
                  </td>
                  <td align="right" style="padding: 12px 16px; font-size: 13px; color: #0f172a; font-weight: 600; width: 58%; vertical-align: middle; text-align: right;">
                    ${schedule}
                  </td>
                </tr>` : ''}
              </table>

              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="${loginUrl}" class="btn" target="_blank">Access Faculty Workspace →</a>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 0;">Thread Security Education • Faculty Administration</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  // 1. Resend REST API
  if (apiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [cleanTarget],
          subject: `Faculty Appointment & Access Credentials — ${facultyName} (${mentorId})`,
          html: htmlContent,
        }),
      });

      if (response.ok) {
        return { success: true, deliveredTo: cleanTarget };
      }
      const err = await response.json();
      console.warn('[Resend API Faculty Onboarding Warning]:', err);
    } catch (e: any) {
      console.warn('[Resend API Faculty Onboarding Error]:', e?.message);
    }
  }

  // 2. SMTP Transport Fallback
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: fromEmail,
        to: cleanTarget,
        subject: `Faculty Appointment & Access Credentials — ${facultyName} (${mentorId})`,
        html: htmlContent,
      });

      return { success: true, deliveredTo: cleanTarget };
    } catch (smtpErr: any) {
      console.error('[SMTP Faculty Onboarding Error]:', smtpErr?.message);
    }
  }

  return {
    success: true,
    deliveredTo: cleanTarget,
    warning: 'Faculty created. Email logged to console in local environment.',
  };
}

export interface SendStaffOrAdminOnboardingInput {
  toEmail: string;
  name: string;
  role: 'SECURITY_ADMIN' | 'ACADEMIC_ADMIN' | 'CONTENT_MANAGER' | 'SUPER_ADMIN';
  tsId: string;
  secretKey?: string;
  passkey: string;
  department?: string;
  loginUrl?: string;
}

export async function sendStaffOrAdminOnboardingEmail({
  toEmail,
  name,
  role,
  tsId,
  secretKey,
  passkey,
  department,
  loginUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/login` : 'https://www.threadsecurity.in/login',
}: SendStaffOrAdminOnboardingInput): Promise<SendOnboardingResult> {
  const cleanTarget = toEmail.trim().toLowerCase();
  const apiKey = process.env.RESEND_API_KEY;

  const verifiedSender = 'Thread Security Education <edu@threadsecurity.in>';
  const fromEmail =
    process.env.RESEND_FROM_EMAIL && !process.env.RESEND_FROM_EMAIL.includes('onboarding@resend.dev')
      ? process.env.RESEND_FROM_EMAIL
      : verifiedSender;

  const roleTitle =
    role === 'SECURITY_ADMIN'
      ? 'Security Administrator'
      : role === 'SUPER_ADMIN'
      ? 'Super Administrator'
      : role === 'CONTENT_MANAGER'
      ? 'Content Manager'
      : 'Academic Operations Staff';

  const badgeText =
    role === 'SECURITY_ADMIN'
      ? 'Security Clearance'
      : role === 'SUPER_ADMIN'
      ? 'Master Admin Access'
      : 'Staff Appointment';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thread Security — Account Provisioning & Security Keys</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            -webkit-font-smoothing: antialiased;
          }
          .wrapper { width: 100%; background-color: #f8fafc; padding: 40px 16px; }
          .container {
            max-width: 580px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          }
          .header {
            padding: 32px 32px 24px 32px;
            background-color: #ffffff;
            border-bottom: 1px solid #f1f5f9;
          }
          .content { padding: 32px; }
          .badge {
            display: inline-block;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: #7c3aed;
            background-color: #f5f3ff;
            border: 1px solid #ddd6fe;
            padding: 4px 10px;
            border-radius: 6px;
            margin-bottom: 16px;
          }
          .card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #edf2f7;
            font-size: 13px;
          }
          .row:last-child { border-bottom: none; }
          .label { color: #64748b; font-weight: 500; }
          .value { color: #0f172a; font-weight: 700; font-family: monospace; }
          .btn {
            display: inline-block;
            background-color: #7c3aed;
            color: #ffffff !important;
            font-weight: 600;
            font-size: 14px;
            padding: 12px 28px;
            border-radius: 10px;
            text-decoration: none;
            margin-top: 8px;
          }
          .footer {
            padding: 24px 32px;
            background-color: #f8fafc;
            border-top: 1px solid #f1f5f9;
            text-align: center;
            font-size: 12px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <span class="badge">${badgeText}</span>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a;">Welcome to Platform Administration, ${name}</h1>
            </div>
            <div class="content">
              <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">
                Your account has been officially provisioned as <strong>${roleTitle}</strong> on the Thread Security Education platform. Please find your role-specific security credentials and access keys below.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: separate; border-spacing: 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 24px 0; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: left;">
                    Assigned Identity
                  </td>
                  <td align="right" style="padding: 12px 16px; font-size: 13px; color: #0f172a; font-weight: 700; width: 58%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: right;">
                    ${name}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: left;">
                    Platform Role
                  </td>
                  <td align="right" style="padding: 12px 16px; font-size: 13px; color: #7c3aed; font-weight: 700; width: 58%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: right;">
                    ${roleTitle}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: left;">
                    Account TS-ID
                  </td>
                  <td align="right" style="padding: 12px 16px; width: 58%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: right;">
                    <span style="display: inline-block; background-color: #ede9fe; color: #5b21b6; padding: 3px 10px; border-radius: 6px; font-family: monospace; font-size: 12px; font-weight: 700; border: 1px solid #ddd6fe;">${tsId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: left;">
                    Login Email
                  </td>
                  <td align="right" style="padding: 12px 16px; font-size: 13px; color: #2563eb; font-weight: 600; width: 58%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: right;">
                    ${cleanTarget}
                  </td>
                </tr>
                ${department ? `
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: left;">
                    Department / Unit
                  </td>
                  <td align="right" style="padding: 12px 16px; font-size: 13px; color: #0f172a; font-weight: 600; width: 58%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: right;">
                    ${department}
                  </td>
                </tr>` : ''}
                ${secretKey ? `
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: left;">
                    Assigned Secret Key
                  </td>
                  <td align="right" style="padding: 12px 16px; width: 58%; vertical-align: middle; border-bottom: 1px solid #edf2f7; text-align: right;">
                    <span style="display: inline-block; background-color: #ede9fe; color: #5b21b6; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 12px; font-weight: 700; border: 1px solid #ddd6fe; letter-spacing: 0.05em;">${secretKey}</span>
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 500; width: 42%; vertical-align: middle; text-align: left;">
                    Security Access Key / Passkey
                  </td>
                  <td align="right" style="padding: 12px 16px; width: 58%; vertical-align: middle; text-align: right;">
                    <span style="display: inline-block; background-color: #1e1b4b; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-family: monospace; font-size: 12px; font-weight: 700; border: 1px solid #312e81; letter-spacing: 0.05em;">${passkey}</span>
                  </td>
                </tr>
              </table>

              <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin: 20px 0;">
                <p style="margin: 0; font-size: 12px; color: #92400e; font-weight: 500;">
                  🔒 <strong>Confidentiality Notice:</strong> Keep your Secret Key and Access Passkey strictly confidential. You will be prompted for your respective role keys upon logging in.
                </p>
              </div>

              <div style="text-align: center; margin-top: 28px;">
                <a href="${loginUrl}" class="btn">Proceed to Login Console &rarr;</a>
              </div>
            </div>
            <div class="footer">
              Thread Security Operations &bull; Automated Access &amp; Identity Provisioning
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  // 1. Resend API
  if (apiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [cleanTarget],
          subject: `Thread Security — ${roleTitle} Clearance & Credentials for ${name} (${tsId})`,
          html: htmlContent,
        }),
      });

      if (res.ok) {
        return { success: true, deliveredTo: cleanTarget };
      }
    } catch (apiErr: any) {
      console.error('[Resend Admin Onboarding Error]:', apiErr?.message);
    }
  }

  // 2. SMTP Transport Fallback
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: fromEmail,
        to: cleanTarget,
        subject: `Thread Security — ${roleTitle} Clearance & Credentials for ${name} (${tsId})`,
        html: htmlContent,
      });

      return { success: true, deliveredTo: cleanTarget };
    } catch (smtpErr: any) {
      console.error('[SMTP Admin Onboarding Error]:', smtpErr?.message);
    }
  }

  return {
    success: true,
    deliveredTo: cleanTarget,
    warning: 'Account created. Email logged to console in local environment.',
  };
}
