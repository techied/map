import { env } from 'cloudflare:workers'
import { createSession } from './maps.ts'
import type { Session } from './types.ts'

const SESSION_STORAGE_KEY = 'session'

export async function getOrCreateSession(): Promise<Session> {
  const session = await getExistingSession()
  if (!session) {
    const session = await createSession()
    await storeSession(session)
    return session
  }
  return session
}

async function getExistingSession(): Promise<Session | null> {
  const str = await env.TILES_SESSION_STORE.get(SESSION_STORAGE_KEY)
  if (str === null) return null
  const session: Session = JSON.parse(str)
  const expiryMs = Number(session.expiry) * 1000
  if (!Number.isFinite(expiryMs) || Date.now() + 5_000 >= expiryMs) return null
  return session
}

async function storeSession(session: Session): Promise<void> {
  const str = JSON.stringify(session)
  await env.TILES_SESSION_STORE.put(SESSION_STORAGE_KEY, str)
}
