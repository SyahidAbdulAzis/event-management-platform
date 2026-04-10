import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="bg-black py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-8 font-space-grotesk uppercase tracking-widest text-xs border-t border-white/5">
      <div className="flex flex-col items-center md:items-start gap-2">
        <Link to="/" className="text-xl font-black text-white italic tracking-tighter">
          VIBE_RECORDS
        </Link>
        <p className="text-stone-600">© 2024 VIBE RECORDS. NO EXCUSES.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
        <Link to="/terms" className="text-stone-600 hover:text-violet-400 transition-colors">
          Terms of Service
        </Link>
        <Link to="/privacy" className="text-stone-600 hover:text-violet-400 transition-colors">
          Privacy Policy
        </Link>
        <Link to="/contact" className="text-stone-600 hover:text-violet-400 transition-colors">
          Contact Us
        </Link>
        <Link to="/press" className="text-stone-600 hover:text-violet-400 transition-colors">
          Press Kit
        </Link>
      </div>
      <div className="flex gap-4">
        <div className="w-10 h-10 bg-surface-container-high flex items-center justify-center hover:text-violet-400 transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-sm">share</span>
        </div>
        <div className="w-10 h-10 bg-surface-container-high flex items-center justify-center hover:text-violet-400 transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-sm">mail</span>
        </div>
      </div>
    </footer>
  )
}
