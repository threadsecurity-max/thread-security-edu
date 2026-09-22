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
  const ownerEmail = 'threadsecurity@gmail.com';
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Thread Security Education <onboarding@resend.dev>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f9fa; color: #0b1720; margin: 0; padding: 20px; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #dce4e8; padding: 32px; box-shadow: 0 4px 20px rgba(7, 26, 43, 0.08); }
          .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #dce4e8; }
          .logo { font-size: 20px; font-weight: bold; color: #071a2b; letter-spacing: -0.5px; }
          .logo span { color: #31d17c; background: #04111c; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-left: 6px; }
          .title { font-size: 22px; font-weight: 700; color: #071a2b; margin-top: 24px; text-align: center; }
          .code-box { background: #04111c; border: 2px solid #31d17c; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
          .code { font-family: 'Courier New', monospace; font-size: 38px; font-weight: 800; color: #31d17c; letter-spacing: 12px; }
          .body-text { font-size: 15px; color: #66737d; line-height: 1.6; text-align: center; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">THREAD SECURITY <span>ACADEMY</span></div>
          </div>
          
          <h2 class="title">Student Portal Verification Code</h2>
          <p class="body-text">Hello <strong>${studentName}</strong>,</p>
          <p class="body-text">Use the 6-digit MFA verification code below to access your Thread Security Student Dashboard:</p>
          
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          
          <p class="body-text">Target Recipient: <strong>${cleanTarget}</strong></p>
          <p class="body-text">This code will expire in <strong>10 minutes</strong>. If you did not request access, please ignore this email.</p>
          
          <div class="footer">
            Thread Security Education — Cybersecurity LMS<br>
            Official Academic Identity Portal
          </div>
        </div>
      </body>
    </html>
  `;

  // 1. OPTION A: Use Custom SMTP Server if SMTP_HOST is defined in .env
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
        subject: `[MFA Code: ${code}] Thread Security Access Code for ${cleanTarget}`,
        html: htmlContent,
      });

      console.log(`[SMTP_EMAIL_SUCCESS] Real MFA email sent via SMTP to ${cleanTarget} (MessageId: ${info.messageId})`);
      return { success: true, deliveredTo: cleanTarget };
    } catch (smtpErr) {
      const msg = smtpErr instanceof Error ? smtpErr.message : String(smtpErr);
      console.error('[SMTP_EMAIL_ERROR] Failed to send via custom SMTP:', msg);
      // Fall through to try Resend API as backup
    }
  }

  // 2. OPTION B: Use Resend REST API
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
        subject: `[MFA Code: ${code}] Thread Security Access Code for ${cleanTarget}`,
        html: htmlContent,
      }),
    });

    if (response.ok) {
      const resData = await response.json();
      console.log(`[RESEND_EMAIL_SUCCESS] Real MFA email dispatched via Resend to ${cleanTarget} (ID: ${resData.id}, Code: ${code})`);
      return { success: true, deliveredTo: cleanTarget };
    }

    const errText = await response.text();
    console.warn(`[RESEND_EMAIL_WARNING] Resend API error sending to ${cleanTarget}:`, errText);

    // If error is sandbox domain restriction (can only send to account owner email in free tier)
    if (errText.includes('validation_error') || errText.includes('only send testing emails')) {
      console.warn(`[RESEND_SANDBOX_RESTRICTION] Attempting sandbox fallback send to account owner (${ownerEmail})...`);

      const fallbackRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [ownerEmail],
          subject: `[MFA Code: ${code}] Thread Security Access Code for ${cleanTarget} (Sandbox Fallback)`,
          html: htmlContent,
        }),
      });

      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        console.log(`[RESEND_FALLBACK_SUCCESS] MFA email dispatched to owner email (${ownerEmail}) for target ${cleanTarget} (ID: ${fallbackData.id}, Code: ${code})`);
        return {
          success: true,
          deliveredTo: ownerEmail,
          warning: `Resend sandbox active: email delivered to ${ownerEmail} for testing target ${cleanTarget}.`,
        };
      }
    }

    return { success: false, error: errText };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[RESEND_EMAIL_ERROR]', errorMessage);
    return { success: false, error: errorMessage };
  }
}

