import { Link, useLocation } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

export default function Navbar() {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const navLinkClass = (path: string) =>
    isActive(path)
      ? "text-violet-400 border-b-2 border-violet-500 pb-1"
      : "text-stone-400 font-medium hover:text-white transition-colors"

  return (
    <nav className="fixed top-0 w-full flex justify-between items-center px-8 py-4 bg-stone-950-80 backdrop-blur-xl text-violet-400 font-headline font-bold tracking-tighter z-50">
      <div className="flex items-center gap-12">
        <Link to="/" className="text-2xl font-black italic tracking-tighter text-white">VIBE_RECORDS</Link>
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={navLinkClass("/")}>Home</Link>
          <Link to="/browse" className={navLinkClass("/browse")}>Browse</Link>
          <Link to="/organize" className={navLinkClass("/organize")}>Organize</Link>
          <Link to="/about" className={navLinkClass("/about")}>About</Link>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4">
          <span className="material-symbols-outlined text-stone-400 hover:text-white cursor-pointer">notifications</span>
          <span className="material-symbols-outlined text-stone-400 hover:text-white cursor-pointer">shopping_cart</span>
          <div className="flex items-center space-x-2">
            <Link to="/login">
              <button className="border border-white-20 text-white px-4 py-2 font-label uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all">Login</button>
            </Link>
            <Link to="/register">
              <button className="border border-white-20 text-white px-4 py-2 font-label uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all">Register</button>
            </Link>
            <Link to="/events/create">
              <button className="bg-primary-dim text-on-primary-fixed px-6 py-2 font-label uppercase text-xs tracking-widest hover:bg-primary transition-all active:scale-95">Create Event</button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
