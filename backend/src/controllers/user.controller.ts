import { Request, Response } from "express"
import prisma from "../prisma/client"
import cloudinary from "../config/cloudinary"
import multer from "multer"

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    role: string
  }
}

// Multer config for profile photo upload
const storage = multer.memoryStorage()

export const uploadProfilePhotoMiddleware = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// ================= UPLOAD PROFILE PHOTO =================
export const uploadProfilePhoto = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'profile-photos',
          public_id: `profile-${req.user!.id}`,
          resource_type: 'image',
          transformation: [
            { width: 200, height: 200, crop: 'fill' }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(req.file!.buffer)
    })

    // Save photo URL to database
    await prisma.$executeRaw`
      UPDATE "User"
      SET "profilePhoto" = ${result.secure_url}
      WHERE id = ${req.user.id}
    `

    res.json({
      message: "Profile photo uploaded successfully",
      photoUrl: result.secure_url
    })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}
