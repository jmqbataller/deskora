import { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff, Download, FilePlus2, ImagePlus, PenLine, RefreshCw, RotateCw, ScanLine, Trash2, Undo2, WandSparkles } from 'lucide-react'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import Status from '../components/Status'
import { downloadBlob, safeBaseName } from '../lib'
import './extras.css'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const clamp=(v,min,max)=>Math.max(min,Math.min(max,v))
const blobFromCanvas=(canvas,type='image/jpeg',quality=.94)=>new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Could not create output image.')),type,quality))
const loadImage=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Could not load image.'));img.src=src})

function scanFilter(mode,brightness,contrast){
  const b=Number(brightness)/100,c=Number(contrast)/100
  if(mode==='enhanced')return `brightness(${Math.max(b,1.04)}) contrast(${Math.max(c,1.24)}) saturate(.96)`
  if(mode==='gray')return `grayscale(1) brightness(${b}) contrast(${Math.max(c,1.16)})`
  if(mode==='bw')return `grayscale(1) brightness(${Math.max(b,1.05)}) contrast(${Math.max(c,1.3)})`
  return `brightness(${b}) contrast(${c})`
}

async function makeScanCanvas(src,{crop,rotation,deskew,mode,brightness,contrast},previewMax=0){
  const img=await loadImage(src)
  const sx=Math.round(img.naturalWidth*crop.left/100),sy=Math.round(img.naturalHeight*crop.top/100)
  const sw=Math.max(20,Math.round(img.naturalWidth*(1-(crop.left+crop.right)/100)))
  const sh=Math.max(20,Math.round(img.naturalHeight*(1-(crop.top+crop.bottom)/100)))
  const scale=previewMax?Math.min(1,previewMax/Math.max(sw,sh)):1,w=Math.max(1,Math.round(sw*scale)),h=Math.max(1,Math.round(sh*scale))
  const angle=(Number(rotation)+Number(deskew))*Math.PI/180,cos=Math.abs(Math.cos(angle)),sin=Math.abs(Math.sin(angle))
  const out=document.createElement('canvas');out.width=Math.max(1,Math.ceil(w*cos+h*sin));out.height=Math.max(1,Math.ceil(w*sin+h*cos))
  const ctx=out.getContext('2d',{willReadFrequently:mode==='bw'});ctx.fillStyle='#fff';ctx.fillRect(0,0,out.width,out.height);ctx.translate(out.width/2,out.height/2);ctx.rotate(angle);ctx.filter=scanFilter(mode,brightness,contrast);ctx.drawImage(img,sx,sy,sw,sh,-w/2,-h/2,w,h);ctx.setTransform(1,0,0,1,0,0);ctx.filter='none'
  if(mode==='bw'){
    const data=ctx.getImageData(0,0,out.width,out.height),p=data.data
    for(let i=0;i<p.length;i+=4){const gray=.299*p[i]+.587*p[i+1]+.114*p[i+2],v=gray>176?255:0;p[i]=p[i+1]=p[i+2]=v}
    ctx.putImageData(data,0,0)
  }
  return out
}

async function autoDetectCrop(src){
  const img=await loadImage(src),scale=Math.min(1,650/Math.max(img.naturalWidth,img.naturalHeight)),w=Math.max(1,Math.round(img.naturalWidth*scale)),h=Math.max(1,Math.round(img.naturalHeight*scale))
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);const {data}=ctx.getImageData(0,0,w,h)
  const patch=Math.max(5,Math.round(Math.min(w,h)*.05));let rr=0,gg=0,bb=0,n=0
  for(const [x0,y0] of [[0,0],[w-patch,0],[0,h-patch],[w-patch,h-patch]])for(let y=y0;y<y0+patch;y+=2)for(let x=x0;x<x0+patch;x+=2){const i=(y*w+x)*4;rr+=data[i];gg+=data[i+1];bb+=data[i+2];n++}
  const bg=[rr/n,gg/n,bb/n],xs=[],ys=[]
  for(let y=0;y<h;y+=3)for(let x=0;x<w;x+=3){const i=(y*w+x)*4,d=Math.abs(data[i]-bg[0])+Math.abs(data[i+1]-bg[1])+Math.abs(data[i+2]-bg[2]);if(d>92){xs.push(x);ys.push(y)}}
  if(xs.length<w*h*.008)return null
  xs.sort((a,b)=>a-b);ys.sort((a,b)=>a-b);const lo=Math.floor(xs.length*.04),hi=Math.floor(xs.length*.96),left=xs[lo],right=xs[Math.min(xs.length-1,hi)],top=ys[lo],bottom=ys[Math.min(ys.length-1,hi)]
  if(right-left<w*.28||bottom-top<h*.28)return null
  return {left:clamp(left/w*100-1.5,0,35),right:clamp((w-right)/w*100-1.5,0,35),top:clamp(top/h*100-1.5,0,35),bottom:clamp((h-bottom)/h*100-1.5,0,35)}
}

