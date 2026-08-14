import { useMemo, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { ChevronRight, Files, Github, Search, ShieldCheck } from 'lucide-react'
import App from './App'
import ToolShell from './components/ToolShell'
import { categories, tools as baseTools } from './data-tools'
import { featurePackTools } from './feature-pack-tools'
import { itToolsV2 } from './it-tools-pack-v2'
import { ITToolEngine } from './tools/ITToolsV2'

function Credit(){return <div className="deskora-dev-credit">Developed by <a href="https://jmqbataller.vercel.app/" target="_blank" rel="noreferrer">John Mark Bataller</a></div>}
function Brand(){return <Link className="brand" to="/"><span className="brand-mark"><Files size={19}/></span><span>Deskora</span></Link>}
function Header(){return <header className="site-header"><div className="shell nav"><Brand/><nav><Link to="/tools">All tools</Link><Link to="/tools?category=video">Video</Link><Link to="/tools/workspace">Workspace</Link><Link to="/tools/template-center">Presets</Link><a href="/#categories">Categories</a><a href="https://github.com/jmqbataller/deskora" target="_blank" rel="noreferrer"><Github size={17}/> GitHub</a></nav></div></header>}

const legacyIt=[...baseTools,...featurePackTools].filter(t=>t.category==='it')
const allItTools=[...legacyIt,...itToolsV2].filter((tool,index,list)=>list.findIndex(x=>x.id===tool.id)===index)

function ToolCard({tool}){const Icon=tool.icon;return <div className="tool-card"><div className="tool-card-top"><span className="tool-icon"><Icon size={21}/></span><div className="card-actions">{tool.badge&&<span className="badge">{tool.badge}</span>}</div></div><Link className="tool-card-link" to={`/tools/${tool.id}`}><h3>{tool.name}</h3><p>{tool.desc}</p><span className="tool-open">Open tool <ChevronRight size={15}/></span></Link></div>}

function ItLibrary(){const[q,setQ]=useState('');const list=useMemo(()=>allItTools.filter(t=>(t.name+' '+t.desc).toLowerCase().includes(q.toLowerCase())),[q]);return <><Header/><main className="shell tools-page"><div className="page-heading"><span className="eyebrow">Tool library</span><h1>Everything in Deskora</h1><p>IT & Security tools are now part of the main Deskora tool library.</p></div><div className="library-bar"><div className="search-box"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search IT & Security tools…"/></div><div className="filter-row"><Link to="/tools">All</Link>{categories.map(c=><Link className={c.id==='it'?'active':''} to={`/tools?category=${c.id}`} key={c.id}>{c.label}</Link>)}</div></div><div className="privacy-note"><ShieldCheck size={15}/> {allItTools.length} IT & Security utilities inside /tools — no separate IT tools library.</div><div className="tools-grid">{list.map(t=><ToolCard key={t.id} tool={t}/>)}</div>{!list.length&&<div className="empty-state">No IT & Security tools match your search.</div>}</main><Credit/></>}

function ItToolPage({id}){const tool=itToolsV2.find(t=>t.id===id);return <><Header/><ToolShell tool={tool}><ITToolEngine/></ToolShell><Credit/></>}

export default function EnhancedITApp(){const{pathname,search}=useLocation();const category=new URLSearchParams(search).get('category');if(pathname==='/it-tools'||pathname.startsWith('/it-tools/'))return <Navigate to="/tools?category=it" replace/>;if(pathname==='/tools'&&category==='it')return <ItLibrary/>;if(pathname.startsWith('/tools/')){const id=decodeURIComponent(pathname.split('/')[2]||'');if(itToolsV2.some(t=>t.id===id))return <ItToolPage id={id}/>}return <><App/><Credit/></>}
