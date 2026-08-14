import { Link, Navigate, useLocation } from 'react-router-dom'
import { Files, Github } from 'lucide-react'
import App from './App'
import ToolShell from './components/ToolShell'
import { itToolsV2 } from './it-tools-pack-v2'
import { ITToolEngine } from './tools/ITToolsV2'

function Credit(){return <div className="deskora-dev-credit">Developed by <a href="https://jmqbataller.vercel.app/" target="_blank" rel="noreferrer">John Mark Bataller</a></div>}
function Brand(){return <Link className="brand" to="/"><span className="brand-mark"><Files size={19}/></span><span>Deskora</span></Link>}
function Header(){return <header className="site-header"><div className="shell nav"><Brand/><nav><Link to="/tools">All tools</Link><Link to="/tools?category=video">Video</Link><Link to="/tools/workspace">Workspace</Link><Link to="/tools/template-center">Presets</Link><a href="/#categories">Categories</a><a href="https://github.com/jmqbataller/deskora" target="_blank" rel="noreferrer"><Github size={17}/> GitHub</a></nav></div></header>}

function ItToolPage({id}){const tool=itToolsV2.find(t=>t.id===id);return <><Header/><ToolShell tool={tool}><ITToolEngine/></ToolShell><Credit/></>}

export default function EnhancedITApp(){
  const {pathname}=useLocation()

  // Retire the old standalone IT library. Everything now lives under /tools.
  if(pathname==='/it-tools'||pathname.startsWith('/it-tools/'))return <Navigate to="/tools?category=it" replace/>

  // New IT utilities use the same /tools/<id> URL convention as every Deskora tool.
  if(pathname.startsWith('/tools/')){
    const id=decodeURIComponent(pathname.split('/')[2]||'')
    if(itToolsV2.some(t=>t.id===id))return <ItToolPage id={id}/>
  }

  // The main App now owns the IT & Security category, count, search and cards.
  return <><App/><Credit/></>
}
