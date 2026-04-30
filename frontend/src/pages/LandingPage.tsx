import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import api from "../lib/axios"

/* ─── PAGE BG (Eratix-style light gray) ─── */
const PAGE_BG = "#f3f4f6"

const partnerLogos = [
  "Synchronize","WTF","Hammersonic","Joyland","Java Jazz",
  "Soundrenaline","DWP","Hodgepodge","LaLaLa","Prambanan Jazz","Pestapora","Idealisme",
]

/* ─── TYPES ─── */
interface EventItem {
  id: string
  title: string
  startDate: string
  endDate: string
  location: string
  price: number
  availableSeats: number
  imageUrl: string | null
  category: string
  status: string
}

/* ─── EVENT CARD — mirip Eratix ─── */
function EventCard({ ev }: { ev: EventItem }) {
  const formattedDate = new Date(ev.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  const formattedPrice = ev.price === 0 ? 'Gratis' : `Rp ${ev.price.toLocaleString('id-ID')}`
  const isExpired = ev.status === 'EXPIRED' || (ev.endDate && new Date(ev.endDate) < new Date())
  return (
    <Link to={`/events/${ev.id}`}
      className={`group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${isExpired ? 'opacity-70' : ''}`}>
      {/* Thumbnail */}
      <div className="relative h-[140px] overflow-hidden flex-shrink-0">
        <img src={ev.imageUrl || '/concert.webp'} alt={ev.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isExpired ? 'grayscale' : ''}`} />
        <span className="absolute top-2 left-2 bg-[#0c4a6e]/90 text-white text-xs font-semibold px-2 py-0.5 rounded">
          {ev.availableSeats} Kursi
        </span>
        {isExpired && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
            Berakhir
          </span>
        )}
      </div>
      {/* Body */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs font-semibold text-gray-400 mb-1">{formattedDate}</p>
        <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 mb-1.5 group-hover:text-[#0ea5e9] transition-colors">
          {ev.title}
        </h3>
        <div className="flex items-start gap-1 text-xs text-gray-400 mb-auto">
          <span className="material-symbols-outlined text-[13px] mt-px">location_on</span>
          <span className="truncate">{ev.location}</span>
        </div>
        {/* Price row */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider leading-none mb-0.5">Mulai dari</p>
            <p className="text-base font-extrabold text-[#0ea5e9]">{formattedPrice}</p>
          </div>
          {isExpired ? (
            <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2.5 py-1 rounded-md">Berakhir</span>
          ) : ev.availableSeats === 0 ? (
            <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2.5 py-1 rounded-md">Sold Out</span>
          ) : (
            <span className="text-xs font-bold text-white bg-[#f97316] px-2.5 py-1 rounded-md">Beli</span>
          )}
        </div>
      </div>
    </Link>
  )
}

/* ─── PAGE ─── */
export default function LandingPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/events')
      .then(res => setEvents(res.data.events))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const sortEvents = (list: EventItem[]) => {
    const rank = (e: EventItem) => {
      const expired = e.status === 'EXPIRED' || (e.endDate && new Date(e.endDate) < new Date())
      if (expired) return 2
      if (e.availableSeats === 0) return 1
      return 0
    }
    return [...list].sort((a, b) => rank(a) - rank(b))
  }

  const sortedEvents = sortEvents(events)
  const freeEvents = sortEvents(events.filter(e => e.price === 0))

  return (
    <div className="min-h-screen font-['Inter'] overflow-x-hidden pt-12" style={{ background: PAGE_BG }}>
      <Navbar />

      {/* ══════════════════════════════════════
          HERO BANNER — full-width blue, like Eratix
      ══════════════════════════════════════ */}
      <section className="relative bg-[#0c4a6e] overflow-visible">
        {/* background concert image */}
        <img src="/concert.webp" alt="Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-20 object-center" />
        <div className="relative z-10 max-w-7xl mx-auto px-5 py-10 md:py-14 pb-10">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center bg-white/10 rounded-full px-3 py-1 mb-4">
              <span className="text-white/80 text-sm font-medium">#IRAMAEventMusik</span>
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-3">
              Temukan Konser &amp; Festival<br />
              <span className="text-[#7dd3fc]">Musik Terbaik Indonesia</span>
            </h1>
            <p className="text-white/60 text-base md:text-lg max-w-md mb-6">
              Platform tiket event musik terpercaya. Beli tiket Synchronize, WTF, Hammersonic, Joyland, dan ratusan event lainnya dengan aman dan mudah.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/browse"
                className="inline-flex items-center bg-[#0ea5e9] text-white text-base font-bold px-6 py-2.5 rounded-lg hover:bg-[#0284c7] transition-colors shadow-lg">
                Beli Tiket
              </Link>
              <Link to="/events/create"
                className="inline-flex items-center bg-white/15 text-white text-base font-semibold px-6 py-2.5 rounded-lg hover:bg-white/25 transition-colors border border-white/25">
                Jual Tiket
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* ══════════════════════════════════════
          EVENT TERDAFTAR
      ══════════════════════════════════════ */}
      <section className="py-5 px-5">
        <div className="max-w-7xl mx-auto">
          {/* Section header — like Eratix */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="inline-flex items-center bg-[#0c4a6e] text-white px-5 py-2.5 rounded-xl font-['Plus_Jakarta_Sans'] text-base font-bold">Event Terdaftar</h2>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-400">Memuat event...</div>
          ) : events.length === 0 ? (
            <div className="rounded-xl border border-gray-200 shadow-sm w-full text-center py-14 px-8">
              <span className="material-symbols-outlined text-5xl text-gray-400 mb-3 block">event_busy</span>
              <p className="text-gray-700 font-semibold">Belum ada event yang tersedia</p>
              <p className="text-gray-500 text-sm mt-1">Cek lagi nanti atau jadilah organizer pertama!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {sortedEvents.slice(0, 10).map(ev => <EventCard key={ev.id} ev={ev} />)}
            </div>
          )}

          <div className="text-center mt-6">
            <Link to="/browse"
              className="inline-flex items-center gap-1.5 border border-[#0ea5e9] text-[#0ea5e9] text-base font-bold px-6 py-2 rounded-lg hover:bg-[#0ea5e9] hover:text-white transition-colors">
              Lihat semua event
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          INFO BANNERS (2 col)
      ══════════════════════════════════════ */}
      <section className="py-5 px-5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-4">
          {/* Banner 1 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#eff6ff] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[#0ea5e9] text-2xl">help_outline</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-1 font-['Plus_Jakarta_Sans']">
                Masih bingung cara beli tiket?
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">
                Dengan IRAMA, kamu bisa beli tiket secara aman, mudah dan cepat. Yuk, mulai cari event impianmu sekarang!
              </p>
              <Link to="/browse"
                className="inline-flex items-center gap-1 text-[#0ea5e9] text-base font-bold group">
                <span className="group-hover:underline">Cari event sekarang</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>
          {/* Banner 2 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#fff7ed] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[#f97316] text-2xl">sell</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-1 font-['Plus_Jakarta_Sans']">
                Jual tiket event tanpa potongan! 🎉
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">
                Jual tiket eventmu tanpa potongan biaya apapun. Gratis, mudah, dan bisa dikelola 24/7 dari mana saja!
              </p>
              <Link to="/events/create"
                className="inline-flex items-center gap-1 text-[#f97316] text-base font-bold group">
                <span className="group-hover:underline">Jual tiket sekarang</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          EVENT ORBITS
      ══════════════════════════════════════ */}
      <section className="py-5 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="inline-flex items-center bg-[#0c4a6e] text-white px-5 py-2.5 rounded-xl font-['Plus_Jakarta_Sans'] text-base font-bold">Event Gratis</h2>
          </div>
          {freeEvents.length === 0 ? (
            <div className="rounded-xl border border-gray-200 shadow-sm w-full text-center py-14 px-8">
              <span className="material-symbols-outlined text-5xl text-gray-400 mb-3 block">event_busy</span>
              <p className="text-gray-700 font-semibold">Belum ada event gratis</p>
              <p className="text-gray-500 text-sm mt-1">Cek lagi nanti untuk event gratis menarik!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {freeEvents.slice(0, 5).map(ev => <EventCard key={ev.id} ev={ev} />)}
            </div>
          )}
          <div className="text-center mt-6">
            <Link to="/browse"
              className="inline-flex items-center gap-1.5 border border-[#0ea5e9] text-[#0ea5e9] text-base font-bold px-6 py-2 rounded-lg hover:bg-[#0ea5e9] hover:text-white transition-colors">
              Lihat semua event
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PARTNER LOGOS — scrolling circles in rounded card
      ══════════════════════════════════════ */}
      <section className="py-5 px-5">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden py-10 px-8">
          <div className="text-center">
            <h2 className="text-xl font-extrabold text-gray-800 font-['Plus_Jakarta_Sans'] mb-1">
              Bersama partner event yang hebat
            </h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto mb-7">
              Lihatlah event organizer hebat yang sudah mempercayakan platform kami. Bergabung dan jadikan eventmu luar biasa!
            </p>
            <div className="overflow-hidden">
              <div className="animate-marquee gap-3">
                {[...partnerLogos, ...partnerLogos, ...partnerLogos, ...partnerLogos].map((logo, i) => (
                  <div key={i}
                    className="flex-shrink-0 w-20 h-20 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 font-bold text-xs text-center leading-tight px-1">{logo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA BANNER — Eratix style: blue bg, left text, right illustration
      ══════════════════════════════════════ */}
      <section className="py-5 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-[#0c4a6e]">
            {/* bg texture */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage:"radial-gradient(circle, white 1px, transparent 1px)", backgroundSize:"24px 24px" }}></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-10 md:py-12">
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-['Plus_Jakarta_Sans'] text-2xl md:text-3xl font-extrabold text-white leading-tight mb-3">
                  Banyak yang perlu kamu pikirin,<br />
                  tapi soal jual tiket serahkan ke kami!
                </h2>
                <p className="text-white/60 text-base mb-6 max-w-md">
                  Fokus ke eventmu, biar urusan ticketing kami yang handle sepenuhnya.
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Link to="/events/create"
                    className="inline-flex items-center gap-1.5 bg-white text-[#0c4a6e] text-base font-bold px-6 py-2.5 rounded-lg hover:bg-gray-100 transition-colors shadow-md">
                    Lihat selengkapnya
                  </Link>
                  <a href="#"
                    className="inline-flex items-center gap-1.5 bg-white/10 text-white text-base font-semibold px-6 py-2.5 rounded-lg hover:bg-white/20 transition-colors border border-white/20">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5" />
                    Hubungi Kami
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
