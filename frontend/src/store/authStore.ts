import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  email: string
  role: "CUSTOMER" | "ORGANIZER"
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  login: (user: User, token: string) => void
  logout: () => void
}

// Dummy user for development auto-login
const DUMMY_ORGANIZER: User = {
  id: "1",
  email: "organizer@vibe.com",
  role: "ORGANIZER",
}

const DUMMY_TOKEN = "dev-token-12345"

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: DUMMY_ORGANIZER, // Auto-login for development
      token: DUMMY_TOKEN,
      isAuthenticated: true,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
)
