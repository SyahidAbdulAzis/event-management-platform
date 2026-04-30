import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../lib/axios"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { registerSchema, type RegisterFormData } from "../lib/validation"
import { z } from "zod"

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
    role: "CUSTOMER",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate with Zod
    try {
      registerSchema.parse(formData)
      setErrors({})
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMap: Record<string, string> = {}
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            errorMap[err.path[0] as string] = err.message
          }
        })
        setErrors(errorMap)
        return
      }
    }

    setLoading(true)

    try {
      const { confirmPassword, ...registerData } = formData
      await api.post("/api/auth/register", registerData)
      alert("Registration successful! Please login.")
      navigate("/login")
    } catch (error: any) {
      console.error("Registration failed:", error)
      alert(error.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen font-['Inter'] pt-12" style={{ background: "#f3f4f6" }}>
      <Navbar />

      <main className="pt-8 pb-5 px-5">
        <div className="max-w-md mx-auto">
          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">mail</span>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 pl-12 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border ${
                      errors.email ? "border-red-500" : "border-gray-200 focus:border-[#0ea5e9]"
                    }`}
                    placeholder="nama@email.com"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">lock</span>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 pl-12 pr-12 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border ${
                      errors.password ? "border-red-500" : "border-gray-200 focus:border-[#0ea5e9]"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                    ) : (
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">lock</span>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 pl-12 pr-12 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-200 focus:border-[#0ea5e9]"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                    ) : (
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Daftar Sebagai
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 text-left outline-none hover:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9] flex items-center justify-between"
                  >
                    <span>{formData.role === "CUSTOMER" ? "Customer" : "Organizer"}</span>
                    <span className="material-symbols-outlined text-gray-400 text-base">expand_more</span>
                  </button>
                  {roleMenuOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, role: "CUSTOMER" }))
                          setRoleMenuOpen(false)
                        }}
                        className={`w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                          formData.role === "CUSTOMER" ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] font-semibold' : 'text-gray-700'
                        }`}
                      >
                        <span>Customer</span>
                        {formData.role === "CUSTOMER" && <span className="material-symbols-outlined text-[18px] text-[#0ea5e9]">check</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, role: "ORGANIZER" }))
                          setRoleMenuOpen(false)
                        }}
                        className={`w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                          formData.role === "ORGANIZER" ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] font-semibold' : 'text-gray-700'
                        }`}
                      >
                        <span>Organizer</span>
                        {formData.role === "ORGANIZER" && <span className="material-symbols-outlined text-[18px] text-[#0ea5e9]">check</span>}
                      </button>
                    </div>
                  )}
                </div>
                {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
              </div>

              {/* Referral Code */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kode Referral (Opsional)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">card_giftcard</span>
                  <input
                    name="referralCode"
                    type="text"
                    value={formData.referralCode}
                    onChange={handleChange}
                    className="w-full px-4 pl-12 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 transition-colors border border-gray-200 focus:border-[#0ea5e9]"
                    placeholder="Masukkan kode referral"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Gunakan kode referral untuk dapat kupon diskon</p>
                {errors.referralCode && <p className="text-xs text-red-500 mt-1">{errors.referralCode}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0ea5e9] text-white font-bold text-base rounded-lg hover:bg-[#0284c7] transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Daftar"}
              </button>

              {/* Login Link */}
              <p className="text-center text-gray-600 pt-2 border-t border-gray-100">
                Sudah punya akun?{" "}
                <Link to="/login" className="text-[#0ea5e9] font-semibold hover:underline">
                  Masuk sekarang
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
