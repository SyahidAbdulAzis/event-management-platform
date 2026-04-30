import { Router } from "express"
import {
  createReview,
  getEventReviews,
  getOrganizerProfile
} from "../controllers/review.controller"
import authMiddleware from "../middleware/auth.middleware"
import roleMiddleware from "../middleware/role.middleware"

const router = Router()

// Public routes
router.get("/event/:eventId", getEventReviews)
router.get("/organizer/:organizerId", getOrganizerProfile)

// CUSTOMER only
router.post("/", authMiddleware, roleMiddleware("CUSTOMER"), createReview)

export default router
