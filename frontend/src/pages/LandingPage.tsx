import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { useAuthStore } from "../store/authStore"
import api from "../lib/axios"

interface Event {
  id: string
  title: string
  description: string
  category: string
  location: string
  imageUrl: string | null
  startDate: string
  endDate: string
  price: number
  totalSeats: number
  availableSeats: number
  isSoldOut: boolean
}

// Dummy data untuk events - persis seperti gambar di HTML
const DUMMY_EVENTS: Event[] = [
  {
    id: "1",
    title: "NEON VOID FEST",
    description: "Warehouse 88, Jakarta Selatan",
    category: "Festival",
    location: "Jakarta",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzq-dW3yZV-ql0lWlPdefh8t2RODat8cc22gqXpBT13gK_Y30CReKj9xx_j4zGxkHra9OUJK4P3MI0r7JdQKNw8NJ3Rj5cv4mu5QrXGEvywZ4t8sZFvmYrTMPuk_qzdCEO_TcDiCotlIUcR3GC6tOgFUMizFwQxh_aO8eqjebrjSHPM8lCajhOMrz-K8NFZaomT8gniLfqwJzrkKu-Vsyr4kQ5pYGU-vx8Pt6W4OJoZb-S4bkzaIUYjzPOZVQPV7ylG6LUz5YnOH2M",
    startDate: "2024-10-24",
    endDate: "2024-10-25",
    price: 850000,
    totalSeats: 5000,
    availableSeats: 0,
    isSoldOut: true,
  },
  {
    id: "2",
    title: "CRUSHING DEPTHS",
    description: "Titanium Club, Surabaya",
    category: "Concert",
    location: "Surabaya",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBpOCrupZvHDjwkmDicu2Ke_i_8LX6W6pVT9wIzYg-XQaWXuvQnQuIF_4_g0zI1Et5A4nNxPFsm2cN1Q3PElgGbgbUU0XCbHvhLSQ0vvSdGwc_SUOfqx1AEw7OR3pA-2hRuvNvC0PBhWcX9SY36pKMlHleSUimtpcdGHFD6q9CSISwTFRiL1H6tecG8rD64Y4cBRPOqkUOtGor8A1ziNtF-iqQ3q3p7rWgnY6FjEqzYaXBj73HW9f-MH1WO-6_zQCyPmt-oXran1Ys-",
    startDate: "2024-11-12",
    endDate: "2024-11-12",
    price: 450000,
    totalSeats: 1000,
    availableSeats: 350,
    isSoldOut: false,
  },
  {
    id: "3",
    title: "LOCAL STATIC",
    description: "Free open-air concert featuring local indie bands and artists.",
    category: "Concert",
    location: "Open Air Stage, Bandung",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFF3bN_63bu3MJBdNNgfMMh6ZXJruxk0CmqjinTjLyxLn-6V8qYKk7PNKdKeD_NaYKBNC4064MuuBZm8Sml1kEfwxxmfUSBX1ZIyLjW7gL2jd6hPkpbZeeZGgYO5Lvs0PFQANcndgezGtNo3A4P8dPo83Ir7dwGH4ZElDRwcpY_kzSXG4eOEZFSYp6LznqlTd9DKZFeLElGqFmCsd6yLOtW-E4_kzNidkjflPmcsa3RHC9KXuM0y98Hi7eeCUzQbpPn1QA2JWQwS-E",
    startDate: "2024-11-15",
    endDate: "2024-11-15",
    price: 0,
    totalSeats: 2000,
    availableSeats: 800,
    isSoldOut: false,
  },
  {
    id: "4",
    title: "RAW UNPLUGGED",
    description: "Minimal production. Maximum output. Experience the rawest sound in the industrial heart of Bali.",
    category: "Workshop",
    location: "Concrete Gallery, Bali",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9wzorT371MAEvkLw_4N-mYcnjeqXDQrhMtEh8RHfub9gywEKT3nHs63Cu9pDgd516YgeJd619fC9Vm52qG-4zVgO3_78isNsSXJiE4zjcXnqNxCAAvE4d0Q6UTEN732fPSqIseJR_F0ldqHZBmPre9P-MkLyfmIpkJ22FRMGELesG_jYp-3qlHMJryC6y-f3ehO9k10aKhSrdzGD-PTi7Us_qF8Va1SgdOBQJT2-DVJlY4Q06_pBTWrkmByBPIHIeWko78eRbuogZ",
    startDate: "2024-12-05",
    endDate: "2024-12-05",
    price: 350000,
    totalSeats: 500,
    availableSeats: 120,
    isSoldOut: false,
  },
  {
    id: "5",
    title: "ELECTRIC DREAMS",
    description: "Synthwave and retro-future beats under neon lights.",
    category: "Concert",
    location: "Neon Hall, Jakarta",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDml9I7EwVgg1yvSG6SSf84PKwdlKbhMpUoQSdNaNnSAjCgiN5dsvO0sy5AI9FhT5JVkSPP-XaLUZ9WWAYnQlsTwF3Z1n3tSHFxlapjbl-XqTWr_S7ZCkCeMJOAHfUda5ysofmH0tjUHzF9KUheTL45h4US7v5rSu_p4LeUfjYLSRGRcRcIXLmoZi55eSdRltJThstUIrkbIPF8iZhraUGrd4vYteJKFlHjjIKCBJC2iiubRed7oYSyUvLhbzUFAaY094HkRWokflfz",
    startDate: "2024-11-28",
    endDate: "2024-11-28",
    price: 550000,
    totalSeats: 1500,
    availableSeats: 450,
    isSoldOut: false,
  },
  {
    id: "6",
    title: "UNDERGROUND RISING",
    description: "Showcase of emerging underground artists and experimental music.",
    category: "Exhibition",
    location: "Basement Studio, Yogyakarta",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJgN4gIM3LgJgCa3QJRT5_SOGLUg_s9UUKrYzXGoOLd1ISEE_j5ZRJz9dH-cbxST-agKV8ZPNjTUELyo-8vDVTE5fBIf6fTwht0_EDspQ0bnt5lG5p9ZWOodVOJcKxmOFK4u4Zo0GaHu_v2ePr8_2RFnCaj9pHBT24AZCipzoQqve2_YreVtEWcSZ1QNPNvwlP7SDaTwHZ9XY3Bc1lfeKGH4LX0RMo0zXa_3wQQ_dOvsC5vAHZudCPeIQi99_2aAw3cA-kn9fImTy6",
    startDate: "2024-12-18",
    endDate: "2024-12-20",
    price: 280000,
    totalSeats: 800,
    availableSeats: 600,
    isSoldOut: false,
  },
]

