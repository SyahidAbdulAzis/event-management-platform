import cron from "node-cron"
import prisma from "../prisma/client"
import { rollbackTransaction } from "../controllers/transaction.controller"

// Jalankan setiap menit
cron.schedule("* * * * *", async () => {
  const now = new Date()

  // ===== EXPIRE: tidak upload bukti pembayaran dalam 2 jam =====
  // sesuai dokumentasi: Transaksi kedaluwarsa jika bukti pembayaran tidak diunggah dalam 2 jam
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

  // ===== AUTO-CANCEL: organizer tidak respon dalam 3 hari =====
  // sesuai dokumentasi: Jika organizer tidak menerima/menolak dalam 3 hari, transaksi otomatis dibatalkan
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

  const waitingConfirmationTransactions = await prisma.transaction.findMany({
    where: {
      status: "WAITING_CONFIRMATION",
      updatedAt: { lt: threeDaysAgo }
    },
    include: { event: true }
  })

  for (const tx of waitingConfirmationTransactions) {
    await rollbackTransaction(tx)
    await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: "CANCELLED" }
    })
    console.log(`Transaction ${tx.id} AUTO-CANCELLED (organizer no response in 3 days)`)
  }
})
