import { useMemo, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import JSZip from 'jszip'
import FileDrop from '../components/FileDrop'
import Status from '../components/Status'
import { downloadBlob, formatBytes, safeBaseName } from '../lib'

function readBook(file){return file.arrayBuffer().then(b=>XLSX.read(b,{type:'array'}))}
function rowsOf(wb,name=wb.SheetNames[0]){return XLSX.utils.sheet_to_json(wb.Sheets[name],{defval:'',raw:false})}
function saveBook(wb,name){downloadBlob(new Blob([XLSX.write(wb,{bookType:'xlsx',type:'array'})],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),name)}

export function SpreadsheetDuplicateFinder(){
 const[file,setFile]=useState(null),[rows,setRows]=useState([]),[dups,setDups]=useState([]),[column,setColumn]=useState(''),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false)
 async function load(f){setFile(f);setBusy(true);try{const wb=await readBook(f),r=rowsOf(wb);setRows(r);setColumn(Object.keys(r[0]||{})[0]||'');setMsg(`${r.length} rows loaded.`)}catch(e){setMsg(e.message)}finally{setBusy(false)}}
 function find(){const seen=new Map(),out=[];rows.forEach((r,i)=>{const key=column?String(r[column]??'').trim().toLowerCase():JSON.stringify(r);if(seen.has(key)&&key)out.push({row:i+2,value:key,first:seen.get(key)+2});else seen.set(key,i)});setDups(out);setMsg(`${out.length} duplicate occurrence${out.length===1?'':'s'} found.`)}
 return <div className="stack"><FileDrop accept=".xlsx,.xls,.csv" onFiles={f=>load(f[0])}/>{rows.length>0&&<><label>Compare by column<select value={column} onChange={e=>setColumn(e.target.value)}><option value="">Entire row</option>{Object.keys(rows[0]).map(k=><option key={k}>{k}</option>)}</select></label><button className="primary" onClick={find}>Find duplicates</button></>}{dups.length>0&&<div className="result-table">{dups.slice(0,100).map((d,i)=><div key={i}><span>Row {d.row}</span><strong>{d.value}</strong><em>first at row {d.first}</em></div>)}</div>}<Status>{msg}</Status></div>
}

export function SpreadsheetCompare(){
 const[a,setA]=useState(null),[b,setB]=useState(null),[diffs,setDiffs]=useState([]),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false)
 async function run(){setBusy(true);try{const [wa,wb]=await Promise.all([readBook(a),readBook(b)]),aa=XLSX.utils.sheet_to_json(wa.Sheets[wa.SheetNames[0]],{header:1,defval:''}),bb=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:''}),out=[],r=Math.max(aa.length,bb.length),c=Math.max(...aa.map(x=>x.length),...bb.map(x=>x.length),0);for(let y=0;y<r;y++)for(let x=0;x<c;x++){const av=aa[y]?.[x]??'',bv=bb[y]?.[x]??'';if(String(av)!==String(bv))out.push({cell:XLSX.utils.encode_cell({r:y,c:x}),before:String(av),after:String(bv)})}setDiffs(out);setMsg(`${out.length} changed cell${out.length===1?'':'s'} found.`)}catch(e){setMsg(e.message)}finally{setBusy(false)}}
 return <div className="stack"><div className="compare-inputs"><label>Original<input type="file" accept=".xlsx,.xls,.csv" onChange={e=>setA(e.target.files?.[0])}/></label><label>Updated<input type="file" accept=".xlsx,.xls,.csv" onChange={e=>setB(e.target.files?.[0])}/></label></div><button className="primary" disabled={!a||!b||busy} onClick={run}>Compare spreadsheets</button>{diffs.length>0&&<><div className="result-table">{diffs.slice(0,120).map((d,i)=><div key={i}><span>{d.cell}</span><strong>{d.before||'∅'} → {d.after||'∅'}</strong><em>changed</em></div>)}</div><button className="secondary" onClick={()=>downloadBlob(new Blob([XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(diffs))],{type:'text/csv'}),'deskora-spreadsheet-diff.csv')}>Download diff CSV</button></>}<Status>{msg}</Status></div>
}

