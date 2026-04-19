/// <reference path="../types/voucher-code-generator.d.ts" />
import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { generate } from "voucher-code-generator"
import dayjs from "dayjs"
import prisma from "../prisma/client"

// ================= REGISTER =================
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, referralCode, role } = req.body

    // cek email sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ message: "Email already used" })
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // generate referral sendiri
    const myReferral = generate({ length: 6 })[0]

    // cari user referral
    let referredUser = null

    if (referralCode) {
      referredUser = await prisma.user.findUnique({
        where: { referralCode }
      })
    }

    const userRole = role === "ORGANIZER" ? "ORGANIZER" : "CUSTOMER"

    // create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: userRole,
        referralCode: myReferral,
        referredBy: userRole === "CUSTOMER" && referredUser ? referredUser.id : null
      }
    })

    // kasih reward (hanya untuk CUSTOMER yang pakai referral)
    if (userRole === "CUSTOMER" && referredUser) {
      console.log("REFERRAL VALID → kasih reward")

      // point ke referrer
      await prisma.pointHistory.create({
        data: {
          userId: referredUser.id,
          amount: 10000,
          expiresAt: dayjs().add(3, "month").toDate()
        }
      })

      // coupon ke user baru
      await prisma.coupon.create({
        data: {
          code: generate({ length: 6 })[0],
          discount: 10,
          userId: user.id,
          expiresAt: dayjs().add(3, "month").toDate()
        }
      })
    }

    res.json({
      message: "Register success",
      user: {
        id: user.id,
        email: user.email,
        referralCode: user.referralCode,
        referredBy: user.referredBy
      }
    })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

// ================= LOGIN =================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" })
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    )

    res.json({
      message: "Login success",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

// ================= UPDATE PROFILE =================
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    const user = await prisma.user.update({
      where: { id: (req as any).user.id },
      data: { email }
    })

    res.json({
      message: "Profile updated",
      user: {
        id: user.id,
        email: user.email
      }
    })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const resetToken = Math.random().toString(36).substring(2, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExp: dayjs().add(1, "hour").toDate()
      }
    })

    res.json({
      message: "Reset token created",
      resetToken   // ⚠️ biasanya dikirim via email, tapi kita tampilkan
    })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

// ================= RESET PASSWORD =================
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExp: null
      }
    })

    res.json({
      message: "Password reset success"
    })

  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}
