import { Link, useLocation } from "react-router-dom"
import { useState } from "react"

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm font-['Inter']">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-1">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src="/IRAMA_logo.svg" alt="IRAMA" className="h-14 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-0.5 text-base">
          <Link to="/" className={`px-3 py-2 font-medium transition-colors relative ${
            location.pathname === '/' 
              ? 'text-[#0ea5e9]' 
              : 'text-gray-800 hover:text-[#0ea5e9]'
          }`}>
            Beranda
            {location.pathname === '/' && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#0ea5e9] rounded-full"></span>}
          </Link>
          <Link to="/browse" className={`px-3 py-2 font-medium transition-colors relative ${
            location.pathname === '/browse' 
              ? 'text-[#0ea5e9]' 
              : 'text-gray-500 hover:text-[#0ea5e9]'
          }`}>
            Cari Event
            {location.pathname === '/browse' && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#0ea5e9] rounded-full"></span>}
          </Link>
          <Link to="/events/create" className={`px-3 py-2 font-medium transition-colors relative ${
            location.pathname === '/events/create' 
              ? 'text-[#0ea5e9]' 
              : 'text-gray-500 hover:text-[#0ea5e9]'
          }`}>
            Buat Event
            {location.pathname === '/events/create' && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#0ea5e9] rounded-full"></span>}
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="hidden lg:flex items-center gap-2">
          <Link to="/login" className="px-4 py-1.5 text-base font-semibold text-gray-600 border border-gray-200 rounded-md hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors">
            Masuk
          </Link>
          <Link to="/register" className="px-4 py-1.5 text-base font-bold text-white bg-[#0ea5e9] rounded-md hover:bg-[#0284c7] transition-colors shadow-sm">
            Daftar
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-gray-600 p-2">
          <span className="material-symbols-outlined text-[22px]">{mobileOpen ? "close" : "menu"}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-5 pb-4 space-y-1">
          <Link to="/" className={`block py-2 px-3 rounded-md text-base font-medium ${
            location.pathname === '/' 
              ? 'text-[#0ea5e9] bg-[#0ea5e9]/10' 
              : 'text-gray-800'
          }`}>Beranda</Link>
          <Link to="/browse" className={`block py-2 px-3 rounded-md text-base font-medium ${
            location.pathname === '/browse' 
              ? 'text-[#0ea5e9] bg-[#0ea5e9]/10' 
              : 'text-gray-500'
          }`}>Cari Event</Link>
          <Link to="/events/create" className={`block py-2 px-3 rounded-md text-base font-medium ${
            location.pathname === '/events/create' 
              ? 'text-[#0ea5e9] bg-[#0ea5e9]/10' 
              : 'text-gray-500'
          }`}>Buat Event</Link>
          <div className="flex gap-2 pt-2">
            <Link to="/login" className="px-4 py-1.5 text-base font-semibold text-gray-600 border border-gray-200 rounded-md">Masuk</Link>
            <Link to="/register" className="px-4 py-1.5 text-base font-bold text-white bg-[#0ea5e9] rounded-md">Daftar</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
