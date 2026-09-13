# DC Organizer — PRD Implementation Addendum

Dokumen ini adalah implementation log / PRD tambahan untuk repository `wanzy0808/DC`.

- `prd.md` = Master Product Requirements / Product Source of Truth.
- `PRD-TAMBAHAN.md` = implementation history, rationale, entitlement impact, commit, dan validation.
- `AGENTS.md` = coding/design-system rules.
- `README.md` = technology stack dan public architecture.

## Aturan Dokumentasi

Setiap perubahan baru dicatat tanpa menghapus keputusan/history sebelumnya. Validation tidak boleh diklaim PASS tanpa hasil build/CI yang benar-benar tersedia.

---

# 2026-09-12 — Implementation History

## 1. Invitation Password Protection
- Password protection ditambahkan pada `Invitation` dengan bcrypt hash dan signed access cookie.
- Owner settings API dan public password verification/gate ditambahkan.
- `passwordHash` tidak dikirim sebagai public response.
- Satu password berlaku untuk root invitation dan event path pada tenant yang sama.
- Entitlement: DIGITAL_INVITATION / GUEST_BOOK.
- Commits: `fc11e21`, `cc99458`, `cdba01f`.
- Validation: implementation recorded; build/CI tidak diklaim PASS tanpa run terverifikasi.

## 2. RSVP Analytics & Guest Actions
- RSVP metrics, analytics table, search/sort, CSV export, QR guest ticket, dan manual server-side check-in.
- Check-in menggunakan atomic update untuk mencegah duplicate check-in.
- RSVP analytics mengikuti DIGITAL_INVITATION; QR ticket mengikuti DIGITAL_INVITATION/GUEST_BOOK; onsite Usher tetap GUEST_BOOK.

## 3. Guest Management Entitlement
- Manajemen Tamu diselaraskan ke DIGITAL_INVITATION.
- Guest edit/delete, table management, dan seat assignment mengikuti Digital Invitation.
- Usher App tetap GUEST_BOOK.
- Blocking popup lama yang menghalangi Manajemen Tamu dihapus.

## 4. Dashboard Invitation Feature Restoration
- Workspace Undangan Digital, WEDDING/ADAT_AKAD, Preview, Salin Link, Edit Desain, Publish/Unpublish, asset management, dan Password Protection dipertahankan/dipulihkan.
- `/dashboard` dan Beranda tetap dipertahankan.
- Commits: `7312929`, `be89ba4`.
- Rationale: Extend Over Replace.

## 5. Invitation Studio
- Deep link ADAT_AKAD.
- Custom asset server-side entitlement, maksimal 30 foto + 1 custom music.
- Mock/example state dihapus.
- Data event dibaca dari database; Studio bukan sumber data inti.
- Preview alamat/Maps dan undo/redo dekorasi.
- Custom assets mengikuti DIGITAL_INVITATION/GUEST_BOOK.

## 6. Centralized Event Data / Single Source of Truth
- `EventPanel` menjadi editor utama WEDDING/ADAT_AKAD.
- Data event disimpan di `Invitation`.
- Couple names berasal dari onboarding/database dan read-only pada Rangkaian Acara.
- ADAT_AKAD memakai data pasangan WEDDING bila belum memiliki data sendiri.
- Tidak ada duplicate form untuk data inti yang sudah tersedia.

## 7. Dashboard Onboarding Fix
- Race condition onboarding diperbaiki.
- WEDDING invitation dipastikan tersedia sebelum onboarding disimpan.
- Couple names disimpan ke WEDDING; nickname ke `User.firstName`.
- Modal hanya muncul jika data wajib belum lengkap.
- Logic onboarding duplikat pada `DashboardGate` dihapus.

## 8. Dashboard Guard Cleanup
- Wrapper `DashboardFeatureGuard` dengan click interceptor lama dihapus.
- Authorization tetap server-side dan UI gate mengikuti entitlement.

## 9. No Mock Invitation Defaults
- Default `Rio`, `Lyvia`, dan `Gedung Pernikahan` dihapus dari schema.
- Invitation baru menggunakan nilai kosong.
- Migration PostgreSQL untuk default string kosong dibuat.

## 10. Event Panel Couple Lock
- Couple names pada WEDDING dan ADAT_AKAD read-only.
- Data yang dapat diedit: nama event, tanggal, timezone, waktu, venue, alamat, Maps, deskripsi, catatan.

