# PRD Tambahan

## 2026-09-15 — Navbar Language & D-Invitation FAQ Buttons

- Navbar language selector (`ID` / `EN`) sekarang tanpa border kotak luar.
- Bahasa aktif tetap diberi visual active state agar pilihan locale terlihat jelas.
- `Button` canonical diperbaiki agar utility class eksplisit seperti `border-0` dapat meng-override default border tanpa mengubah visual default button lainnya.
- Tombol FAQ pada D-Invitation menggunakan `border-0` sehingga tidak memiliki border luar tambahan; border container FAQ dan kotak chat tetap tidak diubah.

## 2026-09-15 — D-Invitation Favorite Preview & Studio Protection

- Bagian Koleksi Favorit sekarang memakai label Pratinjau untuk aksi preview.
- Pratinjau template dibuka dalam mockup HP dengan frame, bezel, tombol samping, dan area undangan yang dapat di-scroll.
- Route Studio sekarang melakukan server-side authentication check dan mengarahkan pengguna yang belum login ke /login.
- Tampilan Studio client dipisahkan dari route server agar proteksi akses terjadi sebelum Studio dirender.

Affected files:
- components/D-Invitation/TemplateSection.tsx
- components/InvitationStudio/InvitationEditorPage.tsx
- app/dashboard/editor/page.tsx

Validation: belum diverifikasi dengan build/CI.

## 2026-09-15 — Workspace Sidebar Typography

- Font navigasi utama pada sidebar Workspace/Dashboard diperbesar dari `11px` menjadi `14px` agar label seperti Beranda, Rangkaian Acara, Undangan Digital, RSVP, dan Manajemen Tamu lebih mudah dibaca.
- Struktur sidebar, spacing, warna, ikon, dan behavior navigasi tidak diubah.

Affected files:
- app/[dashboard]/page.tsx

Commit:
- `7ec6a082f527eab6f74008cdabfd15b776db2d13`

Validation: belum diverifikasi dengan build/CI.

## 2026-09-15 — D-Invitation Single Package

- Bagian paket pada halaman D-Invitation sekarang hanya menampilkan **1 paket Undangan Digital**.
- Paket yang ditampilkan adalah `INVITATION_BASIC` dengan harga **Rp 300.000**.
- Kartu paket otomatis berada di tengah karena hanya ada satu pilihan.
- Copy section disesuaikan agar menegaskan satu paket lengkap, dalam Bahasa Indonesia dan English.

Affected files:
- app/d-invitation/page.tsx

Commit:
- `4471ce72b1493090c49f52d30faa1e0b1d2f7512`

Validation: belum diverifikasi dengan build/CI.
