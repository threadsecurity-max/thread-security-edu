interface RateLimitStoreEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitStoreEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (now > entry.resetAt) {
      memoryStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs: number; // e.g. 60000 for 1 minute
  max: number;      // e.g. 5 requests
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInMs: number;
}

/**
 * Sliding window rate limiter for API endpoints (IP or Identifier based).
 */
export function checkRateLimit(identifier: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;
  const record = memoryStore.get(key);

  if (!record || now > record.resetAt) {
    memoryStore.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return {
      success: true,
      limit: options.max,
      remaining: options.max - 1,
      resetInMs: options.windowMs,
    };
  }

  if (record.count >= options.max) {
    return {
      success: false,
      limit: options.max,
      remaining: 0,
      resetInMs: record.resetAt - now,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: options.max,
    remaining: options.max - record.count,
    resetInMs: record.resetAt - now,
  };
}
