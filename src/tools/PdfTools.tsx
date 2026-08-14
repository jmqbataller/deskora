import { useState } from 'react'
import { PDFDocument, degrees } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import JSZip from 'jszip'
import FileDrop from '../components/FileDrop'
import Status from '../components/Status'
import { downloadBlob, formatBytes, safeBaseName } from '../lib'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

function Selected({ files }) {
  if (!files?.length) return null
  return <div className="file-list">{files.map((f,i)=><div className="file-row" key={`${f.name}-${i}`}><span>{f.name}</span><small>{formatBytes(f.size)}</small></div>)}</div>
}

export function PdfToImage(){
  const [file,setFile]=useState(null); const [format,setFormat]=useState('png'); const [scale,setScale]=useState(1.8); const [busy,setBusy]=useState(false); const [msg,setMsg]=useState('')
  async function run(){
    if(!file) return; setBusy(true); setMsg('Rendering PDF pages…')
    try{
      const pdf=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise; const zip=new JSZip();
      for(let n=1;n<=pdf.numPages;n++){
        const page=await pdf.getPage(n); const viewport=page.getViewport({scale:Number(scale)}); const canvas=document.createElement('canvas'); canvas.width=viewport.width; canvas.height=viewport.height
        await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise
        const mime=format==='jpg'?'image/jpeg':format==='webp'?'image/webp':'image/png'; const blob=await new Promise(r=>canvas.toBlob(r,mime,format==='png'?1:0.92)); zip.file(`page-${String(n).padStart(3,'0')}.${format}`,blob)
        setMsg(`Rendered page ${n} of ${pdf.numPages}…`)
      }
      const out=await zip.generateAsync({type:'blob'}); downloadBlob(out,`${safeBaseName(file.name)}-images.zip`); setMsg(`Done — ${pdf.numPages} page${pdf.numPages===1?'':'s'} exported.`)
    }catch(e){setMsg(`Could not process this PDF: ${e.message}`)} finally{setBusy(false)}
  }
  return <div className="stack">
    <FileDrop accept="application/pdf" onFiles={f=>setFile(f[0])}/>{file&&<Selected files={[file]}/>} 
    <div className="form-grid"><label>Format<select value={format} onChange={e=>setFormat(e.target.value)}><option value="png">PNG</option><option value="jpg">JPG</option><option value="webp">WebP</option></select></label><label>Resolution<select value={scale} onChange={e=>setScale(e.target.value)}><option value="1.2">Standard</option><option value="1.8">High</option><option value="2.5">Very high</option></select></label></div>
    <button className="primary" disabled={!file||busy} onClick={run}>{busy?'Processing…':'Convert & download ZIP'}</button><Status>{msg}</Status>
  </div>
}

export function ImagesToPdf(){
  const [files,setFiles]=useState([]); const [busy,setBusy]=useState(false); const [msg,setMsg]=useState(''); const [page,setPage]=useState('fit')
  async function run(){
    if(!files.length)return; setBusy(true); setMsg('Building PDF…')
    try{
      const pdf=await PDFDocument.create()
      for(const f of files){
        const bytes=await f.arrayBuffer(); let img
        if(f.type.includes('png')) img=await pdf.embedPng(bytes); else if(f.type.includes('jpeg')||f.type.includes('jpg')) img=await pdf.embedJpg(bytes); else {
          const bmp=await createImageBitmap(f); const c=document.createElement('canvas'); c.width=bmp.width;c.height=bmp.height;c.getContext('2d').drawImage(bmp,0,0); const jpg=await new Promise(r=>c.toBlob(r,'image/jpeg',0.94)); img=await pdf.embedJpg(await jpg.arrayBuffer())
        }
        let w=img.width,h=img.height
        if(page==='a4'){const maxW=555,maxH=802; const ratio=Math.min(maxW/w,maxH/h,1); w*=ratio;h*=ratio; const p=pdf.addPage([595,842]);p.drawImage(img,{x:(595-w)/2,y:(842-h)/2,width:w,height:h})}
        else {const p=pdf.addPage([w,h]); p.drawImage(img,{x:0,y:0,width:w,height:h})}
      }
      downloadBlob(new Blob([await pdf.save()],{type:'application/pdf'}),'deskora-images.pdf'); setMsg(`Done — ${files.length} image${files.length===1?'':'s'} combined.`)
    }catch(e){setMsg(e.message)}finally{setBusy(false)}
  }
  return <div className="stack"><FileDrop accept="image/*" multiple onFiles={setFiles}/><Selected files={files}/><label>Page sizing<select value={page} onChange={e=>setPage(e.target.value)}><option value="fit">Match each image</option><option value="a4">Center on A4</option></select></label><button className="primary" disabled={!files.length||busy} onClick={run}>{busy?'Creating…':'Create PDF'}</button><Status>{msg}</Status></div>
}

