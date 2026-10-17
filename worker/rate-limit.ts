import { env } from 'cloudflare:workers'

export async function checkTileRateLimit(request: Request): Promise<Response | null> {
  const ip = request.headers.get('CF-Connecting-IP')?.trim() || 'unknown'
  const key = `tile:${ip}`

  try {
    const burst = await env.TILE_BURST_LIMITER.limit({ key })
    if (!burst.success) return unavailable(429, 10)

    const minute = await env.TILE_MINUTE_LIMITER.limit({ key })
    if (!minute.success) return unavailable(429, 60)
  } catch {
    return unavailable(503, 10)
  }

  return null
}

function unavailable(status: number, retryAfter: number): Response {
  return new Response(null, {
    status,
    headers: { 'Cache-Control': 'no-store', 'Retry-After': String(retryAfter) },
  })
}