export function ExcelMerge(){
 const[files,setFiles]=useState([]),[busy,setBusy]=useState(false),[msg,setMsg]=useState('')
 async function run(){setBusy(true);try{let all=[];for(const f of files){const wb=await readBook(f);all=all.concat(rowsOf(wb).map(r=>({...r,_source:f.name})))}const out=XLSX.utils.book_new();XLSX.utils.book_append_sheet(out,XLSX.utils.json_to_sheet(all),'Merged');saveBook(out,'deskora-merged-workbooks.xlsx');setMsg(`${files.length} files merged into ${all.length} rows.`)}catch(e){setMsg(e.message)}finally{setBusy(false)}}
 return <div className="stack"><FileDrop accept=".xlsx,.xls,.csv" multiple onFiles={setFiles}/>{files.length>0&&<div className="file-list">{files.map((f,i)=><div className="file-row" key={i}><span>{f.name}</span><small>{formatBytes(f.size)}</small></div>)}</div>}<button className="primary" disabled={files.length<2||busy} onClick={run}>Merge files</button><Status>{msg}</Status></div>
}

export function ExcelSplitter(){
 const[file,setFile]=useState(null),[rows,setRows]=useState([]),[column,setColumn]=useState(''),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false)
 async function load(f){setFile(f);const wb=await readBook(f),r=rowsOf(wb);setRows(r);setColumn(Object.keys(r[0]||{})[0]||'')}
 async function run(){setBusy(true);try{const groups={};rows.forEach(r=>{const k=String(r[column]||'Blank').trim()||'Blank';(groups[k]??=[]).push(r)});const zip=new JSZip();for(const [k,r] of Object.entries(groups)){const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(r),'Data');zip.file(`${safeBaseName(k)}.xlsx`,XLSX.write(wb,{bookType:'xlsx',type:'array'}))}downloadBlob(await zip.generateAsync({type:'blob'}),`${safeBaseName(file.name)}-split.zip`);setMsg(`Split into ${Object.keys(groups).length} files.`)}catch(e){setMsg(e.message)}finally{setBusy(false)}}
 return <div className="stack"><FileDrop accept=".xlsx,.xls,.csv" onFiles={f=>load(f[0])}/>{rows.length>0&&<label>Split by column<select value={column} onChange={e=>setColumn(e.target.value)}>{Object.keys(rows[0]).map(k=><option key={k}>{k}</option>)}</select></label>}<button className="primary" disabled={!rows.length||busy} onClick={run}>Split to ZIP</button><Status>{msg}</Status></div>
}

export function SmartRename(){
 const[files,setFiles]=useState([]),[prefix,setPrefix]=useState('Document'),[start,setStart]=useState(1),[msg,setMsg]=useState('')
 const names=useMemo(()=>files.map((f,i)=>{const ext=f.name.includes('.')?'.'+f.name.split('.').pop():'';return `${prefix}-${String(Number(start)+i).padStart(3,'0')}${ext}`}),[files,prefix,start])
 async function run(){const zip=new JSZip();files.forEach((f,i)=>zip.file(names[i],f));downloadBlob(await zip.generateAsync({type:'blob'}),`${safeBaseName(prefix)}-renamed.zip`);setMsg(`${files.length} files packaged with new names.`)}
 return <div className="stack"><FileDrop multiple onFiles={setFiles}/><div className="form-grid"><label>Name prefix<input value={prefix} onChange={e=>setPrefix(e.target.value)}/></label><label>Starting number<input type="number" value={start} onChange={e=>setStart(e.target.value)}/></label></div>{names.length>0&&<div className="file-list">{names.slice(0,20).map((n,i)=><div className="file-row" key={n}><span>{files[i].name}</span><small>→ {n}</small></div>)}</div>}<button className="primary" disabled={!files.length} onClick={run}>Download renamed ZIP</button><Status>{msg}</Status></div>
}

function fileGroup(f){const t=f.type||'',e=(f.name.split('.').pop()||'').toLowerCase();if(t.startsWith('image/'))return'Images';if(t==='application/pdf')return'PDF';if(t.startsWith('video/'))return'Videos';if(t.startsWith('audio/'))return'Audio';if(/xlsx?|csv/.test(e))return'Spreadsheets';if(/docx?|txt|rtf/.test(e))return'Documents';if(/zip|rar|7z/.test(e))return'Archives';return'Other'}
export function BulkOrganizer(){
 const[files,setFiles]=useState([]),[msg,setMsg]=useState('');const counts=useMemo(()=>files.reduce((a,f)=>(a[fileGroup(f)]=(a[fileGroup(f)]||0)+1,a),{}),[files])
 async function run(){const zip=new JSZip();files.forEach(f=>zip.file(`${fileGroup(f)}/${f.name}`,f));downloadBlob(await zip.generateAsync({type:'blob'}),'deskora-organized-files.zip');setMsg('Organized ZIP created. Original local files were not modified.')}
 return <div className="stack"><FileDrop multiple onFiles={setFiles}/>{files.length>0&&<div className="metric-grid">{Object.entries(counts).map(([k,v])=><div key={k}><strong>{v}</strong><span>{k}</span></div>)}</div>}<button className="primary" disabled={!files.length} onClick={run}>Download organized ZIP</button><Status>{msg}</Status></div>
}

