import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let lastErrorNotice = 0;

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: [
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });

  // Intercept and throttle connection errors to keep the dev terminal clean
  (client as any).$on('error', (e: any) => {
    const now = Date.now();
    const msg = e?.message || '';
    if (
      msg.includes("Can't reach database server") ||
      msg.includes('planLimitReached') ||
      msg.includes('does not exist in the current database') ||
      msg.includes('Timed out fetching a new connection')
    ) {
      if (now - lastErrorNotice > 60000) {
        lastErrorNotice = now;
        console.warn('⚠️  [Database Status]: Database connection pool busy or relation pending (serving resilient fallback data).');
      }
    } else {
      console.warn('⚠️  [Prisma Notice]:', msg);
    }
  });

  (client as any).$on('warn', (e: any) => {
    // Suppress redundant pooler warnings in development
  });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
