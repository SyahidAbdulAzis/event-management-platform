import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import api from "../lib/axios"

/* ─── COMPONENTS ─── */
interface StarRatingInputProps {
  rating: number
  onRatingChange: (rating: number) => void
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({ rating, onRatingChange }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(rating === star ? 0 : star)}
          className={`material-symbols-outlined text-3xl transition-all duration-200 ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          style={{
            fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0"
          }}
        >
          star
        </button>
      ))}
    </div>
  )
}

/* ─── PAGE ─── */
export default function ReviewForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [event, setEvent] = useState<any>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api.get(`/api/events/${id}`)
      .then(res => setEvent(res.data.event))
      .catch(console.error)
      .finally(() => setFetchLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      alert("Silakan pilih rating terlebih dahulu")
      return
    }

    if (comment.trim() === "") {
      alert("Silakan isi ulasan Anda")
      return
    }

    setLoading(true)
    try {
      // Customer hanya dapat memberikan ulasan setelah menghadiri event (divalidasi di backend)
      await api.post('/api/reviews', { eventId: id, rating, comment })
      alert("Ulasan berhasil dikirim!")
      navigate(`/organizer/${event?.organizerId}`)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengirim ulasan')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    navigate(`/events/${id}`)
  }

  return (
    <div className="min-h-screen font-['Inter'] pt-12 relative" style={{ background: "#f3f4f6" }}>
      {/* Backdrop with blur */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/10"></div>

      <Navbar />

      <div className="max-w-7xl mx-auto px-5 py-16 relative">
        {/* Two-column Review Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden relative border border-white/20">
          {/* Cutout circles on left and right edges */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-[#f3f4f6] rounded-full"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-[#f3f4f6] rounded-full"></div>

          <div className="flex flex-col md:flex-row">
            
            {/* Left Section - Event Info & Rating */}
            <div className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-dashed border-gray-300">
              {/* Event Image */}
              <div className="relative h-48 md:h-56 mb-6 rounded-xl overflow-hidden">
                <img
                  src={event?.imageUrl || '/concert.webp'}
                  alt={event?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c4a6e]/90 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-xl md:text-2xl font-bold text-white font-['Plus_Jakarta_Sans'] leading-tight mb-2">
                    {event?.title}
                  </h2>
                  <div className="flex items-center gap-3 text-white/90 text-sm">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      {event ? new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {event?.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating Section */}
              <div className="flex flex-col items-center">
                <p className="text-sm font-semibold text-gray-800 mb-3">Rating Anda</p>
                <StarRatingInput 
                  rating={rating} 
                  onRatingChange={setRating}
                />
                <p className="text-xs text-gray-500 mt-3 font-mono">
                  {rating > 0 ? `${rating}/5 bintang` : "Belum dinilai"}
                </p>
              </div>
            </div>

            {/* Right Section - Form */}
            <div className="flex-1 p-6 md:p-8 bg-gradient-to-br from-[#f8fafc] to-white">
              <form onSubmit={handleSubmit}>
                {/* Comment */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-800 mb-3">Ulasan Anda</p>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ceritakan pengalaman Anda..."
                    className="w-full px-4 py-3 bg-gray-50/50 backdrop-blur-sm rounded-xl border-2 border-dashed border-gray-200 focus:border-[#0ea5e9] focus:bg-white/80 outline-none resize-none h-32 text-sm text-gray-900 placeholder-gray-400 transition-colors"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-400">Bagikan momen terbaik dari event ini</p>
                    <p className="text-xs text-gray-400 font-mono">{comment.length}/500</p>
                  </div>
                </div>

                {/* Tips box */}
                <div className="bg-[#0ea5e9]/5 backdrop-blur-sm rounded-xl p-4 mb-6 border-l-4 border-[#0ea5e9]">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-lg">lightbulb</span>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <span className="font-semibold text-[#0ea5e9]">Tips:</span> Ulasan jujur membantu orang lain memilih event yang tepat
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-[#0ea5e9] text-white rounded-xl font-semibold hover:bg-[#0284c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-lg backdrop-blur-sm"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                        Mengirim...
                      </>
                    ) : (
                      "Kirim Ulasan"
                    )}
                  </button>
                  <Link
                    to={`/events/${id}`}
                    className="px-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50/80 transition-colors flex items-center justify-center gap-2 text-sm backdrop-blur-sm"
                  >
                    Batal
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Receipt footer with dashed line */}
          <div className="border-t-2 border-dashed border-gray-300"></div>
          <div className="bg-gray-50/50 backdrop-blur-sm px-6 py-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <p>IRAMA Event Platform</p>
              <p className="font-mono">{new Date().toLocaleDateString('id-ID')}</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
