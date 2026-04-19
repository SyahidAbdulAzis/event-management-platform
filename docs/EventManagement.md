# Event Management Platform
## Tech Stack & Project Documentation

---

## Project Overview

Mini project dari bootcamp Purwadhika. Platform event management berbasis web yang memungkinkan event organizer membuat dan mempromosikan event, sementara customer bisa browse dan melakukan registrasi ke event tersebut.

---

## Tech Stack

### Frontend

| Package / Tool | Keterangan |
|---|---|
| Vite + React | Framework utama frontend |
| React Router | Client-side routing & protected routes |
| TypeScript | Static typing di seluruh codebase |
| Axios @1.13.6 | HTTP client (gunakan versi ini, bukan latest) |
| Formik / React Hook Form | Form handling |
| Zod / Yup | Validasi schema form |
| Zustand / Context API | Global state management |
| React Query | Async state & data sync dari API (optional) |

### Backend

| Package / Tool | Keterangan |
|---|---|
| Express.js | Framework backend utama |
| Prisma | ORM untuk database |
| TypeScript | Static typing di seluruh codebase |
| JWT (jsonwebtoken) | Autentikasi berbasis token |
| bcryptjs | Hashing password |
| cookie-parser | Parsing cookie untuk JWT |
| Multer | Upload file (payment proof, foto profil) |
| Cloudinary | Cloud storage untuk file & gambar |
| Nodemailer + Mailtrap | Email notification (Mailtrap untuk sandbox) |
| voucher-code-generator | Generate kode voucher promo |
| dotenv | Environment variables |
| Zod / Yup | Validasi request body |

### Database

| Package / Tool | Keterangan |
|---|---|
| Neon Postgres 17 | Database utama (cloud-hosted PostgreSQL) |
| Prisma | ORM & schema migration |

---

## Fitur Utama

### Fitur 1

#### 1. Penemuan, Detail, Pembuatan, dan Promosi Event (4 poin)
- **Halaman Utama:** Menampilkan daftar event yang akan datang.
- **Penelusuran Event:** Customer dapat menelusuri event, memfilter berdasarkan kategori/lokasi, dan melihat detail event.
- **Search Bar:** Menerapkan search bar dengan fitur debounce.
- **Responsivitas** adalah keharusan.
- **Pembuatan Event:** Event organizer dapat membuat event dengan detail seperti nama, harga, tanggal mulai, tanggal selesai, kursi tersedia, deskripsi, jenis tiket (jika ada), dll.
- **Harga:** Event bisa gratis atau berbayar. Jika berbayar, customer dikenakan biaya sesuai harga.
- **Promosi:** Event organizer dapat membuat promosi voucher dengan waktu terbatas khusus untuk event mereka, dengan tanggal mulai dan selesai yang ditentukan.

#### 2. Transaksi Event (4 poin)
- **Pembelian:** Customer dapat membuat transaksi untuk membeli tiket event.
- **Status Transaksi:** Terdapat enam status — menunggu pembayaran, menunggu konfirmasi admin, selesai, ditolak, kedaluwarsa, dan dibatalkan.
- **Bukti Pembayaran:** Setelah memilih tiket dan checkout, ditampilkan hitung mundur 2 jam untuk mengunggah bukti pembayaran.
- **Perubahan Status Otomatis:** Transaksi kedaluwarsa jika bukti pembayaran tidak diunggah dalam 2 jam. Jika organizer tidak menerima/menolak dalam 3 hari, transaksi otomatis dibatalkan.
- **Rollback dan Pemulihan Kursi:** Poin, voucher, atau kupon yang digunakan dalam transaksi dikembalikan jika transaksi dibatalkan atau kedaluwarsa. Selain itu, kursi yang tersedia dipulihkan.
- **Penggunaan Poin:** Customer dapat menggunakan poin untuk mengurangi jumlah pembayaran. (contoh: harga tiket event IDR 300.000 sedangkan saldo poin kamu 20.000, kamu bisa menggunakannya dan mendapatkan IDR 280.000 sebagai harga akhir)
- Hanya menggunakan IDR untuk setiap harga item.

#### 3. Ulasan dan Rating Event (2 poin)
- **Ulasan:** Customer hanya dapat memberikan ulasan dan rating setelah menghadiri event.
- **Profil Organizer:** Menampilkan rating dan ulasan di profil event organizer.

---

### Fitur 2

#### 1. Autentikasi dan Otorisasi Pengguna (2 poin)
- **Pembuatan Akun:** Customer harus membuat akun untuk menghadiri event.
- **Peran:** Terdapat dua peran — customer dan event organizer.
- **Registrasi Referral:** Customer dapat mendaftar menggunakan nomor referral.
- **Pembuatan Referral:** Nomor referral dibuat untuk pengguna baru dan tidak dapat diubah.
- **Akses Berbasis Peran:** Lindungi halaman berdasarkan peran pengguna.

