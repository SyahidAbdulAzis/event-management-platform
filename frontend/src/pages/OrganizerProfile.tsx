import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import StarRating from "../components/StarRating"
import api from "../lib/axios"

function ReviewCard({ review }: { review: any }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start gap-3 mb-3">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.customer?.email || 'U')}&background=0ea5e9&color=fff&size=50`}
          alt={review.customer?.email}
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-gray-800 text-sm truncate">{review.customer?.email}</h4>
            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{new Date(review.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <StarRating rating={review.rating} />
          <p className="text-xs text-[#0ea5e9] font-medium mt-1">{review.event?.title}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
    </div>
  )
}

function EventCard({ event }: { event: any }) {
  const isPast = new Date(event.endDate) < new Date()
  return (
    <Link to={`/events/${event.id}`} className="group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="relative h-[140px] overflow-hidden flex-shrink-0">
        <img src={event.imageUrl || '/concert.webp'} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded ${isPast ? "bg-green-500 text-white" : "bg-[#0ea5e9] text-white"}`}>
          {isPast ? "Selesai" : "Akan Datang"}
        </span>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 mb-1.5 group-hover:text-[#0ea5e9] transition-colors">{event.title}</h3>
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-auto">
          <span className="material-symbols-outlined text-[13px]">calendar_today</span>
          <span>{new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>
    </Link>
  )
}

/* ─── PAGE ─── */
export default function OrganizerProfile() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState<"reviews" | "events">("reviews")
  const [organizer, setOrganizer] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api.get(`/api/reviews/organizer/${id}`)
      .then(res => {
        setOrganizer(res.data.organizer)
        setReviews(res.data.reviews)
        setEvents(res.data.events)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Memuat...</p></div>
  if (!organizer) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Organizer tidak ditemukan</p></div>

  return (
    <div className="min-h-screen font-['Inter'] pt-12" style={{ background: "#f3f4f6" }}>
      <Navbar />

      {/* Hero Banner — same pattern as EventDetailPage */}
      <section className="pt-8 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="relative w-full h-[260px] md:h-[320px] rounded-2xl overflow-hidden mb-5">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0c4a6e] to-[#0ea5e9]" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0"
              style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h1 className="text-2xl md:text-4xl font-['Plus_Jakarta_Sans'] font-extrabold text-white leading-tight">
                {organizer.email}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-5 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

            {/* LEFT — tabs & content */}
            <div className="lg:col-span-8 space-y-5">

              {/* Organizer info card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    {organizer.profilePhoto ? (
                      <img
                        src={organizer.profilePhoto}
                        alt={organizer.email}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(organizer.email)}&background=0c4a6e&color=fff&size=200`}
                        alt={organizer.email}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-gray-800 font-['Plus_Jakarta_Sans']">{organizer.email}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="material-symbols-outlined text-[#f97316] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-sm font-bold text-gray-800">{organizer.avgRating}</span>
                        <span className="text-xs text-gray-400">· {organizer.totalReviews} ulasan</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`px-5 py-3 font-semibold text-sm transition-colors ${
                    activeTab === "reviews"
                      ? "text-[#0ea5e9] border-b-2 border-[#0ea5e9]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Ulasan ({organizer.totalReviews})
                </button>
                <button
                  onClick={() => setActiveTab("events")}
                  className={`px-5 py-3 font-semibold text-sm transition-colors ${
                    activeTab === "events"
                      ? "text-[#0ea5e9] border-b-2 border-[#0ea5e9]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Event ({organizer.totalEvents})
                </button>
              </div>

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 shadow-sm text-center py-14 px-6 text-sm text-gray-500">Belum ada ulasan</div>
                  ) : (
                    reviews.map((review: any) => (
                      <ReviewCard key={review.id} review={review} />
                    ))
                  )}
                </div>
              )}

              {/* Events Tab */}
              {activeTab === "events" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {events.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 shadow-sm text-center py-14 px-6 text-sm text-gray-500 col-span-3">Belum ada event</div>
                  ) : (
                    events.map((event: any) => (
                      <EventCard key={event.id} event={event} />
                    ))
                  )}
                </div>
              )}
            </div>

            {/* RIGHT — stats sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-4">
                {/* Stats Card */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 mb-4 font-['Plus_Jakarta_Sans']">Statistik Organizer</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#0ea5e9]">star</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Rating Rata-rata</p>
                        <p className="text-base font-extrabold text-[#0c4a6e]">{organizer.avgRating} / 5</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#0ea5e9]">confirmation_number</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Event</p>
                        <p className="text-base font-extrabold text-[#0c4a6e]">{organizer.totalEvents} event</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#0ea5e9]">group</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Peserta</p>
                        <p className="text-base font-extrabold text-[#0c4a6e]">{organizer.totalAttendees?.toLocaleString()} orang</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#0ea5e9]">rate_review</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Ulasan</p>
                        <p className="text-base font-extrabold text-[#0c4a6e]">{organizer.totalReviews} ulasan</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Card */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Kontak</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="material-symbols-outlined text-[#0ea5e9] text-base">mail</span>
                      {organizer.email}
                    </div>
                  </div>
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
