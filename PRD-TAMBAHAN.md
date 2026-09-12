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
- Menambahkan sorting nama, status, pax, dan check-in.
- Menambahkan export CSV.
- Menghubungkan panel analytics ke tab RSVP dashboard.

### RSVP Guest Actions
- Menambahkan endpoint server-side owner-authorized manual check-in.
- Menggunakan atomic update untuk mencegah duplicate check-in.
- Menghubungkan tombol QR pada tabel RSVP dengan endpoint QR tamu yang sudah ada.
- Menambahkan modal QR guest ticket pada dashboard RSVP.
- Menghubungkan tombol Check In Manual ke endpoint baru.
- Metric check-in membaca status aktual dari data Guest.

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
