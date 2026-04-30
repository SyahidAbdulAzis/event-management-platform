import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import StarRating from "../components/StarRating"
import api from "../lib/axios"

// Dummy data untuk event detail - tema Eratix
const DUMMY_EVENT = {
  id: "1",
  title: "Synchronize Fest 2026",
  tagline: "Festival",
  date: "4–6 Okt 2026",
  endDate: "6 Okt 2026",
  time: "14:00 - 23:00 WIB",
  location: "Gambir Expo, Jakarta",
  address: "Jl. H. Benyamin Sueb, Kemayoran, Jakarta Pusat",
  description: "Synchronize Fest adalah festival musik indie terbesar di Indonesia yang menghadirkan berbagai band lokal dan internasional. Dengan suasana yang intimate dan penuh energi, festival ini menawarkan pengalaman musik yang tak terlupakan. Nikmati 3 hari penuh dengan musik, seni, dan komunitas yang hangat. Synchronize Fest telah menjadi wadah bagi musisi indie untuk berkarya dan berbagi karya mereka dengan penggemar setia.",
  imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDttdAfmKU06df1lk1QPnq5d8HLBrw_cl1bFH-muTC7T4FPJ4U9zLSjo4vQub32GnPBBp8sHv4kQxtQLGm9xS5-ijRA2larx8dOAOPIhs39YCaDgT-F6xXBgAq6R3l8ZrqdEI-oIwyD14PoH_iAtqsQ_uTk6AE5vvT0eck_yOQjlMA_DpmiVXa7BHm13dMfk7LqHVrvzeYodoT2O5Ob9bS-u63rRhUW6mY2rNwJ9JF-IvvrEW_E9UOTyttM3XIfqwkoDeG3iPrkCMH5",
  price: 450000,
  availableSeats: 250,
  status: "SELLING FAST",
  category: "Festival",
  // Jenis tiket sesuai dokumentasi: "jenis tiket (jika ada)"
  ticketTypes: [
    { id: 1, name: "Regular Day 1", price: 450000, description: "Akses untuk hari pertama festival" },
    { id: 2, name: "Regular Day 2", price: 450000, description: "Akses untuk hari kedua festival" },
    { id: 3, name: "Regular Day 3", price: 450000, description: "Akses untuk hari ketiga festival" },
    { id: 4, name: "3-Day Pass", price: 1200000, description: "Akses untuk semua 3 hari festival (hemat 15%)" },
    { id: 5, name: "VIP 3-Day Pass", price: 2500000, description: "Akses VIP untuk semua 3 hari + backstage access" },
  ],
  organizer: {
    name: "Synchronize Festival",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDPtgOfJUbb_r84Kmwb83pegyWDT07iP7WVvx7zBaP8DAiFxzVJWfIBX6i18Ap2VvEEKw-YeXtv-flkzCe95T7O4mnY94drrSJ3rAUfgzeoBzqJudlrh4Py3G6IbMi-yl_qyIR7aRhUgU9FG4o2rYWfv81425fWN5h-LkGb0ksdaTvk3OcOV2aJ6gKtTZHbzcJcN_jz9n7jBuhghpT7lvleEX_yNI0xkpWVpS-ZGwjcAjeYznsS5HYGFP1RmXFkyHOm1xxIwTkgnx-i",
    rating: 4.9,
    description: "Synchronize Festival adalah event organizer profesional yang telah menggelar festival musik bertaraf internasional sejak 2015.",
  },
  reviews: [
    { id: 1, name: "Ahmad Rizky", rating: 5, comment: "Event yang sangat seru! Suasana festivalnya asik banget.", date: "2 minggu lalu" },
    { id: 2, name: "Sarah Amelia", rating: 5, comment: "Synchronize Fest selalu jadi favorit saya. Organizer sangat profesional.", date: "1 bulan lalu" },
    { id: 3, name: "Budi Santoso", rating: 4, comment: "Bagus sih, cuma antrean masuknya agak lama. Tapi overall experience-nya oke.", date: "3 minggu lalu" },
    { id: 4, name: "Dewi Kusuma", rating: 5, comment: "Pengalaman yang tak terlupakan! Bakal datang lagi tahun depan.", date: "1 minggu lalu" },
  ],
  vouchers: [
    { id: 1, code: "SYNC25", discount: 25, endDate: "2026-09-30" },
    { id: 2, code: "EARLYBIRD", discount: 15, endDate: "2026-08-15" },
  ],
}

