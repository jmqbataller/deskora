export const formatBytes = (bytes=0) => {
  if (!bytes) return '0 B'
  const units=['B','KB','MB','GB']; const i=Math.min(Math.floor(Math.log(bytes)/Math.log(1024)),3)
  return `${(bytes/1024**i).toFixed(i?1:0)} ${units[i]}`
}

export function downloadBlob(blob, filename){
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove()
  setTimeout(()=>URL.revokeObjectURL(url),1500)
}

export const readAsArrayBuffer = (file) => file.arrayBuffer()

export function safeBaseName(name='file') {
  return name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9-_]+/gi,'-').replace(/^-+|-+$/g,'') || 'file'
}
