/**
 * Cost Safety & Rate Limiting Guard
 *
 * Prevents expensive operations from being executed repeatedly:
 * - Image uploads: max 5 per minute
 * - Profile updates: max 10 per minute
 * - Data exports: max 2 per minute
 * - Auth operations: max 5 per minute
 */

interface RateLimitTracker {
  count: number
  resetAt: number
}

const memoryStore = new Map<string, RateLimitTracker>()

export interface RateLimitOptions {
  key: string
  maxRequests: number
  windowMs: number
}

/**
 * Checks if a specific action key exceeds its rate limit.
 * Returns true if the operation is allowed, false if rate-limited.
 */
export function checkRateLimit({
  key,
  maxRequests,
  windowMs,
}: RateLimitOptions): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now()
  let tracker = memoryStore.get(key)

  if (!tracker || now > tracker.resetAt) {
    tracker = { count: 1, resetAt: now + windowMs }
    memoryStore.set(key, tracker)
    return {
      allowed: true,
      remaining: maxRequests - 1,
      retryAfterMs: 0,
    }
  }

  if (tracker.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, tracker.resetAt - now),
    }
  }

  tracker.count += 1
  return {
    allowed: true,
    remaining: maxRequests - tracker.count,
    retryAfterMs: 0,
  }
}
