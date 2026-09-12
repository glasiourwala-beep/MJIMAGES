export interface RateLimitConfig {
  windowMs: number; // e.g. 60000 (1 min)
  maxRequests: number; // e.g. 60 requests per min
}

interface ClientRecord {
  timestamps: number[];
}

const clientMap = new Map<string, ClientRecord>();

// Periodic garbage collection for idle clients
setInterval(() => {
  const now = Date.now();
  const maxWindow = 120000;
  for (const [ip, record] of clientMap.entries()) {
    record.timestamps = record.timestamps.filter((t) => now - t < maxWindow);
    if (record.timestamps.length === 0) {
      clientMap.delete(ip);
    }
  }
}, 60000);

export function checkRateLimit(
  ip: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 60 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let record = clientMap.get(ip);
  if (!record) {
    record = { timestamps: [] };
    clientMap.set(ip, record);
  }

  // Filter timestamps within current sliding window
  record.timestamps = record.timestamps.filter((t) => t > windowStart);

  if (record.timestamps.length >= config.maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const resetTime = Math.ceil((oldestTimestamp + config.windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: Math.max(1, resetTime),
    };
  }

  record.timestamps.push(now);
  const remaining = config.maxRequests - record.timestamps.length;
  return {
    allowed: true,
    remaining,
    resetTime: Math.ceil(config.windowMs / 1000),
  };
}

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
