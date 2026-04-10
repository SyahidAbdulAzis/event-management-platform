import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import api from "../lib/axios"

interface TicketVariant {
  name: string
  description: string
  price: number
}

interface Voucher {
  code: string
  discount: number
}

export default function CreateEventPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [isPaid, setIsPaid] = useState(true)
  const [ticketVariants, setTicketVariants] = useState<TicketVariant[]>([
    { name: "EARLY_ADOPTER_PASS", description: "Limited to 500 units", price: 750000 },
    { name: "GENERAL_MISSION", description: "Standard admission", price: 1000000 },
  ])
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [newVoucher, setNewVoucher] = useState({ code: "", discount: "" })

  const [formData, setFormData] = useState({
    title: "",
    category: "UNDERGROUND_RAVE",
    location: "",
    description: "",
    startDate: "",
    endDate: "",
    price: "1000000",
    totalSeats: "5000",
  })

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

  const addVoucher = () => {
    if (newVoucher.code && newVoucher.discount) {
      setVouchers(prev => [...prev, { code: newVoucher.code, discount: parseInt(newVoucher.discount) }])
      setNewVoucher({ code: "", discount: "" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const eventData = {
        title: formData.title,
        category: formData.category,
        location: formData.location,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        price: parseInt(formData.price) || 0,
        totalSeats: parseInt(formData.totalSeats) || 0,
        isPaid,
        ticketVariants,
        vouchers,
      }

      await api.post("/api/events", eventData)
      navigate("/browse")
    } catch (error) {
      console.error("Failed to create event:", error)
      alert("Failed to create event. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-body">
      <Navbar />

      <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar / Header Area */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="sticky top-32">
            <p className="font-label text-primary tracking-[0.2em] mb-4">LOGISTICS PORTAL</p>
            <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter leading-[0.85] mb-8">
              NEW <br/>PROJECT <br/>DEPLOY.
            </h1>
            <p className="text-on-surface-variant font-body max-w-xs text-lg leading-relaxed mb-12">
              Initialize a new vibe terminal. precision timing, aggressive logistics, no excuses.
            </p>
            <div className="bg-surface-container-low p-8 border-l-4 border-primary-dim">
              <span className="material-symbols-outlined text-primary-dim text-4xl mb-4">bolt</span>
              <h3 className="font-headline font-bold text-xl mb-2">AUTO-SYNC ACTIVE</h3>
              <p className="text-sm text-stone-500 font-body">All event data is cached locally before global broadcast.</p>
            </div>
          </div>
        </div>

        {/* Form Canvas */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 flex flex-col gap-16">
          {/* Section: Primary Identity */}
          <section className="flex flex-col gap-10">
            <div className="flex items-end justify-between border-b border-outline-variant pb-4">
              <h2 className="font-headline font-extrabold text-3xl tracking-tight">IDENTITY_01</h2>
              <span className="font-label text-xs text-outline tracking-widest">REQUIRED</span>
            </div>
            <div className="grid grid-cols-1 gap-8">
              <div className="group">
                <label className="font-label text-xs text-outline tracking-widest block mb-4">EVENT NAME</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface-container-high border-none border-b-2 border-outline-variant py-6 px-4 text-3xl font-headline font-bold tracking-tighter transition-all focus:bg-surface-container-highest focus:border-primary-dim"
                  placeholder="CRITICAL_MASS_TOUR_2024"
                  type="text"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="font-label text-xs text-outline tracking-widest block mb-4">CATEGORY</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-surface-container-high border-none border-b-2 border-outline-variant py-4 px-4 font-body font-bold appearance-none transition-all focus:border-primary-dim"
                  >
                    <option value="UNDERGROUND_RAVE">UNDERGROUND_RAVE</option>
                    <option value="WAREHOUSE_SESSION">WAREHOUSE_SESSION</option>
                    <option value="INDUSTRIAL_TECHNO">INDUSTRIAL_TECHNO</option>
                    <option value="CYBER_PUNK_LIVE">CYBER_PUNK_LIVE</option>
                    <option value="CONCERT">CONCERT</option>
                    <option value="FESTIVAL">FESTIVAL</option>
                    <option value="WORKSHOP">WORKSHOP</option>
                    <option value="EXHIBITION">EXHIBITION</option>
                  </select>
                </div>
                <div>
                  <label className="font-label text-xs text-outline tracking-widest block mb-4">LOCATION</label>
                  <div className="relative">
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full bg-surface-container-high border-none border-b-2 border-outline-variant py-4 px-4 font-body font-bold focus:border-primary-dim"
                      placeholder="DOWNTOWN_CARGO_BAY_7"
                      type="text"
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline">location_on</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="font-label text-xs text-outline tracking-widest block mb-4">DESCRIPTION</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface-container-high border-none border-b-2 border-outline-variant py-4 px-4 font-body transition-all resize-none focus:border-primary-dim"
                  placeholder="Specify technical requirements, vibe parameters, and mission objectives..."
                  rows={4}
                />
              </div>
            </div>
          </section>

          {/* Section: Schedule */}
          <section className="flex flex-col gap-10">
            <div className="flex items-end justify-between border-b border-outline-variant pb-4">
              <h2 className="font-headline font-extrabold text-3xl tracking-tight">TIMELINE_02</h2>
              <span className="font-label text-xs text-outline tracking-widest">PRECISION ONLY</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="font-label text-xs text-outline tracking-widest block mb-4">START_TIMESTAMP</label>
                <input
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface-container-high border-none border-b-2 border-outline-variant py-4 px-4 font-label font-bold text-primary focus:border-primary-dim"
                  type="datetime-local"
                />
              </div>
              <div>
                <label className="font-label text-xs text-outline tracking-widest block mb-4">END_TIMESTAMP</label>
                <input
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface-container-high border-none border-b-2 border-outline-variant py-4 px-4 font-label font-bold text-primary focus:border-primary-dim"
                  type="datetime-local"
                />
              </div>
            </div>
          </section>

          {/* Section: Commercials */}
          <section className="flex flex-col gap-10">
            <div className="flex items-end justify-between border-b border-outline-variant pb-4">
              <h2 className="font-headline font-extrabold text-3xl tracking-tight">REVENUE_LOG_03</h2>
              <span className="font-label text-xs text-outline tracking-widest">IDR_SYSTEM</span>
            </div>
            <div className="bg-surface-container-low p-1 gap-1 flex">
              <button
                type="button"
                onClick={() => handlePaidToggle(true)}
                className={`flex-1 py-4 font-label font-bold transition-all ${isPaid ? "bg-primary-dim text-on-primary-fixed" : "text-outline hover:text-white"}`}
              >
                PAID_ACCESS
              </button>
              <button
                type="button"
                onClick={() => handlePaidToggle(false)}
                className={`flex-1 py-4 font-label font-bold transition-all ${!isPaid ? "bg-primary-dim text-on-primary-fixed" : "text-outline hover:text-white"}`}
              >
                OPEN_ENTRY
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="font-label text-xs text-outline tracking-widest block mb-4">BASE_TICKET_PRICE</label>
                <div className="flex items-center bg-surface-container-high border-b-2 border-outline-variant">
                  <span className="px-4 font-label font-bold text-primary">IDR</span>
                  <input
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    disabled={!isPaid}
                    className="flex-1 bg-transparent border-none py-4 px-2 font-label font-bold text-xl focus:border-primary-dim disabled:opacity-50"
                    placeholder="1.000.000"
                    type="number"
                  />
                </div>
              </div>
              <div>
                <label className="font-label text-xs text-outline tracking-widest block mb-4">MAX_CAPACITY</label>
                <input
                  name="totalSeats"
                  value={formData.totalSeats}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full bg-surface-container-high border-none border-b-2 border-outline-variant py-4 px-4 font-label font-bold text-xl text-white focus:border-primary-dim"
                  placeholder="5000"
                  type="number"
                />
              </div>
            </div>

            {/* Kinetic Ticket Types */}
            <div className="flex flex-col gap-4">
              <label className="font-label text-xs text-outline tracking-widest block">TICKET_VARIANTS</label>
              {ticketVariants.map((variant, index) => (
                <div key={index} className="bg-surface-container-low p-6 flex justify-between items-center group hover:bg-primary-dim transition-all cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-headline font-bold text-lg group-hover:text-black">{variant.name}</span>
                    <span className="font-label text-xs text-stone-500 group-hover:text-black/60">{variant.description}</span>
                  </div>
                  <span className="font-label font-bold text-primary-dim group-hover:text-black">Rp {variant.price.toLocaleString()}</span>
                </div>
              ))}
              <button
                type="button"
                className="w-full py-4 border-2 border-dashed border-outline-variant font-label text-xs text-outline tracking-widest hover:border-primary-dim hover:text-primary-dim transition-all"
              >
                + ADD_NEW_VARIANT
              </button>
            </div>
          </section>

          {/* Section: Vouchers */}
          <section className="flex flex-col gap-10">
            <div className="flex items-end justify-between border-b border-outline-variant pb-4">
              <h2 className="font-headline font-extrabold text-3xl tracking-tight">PROMO_MODULE_04</h2>
            </div>
            <div className="bg-surface-container-high p-8 flex flex-col md:flex-row gap-8 items-end">
              <div className="flex-1">
                <label className="font-label text-xs text-outline tracking-widest block mb-4">VOUCHER_CODE</label>
                <input
                  value={newVoucher.code}
                  onChange={(e) => setNewVoucher(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full bg-surface-container-lowest border-none border-b-2 border-primary-dim py-4 px-4 font-label font-bold tracking-widest text-primary focus:border-primary"
                  placeholder="VIBE_ELITE_20"
                  type="text"
                />
              </div>
              <div className="w-full md:w-48">
                <label className="font-label text-xs text-outline tracking-widest block mb-4">REDUCTION_%</label>
                <input
                  value={newVoucher.discount}
                  onChange={(e) => setNewVoucher(prev => ({ ...prev, discount: e.target.value }))}
                  className="w-full bg-surface-container-lowest border-none border-b-2 border-primary-dim py-4 px-4 font-label font-bold text-xl focus:border-primary"
                  placeholder="20"
                  type="number"
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={addVoucher}
                  className="bg-white text-black px-8 py-4 font-label font-bold hover:bg-primary-dim hover:text-white transition-all"
                >
                  ENABLE
                </button>
              </div>
            </div>

            {/* Display active vouchers */}
            {vouchers.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="font-label text-xs text-outline tracking-widest block">ACTIVE_VOUCHERS</label>
                {vouchers.map((voucher, index) => (
                  <div key={index} className="bg-surface-container-low p-4 flex justify-between items-center">
                    <span className="font-label font-bold text-primary">{voucher.code}</span>
                    <span className="font-label text-stone-500">{voucher.discount}% OFF</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Final Action */}
          <div className="pt-8 border-t-8 border-primary-dim">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex flex-col">
                <span className="font-label text-xs text-primary tracking-widest">READY FOR DEPLOYMENT</span>
                <span className="text-stone-500 text-sm font-body">Double check all parameters before broadcasting to VIBE network.</span>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => navigate("/browse")}
                  className="flex-1 md:flex-none border-2 border-outline px-10 py-6 font-headline font-bold text-lg hover:bg-on-surface hover:text-background transition-all"
                >
                  SAVE_DRAFT
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 md:flex-none bg-primary-dim text-on-primary-fixed px-12 py-6 font-headline font-black text-xl tracking-tighter hover:bg-primary transition-all shadow-[0_0_40px_-10px_rgba(105,90,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "DEPLOYING..." : "LAUNCH_EVENT"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}
