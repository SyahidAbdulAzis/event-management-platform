import { Link, useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

// Dummy data untuk event detail
const DUMMY_EVENT = {
  id: "1",
  title: "Neon Industrial Nights",
  tagline: "Live Experience",
  date: "24 October 2024",
  time: "Doors open 19:00 — Late",
  location: "The Concrete Factory, Jakarta",
  address: "Kawasan Industri Pulogadung",
  description: "Experience the ultimate industrial audio experience with top-tier production and underground vibes.",
  imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBsA2Kg66N2GVC0eFqQkUpdIrB7VAjmPtjKwTXbmvBuCQolpGS2GoVm6Gnfu5bImbyk-YW69UMEphG4aG1UQCH5lAmzoh4JVzi_09WTizVfNlve5cPZIE6aHdjgPCkEjMckvyXTbhBQ1e2P1dxt601ueHtKqM9EkIT-MqHYAsYc58AD8ky6bnErFS1XSN3nbWBfxCKiN29uleQsk74dKzAzl6XNE3CXCTM9HpngNLUw_D7lAKHOo0qUnBM5VuyWwOTNUtxZnp61lXo9",
  price: 750000,
  availableSeats: 142,
  status: "SELLING FAST",
  lineup: [
    { name: "VORTEX SYNDICATE", time: "22:00 - CLOSE" },
    { name: "STEEL PULSE", time: "20:30 - 21:45" },
    { name: "SIGNAL LOSS", time: "19:30 - 20:15" },
  ],
  organizer: {
    name: "VIBE Collective",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXwiTHO8WH139Hn9yWPHu-ZiYDM14HZz8CONuJhqdQwkoMlgtaJXSCcJZWNz_ab00IqU_np88nryeW8cxGyQEbpvRzlDxDwbA9KhyhG48Tgt5nltsU2VFuZSCJNAka6GMLIBwX-tAIdnTjwjGxARy3nYGoEYLKiTJdD0sjLjvI9OjENuW168RMG_a_41w9kk-uaGQauEGwJrZh_6Kyu35Wv6c0qOZ8K0D3hWEUsLs-uEN2c07sxah3S7S9BgD5XFxEV1rLAerCeY7S",
    rating: 4.8,
    description: "VIBE Collective is the premier curator of industrial-grade audio experiences in Southeast Asia. We transform raw warehouses into sonic temples, delivering zero-compromise production for the hardest acts in the scene.",
  },
  reviews: [
    { name: "MARCUS REED", rating: 5, text: "Absolute sonic devastation. The warehouse acoustics were handled perfectly by the VIBE crew. Best industrial set I've seen in Jakarta so far." },
    { name: "SARAH TAN", rating: 4, text: "The production value was insane. Vortex Syndicate closing set was worth the ticket alone. Only minus was the long queue for drinks." },
    { name: "ECHO_SYSTEM", rating: 4, text: "Pure industrial bliss. The location choice was perfect. Looking forward to the next one from VIBE Records." },
  ],
  venueMapUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4CNc09MMVblB4_dyQBs3bNGmJDYv3Czg69Fnop-vb0lSxDzLusupZk74s8E2pS49dlD30fzNOFmFBhMfJTR-PqQfyiyp7r1qbam8g-fogYW1uUrKYz7l2IAhNjiUHY3DykVWrCK7U5EnDga_KJ6pY2k8MiV9WBM3Mekez2WxOCRv7z6efRB9gSsuTYRVuvd3321hUhkBqmfDVPIZDjpK5KHqLvZIn798bOPdOZI2Mqd5_CbNVtyANrzDS_2Jdy56JbT1NIBn4Lc_l",
}

export default function EventDetailPage() {
  const { id } = useParams()
  const event = DUMMY_EVENT

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary-fixed">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative w-full h-[716px] overflow-hidden">
          <img
            alt="Concert background"
            className="w-full h-full object-cover grayscale opacity-60"
            src={event.imageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 flex flex-col items-start gap-4">
            <span className="bg-primary-dim text-on-primary-fixed px-3 py-1 font-label text-[10px] tracking-widest uppercase">{event.tagline}</span>
            <h1 className="text-6xl md:text-9xl font-headline font-black tracking-tighter leading-[0.8] max-w-4xl uppercase">
              {event.title.split(" ").slice(0, 2).join(" ")} <br/>
              {event.title.split(" ").slice(2).join(" ")}
            </h1>
          </div>
        </section>

        {/* Content Grid */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-0 border-t border-outline-variant/10">
          {/* Left Column - Event Details */}
          <div className="md:col-span-8 p-8 md:p-16 bg-surface">
            {/* Date & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
              <div className="space-y-2">
                <p className="font-label text-stone-500 uppercase tracking-widest text-xs">Date & Time</p>
                <p className="text-2xl font-headline font-bold">{event.date}</p>
                <p className="text-stone-400">{event.time}</p>
              </div>
              <div className="space-y-2">
                <p className="font-label text-stone-500 uppercase tracking-widest text-xs">Location</p>
                <p className="text-2xl font-headline font-bold">{event.location}</p>
                <p className="text-stone-400">{event.address}</p>
              </div>
            </div>

            {/* Lineup */}
            <div className="space-y-8 mb-20">
              <h3 className="text-4xl font-headline font-black uppercase tracking-tight">The Lineup</h3>
              <div className="flex flex-col gap-1">
                {event.lineup.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-6 bg-surface-container-low hover:bg-primary-dim transition-all group">
                    <span className="text-2xl font-headline font-bold group-hover:text-on-primary-fixed">{item.name}</span>
                    <span className="font-label text-stone-500 group-hover:text-on-primary-fixed">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Organizer */}
            <div className="bg-surface-container-high p-8 flex flex-col md:flex-row gap-8 items-start mb-20">
              <img alt="Organizer" className="w-32 h-32 object-cover grayscale" src={event.organizer.imageUrl} />
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-headline font-bold uppercase tracking-tight">{event.organizer.name}</h4>
                  <div className="flex items-center gap-1 text-primary">
                    {[1, 2, 3, 4].map((i) => (
                      <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                    <span className="material-symbols-outlined">star_half</span>
                    <span className="text-on-surface font-label ml-2">{event.organizer.rating}</span>
                  </div>
                </div>
                <p className="text-stone-400 text-sm leading-relaxed">{event.organizer.description}</p>
              </div>
            </div>

            {/* Reviews */}
            <div className="space-y-10">
              <h3 className="text-4xl font-headline font-black uppercase tracking-tight border-b border-outline-variant/20 pb-4">Reviews & Ratings</h3>
              <div className="grid gap-8">
                {event.reviews.map((review, index) => (
                  <div key={index} className={`space-y-4 ${index < event.reviews.length - 1 ? "border-b border-outline-variant/10 pb-8" : ""}`}>
                    <div className="flex items-center justify-between">
                      <p className="font-headline font-bold text-lg uppercase">{review.name}</p>
                      <div className="flex items-center gap-1 text-primary scale-90 origin-right">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            className="material-symbols-outlined"
                            style={{ fontVariationSettings: i <= review.rating ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            {i <= review.rating ? "star" : i - 0.5 === review.rating ? "star_half" : "star"}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-stone-400 text-sm leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Ticket Sidebar */}
          <div className="md:col-span-4 bg-surface-container-low p-8 md:p-12 border-l border-outline-variant/10 sticky top-20 h-fit">
            <div className="space-y-12">
              {/* Price & Availability */}
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-outline-variant pb-4">
                  <span className="font-label text-stone-500 uppercase tracking-widest text-xs">Standard Pass</span>
                  <span className="text-3xl font-headline font-black text-primary">Rp {event.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">event_seat</span>
                    <span className="text-stone-300 font-medium">Availability</span>
                  </div>
                  <span className="text-white font-label">{event.availableSeats} SEATS LEFT</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">local_activity</span>
                    <span className="text-stone-300 font-medium">Entry Status</span>
                  </div>
                  <span className="text-error font-label uppercase">{event.status}</span>
                </div>
              </div>

              {/* Buy Button */}
              <div className="space-y-4">
                <Link to={`/checkout/${id}`}>
                  <button className="w-full bg-primary-dim text-on-primary-fixed py-6 font-headline font-black uppercase text-xl tracking-tighter hover:bg-primary transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                    Buy Ticket
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </Link>
                <p className="text-center text-[10px] text-stone-600 font-label uppercase tracking-widest">Digital tickets sent via email immediately</p>
              </div>

              {/* Venue Map */}
              <div className="pt-8 border-t border-outline-variant/20 space-y-6">
                <h5 className="font-label text-xs uppercase tracking-[0.2em] text-stone-500">Venue Map</h5>
                <div className="aspect-square bg-surface-container-highest flex items-center justify-center relative overflow-hidden">
                  <img alt="Map" className="w-full h-full object-cover opacity-30 grayscale" src={event.venueMapUrl} />
                  <div className="absolute inset-0 border-2 border-primary/20 pointer-events-none"></div>
                  <div className="absolute p-4 bg-primary-dim text-on-primary-fixed font-label text-[10px]">PULOGADUNG INDUSTRIAL CENTER</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
