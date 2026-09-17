Master Product Requirements Document (PRD) — DC OrganizerDocument Status: Master Source of Truth (Fully Consolidated & Synchronized)  Brand: DC Organizer (sebelumnya DC Wedding)  Repository: wanzy0808/DC  Last Consolidated: September 2026  1. Vision & Operational LifecycleDC Organizer adalah platform SaaS pernikahan end-to-end yang berpusat pada Undangan Pernikahan Digital (Digital Wedding Invitation) dan alur kerja manajemen tamu secara real-time. Platform ini memfasilitasi operasional pernikahan secara menyeluruh, mulai dari tahap awal pembuatan hingga hari pelaksanaan di lokasi (onsite).  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Wedding Setup  │ ──►│ Invitation Creation │ ─►│   Publication   │ ──►│  Distribution   │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                                                                              │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             ▼
│ Onsite Check-in │ ◄──│    QR Ticket    │ ◄──│ Seating & Guest │ ◄──│ RSVP & Gift Track│
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
2. Technical Stack, Architecture & System Principles2.1 Core Technical StackFramework: Next.js App Router / Turbopack  Runtime & Package Manager: Node.js >= 22 LTS | pnpm >= 11  Language: TypeScript  UI & Styling: Tailwind CSS v4 + Shadcn UI + tw-animate-css  Animation Engine: Motion via motion/react  Database & ORM: PostgreSQL + Prisma  Media & Canvas: Sharp (image processing) | Konva / react-konva (interactive seating 2D)  Deployment & CI/CD: Hostinger VPS + GitHub Actions  2.2 Core Key Dependencies@radix-ui/react-slot & class-variance-authority (CVA)  lucide-react (System Iconography)  2.3 System Architecture PrinciplesExtend Over Replace: Pertahankan route, API, UI, dan data flow yang sudah berjalan. Halaman /dashboard dan Beranda (/) wajib dipertahankan.  Brand Realignment: Semua antarmuka publik dan internal wajib menggunakan label DC Organizer (menggantikan nama lama DC Wedding).  Single Source of Truth: Database PostgreSQL adalah single source of truth. Undangan baru harus dimulai dari kondisi kosong (clean slate, tanpa data sampel/palsu).  Server-Authoritative: Otorisasi, limitasi, serta validasi kuota/kapasitas dikontrol sepenuhnya di server-side. UI gate mencerminkan entitlement server secara akurat.  Single Source Theme System: app/globals.css adalah single source of truth untuk seluruh styling dan token tema aplikasi. Seluruh impor CSS tambahan (seperti dashboard-theme.css, brand-theme.css, design-overrides.css) telah dihapus dan dikonsolidasikan. ## Additional Product Requirements

Fitur berikut merupakan pengembangan lanjutan untuk meningkatkan pengelolaan tamu, operasional acara di lokasi, monetisasi platform, serta keamanan dan skalabilitas sistem.

---

### 1. Guest Ecosystem & Invitation Distribution

#### 1.1 Guest Category & Tags

**Objective**

Memungkinkan pengguna mengelompokkan tamu agar pengelolaan guest list, distribusi undangan, seating chart, dan operasional onsite lebih terstruktur.

**Requirements**

Model `Guest` harus mendukung:

* `category`
* `tags`
* multiple tags per guest
* filtering berdasarkan category/tag

Contoh kategori:

* VVIP
* VIP
* Family Groom
* Family Bride
* Friends
* Office
* Vendor
* Other

Pengguna harus dapat:

* membuat custom category/tag;
* mengedit category/tag tamu;
* melakukan bulk assign category/tag;
* melakukan filter Guest List berdasarkan category/tag;
* menggunakan filter pada Seating Chart;
* menggunakan filter saat melakukan distribusi undangan atau WA Blast.

**Acceptance Criteria**

