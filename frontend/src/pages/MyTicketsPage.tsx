import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import api from "../lib/axios"
import { useAuthStore } from "../store/authStore"

interface Transaction {
  id: string
  status: string
  quantity: number
  finalPrice: number
  paymentDeadline: string
  createdAt: string
  paymentProof: string | null
  event: {
    id: string
    title: string
    imageUrl: string | null
    startDate: string
    endDate: string
    price: number
    location: string
    reviews: { id: string }[]
  }
}

export default function MyTicketsPage() {
  const { user } = useAuthStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    api.get('/api/transactions/my')
      .then(res => setTransactions(res.data.transactions))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  const handleCancelTransaction = async (transactionId: string) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan transaksi ini?")) return

    setCancellingId(transactionId)
    try {
      await api.post(`/api/transactions/${transactionId}/cancel`)
      setTransactions(prev => prev.map(tx => 
        tx.id === transactionId ? { ...tx, status: "CANCELLED" } : tx
      ))
      alert("Transaksi berhasil dibatalkan")
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal membatalkan transaksi")
    } finally {
      setCancellingId(null)
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filter === "all") return true
    return tx.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING_PAYMENT":
        return "bg-yellow-100 text-yellow-800"
      case "WAITING_CONFIRMATION":
        return "bg-blue-100 text-blue-800"
      case "DONE":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      case "EXPIRED":
        return "bg-gray-100 text-gray-800"
      case "CANCELLED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "WAITING_PAYMENT":
        return "Menunggu Pembayaran"
      case "WAITING_CONFIRMATION":
        return "Menunggu Konfirmasi"
      case "DONE":
        return "Selesai"
      case "REJECTED":
        return "Ditolak"
      case "EXPIRED":
        return "Kedaluwarsa"
      case "CANCELLED":
        return "Dibatalkan"
      default:
        return status
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen font-['Inter'] pt-12" style={{ background: "#f3f4f6" }}>
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Silakan login untuk melihat tiket Anda</p>
            <Link to="/login" className="text-[#0ea5e9] font-bold hover:underline">Login</Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen font-['Inter'] pt-12" style={{ background: "#f3f4f6" }}>
      <Navbar />

      <section className="pt-8 pb-5 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
            <h1 className="text-2xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Tiket Saya</h1>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Memuat transaksi...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="rounded-xl border border-gray-200 shadow-sm text-center py-20 px-6">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 block">confirmation_number</span>
              <p className="text-gray-500 font-medium">Belum ada transaksi</p>
              <p className="text-gray-400 text-sm mt-1">Mulai beli tiket event impianmu!</p>
              <Link to="/browse" className="inline-block mt-4 text-[#0ea5e9] font-bold hover:underline">
                Cari Event
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                    className="w-48 px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 text-left outline-none hover:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9] flex items-center justify-between"
                  >
                    <span>{filter === "all" ? "Semua Status" : getStatusLabel(filter)}</span>
                    <span className="material-symbols-outlined text-gray-400 text-base">expand_more</span>
                  </button>
                  {filterMenuOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 max-h-60 overflow-y-auto">
                      {["all", "WAITING_PAYMENT", "WAITING_CONFIRMATION", "DONE", "REJECTED", "EXPIRED", "CANCELLED"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            setFilter(status)
                            setFilterMenuOpen(false)
                          }}
                          className={`w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                            filter === status ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] font-semibold' : 'text-gray-700'
                          }`}
                        >
                          <span>{status === "all" ? "Semua Status" : getStatusLabel(status)}</span>
                          {filter === status && <span className="material-symbols-outlined text-[18px] text-[#0ea5e9]">check</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {filteredTransactions.map((tx, index) => (
                  <div key={tx.id} className={`p-5 ${index !== filteredTransactions.length - 1 ? "" : ""}`}>
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 font-['Plus_Jakarta_Sans']">{tx.event.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{tx.event.location}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                            {getStatusLabel(tx.status)}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">calendar_today</span>
                            <span>{new Date(tx.event.startDate).toLocaleDateString('id-ID')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">confirmation_number</span>
                            <span>{tx.quantity} tiket</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-base font-bold text-[#0ea5e9]">
                            Rp {tx.finalPrice.toLocaleString('id-ID')}
                          </p>
                          <div className="flex gap-2">
                            {tx.status === "WAITING_PAYMENT" && (
                              <>
                                <Link
                                  to={`/payment-proof/${tx.id}`}
                                  className="px-4 py-2 bg-[#0ea5e9] text-white text-sm font-medium rounded-lg hover:bg-[#0284c7] transition-colors"
                                >
                                  Upload Bukti
                                </Link>
                                <button
                                  onClick={() => handleCancelTransaction(tx.id)}
                                  disabled={cancellingId === tx.id}
                                  className="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                  {cancellingId === tx.id ? "Membatalkan..." : "Batalkan"}
                                </button>
                              </>
                            )}
                            {(tx.status === "WAITING_CONFIRMATION" || tx.status === "REJECTED") && (
                              <button
                                onClick={() => handleCancelTransaction(tx.id)}
                                disabled={cancellingId === tx.id}
                                className="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                {cancellingId === tx.id ? "Membatalkan..." : "Batalkan"}
                              </button>
                            )}
                            {tx.status === "DONE" && tx.finalPrice === 0 && new Date(tx.event.startDate) > new Date() && (
                              <button
                                onClick={() => handleCancelTransaction(tx.id)}
                                disabled={cancellingId === tx.id}
                                className="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                {cancellingId === tx.id ? "Membatalkan..." : "Batalkan"}
                              </button>
                            )}
                            {tx.status === "DONE" && new Date(tx.event.endDate) < new Date() && tx.event.reviews.length === 0 && (
                              <Link
                                to={`/review/${tx.event.id}`}
                                className="px-4 py-2 bg-yellow-400 text-white text-sm font-medium rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-base">star</span>
                                Beri Rating
                              </Link>
                            )}
                            <Link
                              to={`/events/${tx.event.id}`}
                              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Detail Event
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
