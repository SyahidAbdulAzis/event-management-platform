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
  }
  customer: {
    id: string
    email: string
  }
}

interface Event {
  id: string
  title: string
}

export default function OrganizerDashboard() {
  const { user } = useAuthStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [filter, setFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<"transactions" | "participants">("transactions")
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: "ACCEPT" | "REJECT" } | null>(null)
  const [statsFilter, setStatsFilter] = useState<"all" | "year" | "month" | "day">("all")

  const fetchOrganizerEvents = async () => {
    const res = await api.get('/api/events')
    const allEvents = res.data.events || []
    return allEvents
      .filter((event: any) => event.organizer?.id === user?.id)
      .map((event: any) => ({ id: event.id, title: event.title }))
  }

  useEffect(() => {
    if (!user || user.role !== "ORGANIZER") return

    Promise.allSettled([
      api.get('/api/transactions/organizer/all'),
      fetchOrganizerEvents()
    ])
      .then(([txResult, eventsResult]) => {
        if (txResult.status === "fulfilled") {
          setTransactions(txResult.value.data.transactions || [])
        } else {
          console.error("Failed to fetch organizer transactions:", txResult.reason)
        }

        if (eventsResult.status === "fulfilled") {
          setEvents(eventsResult.value || [])
        } else {
          console.error("Failed to fetch organizer events:", eventsResult.reason)
        }
      })
      .finally(() => setLoading(false))
  }, [user])

  // Calculate statistics
  const stats = {
    totalEvents: events.length,
    totalTransactions: transactions.length,
    completedTransactions: transactions.filter(tx => tx.status === "DONE").length,
    pendingTransactions: transactions.filter(tx => tx.status === "WAITING_CONFIRMATION").length,
    totalRevenue: transactions.filter(tx => tx.status === "DONE").reduce((sum, tx) => sum + tx.finalPrice, 0),
    totalTicketsSold: transactions.filter(tx => tx.status === "DONE").reduce((sum, tx) => sum + tx.quantity, 0)
  }

  // Filter transactions by time period for statistics
  const getFilteredTransactions = () => {
    const now = new Date()
    return transactions.filter(tx => {
      const txDate = new Date(tx.createdAt)
      if (statsFilter === "year") {
        return txDate.getFullYear() === now.getFullYear()
      } else if (statsFilter === "month") {
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
      } else if (statsFilter === "day") {
        return txDate.toDateString() === now.toDateString()
      }
      return true
    })
  }

  const filteredTxs = getFilteredTransactions()
  const filteredStats = {
    revenue: filteredTxs.filter(tx => tx.status === "DONE").reduce((sum, tx) => sum + tx.finalPrice, 0),
    transactions: filteredTxs.length,
    tickets: filteredTxs.filter(tx => tx.status === "DONE").reduce((sum, tx) => sum + tx.quantity, 0)
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filter === "all") return true
    return tx.status === filter
  })

  const handleConfirm = async (id: string, action: "ACCEPT" | "REJECT") => {
    setConfirmAction({ id, action })
  }

  const executeConfirm = async () => {
    if (!confirmAction || confirmLoading) return

    setConfirmLoading(true)
    try {
      await api.post(`/api/transactions/${confirmAction.id}/confirm`, { action: confirmAction.action })
      // Refresh transactions
      const res = await api.get('/api/transactions/organizer/all')
      setTransactions(res.data.transactions)
      setConfirmAction(null)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengkonfirmasi transaksi')
    } finally {
      setConfirmLoading(false)
    }
  }

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

  if (!user || user.role !== "ORGANIZER") {
    return (
      <div className="min-h-screen font-['Inter'] pt-12" style={{ background: "#f3f4f6" }}>
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Akses ditolak. Halaman ini khusus untuk organizer.</p>
            <Link to="/" className="text-[#0ea5e9] font-bold hover:underline">Kembali ke Beranda</Link>
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
          <h1 className="text-2xl font-bold text-gray-800 mb-6 font-['Plus_Jakarta_Sans']">Dashboard Organizer</h1>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="material-symbols-outlined text-[#0ea5e9] text-3xl">event</span>
                <span className="text-xs text-gray-500 font-medium">TOTAL EVENT</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
              <p className="text-xs text-gray-500 mt-1">Event yang Anda buat</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="material-symbols-outlined text-[#10b981] text-3xl">confirmation_number</span>
                <span className="text-xs text-gray-500 font-medium">TOTAL TRANSAKSI</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTransactions}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.pendingTransactions} menunggu konfirmasi</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="material-symbols-outlined text-[#f97316] text-3xl">payments</span>
                <span className="text-xs text-gray-500 font-medium">TOTAL PENDAPATAN</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">Rp {stats.totalRevenue.toLocaleString('id-ID')}</p>
              <p className="text-xs text-gray-500 mt-1">Dari {stats.completedTransactions} transaksi selesai</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="material-symbols-outlined text-[#8b5cf6] text-3xl">chair_alt</span>
                <span className="text-xs text-gray-500 font-medium">TIKET TERJUAL</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTicketsSold}</p>
              <p className="text-xs text-gray-500 mt-1">Total tiket terjual</p>
            </div>
          </div>

          {/* Statistics Filter */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Statistik Pendapatan</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatsFilter("all")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    statsFilter === "all" ? "bg-[#0ea5e9] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setStatsFilter("year")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    statsFilter === "year" ? "bg-[#0ea5e9] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Tahun Ini
                </button>
                <button
                  onClick={() => setStatsFilter("month")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    statsFilter === "month" ? "bg-[#0ea5e9] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Bulan Ini
                </button>
                <button
                  onClick={() => setStatsFilter("day")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    statsFilter === "day" ? "bg-[#0ea5e9] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Hari Ini
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-[#0ea5e9]">Rp {filteredStats.revenue.toLocaleString('id-ID')}</p>
                <p className="text-xs text-gray-600 mt-1">Pendapatan</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-[#10b981]">{filteredStats.transactions}</p>
                <p className="text-xs text-gray-600 mt-1">Transaksi</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-[#8b5cf6]">{filteredStats.tickets}</p>
                <p className="text-xs text-gray-600 mt-1">Tiket</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-5 py-3 font-semibold text-sm transition-colors ${
                activeTab === "transactions"
                  ? "text-[#0ea5e9] border-b-2 border-[#0ea5e9]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Transaksi
            </button>
            <button
              onClick={() => setActiveTab("participants")}
              className={`px-5 py-3 font-semibold text-sm transition-colors ${
                activeTab === "participants"
                  ? "text-[#0ea5e9] border-b-2 border-[#0ea5e9]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Daftar Peserta
            </button>
          </div>

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <>
              {/* Filter Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {["all", "WAITING_PAYMENT", "WAITING_CONFIRMATION", "DONE", "REJECTED", "EXPIRED", "CANCELLED"].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      filter === status
                        ? "bg-[#0ea5e9] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {status === "all" ? "Semua" : getStatusLabel(status)}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="text-center py-20 text-gray-400">Memuat transaksi...</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="rounded-xl border border-gray-200 shadow-sm text-center py-20 px-6">
                  <span className="material-symbols-outlined text-5xl text-gray-400 mb-3 block">dashboard</span>
                  <p className="text-gray-700 font-semibold">Belum ada transaksi</p>
                  <p className="text-gray-500 text-sm mt-1">Transaksi akan muncul di sini setelah customer membeli tiket event Anda.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredTransactions.map(tx => (
                    <div key={tx.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        {/* Transaction Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-gray-800 font-['Plus_Jakarta_Sans']">{tx.event.title}</h3>
                              <p className="text-sm text-gray-500 mt-1">Customer: {tx.customer.email}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                              {getStatusLabel(tx.status)}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">confirmation_number</span>
                              <span>{tx.quantity} tiket</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">payments</span>
                              <span>Rp {tx.finalPrice.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">calendar_today</span>
                              <span>{new Date(tx.createdAt).toLocaleDateString('id-ID')}</span>
                            </div>
                          </div>

                          {tx.paymentProof && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Bukti Pembayaran:</p>
                              <a
                                href={tx.paymentProof}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[#0ea5e9] text-sm font-medium"
                              >
                                <span className="material-symbols-outlined text-base">visibility</span>
                                <span className="hover:underline">Lihat Bukti</span>
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {tx.status === "WAITING_CONFIRMATION" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleConfirm(tx.id, "ACCEPT")}
                              className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                            >
                              Terima
                            </button>
                            <button
                              onClick={() => handleConfirm(tx.id, "REJECT")}
                              className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Tolak
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Participants Tab */}
          {activeTab === "participants" && (
            <>
              {loading ? (
                <div className="text-center py-20 text-gray-400">Memuat peserta...</div>
              ) : events.length === 0 ? (
                <div className="rounded-xl border border-gray-200 shadow-sm text-center py-20 px-6">
                  <span className="material-symbols-outlined text-5xl text-gray-400 mb-3 block">event</span>
                  <p className="text-gray-700 font-semibold">Belum ada event</p>
                  <p className="text-gray-500 text-sm mt-1">Buat event untuk mulai melihat daftar peserta.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map(event => {
                    const eventParticipants = transactions.filter(
                      tx => tx.event.id === event.id && tx.status === "DONE"
                    )
                    const totalTickets = eventParticipants.reduce((sum, tx) => sum + tx.quantity, 0)
                    const totalRevenue = eventParticipants.reduce((sum, tx) => sum + tx.finalPrice, 0)

                    return (
                      <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-800 font-['Plus_Jakarta_Sans']">{event.title}</h3>
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/events/edit/${event.id}`}
                              className="text-[#0ea5e9] text-sm font-medium hover:underline"
                            >
                              Edit Event
                            </Link>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Total Peserta: {eventParticipants.length}</p>
                              <p className="text-sm text-gray-500">Total Tiket: {totalTickets}</p>
                              <p className="text-sm font-bold text-[#0ea5e9]">Rp {totalRevenue.toLocaleString('id-ID')}</p>
                            </div>
                          </div>
                        </div>

                        {eventParticipants.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-4">Belum ada peserta untuk event ini</p>
                        ) : (
                          <div className="space-y-2">
                            {eventParticipants.map(tx => (
                              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="text-sm font-medium text-gray-800">{tx.customer.email}</p>
                                  <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString('id-ID')}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-gray-800">{tx.quantity} tiket</p>
                                  <p className="text-xs text-[#0ea5e9]">Rp {tx.finalPrice.toLocaleString('id-ID')}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2 font-['Plus_Jakarta_Sans']">
              {confirmAction.action === "ACCEPT" ? "Terima Transaksi" : "Tolak Transaksi"}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {confirmAction.action === "ACCEPT"
                ? "Apakah Anda yakin ingin menerima transaksi ini? Kursi akan dikurangi dari event."
                : "Apakah Anda yakin ingin menolak transaksi ini? Kursi dan poin akan dikembalikan ke customer."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                disabled={confirmLoading}
                className="flex-1 py-3 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={executeConfirm}
                disabled={confirmLoading}
                className={`flex-1 py-3 text-white text-sm font-bold rounded-lg transition-colors ${
                  confirmAction.action === "ACCEPT" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {confirmLoading
                  ? "Memproses..."
                  : confirmAction.action === "ACCEPT"
                    ? "Terima"
                    : "Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
