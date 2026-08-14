import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { tools } from '../tool-catalog'

const presets=[
  {name:'Scan & Sign',steps:['camera-scanner','ocr-text','edit-pdf','pdf-compressor']},
  {name:'Office Data Cleanup',steps:['csv-cleaner','spreadsheet-duplicates','spreadsheet-compare']},
  {name:'Social Video',steps:['video-trim','video-social-resize','video-compressor']},
  {name:'Secure Document',steps:['pdf-redactor','pdf-metadata','pdf-compressor']},
]

export function WorkflowBuilder(){
 const[saved,setSaved]=useState(()=>{try{return JSON.parse(localStorage.getItem('deskora-workflows')||'[]')}catch{return[]}}),[steps,setSteps]=useState(['camera-scanner','edit-pdf','pdf-compressor']),[name,setName]=useState('My workflow')
 const options=useMemo(()=>tools.filter(t=>!['workflow-builder'].includes(t.id)),[])
 function add(){setSteps(s=>[...s,options[0]?.id].filter(Boolean))}function save(){const next=[...saved,{name:name||'Workflow',steps,id:Date.now()}];setSaved(next);localStorage.setItem('deskora-workflows',JSON.stringify(next))}
 return <div className="stack"><div className="status">Deskora workflows are guided local chains: finish a step, then continue to the next tool. Files are not uploaded to a Deskora server.</div><div className="button-row">{presets.map(p=><button className="secondary" key={p.name} onClick={()=>{setName(p.name);setSteps(p.steps)}}>{p.name}</button>)}</div><label>Workflow name<input value={name} onChange={e=>setName(e.target.value)}/></label><div className="workflow-steps">{steps.map((id,i)=><div className="workflow-step" key={`${i}-${id}`}><span>{i+1}</span><select value={id} onChange={e=>setSteps(s=>s.map((x,n)=>n===i?e.target.value:x))}>{options.map(t=><option value={t.id} key={t.id}>{t.name}</option>)}</select><div className="button-row compact"><button className="mini" disabled={!i} onClick={()=>setSteps(s=>{const x=[...s];[x[i-1],x[i]]=[x[i],x[i-1]];return x})}>↑</button><button className="mini" disabled={i===steps.length-1} onClick={()=>setSteps(s=>{const x=[...s];[x[i+1],x[i]]=[x[i],x[i+1]];return x})}>↓</button><button className="mini danger" onClick={()=>setSteps(s=>s.filter((_,n)=>n!==i))}>Remove</button></div></div>)}</div><div className="button-row"><button className="secondary" onClick={add}>Add step</button><button className="primary" disabled={!steps.length} onClick={save}>Save workflow</button>{steps[0]&&<Link className="primary" to={`/tools/${steps[0]}`}>Start workflow</Link>}</div>{saved.length>0&&<div className="saved-workflows"><strong>Saved on this device</strong>{saved.map(w=><div className="file-row" key={w.id}><span>{w.name} · {w.steps.length} steps</span><Link className="mini" to={`/tools/${w.steps[0]}`}>Start</Link></div>)}</div>}</div>
}

export function WorkspaceInfo(){
 const[favs,setFavs]=useState(()=>{try{return JSON.parse(localStorage.getItem('deskora-favorites')||'[]')}catch{return[]}}),recent=useMemo(()=>{try{return JSON.parse(localStorage.getItem('deskora-recent')||'[]')}catch{return[]}},[])
 const resolve=id=>tools.find(t=>t.id===id)
 function clear(){localStorage.removeItem('deskora-recent');location.reload()}
 return <div className="stack"><div className="metric-grid"><div><strong>{favs.length}</strong><span>Favorite tools</span></div><div><strong>{recent.length}</strong><span>Recent tools</span></div><div><strong>Local</strong><span>Workspace storage</span></div></div><div className="form-grid"><div className="stack"><strong>Favorites</strong>{favs.map(id=>resolve(id)).filter(Boolean).map(t=><Link className="file-row" to={`/tools/${t.id}`} key={t.id}><span>{t.name}</span><small>Open</small></Link>)}</div><div className="stack"><strong>Recent</strong>{recent.map(id=>resolve(id)).filter(Boolean).map(t=><Link className="file-row" to={`/tools/${t.id}`} key={t.id}><span>{t.name}</span><small>Open</small></Link>)}</div></div><button className="secondary" onClick={clear}>Clear recent tools</button></div>
}
