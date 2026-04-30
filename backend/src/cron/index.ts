import cron from "node-cron"
import prisma from "../prisma/client"
import dayjs from "dayjs"
import { checkEventExpiration } from './eventExpiration'
import { rollbackTransaction } from "../controllers/transaction.controller"

// ================= CRON JOB: Auto-Expire Events =================
// Event otomatis berubah status ke EXPIRED jika tanggal selesai sudah lewat
const expireEventsJob = cron.schedule("* * * * *", async () => {
  try {
    await checkEventExpiration()
  } catch (err) {
    console.error("Error in expireEventsJob:", err)
  }
})

// ================= CRON JOB: Auto-Expire Transactions (2 hours) =================
// Transaksi kedaluwarsa jika bukti pembayaran tidak diunggah dalam 2 jam
const expireTransactionsJob = cron.schedule("*/30 * * * *", async () => {
  try {
    console.log("Running cron: Expire transactions after 2 hours")

    const twoHoursAgo = dayjs().subtract(2, "hour").toDate()

    // Find transactions in WAITING_PAYMENT status created more than 2 hours ago
    const expiredTransactions = await prisma.transaction.findMany({
      where: {
        status: "WAITING_PAYMENT",
        createdAt: { lt: twoHoursAgo }
      },
      include: { event: true }
    })

    for (const tx of expiredTransactions) {
      // Rollback: restore seats, points, and coupon if used
      await rollbackTransaction(tx)

      // Update transaction status to EXPIRED
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { status: "EXPIRED" }
      })

      console.log(`Transaction ${tx.id} expired (no payment proof in 2 hours)`)
    }
  } catch (err) {
    console.error("Error in expireTransactionsJob:", err)
  }
})

// ================= CRON JOB: Auto-Cancel Transactions (3 days) =================
// Transaksi otomatis dibatalkan jika organizer tidak menerima/menolak dalam 3 hari
const cancelTransactionsJob = cron.schedule("0 */6 * * *", async () => {
  try {
    console.log("Running cron: Cancel transactions after 3 days")

    const threeDaysAgo = dayjs().subtract(3, "day").toDate()

    // Find transactions in WAITING_CONFIRMATION status created more than 3 days ago
    const cancelTransactions = await prisma.transaction.findMany({
      where: {
        status: "WAITING_CONFIRMATION",
        createdAt: { lt: threeDaysAgo }
      },
      include: { event: true }
    })

    for (const tx of cancelTransactions) {
      // Rollback: restore seats, points, and coupon if used
      await rollbackTransaction(tx)

      // Update transaction status to CANCELLED
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { status: "CANCELLED" }
      })

      console.log(`Transaction ${tx.id} auto-cancelled (no action in 3 days)`)
    }
  } catch (err) {
    console.error("Error in cancelTransactionsJob:", err)
  }
})

// ================= CRON JOB: Expire Points (3 months) =================
// Poin kedaluwarsa 3 bulan setelah dikreditkan
const expirePointsJob = cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running cron: Expire points after 3 months")

    const threeMonthsAgo = dayjs().subtract(3, "month").toDate()

    // Find expired point history
    const expiredPoints = await prisma.pointHistory.findMany({
      where: {
        expiresAt: { lt: threeMonthsAgo }
      }
    })

    // Delete expired point history
    for (const point of expiredPoints) {
      await prisma.pointHistory.delete({ where: { id: point.id } })
      console.log(`Expired point history ${point.id} deleted`)
    }
  } catch (err) {
    console.error("Error in expirePointsJob:", err)
  }
})

// ================= CRON JOB: Expire Coupons (3 months) =================
// Kupon diskon berlaku 3 bulan setelah dibuat
const expireCouponsJob = cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running cron: Expire coupons after 3 months")

    const threeMonthsAgo = dayjs().subtract(3, "month").toDate()

    // Find expired coupons
    const expiredCoupons = await prisma.coupon.findMany({
      where: {
        expiresAt: { lt: threeMonthsAgo }
      }
    })

    // Delete expired coupons
    for (const coupon of expiredCoupons) {
      await prisma.coupon.delete({ where: { id: coupon.id } })
      console.log(`Expired coupon ${coupon.code} deleted`)
    }
  } catch (err) {
    console.error("Error in expireCouponsJob:", err)
  }
})

// ================= START ALL CRON JOBS =================
export function startCronJobs() {
  console.log("Starting cron jobs...")
  expireEventsJob.start()
  expireTransactionsJob.start()
  cancelTransactionsJob.start()
  expirePointsJob.start()
  expireCouponsJob.start()
  console.log("Cron jobs started successfully")
}

// ================= STOP ALL CRON JOBS =================
export function stopCronJobs() {
  console.log("Stopping cron jobs...")
  expireEventsJob.stop()
  expireTransactionsJob.stop()
  cancelTransactionsJob.stop()
  expirePointsJob.stop()
  expireCouponsJob.stop()
  console.log("Cron jobs stopped")
}
