export type Session = {
  session: string
  expiry: string
  tileWidth: number
  tileHeight: number
  imageFormat: 'png' | 'jpeg'
}

export type Tile = {
  data: Uint8Array
  contentType: string
  width: number
  height: number
}
