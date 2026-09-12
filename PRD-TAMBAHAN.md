# DC Wedding — PRD Implementation Addendum

Dokumen ini adalah **implementation log / PRD tambahan** untuk repository `wanzy0808/DC`.

- `prd.md` = **Master Product Requirements Document / Product Source of Truth**.
- `PRD-TAMBAHAN.md` = **catatan implementasi, perubahan keputusan, alasan, entitlement impact, commit, dan validation**.
- `AGENTS.md` = **coding + design-system rules** yang wajib dipatuhi sebelum implementasi.
- `README.md` = **technology stack + arsitektur publik tingkat tinggi**.

## Aturan Dokumentasi

Setiap perubahan produk/teknis baru wajib dicatat di dokumen ini tanpa menghapus history sebelumnya. Minimal catatan perubahan mencakup:

1. Feature / UI / API / routing / database change.
2. Rationale atau alasan perubahan.
3. Entitlement / package impact bila ada.
4. Commit SHA terkait.
5. Build / CI / validation status yang benar-benar sudah diverifikasi.

Jangan menyatakan build berhasil hanya berdasarkan perubahan kode. Jika GitHub Actions atau validation belum tersedia, status harus ditulis **Not verified / Not run**.

---

# 2026-09-12 — Implementation History

## 1. Invitation Password Protection

### Implemented
- Menambahkan password protection pada `Invitation`.
- Menambahkan migration dan penyimpanan password menggunakan bcrypt hashing.
- Menambahkan signed access cookie untuk sesi akses invitation yang sudah tervalidasi.
- Menambahkan owner settings API dan public password verification endpoint.
- Menambahkan public password gate.
- Sanitasi response agar `passwordHash` tidak pernah dikirim sebagai data publik.
- Dashboard menyediakan pengaturan password invitation.
- Satu password melindungi root invitation dan event path pada subdomain yang sama.

### Entitlement Impact
- Password Protection tetap mengikuti entitlement **DIGITAL_INVITATION** / **GUEST_BOOK** sesuai package model pada `prd.md`.

### Commit
- `fc11e21`
- `cc99458`
- `cdba01f`

### Validation
- Implementation completed.
- GitHub Actions/build result untuk rangkaian perubahan ini tidak diklaim berhasil apabila run belum tersedia.

---

## 2. RSVP Analytics & Guest Actions

### Implemented
- RSVP metrics.
- RSVP analytics table.
- Search dan sorting.
- CSV export.
- QR guest ticket modal.
- Manual server-side check-in.
- Check-in menggunakan atomic update untuk mencegah duplicate check-in.

### Entitlement Impact
- RSVP analytics dan guest actions mengikuti entitlement **DIGITAL_INVITATION**.
- QR guest ticket tersedia untuk **DIGITAL_INVITATION** dan **GUEST_BOOK**.
- Usher App dan onsite check-in tetap khusus **GUEST_BOOK**.

### Validation
- Implementation recorded.
- Build/CI tidak boleh dinyatakan PASS tanpa hasil validation yang nyata.

---

## 3. Guest Management Entitlement

### Implemented
- Manajemen Tamu menggunakan entitlement **DIGITAL_INVITATION**.
- Edit/hapus tamu, nomor meja, dan seat assignment mengikuti Digital Invitation.
- Usher App tetap menggunakan entitlement **GUEST_BOOK**.
- Menghapus blocking popup lama yang menghalangi workspace Manajemen Tamu.

### Rationale
Manajemen Tamu merupakan bagian dari workflow digital guest-management dan tidak seharusnya tertutup oleh guard lama yang tidak sesuai dengan package entitlement terbaru.

### Validation
- Server-side authorization tetap menjadi source of truth.
- UI gate harus mengikuti entitlement server-side.

---

## 4. Dashboard Invitation Feature Restoration

