import basex, { BaseConverter } from 'base-x'

const base58Codec: BaseConverter = basex(
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
)

export const base58 = {
  parse(text: string): Uint8Array {
    return base58Codec.decode(text)
  },
  parseUnsafe(text: string): Uint8Array | undefined {
    return base58Codec.decodeUnsafe(text)
  },
  stringify(data: Uint8Array | number[]): string {
    return base58Codec.encode(data)
  }
}
