import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'

export default function FileDrop({ onFiles, accept, multiple=false, label='Drop files here or click to browse', hint }) {
  const inputRef = useRef(null)
  const [over, setOver] = useState(false)
  const handle = (files) => onFiles?.(Array.from(files || []))
  return (
    <div
      className={`dropzone ${over ? 'is-over' : ''}`}
      onDragOver={(e)=>{e.preventDefault(); setOver(true)}}
      onDragLeave={()=>setOver(false)}
      onDrop={(e)=>{e.preventDefault(); setOver(false); handle(e.dataTransfer.files)}}
      onClick={()=>inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' ') inputRef.current?.click() }}
    >
      <input ref={inputRef} className="sr-only" type="file" accept={accept} multiple={multiple} onChange={(e)=>handle(e.target.files)} />
      <span className="drop-icon"><UploadCloud size={24}/></span>
      <strong>{label}</strong>
      <span>{hint || 'Your files are processed on this device.'}</span>
    </div>
  )
}