### Implemented
- Mengembalikan workspace **Undangan Digital**.
- Mengembalikan Galeri & Foto serta Musik Undangan sebagai bagian dari workflow Studio/asset management.
- Dashboard menyediakan WEDDING dan ADAT_AKAD.
- Preview.
- Salin Link.
- Edit Desain.
- Publish / Unpublish.
- Asset management.
- Password Protection.
- Route/menu **Beranda** dan `/dashboard` tetap dipertahankan.

### Rationale
Feature restoration dilakukan untuk mempertahankan functionality yang sudah ada dan memenuhi aturan **Extend Over Replace**. Fitur yang bekerja tidak boleh dihapus hanya karena struktur dashboard sedang direfactor.

### Commit
- `7312929`
- `be89ba4`

### Validation
- Feature restoration implemented.
- GitHub Actions/build belum boleh diklaim PASS tanpa run yang terverifikasi.

---

## 5. Invitation Studio

### Implemented
- Studio mendukung deep link `?type=ADAT_AKAD`.
- Upload custom asset divalidasi server-side menggunakan entitlement Digital Invitation.
- Maksimal **30 foto per invitation** dan **1 musik custom**.
- Menghapus initial state contoh seperti Rio, Lyvia, venue, tanggal, dan deskripsi.
- Studio membaca data event dari database dan tidak menjadi sumber input ulang untuk data inti.
- Preview mendukung alamat dan Maps.
- Preview aman ketika tanggal belum tersedia.
- Undo/Redo ikut memulihkan dekorasi.

### Rationale
Studio harus menjadi editor presentation/design, sedangkan data inti event tetap berasal dari database sebagai single source of truth.

### Entitlement Impact
- Custom assets: **DIGITAL_INVITATION** dan **GUEST_BOOK**.
- Limit asset mengikuti package model di `prd.md`.

---

## 6. Centralized Event Data / Single Source of Truth

### Implemented
- `EventPanel` menjadi editor utama data rangkaian acara untuk WEDDING dan ADAT_AKAD.
- Data yang disimpan pada `Invitation` mencakup nama pasangan, tanggal, timezone, waktu, venue, alamat, Maps, deskripsi, dan catatan.
- Nama pasangan berasal dari onboarding dan bersifat read-only pada Rangkaian Acara.
- ADAT_AKAD menggunakan data pasangan WEDDING bila draft belum memiliki data pasangan sendiri.
- Tidak membuat duplicate form untuk data yang sudah tersedia di database.

### Rationale
Database adalah single source of truth. Browser cookie/localStorage tidak boleh menjadi sumber data inti dan Studio tidak boleh meminta user memasukkan ulang data yang sudah tersimpan.

---

## 7. Dashboard Onboarding Fix

### Implemented
- Memperbaiki race condition onboarding.
- Memastikan invitation WEDDING tersedia sebelum penyimpanan data onboarding.
- Onboarding menyimpan nama pasangan ke WEDDING.
- Nickname disimpan ke `User.firstName`.
- Modal hanya muncul ketika data wajib belum lengkap.
- Setelah onboarding tersimpan, modal tidak meminta setup ulang pada login berikutnya.
- Menghapus implementasi onboarding duplikat pada `DashboardGate`.
- Nickname dashboard membaca `User.firstName`, bukan cookie/localStorage.

### Rationale
Onboarding harus menjadi initialization flow satu kali dan tidak boleh memiliki dua sumber logic yang dapat menghasilkan race condition atau state yang berbeda.

---

## 8. Dashboard Guard Cleanup

### Implemented
- Menghapus wrapper `DashboardFeatureGuard` yang memiliki click interceptor lama dan dapat memblokir Manajemen Tamu.
- Authorization API tetap server-side.
- Entitlement UI mengikuti gate yang benar.

### Rationale
UI blocker tidak boleh menggantikan authorization server-side dan tidak boleh mencegah feature yang sebenarnya entitled untuk package user.

---

## 9. No Mock Invitation Defaults

### Implemented
- Menghapus default schema `Rio`, `Lyvia`, dan `Gedung Pernikahan` dari model `Invitation`.
- Invitation baru menggunakan nilai kosong.
- Menambahkan migration PostgreSQL untuk default string kosong.

