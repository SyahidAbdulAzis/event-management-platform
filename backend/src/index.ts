import express, { Request, Response, NextFunction } from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"

dotenv.config()

// Import cron jobs
import "./cron/pointExpiration"
import "./cron/transactionExpiration"

const app = express()

// ================= MIDDLEWARE =================
app.use(cors())
app.use(express.json())

// ================= ROUTES =================
import authRoutes from "./routes/auth.routes"
import eventRoutes from "./routes/event.routes"
import transactionRoutes from "./routes/transaction.routes"
import reviewRoutes from "./routes/review.routes"
import authMiddleware from "./middleware/auth.middleware"
import roleMiddleware from "./middleware/role.middleware"
import prisma from "./prisma/client"

// Static file serving untuk payment proof
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

app.use("/api/auth", authRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/transactions", transactionRoutes)
app.use("/api/reviews", reviewRoutes)

// ================= ROOT =================
app.get("/", (req: Request, res: Response) => {
  res.send("API RUNNING 🚀")
})

// ================= PROTECTED ROUTE =================
app.get("/api/profile", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const pointsAgg = await prisma.pointHistory.aggregate({
      where: { userId, expiresAt: { gt: new Date() } },
      _sum: { amount: true }
    })
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, referralCode: true }
    })
    res.json({
      message: "SUCCESS ACCESS",
      user: { ...user, points: pointsAgg._sum.amount || 0 }
    })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

// ================= ROLE BASED ROUTE =================

//  hanya CUSTOMER
app.get(
  "/api/customer",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  (req: Request, res: Response) => {
    res.json({
      message: "WELCOME CUSTOMER",
      user: (req as any).user
    })
  }
)

//  hanya ORGANIZER
app.get(
  "/api/organizer",
  authMiddleware,
  roleMiddleware("ORGANIZER"),
  (req: Request, res: Response) => {
    res.json({
      message: "WELCOME ORGANIZER",
      user: (req as any).user
    })
  }
)

// ================= ERROR HANDLER =================
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err)
  res.status(500).json({
    message: "Internal Server Error"
  })
})

// ================= SERVER =================
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
