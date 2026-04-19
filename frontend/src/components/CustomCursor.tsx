import { useEffect, useState, useRef } from "react"

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const cursorRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<{ x: number; y: number }[]>([])

  useEffect(() => {
    // Only show custom cursor on desktop
    if (window.matchMedia("(pointer: coarse)").matches) {
      return
    }

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    // Detect hover on interactive elements
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isInteractive = target.closest("a, button, input, textarea, [role='button'], .cursor-pointer")
      setIsHovering(!!isInteractive)
    }

    document.addEventListener("mousemove", updatePosition)
    document.addEventListener("mousemove", handleElementHover)
    document.addEventListener("mouseenter", handleMouseEnter)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", updatePosition)
      document.removeEventListener("mousemove", handleElementHover)
      document.removeEventListener("mouseenter", handleMouseEnter)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  // Hide on touch devices
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null
  }

  return (
    <>
      {/* Hide default cursor on desktop */}
      <style>{`
        @media (pointer: fine) {
          * {
            cursor: none !important;
          }
        }
      `}</style>

      {/* Main cursor - Vinyl Record Style */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-transform duration-75 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transform: `translate(${position.x - 20}px, ${position.y - 20}px)`,
        }}
      >
        {/* Outer ring */}
        <div
          className={`relative w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center transition-all duration-200 ${
            isHovering ? "scale-[1.35]" : "scale-100"
          } ${isClicking ? "scale-90" : ""}`}
          style={{
            boxShadow: isHovering
              ? "0 0 30px rgba(14, 165, 233, 0.6), 0 0 60px rgba(14, 165, 233, 0.3)"
              : "0 0 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Vinyl grooves */}
          <div className="absolute inset-1 rounded-full border border-gray-700/50" />
          <div className="absolute inset-2 rounded-full border border-gray-700/30" />
          <div className="absolute inset-3 rounded-full border border-gray-700/20" />

          {/* Center label - cyan theme color */}
          <div
            className={`w-4 h-4 rounded-full bg-[#0ea5e9] transition-all duration-200 ${
              isHovering ? "scale-75" : "scale-100"
            }`}
            style={{
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            {/* Center hole */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-gray-900 rounded-full" />
          </div>

          {/* Shine effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
        </div>

        {/* Music notes floating around on hover */}
        {isHovering && (
          <>
            <span
              className="absolute -top-4 -right-2 text-[#0ea5e9] text-lg animate-bounce"
              style={{ animationDelay: "0ms" }}
            >
              ♪
            </span>
            <span
              className="absolute -top-2 -left-3 text-[#f97316] text-sm animate-bounce"
              style={{ animationDelay: "100ms" }}
            >
              ♫
            </span>
          </>
        )}
      </div>

      {/* Trailing dots */}
      <div className="fixed top-0 left-0 pointer-events-none z-[9998]">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#0ea5e9]/30 transition-all duration-100"
            style={{
              width: 8 - i,
              height: 8 - i,
              transform: `translate(${position.x - (8 - i) / 2}px, ${position.y - (8 - i) / 2}px)`,
              transitionDelay: `${i * 20}ms`,
              opacity: isVisible ? (5 - i) / 10 : 0,
            }}
          />
        ))}
      </div>
    </>
  )
}
