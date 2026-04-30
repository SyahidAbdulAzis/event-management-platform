import cron from "node-cron"
import prisma from "../prisma/client"

// Jalankan setiap menit
cron.schedule("* * * * *", async () => {
  console.log("RUN CRON: CHECK COUPON EXPIRATION")

  const now = new Date()

  await prisma.coupon.deleteMany({
    where: {
      expiresAt: {
        lt: now
      }
    }
  })

  console.log("EXPIRED COUPONS DELETED")
})
