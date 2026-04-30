# IRAMA - Event Management Platform

IRAMA adalah platform manajemen event musik berbasis web yang menghubungkan penikmat musik dengan event organizer untuk membeli dan menjual tiket konser secara aman, mudah, dan transparan.

## Fitur Utama

### Untuk Pengguna (Penikmat Musik)
- **Pencarian Event**: Temukan konser dan festival musik dari berbagai organizer
- **Pembelian Tiket**: Beli tiket event dengan pembayaran yang aman
- **Upload Bukti Pembayaran**: Upload bukti transfer untuk verifikasi
- **Tiket Saya**: Lihat semua tiket yang telah dibeli
- **Ulasan & Rating**: Berikan ulasan untuk event yang telah dihadiri
- **Sistem Referral**: Kumpulkan poin dan kupon melalui kode referral

### Untuk Organizer
- **Buat Event**: Buat dan kelola event konser atau festival musik
- **Kelola Tiket**: Atur harga, kuota, dan ketersediaan tiket
- **Verifikasi Pembayaran**: Terima atau tolak bukti pembayaran dari pembeli
- **Dashboard Analytics**: Lihat statistik pendapatan, tiket terjual, dan performa event
- **Kelola Voucher**: Buat voucher untuk promosi event

## Tech Stack

### Backend
- **Node.js** dengan Express.js
- **TypeScript**
- **Prisma ORM** dengan PostgreSQL
- **JWT** untuk autentikasi
- **Cloudinary** untuk penyimpanan gambar
- **Mailtrap** untuk email testing
- **Cron Jobs** untuk auto-expire transaksi

### Frontend
- **React** dengan TypeScript
- **TailwindCSS** untuk styling
- **React Router** untuk navigasi
- **Axios** untuk API calls
- **Lucide React** untuk icons

## Prerequisites

- Node.js (v18 atau lebih tinggi)
- PostgreSQL database
- Git

## Instalasi

1. **Clone repository**
```bash
git clone https://github.com/username/event-management-platform.git
cd event-management-platform
```

2. **Install dependencies**

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

3. **Setup Environment Variables**

Copy file `.env.example` di folder backend:
```bash
cd backend
cp .env.example .env
```

Edit `.env` dan isi dengan nilai yang sesuai:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your_jwt_secret_here
PORT=3000

# Cloudinary (opsional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Mailtrap (opsional)
MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASS=your_mailtrap_pass
```

4. **Setup Database**

Jalankan migration Prisma:
```bash
cd backend
npx prisma migrate dev
```

Generate Prisma client:
```bash
npx prisma generate
```

5. **Jalankan Aplikasi**

Backend (di folder backend):
```bash
npm run dev
```
Backend akan berjalan di `http://localhost:3000`

Frontend (di folder frontend):
```bash
npm run dev
```
Frontend akan berjalan di `http://localhost:5173`

## Struktur Project

```
event-management-platform/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── controllers/           # Business logic
│   │   ├── middleware/            # Auth middleware
│   │   ├── routes/                # API routes
│   │   ├── config/                # Configuration files
│   │   ├── cron/                  # Scheduled tasks
│   │   └── index.ts               # Entry point
│   ├── .env.example               # Environment variables template
│   └── tsconfig.json              # TypeScript config
├── frontend/
│   ├── src/
│   │   ├── pages/                 # Page components
│   │   ├── components/            # Reusable components
│   │   └── index.css              # Global styles
│   └── package.json
└── README.md
```

## Status Transaksi

Platform ini memiliki 6 status transaksi:

1. **Menunggu Pembayaran** - User baru saja membuat transaksi
2. **Menunggu Konfirmasi** - Bukti pembayaran telah diupload, menunggu verifikasi organizer
3. **Selesai** - Transaksi berhasil dan tiket diterbitkan
4. **Ditolak** - Bukti pembayaran ditolak oleh organizer
5. **Kedaluwarsa** - Transaksi melewati batas waktu upload bukti pembayaran
6. **Dibatalkan** - Transaksi dibatalkan oleh user atau sistem

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verifikasi email
- `POST /api/auth/forgot-password` - Request reset password
- `POST /api/auth/reset-password` - Reset password

### Events
- `GET /api/events` - Get semua event
- `GET /api/events/:id` - Get detail event
- `POST /api/events` - Buat event baru (organizer only)
- `PUT /api/events/:id` - Update event (organizer only)
- `DELETE /api/events/:id` - Hapus event (organizer only)
- `GET /api/events/organizer` - Get event organizer

### Transactions
- `POST /api/transactions` - Buat transaksi baru
- `POST /api/transactions/:id/upload-proof` - Upload bukti pembayaran
- `POST /api/transactions/:id/accept` - Terima pembayaran (organizer only)
- `POST /api/transactions/:id/reject` - Tolak pembayaran (organizer only)
- `POST /api/transactions/:id/cancel` - Batalkan transaksi
- `GET /api/transactions/organizer/all` - Get semua transaksi organizer
- `GET /api/transactions/my` - Get transaksi user

### Reviews
- `POST /api/reviews` - Buat ulasan baru
- `GET /api/reviews/event/:eventId` - Get ulasan event

## Kontribusi

Project ini adalah mini-project untuk keperluan pembelajaran. Untuk kontribusi silakan fork repository dan buat pull request.

## Lisensi

MIT License