# Canonical Public Invitation URL Architecture

## 11. Canonical Public Invitation URL — Event Name Path
- Main Wedding: `https://[nama-pasangan].dcwedding.com/`.
- Event Khusus: `https://[nama-pasangan].dcwedding.com/[nama-event]`.
- Event name berasal dari database (`Invitation.title`) dan di-slugify melalui `slugifyEvent()`.
- Tidak membuat duplicate event-name field hanya untuk URL.
- `proxy.ts` melakukan tenant routing dan event path diteruskan ke `/invite/[slug]/[eventSlug]`.
- `/event-khusus` dipertahankan sebagai compatibility alias; `/invite/[slug]` untuk internal/backward compatibility.
- Commits: `46828c0`, `663fc9c`, `3f775e1`, `22e0dc9`.

## 12. Dashboard Canonical URL Fix
- `InvitationManagementPanel` memakai canonical subdomain/event-name URL.
- Tidak membuat URL placeholder jika event name belum tersedia.
- Preview dan Salin Link memakai canonical URL yang sama.
- Commit: `98d1eaf`.

## 13. PRD / README Documentation Alignment
- `prd.md` diselaraskan dengan canonical event-name architecture.
- `README.md` diselaraskan dengan public invitation architecture.
- `PRD-TAMBAHAN.md` disatukan tanpa menghilangkan implementation history.
- Commits: `9b927f6`, `cdc1304`, `368e92e`, `248c41d`, `a25726a`.

# PRD Gap Review & Implementation

## 14. Guest Management Entitlement Mismatch Fixed
### Gap
Beberapa API masih memakai `hasPaidGuestbook()` sehingga Digital Invitation tidak dapat melakukan guest management.
### Implemented
- `/api/guests` → `hasPaidDigitalInvitation()`.
- `/api/wedding-tables` → Digital Invitation.
- `/api/guests/export` → Digital Invitation.
- `/api/tables` aligned dengan Digital Invitation.
### Commits
- `e72f8f7`
- `a17a4b4`
- `25282fe`
### Validation
Code review terhadap `prd.md` dan `lib/packages/access.ts`; build/CI **Not verified**.

## 15. Canonical Undangan Digital Workspace Route
### Implemented
- `/dashboard/undangan-digital` ditambahkan sebagai workspace server-side.
- Workspace memakai `InvitationManagementPanel` dan entitlement database.
- Studio Back/breadcrumb kembali ke `/dashboard/undangan-digital`.
### Commits
- `f8ad75f`
- `94e665b`
### Validation
Route dan server-side entitlement reviewed; build/CI **Not verified**.

## 16. Dashboard Sidebar Support Copy Cleanup
### User Clarification
Yang diminta user untuk dihapus adalah tulisan kecil di kiri bawah sidebar:
- `Butuh bantuan?`
- `Chat WhatsApp di kanan bawah.`
### Implemented
- Blok support copy dihapus dari `app/[dashboard]/page.tsx`.
- Workspace, navigation, entitlement, dan data flow tidak diubah.
- Floating WhatsApp button tidak diubah karena scope yang diklarifikasi user adalah tulisan kiri bawah.
### Rationale
Mengikuti instruksi user secara minimal dan prinsip Extend Over Replace.
### Commit
- `5d771d1206dfee3b651c043da0182b369cf50dd5` — remove dashboard sidebar support copy
### Validation
Code-level review; build/CI **Not verified**.

## 17. Guest Seat Assignment Persistence & Placement API
### PRD Requirement / Gap
`prd.md` menetapkan interactive seating dengan `tableId` + `seatNumber`, tetapi schema `Guest` sebelumnya hanya memiliki `tableId`. Seat-level persistence belum tersedia.
### Implemented
- `Guest.seatNumber Int?` ditambahkan ke Prisma schema.
- Unique constraint `@@unique([tableId, seatNumber])` mencegah dua guest memakai seat yang sama pada meja yang sama.
- Migration PostgreSQL `prisma/migrations/20260912150000_add_guest_seat_assignment/migration.sql`.
- `PATCH /api/guests/[id]` untuk assignment/unassignment meja + kursi.
- Session, entitlement, ownership, capacity, collision, dan transaction validation dilakukan server-side.
### Commits
- `adeb575abdaf923f18d241f153800d7c030012b8`
- `6bf1ee3c96bc8265854be1fcc041742f4dc4126e`
- `2dfd0d2252e0a1c1e400abb8c3dfb6c771535a59`
### Validation
Schema/API code reviewed against `prd.md`, `AGENTS.md`, `README.md`, dan entitlement implementation. Build/CI **Not verified**.

