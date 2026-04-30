import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import api from "../lib/axios"

interface Voucher {
  id: number
  code: string
  discount: number
  startDate: string
  endDate: string
}

export default function EditEventPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [isPaid, setIsPaid] = useState(true)
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [newVoucher, setNewVoucher] = useState({ code: "", discount: "", startDate: "", endDate: "" })
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const [locationMenuOpen, setLocationMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("info")

  const categories = [
    { label: "Festival", icon: "festival" },
    { label: "Solo Concert", icon: "person" },
    { label: "Arena Concert", icon: "stadium" },
    { label: "Intimate Concert", icon: "music_note" },
    { label: "Others", icon: "more_horiz" },
  ]

  const locations = ["Jakarta", "Bandung", "Surabaya", "Bali"]

  const [formData, setFormData] = useState({
    title: "",
    category: "Festival",
    location: "Jakarta",
    description: "",
    startDate: "",
    endDate: "",
    price: "",
    totalSeats: "",
    imageUrl: "",
  })

  useEffect(() => {
    if (!id) return

    api.get(`/api/events/${id}`)
      .then(res => {
        const event = res.data.event
        // Convert to local datetime string for datetime-local input
        const toLocalISOString = (date: string) => {
          const d = new Date(date)
          const offset = d.getTimezoneOffset() * 60000
          const localISOTime = new Date(d.getTime() - offset).toISOString().slice(0, 16)
          return localISOTime
        }

        setFormData({
          title: event.title || "",
          category: event.category || "Festival",
          location: event.location || "",
          description: event.description || "",
          startDate: event.startDate ? toLocalISOString(event.startDate) : "",
          endDate: event.endDate ? toLocalISOString(event.endDate) : "",
          price: event.price ? String(event.price) : "",
          totalSeats: event.totalSeats ? String(event.totalSeats) : "",
          imageUrl: event.imageUrl || "",
        })
        setIsPaid(event.price > 0)
        setVouchers(event.vouchers || [])
      })
      .catch(console.error)
      .finally(() => setFetchLoading(false))
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePaidToggle = (paid: boolean) => {
    setIsPaid(paid)
    if (!paid) {
      setFormData(prev => ({ ...prev, price: "0" }))
    }
  }

  const handleAddVoucher = () => {
    if (!newVoucher.code || !newVoucher.discount || !newVoucher.startDate || !newVoucher.endDate) return

    // Set expiry date to end of day (23:59:59) instead of 00:00:00
    const endDate = new Date(newVoucher.endDate)
    endDate.setHours(23, 59, 59, 999)

    setVouchers([...vouchers, { id: Date.now(), ...newVoucher, discount: Number(newVoucher.discount), endDate: endDate.toISOString() }])
    setNewVoucher({ code: "", discount: "", startDate: "", endDate: "" })
  }

  const handleRemoveVoucher = (id: number) => {
    setVouchers(vouchers.filter(v => v.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        price: isPaid ? Number(formData.price) : 0,
        totalSeats: Number(formData.totalSeats),
        vouchers,
      }
      console.log("Sending payload:", JSON.stringify(payload, null, 2))

      await api.put(`/api/events/${id}`, payload)
      navigate("/dashboard")
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal mengupdate event")
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen font-['Inter'] pt-12" style={{ background: "#f3f4f6" }}>
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400">Memuat event...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen font-['Inter'] pt-12" style={{ background: "#f3f4f6" }}>
      <Navbar />

      <main className="pt-8 pb-5 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Info */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#0ea5e9]">edit</span>
                  </div>
                  <h3 className="font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Edit Event</h3>
                </div>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-base mt-0.5">check</span>
                    <span>Perbarui informasi event yang sudah ada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-base mt-0.5">check</span>
                    <span>Ubah jadwal dan lokasi event</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-base mt-0.5">check</span>
                    <span>Atur harga dan kuota tiket</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-base mt-0.5">check</span>
                    <span>Kelola voucher promo</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Form */}
            <div className="lg:col-span-8 space-y-5">
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab("info")}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                      activeTab === "info"
                        ? "text-[#0c4a6e] border-b-2 border-[#0c4a6e] bg-[#f8fafc]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Informasi Event
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("schedule")}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                      activeTab === "schedule"
                        ? "text-[#0c4a6e] border-b-2 border-[#0c4a6e] bg-[#f8fafc]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Jadwal & Lokasi
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("price")}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                      activeTab === "price"
                        ? "text-[#0c4a6e] border-b-2 border-[#0c4a6e] bg-[#f8fafc]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Tiket & Promo
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-5">
                  {activeTab === "info" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Nama Event <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                          placeholder="Contoh: Synchronize Fest 2026"
                          className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Kategori <span className="text-red-500">*</span>
                        </label>
                        <div className="relative" id="category-dropdown">
                          <button
                            type="button"
                            onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                            className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 text-left outline-none hover:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9] flex items-center justify-between"
                          >
                            <span>{formData.category}</span>
                            <span className="material-symbols-outlined text-gray-400 text-base">expand_more</span>
                          </button>
                          {categoryMenuOpen && (
                            <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                              {categories.map((cat) => (
                                <button
                                  key={cat.label}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, category: cat.label }))
                                    setCategoryMenuOpen(false)
                                  }}
                                  className={`w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                    formData.category === cat.label ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] font-semibold' : 'text-gray-700'
                                  }`}
                                >
                                  <span>{cat.label}</span>
                                  {formData.category === cat.label && <span className="material-symbols-outlined text-[18px] text-[#0ea5e9]">check</span>}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Deskripsi Event <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={4}
                          required
                          placeholder="Jelaskan tentang event Anda..."
                          className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9] resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">URL Foto Event</label>
                        <input
                          type="url"
                          name="imageUrl"
                          value={formData.imageUrl}
                          onChange={handleChange}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                        />
                      </div>
                    </div>
                  ) : activeTab === "schedule" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Kota/Lokasi <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setLocationMenuOpen(!locationMenuOpen)}
                            className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 text-left outline-none hover:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9] flex items-center justify-between"
                          >
                            <span>{formData.location}</span>
                            <span className="material-symbols-outlined text-gray-400 text-base">expand_more</span>
                          </button>
                          {locationMenuOpen && (
                            <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 max-h-24 overflow-y-auto">
                              {locations.map((loc) => (
                                <button
                                  key={loc}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, location: loc }))
                                    setLocationMenuOpen(false)
                                  }}
                                  className={`w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                    formData.location === loc ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] font-semibold' : 'text-gray-700'
                                  }`}
                                >
                                  <span>{loc}</span>
                                  {formData.location === loc && <span className="material-symbols-outlined text-[18px] text-[#0ea5e9]">check</span>}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Tanggal & Waktu Mulai <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="datetime-local"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Tanggal & Waktu Selesai <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="datetime-local"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe Tiket</label>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => handlePaidToggle(true)}
                            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
                              isPaid ? "bg-[#0ea5e9] text-white" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            Berbayar
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePaidToggle(false)}
                            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
                              !isPaid ? "bg-[#0ea5e9] text-white" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            Gratis
                          </button>
                        </div>
                      </div>

                      {isPaid && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Harga Tiket (IDR) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            required
                            placeholder="Contoh: 150000"
                            className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Total Kursi <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="totalSeats"
                          value={formData.totalSeats}
                          onChange={handleChange}
                          min="1"
                          required
                          placeholder="Contoh: 1000"
                          className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                        />
                      </div>

                      {/* Voucher Section */}
                      {isPaid && (
                      <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Voucher Promo</h3>
                        <div className="space-y-2 mb-4">
                          {vouchers.map(voucher => (
                            <div key={voucher.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                              <span className="flex-1 text-sm font-medium text-gray-800">{voucher.code}</span>
                              <span className="text-sm text-gray-600">{voucher.discount}% OFF</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveVoucher(voucher.id)}
                                className="text-red-500 text-sm font-medium hover:underline"
                              >
                                Hapus
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Kode voucher"
                            value={newVoucher.code}
                            onChange={(e) => setNewVoucher(prev => ({ ...prev, code: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                          />
                          <input
                            type="number"
                            placeholder="Diskon (%)"
                            value={newVoucher.discount}
                            onChange={(e) => setNewVoucher(prev => ({ ...prev, discount: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Berlaku Mulai</label>
                            <input
                              type="date"
                              value={newVoucher.startDate}
                              onChange={(e) => setNewVoucher(prev => ({ ...prev, startDate: e.target.value }))}
                              className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Berakhir</label>
                            <input
                              type="date"
                              value={newVoucher.endDate}
                              onChange={(e) => setNewVoucher(prev => ({ ...prev, endDate: e.target.value }))}
                              className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddVoucher}
                          className="w-full py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Tambah Voucher
                        </button>
                      </div>
                      )}
                    </div>
                  )}

                  {/* Submit Buttons */}
                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard")}
                      className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 bg-[#0ea5e9] text-white text-sm font-semibold rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
