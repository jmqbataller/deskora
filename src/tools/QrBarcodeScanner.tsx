import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import FileDrop from '../components/FileDrop'
import Status from '../components/Status'
import { downloadBlob } from '../lib'

type ScanSource='Image'|'Camera'|'PDA'
type ScanEntry={id:string;value:string;format:string;source:ScanSource;time:number}

const nativeFormats=['qr_code','code_128','code_39','code_93','codabar','ean_13','ean_8','itf','upc_a','upc_e','data_matrix']

function uid(){return typeof crypto!=='undefined'&&'randomUUID'in crypto?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`}
function errorText(e:any){if(e?.name==='NotAllowedError')return'Camera permission was denied. Allow camera access in the browser, then try again.';if(e?.name==='NotFoundError')return'No camera was found on this device.';if(e?.name==='NotReadableError')return'The camera is busy or unavailable. Close other apps using it and try again.';return e instanceof Error?e.message:String(e||'Scanner error.')}
async function copyText(text:string){if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return}const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();document.execCommand('copy');area.remove()}

export function CodeScanner(){
 const[files,setFiles]=useState<File[]>([]),[scans,setScans]=useState<ScanEntry[]>([]),[msg,setMsg]=useState('Ready. Scan from an image, live camera, or PDA scanner.'),[busy,setBusy]=useState(false),[cameraActive,setCameraActive]=useState(false),[pdaValue,setPdaValue]=useState('')
 const videoRef=useRef<HTMLVideoElement|null>(null),controlsRef=useRef<any>(null),readerRef=useRef<BrowserMultiFormatReader|null>(null),pdaRef=useRef<HTMLInputElement|null>(null),lastCameraRef=useRef(new Map<string,number>())
 if(!readerRef.current)readerRef.current=new BrowserMultiFormatReader()

 function addScan(value:any,format='barcode',source:ScanSource='Image'){
  const clean=String(value??'').trim();if(!clean)return false
  if(source==='Camera'){const now=Date.now(),last=lastCameraRef.current.get(clean)||0;if(now-last<4000)return false;lastCameraRef.current.set(clean,now)}
  const entry:ScanEntry={id:uid(),value:clean,format:String(format||'barcode').replaceAll('_',' ').toUpperCase(),source,time:Date.now()}
  setScans(list=>[...list,entry].slice(-500));navigator.vibrate?.(45);return true
 }

 async function scanWithNative(file:File){
  const Native=(window as any).BarcodeDetector;if(!Native)return 0
  try{const supported=typeof Native.getSupportedFormats==='function'?await Native.getSupportedFormats():nativeFormats;const formats=nativeFormats.filter(x=>supported.includes(x));const detector=new Native(formats.length?{formats}:undefined);const found=await detector.detect(file);found.forEach((x:any)=>addScan(x.rawValue,x.format,'Image'));return found.length}catch{return 0}
 }
 async function scanWithFallback(file:File){
  const url=URL.createObjectURL(file)
  try{const image=new Image();image.src=url;await image.decode();const result=await readerRef.current!.decodeFromImageElement(image);return addScan(result.getText(),'barcode','Image')?1:0}finally{URL.revokeObjectURL(url)}
 }
 async function scanImages(){
  if(!files.length)return;setBusy(true);let total=0,failed=0
  try{for(const file of files){try{let count=await scanWithNative(file);if(!count)count=await scanWithFallback(file);total+=count}catch{failed++}}setMsg(total?`${total} code${total===1?'':'s'} added to scan results.${failed?` ${failed} image${failed===1?'':'s'} had no readable code.`:''}`:'No readable QR/barcode was found. Try a sharper image or use the live camera.')}finally{setBusy(false)}
 }

 function stopCamera(){
  try{controlsRef.current?.stop?.()}catch{}controlsRef.current=null
  const stream=videoRef.current?.srcObject as MediaStream|null;stream?.getTracks().forEach(t=>t.stop());if(videoRef.current)videoRef.current.srcObject=null
  setCameraActive(false)
 }
 async function startCamera(){
  if(!navigator.mediaDevices?.getUserMedia){setMsg('Live camera access is not available in this browser. You can still upload a photo or use a PDA scanner.');return}
  stopCamera();setBusy(true);setMsg('Requesting camera access…')
  try{const controls=await readerRef.current!.decodeFromConstraints({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false},videoRef.current||undefined,(result:any)=>{if(result&&addScan(result.getText(),'barcode','Camera'))setMsg('Code scanned from camera. Keep scanning or press Stop camera.')});controlsRef.current=controls;setCameraActive(true);setMsg('Camera scanner is active. Point the camera at a QR code or barcode.')}catch(e){stopCamera();setMsg(errorText(e))}finally{setBusy(false)}
 }
 useEffect(()=>()=>{try{controlsRef.current?.stop?.()}catch{}const stream=videoRef.current?.srcObject as MediaStream|null;stream?.getTracks().forEach(t=>t.stop())},[])

 function submitPda(){const value=pdaValue.trim();if(!value)return;addScan(value,'PDA / keyboard wedge','PDA');setPdaValue('');setMsg('PDA scan added. Ready for the next code.');requestAnimationFrame(()=>pdaRef.current?.focus())}
 async function copyOne(value:string){try{await copyText(value);setMsg('Copied scan result.')}catch(e){setMsg(errorText(e))}}
 async function copyAll(){if(!scans.length)return;try{await copyText(scans.map(s=>s.value).join('\n'));setMsg(`Copied all ${scans.length} scan result${scans.length===1?'':'s'}.`)}catch(e){setMsg(errorText(e))}}
 function downloadAll(){const text=scans.map(s=>s.value).join('\n');downloadBlob(new Blob([text],{type:'text/plain;charset=utf-8'}),'deskora-scanned-codes.txt')}

 return <div className="stack">
  <div className="status">Scan locally from uploaded images, a live device camera, or a USB/Bluetooth PDA scanner. Nothing is uploaded to a Deskora server.</div>
  <div className="stack">
   <strong>Image / photo scanner</strong>
   <FileDrop accept="image/*" multiple onFiles={setFiles}/>
   <label>Or take a photo with phone camera<input type="file" accept="image/*" capture="environment" multiple onChange={e=>setFiles(Array.from(e.target.files||[]))}/></label>
   <button className="primary" disabled={!files.length||busy} onClick={scanImages}>{busy?'Scanning…':`Scan selected image${files.length===1?'':'s'}`}</button>
  </div>
  <div className="stack">
   <strong>Live camera scanner</strong>
   <video ref={videoRef} muted playsInline style={{width:'100%',maxHeight:'420px',objectFit:'cover',borderRadius:'16px',background:'#06111f',display:cameraActive?'block':'none'}}/>
   <div className="button-row"><button className="primary" disabled={cameraActive||busy} onClick={startCamera}>Start camera</button><button className="secondary" disabled={!cameraActive} onClick={stopCamera}>Stop camera</button></div>
  </div>
  <div className="stack">
   <strong>PDA / handheld scanner</strong>
   <div className="status">For scanners configured as a keyboard (HID/keyboard-wedge), click the field below and scan. Deskora adds the code when the scanner sends Enter or Tab.</div>
   <label>Scanner input<input ref={pdaRef} value={pdaValue} onChange={e=>setPdaValue(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'||e.key==='Tab'){e.preventDefault();submitPda()}}} placeholder="Click here, then scan with your PDA device" autoComplete="off"/></label>
   <div className="button-row"><button className="secondary" onClick={()=>pdaRef.current?.focus()}>Focus PDA input</button><button className="primary" disabled={!pdaValue.trim()} onClick={submitPda}>Add code</button></div>
  </div>
  <div className="stack">
   <div className="button-row"><strong>Scan results ({scans.length})</strong><button className="secondary" disabled={!scans.length} onClick={copyAll}>Copy all</button><button className="secondary" disabled={!scans.length} onClick={downloadAll}>Download TXT</button><button className="mini danger" disabled={!scans.length} onClick={()=>{setScans([]);setMsg('Scan results cleared.')}}>Clear</button></div>
   {scans.length>0?<div className="file-list">{[...scans].reverse().map((scan,i)=><div className="file-row" key={scan.id}><span style={{minWidth:0,overflowWrap:'anywhere'}}><strong>{scan.value}</strong><small style={{display:'block'}}>{scan.format} · {scan.source} · #{scans.length-i}</small></span><button className="mini" onClick={()=>copyOne(scan.value)}>Copy</button></div>)}</div>:<div className="code-result pre">No scans yet.</div>}
  </div>
  <Status>{msg}</Status>
 </div>
}