export default function EventDetailPage() {
  const { id } = useParams()
  const [event, setEvent] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      api.get(`/api/events/${id}`),
      api.get(`/api/reviews/event/${id}`)
    ])
      .then(([eventRes, reviewsRes]) => {
        setEvent(eventRes.data.event)
        setReviews(reviewsRes.data.reviews)
        setAvgRating(reviewsRes.data.avgRating)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center font-['Inter'] pt-12" style={{ background: "#f3f4f6" }}><Navbar /><p className="text-gray-400">Memuat event...</p></div>
  if (!event) return <div className="min-h-screen flex items-center justify-center font-['Inter'] pt-12" style={{ background: "#f3f4f6" }}><Navbar /><p className="text-gray-400">Event tidak ditemukan</p></div>

  return (
    <div className="min-h-screen font-['Inter'] pt-12" style={{ background: "#f3f4f6" }}>
      <Navbar />

      {/* ══════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════ */}
      <section className="pt-8 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="relative w-full h-[300px] md:h-[380px] rounded-2xl overflow-hidden mb-6">
            <img
              alt={event.title}
              className="w-full h-full object-cover"
              src={event.imageUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h1 className="text-2xl md:text-4xl font-['Plus_Jakarta_Sans'] font-extrabold text-white leading-tight">
                {event.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <section className="py-5 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* LEFT COLUMN - Event Info */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* Info Acara - Gabungan */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-[#0c4a6e]/10 text-[#0c4a6e] px-3 py-1 rounded-full text-xs font-medium">
                      {event.category}
                    </span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-['Plus_Jakarta_Sans'] leading-tight">
                    {event.title}
                  </h1>
                </div>

                {/* Info Grid */}
                <div className="p-5 border-b border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#0ea5e9]">calendar_today</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tanggal</p>
                        <p className="text-sm font-medium text-gray-800">
                          {event.startDate ? new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#0ea5e9]">schedule</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Waktu</p>
                        <p className="text-sm font-medium text-gray-800">
                          {event.startDate && event.endDate
                            ? `${new Date(event.startDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.endDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
                            : "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#0ea5e9]">location_on</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Lokasi</p>
                        <p className="text-sm font-medium text-gray-800">{event.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#0ea5e9]">confirmation_number</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Kursi Tersedia</p>
                        <p className="text-sm font-medium text-[#f97316]">{event.availableSeats ?? 0} / {event.totalSeats ?? 0}</p>
                      </div>
                    </div>
                  </div>
                  {event.address && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/10 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[#0ea5e9]">place</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Alamat Lengkap</p>
                          <p className="text-sm font-medium text-gray-800">{event.address}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Organizer */}
                <div className="p-5 border-b border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Diselenggarakan oleh</p>
                  <div className="flex items-center gap-3">
                    {event.organizer?.profilePhoto ? (
                      <img
                        src={event.organizer.profilePhoto}
                        alt={event.organizer.email || "Organizer"}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[#0c4a6e] flex items-center justify-center text-white font-bold text-lg">
                        {event.organizer?.email?.charAt(0).toUpperCase() || "O"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link to={`/organizer/${event.organizer?.id}`} className="text-sm font-bold text-gray-800 truncate hover:text-[#0ea5e9]">
                        {event.organizer?.email || "Organizer"}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">Lihat profil & ulasan lainnya</p>
                    </div>
                  </div>
                </div>

                {/* Deskripsi */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-gray-800 mb-3 font-['Plus_Jakarta_Sans']">Deskripsi</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
                </div>

                {/* Reviews Section */}
                <div className="p-5 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Ulasan</h3>
                    {avgRating > 0 && (
                      <div className="flex items-center gap-2">
                        <StarRating rating={avgRating} />
                        <span className="text-sm font-semibold text-gray-800">{avgRating}</span>
                        <span className="text-xs text-gray-500">({reviews.length} ulasan)</span>
                      </div>
                    )}
                  </div>
                  {reviews.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 shadow-sm text-center py-14 px-6 text-sm text-gray-500">Belum ada ulasan untuk event ini</div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#0ea5e9] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {review.customer.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-gray-800 truncate">
                                  {review.customer.email}
                                </p>
                                <StarRating rating={review.rating} />
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{review.comment}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(review.createdAt).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {reviews.length > 3 && (
                        <button className="text-[#0ea5e9] text-sm font-medium flex items-center gap-1">
                          <span className="hover:underline">Lihat semua ulasan</span>
                          <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Jenis Tiket - sesuai dokumentasi */}
                {event.ticketTypes && event.ticketTypes.length > 0 && (
                  <div className="p-5 border-t border-gray-100">
                    <h3 className="text-base font-bold text-gray-800 mb-3 font-['Plus_Jakarta_Sans']">Jenis Tiket</h3>
                    <div className="space-y-3">
                      {event.ticketTypes.map((ticket: any) => (
                        <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">{ticket.name}</p>
                            <p className="text-xs text-gray-500">{ticket.description}</p>
                          </div>
                          <p className="text-sm font-bold text-[#0c4a6e]">Rp {ticket.price.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN - Sticky Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-4">
                
                {/* Ticket Card */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Harga tiket mulai dari</p>
                    <p className="text-2xl font-extrabold text-[#0c4a6e]">Rp {event.price.toLocaleString()}</p>
                  </div>
                  
                  {(event.status === 'EXPIRED' || (event.endDate && new Date(event.endDate) < new Date())) ? (
                    <button disabled className="w-full bg-gray-300 text-gray-600 py-3 font-bold text-sm rounded-lg cursor-not-allowed">
                      Event Sudah Berakhir
                    </button>
                  ) : event.availableSeats === 0 ? (
                    <button disabled className="w-full bg-gray-300 text-gray-600 py-3 font-bold text-sm rounded-lg cursor-not-allowed">
                      Sold Out
                    </button>
                  ) : (
                    <Link to={`/checkout/${id}`}>
                      <button className="w-full bg-[#0ea5e9] text-white py-3 font-bold text-sm rounded-lg hover:bg-[#0284c7] transition-colors">
                        Beli Tiket
                      </button>
                    </Link>
                  )}
                  
                  <p className="text-center text-xs text-gray-400 mt-3">
                    Dengan melanjutkan pembelian, Anda telah membaca dan setuju dengan ketentuan yang berlaku.
                  </p>
                </div>

                {/* Voucher Tersedia */}
                {event.vouchers && event.vouchers.length > 0 && (
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#0ea5e9] text-base">local_offer</span>
                      Voucher Tersedia
                    </p>
                    <div className="space-y-2">
                      {event.vouchers.map((voucher: any) => (
                        <div key={voucher.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0c4a6e] text-sm">{voucher.code}</span>
                            <span className="text-xs text-gray-600">{voucher.discount}% OFF</span>
                          </div>
                          <span className="text-xs text-gray-400">s/d {new Date(voucher.endDate).toLocaleDateString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Kontak & Bantuan */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <p className="text-sm font-medium text-gray-800 mb-2">Butuh bantuan?</p>
                  <a href="#" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0ea5e9] transition-colors">
                    <span className="material-symbols-outlined text-base">mail</span>
                    support@irama.id
                  </a>
                  <a href="#" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0ea5e9] transition-colors mt-1">
                    <span className="material-symbols-outlined text-base">phone</span>
                    0812-3456-7890
                  </a>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          INFO BANNERS (2 col) - sama seperti LandingPage
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
          CTA BANNER — sama seperti LandingPage
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
