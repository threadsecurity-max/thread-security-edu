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
    if (msg.includes('Can\'t reach database server') || msg.includes('planLimitReached')) {
      if (now - lastErrorNotice > 60000) {
        lastErrorNotice = now;
        console.warn('⚠️  [Database Status]: Database connection unavailable or quota restricted (serving local fallback data).');
      }
    } else {
      console.error('Prisma Error:', msg);
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
