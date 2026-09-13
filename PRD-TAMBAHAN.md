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
Yang diminta user untuk dihapus adalah tulisan kecil di kiri bawah sidebar: `Butuh bantuan?` dan `Chat WhatsApp di kanan bawah.`
### Implemented
- Blok support copy dihapus dari `app/[dashboard]/page.tsx`.
- Workspace, navigation, entitlement, dan data flow tidak diubah.
- Floating WhatsApp button tidak diubah.
### Commit
- `5d771d1206dfee3b651c043da0182b369cf50dd5`.
### Validation
Code-level review; build/CI **Not verified**.

## 17. Guest Seat Assignment Persistence & Placement API
- `Guest.seatNumber Int?` ditambahkan ke Prisma schema.
- Unique constraint `@@unique([tableId, seatNumber])` mencegah collision.
- Migration PostgreSQL `20260912150000_add_guest_seat_assignment`.
- `PATCH /api/guests/[id]` untuk assignment/unassignment meja + kursi.
- Session, entitlement, ownership, capacity, collision, dan transaction validation server-side.
- Commits: `adeb575abdaf923f18d241f153800d7c030012b8`, `6bf1ee3c96bc8265854be1fcc041742f4dc4126e`, `2dfd0d2252e0a1c1e400abb8c3dfb6c771535a59`.
- Build/CI **Not verified**.

## 18. Interactive Konva Seating Chart & Primary Sidebar Cleanup
- `components/Dashboard/SeatingChart.tsx` menggunakan `react-konva`.
- Roster guest dapat di-drag ke seat kosong; assignment server-authoritative.
- Guest type diperluas dengan `seatNumber`.
- `Galeri & Foto` dan `Musik Undangan` dikeluarkan dari primary sidebar, tetapi tetap tersedia di Studio.
- Commits: `58d8c4834b56b9d8a77048327fc8210853af2883`, `bca764705f4c1832d1f5f6fb430bcc12ebe4cb9b`, `81634833fad01f07e137687cdb2753ab018cf244`.
- Build/CI **Not verified**.

## 19. Seating Roster: RSVP Hadir + Tamu Manual
- Enum `GuestSource` dengan `RSVP` dan `MANUAL`.
- Guest manual dibuat melalui server API; RSVP public menandai source RSVP.
- Seating roster hanya memasukkan manual atau RSVP `ATTENDING`.
- Form manual hanya membutuhkan nama tamu; field WhatsApp bukan requirement.
- Commits: `ab9446c059744a722da61bd6cd943c9b43c9cb1e`, `213c013382d8679b51adfa7e37793065395ee450`, `9f9640892a096e720fe5bb8e1de9c156f04cb5de`, `7385075e9a9548ba6fb0caa7671a6b5abb3ca43c`, `927a2896790e4e8a5cc3ab5347b3f87aa3765242`.
- Build/CI **Not verified**.

## 20. Configurable Seating Floor Plan Generator
- Setup Denah menerima jumlah meja 1–100 dan bangku per meja 1–50.
- Meja dibuat melalui `/api/wedding-tables` dan disimpan di PostgreSQL.
- Canvas menghitung grid dinamis hingga empat kolom.
- Kapasitas dibaca dari database.
- Commits: `522e53bd0f842c571c449a82a058d4486451a7fa`, `b39148d69622e1537c08b1ec7d43d773fa1fafb1`.
- Build/CI **Not verified**.

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
- `/api/wedding-tables`, `/api/guests`, dan swap selalu resolve `{ ownerId, type: "WEDDING" }`.
- Capacity dan plusOnes dinormalisasi menjadi integer valid.
- WEDDING menjadi canonical database source untuk guest management dan seating.
- Commits: `3206aa4e67051c9b34c8055e56fee5a3291a4060`, `4c7b851e3022f4ed1459aff3004ae758b4a0bd9d9`, `beaebcdf5c9a6c6490c8e3fa8d46dd3a0d9d61c2`.
- Build/CI **Not verified**.

## 24. Light Theme Palette — Deep Rose Wood / Dusty Pink
- Light mode memakai `#8C4A56`, `#E8B4B8`, `#6E3843`, `#FAFAFA`, `#F5EBEB`, `#1E1B1C`.
- `app/globals.css`, dashboard, Invitation Studio, `AGENTS.md`, `prd.md`, dan `README.md` diselaraskan.
- Commits: `5083493c1ceac3fa120328f2c911515aa3738263`, `221bc714fcd6e6f1fab42595023aeb39c557c0a9`, `2b5bb257051b327e14cb73af323892d0213f2dae`, `c2d28c21d527175ae524ab6ec16aec3d97f34f93`.
- Build/CI **Not verified**.