const CATEGORIES = ["All", "Concert", "Festival", "Workshop", "Exhibition"]
const LOCATIONS = ["All", "Jakarta", "Surabaya", "Bandung", "Bali", "Yogyakarta"]

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const [events, setEvents] = useState<Event[]>(DUMMY_EVENTS)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLocation, setSelectedLocation] = useState("All")
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      filterEvents()
    }, 500)
    return () => clearTimeout(timer)
  }, [search, selectedCategory, selectedLocation])

  const filterEvents = useCallback(() => {
    let filtered = DUMMY_EVENTS

    if (search) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(search.toLowerCase()) ||
          event.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((event) => event.category === selectedCategory)
    }

    if (selectedLocation !== "All") {
      filtered = filtered.filter((event) =>
        event.location.toLowerCase().includes(selectedLocation.toLowerCase())
      )
    }

    setEvents(filtered)
  }, [search, selectedCategory, selectedLocation])

  // Fetch real data from API (optional)
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await api.get("/api/events")
        if (response.data.events && response.data.events.length > 0) {
          setEvents(response.data.events)
        }
      } catch (error) {
        console.log("Using dummy data - API not available")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <Navbar />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative h-screen flex items-end justify-start overflow-hidden bg-surface pt-16">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background-40 to-transparent z-10"></div>
            <img alt="Intense high-contrast black and white photography of a massive concert crowd with dramatic stage lighting and strobe effects" className="w-full h-full object-cover grayscale opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAf6rp06rsvEKG_O3zDTJvGpMeJH_kzWccT5rTroiQCGDif4EIZrnv2c9k0g6n12AiYB6jEjQklaRL6XB0uZXhzbM6f13oI96GOnE7g4yh8RtcscVkpk7IDzL6gxMyMoXAONppXkwDIHhsfiOd6OhziCRzBwpy15tXlOi5jn8wOJNQ3q1hFViFoZsaqJGPsb94Fe4ZiVkJjArIPg-PsUp3ra1GNSO0wPeKWzK-_7IZSnYUfUkPsPLcJK_tBErXOexBHqLPnCjZS1T6"/>
          </div>
          <div className="relative z-20 px-8 pb-24 md:pb-32 max-w-7xl">
            <p className="font-label text-primary uppercase tracking-[0.4em] mb-6 text-sm">Industrial Logistics for the Underground</p>
            <h1 className="font-headline font-black text-[12vw] md:text-[10rem] text-wall text-white uppercase leading-none mb-8">
              LIVE NOISE,<br/>NO EXCUSES.
            </h1>
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <button className="bg-primary-dim text-on-primary-fixed px-12 py-5 text-xl font-headline uppercase font-black tracking-wider hover:bg-primary hover:shadow-[0_0_40px_rgba(105,90,255,0.4)] transition-all">
                BOOK THE TOUR
              </button>
              <p className="max-w-md text-stone-400 font-body text-lg leading-snug">
                Precision-engineered tour management for high-decibel performance. We handle the grit, you bring the noise.
              </p>
            </div>
          </div>
        </section>

        {/* Kinetic Divider (Brand Bar) */}
        <div className="relative py-12 md:py-20 overflow-hidden bg-background">
          <style>{`
            @keyframes scroll-left {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              display: flex;
              width: max-content;
              animation: scroll-left 20s linear infinite;
            }
            .banner-tilt-1 {
              transform: rotate(-3deg) scale(1.1);
              z-index: 10;
            }
            .banner-tilt-2 {
              transform: rotate(2deg) scale(1.1);
              margin-top: -40px;
              z-index: 5;
              opacity: 0.8;
            }
          `}</style>
          {/* Top Tilted Banner */}
          <div className="banner-tilt-1 bg-kinetic py-6 border-y-4 border-black overflow-hidden shadow-2xl">
            <div className="animate-marquee">
              <div className="flex space-x-12 px-6 items-center">
                <span className="font-headline font-black text-6xl md:text-8xl text-white uppercase italic tracking-tighter">
                  IT'S A VIBE RECORDS TOUR
                </span>
                <span className="font-label text-white-50 text-xl uppercase tracking-widest">TRUCK&apos;N ROLL® LOGISTICS</span>
                <span className="font-headline font-black text-6xl md:text-8xl text-white uppercase italic tracking-tighter">
                  IT'S A VIBE RECORDS TOUR
                </span>
                <span className="font-label text-white-50 text-xl uppercase tracking-widest">STAINLESS STEEL ACOUSTICS</span>
              </div>
              <div className="flex space-x-12 px-6 items-center">
                <span className="font-headline font-black text-6xl md:text-8xl text-white uppercase italic tracking-tighter">
                  IT'S A VIBE RECORDS TOUR
                </span>
                <span className="font-label text-white-50 text-xl uppercase tracking-widest">TRUCK&apos;N ROLL® LOGISTICS</span>
                <span className="font-headline font-black text-6xl md:text-8xl text-white uppercase italic tracking-tighter">
                  IT'S A VIBE RECORDS TOUR
                </span>
                <span className="font-label text-white-50 text-xl uppercase tracking-widest">STAINLESS STEEL ACOUSTICS</span>
              </div>
            </div>
          </div>

          {/* Bottom Overlapping Tilted Banner */}
          <div className="banner-tilt-2 bg-kinetic border-black overflow-hidden py-6 border-y-4">
            <div className="animate-marquee-reverse">
              <div className="flex space-x-20 px-10 items-center">
                <span className="font-headline font-black text-white uppercase italic tracking-tighter text-6xl md:text-8xl">
                  LIVE NOISE NO EXCUSES
                </span>
                <span className="font-headline font-black text-white uppercase italic tracking-tighter text-6xl md:text-8xl">
                  INDUSTRIAL LOGISTICS
                </span>
                <span className="font-headline font-black text-white uppercase italic tracking-tighter text-6xl md:text-8xl">
                  FULL SCALE PRODUCTION
                </span>
              </div>
              <div className="flex space-x-20 px-10 items-center">
                <span className="font-headline font-black text-white uppercase italic tracking-tighter text-6xl md:text-8xl">
                  LIVE NOISE NO EXCUSES
                </span>
                <span className="font-headline font-black text-white uppercase italic tracking-tighter text-6xl md:text-8xl">
                  INDUSTRIAL LOGISTICS
                </span>
                <span className="font-headline font-black text-white uppercase italic tracking-tighter text-6xl md:text-8xl">
                  FULL SCALE PRODUCTION
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <section className="bg-surface py-24 px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-8">
            <div>
              <h2 className="font-headline font-black text-6xl md:text-8xl uppercase tracking-tighter">Upcoming<br/>Concerts</h2>
            </div>
            <div className="flex flex-col items-end gap-4">
              <div className="flex gap-2">
                <button className="p-4 bg-surface-container-high hover:bg-primary-dim hover:text-on-primary-fixed transition-colors">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <button className="p-4 bg-surface-container-high hover:bg-primary-dim hover:text-on-primary-fixed transition-colors">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
          {/* Filters */}
          <div className="mb-16 space-y-6">
            <div>
              <p className="font-label text-stone-500 text-xs uppercase tracking-widest mb-3">Filter by Category</p>
              <div className="flex flex-wrap gap-3">
                {["All", "Concert", "Festival", "Workshop", "Exhibition"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-2 font-label text-xs uppercase tracking-widest border transition-all ${
                      selectedCategory === cat
                        ? "bg-primary text-on-primary-fixed border-primary"
                        : "bg-surface-container-high text-stone-300 border-white-5 hover:border-white-20"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-label text-stone-500 text-xs uppercase tracking-widest mb-3">Filter by Location</p>
              <div className="flex flex-wrap gap-3">
                {["All", "Jakarta", "Surabaya", "Bandung", "Bali"].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocation(loc)}
                    className={`px-6 py-2 font-label text-xs uppercase tracking-widest border transition-all ${
                      selectedLocation === loc
                        ? "bg-primary text-on-primary-fixed border-primary"
                        : "bg-surface-container-high text-stone-300 border-white-5 hover:border-white-20"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Bento Grid Events */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {events.length > 0 ? (
              <>
                {/* Large Card - First Event */}
                <Link to={`/events/${events[0].id}`} className="md:col-span-8 bg-surface-container-low group cursor-pointer overflow-hidden flex flex-col md:flex-row">
                  <div className="md:w-1/2 overflow-hidden h-[400px] md:h-auto relative">
                    <img alt={events[0].title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={events[0].imageUrl || ""}/>
                    {events[0].isSoldOut && (
                      <div className="absolute top-6 left-6 bg-primary-dim text-on-primary-fixed font-label px-3 py-1 text-xs uppercase font-black">SOLD OUT</div>
                    )}
                    {events[0].price === 0 && !events[0].isSoldOut && (
                      <div className="absolute top-6 left-6 bg-violet-400 text-black font-label px-3 py-1 text-xs uppercase font-black">FREE</div>
                    )}
                    {events[0].price > 0 && !events[0].isSoldOut && (
                      <div className="absolute top-6 left-6 bg-white text-black font-label px-3 py-1 text-xs uppercase font-black">PAID</div>
                    )}
                  </div>
                  <div className="md:w-1/2 p-10 flex flex-col justify-between">
                    <div>
                      <span className="font-label text-primary uppercase tracking-[0.3em] text-xs">Featured Event</span>
                      <h3 className="font-headline font-black text-5xl uppercase mt-4 mb-2">{events[0].title}</h3>
                      <p className="text-stone-400 font-body">{events[0].description}</p>
                    </div>
                    <div className="mt-8 flex justify-between items-end border-t border-white-5 pt-8">
                      <div>
                        <p className="font-label text-stone-500 text-xs uppercase tracking-widest mb-1">Entry Fee</p>
                        <p className="font-headline text-3xl font-black">{events[0].price === 0 ? "FREE" : `Rp ${events[0].price.toLocaleString()}`}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-label text-stone-500 text-xs uppercase tracking-widest mb-1">Date</p>
                        <p className="font-headline text-xl font-bold">{new Date(events[0].startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Small Cards - Events 2-3 */}
                {events.slice(1, 3).map((event) => (
                  <Link key={event.id} to={`/events/${event.id}`} className="md:col-span-4 bg-surface-container-high group cursor-pointer overflow-hidden flex flex-col">
                    <div className="h-64 overflow-hidden relative">
                      <img alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={event.imageUrl || ""}/>
                      {event.isSoldOut && (
                        <div className="absolute top-6 left-6 bg-primary-dim text-on-primary-fixed font-label px-3 py-1 text-xs uppercase font-black">SOLD OUT</div>
                      )}
                      {event.price === 0 && !event.isSoldOut && (
                        <div className="absolute top-6 left-6 bg-violet-400 text-black font-label px-3 py-1 text-xs uppercase font-black">FREE</div>
                      )}
                      {event.price > 0 && !event.isSoldOut && (
                        <div className="absolute top-6 left-6 bg-white text-black font-label px-3 py-1 text-xs uppercase font-black">PAID</div>
                      )}
                    </div>
                    <div className="p-8">
                      <h3 className="font-headline font-black text-2xl uppercase mb-2">{event.title}</h3>
                      <p className="text-stone-500 font-body text-sm mb-6">{event.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-label text-primary font-black">{event.price === 0 ? "FREE ADMISSION" : `Rp ${event.price.toLocaleString()}`}</span>
                        <span className="font-label text-xs text-stone-600">{new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()}</span>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Horizontal Card - Event 4 */}
                {events[3] && (
                  <Link to={`/events/${events[3].id}`} className="md:col-span-8 bg-surface-container-lowest border border-white-5 group cursor-pointer overflow-hidden flex flex-col md:flex-row">
                    <div className="p-10 flex flex-col justify-center flex-1">
                      <span className="font-label text-stone-500 uppercase tracking-[0.3em] text-xs">{events[3].category}</span>
                      <h3 className="font-headline font-black text-5xl uppercase mt-4 mb-4">{events[3].title}</h3>
                      <div className="flex items-center gap-6 mb-8">
                        <div className="flex items-center text-stone-400">
                          <span className="material-symbols-outlined text-sm mr-2">location_on</span>
                          <span className="font-body text-sm">{events[3].location}</span>
                        </div>
                        <div className="flex items-center text-stone-400">
                          <span className="material-symbols-outlined text-sm mr-2">calendar_today</span>
                          <span className="font-body text-sm">{new Date(events[3].startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}</span>
                        </div>
                      </div>
                      <p className="text-stone-500 font-body max-w-md mb-8">{events[3].description}</p>
                      <button className="self-start border-2 border-white-10 px-8 py-3 font-label uppercase text-sm tracking-widest group-hover:bg-white group-hover:text-black transition-all">GET TICKETS</button>
                    </div>
                    <div className="md:w-1/3 overflow-hidden h-64 md:h-auto">
                      <img alt={events[3].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" src={events[3].imageUrl || ""}/>
                    </div>
                  </Link>
                )}
              </>
            ) : (
              <div className="col-span-12 text-center py-16">
                <p className="font-headline text-2xl text-stone-500">No events match your filters</p>
                <button onClick={() => { setSelectedCategory("All"); setSelectedLocation("All"); setSearch(""); }} className="mt-4 text-primary hover:text-white transition-colors">Reset all filters</button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Newsletter Section */}
      <section className="bg-black py-24 px-8 border-t border-white-5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-headline font-black text-5xl md:text-8xl text-white uppercase tracking-tighter mb-6">
            DON&apos;T MISS THE<br/>
            <span className="text-primary-fixed-dim">SONIC BLAST.</span>
          </h2>
          <p className="font-body text-stone-400 text-sm md:text-base uppercase tracking-widest mb-12 max-w-xl mx-auto">
            Subscribe to get early access to tickets and secret warehouse location drops.
          </p>
          <form className="flex flex-col md:flex-row items-stretch max-w-2xl mx-auto border-b border-white-20 pb-2">
            <input className="flex-grow bg-transparent border-none focus:ring-0 text-white font-label uppercase tracking-widest placeholder:text-stone-700 py-4 px-0" placeholder="EMAIL@DOMAIN.COM" required type="email"/>
            <button className="bg-kinetic text-white px-10 py-4 font-label font-bold uppercase tracking-widest hover:bg-violet-600 transition-all" type="submit">
              JOIN NOW
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  )
}
