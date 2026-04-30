import { Request, Response } from "express"
import prisma from "../prisma/client"
import dayjs from "dayjs"
import multer from "multer"
import cloudinary from "../config/cloudinary"
import { sendEmail } from "../config/email"

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    role: string
  }
}

// ================= MULTER CONFIG =================
// Use memory storage for Cloudinary upload
const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// ================= CREATE TRANSACTION (buy ticket) =================
export const createTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { eventId, quantity, voucherCode, couponCode, pointsUsed } = req.body

    const event = await prisma.event.findUnique({ where: { id: eventId } })

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    if (event.availableSeats < quantity) {
      return res.status(400).json({ message: "Not enough available seats" })
    }

    const basePrice = event.price * quantity
    let finalPrice = basePrice
    let appliedVoucherCode: string | null = null
    let appliedCouponCode: string | null = null

    // Apply voucher
    if (basePrice > 0 && voucherCode) {
      const voucher = await prisma.voucher.findUnique({ where: { code: voucherCode } })
      const now = new Date()
      // Voucher is valid if it belongs to the event and hasn't expired (endDate >= now)
      // startDate check removed to allow vouchers to be used before they "start" for pre-event purchases
      if (voucher && voucher.eventId === eventId && voucher.endDate >= now) {
        finalPrice = finalPrice - Math.floor(finalPrice * voucher.discount / 100)
        appliedVoucherCode = voucherCode
      } else {
        return res.status(400).json({ message: "Invalid or expired voucher" })
      }
    }

    // Apply coupon
    if (basePrice > 0 && couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: { code: couponCode, userId: req.user!.id, isUsed: false, expiresAt: { gt: new Date() } }
      })
      if (coupon) {
        finalPrice = finalPrice - Math.floor(finalPrice * coupon.discount / 100)
        appliedCouponCode = couponCode
        await prisma.coupon.update({ where: { id: coupon.id }, data: { isUsed: true } })
      } else {
        return res.status(400).json({ message: "Invalid or expired coupon" })
      }
    }

    // Apply points
    let usedPoints = 0
    if (basePrice > 0 && pointsUsed && pointsUsed > 0) {
      const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
      if (!user) return res.status(404).json({ message: "User not found" })

      const totalPoints = await prisma.pointHistory.aggregate({
        where: { userId: req.user!.id, expiresAt: { gt: new Date() } },
        _sum: { amount: true }
      })

      const availablePoints = totalPoints._sum.amount || 0
      usedPoints = Math.min(pointsUsed, availablePoints, finalPrice)
      finalPrice = finalPrice - usedPoints
    }

    // Payment deadline: 2 hours from now sesuai dokumentasi
    const paymentDeadline = dayjs().add(2, "hour").toDate()
    const initialStatus = finalPrice === 0 ? "DONE" : "WAITING_PAYMENT"

    const transaction = await prisma.transaction.create({
      data: {
        customerId: req.user!.id,
        eventId,
        quantity: parseInt(quantity),
        basePrice,
        finalPrice,
        pointsUsed: usedPoints,
        voucherCode: appliedVoucherCode,
        couponCode: appliedCouponCode,
        paymentDeadline,
        status: initialStatus
      }
    })

    if (usedPoints > 0) {
      await prisma.pointHistory.create({
        data: {
          userId: req.user!.id,
          amount: -usedPoints,
          expiresAt: dayjs().add(3, "month").toDate()
        }
      })
    }

    // Kurangi available seats
    await prisma.event.update({
      where: { id: eventId },
      data: { availableSeats: { decrement: parseInt(quantity) } }
    })

    res.status(201).json({
      message: initialStatus === "DONE" ? "Free event transaction completed successfully" : "Transaction created successfully",
      transaction
    })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

// ================= UPLOAD PAYMENT PROOF =================
export const uploadPaymentProof = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string

    const transaction = await prisma.transaction.findFirst({
      where: { id, customerId: req.user!.id }
    })

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    if (transaction.status !== "WAITING_PAYMENT") {
      return res.status(400).json({ message: "Transaction is not waiting for payment" })
    }

    // Cek apakah sudah kedaluwarsa
    if (new Date() > transaction.paymentDeadline) {
      return res.status(400).json({ message: "Payment deadline has passed. Transaction expired." })
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'payment-proofs',
          public_id: `proof-${transaction.id}-${Date.now()}`,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(req.file!.buffer)
    })

    const paymentProof = result.secure_url

    const updated = await prisma.transaction.update({
      where: { id: id },
      data: {
        paymentProof,
        status: "WAITING_CONFIRMATION"
      }
    })

    res.json({
      message: "Payment proof uploaded successfully",
      transaction: updated
    })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

// ================= GET MY TRANSACTIONS (CUSTOMER) =================
export const getMyTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { customerId: req.user!.id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            startDate: true,
            endDate: true,
            price: true,
            location: true,
            reviews: {
              where: {
                customerId: req.user!.id
              },
              select: {
                id: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    res.json({ message: "Transactions retrieved", transactions })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

// ================= GET TRANSACTION DETAIL =================
export const getTransactionDetail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        customerId: req.user!.id
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            startDate: true,
            endDate: true,
            location: true,
            price: true
          }
        }
      }
    })

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    res.json({ message: "Transaction retrieved", transaction })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