* Guest dapat memiliki minimal satu category dan beberapa tags.
* Filter Guest List bekerja berdasarkan category dan tags.
* Bulk update dapat dilakukan terhadap beberapa guest.
* Category/tag dapat digunakan pada modul Seating Chart dan Invitation Distribution.

**Priority:** P1

---

#### 1.2 Digital Gift / Cashless Angpao

**Objective**

Memberikan opsi kepada pasangan untuk menerima hadiah digital langsung melalui halaman undangan.

**Requirements**

Public Invitation dapat memiliki modul `Digital Gift`.

Metode yang dapat didukung:

* Bank Transfer
* QRIS
* Payment Gateway

Potential provider:

* Midtrans
* Xendit

Pemilik invitation dapat memilih apakah fitur ini aktif atau tidak.

Informasi yang dapat ditampilkan:

* nama bank;
* nomor rekening;
* nama pemilik rekening;
* QRIS;
* tombol copy nomor rekening;
* payment status apabila menggunakan payment gateway.

Untuk integrasi payment gateway, sistem harus menyimpan transaksi digital gift secara terpisah dari billing platform.

Suggested model:

`DigitalGiftTransaction`

Fields:

* `id`
* `invitationId`
* `guestId` nullable
* `provider`
* `paymentMethod`
* `amount`
* `status`
* `externalTransactionId`
* `createdAt`
* `paidAt`

**Acceptance Criteria**

* Owner dapat enable/disable Digital Gift.
* Guest dapat menggunakan QRIS atau metode pembayaran yang tersedia.
* Payment callback/webhook dapat memperbarui status transaksi.
* Informasi pembayaran tidak terekspos melalui API yang tidak terautentikasi.

**Priority:** P2

---

#### 1.3 Live Guestbook Wall

**Objective**

Menampilkan ucapan dan doa dari tamu secara real-time pada monitor atau projector di venue.

**Requirements**

Buat mode khusus:

`/event/[slug]/guestbook-wall`

Wall menampilkan:

* nama tamu;
* ucapan;
* waktu pengiriman;
* optional avatar/photo;
* animation/transitions.

Data bersumber dari Guestbook/Public RSVP.

Update dilakukan secara real-time menggunakan:

* WebSocket;
* Server Sent Events;
* atau realtime provider.

Admin harus dapat melakukan moderation:

* approve;
* hide;
* delete.

Optional setting:

`autoApproveGuestbook`

**Acceptance Criteria**

* Guestbook baru dapat muncul tanpa reload halaman.
* Admin dapat menyembunyikan ucapan yang tidak sesuai.
* Wall memiliki fullscreen/display mode.
* Tampilan tetap berjalan stabil untuk penggunaan beberapa jam selama acara.

**Priority:** P2

---

### 2. Onsite Operations & Usher App

#### 2.1 Offline-First Usher App

**Objective**

Memastikan proses check-in tetap berjalan ketika koneksi internet venue lambat atau terputus.

**Requirements**

Usher App harus memiliki local offline storage menggunakan:

* IndexedDB preferred;
* LocalStorage hanya untuk data non-critical.

Data minimal yang disimpan secara lokal:

* guest ID;
* guest name;
* QR identifier;
* table assignment;
* check-in status.

Apabila perangkat offline:

1. QR tetap dapat dipindai.
2. Guest dapat dicari melalui local cache.
3. Check-in disimpan sebagai pending transaction.
4. UI menunjukkan status `Offline`.
5. Data otomatis disinkronkan ketika koneksi kembali tersedia.

Perlu tersedia mekanisme conflict resolution untuk mencegah double check-in dari dua perangkat.

Suggested local queue:

`PendingCheckIn`

Fields:

* `guestId`
* `deviceId`
* `checkedInAt`
* `syncStatus`
* `retryCount`

**Acceptance Criteria**

