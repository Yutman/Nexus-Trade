type Counter = {
	count: number
	resetAt: number
}

// Simple in-memory store for single-instance/dev usage
const store = new Map<string, Counter>()

const now = () => Date.now()

function getBucketKey(prefix: string, id: string, windowMs: number) {
	const windowStart = Math.floor(now() / windowMs) * windowMs
	return `${prefix}:${id}:${windowStart}`
}

export type RateLimitResult = {
	limited: boolean
	remaining: number
	resetAfterSeconds: number
}

/**
 * Increment the counter for a given key within a fixed window and check if limit exceeded.
 * Always increments so that abuse is accounted for even when requests fail or user not found.
 */
export function hitRateLimit(
	prefix: string,
	id: string,
	limit: number,
	windowMs: number
): RateLimitResult {
	const key = getBucketKey(prefix, id, windowMs)
	const existing = store.get(key)
	const nowMs = now()
	const windowStart = Math.floor(nowMs / windowMs) * windowMs
	const resetAt = windowStart + windowMs

	let counter: Counter
	if (!existing || existing.resetAt <= nowMs) {
		counter = { count: 0, resetAt }
	} else {
		counter = existing
	}

	counter.count += 1
	store.set(key, counter)

	const limited = counter.count > limit
	const remaining = Math.max(0, limit - counter.count)
	const resetAfterSeconds = Math.max(0, Math.ceil((counter.resetAt - nowMs) / 1000))

	return { limited, remaining, resetAfterSeconds }
}

export function getClientIp(req: Request): string {
	const xff = req.headers.get('x-forwarded-for') || ''
	const xri = req.headers.get('x-real-ip') || ''
	const cf = req.headers.get('cf-connecting-ip') || ''
	const ip = (xff.split(',')[0] || xri || cf || '').trim()
	return ip || 'unknown'
}


