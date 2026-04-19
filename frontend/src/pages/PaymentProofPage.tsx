import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import api from "../lib/axios"

export default function PaymentProofPage() {
  const { id } = useParams()

  const [transaction, setTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!id) return
    api.get(`/api/transactions/${id}`)
      .then(res => {
        const tx = res.data.transaction
        setTransaction(tx)
        // Hitung sisa waktu dari paymentDeadline sesuai dokumentasi (2 jam)
        const deadline = new Date(tx.paymentDeadline).getTime()
        const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000))
        setTimeLeft(remaining)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft > 0])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!uploadedFile) {
      alert("Silakan pilih file bukti pembayaran terlebih dahulu")
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('paymentProof', uploadedFile)
      await api.post(`/api/transactions/${id}/upload-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert("Bukti pembayaran berhasil diunggah! Menunggu konfirmasi organizer.")
      // Refresh data transaksi
      const res = await api.get(`/api/transactions/${id}`)
      setTransaction(res.data.transaction)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengunggah bukti pembayaran')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Memuat...</p></div>
  if (!transaction) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Transaksi tidak ditemukan</p></div>

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string }> = {
      "menunggu pembayaran": { bg: "bg-yellow-100 text-yellow-700", text: "Menunggu Pembayaran" },
      "menunggu konfirmasi admin": { bg: "bg-blue-100 text-blue-700", text: "Menunggu Konfirmasi Admin" },
      "selesai": { bg: "bg-green-100 text-green-700", text: "Selesai" },
      "ditolak": { bg: "bg-red-100 text-red-700", text: "Ditolak" },
      "kedaluwarsa": { bg: "bg-gray-100 text-gray-700", text: "Kedaluwarsa" },
      "dibatalkan": { bg: "bg-gray-100 text-gray-700", text: "Dibatalkan" },
    }
    const config = statusConfig[status] || statusConfig["menunggu pembayaran"]
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg}`}>
        {config.text}
      </span>
    )
  }

  return (
    <div className="min-h-screen font-['Inter'] pt-12" style={{ background: "#f3f4f6" }}>
      <Navbar />

      <section className="pt-8 pb-5 px-5">
        <div className="max-w-7xl mx-auto">
          
          {/* Countdown Timer - Full Width */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans'] mb-1">Waktu Tersisa</h2>
                <p className="text-sm text-gray-600">Unggah bukti pembayaran dalam waktu yang tersisa</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#0c4a6e] font-mono">{formatTime(timeLeft)}</div>
                <p className="text-xs text-gray-500">Sisa waktu</p>
              </div>
            </div>
            {timeLeft <= 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Waktu habis! Transaksi Anda telah kedaluwarsa.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* LEFT COLUMN - Upload Form */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* Transaction Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Detail Transaksi</h2>
                </div>
                <div className="p-5">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#0ea5e9] text-lg mt-0.5">confirmation_number</span>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">ID Transaksi</p>
                        <p className="text-sm font-medium text-gray-900">{transaction.id}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#0ea5e9] text-lg mt-0.5">event</span>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Event</p>
                        <p className="text-sm font-medium text-gray-900">{transaction.event?.title}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#0ea5e9] text-lg mt-0.5">calendar_today</span>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Tanggal</p>
                        <p className="text-sm font-medium text-gray-900">{transaction.event ? new Date(transaction.event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#0ea5e9] text-lg mt-0.5">location_on</span>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Lokasi</p>
                        <p className="text-sm font-medium text-gray-900">{transaction.event?.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#0ea5e9] text-lg mt-0.5">confirmation_number</span>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Jumlah Tiket</p>
                        <p className="text-sm font-medium text-gray-900">{transaction.quantity} tiket</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Area */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans'] mb-4">Upload Bukti Pembayaran</h2>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#0ea5e9] transition-colors">
                  <div className="flex flex-col items-center">
                    <span className="material-symbols-outlined text-5xl text-gray-400 mb-3">cloud_upload</span>
                    <p className="text-sm text-gray-600 mb-2">Drag & drop file bukti pembayaran</p>
                    <p className="text-xs text-gray-500 mb-4">atau klik untuk memilih file</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center gap-2 bg-[#0ea5e9] text-white px-4 py-2 rounded-lg hover:bg-[#0284c7] transition-colors cursor-pointer text-sm font-medium"
                    >
                      <span className="material-symbols-outlined text-base">folder_open</span>
                      Pilih File
                    </label>
                  </div>
                </div>

                {uploadedFile && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#0ea5e9]">description</span>
                      <span className="text-sm text-gray-700">{uploadedFile.name}</span>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={!uploadedFile || uploading || timeLeft <= 0}
                  className="w-full mt-4 bg-[#0ea5e9] text-white py-3 font-bold text-sm rounded-lg hover:bg-[#0284c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-base">refresh</span>
                      Mengunggah...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">upload</span>
                      Upload Bukti Bayar
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  Format yang didukung: JPG, PNG, JPEG. Maksimal ukuran file: 5MB.
                </p>
              </div>

            </div>

            {/* RIGHT COLUMN - Status & Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-5">
                
                {/* Status Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h2 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans'] mb-4">Status Transaksi</h2>
                  <div className="flex items-center justify-center mb-4">
                    {getStatusBadge(transaction.status?.toLowerCase().replace('_', ' ').replace('_', ' '))}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Status saat ini</p>
                    <p className="text-xs text-gray-500">
                      {transaction.status === "WAITING_PAYMENT" && "Silakan upload bukti pembayaran untuk melanjutkan"}
                      {transaction.status === "WAITING_CONFIRMATION" && "Bukti pembayaran sedang diverifikasi"}
                      {transaction.status === "DONE" && "Transaksi berhasil! Tiket Anda telah diterbitkan"}
                      {transaction.status === "REJECTED" && "Bukti pembayaran ditolak. Silakan upload ulang"}
                      {transaction.status === "EXPIRED" && "Waktu upload telah habis"}
                      {transaction.status === "CANCELLED" && "Transaksi telah dibatalkan"}
                    </p>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h2 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans'] mb-4">Ringkasan Pembayaran</h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Harga Tiket (x{transaction.quantity})</span>
                      <span className="text-gray-900 font-medium">Rp {transaction.basePrice?.toLocaleString()}</span>
                    </div>
                    {transaction.pointsUsed > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Diskon Poin</span>
                        <span className="text-green-600 font-medium">-Rp {transaction.pointsUsed.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex justify-between">
                        <span className="text-base font-bold text-gray-900">Total Bayar</span>
                        <span className="text-xl font-bold text-[#0c4a6e]">Rp {transaction.finalPrice?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/10 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[#0ea5e9]">info</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 mb-1">Informasi Penting</p>
                      <ul className="space-y-1 text-xs text-gray-600">
                        <li className="flex gap-2">
                          <span className="text-[#f97316] mt-0.5">•</span>
                          <span>Upload bukti dalam 2 jam setelah checkout</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#f97316] mt-0.5">•</span>
                          <span>Pastikan bukti pembayaran jelas terbaca</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#f97316] mt-0.5">•</span>
                          <span>Status akan berubah setelah verifikasi admin</span>
                        </li>
                      </ul>
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
