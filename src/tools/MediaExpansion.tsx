import { useRef, useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib'
import FileDrop from '../components/FileDrop'
import Status from '../components/Status'
import { downloadBlob, formatBytes, safeBaseName } from '../lib'

let ff
let mediaProgressHandler
let latestMediaLog=''
async function engine(onProgress){
  mediaProgressHandler=onProgress
  if(!ff){
    const instance=new FFmpeg()
    instance.on('progress',({progress})=>mediaProgressHandler?.(Math.max(0,Math.min(100,Math.round(progress*100)))))
    instance.on('log',({message})=>{if(message)latestMediaLog=message})
    try{await instance.load({coreURL:'/ffmpeg/ffmpeg-core.js',wasmURL:'/ffmpeg/ffmpeg-core.wasm'});ff=instance}catch(error){ff=null;throw error}
  }
  return ff
}
async function safeDelete(f,name){try{await f.deleteFile(name)}catch{}}
function mediaError(error,fallback='FFmpeg could not process this media file.'){if(error instanceof Error&&error.message)return error.message;if(typeof error==='string'&&error.trim())return error;if(latestMediaLog.trim())return latestMediaLog;return fallback}
async function runFfmpeg(file,args,out,onProgress,extra=[]){
  const f=await engine(onProgress),ext=(file.name.split('.').pop()||'mp4').toLowerCase(),input=`input-${Date.now()}.${ext}`
  latestMediaLog=''
  try{
    await f.writeFile(input,await fetchFile(file))
    for(const x of extra)await f.writeFile(x.name,await fetchFile(x.file))
    const finalArgs=args.map(x=>x==='$IN'?input:x),exitCode=await f.exec(finalArgs)
    if(exitCode!==0)throw new Error(latestMediaLog||`FFmpeg exited with code ${exitCode}`)
    const data=await f.readFile(out)
    if(typeof data==='string')throw new Error('FFmpeg returned text instead of a media file.')
    return new Blob([data.buffer])
  }finally{
    await safeDelete(f,input);await safeDelete(f,out);for(const x of extra)await safeDelete(f,x.name)
  }
}
async function mergeAudio(files,onProgress){
  const f=await engine(onProgress),names=[],out='deskora-audio-merged.mp3';latestMediaLog=''
  try{
    for(let i=0;i<files.length;i++){const ext=(files[i].name.split('.').pop()||'mp3').toLowerCase(),name=`merge-${Date.now()}-${i}.${ext}`;names.push(name);await f.writeFile(name,await fetchFile(files[i]))}
    const args=[];names.forEach(n=>args.push('-i',n));const inputs=names.map((_,i)=>`[${i}:a]`).join('');args.push('-filter_complex',`${inputs}concat=n=${names.length}:v=0:a=1[a]`,'-map','[a]','-codec:a','libmp3lame','-q:a','2',out)
    const exitCode=await f.exec(args);if(exitCode!==0)throw new Error(latestMediaLog||`FFmpeg exited with code ${exitCode}`)
    const data=await f.readFile(out);if(typeof data==='string')throw new Error('FFmpeg returned text instead of audio.');return new Blob([data.buffer],{type:'audio/mpeg'})
  }finally{for(const n of names)await safeDelete(f,n);await safeDelete(f,out)}
}

export function VideoSocialResize(){
 const[file,setFile]=useState(null),[ratio,setRatio]=useState('9:16'),[mode,setMode]=useState('fit'),[busy,setBusy]=useState(false),[progress,setProgress]=useState(0),[msg,setMsg]=useState('')
 async function run(){setBusy(true);try{const dims={'9:16':[1080,1920],'1:1':[1080,1080],'4:5':[1080,1350],'16:9':[1920,1080]}[ratio],f=mode==='fill'?`scale=${dims[0]}:${dims[1]}:force_original_aspect_ratio=increase,crop=${dims[0]}:${dims[1]}`:`scale=${dims[0]}:${dims[1]}:force_original_aspect_ratio=decrease,pad=${dims[0]}:${dims[1]}:(ow-iw)/2:(oh-ih)/2:black`;const out='deskora-social.mp4',blob=await runFfmpeg(file,['-i','$IN','-vf',f,'-c:v','libx264','-preset','veryfast','-crf','25','-c:a','aac','-movflags','+faststart',out],out,setProgress);downloadBlob(new Blob([blob],{type:'video/mp4'}),`${safeBaseName(file.name)}-${ratio.replace(':','x')}.mp4`);setMsg('Social-media video exported.')}catch(e){setMsg(mediaError(e))}finally{setBusy(false)}}
 return <div className="stack"><FileDrop accept="video/*" onFiles={f=>setFile(f[0])}/><div className="form-grid"><label>Format<select value={ratio} onChange={e=>setRatio(e.target.value)}><option value="9:16">TikTok / Reels / Story 9:16</option><option value="4:5">Instagram 4:5</option><option value="1:1">Square 1:1</option><option value="16:9">YouTube 16:9</option></select></label><label>Framing<select value={mode} onChange={e=>setMode(e.target.value)}><option value="fit">Fit with padding</option><option value="fill">Fill and crop</option></select></label></div>{busy&&<div className="progress"><span style={{width:`${progress}%`}}/></div>}<button className="primary" disabled={!file||busy} onClick={run}>{busy?`Processing ${progress}%`:'Resize video'}</button><Status>{msg}</Status></div>
}

export function VideoFrameExtractor(){
 const[file,setFile]=useState(null),[time,setTime]=useState(0),[preview,setPreview]=useState(''),[msg,setMsg]=useState(''),videoRef=useRef(null),canvasRef=useRef(null)
 function load(f){setFile(f);if(preview)URL.revokeObjectURL(preview);setPreview(URL.createObjectURL(f));setMsg('Move the video to the frame you want, then capture it.')}
 function capture(){const v=videoRef.current,c=canvasRef.current;if(!v?.videoWidth)return;c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);c.toBlob(b=>downloadBlob(b,`${safeBaseName(file.name)}-frame-${Math.round(v.currentTime*100)/100}.png`),'image/png');setMsg(`Captured frame at ${v.currentTime.toFixed(2)}s.`)}
 function seek(v){setTime(v);if(videoRef.current)videoRef.current.currentTime=Number(v)}
 return <div className="stack"><FileDrop accept="video/*" onFiles={f=>load(f[0])}/>{preview&&<><video className="media-preview" ref={videoRef} src={preview} controls onTimeUpdate={e=>setTime(e.currentTarget.currentTime)}/><label>Time (seconds)<input type="number" min="0" step="0.1" value={Number(time).toFixed(1)} onChange={e=>seek(e.target.value)}/></label><button className="primary" onClick={capture}>Capture current frame as PNG</button><canvas ref={canvasRef} className="sr-only"/></>}<Status>{msg}</Status></div>
}

