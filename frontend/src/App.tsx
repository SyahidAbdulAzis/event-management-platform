import { FC } from "react"
import { Routes, Route } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import BrowsePage from "./pages/BrowsePage"
import EventDetailPage from "./pages/EventDetailPage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import CreateEventPage from "./pages/CreateEventPage"
import CheckoutPage from "./pages/CheckoutPage"
import PaymentProofPage from "./pages/PaymentProofPage"
import OrganizerProfile from "./pages/OrganizerProfile"
import ReviewForm from "./pages/ReviewForm"
import ProtectedRoute from "./components/ProtectedRoute"
import ScrollToTop from "./components/ScrollToTop"
// import CustomCursor from "./components/CustomCursor"

const App: FC = () => {
  return (
    <>
      <ScrollToTop />
      {/* <CustomCursor /> */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
      <Route path="/browse" element={<BrowsePage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/checkout/:id" element={<CheckoutPage />} />
      <Route path="/payment-proof/:id" element={<PaymentProofPage />} />
      <Route path="/organizer/:id" element={<OrganizerProfile />} />
      <Route path="/review/:eventId" element={<ReviewForm />} />
      <Route
        path="/events/create"
        element={
          <ProtectedRoute requireOrganizer={true}>
            <CreateEventPage />
          </ProtectedRoute>
        }
      />
    </Routes>
    </>
  )
}

export default App
