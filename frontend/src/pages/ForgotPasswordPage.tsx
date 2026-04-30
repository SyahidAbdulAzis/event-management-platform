import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import api from "../lib/axios"

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [resetToken, setResetToken] = useState("")

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await api.post('/api/auth/forgot-password', { email })
      setResetToken(res.data.resetToken)
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal mengirim reset token")
    } finally {
      setLoading(false)
    }
  }

  const handleGoToReset = () => {
    navigate(`/reset-password?token=${resetToken}`)
  }

  return (
    <div className="min-h-screen font-['Inter'] pt-12 flex flex-col" style={{ background: "#f3f4f6" }}>
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 font-['Plus_Jakarta_Sans'] text-center">
              Lupa Password?
            </h1>
            <p className="text-sm text-gray-500 mb-6 text-center">
              Masukkan email Anda untuk mendapatkan token reset password
            </p>

            {!resetToken ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email Anda"
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-200 focus:border-[#0ea5e9] outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0ea5e9] text-white py-3 font-bold text-sm rounded-lg hover:bg-[#0284c7] transition-colors disabled:opacity-50"
                >
                  {loading ? "Mengirim..." : "Kirim Token Reset"}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 mb-2">Token reset berhasil dibuat!</p>
                  <p className="text-xs text-green-600 mb-3">Token Anda:</p>
                  <div className="bg-white px-4 py-3 rounded-lg border border-green-300">
                    <code className="text-lg font-bold text-green-700">{resetToken}</code>
                  </div>
                  <p className="text-xs text-green-600 mt-2">Simpan token ini untuk reset password</p>
                </div>
                <button
                  onClick={handleGoToReset}
                  className="w-full bg-[#0ea5e9] text-white py-3 font-bold text-sm rounded-lg hover:bg-[#0284c7] transition-colors"
                >
                  Lanjut ke Reset Password
                </button>
              </div>
            )}

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
