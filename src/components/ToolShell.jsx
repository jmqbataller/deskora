import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ToolShell({ tool, children }) {
  const Icon = tool.icon
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
      </section>
      <div className="privacy-note"><LockKeyhole size={16}/> Local-first processing — files are not uploaded to Deskora servers.</div>
      <section className="tool-workspace">{children}</section>
    </main>
  )
}
