import { mkdir, copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const src = resolve('node_modules/@ffmpeg/core/dist/esm')
const dest = resolve('public/ffmpeg')
await mkdir(dest, { recursive: true })
for (const file of ['ffmpeg-core.js', 'ffmpeg-core.wasm']) {
  await copyFile(resolve(src, file), resolve(dest, file))
}
console.log('Deskora: copied FFmpeg browser runtime.')