# 2026-09-13 — Visual System Refresh

## 25. Front Page, Dashboard Shell, Components & Navigation Redesign
- Front page, dashboard shell, component surface, submenu, dan public navigation memakai visual system DC Organizer baru.
- Design direction: editorial, premium, warm, minimal, data-oriented.
- Front page menggunakan `motion/react`, hero entrance, reveal, stagger, hover lift, CTA micro-interaction, dan `useReducedMotion()`.
- Pintu dipertahankan sebagai navigation surface untuk Wedding Planner, Digital Invitation, dan Guestbook.
- `app/design-overrides.css` menjadi visual layer terpusat; feature components dan entitlement/data flow dipertahankan.
- Navbar dan submenu direfresh dengan brand hierarchy DC Organizer.
- Commits: `70768bcb325a6e7cddb4cee7b9b4ed99fb8e5d2c`, `e4700c63fc8754af49724a1bf47503b6bac02f01`, `616cbbe52c5b9cc6bb847ea64fb6b190e5058889`, `11fe1cd84414c03297592c9cb02aae46e543b072`, `eed0091304d677f3a954ab942a02d89eb6d479e3`.
- Build/CI **Not verified**.

## 26. Landing Background Refinement & Pintu Preservation
- Ambient pink blobs diganti layered radial/linear light wash yang lebih tipis dan directional.
- Rose petals di `components/Layout/background.tsx` tidak diubah.
- Pintu tetap menjadi focal navigation.
- Commit: `638f47e667778dd33be97643ad22213210ae35e9`.
- Build/CI **Not verified**.

## 27. Landing Single-Viewport Simplification & Workspace Copy Removal
- Landing menjadi satu viewport dengan `calc(100dvh - 88px)` dan `overflow-hidden`.
- Section lanjutan dan copy `Choose your workspace` / `Buka pintu yang kamu butuhkan.` dihapus.
- Pintu tetap menyediakan Wedding Planner, Digital Invitation, Guestbook.
- Rose petals untouched.
- Commits: `ff6e56a2d807b7002726e2b061b3033e1ac5a922`, `1181f3ed13adf807b44bee97cfcdf0ce86e2a765`.
- Build/CI **Not verified**.

## 28. Landing Background Continuity — Remove Hero Surface Boundary
### User Requirement
Navbar dibuat menyatu dengan background landing, tetapi masih terlihat jeda/kotak pembatas antara navbar/background dan area hero.
### Implemented
- `bg-[var(--background)]` pada wrapper landing `app/page.tsx` dihapus.
- `RomanticBackground` tetap menjadi background visual landing dan rose petals tidak disentuh.
- Struktur viewport, Pintu, CTA, routes, dan interaction model tidak diubah.
- Navbar tetap transparan/non-sticky.
### Commit
- `5ead256324e6c5d1e07c66066eb58ea6f6e57d15`.
### Validation
- Source-of-truth docs dan landing implementation reviewed.
- Code-level review completed.
- Build/CI **Not verified**.

## 29. Dynamic Pintu Story + Motion Polish
### User Requirement
Copy kiri landing mengikuti Pintu yang sedang dipilih dan Pintu diberi animasi Motion yang lebih hidup.
### Implemented
- `app/page.tsx` memiliki konten kontekstual untuk Wedding Planner, Digital Invitation, dan Guestbook.
- `AnimatePresence mode="wait"` untuk enter/exit opacity + y.
- CTA kiri mengikuti workspace aktif.
- `PintuSection.tsx` memakai Motion spring, transform 3D, dan hover lift.
- `PintuCard.tsx` memakai hover/tap, image zoom, panel opening, dan active info reveal.
- `useReducedMotion()` dipakai.
- Tidak menambah dependency; Pintu tetap navigation utama.
### Commits
- `627dd521da8df3e19881042a2600395efad40e2d`
- `743e870e469b76702608e904d1de44e37132b393`
- `3d8db676f978db98b145e55a52893430161edcb0`
### Validation
- `app/page.tsx`, `PintuSection.tsx`, dan `PintuCard.tsx` reviewed against required docs.
- Build/CI **Not verified**.

