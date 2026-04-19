import { Router } from "express"
import {
  createTransaction,
  uploadPaymentProof,
  getMyTransactions,
  getTransactionDetail,
  getOrganizerTransactions,
  confirmTransaction,
  cancelTransaction,
  upload
} from "../controllers/transaction.controller"
import authMiddleware from "../middleware/auth.middleware"
import roleMiddleware from "../middleware/role.middleware"

const router = Router()

// CUSTOMER routes
router.post("/", authMiddleware, roleMiddleware("CUSTOMER"), createTransaction)
router.get("/my", authMiddleware, roleMiddleware("CUSTOMER"), getMyTransactions)

// ORGANIZER routes (harus sebelum /:id)
router.get("/organizer/all", authMiddleware, roleMiddleware("ORGANIZER"), getOrganizerTransactions)
router.post("/:id/confirm", authMiddleware, roleMiddleware("ORGANIZER"), confirmTransaction)

// ID-based routes
router.get("/:id", authMiddleware, getTransactionDetail)
router.post("/:id/upload-proof", authMiddleware, roleMiddleware("CUSTOMER"), upload.single("paymentProof"), uploadPaymentProof)
router.post("/:id/cancel", authMiddleware, roleMiddleware("CUSTOMER"), cancelTransaction)

export default router
