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
  const [userCoupons, setUserCoupons] = useState<any[]>([])

  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [voucherCode, setVoucherCode] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [usePoints, setUsePoints] = useState(false)
  const [pointsUsed, setPointsUsed] = useState("")

  useEffect(() => {
    if (!id) return
    Promise.all([
      api.get(`/api/events/${id}`),
      api.get('/api/profile'),
      api.get('/api/coupons/my')
    ])
      .then(([evRes, profileRes, couponsRes]) => {
        setEvent(evRes.data.event)
        setUserPoints(profileRes.data.user?.points || 0)
        setUserCoupons(couponsRes.data.coupons || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading || !event) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Memuat...</p></div>

  const eventStartDate = event.startDate ? new Date(event.startDate) : null
  const eventEndDate = event.endDate ? new Date(event.endDate) : null
  const formattedEventDate = eventStartDate
    ? eventStartDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "-"
  const formattedEventTime = eventStartDate
    ? eventEndDate
      ? `${eventStartDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - ${eventEndDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`
      : `${eventStartDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`
    : "-"

  // Calculate prices
  const originalPrice = event.price * ticketQuantity
  const isFreeEvent = event.price === 0
  const pointsValue = usePoints ? (parseInt(pointsUsed) || 0) : 0
  const pointsDiscount = usePoints ? Math.min(pointsValue, userPoints, originalPrice) : 0

  // Get available vouchers for this event
  const availableVouchers = event.vouchers || []
  const appliedVoucher = availableVouchers.find((v: any) => v.code === voucherCode)
  const voucherDiscount = appliedVoucher ? Math.floor(originalPrice * appliedVoucher.discount / 100) : 0
  const priceAfterVoucher = originalPrice - voucherDiscount

  // Apply referral coupon from customer's coupons
  const appliedCoupon = userCoupons.find((c: any) => c.code === couponCode)
  const couponDiscount = appliedCoupon ? Math.floor(priceAfterVoucher * appliedCoupon.discount / 100) : 0
  const priceAfterVoucherAndCoupon = priceAfterVoucher - couponDiscount

  const effectivePointsDiscount = usePoints
    ? Math.min(pointsValue, userPoints, priceAfterVoucherAndCoupon)
    : 0

  const totalDiscount = voucherDiscount + couponDiscount + effectivePointsDiscount
  const finalPrice = originalPrice - totalDiscount

  const handleConfirmPurchase = async () => {
    setSubmitting(true)
    try {
      const payload = {
        eventId: event.id,
        quantity: ticketQuantity,
        voucherCode: isFreeEvent ? undefined : (voucherCode || undefined),
        couponCode: isFreeEvent ? undefined : (couponCode || undefined),
        pointsUsed: isFreeEvent ? 0 : (usePoints ? pointsValue : 0),
      }
      console.log("Checkout payload:", JSON.stringify(payload, null, 2))

      const res = await api.post('/api/transactions', payload)
      if (res.data.transaction?.status === "DONE") {
        alert("Registrasi event berhasil. Tiket Anda sudah aktif.")
        navigate('/my-tickets')
      } else {
        navigate(`/payment-proof/${res.data.transaction.id}`)
      }
    } catch (err: any) {
      console.error("Checkout error:", err.response?.data)
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
      couponToReturn: couponCode,
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
              <div className="flex-1 p-4 sm:p-5">
                {/* Event Image */}
                <div className="relative h-32 sm:h-40 mb-4 rounded-xl overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c4a6e]/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 min-w-0">
                    <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded text-xs font-medium mb-1 inline-block">
                      {event.category}
                    </span>
                    <h1 className="text-base sm:text-lg font-bold text-white font-['Plus_Jakarta_Sans'] leading-tight break-words">{event.title}</h1>
                  </div>
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 sm:bg-transparent sm:p-0 min-w-0">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-base">calendar_today</span>
                    <span className="text-gray-700 break-words">{formattedEventDate}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 sm:bg-transparent sm:p-0 min-w-0">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-base">schedule</span>
                    <span className="text-gray-700 break-words">{formattedEventTime}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 sm:bg-transparent sm:p-0 min-w-0">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-base">location_on</span>
                    <span className="text-gray-700 break-words">{event.location}</span>
                  </div>
                </div>

                {/* Ticket Selection */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Jumlah Tiket</p>
                    <p className="text-xs text-gray-500">{event.availableSeats} tersedia</p>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => setTicketQuantity(Math.max(0, ticketQuantity - 1))}
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

                {!isFreeEvent && (
                  <>
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

                    {/* Referral Coupon Input */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-500 mb-1.5">Kode Kupon Referral</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Masukkan kode kupon referral"
                          className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                        />
                        {couponCode && (
                          <button
                            onClick={() => setCouponCode("")}
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
                  </>
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
                    {!isFreeEvent && voucherDiscount > 0 && (
                      <div className="flex justify-between text-green-300">
                        <span>Diskon Voucher ({appliedVoucher?.code})</span>
                        <span>-Rp {voucherDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    {!isFreeEvent && couponDiscount > 0 && (
                      <div className="flex justify-between text-green-300">
                        <span>Diskon Kupon ({appliedCoupon?.code})</span>
                        <span>-Rp {couponDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    {!isFreeEvent && effectivePointsDiscount > 0 && (
                      <div className="flex justify-between text-green-300">
                        <span>Diskon Poin</span>
                        <span>-Rp {effectivePointsDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    {!isFreeEvent && totalDiscount > 0 && (
                      <div className="flex justify-between text-green-300">
                        <span>Total Diskon</span>
                        <span>-Rp {totalDiscount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleConfirmPurchase}
                  disabled={ticketQuantity === 0 || submitting}
                  className={`w-full py-3 font-bold text-sm rounded-lg transition-colors ${
                    ticketQuantity === 0 || submitting
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-white text-[#0c4a6e] hover:bg-gray-100"
                  }`}
                >
                  {ticketQuantity === 0
                    ? "Pilih jumlah tiket"
                    : submitting
                      ? "Memproses..."
                      : finalPrice === 0
                        ? "Daftar Sekarang"
                        : "Konfirmasi Pembelian"}
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
