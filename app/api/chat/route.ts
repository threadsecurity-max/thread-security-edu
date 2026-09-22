import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/security/rate-limiter';

const ChatRequestSchema = z.object({
  query: z.string().min(1, 'Query cannot be empty').max(1000, 'Query exceeds 1000 characters limit'),
  session_id: z.string().min(1).max(100),
});

const SYSTEM_CONTEXT = `
You are the official Thread Security Education (TSE) AI Educational Assistant.
Your purpose is to assist students, professionals, and enterprise candidates exploring our Cybersecurity and AI curriculum tracks.
Our tracks include:
- AI: 45 Days (Python for AI, Data Analysis, Data Science, ML, Deep Learning), 6 Months (Foundational AI, Agentic AI & Intelligent Systems, AI Engineering, AI Infrastructure, AI Security).
- Cybersecurity: 45 Days (Fundamentals, Networking, Ethical Hacking, VAPT, SOC Blue Team, Advanced Red Team), 3 Months, and 6 Months (Red Team Operations, Blue Team Defense, Bug Bounty Hunting, Linux for Cyber).
- Labs: TSE Virtual Labs (hands-on learn, discover, analyze, exploit, report, remediate workflow).
- Mentors: Active enterprise cybersecurity and AI professionals.
- Enrollment: Direct interested candidates to /contact or threadsecurity.in/contact.
Be helpful, precise, technical where appropriate, encouraging, and cybersecurity-focused.
`.trim();

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting (20 requests / 60s per IP)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const rateLimit = checkRateLimit(`chat:${ip}`, { windowMs: 60000, max: 20 });
    if (!rateLimit.success) {
      return new NextResponse(
        "You're asking questions quite fast! Please wait a moment before sending your next question.",
        { status: 429, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      );
    }

    // 2. Schema Validation
    const body = await req.json();
    const parseResult = ChatRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return new NextResponse(
        'Invalid chat request format.',
        { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      );
    }

    const { query, session_id } = parseResult.data;

    // 3. First priority: Try FastAPI backend if running
    const backendUrl = process.env.CHATBOT_BACKEND_URL || 'http://localhost:8000/chat';

    try {
      const backendRes = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, session_id }),
        signal: AbortSignal.timeout(6000), // 6s timeout for local FastAPI
      });

      if (backendRes.ok && backendRes.body) {
        return new NextResponse(backendRes.body, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache',
          },
        });
      }
    } catch {
      // Backend not running locally, proceed to Gemini fallback
    }

    // 4. Standalone Fallback: Use Gemini AI API if available
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${geminiKey}`;

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: SYSTEM_CONTEXT }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: query }],
              },
            ],
            generationConfig: {
              maxOutputTokens: 800,
              temperature: 0.4,
            },
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (geminiRes.ok && geminiRes.body) {
          // Transform SSE to plain text stream
          const transformStream = new TransformStream({
            transform(chunk, controller) {
              const text = new TextDecoder().decode(chunk);
              const lines = text.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const json = JSON.parse(line.substring(6));
                    const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (candidateText) {
                      controller.enqueue(new TextEncoder().encode(candidateText));
                    }
                  } catch {
                    // Ignore non-JSON lines
                  }
                }
              }
            },
          });

          return new NextResponse(geminiRes.body.pipeThrough(transformStream), {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Transfer-Encoding': 'chunked',
              'Cache-Control': 'no-cache',
            },
          });
        }
      } catch (geminiErr) {
        console.warn('[Chat API] Gemini streaming error:', geminiErr);
      }
    }

    // 5. Final Graceful Fallback
    const fallbackText = `Thread Security Education offers premier hands-on tracks across **Offensive Security (Red Teaming, Ethical Hacking, VAPT)**, **Defensive Security (Blue Team, SOC Operations)**, and **Enterprise AI Systems (Agentic AI, LLMOps)**.\n\nTo speak directly with our senior instructors and discuss custom cohort schedules, please submit your request at [/contact](/contact).`;

    return new NextResponse(fallbackText, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('[Chat API Error]:', error);
    return new NextResponse(
      'An unexpected error occurred while processing your question. Please try again.',
      { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }
}