export function CameraScanner(){
  const videoRef=useRef(null),previewRef=useRef(null),streamRef=useRef(null),fileRef=useRef(null)
  const [cameraOn,setCameraOn]=useState(false),[source,setSource]=useState(''),[pages,setPages]=useState([]),[busy,setBusy]=useState(false),[msg,setMsg]=useState('')
  const [mode,setMode]=useState('enhanced'),[brightness,setBrightness]=useState(106),[contrast,setContrast]=useState(128),[rotation,setRotation]=useState(0),[deskew,setDeskew]=useState(0),[crop,setCrop]=useState({left:0,right:0,top:0,bottom:0})
  const opts={crop,rotation,deskew,mode,brightness,contrast}

  function stopCamera(){streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;setCameraOn(false)}
  useEffect(()=>()=>stopCamera(),[])
  useEffect(()=>{let dead=false;if(!source)return;makeScanCanvas(source,opts,1200).then(c=>{if(dead||!previewRef.current)return;previewRef.current.width=c.width;previewRef.current.height=c.height;previewRef.current.getContext('2d').drawImage(c,0,0)}).catch(e=>!dead&&setMsg(e.message));return()=>{dead=true}},[source,crop.left,crop.right,crop.top,crop.bottom,rotation,deskew,mode,brightness,contrast])

  async function startCamera(){setMsg('');try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera access is not supported here. Use Upload photo instead.');stopCamera();const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:2560},height:{ideal:1440}}});streamRef.current=stream;setCameraOn(true);setTimeout(async()=>{if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play()}},0);setMsg('Camera ready. Keep the paper flat and fill most of the frame.')}catch(e){setMsg(`Camera could not start: ${e.message}`)}}
  async function loadSource(url){setSource(url);setCrop({left:0,right:0,top:0,bottom:0});setRotation(0);setDeskew(0);setBusy(true);setMsg('Detecting document edges…');try{const found=await autoDetectCrop(url);if(found){setCrop(found);setMsg('Document detected and cropped. Fine-tune the edges if needed.')}else setMsg('Document loaded. Adjust the crop sliders if the paper edges are not clean.')}catch(e){setMsg(e.message)}finally{setBusy(false)}}
  async function capture(){const v=videoRef.current;if(!v?.videoWidth)return setMsg('Camera is still starting.');const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);const url=URL.createObjectURL(await blobFromCanvas(c,'image/jpeg',.98));stopCamera();await loadSource(url)}
  async function choose(file){if(!file)return;stopCamera();await loadSource(URL.createObjectURL(file))}
  async function addPage(){if(!source)return;setBusy(true);try{const c=await makeScanCanvas(source,opts),blob=await blobFromCanvas(c,'image/jpeg',.95),url=URL.createObjectURL(blob);setPages(p=>[...p,{blob,url}]);setMsg(`Scanned page added. ${pages.length+1} page${pages.length?'s':''} ready.`)}catch(e){setMsg(e.message)}finally{setBusy(false)}}
  async function downloadImage(type){if(!source)return;setBusy(true);try{const c=await makeScanCanvas(source,opts),blob=await blobFromCanvas(c,type==='png'?'image/png':'image/jpeg',.96);downloadBlob(blob,`deskora-scan.${type}`);setMsg('Scanned image downloaded.')}catch(e){setMsg(e.message)}finally{setBusy(false)}}
  async function exportPdf(){if(!pages.length)return;setBusy(true);setMsg('Building scanned PDF…');try{const pdf=await PDFDocument.create();for(const item of pages){const img=await pdf.embedJpg(await item.blob.arrayBuffer()),portrait=img.height>=img.width,pageW=portrait?595:842,pageH=portrait?842:595,margin=24,scale=Math.min((pageW-margin*2)/img.width,(pageH-margin*2)/img.height),w=img.width*scale,h=img.height*scale,p=pdf.addPage([pageW,pageH]);p.drawImage(img,{x:(pageW-w)/2,y:(pageH-h)/2,width:w,height:h})}downloadBlob(new Blob([await pdf.save()],{type:'application/pdf'}),'deskora-scanned-document.pdf');setMsg(`PDF exported with ${pages.length} scanned page${pages.length===1?'':'s'}.`)}catch(e){setMsg(e.message)}finally{setBusy(false)}}
  const edge=(k,v)=>setCrop(c=>({...c,[k]:Number(v)}))

  return <div className="stack scanner-tool">
    <div className="button-row scanner-top-actions"><button className="primary" onClick={cameraOn?stopCamera:startCamera}>{cameraOn?<><CameraOff size={17}/> Stop camera</>:<><Camera size={17}/> Open camera</>}</button><button className="secondary" onClick={()=>fileRef.current?.click()}><ImagePlus size={17}/> Upload photo</button><input ref={fileRef} className="sr-only" type="file" accept="image/*" capture="environment" onChange={e=>choose(e.target.files?.[0])}/></div>
    {cameraOn&&<div className="camera-stage"><video ref={videoRef} playsInline muted/><div className="camera-guide"><span>Align document inside frame</span></div><button className="capture-button" onClick={capture} aria-label="Capture document"><Camera size={25}/></button></div>}
    {source&&<>
      <div className="scan-preview-card"><div className="scan-preview-head"><strong><ScanLine size={17}/> Scan preview</strong><small>Processed locally</small></div><div className="scan-canvas-wrap"><canvas ref={previewRef}/></div></div>
      <div className="form-grid three"><label>Scan mode<select value={mode} onChange={e=>setMode(e.target.value)}><option value="enhanced">Enhanced color</option><option value="gray">Grayscale</option><option value="bw">Black & white</option><option value="original">Original color</option></select></label><label>Brightness <span>{brightness}%</span><input type="range" min="75" max="135" value={brightness} onChange={e=>setBrightness(e.target.value)}/></label><label>Contrast <span>{contrast}%</span><input type="range" min="85" max="180" value={contrast} onChange={e=>setContrast(e.target.value)}/></label></div>
      <div className="form-grid three"><label>Deskew <span>{deskew}°</span><input type="range" min="-6" max="6" step="0.25" value={deskew} onChange={e=>setDeskew(e.target.value)}/></label><label>Top crop <span>{Math.round(crop.top)}%</span><input type="range" min="0" max="35" value={crop.top} onChange={e=>edge('top',e.target.value)}/></label><label>Bottom crop <span>{Math.round(crop.bottom)}%</span><input type="range" min="0" max="35" value={crop.bottom} onChange={e=>edge('bottom',e.target.value)}/></label><label>Left crop <span>{Math.round(crop.left)}%</span><input type="range" min="0" max="35" value={crop.left} onChange={e=>edge('left',e.target.value)}/></label><label>Right crop <span>{Math.round(crop.right)}%</span><input type="range" min="0" max="35" value={crop.right} onChange={e=>edge('right',e.target.value)}/></label></div>
      <div className="button-row"><button className="secondary" onClick={()=>autoDetectCrop(source).then(v=>v&&setCrop(v))}><WandSparkles size={16}/> Auto crop</button><button className="secondary" onClick={()=>setRotation(v=>(v+90)%360)}><RotateCw size={16}/> Rotate</button><button className="secondary" onClick={()=>{setCrop({left:0,right:0,top:0,bottom:0});setDeskew(0)}}><RefreshCw size={16}/> Reset crop</button></div>
      <div className="button-row"><button className="primary" disabled={busy} onClick={addPage}><FilePlus2 size={17}/> Add scanned page</button><button className="secondary" disabled={busy} onClick={()=>downloadImage('jpg')}><Download size={16}/> JPG</button><button className="secondary" disabled={busy} onClick={()=>downloadImage('png')}><Download size={16}/> PNG</button></div>
    </>}
    {pages.length>0&&<div className="scan-pages"><div className="scan-pages-head"><strong>{pages.length} page{pages.length===1?'':'s'} in document</strong><button className="mini danger" onClick={()=>{pages.forEach(p=>URL.revokeObjectURL(p.url));setPages([])}}><Trash2 size={13}/> Clear</button></div><div className="scan-page-grid">{pages.map((p,i)=><div className="scan-page" key={p.url}><img src={p.url} alt={`Scanned page ${i+1}`}/><span>Page {i+1}</span><button className="mini danger" onClick={()=>setPages(list=>list.filter((_,n)=>n!==i))}><Trash2 size={12}/></button></div>)}</div><button className="primary" disabled={busy} onClick={exportPdf}><Download size={17}/> Download scanned PDF</button></div>}
    <Status>{msg}</Status>
  </div>
}