export function DuplicateFileFinder(){
 const[files,setFiles]=useState([]),[groups,setGroups]=useState([]),[busy,setBusy]=useState(false),[msg,setMsg]=useState('')
 async function run(){setBusy(true);try{const map={};for(const f of files){const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await f.arrayBuffer()))).map(x=>x.toString(16).padStart(2,'0')).join('');(map[hash]??=[]).push(f.name)}const g=Object.values(map).filter(x=>x.length>1);setGroups(g);setMsg(`${g.length} duplicate group${g.length===1?'':'s'} found.`)}catch(e){setMsg(e.message)}finally{setBusy(false)}}
 return <div className="stack"><FileDrop multiple onFiles={setFiles}/><button className="primary" disabled={files.length<2||busy} onClick={run}>Find exact duplicates</button>{groups.map((g,i)=><div className="code-result pre" key={i}>{g.join('\n')}</div>)}<Status>{msg}</Status></div>
}

export function ImageMetadataCleaner(){
 const[files,setFiles]=useState([]),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false)
 async function run(){setBusy(true);try{const zip=new JSZip();for(const f of files){const url=URL.createObjectURL(f),im=await new Promise((r,j)=>{const x=new Image();x.onload=()=>r(x);x.onerror=j;x.src=url}),c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;c.getContext('2d').drawImage(im,0,0);URL.revokeObjectURL(url);const blob=await new Promise(r=>c.toBlob(r,f.type==='image/png'?'image/png':'image/jpeg',.96));zip.file(`${safeBaseName(f.name)}-clean.${f.type==='image/png'?'png':'jpg'}`,blob)}downloadBlob(await zip.generateAsync({type:'blob'}),'deskora-metadata-clean-images.zip');setMsg('Images were re-encoded, removing common EXIF/GPS metadata.')}catch(e){setMsg(e.message)}finally{setBusy(false)}}
 return <div className="stack"><FileDrop accept="image/*" multiple onFiles={setFiles}/><button className="primary" disabled={!files.length||busy} onClick={run}>Strip image metadata</button><Status>{msg}</Status></div>
}

const ones=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'],tens=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']
function under1000(n){let s='';if(n>=100){s+=ones[Math.floor(n/100)]+' Hundred ';n%=100}if(n>=20){s+=tens[Math.floor(n/10)]+' ';n%=10}if(n)s+=ones[n]+' ';return s.trim()}
function numberWords(n){n=Math.floor(Math.abs(n));if(!n)return'Zero';const scales=[[1e9,'Billion'],[1e6,'Million'],[1e3,'Thousand'],[1,'']];let out=[];for(const[s,name]of scales){const part=Math.floor(n/s)%1000;if(part)out.push(under1000(part)+(name?' '+name:''))}return out.join(' ')}
export function NumberToWords(){const[v,setV]=useState('125499.75'),n=Number(v)||0,pesos=Math.floor(Math.abs(n)),cent=Math.round((Math.abs(n)-pesos)*100),words=`${n<0?'Negative ':''}${numberWords(pesos)} Pesos and ${String(cent).padStart(2,'0')}/100 Only`;return <div className="stack"><label>Amount<input type="number" step="0.01" value={v} onChange={e=>setV(e.target.value)}/></label><div className="hero-result"><small>Amount in words</small><strong style={{fontSize:'24px'}}>{words}</strong></div><button className="secondary" onClick={()=>navigator.clipboard.writeText(words)}>Copy</button></div>}

export function VatCalculator(){const[a,setA]=useState(1000),[rate,setRate]=useState(12),[inclusive,setInclusive]=useState(true),amount=Number(a)||0,r=Number(rate)/100,net=inclusive?amount/(1+r):amount,vat=net*r,total=inclusive?amount:net+vat;return <div className="stack"><div className="form-grid three"><label>Amount<input type="number" value={a} onChange={e=>setA(e.target.value)}/></label><label>VAT %<input type="number" value={rate} onChange={e=>setRate(e.target.value)}/></label><label>Pricing<select value={inclusive?'in':'ex'} onChange={e=>setInclusive(e.target.value==='in')}><option value="in">VAT inclusive</option><option value="ex">VAT exclusive</option></select></label></div><div className="metric-grid"><div><strong>₱{net.toFixed(2)}</strong><span>Net</span></div><div><strong>₱{vat.toFixed(2)}</strong><span>VAT</span></div><div><strong>₱{total.toFixed(2)}</strong><span>Total</span></div></div></div>}