* Check-in tetap berfungsi tanpa internet setelah data event tersinkronisasi.
* Pending check-in otomatis dikirim ketika perangkat online.
* Sistem dapat mendeteksi guest yang telah check-in dari perangkat lain.
* Tidak ada data check-in yang hilang ketika browser direfresh.

**Priority:** P1 / Critical Onsite

---

#### 2.2 Name Label / Wristband Printing

**Objective**

Memungkinkan usher mencetak identitas tamu atau nomor meja langsung setelah check-in.

**Requirements**

Setelah guest berhasil check-in, Usher App dapat menampilkan action:

`Print Label`

Informasi label dapat mencakup:

* Guest Name
* Category
* Table Number
* QR/Guest ID

Target device:

* Bluetooth thermal printer;
* browser-compatible thermal printer.

Admin dapat menentukan template label.

**Acceptance Criteria**

* Usher dapat mencetak label dari halaman check-in.
* Label menampilkan informasi guest yang benar.
* Print action tidak menghambat proses check-in berikutnya.
* Sistem tetap memungkinkan check-in apabila printer tidak tersedia.

**Priority:** P3

---

### 3. Business Scalability & Monetization

#### 3.1 WhatsApp Gateway Integration

**Objective**

Mengubah modul WA Blast dari internal queue menjadi layanan pengiriman WhatsApp yang dapat digunakan secara nyata.

**Potential Providers**

Primary options:

* Fonnte
* Wablas

Alternative:

* Twilio / WhatsApp Business API

Provider integration harus menggunakan abstraction layer agar provider dapat diganti tanpa mengubah business logic utama.

Example interface:

`WhatsAppProvider`

Functions:

* `sendMessage()`
* `sendTemplate()`
* `checkStatus()`
* `getBalance()`

Existing `waBlastQuota` digunakan untuk membatasi penggunaan berdasarkan package atau saldo pengguna.

Flow:

User → Select Guests → Create Blast → Validate Quota → Queue → WhatsApp Provider → Delivery Status

Status:

* queued
* processing
* sent
* delivered
* read
* failed

**Acceptance Criteria**

* WA Blast dapat dikirim ke filtered Guest List.
* Penggunaan mengurangi quota.
* Failed message dapat di-retry.
* Delivery status tersimpan.
* API key provider tidak pernah dikirim ke frontend.

**Priority:** P1

---

#### 3.2 WA Blast Top-Up

Pengguna dapat membeli tambahan WA Blast quota di luar subscription package.

Suggested entity:

`WhatsAppCreditTransaction`

Fields:

* `userId`
* `quantity`
* `amount`
* `type`
* `paymentId`
* `status`

Setelah pembayaran berhasil, quota ditambahkan otomatis.

**Priority:** P2

---

#### 3.3 Multi-User / Wedding Organizer Access

**Objective**

Memungkinkan pemilik event memberikan akses kepada Wedding Organizer atau anggota tim tanpa memberikan akses penuh terhadap akun utama.

Suggested entities:

`EventMember`

Fields:

* `eventId`
* `userId`
* `role`
* `permissions`
* `invitedAt`
* `acceptedAt`

Default roles:

**Owner**

Full access.

**Admin**

Hampir seluruh operasional event.

**Wedding Organizer**

Access:

* Guest List
* RSVP
* Seating Chart
* Usher
* Guestbook

No access:

* Billing
* Subscription
* Payment Account
* Digital Gift Configuration

**Usher**

Access:

* Guest Search
* QR Scanner
* Check-in
* Table Information

Permission checking wajib dilakukan pada backend/API dan bukan hanya menyembunyikan menu di frontend.

**Acceptance Criteria**

* Owner dapat invite team member.
* Owner dapat menentukan role.
* API melakukan authorization berdasarkan permission.
* WO tidak dapat melihat atau mengubah billing/payment settings.
* Owner dapat mencabut akses kapan saja.

**Priority:** P1

---

### 4. Security & Data Compliance

#### 4.1 Public RSVP Rate Limiting

