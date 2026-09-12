# DC Wedding — PRD Implementation Addendum

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
- Floating WhatsApp button tidak diubah pada perubahan ini karena scope yang diklarifikasi user adalah tulisan kiri bawah.
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
- PostgreSQL migration ditambahkan: `prisma/migrations/20260912150000_add_guest_seat_assignment/migration.sql`.
- Endpoint baru `PATCH /api/guests/[id]` untuk assignment/unassignment meja + kursi.
- Endpoint memverifikasi user/session dan entitlement DIGITAL_INVITATION server-side.
- Endpoint memastikan table berasal dari invitation user yang sama.
- Seat number harus integer >= 1 dan tidak boleh melebihi kapasitas meja.
- Meja penuh ditolak.
- Seat yang sudah digunakan ditolak.
- Assignment disimpan dalam Prisma transaction.
- Unassign mengosongkan `tableId` dan `seatNumber` secara bersamaan.
### Entitlement Impact
- DIGITAL_INVITATION: full access.
- GUEST_BOOK: mewarisi guest management melalui entitlement model.
- NONE: tetap locked.
### Commits
- `adeb575abdaf923f18d241f153800d7c030012b8` — Prisma seat persistence/schema.
- `6bf1ee3c96bc8265854be1fcc041742f4dc4126e` — seat assignment migration.
- `2dfd0d2252e0a1c1e400abb8c3dfb6c771535a59` — atomic guest placement API.
### Validation
- Schema/API code reviewed against `prd.md`, `AGENTS.md`, `README.md`, and existing entitlement implementation.
- Build/CI: **Not verified**.
- UI drag-and-drop Konva integration belum diklaim selesai; endpoint/data layer ini merupakan foundation untuk wiring visual seating chart berikutnya.

## 18. Interactive Konva Seating Chart & Primary Sidebar Cleanup
### PRD Requirement / Gap
PRD meminta visual 2D seating chart berbasis Konva, side roster tamu yang dapat di-drag, penempatan ke seat kosong, serta Galeri & Foto dan Musik Undangan dikeluarkan dari primary sidebar.

### Implemented
- Komponen baru `components/Dashboard/SeatingChart.tsx` menggunakan `react-konva`.
- Roster tamu yang belum memiliki `tableId` dapat di-drag ke canvas.
- Canvas menampilkan meja dan seat berdasarkan `Table.capacity`.
- Drop dihitung berdasarkan koordinat canvas dan hanya diterima jika mengenai seat kosong.
- Assignment memanggil `PATCH /api/guests/[id]` sehingga persistence tetap server-authoritative.
- Setelah assignment berhasil, dashboard melakukan refresh data sehingga roster dan chart kembali sinkron dengan database.
- Guest type pada dashboard diperluas dengan `seatNumber`.
- `Galeri & Foto` dan `Musik Undangan` dihapus dari array primary sidebar serta tab dashboard yang sebelumnya menampilkannya.
- Fitur Galeri/Musik tidak dihapus dari Studio; dashboard hanya tidak lagi menjadikannya menu primary sesuai PRD.
- Floating WhatsApp button tetap dipertahankan karena perubahan sebelumnya sudah diklarifikasi user hanya menyasar tulisan support copy kecil di sidebar.

### Entitlement Impact
- Seating UI tetap berada di `FeatureGate` Digital Invitation.
- Guest Book mewarisi guest management sesuai access model yang sudah ada.
- Server API tetap menjadi authority; UI tidak dapat melewati entitlement.
- Galeri/Musik tetap mengikuti entitlement Studio dan tidak dihapus dari fitur produk.

### Commits
- `58d8c4834b56b9d8a77048327fc8210853af2883` — initial Konva seating chart component.
- `bca764705f4c1832d1f5f6fb430bcc12ebe4cb9b` — fix canvas drop target coordinate resolution.
- `81634833fad01f07e137687cdb2753ab018cf244` — wire seating chart into dashboard and remove legacy primary sidebar entries.

