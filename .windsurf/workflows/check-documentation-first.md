---
description: Workflow untuk selalu merujuk ke EventManagement.md sebelum melakukan action
---

# Project Rules

## Dokumen Referensi Utama
Sebelum menjawab pertanyaan apapun tentang fitur, requirement, scope, atau implementasi — SELALU baca dan rujuk ke file `docs/EventManagement.md` terlebih dahulu. Jangan berasumsi dari ingatan sendiri.

## Konteks Project
- Nama project: Event Management Platform (IRAMA)
- Mini project bootcamp Purwadhika
- Tim 2 orang:
  - Saya → Fitur 1 (Event, Transaksi, Review)
  - Naufal → Fitur 2 (Auth, Referral, Dashboard)

## Tech Stack
- Frontend: Vite + React + TypeScript
- Backend: Express.js + TypeScript + Prisma
- Database: Neon Postgres 17
- ORM: Prisma

## Git Branch Strategy 
- `main` → production, jangan disentuh
- `dev` → staging, diisi via Pull Request
- `feat/event` → Fitur 1 Bagian 1: Event Discovery, Creation & Promotion (Landing Page, Browse Page, Event Detail Page, Create Event Page) + Backend Event API
- `feat/transaction` → Fitur 1 Bagian 2: Transaksi Event (Checkout Page, Payment Proof Page) + Backend Transaction API
- `feat/review` → Fitur 1 Bagian 3: Ulasan & Rating (Review Page) + Backend Review API
- Semua feature saya ada di tulisan ini dan untuk yang di EventManagement.md baris 140-149 adalah contoh saja bukan branch yang asli saya buat.

## Pengingat Penting
- Kalau feat/event sudah selesai → ingatkan Saya untuk commit & push ke `feat/event` lalu buat PR ke `dev`
- Kalau mulai feat/transaction → ingatkan Saya untuk checkout ke branch baru: `git checkout -b feat/transaction`
- Kalau mulai feat/review → ingatkan Saya untuk checkout ke branch baru: `git checkout -b feat/review`
- Dan balik lagi seperti awal, intinya kamu mengingatkan saya untuk pengerjaan yang sudah selesai saya kerjakan

## Git
- Repo: event-management-platform
- Jangan push ke dev atau main langsung

## Aturan Penting
- Saya hanya mengerjakan Fitur 1 — jangan tambahkan fitur dari Fitur 2 (Jika tidak memiliki korelasi)
- Setiap perubahan harus sesuai dokumen EventManagement.md
- Jangan tambahkan field database atau endpoint baru yang tidak ada di dokumen
- Semua harga menggunakan IDR

---

# Workflow: Cek Dokumentasi EventManagement.md Sebelum Action

**Tujuan:** Menghindari asumsi pribadi dan memastikan semua fitur sesuai dengan dokumentasi resmi.

## Langkah-langkah Wajib

### 1. Sebelum Membuat/Mengubah Fitur

1. **Baca EventManagement.md** untuk fitur yang diminta
2. **Jika ada di dokumentasi:**
   - Ikuti persis apa yang tertulis
   - Jangan tambahkan fitur ekstra
   - Jangan mengubah requirement yang sudah ada

3. **Jika TIDAK ada di dokumentasi:**
   - Tanyakan ke user: "Fitur X tidak ada di EventManagement.md, apakah tetap dipertahakan/ditambahkan?"
   - Jangan asumsi sendiri untuk menghapus atau menambah
   - Jangan buat keputusan berdasarkan "mungkin butuh backend"

4. **Jika user minta fitur yang butuh backend/database:**
   - Konfirmasi dulu: "Fitur ini butuh backend/database, apakah tetap dilanjutkan?"
   - Jangan langsung hapus karena asumsi "butuh backend"

### 2. Sebelum Menjawab Pertanyaan

1. **Cek EventManagement.md** terkait pertanyaan
2. **Beri jawaban berdasarkan dokumentasi**, bukan asumsi pribadi
3. **Jika tidak ada di dokumentasi:**
   - Katakan jelas: "Fitur X tidak disebutkan di EventManagement.md"
   - Tanya user: "Apakah tetap dipertahakan?"

## Contoh Kasus

### ❌ Kesalahan yang Dihindari

- "Saya hapus barcode karena butuh backend" → **SALAH**, harus tanya dulu
- "Saya tambahkan tab Syarat & Ketentuan karena bagus" → **SALAH**, tidak ada di dokumentasi
- "Saya hapus ticket number karena asumsi" → **SALAH**, harus konfirmasi dulu

### ✅ Cara yang Benar

- "Barcode tidak disebutkan di EventManagement.md. Apakah tetap dipertahakan atau dihapus?"
- "Tab Syarat & Ketentuan tidak ada di dokumentasi. Apakah perlu ditambahkan?"
- "Ticket number tidak ada di dokumentasi. Apakah tetap ditampilkan?"

## Referensi

- Dokumentasi: `docs/EventManagement.md`
- Fitur 1 Bagian 1: Penemuan, Detail, Pembuatan, dan Promosi Event
- Fitur 1 Bagian 2: Transaksi Event
- Fitur 1 Bagian 3: Ulasan dan Rating Event
