import express, { Request, Response, NextFunction } from "express"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

// Import cron job
import "./cron/pointExpiration"

const app = express()

// ================= MIDDLEWARE =================
app.use(cors())
app.use(express.json())

// ================= ROUTES =================
import authRoutes from "./routes/auth.routes"
import eventRoutes from "./routes/event.routes"
import authMiddleware from "./middleware/auth.middleware"
import roleMiddleware from "./middleware/role.middleware"

app.use("/api/auth", authRoutes)
app.use("/api/events", eventRoutes)

// ================= ROOT =================
app.get("/", (req: Request, res: Response) => {
  res.send("API RUNNING 🚀")
})

// ================= PROTECTED ROUTE =================
app.get("/api/profile", authMiddleware, (req: Request, res: Response) => {
  res.json({
    message: "SUCCESS ACCESS",
    user: (req as any).user
  })
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
