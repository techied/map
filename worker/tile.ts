import { getOrCreateSession } from './session.ts'
import { env } from 'cloudflare:workers'
import type { Tile } from './types.ts'

export async function getTile(x: number, y: number, zoom: number): Promise<Tile> {
  const session = await getOrCreateSession()
  const res = await fetch(
    `https://tile.googleapis.com/v1/2dtiles/${encodeURIComponent(zoom)}/${encodeURIComponent(x)}/${encodeURIComponent(y)}?session=${session.session}&key=${env.GOOGLE_MAPS_API_KEY}`,
    {
      cf: {
        cacheTtl: 86400,
        cacheEverything: true,
      },
    },
  )
  if (!res.ok) throw new Error(`Tile request failed: ${res.status}`)
  return {
    data: await res.bytes(),
    contentType: res.headers.get('content-type') ?? 'image/jpeg',
    width: session.tileWidth,
    height: session.tileHeight,
  }
}
