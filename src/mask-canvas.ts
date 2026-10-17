import { decodeMaskToRaster } from '@meta-sam/parser'
import type { MaskTile } from '../shared/mask-tile.ts'

export function drawMasks(
  canvas: HTMLCanvasElement,
  tile: MaskTile,
  viewport = { x: 0, y: 0, scale: 1 },
) {
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas rendering is unavailable')

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.imageSmoothingEnabled = false
  const scratch = canvas.ownerDocument.createElement('canvas')
  const scratchContext = scratch.getContext('2d')
  if (!scratchContext) throw new Error('Canvas rendering is unavailable')

  const scaleX = (canvas.width / tile.width) * viewport.scale
  const scaleY = (canvas.height / tile.height) * viewport.scale
  const offsetX = (viewport.x * tile.width) / viewport.scale
  const offsetY = (viewport.y * tile.height) / viewport.scale

  for (const { mask, bounds } of tile.masks) {
    const raster = decodeMaskToRaster(mask)
    scratch.width = mask.width
    scratch.height = mask.height
    const image = scratchContext.createImageData(mask.width, mask.height)

    for (let i = 0; i < raster.length; i++) {
      if (raster[i] === 0) continue
      image.data[i * 4] = 255
      image.data[i * 4 + 3] = 255
    }

    scratchContext.putImageData(image, 0, 0)
    context.drawImage(
      scratch,
      (bounds.left - offsetX) * scaleX,
      (bounds.top - offsetY) * scaleY,
      (bounds.right - bounds.left) * scaleX,
      (bounds.bottom - bounds.top) * scaleY,
    )
  }
}
