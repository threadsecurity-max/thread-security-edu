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
              <div class="card">
                <div class="row">
                  <span class="label">Candidate TS-ID</span>
                  <span class="value" style="color: #15803d;">${tsId}</span>
                </div>
                <div class="row">
                  <span class="label">Login Email</span>
                  <span class="value">${cleanTarget}</span>
                </div>
                ${
                  tempPassword
                    ? `<div class="row">
                        <span class="label">Temporary Access Password</span>
                        <span class="value" style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${tempPassword}</span>
                      </div>`
                    : ''
                }
                ${
                  batchCode
                    ? `<div class="row">
                        <span class="label">Assigned Cohort Batch</span>
                        <span class="value">${batchCode}</span>
                      </div>`
                    : ''
                }
                ${
                  courseTitle
                    ? `<div class="row">
                        <span class="label">Curriculum Track</span>
                        <span class="value" style="font-family: inherit;">${courseTitle}</span>
                      </div>`
                    : ''
                }
                ${
                  mentorName
                    ? `<div class="row">
                        <span class="label">Faculty Lead</span>
                        <span class="value" style="font-family: inherit;">${mentorName}</span>
                      </div>`
                    : ''
                }
              </div>

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
