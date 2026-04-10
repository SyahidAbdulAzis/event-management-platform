import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "./index.css"

// Components
import ProtectedRoute from "./components/ProtectedRoute"

// Pages
import LandingPage from "./pages/LandingPage"
import BrowsePage from "./pages/BrowsePage"
import EventDetailPage from "./pages/EventDetailPage"
import CreateEventPage from "./pages/CreateEventPage"
import Login from "./pages/Login"
import Register from "./pages/Register"

// Create QueryClient for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes - LandingPage has its own Navbar */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/events/create"
            element={
              <ProtectedRoute requireOrganizer={true}>
                <CreateEventPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
