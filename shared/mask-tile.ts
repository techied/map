import type { SegmentationMaskRecord } from '@meta-sam/parser'

export type MaskTile = {
  width: number
  height: number
  masks: Pick<SegmentationMaskRecord, 'mask' | 'bounds'>[]
}
