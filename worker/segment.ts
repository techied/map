import type { Tile } from './types.ts'
import { OpenAI } from 'openai/client'
import { env } from 'cloudflare:workers'
import { formats, type ImageSegmentationResult } from '@meta-sam/parser'

const client = new OpenAI({
  baseURL: 'https://api.meta.ai/v1',
  apiKey: env.META_API_KEY,
})

export async function segmentImage(prompt: string, tile: Tile): Promise<ImageSegmentationResult> {
  const response = await client.responses.create({
    model: 'sam-3.1',
    input: [
      {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: prompt,
          },
          {
            type: 'input_image',
            image_url: getImageUri(tile),
            detail: 'auto',
          },
        ],
      },
    ],
  })
  if (response.status !== 'completed')
    throw new Error(`SAM response ended with status: ${response.status}`)
  const parser = formats.segmentation.image().createParser()
  parser.push(response.output_text, { emit: false })
  const { result } = parser.finish({ status: 'completed' })
  return result
}

function getImageUri(tile: Tile): string {
  const str = Buffer.from(tile.data).toString('base64')
  return `data:${tile.contentType};base64,` + str
}
