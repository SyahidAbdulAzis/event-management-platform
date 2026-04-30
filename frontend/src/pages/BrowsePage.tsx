import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import api from "../lib/axios"

/* ─── DATA ─── */
const categories = ["Semua", "Festival", "Solo Concert", "Arena Concert", "Intimate Concert", "Others"]
const locations = ["Semua Kota", "Jakarta", "Bandung", "Surabaya", "Bali"]

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

/* ─── EVENT CARD ─── */
function EventCard({ ev }: { ev: EventItem }) {
  const formattedDate = new Date(ev.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  const formattedPrice = ev.price === 0 ? 'Gratis' : `Rp ${ev.price.toLocaleString('id-ID')}`
  const isExpired = ev.status === 'EXPIRED' || new Date(ev.endDate) < new Date()
  return (
    <Link to={`/events/${ev.id}`}
      className={`group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${isExpired ? 'opacity-70' : ''}`}>
      <div className="relative h-[180px] overflow-hidden flex-shrink-0">
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
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs font-semibold text-gray-400 mb-1">{formattedDate}</p>
        <h3 className="text-base font-bold text-gray-800 leading-snug line-clamp-2 mb-1.5 group-hover:text-[#0ea5e9] transition-colors">
          {ev.title}
        </h3>
        <div className="flex items-start gap-1 text-xs text-gray-400 mb-auto">
          <span className="material-symbols-outlined text-[13px] mt-px">location_on</span>
          <span className="truncate">{ev.location}</span>
        </div>
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
export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("Semua")
  const [activeLocation, setActiveLocation] = useState("Semua Kota")
  const [allEvents, setAllEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  /* Fetch events dari API */
  useEffect(() => {
    const params: Record<string, string> = {}
    if (debouncedQuery) params.search = debouncedQuery
    if (activeCategory !== "Semua") params.category = activeCategory
    if (activeLocation !== "Semua Kota") params.location = activeLocation

    setLoading(true)
    api.get('/api/events', { params })
      .then(res => setAllEvents(res.data.events))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [debouncedQuery, activeCategory, activeLocation])

  /* Debounce 500ms */
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  /* Sort: Beli (active) -> Sold Out -> Expired */
  const filteredEvents = useMemo(() => {
    const rank = (e: EventItem) => {
      const expired = e.status === 'EXPIRED' || (e.endDate && new Date(e.endDate) < new Date())
      if (expired) return 2
      if (e.availableSeats === 0) return 1
      return 0
    }
    return [...allEvents].sort((a, b) => rank(a) - rank(b))
  }, [allEvents])

  const hasFilters = debouncedQuery !== "" || activeCategory !== "Semua" || activeLocation !== "Semua Kota"

  return (
    <div className="min-h-screen font-['Inter'] overflow-x-hidden pt-12" style={{ background: "#f3f4f6" }}>
      <Navbar />

      {/* ══════════════════════════════════════
          SEARCH & FILTER
      ══════════════════════════════════════ */}
      <section className="pt-8 px-5">
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            {/* Search Row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Cari event, artis, atau venue..."
                  className="w-full pl-10 pr-4 h-[44px] bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative w-full sm:w-48" id="location-dropdown">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-[18px] pointer-events-none">location_on</span>
                <button
                  onClick={() => document.getElementById('location-menu')?.classList.toggle('hidden')}
                  className="w-full pl-10 pr-10 h-[44px] bg-gray-50 rounded-lg text-sm text-gray-700 text-left outline-none hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <span>{activeLocation}</span>
                  <span className="material-symbols-outlined text-gray-400 text-[18px]">expand_more</span>
                </button>
                <div id="location-menu" className="hidden absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                  {locations.map(l => (
                    <button
                      key={l}
                      onClick={() => { setActiveLocation(l); document.getElementById('location-menu')?.classList.add('hidden') }}
                      className={`w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                        activeLocation === l ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] font-semibold' : 'text-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[16px] ${activeLocation === l ? 'text-[#0ea5e9]' : 'text-gray-400'}`}>
                          {l === 'Semua Kota' ? 'public' : 'location_on'}
                        </span>
                        {l}
                      </span>
                      {activeLocation === l && <span className="material-symbols-outlined text-[18px] text-[#0ea5e9]">check</span>}
                    </button>
                  ))}
                </div>
              </div>
              {/* Search Button */}
              <button className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold text-sm px-5 h-[44px] rounded-lg transition-colors">
                Cari
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-4"></div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-semibold text-gray-500 mr-2">Kategori:</span>
              {[
                { label: "Semua" },
                { label: "Festival" },
                { label: "Solo Concert" },
                { label: "Arena Concert" },
                { label: "Intimate Concert" },
                { label: "Others" },
              ].map(({ label }) => (
                <button
                  key={label}
                  onClick={() => setActiveCategory(label)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    activeCategory === label
                      ? "bg-[#0ea5e9] text-white border-[#0ea5e9] shadow-sm"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#0ea5e9] hover:text-[#0ea5e9]"
                  }`}
                >
                  {label}
                </button>
              ))}
              <div className="ml-auto text-sm text-gray-400">
                {filteredEvents.length} event ditemukan
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          RESULTS
      ══════════════════════════════════════ */}
      <section className="py-5 px-5">
        {loading ? (
          <div className="max-w-7xl mx-auto text-center py-20 text-gray-400">Memuat event...</div>
        ) : filteredEvents.length > 0 ? (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredEvents.map(ev => <EventCard key={ev.id} ev={ev} />)}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-14 px-8 rounded-xl border border-gray-200 shadow-sm w-full">
              <span className="material-symbols-outlined text-6xl text-gray-400 block mb-4">search_off</span>
              <p className="text-gray-700 text-base font-semibold">Tidak ada event ditemukan</p>
              <p className={`text-gray-500 text-base mt-2 ${hasFilters ? "mb-8" : ""}`}>
                {hasFilters ? "Coba ubah filter atau kata kunci" : "Belum ada event tersedia"}
              </p>
              {hasFilters && (
                <button
                  onClick={() => { setSearchQuery(""); setActiveCategory("Semua"); setActiveLocation("Semua Kota") }}
                  className="inline-flex items-center gap-2 bg-[#0ea5e9] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#0284c7] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  Reset Filter
                </button>
              )}
            </div>
        </div>
        )}

      </section>

      {/* ══════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════ */}
      <section className="py-5 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-[#0c4a6e]">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-10 md:py-12">
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-['Plus_Jakarta_Sans'] text-2xl md:text-3xl font-extrabold text-white leading-tight mb-3">
                  Banyak yang perlu kamu pikirin,<br />tapi soal jual tiket serahkan ke kami!
                </h2>
                <p className="text-white/60 text-base mb-6 max-w-md">
                  Fokus ke eventmu, biar urusan ticketing kami yang handle sepenuhnya.
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <a href="/events/create"
                    className="inline-flex items-center gap-1.5 bg-white text-[#0c4a6e] text-base font-bold px-6 py-2.5 rounded-lg hover:bg-gray-100 transition-colors shadow-md">
                    Lihat selengkapnya
                  </a>
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
