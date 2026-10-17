type Params = {
  coords: [number, number, number]
  prompt: string
}

const MAX_TILE_ZOOM = 19
const MAX_PROMPT_LENGTH = 256

export function getParams(params: URLSearchParams): Params {
  const zoom = getInteger(params, 'z')
  if (zoom > MAX_TILE_ZOOM) throw new Error('Invalid zoom')

  const x = getInteger(params, 'x')
  const y = getInteger(params, 'y')
  const tileCount = 2 ** zoom
  if (x >= tileCount || y >= tileCount) throw new Error('Invalid tile coordinates')

  const prompt = getRequiredParam(params, 'q').trim()
  if (!prompt || prompt.length > MAX_PROMPT_LENGTH) throw new Error('Invalid prompt')

  return { coords: [x, y, zoom], prompt }
}

function getRequiredParam(params: URLSearchParams, name: string): string {
  const values = params.getAll(name)
  if (values.length !== 1 || !values[0]) throw new Error(`Invalid ${name} parameter`)
  return values[0]
}

function getInteger(params: URLSearchParams, name: string): number {
  const value = getRequiredParam(params, name)
  if (!/^(0|[1-9][0-9]*)$/.test(value)) throw new Error(`Invalid ${name} parameter`)

  const number = Number(value)
  if (!Number.isSafeInteger(number)) throw new Error(`Invalid ${name} parameter`)
  return number
}
