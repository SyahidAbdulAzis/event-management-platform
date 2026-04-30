import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireOrganizer?: boolean
}

export default function ProtectedRoute({ children, requireOrganizer = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireOrganizer && user?.role !== "ORGANIZER") {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