### Rationale
Tidak boleh ada fake/mock user data pada invitation baru. Data harus berasal dari onboarding/user/database.

---

## 10. Event Panel Couple Lock

### Implemented
- Nama pasangan pada Rangkaian Acara dibuat read-only untuk **WEDDING maupun ADAT_AKAD**.
- Field yang dapat diedit hanya data event: nama acara, tanggal, timezone, waktu, venue, alamat, Maps, deskripsi, dan catatan.

### Rationale
Nama pasangan adalah identity inti wedding dan harus konsisten pada seluruh invitation/event yang terhubung.

---

# 2026-09-12 — Canonical Public Invitation URL Architecture

## 11. Canonical Public Invitation URL — Event Name Path

### Final Architecture

**Main Wedding**

`https://[nama-pasangan].dcwedding.com/`

**Event Khusus**

`https://[nama-pasangan].dcwedding.com/[nama-event]`

### Implemented
- `[nama-pasangan]` berasal dari slug pasangan pada invitation WEDDING.
- `[nama-event]` berasal dari nama event database, saat ini `Invitation.title` pada record `ADAT_AKAD`.
- Nama event diubah menjadi URL-safe slug melalui helper `slugifyEvent()`.
- Tidak membuat field/input event name kedua hanya untuk URL.
- `proxy.ts` melakukan tenant routing berdasarkan subdomain.
- Event path diteruskan ke `/invite/[slug]/[eventSlug]`.
- Route event memvalidasi `eventSlug` terhadap nama event database sebelum menampilkan invitation.
- `/event-khusus` lama dipertahankan sebagai compatibility alias, bukan canonical public URL.
- `/invite/[slug]` tetap untuk internal routing/backward compatibility.

### Rationale
URL event harus terbaca oleh manusia dan merepresentasikan nama event yang memang sudah dimiliki database. Tidak boleh ada duplicate event-name field hanya demi routing.

### Commit History
- `46828c0` — support event-name public paths
- `663fc9c` — add event-name invitation route
- `3f775e1` — redirect legacy special event path
- `22e0dc9` — use event-name public invitation URLs

---

## 12. Dashboard Canonical URL Fix

### Implemented
- `InvitationManagementPanel` membentuk URL dari subdomain pasangan yang sebenarnya.
- Main Wedding menggunakan canonical subdomain URL.
- Event Khusus menggunakan slug nama event dari database.
- Jika nama event belum diatur, dashboard tidak membuat URL placeholder palsu.
- Dashboard menampilkan `Nama event belum diatur` ketika title/event name belum tersedia.
- Preview dan Salin Link menggunakan canonical URL yang sama.

### Commit
- `98d1eaf`

### Rationale
Dashboard tidak boleh menghasilkan link yang berbeda dari routing publik yang sebenarnya. URL yang ditampilkan, Preview, dan Salin Link harus menggunakan satu canonical URL architecture.

---

## 13. PRD / README Documentation Alignment

### Implemented
- `prd.md` diperbarui agar canonical event-name URL architecture menjadi bagian dari Master PRD.
- `README.md` diperbarui agar public invitation architecture sesuai dengan implementasi terbaru.
- `PRD-TAMBAHAN.md` direwrite untuk menyatukan implementation history tanpa menghilangkan keputusan sebelumnya.

### Commit
- `9b927f6` — PRD update
- `cdc1304` — PRD update
- `368e92e` — README public event URL architecture
- `248c41d` — PRD-TAMBAHAN rewrite for event URL architecture
- `a25726a` — latest PRD-TAMBAHAN rewrite with canonical event routing

---

# 2026-09-12 — PRD Gap Review & Implementation

## 14. Guest Management Entitlement Mismatch Fixed

### PRD Requirement
`prd.md` menetapkan **Manajemen Tamu & Interactive Seating** sebagai entitlement penuh untuk `DIGITAL_INVITATION`, dan `GUEST_BOOK` mewarisi akses tersebut.