### Validation
- `package.json` reviewed: `konva` dan `react-konva` memang sudah menjadi dependency repository.
- `AGENTS.md`, `prd.md`, `PRD-TAMBAHAN.md`, dan `README.md` dibaca ulang sebelum perubahan.
- Combined commit status untuk `81634833fad01f07e137687cdb2753ab018cf244` tidak memiliki status checks yang tersedia.
- Build/CI: **Not verified**. Tidak diklaim PASS.

# Current Source-of-Truth Order

1. `AGENTS.md` — coding/design-system constraints.
2. `prd.md` — product requirements and product decisions.
3. `PRD-TAMBAHAN.md` — implementation history and validation record.
4. `README.md` — public technical overview and architecture.
5. Database/schema/API implementation — runtime source of truth.

# Current Non-Negotiable Product Rules

- Brand tetap **DC Wedding**; jangan mengganti menjadi Citin.
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

# Current Public URL Rules

| Resource | Canonical URL |
|---|---|
| Main Wedding | `https://[nama-pasangan].dcwedding.com/` |
| Event Khusus | `https://[nama-pasangan].dcwedding.com/[nama-event]` |
| Digital Invitation Workspace | `/dashboard/undangan-digital` |
| Studio | `/dashboard/editor` |
| Legacy special-event alias | `/event-khusus` |
| Legacy internal invitation route | `/invite/[slug]` |

# Current Entitlement Summary

| Feature | NONE | DIGITAL_INVITATION | GUEST_BOOK |
|---|---:|---:|---:|
| Studio / template | Open | Open | Open |
| Publish invitation | Locked | Open | Open |
| Custom assets | Locked | Open | Open |
| Custom subdomain | Locked | Open | Open |
| Dual invitations | Locked | Open | Open |
| Password protection | Locked | Open | Open |
| RSVP analytics/export | Basic/read-only | Full | Full |
| Guest management | Locked | Full | Full |
| QR guest ticket | Locked | Open | Open |
| Usher App / onsite check-in | Locked | Locked | Included |
| Onsite hardware | Locked | Locked | Included |
| Onsite tech support | Locked | Locked | Included |

# Known / Explicitly Untracked Items

- Angpao/Kado tracking dan status pengiriman QR belum fully tracked karena schema/API tracking belum lengkap.
- UI tidak boleh mengarang tracking state.
- Interactive seating chart UI Konva/drag-and-drop sekarang sudah wired ke endpoint `PATCH /api/guests/[id]`; peningkatan layout untuk jumlah meja di atas enam dan drag/reassignment guest yang sudah ditempatkan masih dapat dilanjutkan.
- Seat-level persistence tersedia melalui `Guest.seatNumber`.
- Galeri & Foto dan Musik Undangan sudah dikeluarkan dari primary sidebar; fitur tetap dikelola melalui Studio.

# Validation / CI Status

Latest implementation commits in this addendum:
- `58d8c4834b56b9d8a77048327fc8210853af2883`
- `bca764705f4c1832d1f5f6fb430bcc12ebe4cb9b`
- `81634833fad01f07e137687cdb2753ab018cf244`

Build/CI untuk perubahan terbaru: **Not verified**. Combined status tidak menyediakan checks pada commit dashboard terbaru. Jangan menyatakan PASS sebelum workflow/check yang nyata tersedia.

# Working Protocol for Next Changes

Sebelum coding:
1. Baca ulang `AGENTS.md`.
2. Baca ulang `prd.md`.
3. Baca ulang `PRD-TAMBAHAN.md`.
4. Baca ulang `README.md`.
5. Inspect implementation/API/schema relevan.
6. Extend existing implementation; jangan replace feature yang bekerja tanpa instruksi.
7. Lakukan validation yang tersedia.
8. Catat perubahan di `PRD-TAMBAHAN.md` dengan rationale, entitlement, commit, dan validation.
9. Sinkronkan PRD/README bila keputusan arsitektur berubah.
10. Jangan mengklaim build/CI yang belum diverifikasi.
