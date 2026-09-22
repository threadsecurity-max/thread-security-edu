import { NextResponse, NextRequest } from 'next/server';
import { runTransactionWithOutbox } from '@/server/database/transaction-manager';
import { scoreLeadWithAI } from '@/lib/gcp/vertexLeadScorer';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { validateCsrfOrigin } from '@/lib/security/csrf-guard';
import { sanitizeHtmlContent } from '@/lib/security/html-sanitizer';
import { LeadCaptureSchema } from '@/lib/security/validation.schemas';

export async function POST(req: NextRequest) {
  try {
    // 1. CSRF Verification
    const csrfCheck = validateCsrfOrigin(req);
    if (!csrfCheck.isValid) {
      return NextResponse.json(
        { success: false, error: { code: 'CSRF_REJECTED', message: csrfCheck.reason } },
        { status: 403 }
      );
    }

    // 2. Sliding Window Rate Limiting (5 requests / 60 seconds per IP)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const rateLimit = checkRateLimit(`lead-capture:${ip}`, { windowMs: 60000, max: 5 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again in 1 minute.' } },
        { status: 429, headers: { 'Retry-After': Math.ceil(rateLimit.resetInMs / 1000).toString() } }
      );
    }

    // 3. Schema Parsing & Honeypot Trap Check
    const rawBody = await req.json();
    const parseResult = LeadCaptureSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', details: parseResult.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Check Honeypot Field (Spam Bot Protection)
    if (data.websiteHpField && data.websiteHpField.trim().length > 0) {
      // Silently reject spam submissions
      return NextResponse.json({
        success: true,
        message: 'Thank you! Our admissions team will reach out shortly.',
      });
    }

    // Sanitize text inputs
    const sanitizedName = sanitizeHtmlContent(data.name);
    const sanitizedEmail = data.email.toLowerCase().trim();
    const sanitizedCourse = data.courseInterest ? sanitizeHtmlContent(data.courseInterest) : null;
    const sanitizedGoal = data.careerGoal ? sanitizeHtmlContent(data.careerGoal) : null;

    // 4. Compute AI Lead Intent Score via GCP Vertex AI / Gemini API
    const aiEvaluation = await scoreLeadWithAI({
      name: sanitizedName,
      email: sanitizedEmail,
      phone: data.phone || undefined,
      courseInterest: sanitizedCourse || undefined,
      careerGoal: sanitizedGoal || undefined,
      source: 'LANDING_PAGE',
    });

    // 5. ACID Transaction + Outbox Event Creation
    const result = await runTransactionWithOutbox(async (tx) => {
      const newLead = await tx.lead.create({
        data: {
          name: sanitizedName,
          email: sanitizedEmail,
          phone: data.phone || null,
          courseInterest: sanitizedCourse,
          careerGoal: sanitizedGoal,
          source: 'LANDING_PAGE',
          utmSource: data.utmSource || null,
          utmMedium: data.utmMedium || null,
          utmCampaign: data.utmCampaign || null,
          aiScore: aiEvaluation.aiScore,
          aiReasoning: `${aiEvaluation.reasoning} | Recommended Action: ${aiEvaluation.recommendedAction}`,
          activities: {
            create: {
              action: 'FORM_SUBMITTED',
              details: `Lead captured via Website. Intent: ${aiEvaluation.intentCategory} (${aiEvaluation.aiScore}/100).`,
            },
          },
        },
      });

      return {
        result: newLead,
        outboxEvent: {
          aggregateType: 'LEAD',
          aggregateId: newLead.id,
          eventType: 'LEAD_CAPTURED',
          payload: {
            leadId: newLead.id,
            name: sanitizedName,
            email: sanitizedEmail,
            phone: data.phone,
            courseInterest: sanitizedCourse,
            careerGoal: sanitizedGoal,
            aiScore: aiEvaluation.aiScore,
            intentCategory: aiEvaluation.intentCategory,
            utmSource: data.utmSource,
            utmMedium: data.utmMedium,
            utmCampaign: data.utmCampaign,
          },
        },
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you! Our cybersecurity admissions counselor will reach out to you shortly.',
      leadId: result.id,
      aiScore: aiEvaluation.aiScore,
      intentCategory: aiEvaluation.intentCategory,
    });
  } catch (error: any) {
    console.error('[Lead Capture API] Error processing lead:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred while processing your request.' } },
      { status: 500 }
    );
  }
}
