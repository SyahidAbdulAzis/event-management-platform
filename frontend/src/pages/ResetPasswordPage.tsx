import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import api from "../lib/axios"

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") || ""

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      alert("Password tidak sama")
      return
    }

    if (newPassword.length < 6) {
      alert("Password minimal 6 karakter")
      return
    }

    setLoading(true)

    try {
      await api.post('/api/auth/reset-password', {
        token,
        newPassword
      })
      alert("Password berhasil direset. Silakan login dengan password baru.")
      navigate("/login")
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen font-['Inter'] pt-12 flex flex-col" style={{ background: "#f3f4f6" }}>
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 font-['Plus_Jakarta_Sans'] text-center">
              Reset Password
            </h1>
            <p className="text-sm text-gray-500 mb-6 text-center">
              Masukkan password baru Anda
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Token Reset</label>
                <input
                  type="text"
                  value={token}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg text-sm text-gray-700 border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-200 focus:border-[#0ea5e9] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-200 focus:border-[#0ea5e9] outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0ea5e9] text-white py-3 font-bold text-sm rounded-lg hover:bg-[#0284c7] transition-colors disabled:opacity-50"
              >
                {loading ? "Mereset..." : "Reset Password"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-[#0ea5e9] font-medium hover:underline">
                Kembali ke Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