#### 2. Sistem Referral, Profil, dan Hadiah (4 poin)
- **Hadiah Referral:** Pengguna yang mendaftar dengan referral mendapatkan kupon diskon, dan pemberi referral mendapatkan 10.000 poin.
- **Kedaluwarsa Poin:** Poin kedaluwarsa 3 bulan setelah dikreditkan. (contoh: hari ini 28 Des 2023 dan ada 3 orang menggunakan nomor referral kamu, saldo kamu 30.000 dan tersedia hingga 28 Maret 2024)
- **Kedaluwarsa Kupon:** Kupon diskon setelah mendaftar dengan referral berlaku selama 3 bulan.
- **Profil:** Customer dan event organizer dapat mengedit profil mereka, termasuk memperbarui foto profil, mengganti kata sandi, dan mereset kata sandi jika lupa.

#### 3. Dashboard Manajemen Event (4 poin)
- **Akses Dashboard:** Organizer dapat melihat dan mengelola event mereka (contoh: edit event, dll.), transaksi, dan statistik dasar.
- **Visualisasi Statistik:** Menampilkan data event dalam visualisasi grafis dan laporan per tahun, bulan, dan hari.
- **Manajemen Transaksi:** Organizer dapat menerima, menolak, dan melihat bukti pembayaran pengguna.
- **Email Notifikasi:** Customer menerima notifikasi email ketika transaksi mereka diterima atau ditolak. Pastikan poin/voucher/kupon dikembalikan jika digunakan dalam transaksi yang ditolak. Selain itu, kursi yang tersedia dipulihkan.
- **Daftar Peserta:** Menampilkan daftar peserta untuk setiap event, termasuk nama, jumlah tiket, dan total harga yang dibayar.

---

## Git Branching Strategy

### Struktur Branch

| Branch | Fungsi |
|---|---|
| main | Branch production — hanya disentuh saat project final selesai |
| dev | Branch staging — tempat mengumpulkan semua fitur yang sudah selesai, diisi via Pull Request |
| feat/nama-fitur | Branch harian — tempat ngoding sehari-hari per fitur |

### Alur Kerja

1. Salah satu anggota membuat repo di GitHub dan invite anggota lainnya
2. Buat branch `dev` dari `main`
3. Masing-masing checkout dari `dev` ke branch `feat/nama-fitur`
4. Ngoding di branch `feat` masing-masing, commit & push ke sana
5. Kalau satu fitur sudah selesai, buat Pull Request dari `feat/` ke `dev`
6. Anggota lain review dulu sebelum di-merge
7. Setelah semua fitur terkumpul di `dev` dan project final, merge `dev` ke `main`

### Cara Membuat Pull Request (PR)

1. Push branch feat ke GitHub: `git push origin feat/nama-fitur`
2. Buka GitHub → repo → klik tab **Pull Requests** → klik **New Pull Request**
3. Set **Base:** `dev` ← **Compare:** `feat/nama-fitur` → klik **Create Pull Request**
4. Isi deskripsi PR: apa yang dikerjakan dan cara testnya
5. Anggota lain review perubahan kode (baris hijau = ditambah, merah = dihapus)
6. Kalau sudah oke → klik **Merge Pull Request** ke `dev`

### Kapan Harus Buat PR

- Selesai satu fitur → buat PR
- Fix bug → buat PR
- Belum selesai tapi mau backup → push ke branch feat saja, belum perlu PR

### Contoh Nama Branch

```
feat/auth
feat/event-crud
feat/transaction
feat/dashboard
feat/referral
fix/nama-bug  ← untuk perbaikan bug
```

---

## Catatan Penting

- Gunakan Axios versi `@1.13.6` — jangan pakai versi latest untuk menghindari supply chain attack
- Mailtrap digunakan sebagai email sandbox untuk testing notifikasi, bukan kirim email asli
- Semua harga menggunakan mata uang IDR
- Sepakati database schema & API contract sebelum mulai ngoding agar tidak terjadi konflik antar bagian
- Protected route harus diimplementasikan
- Responsivitas adalah keharusan
- Terapkan debounce pada search bar
- Terapkan popup dialog sebagai konfirmasi saat mengubah data
- Buat unit test pada setiap alur
- Tangani kondisi ketika tidak ada item yang tampil pada filter atau pencarian
- Terapkan SQL transaction pada aksi yang melibatkan lebih dari satu operasi
- Sediakan data yang relevan dengan project

---

## Clues

- **Voucher Diskon:** Diskon ini disediakan oleh event organizer dan hanya dapat digunakan untuk event tertentu yang diselenggarakan oleh mereka.
- **Hadiah / Kupon Diskon:** Diskon ini disediakan oleh sistem aplikasi dan dapat digunakan untuk semua event.
