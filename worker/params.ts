type Params = {
  coords: number[]
  prompt: string
}

export function getParams(params: URLSearchParams): Params {
  const [x, y, z, q] = ['x', 'y', 'z', 'q'].map((p) => params.get(p))
  if (!x || !y || !z || !q) throw new Error('Invalid params')
  return { coords: [parseInt(x), parseInt(y), parseInt(z)], prompt: q }
}
