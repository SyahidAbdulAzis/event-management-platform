import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import api from "../lib/axios"
import { useAuthStore } from "../store/authStore"
import { changePasswordSchema, type ChangePasswordFormData } from "../lib/validation"
import { z } from "zod"

interface Coupon {
  id: string
  code: string
  discount: number
  expiresAt?: string | null
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [points, setPoints] = useState(0)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [photoUrl, setPhotoUrl] = useState("")
  const [draftPhotoUrl, setDraftPhotoUrl] = useState("")
  const [draftPhotoFile, setDraftPhotoFile] = useState<File | null>(null)
  const [profileReferralCode, setProfileReferralCode] = useState<string>("")

  useEffect(() => {
    if (!user) return

    // Fetch profile data including photo
    Promise.all([
      api.get('/api/profile'),
      api.get('/api/coupons/my')
    ])
      .then(([profileRes, couponsRes]) => {
        const profileUser = profileRes.data.user

        setProfileReferralCode(profileUser?.referralCode || "")
        setPhotoUrl(profileUser?.profilePhoto || "")

        setPoints(profileRes.data.user?.points || 0)
        setCoupons(couponsRes.data.coupons || [])
      })
      .catch(console.error)
  }, [user])

  const handleChoosePhoto = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2MB")
      return
    }

    setDraftPhotoFile(file)

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setDraftPhotoUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSavePhoto = async () => {
    if (!user || !draftPhotoUrl || !draftPhotoFile) return

    setPhotoLoading(true)
    try {
      const formData = new FormData()
      formData.append('photo', draftPhotoFile, draftPhotoFile.name)

      const res = await api.post('/api/auth/upload-profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setPhotoUrl(res.data.photoUrl)
      setUser({ ...user, profilePhoto: res.data.photoUrl })
      setDraftPhotoUrl("")
      setDraftPhotoFile(null)
      alert("Foto profil berhasil diperbarui")
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengunggah foto profil')
    } finally {
      setPhotoLoading(false)
    }
  }

  const handleDeletePhoto = async () => {
    if (!user) return

    if (!confirm("Apakah Anda yakin ingin menghapus foto profil?")) return

    setPhotoLoading(true)
    try {
      await api.delete('/api/auth/delete-profile-photo')
      setPhotoUrl("")
      setUser({ ...user, profilePhoto: undefined })
      alert("Foto profil berhasil dihapus")
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus foto profil')
    } finally {
      setPhotoLoading(false)
    }
  }

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()

    // Validate with Zod
    const formData: ChangePasswordFormData = {
      currentPassword,
      newPassword,
      confirmPassword
    }

    try {
      changePasswordSchema.parse(formData)
      setPasswordErrors({})
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMap: Record<string, string> = {}
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            errorMap[err.path[0] as string] = err.message
          }
        })
        setPasswordErrors(errorMap)
        return
      }
    }

    setPasswordLoading(true)

    try {
      await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      })
      alert("Password berhasil diubah")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal ubah password")
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen font-['Inter'] pt-12" style={{ background: "#f3f4f6" }}>
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-gray-500 mb-3">Silakan login terlebih dahulu</p>
            <Link to="/login" className="text-sm font-medium text-[#0ea5e9] hover:underline">
              Ke Halaman Login
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen font-['Inter'] pt-12" style={{ background: "#f3f4f6" }}>
      <Navbar />

      <section className="pt-8 px-5">
        <div className="max-w-7xl mx-auto">

          <div className="w-full border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "profile"
                  ? "border-[#0ea5e9] text-[#0ea5e9]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Profil
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "password"
                  ? "border-[#0ea5e9] text-[#0ea5e9]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Kata Sandi
            </button>
          </div>

          {activeTab === "profile" && (
            <>
              <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 font-['Plus_Jakarta_Sans'] mb-1">Informasi Profil</h2>
                <p className="text-sm text-gray-500 mb-6">Perbarui foto profil dan lihat detail akun Anda.</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Foto Profil</label>
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        {(draftPhotoUrl || photoUrl) ? (
                          <img
                            src={draftPhotoUrl || photoUrl}
                            alt="Foto Profil"
                            className="w-20 h-20 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-[#0ea5e9] flex items-center justify-center text-white text-2xl font-bold">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <button
                          type="button"
                          onClick={handleChoosePhoto}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#0ea5e9] text-white hover:bg-[#0284c7] transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">upload</span>
                          Upload Foto
                        </button>
                        {photoUrl && (
                          <button
                            type="button"
                            onClick={handleDeletePhoto}
                            disabled={photoLoading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                            Hapus Foto
                          </button>
                        )}
                        <p className="text-xs text-gray-400">Format JPG, PNG, maksimal 2MB.</p>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />

                    {draftPhotoUrl && (
                      <button
                        type="button"
                        onClick={handleSavePhoto}
                        disabled={photoLoading}
                        className="mt-3 px-4 py-2 bg-[#0ea5e9] text-white text-sm font-semibold rounded-lg hover:bg-[#0284c7] transition-colors disabled:opacity-50"
                      >
                        {photoLoading ? "Menyimpan..." : "Simpan Foto"}
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <div className="w-full px-4 py-3 bg-gray-100 rounded-lg text-sm text-gray-700 border border-gray-200">
                        {user.email}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Role</p>
                      <div className="w-full px-4 py-3 bg-gray-100 rounded-lg text-sm text-gray-700 border border-gray-200">
                        {user.role}
                      </div>
                    </div>
                    {user.role === "CUSTOMER" && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Referral</p>
                        <div className="w-full px-4 py-3 bg-gray-100 rounded-lg text-sm text-gray-700 border border-gray-200">
                          {profileReferralCode || user.referralCode || "N/A"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {user.role === "CUSTOMER" && (
                <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 font-['Plus_Jakarta_Sans']">Poin & Kupon</h3>

                  <div className="mb-6 p-4 bg-[#0ea5e9]/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Poin Tersedia</p>
                        <p className="text-2xl font-extrabold text-[#0c4a6e]">{points.toLocaleString()}</p>
                      </div>
                      <span className="material-symbols-outlined text-4xl text-[#0ea5e9]">stars</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Poin kedaluwarsa 3 bulan setelah dikreditkan</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Kupon Saya</p>
                    {coupons.length === 0 ? (
                      <div className="rounded-xl border border-gray-200 shadow-sm text-center py-14 px-6 text-sm">Belum ada kupon</div>
                    ) : (
                      <div className="space-y-2">
                        {coupons.map((coupon) => (
                          <div key={coupon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{coupon.code}</p>
                              <p className="text-xs text-gray-600">{coupon.discount}% OFF</p>
                            </div>
                            <span className="text-xs text-gray-400">
                              {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('id-ID') : '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "password" && (
            <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-1 font-['Plus_Jakarta_Sans']">Ubah Password</h3>
              <p className="text-sm text-gray-500 mb-6">Gunakan password baru yang kuat dan mudah Anda ingat.</p>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    className={`w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 border focus:border-[#0ea5e9] outline-none ${
                      passwordErrors.currentPassword ? "border-red-500" : "border-gray-200"
                    }`}
                    required
                  />
                  {passwordErrors.currentPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru"
                    className={`w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 border focus:border-[#0ea5e9] outline-none ${
                      passwordErrors.newPassword ? "border-red-500" : "border-gray-200"
                    }`}
                    required
                  />
                  {passwordErrors.newPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className={`w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 border focus:border-[#0ea5e9] outline-none ${
                      passwordErrors.confirmPassword ? "border-red-500" : "border-gray-200"
                    }`}
                    required
                  />
                  {passwordErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</p>}
                </div>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full bg-[#0ea5e9] text-white py-3 font-bold text-sm rounded-lg hover:bg-[#0284c7] transition-colors disabled:opacity-50"
                >
                  {passwordLoading ? "Mengubah..." : "Ubah Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