export function MergePdf(){
  const [files,setFiles]=useState([]),[busy,setBusy]=useState(false),[msg,setMsg]=useState('')
  async function run(){try{setBusy(true);const out=await PDFDocument.create();let pages=0;for(const f of files){const src=await PDFDocument.load(await f.arrayBuffer());const copied=await out.copyPages(src,src.getPageIndices());copied.forEach(p=>out.addPage(p));pages+=copied.length}downloadBlob(new Blob([await out.save()],{type:'application/pdf'}),'deskora-merged.pdf');setMsg(`Merged ${files.length} PDFs into ${pages} pages.`)}catch(e){setMsg(e.message)}finally{setBusy(false)}}
  return <div className="stack"><FileDrop accept="application/pdf" multiple onFiles={setFiles}/><Selected files={files}/><button className="primary" disabled={files.length<2||busy} onClick={run}>{busy?'Merging…':'Merge PDFs'}</button><Status>{msg}</Status></div>
}

function parseRanges(value,max){
  const out=new Set(); for(const part of value.split(',').map(s=>s.trim()).filter(Boolean)){if(part.includes('-')){let[a,b]=part.split('-').map(Number);if(a>b)[a,b]=[b,a];for(let i=a;i<=b;i++)if(i>=1&&i<=max)out.add(i-1)}else{const n=Number(part);if(n>=1&&n<=max)out.add(n-1)}} return [...out].sort((a,b)=>a-b)
}

export function SplitPdf(){
  const [file,setFile]=useState(null),[range,setRange]=useState('1'),[busy,setBusy]=useState(false),[msg,setMsg]=useState('')
  async function run(){try{setBusy(true);const src=await PDFDocument.load(await file.arrayBuffer());const ids=parseRanges(range,src.getPageCount());if(!ids.length)throw new Error('Enter a valid page or range, for example 1-3,5.');const out=await PDFDocument.create();(await out.copyPages(src,ids)).forEach(p=>out.addPage(p));downloadBlob(new Blob([await out.save()],{type:'application/pdf'}),`${safeBaseName(file.name)}-pages.pdf`);setMsg(`Exported ${ids.length} selected page${ids.length===1?'':'s'}.`)}catch(e){setMsg(e.message)}finally{setBusy(false)}}
  return <div className="stack"><FileDrop accept="application/pdf" onFiles={f=>setFile(f[0])}/>{file&&<Selected files={[file]}/>}<label>Pages<input value={range} onChange={e=>setRange(e.target.value)} placeholder="1-3,5,8"/><small>Use commas and ranges, e.g. 1-3,5.</small></label><button className="primary" disabled={!file||busy} onClick={run}>{busy?'Extracting…':'Extract selected pages'}</button><Status>{msg}</Status></div>
}

export function RotatePdf(){
  const [file,setFile]=useState(null),[angle,setAngle]=useState(90),[busy,setBusy]=useState(false),[msg,setMsg]=useState('')
  async function run(){try{setBusy(true);const pdf=await PDFDocument.load(await file.arrayBuffer());pdf.getPages().forEach(p=>p.setRotation(degrees((p.getRotation().angle+Number(angle))%360)));downloadBlob(new Blob([await pdf.save()],{type:'application/pdf'}),`${safeBaseName(file.name)}-rotated.pdf`);setMsg('Rotation applied to all pages.')}catch(e){setMsg(e.message)}finally{setBusy(false)}}
  return <div className="stack"><FileDrop accept="application/pdf" onFiles={f=>setFile(f[0])}/>{file&&<Selected files={[file]}/>}<label>Rotate<select value={angle} onChange={e=>setAngle(e.target.value)}><option value="90">90° clockwise</option><option value="180">180°</option><option value="270">270° clockwise</option></select></label><button className="primary" disabled={!file||busy} onClick={run}>{busy?'Rotating…':'Rotate PDF'}</button><Status>{msg}</Status></div>
}
