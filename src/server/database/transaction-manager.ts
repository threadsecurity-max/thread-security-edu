import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export interface OutboxPayload {
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: Record<string, any>;
}

/**
 * Executes business operations inside an ACID Prisma Transaction
 * and atomically creates a Transactional Outbox Event for background processing.
 */
export async function runTransactionWithOutbox<T>(
  action: (tx: Prisma.TransactionClient) => Promise<{ result: T; outboxEvent?: OutboxPayload }>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    const { result, outboxEvent } = await action(tx);

    if (outboxEvent) {
      await (tx as any).outboxEvent.create({
        data: {
          aggregateType: outboxEvent.aggregateType,
          aggregateId: outboxEvent.aggregateId,
          eventType: outboxEvent.eventType,
          payloadJson: JSON.stringify(outboxEvent.payload),
          status: 'PENDING',
        },
      });
    }

    return result;
  }, {
    timeout: 10000, // 10s maximum transaction duration
  });
}
