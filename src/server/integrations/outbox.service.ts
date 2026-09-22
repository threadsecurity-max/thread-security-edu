import { prisma } from '../database/transaction-manager';
import { appendLeadToGoogleSheet } from '../../lib/gcp/googleSheetsService';
import { sendFacultyLeadAlert } from '../email/facultyAlert.service';

/**
 * Background outbox processor that reads PENDING events and executes non-blocking integrations
 * (Google Sheets, Email alerts, Webhooks, Analytics).
 */
export async function processPendingOutboxEvents(): Promise<{ processedCount: number; errorsCount: number }> {
  let processedCount = 0;
  let errorsCount = 0;

  const pendingEvents = await (prisma as any).outboxEvent.findMany({
    where: { status: 'PENDING' },
    take: 20,
    orderBy: { createdAt: 'asc' },
  });

  for (const event of pendingEvents) {
    try {
      const payload = JSON.parse(event.payloadJson);

      switch (event.eventType) {
        case 'LEAD_CAPTURED':
          // 1. Sync to Google Sheets
          await appendLeadToGoogleSheet({
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            courseInterest: payload.courseInterest,
            careerGoal: payload.careerGoal,
            aiScore: payload.aiScore,
            intentCategory: payload.intentCategory,
            source: payload.source,
          });

          // 2. Dispatch Email Alert
          await sendFacultyLeadAlert({
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            courseInterest: payload.courseInterest,
            careerGoal: payload.careerGoal,
            aiScore: payload.aiScore || 50,
            intentCategory: payload.intentCategory || 'MEDIUM_INTENT',
            source: payload.source,
          });
          break;

        case 'ATTENDANCE_MARKED':
          console.log(`[Outbox Worker] Processed attendance mark for session ${payload.sessionId}`);
          break;

        default:
          console.log(`[Outbox Worker] Unhandled event type: ${event.eventType}`);
          break;
      }

      await (prisma as any).outboxEvent.update({
        where: { id: event.id },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      });

      processedCount++;
    } catch (err: any) {
      errorsCount++;
      console.error(`[Outbox Worker Error] Failed processing event ${event.id}:`, err);

      await (prisma as any).outboxEvent.update({
        where: { id: event.id },
        data: {
          retryCount: event.retryCount + 1,
          status: event.retryCount >= 3 ? 'FAILED' : 'PENDING',
          errorMsg: err?.message || 'Unknown background processing error',
        },
      });
    }
  }

  return { processedCount, errorsCount };
}
