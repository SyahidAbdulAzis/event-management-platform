import { Routes, Route } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import BrowsePage from "./pages/BrowsePage"
import EventDetailPage from "./pages/EventDetailPage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import CreateEventPage from "./pages/CreateEventPage"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/browse" element={<BrowsePage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/events/create" 
        element={
          <ProtectedRoute requireOrganizer={true}>
            <CreateEventPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

export default App