function hexRgb(hex){const clean=hex.replace('#','');const n=parseInt(clean.length===3?clean.split('').map(x=>x+x).join(''):clean,16);return {r:((n>>16)&255)/255,g:((n>>8)&255)/255,b:(n&255)/255}}

export function PdfEditor(){
  const canvasRef=useRef(null),sigInput=useRef(null),[file,setFile]=useState(null),[pageCount,setPageCount]=useState(0),[pageIndex,setPageIndex]=useState(0),[pdfDoc,setPdfDoc]=useState(null),[annotations,setAnnotations]=useState([]),[mode,setMode]=useState('text'),[text,setText]=useState('Approved'),[fontSize,setFontSize]=useState(18),[color,setColor]=useState('#111827'),[signature,setSignature]=useState(null),[sigWidth,setSigWidth]=useState(120),[busy,setBusy]=useState(false),[msg,setMsg]=useState('')

  async function openPdf(f){if(!f)return;setBusy(true);setMsg('Opening PDF…');try{const bytes=await f.arrayBuffer(),doc=await pdfjsLib.getDocument({data:bytes.slice(0)}).promise;setFile(f);setPdfDoc(doc);setPageCount(doc.numPages);setPageIndex(0);setAnnotations([]);setMsg(`${doc.numPages} page${doc.numPages===1?'':'s'} loaded. Click the page to place an edit.`)}catch(e){setMsg(`Could not open PDF: ${e.message}`)}finally{setBusy(false)}}

  async function drawPreview(){
    if(!pdfDoc||!canvasRef.current)return
    const page=await pdfDoc.getPage(pageIndex+1),base=page.getViewport({scale:1}),scale=Math.min(1.45,780/base.width),viewport=page.getViewport({scale}),canvas=canvasRef.current;canvas.width=viewport.width;canvas.height=viewport.height;const ctx=canvas.getContext('2d');await page.render({canvasContext:ctx,viewport}).promise
    for(const a of annotations.filter(x=>x.page===pageIndex)){
      if(a.type==='text'){ctx.save();ctx.font=`600 ${a.size*scale}px sans-serif`;ctx.fillStyle=a.color;ctx.fillText(a.text,a.x*scale,(base.height-a.y)*scale);ctx.restore()}
      if(a.type==='image'&&a.url){try{const img=await loadImage(a.url),w=a.width*scale,h=w*(img.naturalHeight/img.naturalWidth);ctx.drawImage(img,a.x*scale,(base.height-a.y)*scale-h,w,h)}catch{}}
    }
  }
  useEffect(()=>{drawPreview()},[pdfDoc,pageIndex,annotations])

  async function place(e){
    if(!pdfDoc)return;const canvas=canvasRef.current,rect=canvas.getBoundingClientRect(),page=await pdfDoc.getPage(pageIndex+1),base=page.getViewport({scale:1}),x=(e.clientX-rect.left)/rect.width*base.width,y=base.height-(e.clientY-rect.top)/rect.height*base.height
    if(mode==='text'){if(!text.trim())return setMsg('Enter text first.');setAnnotations(a=>[...a,{type:'text',page:pageIndex,x,y,text:text.trim(),size:Number(fontSize),color}]);setMsg('Text placed. Click another position to add another.')}
    else {if(!signature)return setMsg('Upload a signature or image first.');setAnnotations(a=>[...a,{type:'image',page:pageIndex,x,y,file:signature.file,url:signature.url,width:Number(sigWidth)}]);setMsg('Image/signature placed.')}
  }
  function loadSignature(f){if(!f)return;setSignature({file:f,url:URL.createObjectURL(f)});setMode('image');setMsg('Signature/image loaded. Click the PDF page where you want to place it.')}
  function undo(){setAnnotations(a=>{const idx=[...a].map((x,i)=>x.page===pageIndex?i:-1).filter(i=>i>=0).pop();return idx===undefined?a:a.filter((_,i)=>i!==idx)});setMsg('Last edit on this page removed.')}
  function clearPage(){setAnnotations(a=>a.filter(x=>x.page!==pageIndex));setMsg('Edits cleared from this page.')}

  async function exportPdf(){
    if(!file)return;setBusy(true);setMsg('Applying edits…')
    try{const pdf=await PDFDocument.load(await file.arrayBuffer()),font=await pdf.embedFont(StandardFonts.Helvetica)
      for(const a of annotations){const page=pdf.getPage(a.page);if(a.type==='text'){const c=hexRgb(a.color);page.drawText(a.text,{x:a.x,y:a.y-a.size,size:a.size,font,color:rgb(c.r,c.g,c.b)})}else if(a.type==='image'){const bytes=await a.file.arrayBuffer(),isPng=a.file.type==='image/png'||a.file.name.toLowerCase().endsWith('.png'),img=isPng?await pdf.embedPng(bytes):await pdf.embedJpg(bytes),w=a.width,h=w*(img.height/img.width);page.drawImage(img,{x:a.x,y:a.y-h,width:w,height:h})}}
      downloadBlob(new Blob([await pdf.save()],{type:'application/pdf'}),`${safeBaseName(file.name)}-edited.pdf`);setMsg(`Edited PDF downloaded with ${annotations.length} edit${annotations.length===1?'':'s'}.`)
    }catch(e){setMsg(`Could not export PDF: ${e.message}`)}finally{setBusy(false)}
  }

  return <div className="stack pdf-editor">
    {!file?<label className="editor-drop"><PenLine size={30}/><strong>Choose a PDF to edit</strong><span>Add text and signatures visually, then export a new PDF.</span><input type="file" accept="application/pdf" onChange={e=>openPdf(e.target.files?.[0])}/></label>:<>
      <div className="editor-toolbar"><div className="editor-pages"><button className="mini" disabled={pageIndex===0} onClick={()=>setPageIndex(p=>p-1)}>Previous</button><strong>Page {pageIndex+1} / {pageCount}</strong><button className="mini" disabled={pageIndex>=pageCount-1} onClick={()=>setPageIndex(p=>p+1)}>Next</button></div><div className="button-row compact"><button className="mini" onClick={undo}><Undo2 size={13}/> Undo</button><button className="mini danger" onClick={clearPage}><Trash2 size={13}/> Clear page</button></div></div>
      <div className="editor-controls"><div className="editor-mode"><button className={mode==='text'?'active':''} onClick={()=>setMode('text')}><PenLine size={15}/> Add text</button><button className={mode==='image'?'active':''} onClick={()=>setMode('image')}><ImagePlus size={15}/> Signature / image</button></div>{mode==='text'?<div className="form-grid three"><label>Text<input value={text} onChange={e=>setText(e.target.value)} placeholder="Type text"/></label><label>Font size<input type="number" min="8" max="72" value={fontSize} onChange={e=>setFontSize(e.target.value)}/></label><label>Text color<input type="color" value={color} onChange={e=>setColor(e.target.value)}/></label></div>:<div className="form-grid"><label>Signature / image<button className="secondary" type="button" onClick={()=>sigInput.current?.click()}>{signature?'Replace image':'Choose image'}</button><input ref={sigInput} className="sr-only" type="file" accept="image/png,image/jpeg" onChange={e=>loadSignature(e.target.files?.[0])}/></label><label>Width <span>{sigWidth} pt</span><input type="range" min="40" max="300" value={sigWidth} onChange={e=>setSigWidth(e.target.value)}/></label></div>}</div>
      <div className="editor-hint">Click anywhere on the PDF page to place the selected edit.</div><div className="pdf-canvas-stage"><canvas ref={canvasRef} onClick={place}/></div>
      <div className="button-row"><button className="primary" disabled={busy} onClick={exportPdf}><Download size={17}/> Download edited PDF</button><button className="secondary" onClick={()=>{setFile(null);setPdfDoc(null);setAnnotations([]);setPageCount(0)}}>Open another PDF</button></div>
    </>}<Status>{msg}</Status>
  </div>
}
