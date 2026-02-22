/**
 * Simple in-memory rate limiter.
 *
 * Limitation: On Vercel (serverless), each cold start creates a fresh Map.
 * Rate limiting is therefore best-effort — it works within a single instance
 * but resets when a new instance spins up. For stronger rate limiting,
 * consider Vercel KV (Redis) or Upstash.
 */
const rateMap = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 5;

// Periodic cleanup to prevent unbounded memory growth
const CLEANUP_INTERVAL = 100; // run cleanup every N calls
let callsSinceCleanup = 0;

function pruneExpired(): void {
  const now = Date.now();
  for (const [ip, entry] of rateMap) {
    if (now > entry.resetAt) {
      rateMap.delete(ip);
    }
  }
}

export function checkRateLimit(ip: string): { allowed: boolean } {
  // Periodic cleanup
  callsSinceCleanup++;
  if (callsSinceCleanup >= CLEANUP_INTERVAL) {
    callsSinceCleanup = 0;
    pruneExpired();
  }

  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false };
  }

  entry.count++;
  return { allowed: true };
}