## 18. Interactive Konva Seating Chart & Primary Sidebar Cleanup
### Implemented
- `components/Dashboard/SeatingChart.tsx` menggunakan `react-konva`.
- Roster guest dapat di-drag ke seat kosong; assignment tetap server-authoritative.
- Guest type diperluas dengan `seatNumber`.
- `Galeri & Foto` dan `Musik Undangan` dikeluarkan dari primary sidebar, tetapi tetap tersedia di Studio.
### Commits
- `58d8c4834b56b9d8a77048327fc8210853af2883`
- `bca764705f4c1832d1f5f6fb430bcc12ebe4cb9b`
- `81634833fad01f07e137687cdb2753ab018cf244`
### Validation
Konva dependency dan source-of-truth files reviewed. Build/CI **Not verified**.

## 19. Seating Roster: RSVP Hadir + Tamu Manual
### Implemented
- Enum `GuestSource` dengan `RSVP` dan `MANUAL`.
- Guest manual dibuat melalui server API; RSVP public menandai source RSVP.
- Seating roster hanya memasukkan manual atau RSVP `ATTENDING`.
- Form manual hanya membutuhkan nama tamu; field WhatsApp tidak menjadi requirement.
### Commits
- `ab9446c059744a722da61bd6cd943c9b43c9cb1e`
- `213c013382d8679b51adfa7e37793065395ee450`
- `9f9640892a096e720fe5bb8e1de9c156f04cb5de`
- `7385075e9a9548ba6fb0caa7671a6b5abb3ca43c`
- `927a2896790e4e8a5cc3ab5347b3f87aa3765242`
### Validation
Existing RSVP/guest APIs inspected. Build/CI **Not verified**.

## 20. Configurable Seating Floor Plan Generator
### Implemented
- Setup Denah menerima jumlah meja 1–100 dan bangku per meja 1–50.
- Meja dibuat melalui `/api/wedding-tables` dan disimpan di PostgreSQL.
- Canvas menghitung grid dinamis hingga empat kolom.
- Kapasitas dibaca dari database dan ringkasan meja/bangku mengikuti state server.
### Commits
- `522e53bd0f842c571c449a82a058d4486451a7fa`
- `b39148d69622e1537c08b1ec7d43d773fa1fafb1`
### Validation
Existing API dan Konva implementation inspected. Build/CI **Not verified**.

## 21. Reassign / Move Seated Guests
- Guest yang sudah duduk dapat dipindahkan ke seat kosong pada meja yang sama atau meja lain.
- Seat asal dikeluarkan dari occupied set selama drag.
- Drop invalid mengembalikan posisi visual tanpa mutation.
- Commit: `f088ca3eab59673f89d15a6f14559f34898b3d`.
- Build/CI **Not verified**.

## 22. Seat Target Highlight, Explicit Swap Confirmation & Manual Form Cleanup
- Target seat di-highlight saat drag.
- Drop ke seat terisi meminta `Tukar Posisi` atau `Batal`.
- `POST /api/guests/[id]/swap` melakukan atomic swap melalui Prisma transaction.
- Field WhatsApp pada manual guest form dihapus.
- Commits: `eed3db40ec6fae970911fafde78698a4df04f649`, `38e058f37e1c78eebd0c9b285069ff65ed7ecc63`, `feb720acb53eb2fab2a8b05f099bfad9857baf3c`.
- Build/CI **Not verified**.

## 23. Seating Mutation Fix — Always Resolve the WEDDING Invitation
### Root Cause
Mutation guest/seating sebelumnya dapat memilih invitation owner yang bukan WEDDING.
### Implemented
- `/api/wedding-tables`, `/api/guests`, dan swap selalu resolve `{ ownerId, type: "WEDDING" }`.
- Capacity dan plusOnes dinormalisasi menjadi integer valid.
- WEDDING menjadi canonical database source untuk guest management dan seating.
### Commits
- `3206aa4e67051c9b34c8055e56fee5a3291a4060`
- `4c7b851e3022f4ed1459aff3004ae758b4a0bd9d9`
- `beaebcdf5c9a6c6490c8e3fa8d46dd3a0d9d61c2`
### Validation
Prisma schema dan InvitationType dikonfirmasi. Build/CI **Not verified**.

