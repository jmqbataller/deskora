import { useRef, useState } from 'react'
import JSZip from 'jszip'
import FileDrop from '../components/FileDrop'
import Status from '../components/Status'
import { downloadBlob, safeBaseName } from '../lib'

const paper=[['A3','297 × 420 mm','11.69 × 16.54 in'],['A4','210 × 297 mm','8.27 × 11.69 in'],['A5','148 × 210 mm','5.83 × 8.27 in'],['Letter','216 × 279 mm','8.5 × 11 in'],['Long Bond','216 × 330 mm','8.5 × 13 in'],['Legal','216 × 356 mm','8.5 × 14 in'],['Folio','216 × 330 mm','8.5 × 13 in']]
export function PaperSizePlus(){return <div className="stack"><div className="status">Philippine office presets include <strong>Long Bond 8.5 × 13 inches</strong>.</div><div className="result-table">{paper.map(p=><div key={p[0]}><span>{p[0]}</span><strong>{p[1]}</strong><em>{p[2]}</em></div>)}</div></div>}

export function PosterSplitter(){
 const[file,setFile]=useState(null),[cols,setCols]=useState(2),[rows,setRows]=useState(2),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false),preview=useRef(null)
 async function run(){setBusy(true);try{const url=URL.createObjectURL(file),im=await new Promise((r,j)=>{const x=new Image();x.onload=()=>r(x);x.onerror=j;x.src=url}),zip=new JSZip(),tw=Math.ceil(im.naturalWidth/cols),th=Math.ceil(im.naturalHeight/rows);for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const c=document.createElement('canvas');c.width=Math.min(tw,im.naturalWidth-x*tw);c.height=Math.min(th,im.naturalHeight-y*th);c.getContext('2d').drawImage(im,x*tw,y*th,c.width,c.height,0,0,c.width,c.height);const blob=await new Promise(r=>c.toBlob(r,'image/png'));zip.file(`tile-${y+1}-${x+1}.png`,blob)}URL.revokeObjectURL(url);downloadBlob(await zip.generateAsync({type:'blob'}),`${safeBaseName(file.name)}-poster-tiles.zip`);setMsg(`${cols*rows} print tiles created. Print each tile at consistent scale and assemble.`)}catch(e){setMsg(e.message)}finally{setBusy(false)}}
 return <div className="stack"><FileDrop accept="image/*" onFiles={f=>setFile(f[0])}/><div className="form-grid"><label>Columns<input type="number" min="1" max="8" value={cols} onChange={e=>setCols(Math.max(1,Number(e.target.value)))}/></label><label>Rows<input type="number" min="1" max="8" value={rows} onChange={e=>setRows(Math.max(1,Number(e.target.value)))}/></label></div><button className="primary" disabled={!file||busy} onClick={run}>Split poster to ZIP</button><Status>{msg}</Status></div>
}
