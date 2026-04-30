import cron from "node-cron"
import prisma from "../prisma/client"
import { rollbackTransaction } from "../controllers/transaction.controller"

// Jalankan setiap menit
cron.schedule("* * * * *", async () => {
  const now = new Date()

  // ===== EXPIRE: tidak upload bukti pembayaran sebelum paymentDeadline =====
  // mode testing saat ini: paymentDeadline diset 1 menit setelah checkout
  const expiredTransactions = await prisma.transaction.findMany({
    where: {
      status: "WAITING_PAYMENT",
      paymentDeadline: { lt: now }
    },
    include: { event: true }
  })

  for (const tx of expiredTransactions) {
    await rollbackTransaction(tx)
    await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: "EXPIRED" }
    })
    console.log(`Transaction ${tx.id} EXPIRED`)
  }

  // ===== AUTO-CANCEL: organizer tidak respon dalam 1 menit (testing) =====
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)

  const waitingConfirmationTransactions = await prisma.transaction.findMany({
    where: {
      status: "WAITING_CONFIRMATION",
      updatedAt: { lt: oneMinuteAgo }
    },
    include: { event: true }
  })

  for (const tx of waitingConfirmationTransactions) {
    await rollbackTransaction(tx)
    await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: "CANCELLED" }
    })
    console.log(`Transaction ${tx.id} AUTO-CANCELLED (organizer no response in 1 minute)`)
  }
})
