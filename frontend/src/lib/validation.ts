import { z } from "zod"

// ================= REGISTER VALIDATION =================
export const registerSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
  referralCode: z.string().optional(),
  role: z.enum(["CUSTOMER", "ORGANIZER"])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak sama",
  path: ["confirmPassword"]
})

// ================= LOGIN VALIDATION =================
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter")
})

// ================= CHANGE PASSWORD VALIDATION =================
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Password saat ini minimal 6 karakter"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Password baru tidak sama",
  path: ["confirmPassword"]
})

// ================= CREATE EVENT VALIDATION =================
export const createEventSchema = z.object({
  title: z.string().min(3, "Judul event minimal 3 karakter"),
  category: z.enum(["Festival", "Solo Concert", "Arena Concert", "Intimate Concert", "Others"]),
  location: z.string().min(3, "Lokasi minimal 3 karakter"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
  price: z.string().optional(),
  totalSeats: z.string().min(1, "Jumlah kursi wajib diisi"),
  imageUrl: z.string().url("URL gambar tidak valid").optional().or(z.literal("")),
  isPaid: z.boolean().optional(),
  isDraft: z.boolean().optional(),
  vouchers: z.array(z.object({
    code: z.string().min(3, "Kode voucher minimal 3 karakter"),
    discount: z.number().min(1, "Diskon minimal 1%").max(100, "Diskon maksimal 100%"),
    startDate: z.string().min(1, "Tanggal mulai voucher wajib diisi"),
    endDate: z.string().min(1, "Tanggal selesai voucher wajib diisi")
  })).optional()
}).refine((data) => {
  if (data.isPaid === false) return true
  const price = parseInt(data.price || "0")
  return price >= 0
}, {
  message: "Harga tidak boleh negatif",
  path: ["price"]
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true
  return new Date(data.startDate) <= new Date(data.endDate)
}, {
  message: "Tanggal selesai harus setelah atau sama dengan tanggal mulai",
  path: ["endDate"]
})

// ================= VOUCHER VALIDATION =================
export const voucherSchema = z.object({
  code: z.string().min(3, "Kode voucher minimal 3 karakter"),
  discount: z.string().min(1, "Diskon wajib diisi"),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai wajib diisi")
}).refine((data) => {
  const discount = parseInt(data.discount)
  return discount >= 1 && discount <= 100
}, {
  message: "Diskon harus antara 1-100%",
  path: ["discount"]
})

// ================= RESET PASSWORD VALIDATION =================
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token wajib diisi"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter")
})

// ================= FORGOT PASSWORD VALIDATION =================
export const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid")
})

export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type CreateEventFormData = z.infer<typeof createEventSchema>
export type VoucherFormData = z.infer<typeof voucherSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
