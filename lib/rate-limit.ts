// Simple in-memory rate limiter
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

export function getRateLimitInfo(identifier: string, limit = 10, windowMs = 60000) {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  if (!record || now > record.resetTime) {
    return {
      remaining: limit - 1,
      reset: now + windowMs,
      limit,
    }
  }

  return {
    remaining: Math.max(0, limit - record.count),
    reset: record.resetTime,
    limit,
  }
}