### Gap Found
Runtime API masih menggunakan `hasPaidGuestbook()` pada beberapa endpoint sehingga Digital Invitation biasa tidak dapat:
- membuat tamu;
- mengambil daftar meja untuk placement;
- membuat/update/delete meja;
- export daftar tamu.

Ini bertentangan dengan entitlement source of truth di `lib/packages/access.ts`, yang sudah menetapkan `canUseGuestPlacement: hasDigitalInvitation`.

### Implemented
- `/api/guests` sekarang menggunakan `hasPaidDigitalInvitation()`.
- GET guests mengembalikan guest + tables untuk Digital Invitation.
- POST guest dapat digunakan oleh Digital Invitation.
- `/api/wedding-tables` menggunakan Digital Invitation untuk POST/PATCH/DELETE.
- `/api/guests/export` menggunakan Digital Invitation.
- `/api/tables` sudah aligned dengan Digital Invitation.

### Commit
- `e72f8f7` — guest management entitlement
- `a17a4b4` — wedding table entitlement
- `25282fe` — guest export entitlement

### Validation
- Code-level review completed against `prd.md` and `lib/packages/access.ts`.
- Build/CI: **Not verified**.

---

## 15. Canonical Undangan Digital Workspace Route

### PRD Requirement
Studio Back harus kembali ke workspace **Undangan Digital**, bukan Beranda. PRD mendefinisikan `/dashboard/undangan-digital` sebagai workspace tujuan.

### Gap Found
- Route `/dashboard/undangan-digital` belum tersedia.
- Studio Back sebelumnya menuju `/dashboard`.

### Implemented
- Menambahkan `/dashboard/undangan-digital`.
- Route menjadi workspace server-side yang membaca entitlement dari database.
- Workspace menampilkan `InvitationManagementPanel`.
- Studio Back dan breadcrumb sekarang kembali ke `/dashboard/undangan-digital`.

### Commit
- `f8ad75f` — digital invitation workspace route
- `94e665b` — Studio Back routing fix

### Validation
- Route and server-side entitlement implementation reviewed.
- Build/CI: **Not verified**.

---

## 16. Dashboard Sidebar Support Copy Cleanup

### User Clarification
PRD sebelumnya menyebut penghapusan floating support widget secara umum. User mengklarifikasi bahwa yang dimaksud pada dashboard sidebar adalah **tulisan bantuan kecil di bagian bawah kiri**:
- `Butuh bantuan?`
- `Chat WhatsApp di kanan bawah.`

User meminta copy tersebut dihapus karena tidak penting dan mengganggu sidebar.

### Implemented
- Menghapus blok support copy dari bagian bawah sidebar pada `app/[dashboard]/page.tsx`.
- Tidak mengubah fungsi workspace, navigasi, entitlement, atau data flow lainnya.
- Floating WhatsApp button di kanan bawah **tidak diubah pada perubahan ini**, karena scope yang diklarifikasi user adalah tulisan bantuan di bawah kiri.

### Rationale
Perubahan ini mengikuti klarifikasi user dan prinsip **Extend Over Replace**: hanya elemen UI yang diminta yang dihapus, tanpa mengganggu feature dashboard lain yang masih berjalan.

### Entitlement Impact
- Tidak ada perubahan entitlement atau authorization.

### Commit
- `5d771d1206dfee3b651c043da0182b369cf50dd5` — remove dashboard sidebar support copy

### Validation
- Code-level review dilakukan terhadap `app/[dashboard]/page.tsx` setelah perubahan.
- `Butuh bantuan?` dan `Chat WhatsApp di kanan bawah.` sudah dihapus dari sidebar.
- Build/CI: **Not verified**.

---

# Current Source-of-Truth Order

1. **AGENTS.md** — coding/design-system constraints.
2. **prd.md** — product requirements and product decisions.
3. **PRD-TAMBAHAN.md** — implementation history and validation record.
4. **README.md** — public technical overview and architecture.
5. **Database/schema/API implementation** — runtime source of truth for actual persisted product data.

# Current Non-Negotiable Product Rules

