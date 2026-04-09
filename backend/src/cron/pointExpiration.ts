import cron from "node-cron"
import dayjs from "dayjs"
import prisma from "../prisma/client"

cron.schedule("* * * * *", async () => {
  console.log("RUN CRON: CHECK POINT EXPIRATION")

  const now = new Date()

  await prisma.pointHistory.deleteMany({
    where: {
      expiresAt: {
        lt: now
      }
    }
  })

  console.log("EXPIRED POINTS DELETED")
})