// ================= GET ORGANIZER TRANSACTIONS =================
export const getOrganizerTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        event: { organizerId: req.user!.id }
      },
      include: {
        event: { select: { id: true, title: true } },
        customer: { select: { id: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    res.json({ message: "Transactions retrieved", transactions })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

// ================= CONFIRM OR REJECT TRANSACTION (ORGANIZER) =================
export const confirmTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const { action } = req.body // "ACCEPT" | "REJECT"

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        event: { organizerId: req.user!.id }
      },
      include: {
        event: true,
        customer: true
      }
    })

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    if (action === "ACCEPT") {
      if (transaction.status === "DONE") {
        return res.json({ message: "Transaction already accepted" })
      }

      if (transaction.status !== "WAITING_CONFIRMATION") {
        return res.status(400).json({ message: `Transaction cannot be accepted from status ${transaction.status}` })
      }

      await prisma.transaction.update({
        where: { id: id },
        data: { status: "DONE" }
      })

      // Send email notification
      try {
        const emailHtml = `
          <h2>Pembayaran Tiket Diterima!</h2>
          <p>Hai ${transaction.customer.email},</p>
          <p>Pembayaran tiket untuk event <strong>${transaction.event.title}</strong> telah diterima.</p>
          <p>Detail transaksi:</p>
          <ul>
            <li>ID Transaksi: ${transaction.id}</li>
            <li>Jumlah Tiket: ${transaction.quantity}</li>
            <li>Total Bayar: Rp ${transaction.finalPrice.toLocaleString('id-ID')}</li>
          </ul>
          <p>Silakan tunjukkan bukti pembayaran ini saat check-in di venue event.</p>
        `
        await sendEmail(transaction.customer.email, 'Pembayaran Tiket Diterima', emailHtml)
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
        // Continue even if email fails
      }

      return res.json({ message: "Transaction accepted" })
    }

    if (action === "REJECT") {
      if (transaction.status === "REJECTED") {
        return res.json({ message: "Transaction already rejected" })
      }

      if (transaction.status !== "WAITING_CONFIRMATION") {
        return res.status(400).json({ message: `Transaction cannot be rejected from status ${transaction.status}` })
      }

      // Rollback: kembalikan seats, points, coupon sesuai dokumentasi
      await rollbackTransaction(transaction)
      await prisma.transaction.update({
        where: { id: id },
        data: { status: "REJECTED" }
      })

      // Send email notification
      try {
        const emailHtml = `
          <h2>Pembayaran Tiket Ditolak</h2>
          <p>Hai ${transaction.customer.email},</p>
          <p>Maaf, pembayaran tiket untuk event <strong>${transaction.event.title}</strong> ditolak.</p>
          <p>Alasan: Bukti pembayaran tidak valid atau tidak sesuai.</p>
          <p>Poin, voucher, atau kupon yang digunakan telah dikembalikan ke akun Anda.</p>
          <p>Silakan upload ulang bukti pembayaran jika Anda yakin pembayaran sudah benar.</p>
        `
        await sendEmail(transaction.customer.email, 'Pembayaran Tiket Ditolak', emailHtml)
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
        // Continue even if email fails
      }

      return res.json({ message: "Transaction rejected and rolled back" })
    }

    return res.status(400).json({ message: "Invalid action. Use ACCEPT or REJECT" })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

// ================= CANCEL TRANSACTION (CUSTOMER) =================
export const cancelTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        customerId: req.user!.id
      },
      include: { event: true }
    })

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    const isPendingTransaction = ["WAITING_PAYMENT", "WAITING_CONFIRMATION"].includes(transaction.status)
    const isFreeDoneBeforeEvent =
      transaction.status === "DONE" &&
      transaction.finalPrice === 0 &&
      new Date(transaction.event.startDate) > new Date()

    if (!isPendingTransaction && !isFreeDoneBeforeEvent) {
      return res.status(400).json({ message: "Transaction cannot be cancelled" })
    }

    // Rollback sesuai dokumentasi
    await rollbackTransaction(transaction)

    await prisma.transaction.update({
      where: { id: id },
      data: { status: "CANCELLED" }
    })

    res.json({ message: "Transaction cancelled and rolled back" })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

// ================= ROLLBACK HELPER =================
// Rollback dan Pemulihan Kursi sesuai dokumentasi:
// Poin, voucher, atau kupon yang digunakan dikembalikan jika transaksi dibatalkan atau kedaluwarsa.
// Selain itu, kursi yang tersedia dipulihkan.
export const rollbackTransaction = async (transaction: any) => {
  // Pulihkan seats
  await prisma.event.update({
    where: { id: transaction.eventId },
    data: { availableSeats: { increment: transaction.quantity } }
  })

  // Kembalikan points
  if (transaction.pointsUsed > 0) {
    await prisma.pointHistory.create({
      data: {
        userId: transaction.customerId,
        amount: transaction.pointsUsed,
        expiresAt: dayjs().add(3, "month").toDate()
      }
    })
  }

  // Kembalikan coupon
  if (transaction.couponCode) {
    await prisma.coupon.updateMany({
      where: { code: transaction.couponCode, userId: transaction.customerId },
      data: { isUsed: false }
    })
  }
}
