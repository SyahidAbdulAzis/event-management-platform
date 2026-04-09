import { Router } from "express"
import { register, login, updateProfile, forgotPassword, resetPassword } from "../controllers/auth.controller"
import authMiddleware from "../middleware/auth.middleware"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.put("/profile", authMiddleware, updateProfile)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)

export default router