**Objective**

Mencegah spam, bot, brute-force, dan penyalahgunaan endpoint Public RSVP.

Endpoint:

`POST /api/invite/[slug]/rsvp`

harus memiliki rate limiting.

Suggested implementation:

* Upstash Redis;
* Redis;
* Vercel KV-compatible rate limiter.

Rate limit dapat menggunakan kombinasi:

* IP address;
* invitation slug;
* guest/token identifier.

Example policy:

* maximum 5 RSVP attempts/minute/IP;
* temporary block ketika threshold dilewati.

Tambahkan proteksi tambahan jika dibutuhkan:

* honeypot;
* Turnstile/CAPTCHA;
* duplicate submission detection.

**Acceptance Criteria**

* Request yang melebihi limit menerima HTTP `429`.
* Rate limit tidak mengganggu penggunaan normal.
* Failed/spam attempt dapat dicatat untuk monitoring.
* Rate limit diterapkan pada server-side endpoint.

**Priority:** P0 / Security

---

#### 4.2 Data Retention Policy

**Objective**

Mengurangi penggunaan storage jangka panjang sekaligus memberikan lifecycle data yang jelas kepada pengguna.

Setiap event memiliki:

`eventDate`

Setelah event selesai, data dapat masuk ke beberapa lifecycle stage.

Example:

**0–12 months after event**

Event tetap aktif dan seluruh asset tersedia.

**After 12 months**

Event dapat masuk status:

`ARCHIVED`

Optional cleanup:

* original uploaded photos;
* unused media;
* temporary assets;
* generated cache files.

Data penting seperti:

* guest list;
* RSVP;
* guestbook;
* transaction record;

tidak boleh langsung dihapus tanpa retention policy yang jelas.

User harus mendapatkan pemberitahuan sebelum permanent deletion.

Suggested fields:

* `archivedAt`
* `scheduledDeletionAt`
* `retentionStatus`

Retention policy harus configurable agar package premium nantinya dapat menawarkan masa penyimpanan lebih panjang.

**Acceptance Criteria**

* Sistem dapat menentukan event yang telah melewati retention period.
* Background cleanup dapat menghapus asset yang memenuhi kriteria.
* User mendapat warning sebelum permanent deletion.
* Billing/transaction records mengikuti retention policy terpisah dan tidak ikut terhapus bersama event asset.

**Priority:** P2

---

## Recommended Implementation Priority

### P0 — Security Foundation

* Public RSVP Rate Limiting

### P1 — Core Operational Features

* Guest Category & Tags
* Offline-First Usher
* WhatsApp Gateway
* Multi-User / Wedding Organizer Access

### P2 — Product Expansion

* Digital Gift / QRIS
* Live Guestbook Wall
* WA Blast Top-Up
* Data Retention Policy

### P3 — Advanced Onsite Hardware

* Bluetooth Name Label / Wristband Printing

