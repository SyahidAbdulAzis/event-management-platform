import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  email: string
  role: "CUSTOMER" | "ORGANIZER"
  referralCode?: string
  profilePhoto?: string
}

type UserPatch = {
  id: string
  email: string
  role: "CUSTOMER" | "ORGANIZER"
  referralCode?: string
  profilePhoto?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: UserPatch) => void
  setToken: (token: string) => void
  login: (user: UserPatch, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      login: (user, token) => {
        localStorage.setItem("token", token)
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem("token")
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: "auth-storage",
    }
  )
)
