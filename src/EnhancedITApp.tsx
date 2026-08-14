import { Navigate, useLocation } from 'react-router-dom'
import App from './App'

function Credit(){return <div className="deskora-dev-credit">Developed by <a href="https://jmqbataller.vercel.app/" target="_blank" rel="noreferrer">John Mark Bataller</a></div>}

export default function EnhancedITApp(){
  const {pathname,search}=useLocation()
  if(pathname==='/it-tools'||pathname.startsWith('/it-tools/'))return <Navigate to="/tools?category=it" replace/>
  // Keying the library by query keeps category filters synced when navigating between ?category= links.
  return <><App key={pathname==='/tools'?search:'deskora'}/><Credit/></>
}
