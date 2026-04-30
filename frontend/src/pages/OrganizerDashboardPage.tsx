import { useEffect, useMemo, useState } from "react"
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
  startDate: string
  location: string
  price: number
  availableSeats: number
  status: string
}

interface ChartPoint {
  label: string
  value: number
}

type DashboardTab = "statistics" | "transactions" | "participants" | "events"
type StatsView = "year" | "month" | "day"

interface StatsConfig {
  view: StatsView
  year: number
  month: number
  day: string
  status: string
}

const STATUS_FILTERS = ["all", "WAITING_PAYMENT", "WAITING_CONFIRMATION", "DONE", "REJECTED", "EXPIRED", "CANCELLED"]

const monthLabels = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
]

const dateToInputValue = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
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
      return "bg-gray-100 text-gray-700"
    case "CANCELLED":
      return "bg-gray-100 text-gray-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

function StatsBarChart({
  title,
  subtitle,
  color,
  data,
}: {
  title: string
  subtitle: string
  color: string
  data: ChartPoint[]
}) {
  const maxValue = Math.max(...data.map((item) => item.value), 1)
  const allZero = data.every((item) => item.value === 0)
  const minWidth = Math.max(data.length * 24, 560)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">{title}</h3>
      <p className="text-xs text-gray-500 mb-4">{subtitle}</p>

      {allZero ? (
        <div className="h-44 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
          <p className="text-sm text-gray-400">Belum ada data pada filter ini</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="h-52 rounded-lg border border-gray-100 bg-gray-50 px-3 pt-4 pb-2" style={{ minWidth }}>
            <div className="h-40 flex items-end gap-2">
              {data.map((item) => {
                const height = Math.max((item.value / maxValue) * 130, 6)
                return (
                  <div key={item.label} className="flex-1 min-w-[14px] flex flex-col items-center justify-end">
                    <div className="w-full rounded-t-sm" style={{ height, backgroundColor: color }} />
                    <span className="text-[10px] text-gray-500 mt-1">{item.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrganizerDashboardPage() {
  const { user } = useAuthStore()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<DashboardTab>("statistics")
  const [transactionFilter, setTransactionFilter] = useState<string>("all")
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: "ACCEPT" | "REJECT" } | null>(null)

  const [statsForm, setStatsForm] = useState<StatsConfig>(() => {
    const now = new Date()
    return {
      view: "month",
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: dateToInputValue(now),
      status: "all",
    }
  })
  const [statsConfig, setStatsConfig] = useState<StatsConfig>(() => {
    const now = new Date()
    return {
      view: "month",
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: dateToInputValue(now),
      status: "all",
    }
  })

  const [scopeMenuOpen, setScopeMenuOpen] = useState(false)
  const [monthMenuOpen, setMonthMenuOpen] = useState(false)
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const [transactionFilterMenuOpen, setTransactionFilterMenuOpen] = useState(false)

  const fetchOrganizerEvents = async () => {
    const res = await api.get("/api/events")
    const allEvents = res.data.events || []
    return allEvents
      .filter((event: any) => event.organizer?.id === user?.id)
      .map((event: any) => ({
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        location: event.location,
        price: event.price,
        availableSeats: event.availableSeats,
        status: event.status,
      }))
  }

  useEffect(() => {
    if (!user || user.role !== "ORGANIZER") return

    Promise.allSettled([
      api.get("/api/transactions/organizer/all"),
      fetchOrganizerEvents(),
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

  const quickStats = useMemo(() => {
    return {
      totalEvents: events.length,
      totalTransactions: transactions.length,
      waitingConfirmation: transactions.filter((tx) => tx.status === "WAITING_CONFIRMATION").length,
      totalRevenue: transactions
        .filter((tx) => tx.status === "DONE")
        .reduce((sum, tx) => sum + tx.finalPrice, 0),
      totalTickets: transactions
        .filter((tx) => tx.status === "DONE")
        .reduce((sum, tx) => sum + tx.quantity, 0),
    }
  }, [events, transactions])

  const scopedTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (statsConfig.status !== "all" && tx.status !== statsConfig.status) {
        return false
      }

      const txDate = new Date(tx.createdAt)

      if (statsConfig.view === "year") {
        return txDate.getFullYear() === statsConfig.year
      }

      if (statsConfig.view === "month") {
        return txDate.getFullYear() === statsConfig.year && txDate.getMonth() + 1 === statsConfig.month
      }

      return dateToInputValue(txDate) === statsConfig.day
    })
  }, [transactions, statsConfig])

  const chartData = useMemo(() => {
    let labels: string[] = []

    if (statsConfig.view === "year") {
      labels = monthLabels
    } else if (statsConfig.view === "month") {
      const daysInMonth = new Date(statsConfig.year, statsConfig.month, 0).getDate()
      labels = Array.from({ length: daysInMonth }, (_, index) => String(index + 1))
    } else {
      labels = Array.from({ length: 24 }, (_, index) => String(index))
    }

    const revenueBuckets = Array(labels.length).fill(0)
    const ticketBuckets = Array(labels.length).fill(0)
    const transactionBuckets = Array(labels.length).fill(0)

    scopedTransactions.forEach((tx) => {
      const txDate = new Date(tx.createdAt)
      let bucketIndex = -1

      if (statsConfig.view === "year") {
        bucketIndex = txDate.getMonth()
      } else if (statsConfig.view === "month") {
        bucketIndex = txDate.getDate() - 1
      } else {
        bucketIndex = txDate.getHours()
      }

      if (bucketIndex < 0 || bucketIndex >= labels.length) return

      transactionBuckets[bucketIndex] += 1

      if (tx.status === "DONE") {
        revenueBuckets[bucketIndex] += tx.finalPrice
        ticketBuckets[bucketIndex] += tx.quantity
      }
    })

    return {
      revenue: labels.map((label, index) => ({ label, value: revenueBuckets[index] })),
      tickets: labels.map((label, index) => ({ label, value: ticketBuckets[index] })),
      transactions: labels.map((label, index) => ({ label, value: transactionBuckets[index] })),
      summary: {
        revenue: revenueBuckets.reduce((sum, value) => sum + value, 0),
        tickets: ticketBuckets.reduce((sum, value) => sum + value, 0),
        transactions: transactionBuckets.reduce((sum, value) => sum + value, 0),
      },
    }
  }, [scopedTransactions, statsConfig])

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => (transactionFilter === "all" ? true : tx.status === transactionFilter))
  }, [transactions, transactionFilter])

  const executeConfirm = async () => {
    if (!confirmAction || confirmLoading) return

    setConfirmLoading(true)
    try {
      await api.post(`/api/transactions/${confirmAction.id}/confirm`, { action: confirmAction.action })
      const res = await api.get("/api/transactions/organizer/all")
      setTransactions(res.data.transactions || [])
      setConfirmAction(null)
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal mengkonfirmasi transaksi")
    } finally {
      setConfirmLoading(false)
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Event Management Dashboard</h1>
              </div>
              <Link
                to="/events/create"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#0ea5e9] text-white text-sm font-semibold hover:bg-sky-600 transition-colors"
              >
                Buat Event Baru
              </Link>
            </div>

            <div className="flex border-b border-gray-100 mt-5">
              <button
                onClick={() => setActiveTab("statistics")}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === "statistics"
                    ? "text-[#0c4a6e] border-b-2 border-[#0c4a6e] bg-[#f8fafc]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Statistik
              </button>
              <button
                onClick={() => setActiveTab("transactions")}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === "transactions"
                    ? "text-[#0c4a6e] border-b-2 border-[#0c4a6e] bg-[#f8fafc]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Manajemen Transaksi
              </button>
              <button
                onClick={() => setActiveTab("participants")}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === "participants"
                    ? "text-[#0c4a6e] border-b-2 border-[#0c4a6e] bg-[#f8fafc]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Daftar Peserta
              </button>
              <button
                onClick={() => setActiveTab("events")}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === "events"
                    ? "text-[#0c4a6e] border-b-2 border-[#0c4a6e] bg-[#f8fafc]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Manajemen Event
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
              <div className="rounded-lg bg-sky-50 border border-sky-100 p-4">
                <p className="text-xs text-sky-700 font-medium">Total Event</p>
                <p className="text-2xl font-bold text-sky-900">{quickStats.totalEvents}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4">
                <p className="text-xs text-emerald-700 font-medium">Total Transaksi</p>
                <p className="text-2xl font-bold text-emerald-900">{quickStats.totalTransactions}</p>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-100 p-4">
                <p className="text-xs text-amber-700 font-medium">Menunggu Konfirmasi</p>
                <p className="text-2xl font-bold text-amber-900">{quickStats.waitingConfirmation}</p>
              </div>
              <div className="rounded-lg bg-violet-50 border border-violet-100 p-4">
                <p className="text-xs text-violet-700 font-medium">Tiket Terjual</p>
                <p className="text-2xl font-bold text-violet-900">{quickStats.totalTickets}</p>
              </div>
            </div>
          </div>

          {activeTab === "statistics" && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
                <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Scope</label>
                      <div className="relative" id="scope-dropdown">
                        <button
                          type="button"
                          onClick={() => setScopeMenuOpen(!scopeMenuOpen)}
                          className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 text-left outline-none hover:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9] flex items-center justify-between"
                        >
                          <span>{statsForm.view.charAt(0).toUpperCase() + statsForm.view.slice(1)}</span>
                          <span className="material-symbols-outlined text-gray-400 text-base">expand_more</span>
                        </button>
                        {scopeMenuOpen && (
                          <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 max-h-60 overflow-y-auto">
                            {["year", "month", "day"].map((view) => (
                              <button
                                key={view}
                                type="button"
                                onClick={() => {
                                  setStatsForm(prev => ({ ...prev, view: view as StatsView }))
                                  setScopeMenuOpen(false)
                                }}
                                className={`w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                  statsForm.view === view ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] font-semibold' : 'text-gray-700'
                                }`}
                              >
                                <span>{view.charAt(0).toUpperCase() + view.slice(1)}</span>
                                {statsForm.view === view && <span className="material-symbols-outlined text-[18px] text-[#0ea5e9]">check</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
                      <input
                        type="number"
                        min={2020}
                        max={2100}
                        value={statsForm.year}
                        onChange={(e) => setStatsForm((prev) => ({ ...prev, year: Number(e.target.value) || prev.year }))}
                        className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-200 focus:border-[#0ea5e9] outline-none focus:bg-gray-100 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Month</label>
                      <div className="relative" id="month-dropdown">
                        <button
                          type="button"
                          disabled={statsForm.view === "year"}
                          onClick={() => statsForm.view !== "year" && setMonthMenuOpen(!monthMenuOpen)}
                          className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 text-left outline-none hover:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9] flex items-center justify-between disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          <span>{monthLabels[statsForm.month - 1]}</span>
                          <span className="material-symbols-outlined text-gray-400 text-base">expand_more</span>
                        </button>
                        {monthMenuOpen && statsForm.view !== "year" && (
                          <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 max-h-60 overflow-y-auto">
                            {monthLabels.map((month, index) => (
                              <button
                                key={month}
                                type="button"
                                onClick={() => {
                                  setStatsForm(prev => ({ ...prev, month: index + 1 }))
                                  setMonthMenuOpen(false)
                                }}
                                className={`w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                  statsForm.month === index + 1 ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] font-semibold' : 'text-gray-700'
                                }`}
                              >
                                <span>{month}</span>
                                {statsForm.month === index + 1 && <span className="material-symbols-outlined text-[18px] text-[#0ea5e9]">check</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Day</label>
                      <input
                        type="date"
                        disabled={statsForm.view !== "day"}
                        value={statsForm.day}
                        onChange={(e) => setStatsForm((prev) => ({ ...prev, day: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-200 focus:border-[#0ea5e9] outline-none focus:bg-gray-100 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                      <div className="relative" id="status-dropdown">
                        <button
                          type="button"
                          onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                          className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 text-left outline-none hover:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9] flex items-center justify-between"
                        >
                          <span>{statsForm.status === "all" ? "Semua Status" : getStatusLabel(statsForm.status)}</span>
                          <span className="material-symbols-outlined text-gray-400 text-base">expand_more</span>
                        </button>
                        {statusMenuOpen && (
                          <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 max-h-60 overflow-y-auto">
                            {STATUS_FILTERS.map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => {
                                  setStatsForm(prev => ({ ...prev, status }))
                                  setStatusMenuOpen(false)
                                }}
                                className={`w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                  statsForm.status === status ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] font-semibold' : 'text-gray-700'
                                }`}
                              >
                                <span>{status === "all" ? "Semua Status" : getStatusLabel(status)}</span>
                                {statsForm.status === status && <span className="material-symbols-outlined text-[18px] text-[#0ea5e9]">check</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setStatsConfig({ ...statsForm })}
                    className="px-5 py-3 rounded-lg bg-[#0ea5e9] text-white text-sm font-semibold hover:bg-sky-600 transition-colors"
                  >
                    Muat Grafik
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                  <div className="rounded-lg bg-slate-50 border border-slate-100 p-4">
                    <p className="text-xs text-slate-600">Revenue</p>
                    <p className="text-xl font-bold text-slate-900">Rp {chartData.summary.revenue.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-100 p-4">
                    <p className="text-xs text-slate-600">Ticket Sold</p>
                    <p className="text-xl font-bold text-slate-900">{chartData.summary.tickets}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-100 p-4">
                    <p className="text-xs text-slate-600">Transactions</p>
                    <p className="text-xl font-bold text-slate-900">{chartData.summary.transactions}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                  <StatsBarChart
                    title="Revenue"
                    subtitle="Akumulasi pendapatan transaksi selesai"
                    color="#f59e0b"
                    data={chartData.revenue}
                  />
                  <StatsBarChart
                    title="Ticket Sold"
                    subtitle="Jumlah tiket dari transaksi selesai"
                    color="#0ea5e9"
                    data={chartData.tickets}
                  />
                  <StatsBarChart
                    title="Transactions"
                    subtitle="Jumlah transaksi pada periode aktif"
                    color="#0d9488"
                    data={chartData.transactions}
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === "transactions" && (
            <>
              {loading ? (
                <div className="text-center py-20 text-gray-400">Memuat transaksi...</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="rounded-xl border border-gray-200 shadow-sm text-center py-20 px-6">
                  <span className="material-symbols-outlined text-5xl text-gray-400 mb-3 block">dashboard</span>
                  <p className="text-gray-700 font-semibold">Belum ada transaksi</p>
                  <p className="text-gray-500 text-sm mt-1">Transaksi akan muncul di sini setelah customer membeli tiket event Anda.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="relative" id="transaction-filter-dropdown">
                      <button
                        type="button"
                        onClick={() => setTransactionFilterMenuOpen(!transactionFilterMenuOpen)}
                        className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 text-left outline-none hover:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9] flex items-center justify-between"
                      >
                        <span>{transactionFilter === "all" ? "Semua Status" : getStatusLabel(transactionFilter)}</span>
                        <span className="material-symbols-outlined text-gray-400 text-base">expand_more</span>
                      </button>
                      {transactionFilterMenuOpen && (
                        <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 max-h-60 overflow-y-auto">
                          {STATUS_FILTERS.map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => {
                                setTransactionFilter(status)
                                setTransactionFilterMenuOpen(false)
                              }}
                              className={`w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                transactionFilter === status ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] font-semibold' : 'text-gray-700'
                              }`}
                            >
                              <span>{status === "all" ? "Semua Status" : getStatusLabel(status)}</span>
                              {transactionFilter === status && <span className="material-symbols-outlined text-[18px] text-[#0ea5e9]">check</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {filteredTransactions.map((tx, index) => (
                    <div
                      key={tx.id}
                      className={`p-5 ${index !== filteredTransactions.length - 1 ? "border-b border-gray-100" : ""}`}
                    >
                      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
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
                              <span>Rp {tx.finalPrice.toLocaleString("id-ID")}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">calendar_today</span>
                              <span>{new Date(tx.createdAt).toLocaleDateString("id-ID")}</span>
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

                        {tx.status === "WAITING_CONFIRMATION" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmAction({ id: tx.id, action: "ACCEPT" })}
                              className="px-4 py-2.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                            >
                              Terima
                            </button>
                            <button
                              onClick={() => setConfirmAction({ id: tx.id, action: "REJECT" })}
                              className="px-4 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
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
                <div className="space-y-5">
                  {events.map((event) => {
                    const eventParticipants = transactions.filter(
                      (tx) => tx.event.id === event.id && tx.status === "DONE"
                    )
                    const totalTickets = eventParticipants.reduce((sum, tx) => sum + tx.quantity, 0)
                    const totalRevenue = eventParticipants.reduce((sum, tx) => sum + tx.finalPrice, 0)

                    return (
                      <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-800 font-['Plus_Jakarta_Sans']">{event.title}</h3>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total Peserta: {eventParticipants.length}</p>
                            <p className="text-sm text-gray-500">Total Tiket: {totalTickets}</p>
                            <p className="text-sm font-bold text-[#0ea5e9]">Rp {totalRevenue.toLocaleString("id-ID")}</p>
                          </div>
                        </div>

                        {eventParticipants.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-4">Belum ada peserta untuk event ini</p>
                        ) : (
                          <div className="space-y-2">
                            {eventParticipants.map((tx) => (
                              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="text-sm font-medium text-gray-800">{tx.customer.email}</p>
                                  <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString("id-ID")}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-gray-800">{tx.quantity} tiket</p>
                                  <p className="text-xs text-[#0ea5e9]">Rp {tx.finalPrice.toLocaleString("id-ID")}</p>
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

          {activeTab === "events" && (
            <>
              {loading ? (
                <div className="text-center py-20 text-gray-400">Memuat event...</div>
              ) : events.length === 0 ? (
                <div className="rounded-xl border border-gray-200 shadow-sm text-center py-20 px-6">
                  <span className="material-symbols-outlined text-5xl text-gray-400 mb-3 block">event</span>
                  <p className="text-gray-700 font-semibold">Belum ada event</p>
                  <p className="text-gray-500 text-sm mt-1">Buat event untuk mulai mengelola event Anda.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {events.map((event, index) => (
                    <div
                      key={event.id}
                      className={`p-5 ${index !== events.length - 1 ? "border-b border-gray-100" : ""}`}
                    >
                      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-bold text-gray-800 font-['Plus_Jakarta_Sans']">{event.title}</h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {event.startDate
                                  ? new Date(event.startDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })
                                  : "-"}
                              </p>
                              <p className="text-sm text-gray-500">{event.location}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              event.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}>
                              {event.status === "ACTIVE" ? "Aktif" : "Kedaluwarsa"}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">payments</span>
                              <span>Rp {event.price.toLocaleString("id-ID")}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">event_seat</span>
                              <span>{event.availableSeats} kursi tersedia</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            to={`/events/edit/${event.id}`}
                            className="px-4 py-2.5 bg-[#0ea5e9] text-white text-sm font-medium rounded-lg hover:bg-sky-600 transition-colors"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

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
