import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuthStore } from "../store/authStore"

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate("/")
  }

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
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
              >
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#0ea5e9] flex items-center justify-center text-white font-bold text-sm">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">{user.email}</span>
                <span className="material-symbols-outlined text-gray-400 text-base">expand_more</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-30">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Logged in as</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
                    <p className="text-xs text-[#0ea5e9] font-medium">{user.role}</p>
                  </div>
                  {user.role === "CUSTOMER" && (
                    <Link to="/my-tickets" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Tiket Saya
                    </Link>
                  )}
                  {user.role === "ORGANIZER" && (
                    <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Dashboard
                    </Link>
                  )}
                  <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                  >
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="px-4 py-1.5 text-base font-semibold text-gray-600 border border-gray-200 rounded-md hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors">
                Masuk
              </Link>
              <Link to="/register" className="px-4 py-1.5 text-base font-bold text-white bg-[#0ea5e9] rounded-md hover:bg-[#0284c7] transition-colors shadow-sm">
                Daftar
              </Link>
            </>
          )}
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
          {isAuthenticated && user ? (
            <div className="pt-2 border-t border-gray-100 mt-2">
              <div className="px-3 py-2">
                <div className="flex items-center gap-3">
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#0ea5e9] flex items-center justify-center text-white font-bold text-sm">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Logged in as</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
                    <p className="text-xs text-[#0ea5e9] font-medium">{user.role}</p>
                  </div>
                </div>
              </div>
              {user.role === "CUSTOMER" && (
                <Link to="/my-tickets" className="block py-2 px-3 text-base text-gray-700 hover:bg-gray-50">
                  Tiket Saya
                </Link>
              )}
              {user.role === "ORGANIZER" && (
                <Link to="/dashboard" className="block py-2 px-3 text-base text-gray-700 hover:bg-gray-50">
                  Dashboard
                </Link>
              )}
              <Link to="/profile" className="block py-2 px-3 text-base text-gray-700 hover:bg-gray-50">
                Profil
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 px-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="px-4 py-1.5 text-base font-semibold text-gray-600 border border-gray-200 rounded-md">Masuk</Link>
              <Link to="/register" className="px-4 py-1.5 text-base font-bold text-white bg-[#0ea5e9] rounded-md">Daftar</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