## 24. Light Theme Palette — Deep Rose Wood / Dusty Pink
### User Requirement
Light mode memakai Deep Rose Wood `#8C4A56`, Dusty Pink `#E8B4B8`, Dark Rose Wood `#6E3843`, Warm White `#FAFAFA`, Pale Blush `#F5EBEB`, dan Charcoal `#1E1B1C`.
### Implemented
- `app/globals.css` semantic light-theme tokens diselaraskan.
- Dashboard dan Invitation Studio dipindahkan dari palette maroon/cream lama ke Rose Wood/Pale Blush.
- `AGENTS.md`, `prd.md`, dan `README.md` mendokumentasikan palette yang sama.
### Commits
- `5083493c1ceac3fa120328f2c911515aa3738263`
- `221bc714fcd6e6f1fab42595023aeb39c557c0a9`
- `2b5bb257051b327e14cb73af323892d0213f2dae`
- `c2d28c21d527175ae524ab6ec16aec3d97f34f93`
### Validation
Source-of-truth files reviewed dan runtime tokens inspected. Build/CI **Not verified**.

# 2026-09-13 — Visual System Refresh

## 25. Front Page, Dashboard Shell, Components & Navigation Redesign
### User Requirement
Seluruh front page, dashboard shell, component surface, submenu, dan public navigation menggunakan visual system DC Organizer yang baru. Front page memakai motion yang halus, premium, dan tidak mengganggu.

### Design Direction
- Editorial, premium, warm, minimal, dan data-oriented.
- Primary action: Deep Rose Wood `#8C4A56`.
- Supporting accent: Dusty Pink `#E8B4B8`.
- Surface: Warm White `#FAFAFA` dan Pale Blush `#F5EBEB`.
- Functional text: Charcoal `#1E1B1C`; accent dipakai secara selektif.
- Existing routes, entitlement logic, database source of truth, dan feature implementations dipertahankan.

### Front Page
- `app/page.tsx` direbuild menjadi hero editorial, workspace preview, product story tiga layer, dan CTA.
- Package `motion` yang sudah tersedia digunakan melalui `motion/react`; dependency baru tidak diperlukan.
- Hero entrance, section reveal, staggered cards, hover lift, dan CTA micro-interaction menggunakan transform/opacity.
- `useReducedMotion()` digunakan untuk accessibility.
- Easing natural memakai `[0.22, 1, 0.36, 1]`; interactive cards memakai spring.
- Pintu dipertahankan sebagai navigation surface karena merupakan interaction utama untuk memilih Wedding Planner, Digital Invitation, atau Guestbook.

### Dashboard & Component Layer
- `app/design-overrides.css` ditambahkan sebagai visual layer terpusat sehingga feature components dapat dipertahankan.
- Sidebar, header, cards, tables, dialogs, inputs, focus states, hover states, dan floating action diselaraskan dengan semantic theme tokens.
- Dashboard page entrance memakai motion CSS ringan; interaction memakai transform-only transitions.
- `FeatureGate`, RSVP, Invitation Management, Event Panel, Seating Chart, dan Usher flows tidak dihapus atau diganti secara fungsional.
- `app/layout.tsx` memuat visual layer setelah `globals.css`.

### Public Navigation & Submenu
- `components/Layout/Navbar/Navbar.tsx` direfresh dengan brand hierarchy baru.
- `components/Layout/Navbar/BurgerMenuContent.tsx` direfresh menjadi navigation sheet dengan grouping layanan, descriptions, dan action affordances.
- Brand reference pada submenu menggunakan `DC Organizer`.

### Commits
- `70768bcb325a6e7cddb4cee7b9b4ed99fb8e5d2c` — add application-wide visual refresh layer.
- `e4700c63fc8754af49724a1bf47503b6bac02f01` — load visual refresh layer from root layout.
- `616cbbe52c5b9cc6bb847ea64fb6b190e5058889` — redesign landing page and activate accessible motion.
- `11fe1cd84414c03297592c9cb02aae46e543b072` — refresh public navbar.
- `eed0091304d677f3a954ab942a02d89eb6d479e3` — refresh public submenu/product navigation.

