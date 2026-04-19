import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import api from "../lib/axios"

export default function CheckoutPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userPoints, setUserPoints] = useState(0)

  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [voucherCode, setVoucherCode] = useState("")
  const [usePoints, setUsePoints] = useState(false)
  const [pointsUsed, setPointsUsed] = useState("")

  useEffect(() => {
    if (!id) return
    Promise.all([
      api.get(`/api/events/${id}`),
      api.get('/api/profile')
    ])
      .then(([evRes, profileRes]) => {
        setEvent(evRes.data.event)
        setUserPoints(profileRes.data.user?.points || 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading || !event) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Memuat...</p></div>

  // Calculate prices
  const originalPrice = event.price * ticketQuantity
  const pointsValue = usePoints ? (parseInt(pointsUsed) || 0) : 0
  const pointsDiscount = usePoints ? Math.min(pointsValue, userPoints, originalPrice) : 0
  const totalDiscount = pointsDiscount
  const finalPrice = originalPrice - totalDiscount

  const handleConfirmPurchase = async () => {
    setSubmitting(true)
    try {
      const res = await api.post('/api/transactions', {
        eventId: event.id,
        quantity: ticketQuantity,
        voucherCode: voucherCode || undefined,
        pointsUsed: usePoints ? pointsValue : 0,
      })
      navigate(`/payment-proof/${res.data.transaction.id}`)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membuat transaksi')
    } finally {
      setSubmitting(false)
    }
  }

  // Logika rollback poin/voucher sesuai dokumentasi
  // Poin, voucher, atau kupon yang digunakan dalam transaksi dikembalikan jika transaksi dibatalkan atau kedaluwarsa
  const handleTransactionRollback = (transactionStatus: "dibatalkan" | "kedaluwarsa") => {
    console.log("Transaction rollback triggered:", {
      status: transactionStatus,
      pointsToReturn: usePoints ? pointsUsed : 0,
      voucherToReturn: voucherCode,
      seatsToRestore: ticketQuantity,
    })
    // TODO: Call API to rollback points/voucher and restore seats
    // Rollback dan Pemulihan Kursi: Poin, voucher, atau kupon yang digunakan dalam transaksi dikembalikan jika transaksi dibatalkan atau kedaluwarsa. Selain itu, kursi yang tersedia dipulihkan.
  }

  return (
    <div className="min-h-screen font-['Inter'] pt-12" style={{ background: "#f3f4f6" }}>
      <Navbar />

      <section className="pt-8 pb-5 px-5">
        <div className="max-w-7xl mx-auto">
          
          {/* Full Width Ticket Design */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden relative">
            
            {/* Cutout circles on left and right edges */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-[#f3f4f6] rounded-full"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-[#f3f4f6] rounded-full"></div>

            <div className="flex flex-col md:flex-row">
              
              {/* Left Section - Event Info */}
              <div className="flex-1 p-5">
                {/* Event Image */}
                <div className="relative h-40 mb-4 rounded-xl overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c4a6e]/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded text-xs font-medium mb-1 inline-block">
                      {event.category}
                    </span>
                    <h1 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans'] leading-tight">{event.title}</h1>
                  </div>
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-base">calendar_today</span>
                    <span className="text-gray-700">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-base">schedule</span>
                    <span className="text-gray-700">{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-base">location_on</span>
                    <span className="text-gray-700">{event.location}</span>
                  </div>
                </div>

                {/* Ticket Selection */}
                <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Jumlah Tiket</p>
                    <p className="text-xs text-gray-500">{event.availableSeats} tersedia</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                      className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">remove</span>
                    </button>
                    <span className="text-xl font-bold text-[#0c4a6e] w-8 text-center">{ticketQuantity}</span>
                    <button
                      onClick={() => setTicketQuantity(Math.min(event.availableSeats, ticketQuantity + 1))}
                      className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                  </div>
                </div>

                {/* Voucher Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Kode Voucher</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="Masukkan kode voucher"
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                    />
                    {voucherCode && (
                      <button
                        onClick={() => setVoucherCode("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Points Usage */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Gunakan Poin</p>
                    <p className="text-xs text-gray-500">Saldo: Rp {userPoints.toLocaleString()}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePoints}
                      onChange={(e) => setUsePoints(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0ea5e9]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0ea5e9]"></div>
                  </label>
                </div>
                {usePoints && (
                  <div className="mt-4">
                    <input
                      type="number"
                      value={pointsUsed}
                      onChange={(e) => {
                        const value = e.target.value.replace(/^0+/, '')
                        const numValue = parseInt(value) || 0
                        setPointsUsed(Math.min(userPoints, numValue).toString())
                      }}
                      max={userPoints}
                      placeholder="Jumlah poin"
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                    />
                  </div>
                )}
              </div>

              {/* Vertical Perforated Line */}
              <div className="hidden md:block relative w-2">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-px bg-gray-300 border-l-2 border-dashed border-gray-400"></div>
                </div>
                {/* Cutout circles */}
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-2 w-4 h-4 bg-[#f3f4f6] rounded-full"></div>
                <div className="absolute top-1/2 -translate-y-1/2 translate-x-2 w-4 h-4 bg-[#f3f4f6] rounded-full"></div>
              </div>

              {/* Right Section - Ticket Stub */}
              <div className="md:w-72 bg-[#0c4a6e] p-5 text-white flex flex-col justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">TOTAL BAYAR</p>
                  <p className="text-2xl font-bold mb-3">Rp {finalPrice.toLocaleString()}</p>

                  {/* Price Breakdown */}
                  <div className="space-y-2 mb-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">Harga Tiket</span>
                      <span>Rp {originalPrice.toLocaleString()}</span>
                    </div>
                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-green-300">
                        <span>Diskon</span>
                        <span>-Rp {totalDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    {pointsDiscount > 0 && (
                      <div className="flex justify-between text-green-300">
                        <span>Diskon Poin</span>
                        <span>-Rp {pointsDiscount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleConfirmPurchase}
                  className="w-full bg-white text-[#0c4a6e] py-3 font-bold text-sm rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Konfirmasi Pembelian
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      <Footer />
    </div>
  )
}
