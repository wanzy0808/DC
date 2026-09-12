# 📄 Product Requirement Document (PRD) — Momentus Dashboard & Access Tier Architecture

## 1. Executive Summary
**Nama Produk:** Momentus Dashboard & Guestbook Management  
**Tipe Produk:** SaaS Portal Management untuk Pengantin (B2C) & Wedding Organizer (B2B)  
**Target Pengguna:** Calon Pasangan Pengantin & Usher/WO Event Crew  

**Tujuan Utama:**  
Menyediakan *dashboard* terpusat yang intuitif untuk mengelola pembuatan undangan digital, manajemen RSVP, alokasi meja/kursi tamu, hingga aplikasi *Usher Check-in* berbasis QR Code. Sistem dilengkapi dengan Onboarding Modal serta *Feature Gating/Access Control* yang ketat sesuai dengan paket langganan yang dibeli pengguna.

---

## 2. Onboarding & Personalization Flow

### First-Time Login Modal
Setiap kali pengguna baru berhasil masuk melalui Supabase Auth (Google OAuth/Email), sistem memeriksa ketersediaan metadata profil pengguna.
* **Kondisi Trigger:** Jika metadata nama panggilan belum terisi (`is_onboarded = false`).
* **Input Form Required:**
  1. Nama Pasangan Pria (Groom Name)
  2. Nama Pasangan Wanita (Bride Name)
  3. Nama Panggilan Pengisi Dashboard (Dashboard User Nickname)
* **Behavior:**
  * Pengguna **wajib** mengisi form ini sebelum dapat melihat atau berinteraksi dengan seluruh isi beranda *dashboard*.
  * Data disimpan ke tabel `User` / metadata Supabase Auth.
  * Menampilkan ucapan sapaan personal di *Navbar* dan *Beranda*: `"Selamat Datang, [Nama Panggilan]!"`

---

## 3. Subscription Packages & Access Control Matrix (Feature Gating)

Sistem menggunakan kontrol akses dinamis berbasis enum `PackageType`: `UNPAID`, `DIGITAL_INVITATION`, `GUESTBOOK_ONLY`, dan `BUNDLE`.

| Fitur / Menu | Unpaid (Belum Bayar) | Paket Undangan Digital | Paket Guestbook Only | Paket Bundle (Digital + Guestbook) |
| :--- | :---: | :---: | :---: | :---: |
| **Pilih & Edit Template** | ✅ Boleh | ✅ Boleh | ✅ Boleh | ✅ Boleh |
| **Publikasi Undangan** | ❌ Terkunci | ✅ Terbuka | ❌ Terkunci | ✅ Terbuka |
| **Asset Audio / Lagu** | Preset Bawaan Only | ✅ Custom Upload | Preset Bawaan Only | ✅ Custom Upload |
| **Asset Foto & Video** | ❌ Terkunci | ✅ Custom Upload | ❌ Terkunci | ✅ Custom Upload |
| **RSVP Public Page** | ✅ Terbuka | ✅ Terbuka | ✅ Terbuka | ✅ Terbuka |
| **Manajemen Tamu & Meja** | 🔒 Upgrade Overlay | 🔒 Upgrade Overlay | ✅ Terbuka | ✅ Terbuka |
| **Usher App (QR Scan)** | 🔒 Upgrade Overlay | 🔒 Upgrade Overlay | ✅ Terbuka | ✅ Terbuka |

### Detail Perilaku Akses:
1. **Unpaid (Belum Bayar):**
   * Pengguna bebas bereksperimen dengan Studio Editor.
   * Tombol "Publikasikan" tidak dapat diklik (memicu modal *Checkout/Upgrade*).
   * File upload foto/video & upload musik kustom dinonaktifkan.
   * Menu *Manajemen Tamu* di bilah kiri menampilkan *banner/overlay* "Upgrade ke Paket Guestbook".
2. **Paket Undangan Digital:**
   * Seluruh fitur desain Studio, upload aset foto/video/musik, dan fitur publikasi domain terbuka penuh.
   * Rekap RSVP & Tiket Digital QR Code aktif untuk tamu.
   * Fitur Manajemen Tamu (Nomor Meja/Bangku) dan *Usher App Check-in* terkunci dengan *Overlay Upgrade*.
3. **Paket Guestbook Only:**
   * Fitur Manajemen Tamu, Nomor Meja, Bangku, dan *Usher App* terbuka penuh.
   * Fitur Undangan Digital kembali ke status *Unpaid* (desain tidak bisa dipublikasi, aset foto/musik kustom terkunci).
4. **Paket Bundle (Digital + Guestbook):**
   * Seluruh menu dan fitur terbuka 100% tanpa batasan.

---

## 4. UI/UX & Design System Guidelines

Semua desain *interface dashboard* wajib menginduk pada aturan **DC Wedding Design System**:

* **Typography:** Font **Cinzel** (Headings & Accent) dan **Fauna One** (Body & Subtitles).
* **Header Architecture:** Seluruh logo lokal di bagian atas *content area* dihapus dan dipasrahkan sepenuhnya ke **Dashboard Global Navbar**.
* **Color Palette & Theme Tokens:**
  * **Light Mode:** Background Maroon & Cream, Aksesibilitas Teks Hitam (`#000000`).
  * **Dark Mode:** Background Pink Muted & Deep Black, Teks Putih (`#FFFFFF`).
* **Component Library:** Built-in **Shadcn UI** (Dialog, Sheet, Table, Switch, Dropdown, Button) & **Lucide React Icons**.

