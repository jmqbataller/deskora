import { ArrowLeft, Link2, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function ToolShell({ tool, children }) {
  const Icon = tool.icon
  const [copied,setCopied]=useState(false)
  async function share(){
    try{
      const url=window.location.href
      if(navigator.share) await navigator.share({title:`Deskora — ${tool.name}`,text:tool.desc,url})
      else await navigator.clipboard.writeText(url)
      setCopied(true); setTimeout(()=>setCopied(false),1400)
    }catch{}
  }
  return (
    <main className="tool-page shell">
      <Link className="back-link" to="/tools"><ArrowLeft size={17}/> All tools</Link>
      <section className="tool-header">
        <div className="tool-icon large"><Icon size={26}/></div>
        <div>
          <div className="eyebrow">{tool.category} tool</div>
          <h1>{tool.name}</h1>
          <p>{tool.desc}</p>
        </div>
        <div className="tool-header-actions"><button className="share-tool" onClick={share}><Link2 size={14}/> {copied?'Copied':'Share tool'}</button></div>
      </section>
      <div className="privacy-note"><LockKeyhole size={16}/> Local-first processing — files are not uploaded to Deskora servers.</div>
      <section className="tool-workspace">{children}</section>
    </main>
  )
}