Urutan tersebut memungkinkan fitur yang berkaitan langsung dengan operasional event dan keamanan diselesaikan terlebih dahulu sebelum integrasi payment, realtime display, dan hardware peripheral.
 3. Design System, Visual Identity & Surface Refinement3.1 TypographyCinzel: Display headings, nama pasangan, dan elemen branding utama.  Fauna One: Body copy, navigasi, form, tombol, dan teks antarmuka utama.  DM Mono: Label teknis, kode, timestamp, nilai status, dan metadata.  Implementation: Penggunaan typography wajib memanggil next/font/google di app/layout.tsx. Import Google Fonts berbasis CSS link legacy di globals.css dilarang.  3.2 Palette & Theme RulesBrand Primary: Rose #C07A84 | Supporting Light Rose: #D9A3AA | Deep Rose: #A65E69.  Light Theme: Background #FFFFFF. Headings, icons, tombol, link, menu, dan aksen menggunakan Rose #C07A84. Teks utama #111111 (near-black), teks sekunder menggunakan opasitas hitam.  Dark Theme: Background #0B0B0C. Teks utama #FFFFFF, teks sekunder menggunakan opasitas putih, dan --primary-foreground ditetapkan ke #FFFFFF.  Neutral-First 60 / 30 / 10 Composition: Kanvas utama dan teks umum bersifat netral, sedangkan warna Rose #C07A84 dikonsentrasikan secara presisi pada CTA/aksi utama, outline terfokus, status, dan aksen.  Deprecated Palette: #8C4A56, #E8B4B8, #6E3843, #0F0E11, dan #1A181E.  3.3 Canonical Button Language & Action SemanticsCanonical Primitive: components/ui/button.tsx / components/ui/glow-button.tsx adalah satu-satunya primitive button visual untuk seluruh aplikasi.  Single Visual Variant: Seluruh tombol menggunakan visual glow terpusat dengan warna Rose #C07A84 sebagai fill, Deep Rose #A65E69 saat hover, serta treatment border/shadow yang seragam.  Disabled State: Disabled state mempertahankan fill dan warna teks aktif namun menonaktifkan pointer-events, hover movement, dan raised shadow.  Action Verb Semantics: Pemisahan makna tombol dilakukan melalui kata kerja eksplisit, ikon Lucide yang relevan, size hierarchy (xs, sm, default, lg, icon-xs, icon-sm, icon, icon-lg), serta title / aria-label. Warna tidak boleh dipakai sebagai pembeda arti aksi.  3.4 Motion, Layout & Separator PolicyCard Grouping & Surface Radius: Pengelompokan informasi mengandalkan background + border tipis + radius + spacing. Radius panel utama diset ke 12px, sedangkan nested utility surface menggunakan 8–10px.  Dashboard Separator Policy: Menurunkan prioritas garis pembatas horizontal panjang (border-y, border-t, border-b). Section tidak lagi menggunakan divider horizontal sebagai mekanisme pengelompokan utama.  Pintu Navigation: Halaman Landing menggunakan fitur Pintu sebagai permukaan navigasi interaktif 3D untuk 3 workspace: Wedding Planner, Digital Invitation, dan Guestbook.  Protected Background Elements: Efek Rose Petals pada components/Layout/background.tsx adalah elemen visual sakral yang dilindungi (jumlah, animasi, waktu, dan bayangan tidak boleh diubah).  Navbar Canvas Continuity: Header publik bersifat transparan (bg-transparent) dengan kontrol 44px (h-11). Decorative glow dibatasi mulai dari bawah zona navbar (top-24).  Content Width Standardization: Lebar konten publik disatukan pada w-[min(92vw,1400px)]. Area Workspace Dashboard menggunakan Wide Workspace (mengisi pane kanan secara fleksibel tanpa batasan 1400px).  4. Monetization Packages & Order Architecture4.1 Tier Packages & EntitlementsFitur / EntitlementNONE (Free/Draft)DIGITAL_INVITATION / INVITATION_BASIC (Rp 300.000)GUESTBOOK_DIGITAL (Rp 2.000.000)Publikasi UndanganDraft Only ❌100% Aktif & Publik ✅  100% Aktif & Publik ✅  Batas Aset CustomDibatasi  Max 30 Foto + 1 Musik  Max 30 Foto + 1 Musik  Analytics & Ekspor RSVP❌  Ekspor CSV & Realtime ✅  Ekspor CSV & Realtime ✅  Database Tamu & QRBasic  Lengkap dengan Tiket QR ✅  Lengkap dengan Tiket QR ✅  Interactive Seating Chart❌  Generator Denah 2D ✅  Generator Denah 2D ✅  Onsite Check-in & Usher App❌  ❌  Dukungan Onsite & Server Usher Check-in ✅  4.2 Account-Level Entitlement & Payment LogicAccount-Level Entitlement Helper (lib/packages/server-access.ts): Rangkaian acara tambahan (additional event) mewarisi entitlement paket user/account via hasAccountDigitalInvitation dan hasAccountGuestbook, meskipun relasi Payment secara historis melekat pada invitation utama.  Checkout & Payment Order: Pembelian paket diproses melalui PaymentOrder (terpisah dari record Payment entitlement aktif).  Manual Verification: Verifikasi dilakukan oleh Admin/Finance di /admin melalui pemeriksaan bukti transfer (JPG/PNG/WEBP/PDF maks ~3 MB).  Prorated Package Upgrade: Upgrade dari INVITATION_BASIC ke GUESTBOOK_DIGITAL menghitung selisih harga paket (misal: Rp 1.700.000).  Custom Design Invoice: Role Admin dapat menerbitkan invoice CUSTOM_DESIGN secara manual.  5. Data Architecture, Auth & Multi-Event Routing5.1 Onboarding & Registration FlowSimplified Registration: Form pendaftaran awal (RegisterDialog) hanya memerlukan email, password, konfirmasi password, dan persetujuan Terms/Privacy.  Dashboard Onboarding: Pengumpulan data groomName, brideName, dan firstName dilakukan pada alur onboarding.  Prisma User & Event Creation: firstName disimpan pada User.firstName, serta secara otomatis membuat record WEDDING utama dan slot EVENT_KHUSUS. Nama pasangan dikunci (read-only) pada editor sub-event.  5.2 Dynamic Information Architecture (Parent: Acara)Sidebar user menggunakan hirarki terstruktur dengan namespace Acara / 01 hingga Acara / 04:  Beranda  Acara (Parent navigation dengan ikon CalendarDays, expand/collapse):  Rangkaian Acara (Maksimal 3 rangkaian/undangan per owner)  Undangan (Status publish, open counter, & studio entry)  WA Blast (Manajemen kuota dan recipient queue)  Personal Invitation (Generator link & password khusus tamu)  RSVP (Event-scoped dataset)  Manajemen Tamu (Event-scoped seating & roster)  Usher App (Event-scoped check-in)                       ┌──► OWNER    ──► /owner    (User Management, Audit Logs, Multi-role)
                     ├──► ADMIN    ──► /admin    (Operations, Custom Invoices, Manual Verification)
