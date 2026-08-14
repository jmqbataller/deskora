import { useEffect, useMemo, useRef, useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import FileDrop from '../components/FileDrop'
import Status from '../components/Status'
import { downloadBlob, formatBytes, safeBaseName } from '../lib'

let ffmpegInstance
let currentProgressHandler
let latestFFmpegLog = ''

async function getFFmpeg(onProgress){
  currentProgressHandler=onProgress
  if(!ffmpegInstance){
    const instance=new FFmpeg()
    instance.on('progress',({progress})=>currentProgressHandler?.(Math.max(0,Math.min(100,Math.round(progress*100)))))
    instance.on('log',({message})=>{if(message)latestFFmpegLog=message})
    try{
      await instance.load({coreURL:'/ffmpeg/ffmpeg-core.js',wasmURL:'/ffmpeg/ffmpeg-core.wasm'})
      ffmpegInstance=instance
    }catch(error){
      ffmpegInstance=null
      throw error
    }
  }
  return ffmpegInstance
}

function atempoChain(value){
  let n=Number(value),parts=[]
  while(n<.5){parts.push(.5);n/=.5}
  while(n>2){parts.push(2);n/=2}
  parts.push(Number(n.toFixed(4)))
  return parts.map(v=>`atempo=${v}`).join(',')
}

async function safeDelete(ffmpeg,path){
  try{await ffmpeg.deleteFile(path)}catch{}
}

function ffmpegError(error,fallback='FFmpeg could not process this video.'){
  if(error instanceof Error&&error.message)return error.message
  if(typeof error==='string'&&error.trim())return error
  if(latestFFmpegLog&&latestFFmpegLog.trim())return latestFFmpegLog
  return fallback
}

function VideoPreview({file,onDuration}){
  const url=useMemo(()=>file?URL.createObjectURL(file):'', [file])
  useEffect(()=>()=>{if(url)URL.revokeObjectURL(url)},[url])
  if(!file)return null
  return <div className="video-preview-panel"><video src={url} controls preload="metadata" onLoadedMetadata={e=>onDuration?.(e.currentTarget.duration)}/><div className="video-preview-meta"><strong>{file.name}</strong><span>{formatBytes(file.size)}</span></div></div>
}

function VideoBase({mode}){
  const [file,setFile]=useState(null),[busy,setBusy]=useState(false),[msg,setMsg]=useState(''),[progress,setProgress]=useState(0),[duration,setDuration]=useState(0)
  const [quality,setQuality]=useState('30'),[speed,setSpeed]=useState('1.5'),[customSpeed,setCustomSpeed]=useState('1.5'),[start,setStart]=useState('0'),[end,setEnd]=useState('10')
  const runId=useRef(0)
  const chosenSpeed=speed==='custom'?Math.max(.25,Math.min(4,Number(customSpeed)||1)):Number(speed)
  function choose(f){setFile(f);setMsg('');setProgress(0);setDuration(0)}
  function gotDuration(d){if(!Number.isFinite(d))return;setDuration(d);if(mode==='trim'){setStart('0');setEnd(String(Math.min(d,10).toFixed(2)))}}
  async function run(){
    if(!file)return
    if(mode==='trim'&&(Number(end)<=Number(start)||Number(start)<0)){setMsg('End time must be greater than start time.');return}
    const id=++runId.current;setBusy(true);setProgress(0);setMsg('Loading video engine…');latestFFmpegLog=''
    let ffmpeg,input='',output=''
    try{
      ffmpeg=await getFFmpeg(p=>{if(id===runId.current)setProgress(p)})
      const ext=(file.name.split('.').pop()||'mp4').toLowerCase()
      input=`input-${Date.now()}.${ext}`
      await ffmpeg.writeFile(input,await fetchFile(file))
      output='deskora-output.mp4'
      let args=[]

      if(mode==='compress'){
        output=`${safeBaseName(file.name)}-compressed.mp4`
        args=['-i',input,'-c:v','libx264','-preset','veryfast','-crf',String(quality),'-c:a','aac','-b:a','128k','-movflags','+faststart',output]
      }else if(mode==='speed'){
        const s=chosenSpeed
        output=`${safeBaseName(file.name)}-${s}x.mp4`
        const withAudio=['-i',input,'-filter_complex',`[0:v:0]setpts=PTS/${s}[v];[0:a:0]${atempoChain(s)}[a]`,'-map','[v]','-map','[a]','-c:v','libx264','-preset','veryfast','-c:a','aac','-movflags','+faststart',output]
        setMsg('Adjusting video and audio speed locally…')
        let exitCode=await ffmpeg.exec(withAudio)

        if(exitCode!==0){
          await safeDelete(ffmpeg,output)
          latestFFmpegLog=''
          setProgress(0)
          setMsg('No compatible audio stream found. Retrying the video without audio…')
          const videoOnly=['-i',input,'-vf',`setpts=PTS/${s}`,'-map','0:v:0','-an','-c:v','libx264','-preset','veryfast','-movflags','+faststart',output]
          exitCode=await ffmpeg.exec(videoOnly)
        }

        if(exitCode!==0)throw new Error(latestFFmpegLog||`FFmpeg exited with code ${exitCode}`)
        args=null
      }else if(mode==='trim'){
        output=`${safeBaseName(file.name)}-trimmed.mp4`
        args=['-ss',String(start),'-to',String(end),'-i',input,'-c:v','libx264','-preset','veryfast','-c:a','aac','-movflags','+faststart',output]
      }else{
        output=`${safeBaseName(file.name)}.mp3`
        args=['-i',input,'-vn','-codec:a','libmp3lame','-q:a','2',output]
      }

      if(args){
        setMsg('Processing locally. Keep this tab open…')
        const exitCode=await ffmpeg.exec(args)
        if(exitCode!==0)throw new Error(latestFFmpegLog||`FFmpeg exited with code ${exitCode}`)
      }

      const data=await ffmpeg.readFile(output)
      if(typeof data==='string')throw new Error('FFmpeg returned an unexpected text output instead of a media file.')
      const mime=output.endsWith('.mp3')?'audio/mpeg':'video/mp4'
      const blob=new Blob([data.buffer],{type:mime})
      downloadBlob(blob,output)
      setProgress(100)
      setMsg(mode==='compress'?`Done — ${formatBytes(file.size)} → ${formatBytes(blob.size)} (${Math.max(0,Math.round((1-blob.size/file.size)*100))}% smaller).`:mode==='speed'?`Done — created a ${chosenSpeed}× speed-adjusted video.`:'Done — your processed file is ready.')
    }catch(error){
      setMsg(`Video processing failed: ${ffmpegError(error)}`)
    }finally{
      if(ffmpeg){
        if(input)await safeDelete(ffmpeg,input)
        if(output)await safeDelete(ffmpeg,output)
      }
      setBusy(false)
    }
  }
  return <div className="stack featured-video-workspace">
    <div className="featured-tool-callout"><strong>{mode==='compress'?'Make videos easier to send and upload.':mode==='trim'?'Keep only the part you need.':mode==='speed'?'Slow down or speed up the final video.':'Extract clean audio from video.'}</strong><span>Processing runs locally with Deskora's browser FFmpeg engine.</span></div>
    <FileDrop accept="video/*" onFiles={f=>choose(f[0])} hint="Large videos use your device CPU and memory; nothing is uploaded."/>
    <VideoPreview file={file} onDuration={gotDuration}/>
    {duration>0&&<div className="metric-grid video-metrics"><div><strong>{duration.toFixed(1)}s</strong><span>Duration</span></div><div><strong>{file?formatBytes(file.size):'—'}</strong><span>Original size</span></div>{mode==='speed'&&<div><strong>{chosenSpeed}×</strong><span>Output speed</span></div>}{mode==='trim'&&<div><strong>{Math.max(0,Number(end)-Number(start)).toFixed(1)}s</strong><span>Trimmed length</span></div>}</div>}
    {mode==='compress'&&<label>Compression level<select value={quality} onChange={e=>setQuality(e.target.value)}><option value="22">Best quality / larger</option><option value="26">High quality</option><option value="30">Balanced</option><option value="35">Small file</option><option value="39">Maximum compression</option></select><small>Higher compression can reduce visual quality. Balanced is a good starting point.</small></label>}
    {mode==='speed'&&<><label>Playback speed<select value={speed} onChange={e=>setSpeed(e.target.value)}><option value="0.25">0.25× extra slow</option><option value="0.5">0.5× slow</option><option value="0.75">0.75× slow</option><option value="1.25">1.25× fast</option><option value="1.5">1.5× fast</option><option value="2">2× fast</option><option value="3">3× fast</option><option value="4">4× fast</option><option value="custom">Custom 0.25×–4×</option></select></label>{speed==='custom'&&<label>Custom speed<input type="number" min="0.25" max="4" step="0.05" value={customSpeed} onChange={e=>setCustomSpeed(e.target.value)}/></label>}</>}
    {mode==='trim'&&<><div className="form-grid"><label>Start (seconds)<input type="number" min="0" max={duration||undefined} step="0.1" value={start} onChange={e=>setStart(e.target.value)}/></label><label>End (seconds)<input type="number" min="0" max={duration||undefined} step="0.1" value={end} onChange={e=>setEnd(e.target.value)}/></label></div>{duration>0&&<><label>Start position<input type="range" min="0" max={duration} step="0.1" value={Math.min(Number(start),duration)} onChange={e=>setStart(e.target.value)}/></label><label>End position<input type="range" min="0" max={duration} step="0.1" value={Math.min(Number(end),duration)} onChange={e=>setEnd(e.target.value)}/></label></>}</>}
    {busy&&<div className="progress"><span style={{width:`${progress}%`}}/></div>}
    <button className="primary featured-video-action" disabled={!file||busy} onClick={run}>{busy?`Processing ${progress}%`:mode==='compress'?'Compress video':mode==='speed'?'Create speed-adjusted video':mode==='trim'?'Trim video':'Extract MP3'}</button>
    <Status>{msg}</Status>
  </div>
}

export const VideoCompressor=()=> <VideoBase mode="compress"/>
export const VideoSpeed=()=> <VideoBase mode="speed"/>
export const VideoTrim=()=> <VideoBase mode="trim"/>
export const VideoAudio=()=> <VideoBase mode="audio"/>