### Validation
- Source-of-truth documents, landing page, dashboard shell, global theme tokens, navbar, submenu, and package configuration were reviewed before implementation.
- Existing `motion` package verified from `package.json`.
- Existing routes and entitlement/data logic were not intentionally removed.
- Build/CI: **Not verified**.

## 26. Landing Background Refinement & Pintu Preservation
### User Requirement
Landing page terasa terlalu blurry karena ambient pink berbentuk lingkaran. User mengizinkan redesign background, tetapi **rose petals tidak boleh diganggu** dan Pintu harus tetap menjadi navigation utama.

### Implemented
- `components/Layout/background.tsx` mengganti ambient pink blobs menjadi layered radial/linear light wash yang lebih tipis dan directional.
- Tidak ada large circular pink glow yang dominan di belakang hero.
- Animasi, jumlah, bentuk, warna, timing, dan shadow rose petals dipertahankan.
- `app/page.tsx` mempertahankan Pintu sebagai focal navigation untuk tiga workspace.
- Hero menggunakan tagline canonical: **“DC Organizer, your best consultant for wedding & event.”**
- Tidak menambahkan dependency baru.

### Commits
- `638f47e667778dd33be97643ad22213210ae35e9` — refine landing ambient background without changing rose petals.

### Validation
- Background source reviewed after change; rose-petal block intentionally preserved.
- Build/CI: **Not verified**.

## 27. Landing Single-Viewport Simplification & Workspace Copy Removal
### User Requirement
Landing diminta menjadi **satu halaman/viewport** tanpa scroll section lanjutan. Copy `Choose your workspace` dan `Buka pintu yang kamu butuhkan.` dihilangkan agar Pintu langsung menjadi visual navigation utama.

### Implemented
- `app/page.tsx` disederhanakan menjadi satu hero viewport dengan tinggi `calc(100dvh - 88px)` dan `overflow-hidden`.
- Section lanjutan product story dan CTA dihapus dari landing agar tidak ada vertical page scrolling.
- Copy `Choose your workspace` dan `Buka pintu yang kamu butuhkan.` dihapus dari landing.
- Hero tetap mempertahankan tagline canonical, CTA, product capability metadata, dan Pintu.
- `components/Pintu/PintuSection.tsx` disesuaikan tingginya agar Pintu tetap muat di viewport desktop/mobile tanpa mengubah route atau interaction model.
- Pintu tetap menyediakan tiga tujuan: Wedding Planner, Digital Invitation, dan Guestbook.
- Rose petals tetap untouched.
- Tidak menambahkan dependency baru.

### Commits
- `ff6e56a2d807b7002726e2b061b3033e1ac5a922` — simplify landing into single viewport experience.
- `1181f3ed13adf807b44bee97cfcdf0ce86e2a765` — fit Pintu navigation to single viewport landing.

### Validation
- `app/page.tsx` dan `components/Pintu/PintuSection.tsx` reviewed after implementation.
- Build/CI: **Not verified**.

## 28. Landing Background Continuity — Remove Hero Surface Boundary
### User Requirement
Navbar dibuat menyatu dengan background landing, tetapi masih terlihat jeda/kotak pembatas antara navbar/background dan area hero.

### Root Cause
Landing `app/page.tsx` masih memberikan `bg-[var(--background)]` pada wrapper hero. Karena `RomanticBackground` juga berada di dalam hero sementara navbar berada di luar wrapper tersebut, warna surface hero membentuk bidang opaque yang memutus kontinuitas visual background.

### Implemented
- `bg-[var(--background)]` di wrapper landing `app/page.tsx` dihapus.
- `RomanticBackground` tetap menjadi background visual landing dan rose petals tidak disentuh.
- Struktur viewport, Pintu, CTA, routes, dan interaction model tidak diubah.
- Navbar tetap menggunakan surface transparan/non-sticky yang sudah ada; perbaikan kali ini menghilangkan sumber boundary dari hero itu sendiri.

### Commit
- `5ead256324e6c5d1e07c66066eb58ea6f6e57d15` — fix landing background continuity.

### Validation
- `AGENTS.md`, `SKILL.md`, `prd.md`, `PRD-TAMBAHAN.md`, `README.md`, `app/layout.tsx`, `components/Layout/PublicAtmosphere.tsx`, dan `app/page.tsx` reviewed before the change.
- Code-level review completed.
- Build/CI: **Not verified**.

