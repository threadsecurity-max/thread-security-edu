import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma, runTransactionWithOutbox } from '@/server/database/transaction-manager';
import { AttendanceMarkSchema } from '@/lib/security/validation.schemas';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { AttendanceStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Request & Role Verification
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || 'tse-lms-super-secret-jwt-key-2026' });

    if (!token || !token.sub) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const userRole = (token.role as string) || 'GUEST';
    if (!['SUPER_ADMIN', 'MENTOR'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Only assigned mentors or admins can mark attendance' } },
        { status: 403 }
      );
    }

    // 2. Rate Limiting (20 submissions / min)
    const rateLimit = checkRateLimit(`attendance:${token.sub}`, { windowMs: 60000, max: 20 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again in 1 minute.' } },
        { status: 429 }
      );
    }

    // 3. Schema Parsing
    const body = await req.json();
    const parseResult = AttendanceMarkSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', details: parseResult.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { batchId, sessionId, records } = parseResult.data;

    // 4. Server-Side IDOR Ownership Check
    // Verify mentor profile & batch assignment (if not SUPER_ADMIN)
    if (userRole !== 'SUPER_ADMIN') {
      const mentorProfile = await prisma.mentorProfile.findUnique({
        where: { userId: token.sub },
        select: { id: true },
      });

      if (!mentorProfile) {
        return NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'Mentor profile not found' } },
          { status: 403 }
        );
      }

      const assignedBatch = await prisma.batch.findFirst({
        where: {
          id: batchId,
          mentorId: mentorProfile.id,
        },
      });

      if (!assignedBatch) {
        return NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'You are not assigned to this cohort batch.' } },
          { status: 403 }
        );
      }
    }

    // 5. Atomic Attendance Update & Audit Transaction
    const updatedCount = await runTransactionWithOutbox(async (tx) => {
      let count = 0;

      for (const rec of records) {
        const existingRecord = await tx.attendanceRecord.findUnique({
          where: {
            sessionId_studentId: {
              sessionId,
              studentId: rec.studentId,
            },
          },
        });

        const newStatus = rec.status as AttendanceStatus;

        await tx.attendanceRecord.upsert({
          where: {
            sessionId_studentId: {
              sessionId,
              studentId: rec.studentId,
            },
          },
          create: {
            sessionId,
            studentId: rec.studentId,
            status: newStatus,
            remarks: rec.remarks || null,
            markedBy: token.name || 'Mentor',
          },
          update: {
            status: newStatus,
            remarks: rec.remarks || null,
            markedBy: token.name || 'Mentor',
          },
        });

        // Record Audit Log
        await tx.attendanceAudit.create({
          data: {
            batchId,
            sessionId,
            studentId: rec.studentId,
            mentorId: token.sub,
            oldStatus: existingRecord?.status || null,
            newStatus,
            action: existingRecord ? 'MODIFIED' : 'INITIAL_MARK',
            reason: rec.remarks || 'Mentor updated attendance record',
          },
        });

        count++;
      }

      return {
        result: count,
        outboxEvent: {
          aggregateType: 'ATTENDANCE',
          aggregateId: sessionId,
          eventType: 'ATTENDANCE_MARKED',
          payload: {
            batchId,
            sessionId,
            markedBy: token.sub,
            updatedRecordsCount: count,
          },
        },
      };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully marked attendance for ${updatedCount} students.`,
      recordsProcessed: updatedCount,
    });
  } catch (error: any) {
    console.error('[Mentor Attendance API Error]:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred while processing attendance.' } },
      { status: 500 }
    );
  }
}
