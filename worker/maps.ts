import { env } from 'cloudflare:workers'
import type { Session } from './types.ts'

export async function createSession(): Promise<Session> {
  const body = {
    mapType: 'satellite',
    language: 'en-US',
    region: 'US',
    scale: 'scaleFactor4x',
    highDpi: true,
  }

  const res = await fetch(
    `https://tile.googleapis.com/v1/createSession?key=${env.GOOGLE_MAPS_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  )

  if (!res.ok) throw new Error(`Map session request failed: ${res.status}`)
  return await res.json()
}
