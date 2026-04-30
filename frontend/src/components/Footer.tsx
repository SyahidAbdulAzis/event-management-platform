import { Link } from "react-router-dom"

const COL_LINK = "text-gray-500 hover:text-[#0ea5e9] transition-colors text-sm leading-relaxed"
const COL_HEAD = "text-gray-800 font-bold text-sm uppercase tracking-wider mb-3 font-['Plus_Jakarta_Sans']"

export default function Footer() {
  return (
    <footer className="px-5 py-6 bg-[#f3f4f6] font-['Inter']">
      {/* Container rounded card dengan max-w-7xl konsisten */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* ── Brand tagline ── */}
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/" className="flex items-center">
              <img src="/IRAMA_logo.svg" alt="IRAMA" className="h-8" />
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">Platform Event & Ticketing Musik Indonesia</span>
          </div>
          <p className="text-sm text-gray-400 max-w-2xl">
            IRAMA — Satu-satunya platform ticketing musik Indonesia untuk semua kalangan. Temukan konser, festival, dan workshop musik favoritmu dengan mudah dan aman.
          </p>
        </div>

        {/* ── Main columns ── */}
        <div className="px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">

            {/* Hubungi Kami */}
            <div>
              <p className={COL_HEAD}>Hubungi Kami</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[13px] text-gray-400">headset_mic</span>
                  <a className={COL_LINK} href="#">CS IRAMA</a>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[13px] text-gray-400">support_agent</span>
                  <a className={COL_LINK} href="#">CS Event Partner</a>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[13px] text-gray-400">mail</span>
                  <a className={COL_LINK} href="#">contact@irama.id</a>
                </li>
              </ul>
            </div>

            {/* Tentang */}
            <div>
              <p className={COL_HEAD}>Tentang</p>
              <ul className="space-y-2">
                <li><a className={COL_LINK} href="#">Tentang IRAMA</a></li>
                <li><a className={COL_LINK} href="#">Karir</a></li>
                <li><a className={COL_LINK} href="#">Syarat & Ketentuan</a></li>
                <li><a className={COL_LINK} href="#">Kebijakan Privasi</a></li>
              </ul>
            </div>

            {/* Beli Tiket */}
            <div>
              <p className={COL_HEAD}>Beli Tiket</p>
              <ul className="space-y-2">
                <li><a className={COL_LINK} href="#">Semua Event</a></li>
                <li><a className={COL_LINK} href="#">Konser</a></li>
                <li><a className={COL_LINK} href="#">Festival</a></li>
                <li><a className={COL_LINK} href="#">Workshop</a></li>
              </ul>
            </div>

            {/* Jual Tiket */}
            <div>
              <p className={COL_HEAD}>Jual Tiket</p>
              <ul className="space-y-2">
                <li><a className={COL_LINK} href="#">Layanan Keunggulan</a></li>
                <li><Link className={COL_LINK} to="/events/create">Daftar Event Partner</Link></li>
                <li><a className={COL_LINK} href="#">Panduan Event Partner</a></li>
                <li><a className={COL_LINK} href="#">Dashboard Partner</a></li>
              </ul>
            </div>

            {/* Media Sosial */}
            <div>
              <p className={COL_HEAD}>Media Sosial</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-1.5">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="Instagram" className="w-4 h-4 opacity-60 grayscale" />
                  <a className={COL_LINK} href="#">Instagram</a>
                </li>
                <li className="flex items-center gap-1.5">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg" alt="X" className="w-4 h-4 opacity-60 grayscale" />
                  <a className={COL_LINK} href="#">Twitter / X</a>
                </li>
                <li className="flex items-center gap-1.5">
                  <img src="/logos/Tiktok_logo.svg" alt="TikTok" className="w-4 h-4 opacity-60 grayscale" />
                  <a className={COL_LINK} href="#">TikTok</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Payment Methods ── */}
        <div className="px-8 py-5 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">Metode Pembayaran</p>
          <div className="flex flex-wrap gap-8 items-center">
            {/* QRIS */}
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/QRIS_logo.svg" alt="QRIS" className="h-6 object-contain" />
            {/* Bank Transfer */}
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg" alt="BCA" className="h-5 object-contain" />
            <img src="/logos/BNI_logo.svg" alt="BNI" className="h-5 object-contain" />
            <img src="/logos/BRI_logo.svg" alt="BRI" className="h-5 object-contain" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/120px-Bank_Mandiri_logo_2016.svg.png" alt="Mandiri" className="h-5 object-contain" />
            {/* E-Wallets */}
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Gopay_logo.svg/120px-Gopay_logo.svg.png" alt="GoPay" className="h-5 object-contain" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg" alt="OVO" className="h-4 object-contain" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg" alt="DANA" className="h-4 object-contain" />
            <img src="/logos/ShopeePay_logo.svg" alt="ShopeePay" className="h-5 object-contain" />
            <img src="/logos/LinkAja_logo.svg" alt="LinkAja" className="h-5 object-contain" />
            {/* Retail */}
            <img src="/logos/Alfamart_logo.svg" alt="Alfamart" className="h-5 object-contain" />
            <img src="/logos/Indomaret_logo.svg" alt="Indomaret" className="h-5 object-contain" />
          </div>
        </div>

        {/* ── Copyright ── */}
        <div className="px-8 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-center text-xs text-gray-400">
            © 2024 IRAMA — Platform Event & Ticketing Musik Indonesia. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  )
}