## 29. Dynamic Pintu Story + Motion Polish
### User Requirement
Copy di sisi kiri landing harus kembali mengikuti Pintu yang sedang dipilih. Saat Pintu berubah, area kiri harus menjelaskan fungsi workspace tersebut. Pintu juga diminta memiliki animasi yang lebih hidup menggunakan Motion.

### Implemented
- `app/page.tsx` sekarang memiliki konten kontekstual untuk setiap Pintu: Wedding Planner, Digital Invitation, dan Guestbook.
- Pergantian konten kiri memakai `AnimatePresence mode="wait"` dengan enter/exit berbasis opacity + y transform.
- CTA kiri mengikuti workspace aktif dan langsung menuju route Pintu terkait.
- `PintuSection.tsx` menggunakan Motion spring untuk perpindahan Pintu dengan `stiffness: 400`, `damping: 25`, transform 3D (`x`, `z`, `rotateY`, `scale`), opacity, dan hover lift ringan.
- `PintuCard.tsx` menggunakan Motion untuk hover/tap, zoom gambar halus, panel pintu membuka dengan transform, dan reveal informasi aktif.
- `useReducedMotion()` dipakai pada Pintu Section dan diteruskan ke card agar motion berat dilewati saat reduced-motion aktif.
- Tidak menambahkan dependency baru; package `motion` yang sudah ada digunakan.
- Pintu tetap menjadi navigation utama dan seluruh route existing dipertahankan.

### Commits
- `627dd521da8df3e19881042a2600395efad40e2d` — restore dynamic landing story per selected Pintu.
- `743e870e469b76702608e904d1de44e37132b393` — animate Pintu navigation with Motion springs.
- `3d8db676f978db98b145e55a52893430161edcb0` — polish Pintu card opening and hover motion.

### Validation
- `app/page.tsx`, `components/Pintu/PintuSection.tsx`, dan `components/Pintu/PintuCard.tsx` reviewed against `AGENTS.md`, `prd.md`, `README.md`, dan `SKILL.md`.
- Build/CI: **Not verified**.

# Current Source-of-Truth Order

1. `AGENTS.md` — coding/design-system constraints.
2. `prd.md` — product requirements and product decisions.
3. `PRD-TAMBAHAN.md` — implementation history and validation record.
4. `README.md` — public technical overview and architecture.
5. Database/schema/API implementation — runtime source of truth.

# Current Non-Negotiable Product Rules

- Brand tetap **DC Organizer**; jangan mengembalikan legacy brand Citin atau DC Wedding pada UI baru.
- `/dashboard` dan Beranda tidak boleh dihapus.
- Database adalah single source of truth.
- Tidak boleh ada fake/mock invitation data.
- Jangan membuat duplicate form untuk data inti yang sudah ada di database.
- Couple names harus konsisten antara WEDDING dan Event Khusus.
- Couple names pada Rangkaian Acara read-only.
- Authorization wajib server-side.
- UI entitlement harus mencerminkan server entitlement.
- Extend Over Replace.
- Legacy route dipertahankan jika dibutuhkan untuk backward compatibility.
- Event URL canonical menggunakan nama event sebagai path.
- Password protection berlaku konsisten untuk root dan event path.
- Asset custom mengikuti entitlement dan package limits.
- Usher App/check-in onsite tetap Guest Book.
- Pintu tetap menjadi navigation surface landing page dan tidak boleh dihapus tanpa instruksi eksplisit.
- Rose petals pada `components/Layout/background.tsx` tidak boleh diubah tanpa instruksi eksplisit.
- Motion wajib performance-first, memakai transform/opacity, menghormati reduced motion, dan tidak mengorbankan usability.

# Current Public URL Rules

| Resource | Canonical URL |
|---|---|
| Main Wedding | `https://[nama-pasangan].dcwedding.com/` |
| Event Khusus | `https://[nama-pasangan].dcwedding.com/[nama-event]` |
| Dashboard | `/dashboard` |
| Undangan Digital | `/dashboard/undangan-digital` |
| Studio | `/dashboard/editor` |
| Legacy Event Khusus | `/event-khusus` |
| Legacy internal invitation | `/invite/[slug]` |