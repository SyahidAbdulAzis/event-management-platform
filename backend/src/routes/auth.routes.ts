import { Router } from "express"
import { register, login, forgotPassword, resetPassword, changePassword, deleteProfilePhoto } from "../controllers/auth.controller"
import { uploadProfilePhotoMiddleware, uploadProfilePhoto } from "../controllers/user.controller"
import authMiddleware from "../middleware/auth.middleware"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/change-password", authMiddleware, changePassword)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)
router.post("/upload-profile-photo", authMiddleware, uploadProfilePhotoMiddleware.single('photo'), uploadProfilePhoto)
router.delete("/delete-profile-photo", authMiddleware, deleteProfilePhoto)

export default router
