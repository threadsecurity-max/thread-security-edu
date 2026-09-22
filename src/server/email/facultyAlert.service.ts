import nodemailer from 'nodemailer';

export interface LeadAlertData {
  name: string;
  email: string;
  phone?: string | null;
  courseInterest?: string | null;
  careerGoal?: string | null;
  aiScore: number;
  intentCategory: string;
  source?: string | null;
}

export async function sendFacultyLeadAlert(lead: LeadAlertData): Promise<{ success: boolean; message?: string }> {
  const facultyEmail = process.env.FACULTY_NOTIFY_EMAIL || 'threadsecurity@gmail.com';
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Thread Security Education <onboarding@resend.dev>';

  const isHighIntent = lead.aiScore >= 75;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #090204; color: #f1f5f9; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #0f070a; border-radius: 16px; border: 1px solid #dc2626; padding: 32px; shadow: 0 4px 30px rgba(220, 38, 38, 0.2); }
          .header { border-bottom: 1px solid #331018; padding-bottom: 16px; text-align: center; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 10px; }
          .badge-high { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981; }
          .badge-med { background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid #f59e0b; }
          .field { margin: 16px 0; border-bottom: 1px solid #1f0b11; padding-bottom: 8px; }
          .label { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: bold; letter-spacing: 0.5px; }
          .value { font-size: 15px; color: #ffffff; margin-top: 4px; font-weight: 500; }
          .cta { text-align: center; margin-top: 28px; }
          .btn { background: #ef4444; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 14px; }
          .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 32px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="color: #ffffff; margin: 0;">🚨 New Inbound Student Lead Captured</h2>
            <div className="badge ${isHighIntent ? 'badge-high' : 'badge-med'}">
              Vertex AI Intent Score: ${lead.aiScore}/100 (${lead.intentCategory})
            </div>
          </div>

          <div className="field">
            <div className="label">Student Name</div>
            <div className="value">${lead.name}</div>
          </div>

          <div className="field">
            <div className="label">Email Address</div>
            <div className="value"><a href="mailto:${lead.email}" style="color: #38bdf8;">${lead.email}</a></div>
          </div>

          <div className="field">
            <div className="label">Phone Number</div>
            <div className="value">${lead.phone ? `<a href="tel:${lead.phone}" style="color: #34d399;">${lead.phone}</a>` : 'Not provided'}</div>
          </div>

          <div className="field">
            <div className="label">Course Interest</div>
            <div className="value">${lead.courseInterest || 'General Cybersecurity Mastery'}</div>
          </div>

          <div className="field">
            <div className="label">Target Career Goal</div>
            <div className="value">${lead.careerGoal || 'Not specified'}</div>
          </div>

          <div className="field">
            <div className="label">Source Channel</div>
            <div className="value">${lead.source || 'LANDING_PAGE'}</div>
          </div>

          <div className="cta">
            <a href="mailto:${lead.email}?subject=Thread%20Security%20Education%20-%20Course%20Curriculum%20Consultation" class="btn">
              Contact Student Directly
            </a>
          </div>

          <div class="footer">
            Thread Security Education — Faculty Lead Alert Engine<br>
            Managed via GCP Vertex AI & Resend API
          </div>
        </div>
      </body>
    </html>
  `;

  // 1. Send via Custom SMTP if configured
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
        to: facultyEmail,
        subject: `[Lead Alert - Score: ${lead.aiScore}/100] New Student Lead: ${lead.name}`,
        html: htmlContent,
      });

      return { success: true, message: `Alert email sent via SMTP to ${facultyEmail}` };
    } catch (smtpErr: any) {
      console.error('[Faculty Alert SMTP Error]:', smtpErr);
    }
  }

  // 2. Send via Resend REST API
  if (!apiKey) {
    console.warn('[Faculty Alert Warning]: RESEND_API_KEY is not configured in environment.');
    return { success: false, message: 'RESEND_API_KEY is not configured.' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [facultyEmail],
        subject: `[Lead Alert - Score: ${lead.aiScore}/100] New Student Lead: ${lead.name}`,
        html: htmlContent,
      }),
    });

    if (res.ok) {
      return { success: true, message: `Alert email sent via Resend to ${facultyEmail}` };
    }

    const errText = await res.text();
    console.warn('[Faculty Alert Resend Warning]:', errText);
    return { success: false, message: errText };
  } catch (err: any) {
    console.error('[Faculty Alert Error]:', err);
    return { success: false, message: err?.message || 'Email alert dispatch failed' };
  }
}