- Brand tetap **DC Wedding**. Jangan mengganti product name menjadi Citin.
- `/dashboard` dan menu **Beranda** tidak boleh dihapus.
- Database adalah single source of truth untuk data bersama.
- Jangan menggunakan fake/mock invitation data.
- Jangan membuat duplicate form untuk data inti yang sudah tersedia di database.
- Couple names harus konsisten antara WEDDING dan Event Khusus.
- Couple names pada Rangkaian Acara bersifat read-only.
- Authorization harus server-side.
- UI entitlement harus mencerminkan server entitlement.
- Jangan mengganti implementation yang masih bekerja tanpa instruksi.
- Legacy route dipertahankan selama masih dibutuhkan untuk backward compatibility dan tidak mengganggu canonical route.
- Event URL canonical menggunakan nama event sebagai path.
- Password protection harus berlaku konsisten untuk root invitation dan event path pada tenant yang sama.
- Asset custom tetap dibatasi sesuai entitlement dan limit package.
- Usher App/check-in onsite tetap merupakan feature Guest Book.

# Current Public URL Rules

| Resource | Canonical URL |
|---|---|
| Main Wedding | `https://[nama-pasangan].dcwedding.com/` |
| Event Khusus | `https://[nama-pasangan].dcwedding.com/[nama-event]` |
| Digital Invitation Workspace | `/dashboard/undangan-digital` |
| Studio | `/dashboard/editor` |
| Legacy special-event alias | `/event-khusus` — compatibility only |
| Legacy internal invitation route | `/invite/[slug]` — backward/internal routing |

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

# Validation / CI Status

### Latest Implementation Commits
- `e72f8f7` — guest management entitlement
- `a17a4b4` — wedding table entitlement
- `25282fe` — guest export entitlement
- `f8ad75f` — digital invitation workspace route
- `94e665b` — Studio Back routing fix
- `5d771d1` — dashboard sidebar support copy cleanup

### CI
- No verified build/check result is available for the latest implementation commits.
- Therefore build/CI is **Not verified**, not PASS.

### Rule
Jangan menulis "build berhasil" atau "CI PASS" sebelum terdapat hasil workflow/check yang benar-benar dapat diverifikasi.

# Known / Explicitly Untracked Items

- Fitur **Angpao/Kado** dan status pengiriman QR belum dianggap fully tracked karena schema saat ini belum memiliki field tracking yang diperlukan.
- UI harus menampilkan status yang jujur dan tidak boleh mengarang data tracking.
- Jangan menganggap feature fully complete hanya karena UI sudah tersedia jika database/API belum mendukung state tersebut.
- Interactive seating chart masih perlu audit lanjutan terhadap detail seat-level (`seatNumber`) karena schema `Guest` saat ini hanya menyimpan `tableId`.
- Dashboard utama masih memiliki legacy sidebar entries untuk **Galeri & Foto**, **Musik Undangan**, dan floating WhatsApp UI; PRD meminta item tersebut tidak berada di primary sidebar / viewport. Floating WhatsApp UI belum diubah pada scope klarifikasi terakhir user; perubahan terakhir hanya menghapus copy bantuan di bawah kiri sidebar.

# Working Protocol for Next Changes

Sebelum coding perubahan berikutnya:

1. Baca ulang `AGENTS.md`.
2. Baca ulang `prd.md`.
3. Baca ulang `PRD-TAMBAHAN.md`.
4. Baca ulang `README.md`.
5. Inspect implementation/API/schema yang relevan.
6. Extend existing implementation; jangan replace feature yang sudah bekerja tanpa instruksi.
7. Setelah perubahan, lakukan validation yang tersedia.
8. Catat perubahan di `PRD-TAMBAHAN.md` dengan rationale, entitlement impact, commit, dan validation status.
9. Jika PRD atau README perlu sinkronisasi, update dokumen tersebut juga.
10. Jangan mengklaim hasil build/CI yang belum diverifikasi.

Dokumen ini sengaja mempertahankan history implementasi sebelumnya agar keputusan dan alasan perubahan tidak hilang pada refactor berikutnya.
