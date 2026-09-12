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

### CI / Build
- GitHub Actions menggunakan Node.js 22 untuk kompatibilitas pnpm 11.
- Build validation terbaru berhasil setelah perbaikan TypeScript.

## Implementation Notes

- `prd.md` tetap menjadi product source of truth.
- `README.md` menjadi pedoman technology stack.
- `AGENTS.md` menjadi pedoman coding dan design system.
- Fitur Angpao/Kado dan status pengiriman QR belum dianggap benar-benar tracked karena schema saat ini belum memiliki field tracking tersebut; UI menampilkan status yang jujur (`—` / `Not tracked`) daripada mengarang data.
- Brand tetap **DC Wedding**. Tidak diganti menjadi Citin.
- Menu dan route **Beranda** tetap dipertahankan.
