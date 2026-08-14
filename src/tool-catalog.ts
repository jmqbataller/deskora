import { categories, tools as baseTools } from './data-tools'
import { productivityTools } from './productivity-tools'
import { featurePackTools } from './feature-pack-tools'

const featuredOverrides = {
  'video-compressor': { name:'Video Compressor', desc:'Make video files smaller directly in your browser with quality and resolution controls.', badge:'Featured' },
  'video-trim': { name:'Video Trimmer', desc:'Cut the exact start and end of a video with a built-in playback preview.', badge:'Featured' },
  'video-speed': { name:'Video Playback Speed', desc:'Create slow-motion or fast-motion video with presets from 0.25× to 4×.', badge:'Featured' },
}

const enhancedBaseTools = baseTools.map(t => featuredOverrides[t.id] ? { ...t, ...featuredOverrides[t.id] } : t)
export { categories }
export const tools = [...enhancedBaseTools, ...productivityTools, ...featurePackTools]
export const toolMap = Object.fromEntries(tools.map(t => [t.id, t]))
export const featuredVideoIds = ['video-compressor','video-trim','video-speed']
