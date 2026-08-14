import { useMemo, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import QRCode from 'qrcode'
import bwipjs from 'bwip-js'
import { diffLines } from 'diff'
import FileDrop from '../components/FileDrop'
import Status from '../components/Status'
import { downloadBlob, formatBytes, safeBaseName } from '../lib'

export function CsvCleaner(){
  const [file,setFile]=useState(null),[stats,setStats]=useState(null),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false)
  async function run(){try{setBusy(true);const bytes=await file.arrayBuffer();const wb=XLSX.read(bytes,{type:'array'});const ws=wb.Sheets[wb.SheetNames[0]];const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});if(!rows.length)throw new Error('No rows found.');const header=rows[0];const body=rows.slice(1).filter(r=>r.some(v=>String(v).trim()!==''));const seen=new Set(),clean=[];let dup=0;for(const r of body){const normalized=r.map(v=>typeof v==='string'?v.trim():v);const key=JSON.stringify(normalized);if(seen.has(key)){dup++;continue}seen.add(key);clean.push(normalized)}const outWs=XLSX.utils.aoa_to_sheet([header,...clean]);const outWb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(outWb,outWs,'Cleaned');const out=XLSX.write(outWb,{bookType:'xlsx',type:'array'});downloadBlob(new Blob([out],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),`${safeBaseName(file.name)}-cleaned.xlsx`);setStats({rows:body.length,clean:clean.length,dup,blank:rows.length-1-body.length});setMsg('Cleaned workbook downloaded.')}catch(e){setMsg(e.message)}finally{setBusy(false)}}
  return <div className="stack"><FileDrop accept=".csv,.xlsx,.xls,text/csv" onFiles={f=>setFile(f[0])}/>{file&&<div className="file-row"><span>{file.name}</span><small>{formatBytes(file.size)}</small></div>}<button className="primary" disabled={!file||busy} onClick={run}>{busy?'Cleaning…':'Clean data & export XLSX'}</button>{stats&&<div className="metric-grid"><div><strong>{stats.rows}</strong><span>Input rows</span></div><div><strong>{stats.clean}</strong><span>Clean rows</span></div><div><strong>{stats.dup}</strong><span>Duplicates</span></div><div><strong>{stats.blank}</strong><span>Blank rows</span></div></div>}<Status>{msg}</Status></div>
}

export function TextCompare(){
  const [a,setA]=useState(''),[b,setB]=useState(''); const parts=useMemo(()=>diffLines(a,b),[a,b])
  return <div className="stack"><div className="compare-inputs"><label>Original<textarea value={a} onChange={e=>setA(e.target.value)} placeholder="Paste original text…"/></label><label>Updated<textarea value={b} onChange={e=>setB(e.target.value)} placeholder="Paste updated text…"/></label></div><div className="diff-output">{(!a&&!b)?<span className="muted">Differences will appear here.</span>:parts.map((p,i)=><pre key={i} className={p.added?'added':p.removed?'removed':''}>{p.value}</pre>)}</div></div>
}

const emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function EmailCleaner(){
  const [text,setText]=useState(''); const parsed=useMemo(()=>{const all=text.split(/[\n,;\s]+/).map(s=>s.trim().toLowerCase()).filter(Boolean);const valid=[],invalid=[],seen=new Set();let dup=0;for(const e of all){if(!emailRe.test(e)){invalid.push(e);continue}if(seen.has(e)){dup++;continue}seen.add(e);valid.push(e)}return{all,valid,invalid,dup}},[text])
  const download=()=>downloadBlob(new Blob([parsed.valid.join('\n')],{type:'text/plain'}),'clean-email-list.txt')
  return <div className="stack"><label>Email list<textarea rows="10" value={text} onChange={e=>setText(e.target.value)} placeholder={'name@example.com\nsecond@example.com'}/></label><div className="metric-grid"><div><strong>{parsed.valid.length}</strong><span>Valid unique</span></div><div><strong>{parsed.dup}</strong><span>Duplicates</span></div><div><strong>{parsed.invalid.length}</strong><span>Invalid</span></div></div><button className="primary" disabled={!parsed.valid.length} onClick={download}>Download clean list</button>{parsed.invalid.length>0&&<Status type="warn">Invalid: {parsed.invalid.slice(0,6).join(', ')}{parsed.invalid.length>6?'…':''}</Status>}</div>
}

export function QrGenerator(){
  const [mode,setMode]=useState('text'),[value,setValue]=useState('https://'),[ssid,setSsid]=useState(''),[password,setPassword]=useState(''),[msg,setMsg]=useState(''); const canvasRef=useRef(null)
  const payload=mode==='wifi'?`WIFI:T:WPA;S:${ssid};P:${password};;`:value
  async function generate(){try{await QRCode.toCanvas(canvasRef.current,payload,{width:360,margin:2,errorCorrectionLevel:'M'});setMsg('QR code generated locally.')}catch(e){setMsg(e.message)}}
  function download(){canvasRef.current.toBlob(b=>downloadBlob(b,'deskora-qr.png'))}
  return <div className="stack"><label>QR type<select value={mode} onChange={e=>setMode(e.target.value)}><option value="text">Text / URL</option><option value="wifi">Wi-Fi</option></select></label>{mode==='wifi'?<div className="form-grid"><label>Wi-Fi name<input value={ssid} onChange={e=>setSsid(e.target.value)}/></label><label>Password<input value={password} onChange={e=>setPassword(e.target.value)}/></label></div>:<label>Content<textarea rows="4" value={value} onChange={e=>setValue(e.target.value)}/></label>}<button className="primary" disabled={!payload} onClick={generate}>Generate QR</button><div className="canvas-wrap"><canvas ref={canvasRef}/></div><button className="secondary" onClick={download}>Download PNG</button><Status>{msg}</Status></div>
}

export function BarcodeGenerator(){
  const [value,setValue]=useState('DESKORA-001'),[msg,setMsg]=useState(''); const canvasRef=useRef(null)
  function generate(){try{bwipjs.toCanvas(canvasRef.current,{bcid:'code128',text:value,scale:3,height:12,includetext:true,textxalign:'center'});setMsg('Code 128 barcode generated.')}catch(e){setMsg(e.message)}}
  function download(){canvasRef.current.toBlob(b=>downloadBlob(b,'deskora-barcode.png'))}
  return <div className="stack"><label>Barcode value<input value={value} onChange={e=>setValue(e.target.value)} /></label><button className="primary" disabled={!value} onClick={generate}>Generate barcode</button><div className="canvas-wrap"><canvas ref={canvasRef}/></div><button className="secondary" onClick={download}>Download PNG</button><Status>{msg}</Status></div>
}
