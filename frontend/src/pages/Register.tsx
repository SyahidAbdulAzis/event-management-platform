import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../lib/axios"

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
    role: "CUSTOMER",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join our event community</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-8 space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Daftar Sebagai
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: "CUSTOMER" }))}
                className={`py-3 rounded-lg font-semibold text-sm border-2 transition ${
                  formData.role === "CUSTOMER"
                    ? "border-purple-500 bg-purple-600 text-white"
                    : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: "ORGANIZER" }))}
                className={`py-3 rounded-lg font-semibold text-sm border-2 transition ${
                  formData.role === "ORGANIZER"
                    ? "border-purple-500 bg-purple-600 text-white"
                    : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
                }`}
              >
                Organizer
              </button>
            </div>
          </div>

          {/* Referral Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Referral Code (optional)
            </label>
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter referral code"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-bold text-lg transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}