export function GifMaker(){
 const[file,setFile]=useState(null),[start,setStart]=useState(0),[duration,setDuration]=useState(5),[width,setWidth]=useState(640),[busy,setBusy]=useState(false),[progress,setProgress]=useState(0),[msg,setMsg]=useState('')
 async function run(){setBusy(true);try{const out='deskora.gif',filter=`fps=12,scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,blob=await runFfmpeg(file,['-ss',String(start),'-t',String(duration),'-i','$IN','-filter_complex',filter,out],out,setProgress);downloadBlob(new Blob([blob],{type:'image/gif'}),`${safeBaseName(file.name)}.gif`);setMsg('GIF created.')}catch(e){setMsg(mediaError(e))}finally{setBusy(false)}}
 return <div className="stack"><FileDrop accept="video/*" onFiles={f=>setFile(f[0])}/><div className="form-grid three"><label>Start (sec)<input type="number" min="0" step=".1" value={start} onChange={e=>setStart(e.target.value)}/></label><label>Duration<input type="number" min=".5" max="20" step=".5" value={duration} onChange={e=>setDuration(e.target.value)}/></label><label>Width<input type="number" min="240" max="1080" value={width} onChange={e=>setWidth(e.target.value)}/></label></div>{busy&&<div className="progress"><span style={{width:`${progress}%`}}/></div>}<button className="primary" disabled={!file||busy} onClick={run}>Create GIF</button><Status>{msg}</Status></div>
}

export function AudioStudio(){
 const[files,setFiles]=useState([]),[mode,setMode]=useState('mp3'),[start,setStart]=useState(0),[end,setEnd]=useState(30),[speed,setSpeed]=useState(1),[volume,setVolume]=useState(1),[busy,setBusy]=useState(false),[progress,setProgress]=useState(0),[msg,setMsg]=useState('');const file=files[0]
 async function run(){setBusy(true);setProgress(0);try{let out,args,blob;if(mode==='merge'){if(files.length<2)throw new Error('Choose at least two audio files to merge.');blob=await mergeAudio(files,setProgress);out='deskora-audio-merged.mp3'}else{if(!file)throw new Error('Choose an audio or video file.');if(mode==='mp3'){out='deskora-audio.mp3';args=['-i','$IN','-codec:a','libmp3lame','-q:a','2',out]}else if(mode==='compress'){out='deskora-audio-small.mp3';args=['-i','$IN','-codec:a','libmp3lame','-b:a','96k',out]}else if(mode==='trim'){out='deskora-audio-trim.mp3';args=['-ss',String(start),'-to',String(end),'-i','$IN','-codec:a','libmp3lame','-q:a','2',out]}else if(mode==='speed'){out='deskora-audio-speed.mp3';args=['-i','$IN','-filter:a',`atempo=${speed}`,'-codec:a','libmp3lame','-q:a','2',out]}else if(mode==='volume'){out='deskora-audio-volume.mp3';args=['-i','$IN','-filter:a',`volume=${volume}`,'-codec:a','libmp3lame','-q:a','2',out]}else if(mode==='silence'){out='deskora-audio-no-silence.mp3';args=['-i','$IN','-filter:a','silenceremove=start_periods=1:start_duration=0.25:start_threshold=-40dB:stop_periods=-1:stop_duration=0.45:stop_threshold=-40dB','-codec:a','libmp3lame','-q:a','2',out]}else{out='deskora-audio-normalized.mp3';args=['-i','$IN','-filter:a','loudnorm','-codec:a','libmp3lame','-q:a','2',out]}blob=await runFfmpeg(file,args,out,setProgress)}downloadBlob(new Blob([blob],{type:'audio/mpeg'}),out);setMsg('Audio processed locally.')}catch(e){setMsg(mediaError(e))}finally{setBusy(false)}}
 return <div className="stack"><FileDrop accept="audio/*,video/*" multiple onFiles={setFiles} hint="Select multiple audio files when using Merge."/>{files.length>0&&<div className="file-list">{files.slice(0,12).map((f,i)=><div className="file-row" key={i}><span>{f.name}</span><small>{formatBytes(f.size)}</small></div>)}</div>}<label>Operation<select value={mode} onChange={e=>setMode(e.target.value)}><option value="mp3">Convert WAV / M4A / video to MP3</option><option value="compress">Compress to 96 kbps MP3</option><option value="trim">Trim</option><option value="merge">Merge audio files</option><option value="speed">Change speed</option><option value="volume">Change volume</option><option value="normalize">Normalize volume</option><option value="silence">Remove long silence</option></select></label>{mode==='trim'&&<div className="form-grid"><label>Start<input type="number" value={start} onChange={e=>setStart(e.target.value)}/></label><label>End<input type="number" value={end} onChange={e=>setEnd(e.target.value)}/></label></div>}{mode==='speed'&&<label>Speed<select value={speed} onChange={e=>setSpeed(e.target.value)}><option value=".5">0.5×</option><option value=".75">0.75×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label>}{mode==='volume'&&<label>Volume multiplier<input type="number" min="0" max="4" step=".1" value={volume} onChange={e=>setVolume(e.target.value)}/></label>}{busy&&<div className="progress"><span style={{width:`${progress}%`}}/></div>}<button className="primary" disabled={!files.length||busy} onClick={run}>Process audio</button><Status>{msg}</Status></div>
}

export function WatermarkCenter(){
 const[file,setFile]=useState(null),[logo,setLogo]=useState(null),[text,setText]=useState('CONFIDENTIAL'),[opacity,setOpacity]=useState(.24),[position,setPosition]=useState('center'),[busy,setBusy]=useState(false),[progress,setProgress]=useState(0),[msg,setMsg]=useState('')
 async function imageWatermark(){const url=URL.createObjectURL(file),im=await new Promise((r,j)=>{const x=new Image();x.onload=()=>r(x);x.onerror=j;x.src=url}),c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext('2d');x.drawImage(im,0,0);x.globalAlpha=Number(opacity);x.fillStyle='#111827';x.textAlign='center';x.textBaseline='middle';x.font=`bold ${Math.max(24,Math.round(c.width/16))}px sans-serif`;x.translate(c.width/2,c.height/2);x.rotate(-Math.PI/7);x.fillText(text,0,0);x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;URL.revokeObjectURL(url);c.toBlob(b=>downloadBlob(b,`${safeBaseName(file.name)}-watermarked.png`),'image/png')}
 async function pdfWatermark(){const pdf=await PDFDocument.load(await file.arrayBuffer()),font=await pdf.embedFont(StandardFonts.HelveticaBold);for(const p of pdf.getPages()){const{width,height}=p.getSize(),size=Math.max(24,Math.min(width,height)/12);p.drawText(text,{x:position==='center'?width*.25:35,y:position==='center'?height*.5:35,size,font,color:rgb(.1,.16,.25),opacity:Number(opacity),rotate:degrees(-25)})}downloadBlob(new Blob([await pdf.save()],{type:'application/pdf'}),`${safeBaseName(file.name)}-watermarked.pdf`)}
 async function videoWatermark(){if(!logo)throw new Error('Upload a PNG/JPG logo for video watermarking.');const out='deskora-watermarked.mp4',ext=(logo.name.split('.').pop()||'png').toLowerCase(),name=`watermark.${ext}`,coords=position==='center'?'(W-w)/2:(H-h)/2':'W-w-30:H-h-30',blob=await runFfmpeg(file,['-i','$IN','-i',name,'-filter_complex',`[1:v]format=rgba,colorchannelmixer=aa=${opacity}[wm];[0:v][wm]overlay=${coords}`,'-c:v','libx264','-preset','veryfast','-c:a','copy',out],out,setProgress,[{name,file:logo}]);downloadBlob(new Blob([blob],{type:'video/mp4'}),`${safeBaseName(file.name)}-watermarked.mp4`)}
 async function run(){setBusy(true);try{if(file.type==='application/pdf')await pdfWatermark();else if(file.type.startsWith('image/'))await imageWatermark();else if(file.type.startsWith('video/'))await videoWatermark();else throw new Error('Use an image, PDF, or video.');setMsg('Watermarked file exported.')}catch(e){setMsg(mediaError(e))}finally{setBusy(false)}}
 return <div className="stack"><FileDrop accept="image/*,video/*,application/pdf" onFiles={f=>setFile(f[0])}/><div className="form-grid"><label>Watermark text<input value={text} onChange={e=>setText(e.target.value)}/></label><label>Position<select value={position} onChange={e=>setPosition(e.target.value)}><option value="center">Center</option><option value="corner">Bottom/right</option></select></label></div><label>Opacity {Math.round(opacity*100)}%<input type="range" min=".08" max=".8" step=".02" value={opacity} onChange={e=>setOpacity(e.target.value)}/></label>{file?.type.startsWith('video/')&&<label>Logo image for video watermark<input type="file" accept="image/png,image/jpeg" onChange={e=>setLogo(e.target.files?.[0])}/><small>Video mode uses the uploaded logo; text is used for image/PDF mode.</small></label>}{busy&&<div className="progress"><span style={{width:`${progress}%`}}/></div>}<button className="primary" disabled={!file||busy} onClick={run}>Apply watermark</button><Status>{msg}</Status></div>
}
