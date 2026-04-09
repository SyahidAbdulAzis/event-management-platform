import { Router } from "express"
import {
  listEvents,
  getEventDetail,
  createEvent,
  updateEvent,
  deleteEvent,
  createVoucher
} from "../controllers/event.controller"
import authMiddleware from "../middleware/auth.middleware"
import roleMiddleware from "../middleware/role.middleware"

const router = Router()

// Public routes
router.get("/", listEvents)
router.get("/:id", getEventDetail)

// Protected routes (ORGANIZER only)
router.post("/", authMiddleware, roleMiddleware("ORGANIZER"), createEvent)
router.put("/:id", authMiddleware, roleMiddleware("ORGANIZER"), updateEvent)
router.delete("/:id", authMiddleware, roleMiddleware("ORGANIZER"), deleteEvent)

// Voucher routes (ORGANIZER only)
router.post("/:id/vouchers", authMiddleware, roleMiddleware("ORGANIZER"), createVoucher)

export default router
