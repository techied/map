import { useEffect } from 'react'
import { useMap } from '@vis.gl/react-google-maps'
import type { MaskTile } from '../shared/mask-tile.ts'
import { drawMasks } from './mask-canvas.ts'

type Props = {
  prompt: string
  onError?: (message: string) => void
}

const MAX_TILE_ZOOM = 19

type TileRequest = {
  controller: AbortController
  canvases: Map<HTMLCanvasElement, { x: number; y: number; scale: number }>
  tile?: MaskTile
}

export function SegmentationOverlay({ prompt, onError }: Props) {
  const map = useMap()

  useEffect(() => {
    if (!map || !prompt.trim()) return

    const requests = new globalThis.Map<Element, string>()
    const tiles = new globalThis.Map<string, TileRequest>()
    const queue: (() => Promise<void>)[] = []
    let active = 0
    const runNext = () => {
      while (active < 15 && queue.length) {
        const run = queue.shift()!
        active++
        void run().finally(() => {
          active--
          runNext()
        })
      }
    }
    const overlay: google.maps.MapType = {
      name: 'Segmentation masks',
      alt: 'Segmentation masks',
      minZoom: 0,
      maxZoom: 22,
      projection: null,
      radius: 6378137,
      tileSize: new google.maps.Size(256, 256),
      getTile(coord, zoom, ownerDocument) {
        const canvas = ownerDocument.createElement('canvas')
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
        canvas.width = canvas.height = Math.round(256 * pixelRatio)
        canvas.style.width = canvas.style.height = '256px'
        canvas.style.pointerEvents = 'none'
        // Apply opacity once, so overlapping masks don't become darker.
        canvas.style.opacity = '0.45'

        const count = 2 ** zoom
        if (coord.y < 0 || coord.y >= count) return canvas

        // The map can request repeated copies of the world across the date line.
        const x = ((coord.x % count) + count) % count
        // Beyond zoom 19, enlarge the matching region of the parent tile.
        const tileZoom = Math.min(zoom, MAX_TILE_ZOOM)
        const scale = 2 ** (zoom - tileZoom)
        const viewport = { x: x % scale, y: coord.y % scale, scale }
        const params = new URLSearchParams({
          x: String(Math.floor(x / scale)),
          y: String(Math.floor(coord.y / scale)),
          z: String(tileZoom),
          q: prompt,
        })
        const key = params.toString()
        requests.set(canvas, key)
        const existing = tiles.get(key)
        if (existing) {
          existing.canvases.set(canvas, viewport)
          if (existing.tile) drawMasks(canvas, existing.tile, viewport)
          return canvas
        }

        const controller = new AbortController()
        const request: TileRequest = {
          controller,
          canvases: new globalThis.Map([[canvas, viewport]]),
        }
        tiles.set(key, request)

        queue.push(async () => {
          if (controller.signal.aborted) return
          try {
            const response = await fetch(`/api/tile?${params}`, { signal: controller.signal })
            if (!response.ok) throw new Error(`Mask request failed: ${response.status}`)
            const tile: MaskTile = await response.json()
            if (!controller.signal.aborted) {
              request.tile = tile
              for (const [target, targetViewport] of request.canvases) {
                drawMasks(target, tile, targetViewport)
              }
            }
          } catch {
            if (!controller.signal.aborted) onError?.('Some masks could not be loaded. Try again.')
          }
        })
        runNext()

        return canvas
      },
      releaseTile(tile) {
        if (!tile) return
        const key = requests.get(tile)
        if (key === undefined) return
        const request = tiles.get(key)
        if (request) {
          request.canvases.delete(tile as HTMLCanvasElement)
          if (!request.canvases.size) {
            request.controller.abort()
            tiles.delete(key)
          }
        }
        requests.delete(tile)
      },
    }

    map.overlayMapTypes.push(overlay)
    return () => {
      for (const { controller } of tiles.values()) controller.abort()
      queue.length = 0
      requests.clear()
      tiles.clear()
      const index = map.overlayMapTypes.getArray().indexOf(overlay)
      if (index !== -1) map.overlayMapTypes.removeAt(index)
    }
  }, [map, prompt, onError])

  return null
}