---

## 5. Dashboard Layout & Navigation Structure

### A. Global Navbar & Burger Menu
Navbar bagian atas secara bersih memuat identitas pengguna dan Burger Menu yang berisi:
1. **Ucapan Sapaan:** `"Halo, [Nama Panggilan pengisi dashboard]"`
2. **Transaksi:** Riwayat pembayaran & status paket aktif.
3. **Tambah Paket:** Katalog pembelian/upgrade paket.
4. **FAQ:** Jawaban pertanyaan umum seputar platform.
5. **Bantuan:** Kontak layanan pelanggan / support WhatsApp.
6. **Keluar (Logout):** Pemicu `supabase.auth.signOut()`.

---

### B. Left Sidebar Menu

#### 1. Beranda
* **Ucapan Sapaan:** Card hero menyapa nama panggilan pengisi *dashboard*.
* **Metric Stat Cards:**
  * Total Undangan Telah Dibagikan (Count).
  * Total RSVP (Hadir / Tidak Hadir / Ragu-ragu).
  * Total Undangan Dibuat (Maksimal Kuota: 2 Undangan).

#### 2. Rangkaian Acara
* **Auto-Sync:** Data acara yang diisi di sini akan otomatis terisi (*auto-populate*) ke dalam blok template undangan digital di Studio Editor.
* **Input Fields:**
  * Nama Acara (misal: Akad Nikah, Resepsi Pagi, After Party).
  * Tanggal Acara, Zona Waktu (WIB, WITA, WIT), Waktu Mulai, Waktu Selesai.
  * Deskripsi Acara (Rich Text / Forum Draft Format).
  * Alamat Lokasi (Rich Text / Forum Draft Format).
  * URL Google Maps (Akan merender tombol *"See Location / Petunjuk Jalan"* pada undangan publik).

#### 3. Undangan Digital
* **Keamanan Undangan:** Toggle Password Protection (Buat & Ubah password khusus pembaca undangan).
* **Aksi Cepat:**
  * Tombol Salin Kode Link Undangan (`momentus.id/[slug]`).
  * Tombol Edit Desain Undangan (Direct link ke Studio Editor).
* **Alur Success State (Thank You / Digital Ticket Page):**
  * Setelah tamu mengklik *"Submit RSVP"* pada halaman publik, UI berubah ke *Success State* (tanpa *redirect* WA berbayar).
  * Merender Kartu Ucapan Terima Kasih yang estetis beserta **QR Code unik tamu**.
  * Menyediakan tombol aksi: **"Simpan Gambar / Download Tiket"** & **"Add to Google Calendar"**.

#### 4. RSVP
* Menampilkan *Data Table* responsif berisi riwayat konfirmasi tamu:
  * Nama Tamu, Nomor Telepon/WA, Jumlah Tamu Dibalas (*Number of Guests*), Status Kehadiran (*Confirm Attendance*), dan Pesan Ucapan.

#### 5. Manajemen Tamu (Gabung Paket Digital Guestbook)
* **Tampilan Tabel Rapi (Shadcn Table) untuk Penginputan Cepat:**
  * **Kolom:** Nama Tamu, Kategori (VIP/Reguler), Nomor Meja (*Table Number*), Nomor Bangku (*Seat Number*), Kode QR Unik, Status Check-in.
  * **Aturan Input:** Diperjelas dengan *Header Form Modal* yang tegas dan konsisten dengan sistem warna theme (Light/Dark Mode).

---

## 6. Updated Database Schema Blueprint (Prisma ORM)

```prisma
enum Role {
  COUPLE
  WO_ADMIN
}

enum PackageType {
  UNPAID
  DIGITAL_INVITATION
  GUESTBOOK_ONLY
  BUNDLE
}

model User {
  id              String       @id @default(uuid())
  email           String       @unique
  nickname        String?      // Nama panggilan pengisi dashboard
  groomName       String?      // Nama pengantin pria
  brideName       String?      // Nama pengantin wanita
  isOnboarded     Boolean      @default(false)
  role            Role         @default(COUPLE)
  packageType     PackageType  @default(UNPAID)
  invitations     Invitation[]
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

model Invitation {
  id              String       @id @default(uuid())
  userId          String
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  slug            String       @unique
  templateId      String
  password        String?      // Password proteksi undangan
  musicUrl        String?
  events          Event[]
  guests          Guest[]
  rsvps           Rsvp[]
  createdAt       DateTime     @default(now())
}

model Event {
  id              String       @id @default(uuid())
  invitationId    String
  invitation      Invitation   @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  eventName       String       // e.g., "Akad Nikah"
  eventDate       DateTime
  timezone        String       @default("WIB")
  startTime       String
  endTime         String
  description     String?      @db.Text
  address         String?      @db.Text
  googleMapsUrl   String?
}

model Guest {
  id              String       @id @default(uuid())
  invitationId    String
  invitation      Invitation   @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  name            String
  category        String?      @default("General")
  tableNumber     String?
  seatNumber      String?
  qrCode          String       @unique @default(uuid())
  isCheckedIn     Boolean      @default(false)
  checkedInAt     DateTime?
}

model Rsvp {
  id              String       @id @default(uuid())
  invitationId    String
  invitation      Invitation   @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  name            String
  phone           String?
  attendance      Boolean
  guestCount      Int          @default(1)
  message         String?      @db.Text
  createdAt       DateTime     @default(now())
}