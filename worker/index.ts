import { getParams } from './params.ts'
import { getTile } from './tile.ts'
import { segmentImage } from './segment.ts'
import { recordsOfKind } from '@meta-sam/parser'
import type { MaskTile } from '../shared/mask-tile.ts'

export default {
  async fetch(request) {
    const url = new URL(request.url)

    if (url.pathname == '/api/tile') {
      try {
        const {
          coords: [x, y, zoom],
          prompt,
        } = getParams(url.searchParams)
        const tile = await getTile(x, y, zoom)
        const result = await segmentImage(prompt, tile)
        return Response.json(
          {
            width: tile.width,
            height: tile.height,
            masks: recordsOfKind(result.records, 'mask').map(({ mask, bounds }) => ({
              mask,
              bounds,
            })),
          } satisfies MaskTile,
          {
            headers: {
              'Cache-Control': 'public, max-age=86400',
            },
          },
        )
      } catch {
        return new Response(null, { status: 400 })
      }
    }
    return new Response(null, { status: 404 })
  },
} satisfies ExportedHandler<Env>
