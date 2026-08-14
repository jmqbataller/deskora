import { useRef, useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import FileDrop from '../components/FileDrop'
import Status from '../components/Status'
import { downloadBlob, formatBytes, safeBaseName } from '../lib'

let ffmpegInstance
async function getFFmpeg(onProgress){
  if(!ffmpegInstance){
    ffmpegInstance=new FFmpeg()
    ffmpegInstance.on('progress',({progress})=>onProgress?.(Math.max(0,Math.min(100,Math.round(progress*100)))))
    await ffmpegInstance.load({coreURL:'/ffmpeg/ffmpeg-core.js',wasmURL:'/ffmpeg/ffmpeg-core.wasm'})
  }
  return ffmpegInstance
}

function VideoBase({mode}){
  const [file,setFile]=useState(null),[busy,setBusy]=useState(false),[msg,setMsg]=useState(''),[progress,setProgress]=useState(0)
  const [quality,setQuality]=useState('30'),[speed,setSpeed]=useState('1.5'),[start,setStart]=useState('0'),[end,setEnd]=useState('10')
  const runId=useRef(0)
  async function run(){
    if(!file)return; const id=++runId.current; setBusy(true); setProgress(0); setMsg('Loading video engine…')
    try{
      const ffmpeg=await getFFmpeg(p=>{if(id===runId.current)setProgress(p)})
      const ext=(file.name.split('.').pop()||'mp4').toLowerCase(); const input=`input-${Date.now()}.${ext}`
      await ffmpeg.writeFile(input,await fetchFile(file)); let output='deskora-output.mp4'; let args=[]
      if(mode==='compress'){
        output='deskora-compressed.mp4'; args=['-i',input,'-c:v','libx264','-preset','veryfast','-crf',String(quality),'-c:a','aac','-b:a','128k','-movflags','+faststart',output]
      } else if(mode==='speed'){
        const s=Number(speed); output=`${safeBaseName(file.name)}-${s}x.mp4`; args=['-i',input,'-filter_complex',`[0:v]setpts=PTS/${s}[v];[0:a]atempo=${s}[a]`,'-map','[v]','-map','[a]','-c:v','libx264','-c:a','aac','-movflags','+faststart',output]
      } else if(mode==='trim'){
        output=`${safeBaseName(file.name)}-trimmed.mp4`; args=['-ss',String(start),'-to',String(end),'-i',input,'-c:v','libx264','-preset','veryfast','-c:a','aac','-movflags','+faststart',output]
      } else {
        output=`${safeBaseName(file.name)}.mp3`; args=['-i',input,'-vn','-codec:a','libmp3lame','-q:a','2',output]
      }
      setMsg('Processing locally. Keep this tab open…'); await ffmpeg.exec(args)
      const data=await ffmpeg.readFile(output); const mime=output.endsWith('.mp3')?'audio/mpeg':'video/mp4'; const blob=new Blob([data.buffer],{type:mime}); downloadBlob(blob,output)
      await ffmpeg.deleteFile(input).catch(()=>{}); await ffmpeg.deleteFile(output).catch(()=>{})
      setProgress(100); setMsg(mode==='compress'?`Done — ${formatBytes(file.size)} → ${formatBytes(blob.size)}.`:'Done — your processed file is ready.')
    }catch(e){setMsg(`Video processing failed: ${e.message}`)} finally{setBusy(false)}
  }
  return <div className="stack">
    <FileDrop accept="video/*" onFiles={f=>setFile(f[0])} hint="Large videos use your device CPU and memory; nothing is uploaded."/>
    {file&&<div className="file-row"><span>{file.name}</span><small>{formatBytes(file.size)}</small></div>}
    {mode==='compress'&&<label>Compression level<select value={quality} onChange={e=>setQuality(e.target.value)}><option value="24">High quality</option><option value="30">Balanced</option><option value="35">Small file</option></select></label>}
    {mode==='speed'&&<label>Playback speed<select value={speed} onChange={e=>setSpeed(e.target.value)}><option value="0.5">0.5× slow</option><option value="0.75">0.75× slow</option><option value="1.25">1.25× fast</option><option value="1.5">1.5× fast</option><option value="2">2× fast</option></select></label>}
    {mode==='trim'&&<div className="form-grid"><label>Start (seconds)<input type="number" min="0" step="0.1" value={start} onChange={e=>setStart(e.target.value)}/></label><label>End (seconds)<input type="number" min="0" step="0.1" value={end} onChange={e=>setEnd(e.target.value)}/></label></div>}
    {busy&&<div className="progress"><span style={{width:`${progress}%`}}/></div>}
    <button className="primary" disabled={!file||busy} onClick={run}>{busy?`Processing ${progress}%`:mode==='compress'?'Compress video':mode==='speed'?'Change speed':mode==='trim'?'Trim video':'Extract MP3'}</button>
    <Status>{msg}</Status>
  </div>
}

export const VideoCompressor=()=> <VideoBase mode="compress"/>
export const VideoSpeed=()=> <VideoBase mode="speed"/>
export const VideoTrim=()=> <VideoBase mode="trim"/>
export const VideoAudio=()=> <VideoBase mode="audio"/>
