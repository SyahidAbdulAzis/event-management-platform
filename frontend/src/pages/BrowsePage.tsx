import { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

// Dummy events data
const DUMMY_EVENTS = [
  {
    id: 1,
    title: "Obsidian Echoes Vol. 4",
    date: "24 OCT — 2024",
    location: "SCDL, JAKARTA",
    price: 450000,
    category: "Warehouse Rave",
    featured: true,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDml9I7EwVgg1yvSG6SSf84PKwdlKbhMpUoQSdNaNnSAjCgiN5dsvO0sy5AI9FhT5JVkSPP-XaLUZ9WWAYnQlsTwF3Z1n3tSHFxlapjbl-XqTWr_S7ZCkCeMJOAHfUda5ysofmH0tjUHzF9KUheTL45h4US7v5rSu_p4LeUfjYLSRGRcRcIXLmoZi55eSdRltJThstUIrkbIPF8iZhraUGrd4vYteJKFlHjjIKCBJC2iiubRed7oYSyUvLhbzUFAaY094HkRWokflfz",
  },
  {
    id: 2,
    title: "Kinetic Flow",
    date: "24 OCT — 2024",
    location: "TITANIUM CLUB",
    price: 250000,
    category: "Techno Ritual",
    featured: false,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJgN4gIM3LgJgCa3QJRT5_SOGLUg_s9UUKrYzXGoOLd1ISEE_j5ZRJz9dH-cbxST-agKV8ZPNjTUELyo-8vDVTE5fBIf6fTwht0_EDspQ0bnt5lG5p9ZWOodVOJcKxmOFK4u4Zo0GaHu_v2ePr8_2RFnCaj9pHBT24AZCipzoQqve2_YreVtEWcSZ1QNPNvwlP7SDaTwHZ9XY3Bc1lfeKGH4LX0RMo0zXa_3wQQ_dOvsC5vAHZudCPeIQi99_2aAw3cA-kn9fImTy6",
  },
  {
    id: 3,
    title: "Sub-Zero Pressure",
    date: "02 NOV — 2024",
    location: "VOID SPACE",
    price: 320000,
    category: "Industrial Dark",
    featured: false,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8dh3vVC867t3tnSNoEO7figzvSO3DHPigzh-AAxE8Opc1mW6Whq_bitnNY3kdCfkh4iblsiYj6cVUSyS5dPw3DVxwxKJj7XwSkJTCYoC8tCVyAh1xHzAsVw8aq5kwb8FQgyrO_ICCaSDuhzLQ_vRwLRyVD4rmiXesvwJq6UfuBmRWtn6meOGgg06sESB7zou84FLQrEEge7YpT_YnH8sGvLNw0-FvMBRKk41e5Dkq_sPQfF48iFxFFM6vxPfeqozp9eil1Sw0Auw6",
  },
  {
    id: 4,
    title: "Static Void",
    date: "15 NOV — BANDUNG",
    location: "WAREHOUSE 88",
    price: 180000,
    category: "Techno Ritual",
    featured: false,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAr00BPIkADaJ4WyhFXfHuOA03ZjDs-5pyViCUvUkuJ2l1u_gDVehQVDLy5Pr8J75_gEcobuEUWpaiP0k8DC0qV6TAd6jyLSqIH8QY2KLDBSUkSbvd5C0amXynzYDkIR8qOCtDa6YviZztJW7QE7ouLJ7YYCeiF22mV-KOGLzC9v3OCE1wf0IGBWDYzkiSqY2NAM2Z0wB4hhWX77nkWM2mRxBRIilaWsOFy6t-ejg6bu-kWLXRWgDe4rVtWHE246p4gEBN4pETWZOcW",
  },
  {
    id: 5,
    title: "Neon Pulse",
    date: "22 NOV — BALI",
    location: "CONCRETE GALLERY",
    price: 550000,
    category: "Vocal Trance",
    featured: false,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6Y9J7nBSTSG22iINh19SBqTiVmULTJEY7tjlZ9KKzVDmjN2tk-TDAxBPaGMG_2ds1KqFc_RbPjkAHqNSh_uhmDvUCFidNoH8BnDj3Ks9PQIJfbaQ3F0BtbfDn5XQQQV0LWquUwdyHROxymZYoZ5B6yxbdQqgUOGM3UJTZTsSfxjURHDpuzMziS_ep1g-r0Aif0Qp42FKhGEdbNqpBW2cyTXOp5EQk2k8OKLngxFHVucLlTcEUNCZkp4DsfpOM7Al_PcF2cWvloT1K",
  },
]

const CATEGORIES = [
  "All Events",
  "Warehouse Rave",
  "Techno Ritual",
  "Industrial Dark",
  "Vocal Trance",
  "Hardstyle",
]

const LOCATIONS = ["Jakarta", "Bali", "Bandung"]

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Events")
  const [selectedLocation, setSelectedLocation] = useState("Jakarta")
  const [filteredEvents, setFilteredEvents] = useState(DUMMY_EVENTS)
  const [noResults, setNoResults] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Filter events
  useEffect(() => {
    let results = DUMMY_EVENTS

    // Search filter
    if (debouncedSearch) {
      results = results.filter(
        (event) =>
          event.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          event.location.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          event.category.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== "All Events") {
      results = results.filter((event) => event.category === selectedCategory)
    }

    // Location filter (simplified - would need proper location matching)
    // For demo purposes, we'll just filter by category/search

    setFilteredEvents(results)
    setNoResults(results.length === 0)
  }, [debouncedSearch, selectedCategory, selectedLocation])

  const featuredEvent = filteredEvents.find((e) => e.featured) || filteredEvents[0]
  const secondaryEvents = filteredEvents.filter((e) => e.id !== featuredEvent?.id).slice(0, 2)
  const moreEvents = filteredEvents.filter((e) => e.id !== featuredEvent?.id).slice(2)

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <Navbar />

      <main className="pt-24 pb-12 min-h-screen">
        {/* Search & Filter Section */}
        <section className="px-8 mb-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h1 className="font-headline font-black text-6xl md:text-8xl tracking-tighter uppercase leading-[0.8] mb-8">
                Explore<br/><span className="text-primary">Events</span>
              </h1>
            </div>

            {/* Industrial Search Bar */}
            <div className="flex flex-col md:flex-row gap-0 mb-12 border-2 border-stone-800 bg-surface-container-high">
              <div className="flex-grow relative">
                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary text-2xl">search</span>
                <input
                  type="text"
                  placeholder="SEARCH BY ARTIST, VENUE, OR VIBE"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-white font-label font-bold tracking-wider py-6 pl-16 pr-6 outline-none"
                />
              </div>
              <div className="flex border-t-2 md:border-t-0 md:border-l-2 border-stone-800">
                {/* Custom Dropdown */}
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="relative bg-surface-container-highest flex items-center w-[160px] h-full py-6 px-4 hover:bg-surface-container-high transition-colors"
                  >
                    <span className="material-symbols-outlined text-stone-500 mr-2">location_on</span>
                    <span className="font-label font-bold text-white uppercase tracking-wider text-sm flex-1 text-left">{selectedLocation}</span>
                    <span className={`material-symbols-outlined text-stone-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 bg-surface-container-highest border-2 border-stone-800 border-t-0 z-50">
                      {LOCATIONS.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => {
                            setSelectedLocation(loc)
                            setIsDropdownOpen(false)
                          }}
                          className={`w-full text-left px-4 py-3 font-label font-bold uppercase tracking-wider text-sm transition-colors ${
                            selectedLocation === loc
                              ? 'bg-primary-dim text-on-primary-fixed'
                              : 'text-white hover:bg-surface-container-high'
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="bg-primary-dim hover:bg-primary text-on-primary-fixed px-10 md:px-12 font-label font-bold uppercase tracking-widest transition-all border-l-2 border-stone-800">
                  Filter
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-8 py-3 font-label font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary-dim text-on-primary-fixed"
                      : "bg-surface-container-high hover:bg-surface-container-highest text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* No Results Empty State */}
        {noResults && (
          <section className="px-8 py-32 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-primary text-8xl mb-8">sentiment_very_dissatisfied</span>
            <h2 className="font-headline font-black text-6xl uppercase tracking-tighter mb-4">No Vibe Found</h2>
            <p className="font-body text-stone-400 max-w-md mx-auto text-lg mb-12">
              The industrial gears haven&apos;t ground out these results yet. Try adjusting your category or exploring another city.
            </p>
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("All Events")
                setSelectedLocation("Jakarta")
              }}
              className="bg-primary-dim text-on-primary-fixed px-12 py-5 font-label font-bold uppercase tracking-widest hover:bg-primary transition-all"
            >
              Reset All Filters
            </button>
          </section>
        )}

        {/* Results Grid */}
        {!noResults && (
          <>
            {/* Bento Grid Results */}
            <section className="px-8">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-1">
                {/* Large Feature Card */}
                {featuredEvent && (
                  <div className="md:col-span-8 bg-surface-container-low group overflow-hidden relative aspect-video md:aspect-auto md:h-[600px]">
                    <img
                      alt="dramatic wide shot of a dark warehouse rave with intense violet lasers cutting through thick smoke and a massive crowd silhouette"
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                      src={featuredEvent.imageUrl}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90"></div>
                    <div className="absolute bottom-12 left-12 right-12">
                      <span className="bg-primary text-on-primary-fixed font-label font-bold px-4 py-1 uppercase tracking-widest text-sm inline-block mb-4">Featured Ritual</span>
                      <h2 className="font-headline font-black text-5xl md:text-7xl uppercase tracking-tighter leading-none mb-6">
                        {featuredEvent.title.split(" ").slice(0, -1).join(" ")}<br/>{featuredEvent.title.split(" ").pop()}
                      </h2>
                      <div className="flex flex-wrap items-center gap-8">
                        <div className="font-label font-bold">
                          <p className="text-stone-500 text-xs uppercase tracking-widest mb-1">Location</p>
                          <p className="text-xl">{featuredEvent.location}</p>
                        </div>
                        <div className="font-label font-bold">
                          <p className="text-stone-500 text-xs uppercase tracking-widest mb-1">Price</p>
                          <p className="text-xl text-primary">Rp {featuredEvent.price.toLocaleString()}</p>
                        </div>
                        <Link to={`/events/${featuredEvent.id}`} className="ml-auto">
                          <button className="bg-white text-black font-label font-bold px-10 py-4 uppercase tracking-widest hover:bg-primary transition-colors">Secure Spot</button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Secondary Card Stack */}
                <div className="md:col-span-4 flex flex-col gap-1">
                  {secondaryEvents.map((event) => (
                    <div key={event.id} className="bg-surface-container-high flex-1 p-8 group relative overflow-hidden">
                      <img
                        alt="event thumbnail"
                        className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-700"
                        src={event.imageUrl}
                      />
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                          <p className="font-label text-primary font-bold text-sm tracking-widest mb-2">{event.date}</p>
                          <h3 className="font-headline font-bold text-3xl uppercase tracking-tighter leading-tight">
                            {event.title.split(" ")[0]}<br/>{event.title.split(" ").slice(1).join(" ")}
                          </h3>
                        </div>
                        <div>
                          <p className="font-label font-bold text-lg mb-4">Rp {event.price.toLocaleString()}</p>
                          <Link to={`/events/${event.id}`}>
                            <button className="w-full border-2 border-stone-700 text-white font-label font-bold py-3 uppercase tracking-widest hover:bg-stone-700 transition-colors">View Details</button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* More Results Grid */}
            <section className="px-8 mt-1">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-1">
                {moreEvents.map((event) => (
                  <div key={event.id} className="bg-surface-container-low p-8 group relative">
                    <div className="h-64 bg-stone-900 mb-6 overflow-hidden">
                      <img
                        alt="event thumbnail"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        src={event.imageUrl}
                      />
                    </div>
                    <p className="font-label text-stone-500 font-bold text-xs tracking-widest mb-2">{event.date}</p>
                    <h3 className="font-headline font-bold text-2xl uppercase tracking-tighter mb-4">{event.title}</h3>
                    <div className="flex justify-between items-center">
                      <span className="font-label font-bold text-primary">Rp {event.price.toLocaleString()}</span>
                      <Link to={`/events/${event.id}`}>
                        <span className="material-symbols-outlined text-stone-600 group-hover:text-primary transition-colors">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Empty State Block inside grid */}
                <div className="bg-surface-container-lowest p-8 flex flex-col justify-center items-start border-2 border-dashed border-stone-800">
                  <span className="material-symbols-outlined text-stone-700 text-5xl mb-6">search_off</span>
                  <h4 className="font-headline font-bold text-2xl uppercase mb-2">End of results</h4>
                  <p className="font-body text-stone-500 text-sm mb-6">No more events match your current criteria. Shift your filters to find more rituals.</p>
                  <button
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedCategory("All Events")
                      setSelectedLocation("Jakarta")
                    }}
                    className="text-primary font-label font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
