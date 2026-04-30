import { Request, Response } from "express"
import prisma from "../prisma/client"

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    role: string
  }
}

// ================= CREATE REVIEW =================
// Customer hanya dapat memberikan ulasan dan rating setelah menghadiri event (sesuai dokumentasi)
export const createReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { eventId, rating, comment } = req.body

    if (!eventId) {
      return res.status(400).json({ message: "Event tidak valid" })
    }

    if (rating === undefined || rating === null) {
      return res.status(400).json({ message: "Rating wajib diisi" })
    }

    if (!comment || String(comment).trim() === "") {
      return res.status(400).json({ message: "Ulasan wajib diisi" })
    }

    // Validasi: customer hanya bisa review setelah menghadiri event (status DONE)
    const completedTransaction = await prisma.transaction.findFirst({
      where: {
        customerId: req.user!.id,
        eventId,
        status: "DONE"
      }
    })

    if (!completedTransaction) {
      return res.status(403).json({
        message: "Anda hanya dapat memberikan ulasan setelah menghadiri event ini."
      })
    }

    // Cek apakah sudah pernah review
    const existingReview = await prisma.review.findUnique({
      where: {
        customerId_eventId: {
          customerId: req.user!.id,
          eventId
        }
      }
    })

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this event" })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" })
    }

    const review = await prisma.review.create({
      data: {
        customerId: req.user!.id,
        eventId,
        rating: parseInt(rating),
        comment
      },
      include: {
        customer: { select: { id: true, email: true } },
        event: { select: { id: true, title: true } }
      }
    })

    res.status(201).json({
      message: "Review created successfully",
      review
    })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

// ================= GET REVIEWS BY EVENT =================
export const getEventReviews = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params

    const reviews = await prisma.review.findMany({
      where: { eventId: eventId as string },
      include: {
        customer: { select: { id: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    res.json({
      message: "Reviews retrieved",
      avgRating: parseFloat(avgRating.toFixed(1)),
      count: reviews.length,
      reviews
    })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

// ================= GET ORGANIZER PROFILE WITH REVIEWS =================
// Menampilkan rating dan ulasan di profil event organizer sesuai dokumentasi
export const getOrganizerProfile = async (req: Request, res: Response) => {
  try {
    const { organizerId } = req.params

    const organizer = await prisma.user.findFirst({
      where: { id: organizerId as string, role: "ORGANIZER" },
      select: { id: true, email: true, profilePhoto: true }
    })

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" })
    }

    // Ambil semua event organizer beserta reviews
    const events = await prisma.event.findMany({
      where: { organizerId: organizerId as string },
      include: {
        reviews: {
          include: {
            customer: { select: { id: true, email: true } }
          },
          orderBy: { createdAt: "desc" }
        },
        _count: {
          select: { transactions: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Hitung agregat rating
    const allReviews = events.flatMap((e: any) => e.reviews)
    const avgRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0

    const totalAttendees = events.reduce((sum: number, e: any) => sum + e._count.transactions, 0)

    res.json({
      message: "Organizer profile retrieved",
      organizer: {
        ...organizer,
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalReviews: allReviews.length,
        totalEvents: events.length,
        totalAttendees
      },
      events,
      reviews: allReviews
    })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}
