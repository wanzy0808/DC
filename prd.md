

> This document is the product and implementation source of truth for the DC Wedding application.
>
> Repository: `wanzy0808/DC`
>
> Brand name: **DC Wedding**
>
> IMPORTANT: Do not rename this product to Citin. Citin is a separate project.

---

# 1. Product Definition

DC Wedding is a SaaS wedding platform centered around a Digital Wedding Invitation and connected guest-management workflow.

The product must support the complete lifecycle:

```text
Wedding Setup
    ↓
Invitation Creation
    ↓
Invitation Publication
    ↓
Invitation Distribution
    ↓
Guest RSVP
    ↓
Guest Management
    ↓
Table / Seat Assignment
    ↓
Guest QR Ticket
    ↓
Wedding-Day Check-in
    ↓
Usher App
The product is NOT only a digital invitation generator.
The long-term positioning is:  End-to-end digital wedding guest management platform with Digital Invitation as the entry point.  2. Development PrinciplesCoding agents MUST follow these rules.  2.1 Preserve Existing FunctionalityDo not remove existing working functionality unless explicitly requested.
In particular:  Do NOT remove Beranda.  Do NOT remove /dashboard.  Do NOT remove existing dashboard navigation.  Do NOT rename the brand from DC Wedding.  Do NOT replace existing functionality with a mock implementation.  Do NOT delete existing routes merely because a new route is introduced.  Before modifying a feature:Inspect the existing implementation.  Understand existing routes/components/API.  Extend the current architecture where possible.  Avoid duplicate implementations.  2.2 Existing Dashboard RouteThe dashboard must remain accessible through: /dashboard  
The existing dashboard structure must be preserved.
If dashboard architecture changes, ensure that /dashboard continues to resolve correctly.  2.3 Centralized Access ControlPackage access must be centralized.
Do NOT implement random package checks directly throughout UI components.
Use the existing centralized package/access system where possible.
UI and API authorization must follow the same entitlement rules.  3. Package Model & Pricing DetailsAplikasi mendukung 3 status paket utama (Package States) dan Sistem Add-ons:NONEDIGITAL_INVITATION (Harga: Rp 300.000)GUEST_BOOK (Harga: Rp 2.000.000) — Otomatis Termasuk Seluruh Fitur DIGITAL_INVITATION secara GRATISPermissions Scope:
digitalInvitation, guestBook, usher, rsvp, guestManagement, studio, publication, customAssets, addOns.  4. Package Permissions & Feature Entitlements4.1 NONEThis represents a user who has not purchased a package.  Allowed:View invitation templates  Edit invitation  Use Studio  Use built-in music  Fill wedding/event information  Use RSVP  Not allowed:Publish invitation  Upload custom music, photos, or videos  Guest Book  Guest Management  Usher App  Table management  Seat management  Locked features must remain visible where appropriate and show an upgrade state.  4.2 DIGITAL_INVITATION (Harga: Rp 300.000)Paket Undangan Digital memberikan akses penuh terhadap fitur pembuatan dan penyebaran undangan digital publik dengan rincian fitur sebagai berikut:  Subdomain Kustom ([namapasangan].dcwedding.com): Alamat link utama website undangan digital berbasis subdomain.  2 Jenis Undangan Terpisah: Dapat membuat 1 Undangan Pernikahan (Resepsi) dan 1 Undangan Event Khusus (Akad Nikah / Seserahan / Sangjit).  Galeri Foto: Upload hingga 30 foto per event/undangan.  Unlimited Guests: Bebas membuat dan menyebarkan ke jumlah tamu tanpa batas.  Bebas Pilih & Ubah Template: Akses penuh ke seluruh katalog template dan kustomisasi Studio Editor.  Undangan Public atau Private: Dukungan mode publik atau fitur perlindungan Password khusus.  Fitur Lokasi (Maps): Integrasi Google Maps dan petunjuk arah lokasi acara.  Countdown Timer: Penghitung mundur waktu menuju hari H acara.  Add to Calendar: Integrasi simpan jadwal otomatis ke Google Calendar bagi tamu.  RSVP & Wishes: Fitur ucapan, konfirmasi kehadiran, dan rekap otomatis lengkap pada dashboard.  Customizable Background Music: Bebas upload lagu/musik kustom milik pengguna.  Wedding Gift: Fitur amplop digital, nomor rekening bank, dan alamat pengiriman kado.  Smart Dashboard & Editor: Akses Studio Editor interaktif serta manajemen dashboard lengkap.  Manajemen Tamu & Tools Sebar Undangan: Fitur pengelompokan tamu dan pencetak link undangan otomatis.  Atur Tamu Berdasarkan Sesi: Pengaturan pembagian jam/sesi kedatangan tamu.  Table & Seat Management (SaaS Access): Fitur penataan meja dan tempat duduk tamu pada dashboard.Masa Aktif Selamanya: Tanpa ada batasan waktu atau batas kadaluarsa link.  Locked:Guest Book Onsite Operational FeaturesUsher App & Live QR Check-in Terminal4.3 GUEST_BOOK / Buku Tamu Digital (Harga: Rp 2.000.000)Paket Buku Tamu Digital (GUEST_BOOK) adalah layanan operasional & perangkat fisik langsung di lokasi acara (Onsite Wedding-Day Operational Service):  INCLUDES FREE DIGITAL INVITATION: Otomatis mendapatkan seluruh hak akses dan fitur penuh dari Paket Undangan Digital (Rp 300.000) tanpa biaya tambahan.2 Unit Perangkat Tablet: Tablet untuk operasional check-in dan penerimaan tamu di meja registrasi.  Koneksi Internet Modem: Penyediaan modem internet terdedikasi di lokasi acara.  Kru Dukungan Teknis (Technical Support Crew): Tim teknis profesional langsung di venue untuk mendampingi operasional sistem (4 Jam).  Dukungan Layanan Pelanggan 24/7: Layanan bantuan teknis sebelum dan saat hari H.  Cetak QR Code E-Angpao (Printed E-Angpao QR Code): Media fisik QR code angpao digital untuk diletakkan di meja tamu/registrasi.  Berkas QR Code Siap Cetak (Printable QR Code File): File QR ticket/penerimaan siap cetak.  Akses Fitur Software Onsite: Membuka akses sistem Guest Book, Usher App, dan Sistem QR Check-in Server-Authoritative pada dashboard.  (Catatan: Biaya personil Usher penerima tamu tidak termasuk dalam paket ini, dikelola secara terpisah melalui Add-ons).5. Add-ons SystemPengguna dapat memilih dan menambahkan add-ons berikut ke dalam pesanan mereka melalui dashboard:Onsite & Guestbook Add-ons:Guestbook Event Khusus (Sangjitan / Akad): +Rp 500.000 (Penggunaan sistem Buku Tamu Digital untuk event kedua/privat).Usher (Penerima Tamu): Rp 800.000 per 1 orang.Layar Sapa / Display Greeting (Sewa): Layar tampilan penyambut kedatangan tamu otomatis saat QR diringkas/check-in.Broadcast WhatsApp Invitations: Rp 1.000 per 1 pesan (Tersedia opsi paket Rp 100.000 per 100 pesan).Full Custom Design: Rp 1.800.000 (Percayakan desain impian Anda pada tim, eksklusif sesuai konsep dan kebutuhan acara).Multimedia, Streaming & Hardware Rental Add-ons:Custom Top-Level Domain (TLD): Pembuatan domain kustom penuh (contoh: nama-pasangan.com).Live Cam Only: Pilihan 2 Kamera atau 1 Kamera.Live Streaming Combo: 2 Event Sessions.Extend Duration Live Streaming: +25% dari harga paket per 1 jam (Estimasi: Rp 1.312.500).TV LED 50 Inci: Rp 1.225.000 / unit.TV LED 60 Inci: Rp 1.555.000 / unit.TV LED 65 Inci: Rp 1.750.000 / unit.Proyektor + Screen (2x3 Meter): Rp 2.600.000 per 1 unit.Soundsystem (4 Mic & 2 Speaker): Rp 1.998.000 per 1 unit.Zoom + Operator: Rp 1.350.000.Zoom Participant Expansion (500 & 1000 Participants): Rp 1.367.520.6. OnboardingBefore entering the dashboard for the first time, the user must provide:  Nama pasangan pria  Nama pasangan wanita  Nama panggilan pengisi dashboard  The nickname is used for the dashboard greeting.
Example: Selamat datang, Hendra.  The onboarding information should persist and should not be requested repeatedly unless the user explicitly edits the information.  7. Dashboard Navigation7.1 Main MenuThe dashboard must contain:  Beranda  Rangkaian Acara  Undangan Digital  RSVP  Manajemen Tamu  Guest Book  Usher App  Important: The previous menu name Tamu Undangan has been changed to: Manajemen Tamu. Do not remove Beranda.  8. Global NavbarThe global navbar/burger menu contains:  Greeting  Transaksi  Tambah Paket & Add-ons  FAQ  Bantuan  Logout  Avoid creating duplicate page-level branding/header sections when the global navbar already handles them.  9. BerandaBeranda is the main dashboard overview.
Required information:  Greeting  Total invitations shared  Total RSVP  Total invitations created  Invitation quota  Wedding preparation status  Example:  Selamat datang, Hendra
Undangan Dibagikan: 128
RSVP: 87
Undangan Dibuat: 1 / 2  Current invitation quota: Maximum 2 invitations per account (1 Undangan Utama Pernikahan & 1 Undangan Event Khusus). The quota must ideally be configurable for future package expansion.  10. Rangkaian AcaraRangkaian Acara stores the wedding event information used by the invitation.
Fields: Nama Acara, Tanggal Acara, Zona Waktu, Waktu Mulai, Waktu Selesai, Deskripsi Acara, Lokasi, Alamat, Google Maps URL.  Event information must be persisted. The invitation template should consume the same event data rather than duplicating event data manually.  11. Event LocationLocation information must support:  Venue / location name  Address  Google Maps URL  The invitation may display: "Lihat Lokasi" or "See Location", which opens the configured map URL.  12. Event DescriptionThe event description should support a user-friendly editing experience.
The UI can use a draft/rich-text-style editor where appropriate.
The data must remain safe to render in the public invitation. Do not introduce unsafe HTML rendering without sanitization.  13. Digital Invitation Management & Subdomain RoutingDigital Invitation is the public wedding website and its management interface.  Subdomain Architecture & Dual-Invitation Types:
Sistem menggunakan routing Subdomain Kustom ([namapasangan].dcwedding.com) dan mendukung pembuatan serta pengelolaan 2 jenis undangan independen di dalam satu akun/event dashboard:  Undangan Pernikahan (Main Wedding Invitation): Ditujukan untuk acara puncak/resepsi ([namapasangan].dcwedding.com).  Undangan Event Khusus (Akad Nikah / Seserahan / Sangjit): Ditujukan untuk acara khusus privat ([namapasangan].dcwedding.com/event-khusus).  Required Capabilities & Dashboard Controls:
Dalam menu Undangan Digital pada dashboard, pengguna disajikan 2 card/section terpisah untuk masing-masing tipe undangan dengan kontrol aksinya masing-masing:  2x Tombol Salin Link (Copy Link):Salin Link Undangan Pernikahan ([namapasangan].dcwedding.com)  Salin Link Undangan Event Khusus ([namapasangan].dcwedding.com/event-khusus)  Pratinjau (Preview): Membuka tab baru untuk melihat tampilan publik dari masing-masing jenis undangan.  Edit Desain (Edit Studio): Mengarahkan ke Studio Editor untuk menyesuaikan tata letak/template.  Publish / Unpublish: Mengontrol status publikasi masing-masing jenis undangan.  Publication states: DRAFT, PUBLISHED, UNPUBLISHED.
Users without the required Digital Invitation entitlement cannot publish either invitation.  14. Invitation Password ProtectionPengguna dapat mengaktifkan dan mengelola perlindungan kata sandi (Password Protection) untuk keamanan undangan digital.  Scope & Behavior:Universal Password Application: Pengaturan kata sandi ini berlaku serentak dan masuk ke seluruh subdomain/link undangan.  Jika fitur proteksi diaktifkan, tamu yang mengakses URL wajib memasukkan kata sandi yang dikonfigurasi.  Required Actions in Dashboard: Enable protection, Disable protection, Create password, Change password.
Passwords must be verified securely on the server side and must not be exposed in clear text on the client payload.  15. Wedding StudioStudio is available even to users who have not purchased a package.
Studio allows: Select template, Edit invitation, Edit content, Configure design, Preview, Use built-in assets, Use built-in music.  Access behavior:NONE: Studio = OPEN | Publish = LOCKED | Custom Assets = LOCKED  DIGITAL_INVITATION & GUEST_BOOK: Studio = OPEN | Publish = OPEN | Custom Assets = OPEN (Maks. 30 Foto)  16. AssetsAssets are divided into:Built-in Assets: Built-in music, Built-in photos, Built-in videos, Templates (Available to users without purchasing Digital Invitation).  Custom Assets: Custom music, Custom photos (hingga 30 foto pada Paket Undangan Digital & Guestbook), Custom videos.  17. RSVP Dashboard & AnalyticsHalaman RSVP pada dashboard menyajikan rekap analitik dan tabel daftar tamu RSVP terintegrasi secara real-time.  17.1 RSVP Header MetricsDashboard RSVP wajib menampilkan 6 kartu statistik utama:Total Undangan RSVP: Jumlah total formulir RSVP yang masuk.  Total Undangan Konfirmasi Hadir: Jumlah tamu yang menyatakan konfirmasi "Hadir".  Total Keseluruhan Tamu: Jumlah akumulasi pax/pendamping tamu.  Total Tamu Sudah Check In: Jumlah tamu yang telah melakukan scan QR/check-in di venue.  Tamu Memberi Angpao: Catatan tamu yang memberikan amplop digital/cash.  Tamu Memberi Kado: Catatan tamu yang mengirimkan hadiah fisik.  17.2 Daftar Tamu RSVP Table & ControlsToolbar & Action Bar:Search Filter (Pencarian Nama Tamu).  Sorting / Urutkan Data.  Export Data (Excel / CSV).  Struktur Kolom Tabel RSVP:# (Nomor Urut)NAMA TAMUSTATUS RSVP (contoh: Hadir, Tidak Hadir, Ragu)STATUS PENGIRIMAN QR (contoh: Sent, Not Sent)KETERANGAN SCAN (contoh: Belum Check In, Checked In)ACARA (contoh: Holy Matrimony, Reception, Akad)HADIAH (Status pemberian Angpao / Kado)AKSI (Menu Opsi: Check In Manual, Kode QR, Edit Tamu, Hapus Tamu)18. RSVP Success StateAfter a guest submits RSVP, do NOT rely only on WhatsApp redirection.
Show a web success page with: Thank-you message, Guest name, Number of guests, Unique QR / digital ticket, Save / Download Ticket, Add to Google Calendar.  19. QR TicketEach RSVP reservation receives a unique QR ticket.
QR must identify the reservation. Do NOT put sensitive guest information directly inside the QR payload.  PlaintextQR ──> Opaque reservation identifier ──> Server lookup ──> Guest reservation
The QR should be usable by the Usher App.  20. Manajemen TamuMenu: Manajemen Tamu  
Guest information: Name, Phone, Pax, RSVP status, Session, Table, Seat, QR ticket, Check-in status.
Tools sebar undangan & pembagian sesi tamu. The interface must prioritize fast data entry.  21. Table ManagementTable management is available for both Digital Invitation and Guest Book users.
Each table contains: Table number/name, Capacity, Seats.  22. Seat AssignmentGuests can be assigned:PlaintextGuest ──> Table ──> Seat
The UI should prevent assigning more guests/seats than table capacity.  23. Guest BookGuest Book is the wedding-day guest attendance system flow:  PlaintextGuest receives invitation ──> Guest RSVPs ──> Guest receives QR ──> Guest arrives ──> QR scanned ──> Guest identified ──> Check-in ──> Table / Seat displayed
The system must prevent accidental duplicate check-ins.  24. Usher AppUsher App is designed for wedding-day staff.
Capabilities: QR scanner, Guest search, Guest detail, RSVP information, Pax information, Table, Seat, Check-in.
Manual search must be available as a fallback if QR scanning is unavailable.  25. Check-inCheck-in must be server-authoritative. The client must not be able to simply mark a guest as checked in without server validation.
Check-in should verify: Reservation exists, Reservation is valid, Reservation has not already been checked in.
Successful check-in should persist: checkedInAt and checkedInBy.
If already checked in, the UI must clearly communicate that state.  26. Data RelationshipsConceptual data structure:  PlaintextUser
 └── Wedding
      ├── Couple Information
      ├── Subdomain (`[namapasangan].dcwedding.com`)
      ├── Event
      ├── Invitation (Pernikahan & Event Khusus)
      │      └── Template / Studio
      ├── Guest
      │      └── RSVP (Status, Pax, Angpao/Kado)
      ├── Ticket
      ├── Table
      │      └── Seat
      └── Check-in
Subscription/access:  PlaintextUser ──> Subscription ──> Entitlements & Add-ons
27. Existing API / Database ExpectationsExisting invitation API must preserve and support event information including:
groomName, brideName, subdomain, venue, address, mapUrl, timezone, eventDate, ceremonyTime, receptionTime, title, templateKey, description, weddingHashtag, dressCode, liveStreamUrl, eventNotes, gift/bank information, musicUrl, isPublished.  When extending the invitation API:Do not remove existing fields.  Do not silently discard existing values.  Validate user-owned data.  Respect publication/package permissions.  Keep database and API schema synchronized.  28. API AuthorizationEvery protected mutation must validate authorization server-side.
Do not rely only on disabled buttons or hidden menus.
Both UI and API verification layers are required.  29. UI Permission StatesLocked features should preferably remain discoverable.
Recommended states: Available, Locked, Upgrade Required, Coming Soon, Disabled.
A locked feature should explain why it is locked.  30. Responsive RequirementsDashboard must support Desktop, Tablet, and Mobile.
Core functionality must remain accessible on mobile, especially for: Guest Management, Usher App, QR scanning, Check-in.  31. Design SystemThe existing project design system must be respected.  Fonts (Use only):Cinzel: Branding, Large headings, Wedding titles, Display typography.  Fauna One: Body text, Forms, Navigation, Buttons, General UI.  DM Mono: Technical information, QR identifiers, Codes, Utility information.  Do not introduce random fonts.  32. Light ThemePreferred visual direction: Maroon, Burgundy, Deep Wine, Cream, Ivory, Dark Brown, Black.
Prioritize readability. Do not use maroon for ordinary body text merely for visual variety. Use dark readable text on light surfaces.  33. Dark ThemePreferred visual direction: Black, Near Black, Pink, Rose, Hot Pink, White, Light Neutral.
Maintain high contrast. Use pink/rose primarily as accent. Body text should remain white/light neutral.  34. UX PrinciplesThe interface should feel: Elegant, Romantic, Simple, Fast, Modern.
It should not feel like a generic enterprise admin dashboard.  35. Guest Management UXPriorities: Fast search, Fast add, Fast edit, Fast RSVP filtering, Fast session assignment, Fast table assignment, Fast seat assignment, Fast check-in lookup.  36. Invitation QuotaCurrent planned quota: 2 invitations per account (1 Undangan Pernikahan & 1 Undangan Event Khusus).
Dashboard must show usage (1 / 2 atau 2 / 2). Quota should be implemented configurably.  37. Package Monetization ArchitectureInitial packages:Digital Invitation (Rp 300.000,-) — Termasuk Subdomain [namapasangan].dcwedding.comGuest Book Digital (Rp 2.000.000,-) — Termasuk Akses Gratis Undangan DigitalAdd-ons Modular System — WhatsApp Broadcast, Guestbook Event Khusus, Sewa Layar Sapa, Personil Usher, dan Hardware Streaming/Rental.The architecture should allow additional packages/entitlements/add-ons without rewriting every feature.  38. Route RequirementsCurrent important routes must remain intact (/, /dashboard). Wildcard Subdomain routing ([namapasangan].dcwedding.com) must be handled at the router/middleware level.
Inspect existing implementation before creating additional routes.  39. Existing Project RulesCoding agents MUST read and follow AGENTS.md before making architectural or UI changes.  40. Implementation StrategyFollow these 5 steps when implementing a feature:  Inspect: Check existing routes, components, API, schema.  Reuse: Reuse existing helpers, hooks, design tokens.  Implement: Build the smallest complete feature.  Validate: Check TypeScript, Lint, Build, Migrations.  Regression Check: Verify /dashboard, Beranda, and navigation still work.  41. Do Not Do These ThingsCoding agents MUST NOT:  Delete Beranda or /dashboard.  Rename DC Wedding to Citin.  Remove existing menu items or database fields without instructions.  Bypass centralized package permissions.  Introduce random fonts or hard-code package access everywhere.  Break existing invitation functionality.  42. MVP PriorityP0 — Critical: Dashboard, Onboarding, Beranda, Rangkaian Acara, Digital Invitation Subdomain Routing ([namapasangan].dcwedding.com), Studio, Package Access (Rp 300rb & Rp 2Jt Entitlement), RSVP, Invitation Publication.  P1 — Guest Operations & Add-on Integration: Manajemen Tamu, Tools Sebar Undangan, Sesi Tamu, RSVP Metric Cards & Detailed Table, Table Management, Seat Assignment, QR Ticket, Add-on Cart System.P2 — Wedding Day: Guest Book System, Usher App, QR Scanner, Guest Search, Check-in, Duplicate Check-in Protection, Layar Sapa.P3 — Product Expansion: Premium Templates/Assets, Additional Hardware Scheduling, Analytics.  43. Invitation Definition of Done (DoD)Create Invitation (Main/Special Event) ──> Configure Subdomain ──> Edit Template ──> Preview ──> Publish (if entitled) ──> Guest Opens Subdomain (with Password if enabled) ──> Guest RSVPs  44. RSVP Definition of Done (DoD)Guest Opens Subdomain ──> Guest Submits RSVP ──> Server Validates ──> Persist ──> Dashboard RSVP Updates Metrics & Table ──> Unique QR Ticket Issued  45. Guest Management Definition of Done (DoD)RSVP Appears ──> Admin Searches ──> Admin Edits ──> Assign Session, Table & Seat ──> Data Persisted  46. Usher App & Check-in Definition of Done (DoD)Valid QR ──> Scan QR ──> Server Identifies ──> Show Table/Seat ──> Check-in Executed ──> Persisted (Duplicate scan shows "Already checked in")  47. Product North StarPlaintext                    DC WEDDING
                         │
      ┌──────────────────┴──────────────────┐
UNDANGAN PERNIKAHAN                 UNDANGAN EVENT KHUSUS
([namapasangan].dcwedding.com)      (.../event-khusus)
      └──────────────────┬──────────────────┘
                         │
                        RSVP
                         │
                   GUEST DATA
                         │
             ┌───────────┴───────────┐
             │                       │
        TABLE / SEAT              QR TICKET
             │                       │
             └───────────┬───────────┘
                         │
              GUESTBOOK / USHER APP
           (Onsite Hardware & Services)
                         │
                    WEDDING DAY
48. Source of Truth RulesExplicit user instruction in current task has highest priority.
Existing repository architecture and AGENTS.md must be respected.
Prefer: Extend > Refactor > Replace > Delete.  49. Final Rule for Coding AgentsBefore modifying the repository, always ask:  Does this already exist?  Which existing route/component/API handles it?  Will this change remove or break Beranda?  Will /dashboard still work?  Does package access remain centralized?  Does the API enforce the same permission as the UI?  Does this follow AGENTS.md?  Does this preserve DC Wedding branding?  Does this preserve existing user data?  Does the implementation satisfy the relevant Definition of Done?[cite: 1, 2]