import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import api from "../lib/axios"

interface Voucher {
  id: number
  code: string
  discount: number
  startDate: string
  expiryDate: string
}

export default function CreateEventPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [isPaid, setIsPaid] = useState(true)
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [newVoucher, setNewVoucher] = useState({ code: "", discount: "", startDate: "", expiryDate: "" })
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("info") // info, schedule, price

  const categories = [
    { label: "Festival", icon: "festival" },
    { label: "Solo Concert", icon: "person" },
    { label: "Arena Concert", icon: "stadium" },
    { label: "Intimate Concert", icon: "music_note" },
    { label: "Others", icon: "more_horiz" },
  ]

  const [formData, setFormData] = useState({
    title: "",
    category: "Festival",
    location: "",
    address: "",
    description: "",
    startDate: "",
    endDate: "",
    price: "",
    totalSeats: "",
    imageUrl: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePaidToggle = (paid: boolean) => {
    setIsPaid(paid)
    if (!paid) {
      setFormData(prev => ({ ...prev, price: "" }))
    }
  }

  const addVoucher = () => {
    if (newVoucher.code && newVoucher.discount && newVoucher.startDate && newVoucher.expiryDate) {
      setVouchers(prev => [...prev, { 
        id: Date.now(),
        code: newVoucher.code, 
        discount: parseInt(newVoucher.discount),
        startDate: newVoucher.startDate,
        expiryDate: newVoucher.expiryDate
      }])
      setNewVoucher({ code: "", discount: "", startDate: "", expiryDate: "" })
    }
  }

  const removeVoucher = (id: number) => {
    setVouchers(prev => prev.filter(v => v.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault()
    setLoading(true)

    try {
      const eventData = {
        title: formData.title,
        category: formData.category,
        location: formData.location,
        address: formData.address,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        price: isPaid ? parseInt(formData.price) || 0 : 0,
        totalSeats: parseInt(formData.totalSeats) || 0,
        imageUrl: formData.imageUrl,
        isPaid,
        isDraft,
        vouchers,
      }

      await api.post("/api/events", eventData)
      navigate(isDraft ? "/dashboard/events" : "/browse")
    } catch (error) {
      console.error("Failed to create event:", error)
      alert("Gagal membuat event. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
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
                    <span className="material-symbols-outlined text-[#0ea5e9]">lightbulb</span>
                  </div>
                  <h3 className="font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Tips Membuat Event</h3>
                </div>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-base mt-0.5">check</span>
                    <span>Gunakan judul yang jelas dan menarik</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-base mt-0.5">check</span>
                    <span>Tambahkan foto berkualitas tinggi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-base mt-0.5">check</span>
                    <span>Deskripsikan event dengan detail</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-base mt-0.5">check</span>
                    <span>Tentukan harga yang kompetitif</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Form */}
            <div className="lg:col-span-8 space-y-5">
              {/* Tab Navigation */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                {/* Tab Headers */}
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
                      required
                      rows={4}
                      placeholder="Jelaskan tentang event Anda..."
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      URL Foto Event
                    </label>
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
                          Lokasi <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            placeholder="Contoh: Gambir Expo, Jakarta"
                            className="w-full px-4 pl-10 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                          />
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">location_on</span>
                        </div>
              </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Alamat Lengkap <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          rows={2}
                          placeholder="Contoh: Jl. H. Benyamin Sueb, Kemayoran, Jakarta Pusat"
                          className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9] resize-none"
                        />
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
                {/* Toggle Gratis/Berbayar */}
                <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handlePaidToggle(true)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                      isPaid 
                        ? "bg-white text-[#0c4a6e] shadow-sm" 
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Berbayar
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePaidToggle(false)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                      !isPaid 
                        ? "bg-white text-[#0c4a6e] shadow-sm" 
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Gratis
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isPaid && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Harga Tiket (Rp) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">Rp</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          required={isPaid}
                          min="0"
                          placeholder="150000"
                          className="w-full px-4 pl-10 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Total Kursi Tersedia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalSeats"
                      value={formData.totalSeats}
                      onChange={handleChange}
                      required
                      min="1"
                      placeholder="500"
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                    />
                  </div>
                </div>

                      <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-800 mb-3 font-['Plus_Jakarta_Sans']">Voucher Promo (Opsional)</h3>
                
                <div className="flex flex-col md:flex-row gap-3 mb-4">
                  <input
                    type="text"
                    value={newVoucher.code}
                    onChange={(e) => setNewVoucher(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Kode voucher (contoh: DISKON20)"
                    className="flex-1 px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                  />
                  <input
                    type="number"
                    value={newVoucher.discount}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === "" || (parseInt(value) >= 1 && parseInt(value) <= 100)) {
                                setNewVoucher(prev => ({ ...prev, discount: value }))
                              }
                            }}
                    placeholder="Diskon %"
                    min="1"
                    max="100"
                    className="w-full md:w-24 px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                  />
                          <input
                            type="date"
                            value={newVoucher.startDate}
                            onChange={(e) => setNewVoucher(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full md:w-40 px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                          />
                  <input
                    type="date"
                    value={newVoucher.expiryDate}
                    onChange={(e) => setNewVoucher(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full md:w-40 px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                  />
                  <button
                    type="button"
                    onClick={addVoucher}
                    className="px-6 py-3 bg-[#0ea5e9] text-white rounded-lg text-sm font-semibold hover:bg-[#0284c7] transition-colors whitespace-nowrap"
                  >
                    Tambah
                  </button>
                </div>

                {/* Active Vouchers */}
                {vouchers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Voucher Aktif:</p>
                    {vouchers.map((voucher) => (
                      <div key={voucher.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[#0ea5e9] text-base">local_offer</span>
                          <span className="font-semibold text-gray-800">{voucher.code}</span>
                          <span className="text-sm text-gray-600">{voucher.discount}% OFF</span>
                                  <span className="text-xs text-gray-500">{new Date(voucher.startDate).toLocaleDateString('id-ID')} - {new Date(voucher.expiryDate).toLocaleDateString('id-ID')}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVoucher(voucher.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, false)}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-[#0ea5e9] text-white rounded-lg font-semibold hover:bg-[#0284c7] transition-colors disabled:opacity-50 flex items-center justify-center text-base shadow-lg"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg font-normal mr-2">refresh</span>
                      Memproses...
                    </>
                  ) : (
                    "Publikasikan Event"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