export function WorkdaysCalculator(){
 const[start,setStart]=useState(new Date().toISOString().slice(0,10)),[end,setEnd]=useState(new Date(Date.now()+30*864e5).toISOString().slice(0,10)),[hol,setHol]=useState('');const calc=useMemo(()=>{let a=new Date(start+'T00:00:00'),b=new Date(end+'T00:00:00');if(b<a)[a,b]=[b,a];const holidays=new Set(hol.split(/[\n,]+/).map(x=>x.trim()).filter(Boolean)),out={total:0,work:0,weekend:0,holiday:0};for(let d=new Date(a);d<=b;d.setDate(d.getDate()+1)){out.total++;const iso=d.toISOString().slice(0,10);if(d.getDay()===0||d.getDay()===6)out.weekend++;else if(holidays.has(iso))out.holiday++;else out.work++}return out},[start,end,hol])
 return <div className="stack"><div className="form-grid"><label>Start<input type="date" value={start} onChange={e=>setStart(e.target.value)}/></label><label>End<input type="date" value={end} onChange={e=>setEnd(e.target.value)}/></label></div><label>Optional holidays (YYYY-MM-DD, comma or line separated)<textarea rows="3" value={hol} onChange={e=>setHol(e.target.value)}/></label><div className="metric-grid"><div><strong>{calc.total}</strong><span>Total days</span></div><div><strong>{calc.work}</strong><span>Workdays</span></div><div><strong>{calc.weekend}</strong><span>Weekend</span></div><div><strong>{calc.holiday}</strong><span>Holidays</span></div></div></div>
}

export function CodeScanner(){
 const[file,setFile]=useState(null),[result,setResult]=useState(''),[msg,setMsg]=useState('')
 async function run(){try{if(!('BarcodeDetector'in window))throw new Error('This browser does not expose BarcodeDetector. Try current Chrome/Edge on Android or desktop.');const detector=new BarcodeDetector({formats:['qr_code','code_128','ean_13','ean_8','upc_a','upc_e','data_matrix']}),bmp=await createImageBitmap(file),codes=await detector.detect(bmp);setResult(codes.map(x=>`${x.format}: ${x.rawValue}`).join('\n'));setMsg(codes.length?`${codes.length} code${codes.length===1?'':'s'} detected.`:'No supported code detected.')}catch(e){setMsg(e.message)}}
 return <div className="stack"><FileDrop accept="image/*" onFiles={f=>setFile(f[0])}/><label>Or use phone camera<input type="file" accept="image/*" capture="environment" onChange={e=>setFile(e.target.files?.[0])}/></label><button className="primary" disabled={!file} onClick={run}>Scan QR / barcode</button>{result&&<div className="code-result pre">{result}</div>}<Status>{msg}</Status></div>
}

export function MeetingTranscriber(){
 const[text,setText]=useState(''),[active,setActive]=useState(false),[msg,setMsg]=useState(''),recRef=useRef(null)
 function start(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){setMsg('Live speech recognition is not available in this browser. Chrome-based browsers provide the best support.');return}const r=new SR();r.continuous=true;r.interimResults=true;r.lang='en-US';r.onresult=e=>{let final='';for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)final+=e.results[i][0].transcript+'\n';if(final)setText(t=>t+final)};r.onerror=e=>setMsg(`Transcription: ${e.error}`);r.onend=()=>setActive(false);r.start();recRef.current=r;setActive(true);setMsg('Listening to the microphone. Transcription availability depends on the browser speech service.')}
 function stop(){recRef.current?.stop();setActive(false)}
 return <div className="stack"><div className="button-row"><button className="primary" disabled={active} onClick={start}>Start live transcription</button><button className="secondary" disabled={!active} onClick={stop}>Stop</button></div><label>Transcript<textarea rows="14" value={text} onChange={e=>setText(e.target.value)}/></label><button className="secondary" disabled={!text} onClick={()=>downloadBlob(new Blob([text],{type:'text/plain'}),'deskora-meeting-transcript.txt')}>Download TXT</button><Status>{msg}</Status></div>
}