## 30. Pintu Continuous Loop & Duplicate Label Cleanup
- Label hitam duplikat di bawah Pintu dihapus.
- Autoplay loop `1 → 2 → 3 → 1` ditambahkan.
- Hover menghentikan autoplay; pointer keluar melanjutkan.
- `useReducedMotion()` menonaktifkan autoplay.
- Rose petals, route, dan dependency tidak diubah.
- Commit: `7255daa9e0de2f44be9143979a8b08ac7667fc31`.
- Build/CI **Not verified**.

## 31. Pintu Circular Motion Loop — Hover Pause & Direct Link
- Loop berbasis shared `MotionValue` orbit dengan `useMotionValue`, `useTransform`, dan `animate(..., repeat: Infinity)`.
- Tiga Pintu bergerak pada orbit horizontal dengan x/y/z/scale/rotateY.
- Hover pause dan direct link via `next/link` dipertahankan.
- Tombol previous/next dihapus.
- Reduced motion tetap dihormati.
- Rose petals tidak diubah.
- Commits: `ae8949d9a65b56d89b5537a207da803a239a76ad`, `6d825ea64a721ced97afea63257fb7efa58d37a3`.
- Build/CI **Not verified**.

## 32. Pintu Card Text Fit & Image Framing Refinement
- Mobile card width dinaikkan dari `170px` menjadi `190px`.
- Tags memakai wrapping/break-words.
- Title/description diberi `max-w-full`, `break-words`, dan leading lebih rapat.
- Image rendering memakai `next/image` dan framing yang lebih aman; gradient dipisahkan sebagai overlay.
- Direct link dan reduced motion dipertahankan.
- Tidak menambah dependency; rose petals untouched.
- Commit: `527c68dcb37f640bfca393eff5f153d1b1864702`.
- Build/CI **Not verified**.

## 33. Pintu Uniform Image/Card Scale
- Dynamic scale berdasarkan posisi orbit sebelumnya dihapus.
- Semua Pintu menggunakan scale card konstan `0.92` sepanjang loop.
- x/y/z/rotateY tetap berubah untuk efek circular/3D.
- Hover pause, direct-link, reduced-motion, dan routes tetap dipertahankan.
- Rose petals tidak disentuh.
- Commit: `8b276ceda76dfdcd9205547b4930d2e555b547f8`.
- Build/CI **Not verified**.

## 34. Pintu Image Fill, Slower Loop & Depth-Based Back Scale
### User Requirement
Image Pintu masih terlihat memiliki background abu-abu/ruang kosong sehingga kurang memenuhi frame. User juga meminta motion sedikit diperlambat dan Pintu yang bergerak ke belakang diperkecil lagi.
### Implemented
- `components/Pintu/PintuCard.tsx` image layer diubah menjadi `object-cover` agar gambar lebih penuh mengisi bidang pintu dan mengurangi area kosong/background yang terlihat.
- Active image memakai scale internal `1`, sedangkan inactive image `0.82` untuk menjaga framing visual tetap kuat tanpa kembali membuat image berbeda ukuran antar asset saat active.
- `components/Pintu/PintuSection.tsx` loop duration diperlambat dari `7s` menjadi `9s` sehingga perpindahan terasa lebih tenang.
- Scale card sekarang mengikuti depth orbit: `FRONT_SCALE = 0.92` dan `BACK_SCALE = 0.68`. Saat Pintu berada di belakang, card mengecil; saat mendekati depan, kembali membesar secara halus.
- x/y/z/rotateY tetap menggunakan MotionValue dan `useTransform`; hover pause, direct link, reduced motion, dan route Pintu tetap dipertahankan.
- Tidak menambahkan dependency baru.
- Rose petals di `components/Layout/background.tsx` tidak disentuh.
### Commits
- `fc0630d219717cac7c87afddd6b6c8588a5ddc02` — improve Pintu image fill/framing.
- `d409996d764936c8a8d3ee3a5d6f04f19e926e95` — slow loop and add depth-based back scaling.
### Validation
- `AGENTS.md`, `SKILL.md`, `prd.md`, `PRD-TAMBAHAN.md`, `README.md`, `PintuSection.tsx`, dan `PintuCard.tsx` reviewed before implementation.
- Code-level review completed.
- Build/CI: **Not verified**.
