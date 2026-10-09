import nodemailer from 'nodemailer';

export interface LabGradedEmailData {
  studentName: string;
  studentEmail: string;
  labTitle: string;
  difficulty?: string;
  score: number;
  feedback?: string | null;
  mentorName?: string;
  labId?: string;
  completedAt?: Date;
}

export async function sendLabGradedEmail(
  data: LabGradedEmailData
): Promise<{ success: boolean; message?: string }> {
  const { studentName, studentEmail, labTitle, difficulty, score, feedback, mentorName, labId } = data;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Thread Security Education <noreply@threadsecurity.in>';
  const apiKey = process.env.RESEND_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.threadsecurity.in';

  const isPassed = score >= 70;
  const statusColor = isPassed ? '#10b981' : '#f59e0b';
  const statusLabel = isPassed ? 'PASSED & COMPLETED' : 'REVIEWED - ACTION REQUIRED';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Courier New', Courier, monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; background-color: #050505; color: #f1f5f9; margin: 0; padding: 24px; }
          .container { max-width: 620px; margin: 0 auto; background: #0c0c0e; border-radius: 16px; border: 1px solid #27272a; padding: 32px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8); }
          .header { border-bottom: 1px solid #1f2937; padding-bottom: 20px; text-align: left; }
          .logo { color: #C6FF34; font-size: 13px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
          .title { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .subtitle { font-size: 13px; color: #94a3b8; margin: 0; }
          .score-card { margin: 24px 0; padding: 20px; border-radius: 12px; background: #111115; border: 1px solid ${statusColor}40; text-align: center; }
          .score-label { font-size: 11px; text-transform: uppercase; color: #9ca3af; letter-spacing: 1px; }
          .score-value { font-size: 42px; font-weight: 900; color: ${statusColor}; margin: 6px 0; }
          .badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: bold; background: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}60; }
          .field { margin: 16px 0; padding-bottom: 12px; border-bottom: 1px solid #18181b; }
          .label { font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: bold; letter-spacing: 0.5px; }
          .value { font-size: 14px; color: #f4f4f5; margin-top: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .feedback-box { background: #141418; border-left: 3px solid #C6FF34; padding: 14px 16px; border-radius: 0 8px 8px 0; margin-top: 6px; font-size: 13px; color: #e4e4e7; line-height: 1.5; font-style: italic; }
          .cta { text-align: center; margin-top: 32px; }
          .btn { background: #C6FF34; color: #000000; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 13px; letter-spacing: 0.5px; }
          .footer { text-align: center; font-size: 11px; color: #52525b; margin-top: 32px; border-top: 1px solid #18181b; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚡ THREAD SECURITY EDUCATION // OFFENSIVE LABS</div>
            <h1 class="title">Lab Evaluation Result Released</h1>
            <p class="subtitle">Cadet: <strong>${studentName}</strong> • Target: <strong>${labTitle}</strong></p>
          </div>

          <div class="score-card">
            <div class="score-label">EVALUATED LAB SCORE</div>
            <div class="score-value">${score} <span style="font-size: 20px; color: #94a3b8;">/ 100</span></div>
            <div class="badge">${statusLabel}</div>
          </div>

          <div class="field">
            <div class="label">Target Challenge</div>
            <div class="value">${labTitle} ${difficulty ? `(${difficulty})` : ''}</div>
          </div>

          ${mentorName ? `
          <div class="field">
            <div class="label">Evaluating Faculty Instructor</div>
            <div class="value">${mentorName}</div>
          </div>
          ` : ''}

          <div class="field">
            <div class="label">Faculty Feedback & Remediations</div>
            <div class="feedback-box">
              "${feedback || 'Verified practical exploit execution and objective completion.'}"
            </div>
          </div>

          <div class="cta">
            <a href="${appUrl}/student/labs${labId ? `/${labId}` : ''}" class="btn">
              View Lab Console &amp; Share Result &rarr;
            </a>
          </div>

          <div class="footer">
            Thread Security Education Academic Operations<br>
            Cryptographically logged &amp; verified by TSE Faculty Console.
          </div>
        </div>
      </body>
    </html>
  `;

  // 1. Send via SMTP if configured
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

      await transporter.sendMail({
        from: process.env.SMTP_FROM || fromEmail,
        to: studentEmail,
        subject: `[TSE Lab Score: ${score}/100] ${labTitle} - Result Evaluated`,
        html: htmlContent,
      });

      return { success: true, message: `Lab score email dispatched via SMTP to ${studentEmail}` };
    } catch (smtpErr: any) {
      console.error('[Lab Graded SMTP Error]:', smtpErr);
    }
  }

  // 2. Send via Resend API
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
          to: [studentEmail],
          subject: `[TSE Lab Score: ${score}/100] ${labTitle} - Result Evaluated`,
          html: htmlContent,
        }),
      });

      if (res.ok) {
        return { success: true, message: `Lab score email dispatched via Resend to ${studentEmail}` };
      }
      const errText = await res.text();
      console.warn('[Lab Graded Resend Warning]:', errText);
    } catch (resendErr: any) {
      console.error('[Lab Graded Resend Error]:', resendErr);
    }
  }

  return { success: false, message: 'No email transport configured (SMTP or RESEND_API_KEY).' };
}