┌─────────────────┐  ├──► FINANCE  ──► /admin    (Payment Verification & Financial Reports)
│ Login / Session │ ─┼──► DESIGNER ──► /designer (Template Catalog Upload & Sales Tracker)
└─────────────────┘  ├──► EDITOR   ──► /designer (Legacy Designer Routing)
                     └──► USER     ──► /dashboard (Wedding Organizer Workspace)
5.3 Routing, Event Scope & Public Routing LogicDefinition of Configured Event: Invitation.eventConfigured Boolean @default(false). Sebuah rangkaian hanya dianggap aktif dan muncul di selector jika user menekan Simpan rangkaian.  Main Wedding URL: https://[nama-pasangan][.dcwedding.com/](https://.dcwedding.com/)  Event Khusus Routing: https://[nama-pasangan][.dcwedding.com/](https://.dcwedding.com/)[nama-event]. Route publik mencari maksimal 2 event tambahan dan mencocokkan eventSlug terhadap slugifyEvent(title).  Proxy Routing (proxy.ts): Mengarahkan tenant/event routing secara otomatis ke /invite/[slug]/[eventSlug].  Universal Password Protection: Proteksi password undangan menggunakan bcrypt hash & cookie akses universal.  6. Detailed Feature Specifications & API Enforcements6.1 Event-Scoped Guest Management & RSVP (POST /api/guests)Event Selector Picker (EventScopePicker.tsx): Workspace RSVP dan Manajemen Tamu menyediakan selector untuk memilih acara yang sudah eventConfigured = true. Dataset isolasi berlaku penuh pada read/write operations.  Capacity & Conflicts: Validasi tableId milik acara aktif. Meja penuh mengembalikan HTTP 409 Conflict[cite: 10].  CSV Export: Ekspor CSV RSVP dinamai dc-organizer-rsvp.csv[cite: 10].6.2 Event-Scoped Interactive Seating Builder (Konva 2D Engine)Visual Engine: Berbasis 2D Konva (react-konva) menggunakan frame netral #FBFAFA dan aksen Rose.  Database Constraints: Guest.seatNumber Int? dengan aturan @@unique([tableId, seatNumber])[cite: 10].Server Limits (POST /api/tables): Maksimal 100 meja per acara (1–50 kursi per meja). Shape: ROUND, RECTANGLE, SQUARE[cite: 10].  Atomic Swap & Isolation: Swap dan penempatan kursi memvalidasi bahwa target guest dan meja berada pada invitationId acara yang sama.  Eligibility Enforcement: Seating roster hanya menerima tamu berkategori MANUAL atau RSVP berstatus ATTENDING[cite: 10].6.3 Distribution Engine: WA Blast & Personal InvitationWA Blast Engine:Base Quota: Invitation.waBlastQuota default 100.  Recipient Queue: Memilih tamu existing atau input manual yang otomatis tersimpan ke Guest.waBlastSelected. Delivery provider dan top-up pricing sengaja diabstraksi hingga keputusan pihak ketiga ditetapkan.  Personal Invitation Engine:Direct Link: https://[couple-slug].[root-domain]/p/[token] yang di-rewrite ke /invite/[slug]/p/[token].  Identity Binding: Menampilkan personalisasi "Undangan khusus untuk ".  Security & Privacy: Hash password disimpan via bcrypt. GET /api/guests menggunakan explicit safe select untuk mencegah kebocoran personalPasswordHash.  6.4 Onsite Usher Check-in & QR SystemEvent Isolation: POST /api/usher/qr dan POST /api/usher/manual-checkin mendeteksi invitationId dari guest terkait, memastikan aksi check-in pada Event 2 atau Event 3 berjalan akurat.  7. Workspace, Studio & Renderer Specifications7.1 Studio & Asset CompatibilityMulti-Event Studio Target: Direct CTA Buat undangan di Studio membawa parameter type dan invitationId yang sesuai. Studio resolver mencegah cross-saving antar-tipe.  Asset Upload Limit: Paket dasar mencakup maksimal 30 Foto + 1 Musik[cite: 10].7.2 Public Renderer StandardsFigma Classic & Dynamic Templates: Mengambil template terpublikasi via GET /api/templates.  Open Counter Tracking: Invitation.viewCount dan Guest.personalViewCount bertambah setelah melewati publish, payment, dan password gate.  Mandatory Footer: Seluruh renderer publik mewajibkan penggunaan footer bertuliskan DC Organizer.  8. Definition of Done (DoD)Multi-Event Workspace & Isolation: Pengguna dapat membuat hingga 3 Rangkaian Acara. Workspace RSVP, Manajemen Tamu, Seating Chart, dan Usher terisolasi berdasarkan acara aktif.  Distribution & Personalization: Personal Invitation dapat dipublikasikan dengan token unik dan proteksi password terenkripsi. WA Blast queue mengelola kuota server secara presisi.  Role & Navigation Isolation: Akses /owner, /admin, dan /designer terisolasi penuh dengan sidebar parent Acara yang fleksibel.  Visual & Design System Compliance: Menggunakan canonical Button, neutral-first surface dengan radius 12px / 8-10px, typography Cinzel/Fauna One/DM Mono, serta bebas dari divider horizontal berlebihan.  Database & Migration Integrity: Skema Prisma terkonfigurasi dengan migration 20260916173000_add_invitation_distribution_fields.  Brand Consistency: 100% menggunakan label DC Organizer pada seluruh permukaan sistem.  