import { randomInt } from 'crypto';
import nodemailer from 'nodemailer';

export interface SendOtpResult {
  success: boolean;
  deliveredTo?: string;
  warning?: string;
  error?: string;
}

/**
 * Generates a cryptographically secure 6-digit MFA OTP code.
 */
export function generate6DigitOtp(): string {
  return randomInt(100000, 999999).toString();
}

/**
 * Sends a 6-digit MFA OTP verification code using Resend API or SMTP Transport.
 * Renders a premium, minimal White and Green email template.
 */
export async function sendOtpEmail({
  toEmail,
  studentName,
  code,
}: {
  toEmail: string;
  studentName: string;
  code: string;
}): Promise<SendOtpResult> {
  const cleanTarget = toEmail.trim().toLowerCase();
  const apiKey = process.env.RESEND_API_KEY;

  // Use verified domain sender (threadsecurity.in is verified in Resend)
  const verifiedSender = 'Thread Security Education <edu@threadsecurity.in>';
  const fromEmail =
    process.env.RESEND_FROM_EMAIL && !process.env.RESEND_FROM_EMAIL.includes('onboarding@resend.dev')
      ? process.env.RESEND_FROM_EMAIL
      : verifiedSender;

  // Premium, Minimal White & Green HTML Email Template
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Verification Code — Thread Security</title>
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
          .card {
            max-width: 520px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            padding: 40px 36px;
            box-shadow: 0 4px 24px rgba(15, 23, 42, 0.04);
          }
          .brand-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding-bottom: 24px;
            border-bottom: 1px solid #f1f5f9;
          }
          .brand-pill {
            display: inline-block;
            background-color: #f0fdf4;
            color: #15803d;
            border: 1px solid #bbf7d0;
            border-radius: 6px;
            padding: 3px 8px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .brand-title {
            font-size: 14px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.2px;
            margin-top: 4px;
          }
          .content-title {
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
            margin: 28px 0 12px 0;
            line-height: 1.3;
          }
          .content-body {
            font-size: 14px;
            color: #475569;
            line-height: 1.6;
            margin: 0 0 24px 0;
          }
          .code-container {
            background-color: #f0fdf4;
            border: 1.5px solid #86efac;
            border-radius: 12px;
            padding: 24px 16px;
            text-align: center;
            margin: 24px 0;
          }
          .code-label {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #16a34a;
            margin-bottom: 8px;
          }
          .code-digits {
            font-family: 'SF Mono', 'Roboto Mono', Menlo, Consolas, Monaco, monospace;
            font-size: 38px;
            font-weight: 800;
            color: #15803d;
            letter-spacing: 12px;
            margin-left: 12px;
          }
          .expiry-note {
            font-size: 12px;
            color: #64748b;
            text-align: center;
            margin-top: 8px;
          }
          .meta-box {
            background-color: #f8fafc;
            border-radius: 10px;
            border: 1px solid #f1f5f9;
            padding: 12px 16px;
            font-size: 12px;
            color: #64748b;
            margin: 24px 0 0 0;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
          }
          .meta-target {
            font-weight: 600;
            color: #0f172a;
          }
          .footer {
            margin-top: 36px;
            padding-top: 20px;
            border-top: 1px solid #f1f5f9;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.6;
          }
          .footer-brand {
            font-weight: 600;
            color: #64748b;
          }
          .footer a {
            color: #16a34a;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="card">
            <!-- Header -->
            <div class="brand-header">
              <div>
                <span class="brand-pill">AUTHENTICATION GATEWAY</span>
                <div class="brand-title">THREAD SECURITY EDUCATION</div>
              </div>
            </div>

            <!-- Title & Greeting -->
            <h1 class="content-title">Verification Passcode</h1>
            <p class="content-body">
              Hello <strong>${studentName || 'Student'}</strong>,<br>
              Please enter the 6-digit one-time passcode below to verify your identity and access your dashboard.
            </p>

            <!-- Minimal White & Green Code Box -->
            <div class="code-container">
              <div class="code-label">SINGLE-USE ACCESS CODE</div>
              <div class="code-digits">${code}</div>
              <div class="expiry-note">Expires in <strong>30 minutes</strong> • One-time use only</div>
            </div>

            <!-- Security Notice -->
            <div class="meta-box">
              <div class="meta-row">
                <span>Account Recipient:</span>
                <span class="meta-target">${cleanTarget}</span>
              </div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">
                Never share this code with anyone. Thread Security staff will never ask for your verification code.
              </div>
            </div>

            <!-- Minimal Footer -->
            <div class="footer">
              <span class="footer-brand">Thread Security Education</span><br>
              Cybersecurity Academy • Official Identity Services<br>
              <a href="https://www.threadsecurity.in" target="_blank">www.threadsecurity.in</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  // 1. OPTION A: Use Custom SMTP Server if configured in environment
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const port = parseInt(process.env.SMTP_PORT || '587', 10);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: process.env.SMTP_SECURE === 'true' || port === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || fromEmail,
        to: cleanTarget,
        subject: `[${code}] Thread Security Access Code`,
        html: htmlContent,
      });

      console.log(`[SMTP_EMAIL_SUCCESS] OTP sent via SMTP directly to ${cleanTarget} (MessageId: ${info.messageId})`);
      return { success: true, deliveredTo: cleanTarget };
    } catch (smtpErr) {
      const msg = smtpErr instanceof Error ? smtpErr.message : String(smtpErr);
      console.error('[SMTP_EMAIL_ERROR] Failed to send via custom SMTP:', msg);
      // Fall through to Resend API
    }
  }

  // 2. OPTION B: Use Resend REST API (strictly to cleanTarget)
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [cleanTarget],
        subject: `[${code}] Thread Security Access Code`,
        html: htmlContent,
      }),
    });

    if (response.ok) {
      const resData = await response.json();
      console.log(`[RESEND_EMAIL_SUCCESS] OTP dispatched directly to ${cleanTarget} (ID: ${resData.id})`);
      return { success: true, deliveredTo: cleanTarget };
    }

    const errText = await response.text();
    console.error(`[RESEND_EMAIL_ERROR] Resend API error sending to ${cleanTarget}:`, errText);
    return { success: false, error: errText };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[RESEND_EMAIL_EXCEPTION]', errorMessage);
    return { success: false, error: errorMessage };
  }
}
