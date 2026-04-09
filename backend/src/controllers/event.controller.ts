/// <reference path="../types/voucher-code-generator.d.ts" />
import { Request, Response } from "express"
import prisma from "../prisma/client"
import { generate } from "voucher-code-generator"

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    role: string
  }
}

// ================= LIST EVENTS (with search & filter) =================
export const listEvents = async (req: Request, res: Response) => {
  try {
    const { search, category, location } = req.query

    const where: any = {}

    if (search) {
      where.title = {
        contains: search as string,
        mode: "insensitive"
      }
    }

    if (category) {
      where.category = category as string
    }

    if (location) {
      where.location = {
        contains: location as string,
        mode: "insensitive"
      }
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            email: true
          }
        },
        vouchers: {
          select: {
            id: true,
            code: true,
            discount: true,
            startDate: true,
            endDate: true
          }
        },
        _count: {
          select: {
            transactions: true,
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    res.json({
      message: "Events retrieved successfully",
      count: events.length,
      events
    })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

// ================= GET EVENT DETAIL =================
export const getEventDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const event = await prisma.event.findUnique({
      where: { id: id as string },
      include: {
        organizer: {
          select: {
            id: true,
            email: true
          }
        },
        vouchers: {
          select: {
            id: true,
            code: true,
            discount: true,
            startDate: true,
            endDate: true
          }
        },
        reviews: {
          include: {
            customer: {
              select: {
                id: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        },
        _count: {
          select: {
            transactions: true
          }
        }
      }
    })

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    res.json({
      message: "Event retrieved successfully",
      event
    })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

// ================= CREATE EVENT (ORGANIZER only) =================
export const createEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      location,
      imageUrl,
      startDate,
      endDate,
      price,
      totalSeats
    } = req.body

    const event = await prisma.event.create({
      data: {
        organizerId: req.user!.id,
        title,
        description,
        category,
        location,
        imageUrl,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        price: parseInt(price),
        totalSeats: parseInt(totalSeats),
        availableSeats: parseInt(totalSeats)
      }
    })

    res.status(201).json({
      message: "Event created successfully",
      event
    })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

// ================= UPDATE EVENT (ORGANIZER owner only) =================
export const updateEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const {
      title,
      description,
      category,
      location,
      imageUrl,
      startDate,
      endDate,
      price,
      totalSeats
    } = req.body

    // Check if event exists and belongs to the organizer
    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        organizerId: req.user!.id
      }
    })

    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found or you don't have permission" })
    }

    // Calculate new available seats if totalSeats changed
    let availableSeats = existingEvent.availableSeats
    if (totalSeats) {
      const soldSeats = existingEvent.totalSeats - existingEvent.availableSeats
      availableSeats = parseInt(totalSeats) - soldSeats
    }

    const event = await prisma.event.update({
      where: { id: id },
      data: {
        title,
        description,
        category,
        location,
        imageUrl,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        price: price ? parseInt(price) : undefined,
        totalSeats: totalSeats ? parseInt(totalSeats) : undefined,
        availableSeats: totalSeats ? availableSeats : undefined
      }
    })

    res.json({
      message: "Event updated successfully",
      event
    })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

// ================= DELETE EVENT (ORGANIZER owner only) =================
export const deleteEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string

    // Check if event exists and belongs to the organizer
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: id,
        organizerId: req.user!.id
      }
    })

    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found or you don't have permission" })
    }

    // Delete related vouchers first
    await prisma.voucher.deleteMany({
      where: { eventId: id }
    })

    // Delete the event
    await prisma.event.delete({
      where: { id: id }
    })

    res.json({
      message: "Event deleted successfully"
    })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

// ================= CREATE VOUCHER (ORGANIZER owner only) =================
export const createVoucher = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const { discount, startDate, endDate } = req.body

    // Check if event exists and belongs to the organizer
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: id,
        organizerId: req.user!.id
      }
    })

    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found or you don't have permission" })
    }

    // Generate unique voucher code
    let code = generate({ length: 8 })[0]
    let existingVoucher = await prisma.voucher.findUnique({
      where: { code }
    })

    // Keep generating until unique
    while (existingVoucher) {
      code = generate({ length: 8 })[0]
      existingVoucher = await prisma.voucher.findUnique({
        where: { code }
      })
    }

    const voucher = await prisma.voucher.create({
      data: {
        eventId: id as string,
        code,
        discount: parseInt(discount),
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    })

    res.status(201).json({
      message: "Voucher created successfully",
      voucher
    })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}
