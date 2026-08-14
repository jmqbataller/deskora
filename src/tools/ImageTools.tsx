import { useState } from 'react'
import JSZip from 'jszip'
import FileDrop from '../components/FileDrop'
import Status from '../components/Status'
import { downloadBlob, formatBytes, safeBaseName } from '../lib'

async function renderImage(file, {width, height, type='image/jpeg', quality=.9}={}){
  const img=await createImageBitmap(file)
  const w=Number(width)||img.width, h=Number(height)||Math.round(img.height*(w/img.width))
  const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h
  const ctx=canvas.getContext('2d'); if(type==='image/jpeg'){ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h)}
  ctx.drawImage(img,0,0,w,h); img.close?.()
  return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Image conversion failed.')),type,quality))
}

function Picked({file}){return file?<div className="file-row"><span>{file.name}</span><small>{formatBytes(file.size)}</small></div>:null}

export function ConvertImage(){
  const [file,setFile]=useState(null),[fmt,setFmt]=useState('image/png'),[quality,setQuality]=useState(.9),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false)
  async function run(){try{setBusy(true);const blob=await renderImage(file,{type:fmt,quality:Number(quality)});const ext=fmt==='image/png'?'png':fmt==='image/webp'?'webp':'jpg';downloadBlob(blob,`${safeBaseName(file.name)}.${ext}`);setMsg(`Converted to ${ext.toUpperCase()} • ${formatBytes(blob.size)}`)}catch(e){setMsg(e.message)}finally{setBusy(false)}}
  return <div className="stack"><FileDrop accept="image/*" onFiles={f=>setFile(f[0])}/><Picked file={file}/><div className="form-grid"><label>Output<select value={fmt} onChange={e=>setFmt(e.target.value)}><option value="image/png">PNG</option><option value="image/jpeg">JPG</option><option value="image/webp">WebP</option></select></label><label>Quality<input type="range" min="0.2" max="1" step="0.05" value={quality} onChange={e=>setQuality(e.target.value)}/><small>{Math.round(quality*100)}%</small></label></div><button className="primary" disabled={!file||busy} onClick={run}>{busy?'Converting…':'Convert image'}</button><Status>{msg}</Status></div>
}

export function CompressImage(){
  const [file,setFile]=useState(null),[quality,setQuality]=useState(.75),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false)
  async function run(){try{setBusy(true);const type=file.type==='image/png'?'image/webp':(file.type||'image/jpeg');const blob=await renderImage(file,{type,quality:Number(quality)});const ext=type==='image/webp'?'webp':'jpg';downloadBlob(blob,`${safeBaseName(file.name)}-compressed.${ext}`);const saved=Math.max(0,Math.round((1-blob.size/file.size)*100));setMsg(`Original ${formatBytes(file.size)} → ${formatBytes(blob.size)} (${saved}% smaller).`)}catch(e){setMsg(e.message)}finally{setBusy(false)}}
  return <div className="stack"><FileDrop accept="image/*" onFiles={f=>setFile(f[0])}/><Picked file={file}/><label>Compression quality<input type="range" min="0.2" max="0.95" step="0.05" value={quality} onChange={e=>setQuality(e.target.value)}/><small>{Math.round(quality*100)}%</small></label><button className="primary" disabled={!file||busy} onClick={run}>{busy?'Compressing…':'Compress image'}</button><Status>{msg}</Status></div>
}

export function ResizeImage(){
  const [file,setFile]=useState(null),[width,setWidth]=useState(1080),[height,setHeight]=useState(''),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false)
  async function run(){try{setBusy(true);const blob=await renderImage(file,{width,height,type:file.type==='image/png'?'image/png':'image/jpeg',quality:.92});const ext=file.type==='image/png'?'png':'jpg';downloadBlob(blob,`${safeBaseName(file.name)}-${width}x${height||'auto'}.${ext}`);setMsg(`Resized image downloaded • ${formatBytes(blob.size)}`)}catch(e){setMsg(e.message)}finally{setBusy(false)}}
  return <div className="stack"><FileDrop accept="image/*" onFiles={f=>setFile(f[0])}/><Picked file={file}/><div className="form-grid"><label>Width (px)<input type="number" min="1" value={width} onChange={e=>setWidth(e.target.value)}/></label><label>Height (px)<input type="number" min="1" value={height} placeholder="Auto" onChange={e=>setHeight(e.target.value)}/></label></div><button className="primary" disabled={!file||!width||busy} onClick={run}>{busy?'Resizing…':'Resize image'}</button><Status>{msg}</Status></div>
}

export function BatchImages(){
  const [files,setFiles]=useState([]),[fmt,setFmt]=useState('image/webp'),[quality,setQuality]=useState(.8),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false)
  async function run(){try{setBusy(true);const zip=new JSZip();let n=0;for(const f of files){const blob=await renderImage(f,{type:fmt,quality:Number(quality)});const ext=fmt==='image/webp'?'webp':fmt==='image/png'?'png':'jpg';zip.file(`${safeBaseName(f.name)}.${ext}`,blob);n++;setMsg(`Processed ${n} of ${files.length}…`)}downloadBlob(await zip.generateAsync({type:'blob'}),'deskora-images.zip');setMsg(`Done — ${files.length} images packed into one ZIP.`)}catch(e){setMsg(e.message)}finally{setBusy(false)}}
  return <div className="stack"><FileDrop accept="image/*" multiple onFiles={setFiles}/>{files.length>0&&<div className="status info">{files.length} image{files.length===1?'':'s'} selected • {formatBytes(files.reduce((a,f)=>a+f.size,0))}</div>}<div className="form-grid"><label>Output<select value={fmt} onChange={e=>setFmt(e.target.value)}><option value="image/webp">WebP</option><option value="image/jpeg">JPG</option><option value="image/png">PNG</option></select></label><label>Quality<input type="range" min="0.2" max="1" step="0.05" value={quality} onChange={e=>setQuality(e.target.value)}/><small>{Math.round(quality*100)}%</small></label></div><button className="primary" disabled={!files.length||busy} onClick={run}>{busy?'Processing…':'Convert batch & download ZIP'}</button><Status>{msg}</Status></div>
}
