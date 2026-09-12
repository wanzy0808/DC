# DC Wedding — PRD Implementation Addendum

Dokumen ini adalah changelog implementasi repository `wanzy0808/DC`. `prd.md` tetap menjadi product source of truth; dokumen ini mencatat keputusan teknis dan perubahan yang sudah benar-benar masuk ke codebase.

## 2026-09-12

### 1. Invitation Password Protection
- Menambahkan password protection pada `Invitation`.
- Password disimpan sebagai bcrypt hash dan `passwordHash` tidak pernah dikirim ke client.
- Public access menggunakan signed access cookie.
- Dashboard menyediakan pengaturan aktif, ganti password, dan Matikan.

### 2. RSVP Analytics & Guest Actions
- Menambahkan metric RSVP, pencarian, sorting, CSV export, QR guest ticket, dan manual check-in.
- Check-in menggunakan update atomik untuk mencegah duplicate check-in.
- Angpao/Kado tetap ditampilkan secara jujur sebagai belum tersedia karena schema belum memiliki tracking field tersebut.

### 3. Guest Management Entitlement
- Manajemen Tamu mengikuti entitlement Digital Invitation.
- Edit/hapus tamu, session, table, dan seat assignment tetap tersedia sesuai package.
- Blocking popup lama yang menghalangi workspace Manajemen Tamu dihapus.
- Usher App tetap menggunakan entitlement Guest Book.

### 4. Dashboard Invitation Workspace
- Mengembalikan workspace Undangan Digital, Galeri & Foto, dan Musik Undangan.
- Dashboard mengelola WEDDING dan ADAT_AKAD dengan Preview, Salin Link, Edit Desain, Publish/Unpublish, asset, dan password protection.
- Menu dan route **Beranda** tidak dihapus atau diganti.

### 5. Onboarding & Single Source of Truth
- Onboarding meminta Groom Name, Bride Name, dan Dashboard Nickname hanya saat data wajib belum ada.
- Nama pasangan disimpan pada WEDDING invitation; nickname disimpan pada `User.firstName`.
- Setelah tersimpan, onboarding tidak muncul lagi pada login berikutnya.
- Implementasi onboarding duplikat pada `DashboardGate` dihapus.
- Dashboard greeting membaca `User.firstName` dari database, bukan cookie/localStorage.
- Rangkaian Acara menggunakan data pasangan dari onboarding secara read-only.
- Studio membaca data event dari database yang sama dan tidak meminta ulang data inti.

### 6. Event Data Reuse / No Duplicate Input
- `EventPanel` menjadi editor utama data event: nama acara, tanggal, timezone, waktu, venue, alamat, Maps, deskripsi, dan catatan.
- Nama pasangan WEDDING dan ADAT_AKAD dikunci sebagai data onboarding.
- ADAT_AKAD menggunakan identitas pasangan yang sama dengan WEDDING bila draft belum memiliki nilai sendiri.
- Field invitation-specific seperti hashtag dan dress code tetap dikelola di Studio.

### 7. No Mock Invitation Data
- Menghapus default mock `Rio`, `Lyvia`, dan `Gedung Pernikahan` dari schema.
- Invitation baru memakai nilai kosong untuk nama pasangan dan venue.
- Menambahkan migration untuk default PostgreSQL yang baru.
- Studio juga tidak lagi melakukan first-render dengan data contoh.

### 8. Invitation Studio Data Audit
- Initial Studio form sekarang kosong dan diisi dari database.
- `address` dan `mapUrl` ikut dibaca dari Invitation.
- Preview aman ketika tanggal belum tersedia.
- Undo/Redo memulihkan template, palette, font, dan dekorasi.
- Font preview memakai contoh generik, bukan nama pasangan palsu.
- Asset quota diperjelas menjadi **maksimal 30 foto + 1 musik custom**, bukan satu kuota gabungan.
- Preview menampilkan alamat dan link Maps bila tersedia.

### 9. Public Invitation Subdomain — Canonical URL
Keputusan terbaru: URL publik DC Wedding menggunakan subdomain pasangan + nama event.

- Undangan utama:
  `https://[nama-pasangan].dcwedding.com`
- Event khusus:
  `https://[nama-pasangan].dcwedding.com/[nama-event]`
- Contoh:
  `Akad & Sangjit` → `https://rio-lyvia.dcwedding.com/akad-sangjit`
- Nama event berasal dari data database, saat ini menggunakan `Invitation.title` pada record `ADAT_AKAD`.
- Helper `slugifyEvent()` digunakan agar nama event menjadi path URL yang aman dan konsisten.
- `proxy.ts` melakukan tenant routing berdasarkan subdomain dan me-rewrite path event ke route internal.
- Route internal baru menangani `/invite/[slug]/[eventSlug]`.
- Password protection tetap menggunakan password milik invitation utama sehingga root invitation dan event pada subdomain yang sama memakai satu access gate.
- Event lama `/event-khusus` dipertahankan sebagai compatibility alias dan diarahkan ke `/{nama-event}`.
- Legacy `/invite/[slug]` tetap dipertahankan untuk internal routing/backward compatibility, bukan URL publik canonical.
- Tidak ada route publik baru bernama `invite2`.

### 10. Dashboard Public Link Synchronization
- `InvitationManagementPanel` tidak lagi membuat URL Event Khusus dengan `/event-khusus`.
- Card Event Khusus sekarang membentuk URL berdasarkan `slugifyEvent(ADAT_AKAD.title)` pada subdomain WEDDING.
- Preview dan Salin Link menggunakan URL canonical yang sama.
- Edit Desain tetap deep-link ke Studio dengan `?type=ADAT_AKAD`.

### 11. Duplicate Dashboard Guard Cleanup
- Wrapper `DashboardFeatureGuard` lama yang memiliki click interceptor dihapus dari `/dashboard`.
- Authorization API tetap server-side dan entitlement dashboard mengikuti package access layer.

### 12. Invitation Studio Type Deep Link
- Studio membaca `?type=ADAT_AKAD` untuk Event Khusus.
- Tanpa query, Studio membuka WEDDING.
- Edit Desain pada masing-masing card mengarah ke type yang sesuai.

### 13. Custom Asset Entitlement
- Upload custom asset divalidasi server-side berdasarkan Digital Invitation entitlement.
- Maksimal 30 foto per invitation, dengan optimasi WebP.
- Maksimal 1 track musik custom per invitation.

## Implementation Rules Going Forward
- **Database first:** data bersama tidak boleh dibuat ulang di browser, cookie, localStorage, atau form kedua.
- **Extend over replace:** audit route/API/schema existing sebelum menambah implementasi.
- **Brand:** tetap **DC Wedding**, bukan Citin.
- **Navigation:** **Beranda** dan `/dashboard` wajib dipertahankan.
- **Typography:** Cinzel, Fauna One, dan DM Mono sesuai `AGENTS.md`.
- **Routing:** canonical public event URL sekarang `https://[nama-pasangan].dcwedding.com/[nama-event]`.
- **Compatibility:** legacy route boleh dipertahankan sebagai redirect/internal target, tetapi tidak boleh dianggap sebagai canonical public URL.
