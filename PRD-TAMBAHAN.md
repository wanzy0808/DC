# DC Wedding — PRD Implementation Addendum

Dokumen ini mencatat implementasi yang sudah dikerjakan di repository `wanzy0808/DC` tanpa mengubah PRD utama.

## 2026-09-12

### Invitation Password Protection
- Menambahkan field password protection pada `Invitation`.
- Menambahkan migration database.
- Menambahkan bcrypt password hashing dan signed access cookie.
- Menambahkan owner settings API untuk enable, disable, create, dan change password.
- Menambahkan public password verification endpoint.
- Menambahkan password gate pada public invitation dan special event invitation.
- Menambahkan sanitasi agar `passwordHash` tidak keluar melalui API.
- Menambahkan dashboard UI untuk pengaturan password invitation.
- Menambahkan `INVITATION_PASSWORD_SECRET` ke environment example.

### RSVP Analytics
- Menambahkan 6 metric RSVP pada dashboard.
- Menambahkan tabel analitik tamu RSVP.
- Menambahkan pencarian berdasarkan nama/nomor telepon.
- Menambahkan sorting nama/status, pax, dan check-in.
- Menambahkan export CSV.
- Menghubungkan panel analytics ke tab RSVP dashboard.

### RSVP Guest Actions
- Menambahkan endpoint server-side owner-authorized manual check-in.
- Menggunakan atomic update untuk mencegah duplicate check-in.
- Menghubungkan tombol QR pada tabel RSVP dengan endpoint QR tamu yang sudah ada.
- Menambahkan modal QR guest ticket pada dashboard RSVP.
- Menghubungkan tombol Check In Manual ke endpoint baru.
- Metric check-in membaca status aktual dari data Guest.

### RSVP QR Entitlement Fix
- QR guest ticket pada dashboard RSVP sekarang dapat dibuat untuk pengguna dengan paket Digital Invitation maupun Guest Book.
- Endpoint tetap memvalidasi kepemilikan guest terhadap invitation milik user.
- Token QR tetap menggunakan signed opaque guest identifier dari helper QR existing.
- Check-in manual dan Usher App tetap berada di entitlement Guest Book sesuai PRD.

### Guest Management Entitlement Correction
- Memastikan Manajemen Tamu menggunakan entitlement **Digital Invitation**, bukan Guest Book.
- Edit dan hapus tamu pada `/api/guests/manage` sekarang tersedia untuk pengguna dengan paket Digital Invitation.
- Pengguna Guest Book tetap mewarisi akses tersebut karena Guest Book mencakup Digital Invitation.
- Dashboard `Manajemen Tamu` menggunakan gate `hasDigitalInvitation`, bukan `hasGuestbook`.
- Label dan deskripsi UI menegaskan bahwa manajemen tamu, nomor meja, dan seat assignment termasuk Digital Invitation.
- Usher App dan operasional check-in tetap khusus entitlement Guest Book.

### Guest Management UI Gate
- Menghapus blocking popup pada halaman **Manajemen Tamu**, sehingga workspace tamu dapat dibuka tanpa tertahan modal upgrade.
- Proteksi entitlement tetap berada di server/API untuk operasi yang mengubah data tamu.
- **Usher App tetap menggunakan FeatureGate dan tetap dibatasi entitlement Guest Book.**

### Dashboard Invitation Feature Restoration
- Mengembalikan menu **Galeri & Foto** dan **Musik Undangan** yang sempat hilang dari sidebar dashboard setelah refactor workspace.
- Kedua menu kembali menggunakan entitlement **Digital Invitation**.
- Memulihkan panel **Undangan Digital** agar tidak hanya menampilkan tombol preview, tetapi kembali menyediakan workspace untuk Undangan Pernikahan dan Undangan Event Khusus.
- Menambahkan akses **Edit Desain**, **Preview**, **Kelola Asset**, dan **Pengaturan** dari workspace Undangan Digital.
- Menampilkan status draft/published dan ringkasan entitlement edit template, publish, serta custom asset.
- Tidak menghapus atau mengganti route Beranda.
- Tidak mengubah API entitlement; perubahan ini berfokus pada pemulihan fitur UI dashboard yang sebelumnya terpotong saat refactor.

### Complete Digital Invitation Management
- Memindahkan pengelolaan Undangan Digital ke komponen khusus `InvitationManagementPanel` agar halaman dashboard utama tidak terus menambah logic invitation.
- Dashboard sekarang memuat dua invitation independen dari `/api/invitations`: `WEDDING` dan `ADAT_AKAD`.
- Masing-masing invitation memiliki preview, salin link, Edit Desain, dan Publish/Unpublish sendiri.
- Publish/Unpublish tetap menggunakan authorization server-side pada `/api/invitations` dan hanya aktif untuk entitlement Digital Invitation.
- Menambahkan kembali kontrol Password Protection pada workspace Undangan Digital menggunakan endpoint password existing.
- Studio tetap terbuka untuk pengguna tanpa paket; publish tetap terkunci sebelum Digital Invitation aktif.
- Link event khusus menggunakan pola `/invite/[slug]/event-khusus` yang sudah tersedia pada public invitation route.

### CI / Build
- GitHub Actions menggunakan Node.js 22 untuk kompatibilitas pnpm 11.
- Build validation terbaru berhasil setelah perbaikan TypeScript.
- Commit terbaru pada perubahan Digital Invitation masih menunggu workflow validation dari GitHub Actions sebelum dinyatakan build-verified.

## Implementation Notes

- `prd.md` tetap menjadi product source of truth.
- `README.md` menjadi pedoman technology stack.
- `AGENTS.md` menjadi pedoman coding dan design system.
- `PRD-TAMBAHAN.md` mencatat perubahan implementasi dari sesi pengerjaan.
- Fitur Angpao/Kado dan status pengiriman QR belum dianggap benar-benar tracked karena schema saat ini belum memiliki field tracking tersebut; UI menampilkan status yang jujur (`—` / `Not tracked`) daripada mengarang data.
- Brand tetap **DC Wedding**. Tidak diganti menjadi Citin.
- Menu dan route **Beranda** tetap dipertahankan.
